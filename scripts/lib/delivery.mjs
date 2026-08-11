// GENERATION_DELIVERY_PIPELINE Phase 1 — the generation-complete digest.
//
// Delivery is a detached consumer of promotion, never a step inside it: this
// module is called AFTER compile-theme.mjs's atomic rename-based promotion
// has already succeeded. A failure in here must never roll back or block a
// promoted design — every export below is wrapped by its caller so a thrown
// error only fails the email, not the generation.
import { readFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parseDocument } from '@ssss/cli/frontmatter';
import { listEvidenceForSlug } from './evidence-store.mjs';
import { enrichmentRow } from './email-rows.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

async function readDesignDoc(slug) {
  const p = join(repoRoot, 'designs', slug, 'DESIGN.md');
  try {
    const raw = await readFile(p, 'utf8');
    return { path: p, raw, ...parseDocument(raw) };
  } catch {
    return null;
  }
}

/** The evidence doc for the pass that actually shipped: prefer the highest
 * pass with outcome "approved" (what the reviewer actually promoted on);
 * fall back to the highest pass overall if none is marked approved (e.g. a
 * pass-cap promotion — see compile-theme.mjs decideAtCap()). */
function pickFinalPass(evidenceDocs) {
  if (!evidenceDocs.length) return null;
  const approved = evidenceDocs.filter((d) => d.outcome === 'approved');
  const pool = approved.length ? approved : evidenceDocs;
  return pool.reduce((best, d) => (!best || Number(d.pass) > Number(best.pass) ? d : best), null);
}

function findAsset(finalPass, viewportSubstring) {
  const assets = Array.isArray(finalPass?.assets) ? finalPass.assets : [];
  return assets.find((a) => a.asset_kind === 'render_audit_screenshot' && String(a.viewport || '').includes(viewportSubstring));
}

async function downscaleForEmail(relPath, maxWidth = 640) {
  const absPath = join(repoRoot, relPath);
  const buf = await readFile(absPath);
  return sharp(buf).resize({ width: maxWidth, withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer();
}

/**
 * Assemble everything the digest needs: DESIGN.md, the final pass's
 * desktop + mobile screenshots (downscaled), and metadata. Returns null if
 * there is nothing to send yet (e.g. evidence hasn't landed for this slug),
 * so the caller can log and skip rather than send an empty email.
 */
export async function assembleDigest({ slug, runId, prompt }) {
  const [designDoc, evidenceDocs] = await Promise.all([
    readDesignDoc(slug),
    listEvidenceForSlug(slug),
  ]);
  const scoped = runId ? evidenceDocs.filter((d) => d.run_id === runId) : evidenceDocs;
  const finalPass = pickFinalPass(scoped.length ? scoped : evidenceDocs);

  const desktopShot = findAsset(finalPass, 'home desktop');
  const mobileShot = findAsset(finalPass, 'home mobile');
  const attachments = [];
  if (desktopShot) {
    attachments.push({
      filename: 'home-desktop.jpg',
      content: await downscaleForEmail(desktopShot.path),
      cid: 'digest-desktop',
    });
  }
  if (mobileShot) {
    attachments.push({
      filename: 'home-mobile.jpg',
      content: await downscaleForEmail(mobileShot.path, 320),
      cid: 'digest-mobile',
    });
  }
  if (designDoc) {
    attachments.push({
      filename: `${slug}-DESIGN.md`,
      content: Buffer.from(designDoc.raw, 'utf8'),
      contentType: 'text/markdown',
    });
  }

  return {
    slug,
    runId: runId || finalPass?.run_id || null,
    prompt: prompt || '',
    name: designDoc?.data?.name || slug,
    accent: designDoc?.data?.accent || null,
    style: designDoc?.data?.style || '',
    archetype: designDoc?.data?.archetype || 'default-editorial',
    finalPass,
    hasEvidence: !!finalPass,
    attachments,
  };
}

export function renderDigestHtml(digest, { siteUrl, libraryUrl }) {
  const liveUrl = `${siteUrl}/designs/${digest.slug}/index.html`;
  const row = enrichmentRow;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2a2a;">
      ${row('Name', `<strong>${digest.name}</strong>`)}
      ${digest.accent ? row('Accent', digest.accent, true) : ''}
      ${row('Archetype', digest.archetype)}
      ${digest.prompt ? row('Prompt', digest.prompt) : ''}
      ${digest.runId ? row('Run', digest.runId, true) : ''}
    </table>
    ${digest.hasEvidence ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr><td style="padding:8px 0;"><img src="cid:digest-desktop" alt="Desktop preview" style="width:100%;max-width:600px;display:block;border:1px solid #2a2a2a;"></td></tr>
      <tr><td style="padding:8px 0;"><img src="cid:digest-mobile" alt="Mobile preview" style="width:200px;display:block;border:1px solid #2a2a2a;"></td></tr>
    </table>` : `<p style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#e22b22;margin-top:16px;">No render-audit evidence found for this run — screenshots unavailable.</p>`}
    <div style="margin-top:28px;">
      <a href="${liveUrl}" style="display:inline-block;background:#f5f5f3;color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 20px;margin-right:12px;">View live →</a>
      ${libraryUrl ? `<a href="${libraryUrl}" style="display:inline-block;color:#c9c9c7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;text-decoration:underline;padding:14px 0;">Library entry</a>` : ''}
    </div>`;
}
