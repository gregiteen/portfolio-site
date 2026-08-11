// GENERATIVE_DESIGN_STUDIO Phase 0 — one-off backfill for the 9 slugs
// rescued into evidence-library/rescued-2026-07-30/ before design_evidence
// existed. Each rescued screenshot predates per-pass tagging, so run_id and
// pass are tagged 'rescued-2026-07-30' / 'unknown' rather than invented.
import { createEngine } from '@ssss/cli/engine';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');
const rescuedDir = join(repoRoot, 'evidence-library', 'rescued-2026-07-30');
const engine = createEngine({ registryDir });

function yamlScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(String(value));
}

function serializeDocument(fm, body) {
  const lines = ['---', ...Object.entries(fm).map(([k, v]) => `${k}: ${yamlScalar(v)}`), '---', ''];
  return `${lines.join('\n')}${body}\n`;
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

const files = (await readdir(rescuedDir)).filter((f) => f.endsWith('.jpeg'));
const bySlug = new Map();
for (const file of files) {
  const m = file.match(/^render-audit-(.+)-(\d+)-([a-z]+)\.jpeg$/);
  if (!m) { console.warn('unmatched filename, skipping:', file); continue; }
  const [, slug, index, label] = m;
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push({ index: Number(index), label, file });
}

const created = '2026-07-30T00:00:00.000Z';
let written = 0;
for (const [slug, shots] of bySlug) {
  shots.sort((a, b) => a.index - b.index);
  const assets = shots.map((s) => ({
    asset_kind: 'render_audit_screenshot',
    viewport: s.label,
    path: `evidence-library/rescued-2026-07-30/${s.file}`,
  }));
  const fm = {
    type: 'design_evidence',
    title: `Evidence: ${slug} rescued 2026-07-30`,
    description: `Backfilled render-audit evidence for ${slug}, rescued from /tmp before design_evidence existed.`,
    timestamp: created,
    slug,
    run_id: 'rescued-2026-07-30',
    pass: 'unknown',
    outcome: 'unknown',
    created,
    archetype: null,
    score: null,
    approved: false,
    blocking_count: 0,
  };
  const body = [
    '# Design Evidence (backfilled)',
    '',
    '## Assets',
    '```json',
    JSON.stringify(assets, null, 2),
    '```',
    '',
    '## Verdict',
    '```json',
    JSON.stringify({ note: 'backfilled — no original verdict survived the /tmp purge' }, null, 2),
    '```',
    '',
  ].join('\n');
  const rel = `runtime/evidence/${slug}/rescued-2026-07-30-unknown.md`;
  await writeVaultDocument(rel, serializeDocument(fm, body));
  console.log('wrote', rel, `(${assets.length} assets)`);
  written++;
}
console.log(`\nBackfilled ${written} slugs.`);
