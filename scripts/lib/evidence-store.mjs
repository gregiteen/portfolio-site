// Durable record of what the review board saw on each generation pass —
// GENERATIVE_DESIGN_STUDIO Phase 0. Screenshots used to land in os.tmpdir(),
// get overwritten by the next pass, and get purged by the OS at 10 days —
// so a fail-closed rejection left no trail to postmortem. This module fixes
// that: binary assets go to evidence-library/ on disk (mirroring the
// 2026-07-30 rescue layout), and one design_evidence SSSS document per pass
// records the metadata + file paths through the Operation Contract.
import { createEngine } from '@ssss/cli/engine';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');
const libraryRoot = join(repoRoot, 'evidence-library');

const engine = createEngine({ registryDir });

function safeSlug(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function nowIso() {
  return new Date().toISOString();
}

function yamlScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(String(value));
}

function yamlLines(key, value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (value == null || typeof value !== 'object') return [`${pad}${key}: ${yamlScalar(value)}`];
  if (Array.isArray(value)) {
    if (!value.length) return [`${pad}${key}: []`];
    return [`${pad}${key}:`, ...value.flatMap((item) => (
      item != null && typeof item === 'object'
        ? [`${pad}  -`, ...Object.entries(item).flatMap(([k, v]) => yamlLines(k, v, indent + 4))]
        : [`${pad}  - ${yamlScalar(item)}`]
    ))];
  }
  const entries = Object.entries(value);
  if (!entries.length) return [`${pad}${key}: {}`];
  return [`${pad}${key}:`, ...entries.flatMap(([k, v]) => yamlLines(k, v, indent + 2))];
}

function serializeDocument(frontmatter, body = '') {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) lines.push(...yamlLines(key, value));
  lines.push('---', '');
  return `${lines.join('\n')}${body ? `${body.replace(/^\n+/, '')}\n` : ''}`;
}

async function writeVaultDocument(relPath, content) {
  const result = engine.processOperation({
    type: 'operation',
    idempotency_key: createHash('sha256').update(relPath + '\n' + content).digest('hex'),
    workspace_id: 'portfolio-evidence',
    path: relPath,
    content,
    actor: { role: 'system' },
  }, vaultRoot);
  if (!result.success) {
    const errors = result.validation?.errors || result.repair?.field_errors?.map((e) => e.issue) || ['unknown error'];
    throw new Error(`SSSS write failed for ${relPath}: ${errors.join('; ')}`);
  }
}

/**
 * Persist one render-audit pass: the screenshots it judged, the verdict it
 * produced, and (optionally) the freshly generated imagery for that pass.
 * Binary bytes go to disk under evidence-library/<slug>/<runId>/; the
 * design_evidence doc records only metadata + relative paths, so the vault
 * stays text-only and cheap to diff.
 *
 * @param {object} params
 * @param {string} params.slug
 * @param {string} params.runId
 * @param {number} params.pass
 * @param {'promoted'|'rejected'|'superseded'|'unknown'} params.outcome
 * @param {object} params.verdict - sanitized render-audit verdict (no screenshots field)
 * @param {Array<{label:string, buf:Buffer, mimeType?:string}>} [params.shots]
 * @param {Array<{kind:string, path:string}>} [params.generatedAssets] - absolute paths to hero/portrait/logo/favicon/brandkit files already on disk for this pass
 */
export async function recordEvidence({ slug, runId, pass, outcome = 'unknown', verdict = {}, shots = [], generatedAssets = [] }) {
  const safeSlugValue = safeSlug(slug);
  const safeRunId = safeSlug(runId);
  const runDir = join(libraryRoot, safeSlugValue, safeRunId);
  await mkdir(runDir, { recursive: true });

  const assets = [];
  for (const [i, shot] of shots.entries()) {
    const ext = (shot.mimeType || 'image/jpeg').includes('png') ? 'png' : 'jpeg';
    const filename = `pass-${pass}-${i}-${safeSlug(shot.label)}.${ext}`;
    await writeFile(join(runDir, filename), shot.buf);
    assets.push({
      asset_kind: 'render_audit_screenshot',
      viewport: shot.label,
      path: relative(repoRoot, join(runDir, filename)),
    });
  }
  for (const generated of generatedAssets) {
    // Copy bytes into the run's evidence dir rather than referencing the
    // source path directly — hero.jpg/logo.png etc. are overwritten in place
    // on every repair pass, so a reference alone would silently point future
    // reads at a LATER pass's bytes than the one this doc actually recorded.
    const ext = generated.path.split('.').pop() || 'bin';
    const filename = `pass-${pass}-${safeSlug(generated.kind)}.${ext}`;
    const dest = join(runDir, filename);
    try {
      await copyFile(generated.path, dest);
      assets.push({
        asset_kind: generated.kind,
        viewport: null,
        path: relative(repoRoot, dest),
      });
    } catch {
      // Source file missing (e.g. an asset that fell back and was never
      // written) — skip rather than record a dangling path.
    }
  }

  const created = nowIso();
  const rel = `runtime/evidence/${safeSlugValue}/${safeRunId}-${pass}.md`;
  // @ssss/cli's frontmatter parser is deliberately a dependency-free subset
  // (top-level scalars, inline [a,b] arrays, block string-item arrays — see
  // node_modules/@ssss/cli/src/frontmatter.mjs) — it cannot round-trip a
  // block array of objects like `assets`. That structured data goes in the
  // body as a JSON block instead, the same pattern runtime-store.mjs already
  // uses for visitor/proposal enrichment. Frontmatter stays flat scalars
  // only, so the registry's required-field check and every reader agree on
  // what's actually there.
  const fm = {
    type: 'design_evidence',
    title: `Evidence: ${safeSlugValue} run ${safeRunId} pass ${pass}`,
    description: `Render-audit evidence for ${safeSlugValue}, pass ${pass} of run ${safeRunId}.`,
    timestamp: created,
    slug: safeSlugValue,
    run_id: safeRunId,
    pass: Number(pass),
    outcome,
    created,
    archetype: verdict.archetype || null,
    score: typeof verdict.score === 'number' ? verdict.score : null,
    approved: !!verdict.approved,
    blocking_count: Array.isArray(verdict.blocking) ? verdict.blocking.length : (Array.isArray(verdict.issues) ? verdict.issues.filter((i) => (i?.severity || 'blocking') === 'blocking').length : 0),
  };
  const body = [
    '# Design Evidence',
    '',
    '## Assets',
    '```json',
    JSON.stringify(assets, null, 2),
    '```',
    '',
    '## Verdict',
    '```json',
    JSON.stringify({ approved: verdict.approved, score: verdict.score, issues: verdict.issues || [], resolved_since_last_pass: verdict.resolved_since_last_pass || [] }, null, 2),
    '```',
    '',
  ].join('\n');
  await writeVaultDocument(rel, serializeDocument(fm, body));
  return { path: rel, assets };
}

function extractJsonBlock(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^## ${escaped}\\s*\\n\\s*\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``, 'm');
  const match = body.match(re);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * All design_evidence docs for a slug, oldest first — the per-site
 * progression view the tagged library exposes.
 */
export async function listEvidenceForSlug(slug) {
  const { readdir, readFile } = await import('node:fs/promises');
  const { parseDocument } = await import('@ssss/cli/frontmatter');
  const dir = join(vaultRoot, 'runtime', 'evidence', safeSlug(slug));
  const out = [];
  try {
    const files = await readdir(dir);
    for (const file of files.filter((f) => f.endsWith('.md'))) {
      try {
        const { data, body } = parseDocument(await readFile(join(dir, file), 'utf8'));
        if (data?.type === 'design_evidence') {
          out.push({
            ...data,
            assets: extractJsonBlock(body, 'Assets') || [],
            verdict: extractJsonBlock(body, 'Verdict') || null,
          });
        }
      } catch { /* unreadable evidence doc — skip */ }
    }
  } catch { /* no evidence yet for this slug */ }
  return out.sort((a, b) => String(a.created).localeCompare(String(b.created)));
}

export async function listEvidenceSlugs() {
  const { readdir } = await import('node:fs/promises');
  try {
    return (await readdir(join(vaultRoot, 'runtime', 'evidence'), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}
