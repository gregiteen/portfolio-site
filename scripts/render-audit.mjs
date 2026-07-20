#!/usr/bin/env node
// Rendered visual release gate for AI-generated theme skins.
//
// The source-level release reviewer in compile-theme.mjs reads CSS + layout
// fragments and cannot see what a browser actually paints: overlapping nav
// links, metadata overprinting titles, horizontal viewport overflow — all of
// which shipped live before this gate existed. This module screenshots the
// REAL built pages (desktop + mobile, full page) with headless Chromium and
// has the vision model inspect the pixels.
//
// Requirements on the host that runs generation:
//   npm install playwright && npx playwright install --with-deps chromium
//
// The page is loaded over HTTP from the local server (default
// http://127.0.0.1:4173, override with RENDER_AUDIT_BASE_URL) because built
// design pages use absolute /designs/... asset paths that file:// cannot
// resolve.
//
// Usage (standalone): node scripts/render-audit.mjs <slug>
//   Prints the audit verdict as JSON; exits 1 if not approved.

import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { LAYOUT_SPECS, extractJson } from './lib/theme.mjs';
import {
  CLAUDE_VISION_MODEL,
  callOpenRouter,
} from './lib/openrouter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BASE_URL = process.env.RENDER_AUDIT_BASE_URL || 'http://127.0.0.1:4173';

const RENDER_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    approved: { type: 'BOOLEAN' },
    score: { type: 'INTEGER' },
    prompt_fidelity: { type: 'INTEGER' },
    distinctiveness: { type: 'INTEGER' },
    cohesion: { type: 'INTEGER' },
    issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          target: { type: 'STRING' },
          issue: { type: 'STRING' },
          severity: { type: 'STRING', enum: ['blocking', 'minor'] },
          evidence: { type: 'STRING' },
        },
        required: ['target', 'issue', 'severity', 'evidence'],
      },
    },
    resolved_since_last_pass: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['approved', 'score', 'prompt_fidelity', 'distinctiveness', 'cohesion', 'issues', 'resolved_since_last_pass'],
};

// Subjects the reviewer must never block on: fixed site facts, not defects of
// the design under review. The prompt says so; this regex backstop enforces it
// mechanically because the 21-pass incident proved prompt-only contracts leak.
const OUT_OF_SCOPE_BLOCKING = [
  // "only two cards", "only shows two design cards", "displays only 2 projects"
  /only\s+(?:\w+\s+){0,2}(?:one|two|three|\d+)\s+(?:\w+\s+)?(?:cards?|designs?|projects?|items?)/i,
  /(?:number|count|amount)\s+of\s+(?:cards?|designs?|projects?)/i,
  /(?:few|too few|sparse|not enough)\s+(?:\w+\s+)?(?:cards?|designs?|projects?|items?)/i,
  /prev\s*design|next\s*design|design.switcher|start\s*a\s*project/i,
  /cna\s*banner|consent\s*banner|cookie\s*banner/i,
];

const FILLER_ISSUE = /^\s*(?:placeholder|todo|n\/?a|none|tbd)[\s.!]*$/i;

/**
 * Mechanically enforce the review contract on a raw model verdict:
 * - drop filler/empty issues outright;
 * - demote blocking issues whose evidence names no known screenshot;
 * - demote blocking issues about out-of-scope subjects (content volume,
 *   injected site chrome).
 * Pure and exported for unit tests. Demotions annotate the issue text so the
 * repair prompt and logs show why severity changed.
 */
export function sanitizeAuditVerdict(audit, { screenshotLabels = [] } = {}) {
  const pageWords = new Set(screenshotLabels
    .map((label) => String(label).split(/\s+/)[0].toLowerCase())
    .filter(Boolean));
  const issues = [];
  for (const raw of Array.isArray(audit?.issues) ? audit.issues : []) {
    const text = typeof raw?.issue === 'string' ? raw.issue.trim() : '';
    if (!text || text.length < 12 || FILLER_ISSUE.test(text)) continue;
    const issue = { ...raw, issue: text };
    if (issue.severity !== 'minor') {
      const evidence = typeof issue.evidence === 'string' ? issue.evidence.toLowerCase() : '';
      const evidenced = [...pageWords].some((word) => evidence.includes(word));
      if (pageWords.size && !evidenced) {
        issue.severity = 'minor';
        issue.issue = `${text} [demoted: no screenshot evidence was cited]`;
      } else if (OUT_OF_SCOPE_BLOCKING.some((pattern) => pattern.test(text))) {
        issue.severity = 'minor';
        issue.issue = `${text} [demoted: out-of-scope subject — content volume and injected site chrome cannot block]`;
      }
    }
    issues.push(issue);
  }
  return {
    ...audit,
    issues,
    resolved_since_last_pass: Array.isArray(audit?.resolved_since_last_pass)
      ? audit.resolved_since_last_pass
      : [],
  };
}

async function openRouterVision(parts) {
  const content = parts.map((part) => {
    if (typeof part?.text === 'string') return { type: 'text', text: part.text };
    if (part?.inlineData?.data) {
      return {
        type: 'image_url',
        image_url: { url: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}` },
      };
    }
    throw new Error('Unsupported render-audit content part');
  });
  return callOpenRouter({
    model: process.env.OPENROUTER_VISION_MODEL || CLAUDE_VISION_MODEL,
    content,
    schema: RENDER_AUDIT_SCHEMA,
    maxTokens: 16384,
    reasoningEffort: 'high',
  });
}

async function screenshotPage(browser, url, viewport) {
  // Reduced motion: the injected scroll-reveal runtime hides below-fold
  // sections until they intersect, which a fullPage screenshot never triggers
  // — without this, healthy pages read as "enormous dead zones" and get
  // rejected. The motion CSS keeps everything painted under reduced motion.
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
    if (!resp || !resp.ok()) throw new Error(`page load failed (${resp ? resp.status() : 'no response'}) for ${url}`);
    // 'load' not 'networkidle': built pages poll /dev-status forever on
    // loopback, so networkidle never settles. Give fonts/animations a beat.
    await page.waitForTimeout(1500);
    return await page.screenshot({ fullPage: true, type: 'jpeg', quality: 70 });
  } finally {
    await page.close();
  }
}

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

async function startStaticReviewServer(siteRoot) {
  const root = resolve(siteRoot);
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
      let filePath = resolve(root, `.${decodeURIComponent(requestUrl.pathname)}`);
      if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, 'index.html');
      const body = await readFile(filePath);
      res.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': CONTENT_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
  };
}

/**
 * Screenshot the built pages of a design at desktop + mobile widths and have
 * the vision model audit the actual rendering. Returns
 * { approved: boolean, issues: [{ target, issue }] } where each target is
 * "css" or a layout key — the same repair vocabulary as the source review.
 * Throws if the browser, server, or API is unavailable (callers fail closed).
 */
export async function renderAudit(slug, {
  baseUrl = DEFAULT_BASE_URL,
  siteRoot = null,
  brief = '',
  designPlan = '',
  priorIssues = [],
} = {}) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('playwright is not installed — run: npm install playwright && npx playwright install --with-deps chromium');
  }

  const staticServer = siteRoot ? await startStaticReviewServer(siteRoot) : null;
  if (staticServer) baseUrl = staticServer.baseUrl;
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const shots = [];
  try {
    // index (home) at both widths, plus the two list pages at desktop — the
    // pages where grid/overlap defects have actually shipped.
    const targets = [
      ['home desktop 1440px', `${baseUrl}/designs/${slug}/index.html`, { width: 1440, height: 900 }],
      ['home mobile 390px', `${baseUrl}/designs/${slug}/index.html`, { width: 390, height: 844 }],
      ['projects desktop 1440px', `${baseUrl}/designs/${slug}/projects.html`, { width: 1440, height: 900 }],
      ['designs desktop 1440px', `${baseUrl}/designs/${slug}/designs.html`, { width: 1440, height: 900 }],
      ['contact desktop 1440px', `${baseUrl}/designs/${slug}/contact.html`, { width: 1440, height: 900 }],
    ];
    for (const [label, url, viewport] of targets) {
      shots.push([label, await screenshotPage(browser, url, viewport)]);
    }
  } finally {
    await browser.close();
    if (staticServer) await staticServer.close();
  }

  // Persist the evidence: a fail-closed rejection deletes the design, so the
  // screenshots are the only way to postmortem what the reviewer saw.
  for (const [i, [label, buf]] of shots.entries()) {
    const file = join(tmpdir(), `render-audit-${slug}-${i}-${label.split(' ')[0]}.jpeg`);
    await writeFile(file, buf).catch(() => {});
  }

  const layoutKeys = Object.keys(LAYOUT_SPECS).join(', ');
  const screenshotLabels = shots.map(([label]) => label);
  const reverificationSection = priorIssues.length ? `

PRIOR ISSUES FROM THE PREVIOUS PASS — for re-verification only; the site has been REBUILT since these were written:
${priorIssues.map((issue, i) => `${i + 1}. [${issue?.severity || 'blocking'}] ${issue?.target}: ${issue?.issue}`).join('\n')}

For EACH prior issue, look at the CURRENT screenshots and decide: still present, or resolved. Put the resolved ones (quote them by number and a short description) in "resolved_since_last_pass". NEVER copy a prior issue into "issues" from memory — report it only if you can SEE it in the current screenshots at a location you cite in its "evidence". Reporting a fixed defect as still present wastes an entire repair cycle.` : '';
  const parts = [{
    text: `You are the rendered-page release inspector for an AI-generated portfolio skin. Below are full-page screenshots of the ACTUAL rendered site. Judge the pixels, not intent or source-code promises.

USER BRIEF: ${brief || '(not supplied)'}
ART DIRECTION PLAN: ${designPlan || '(not supplied)'}${reverificationSection}

Score the complete result 1-10 on prompt fidelity, distinctiveness, cohesion, hierarchy, typography, composition, image integration, and production polish. A technically valid but basic/template-like design MUST score below 8. Reject if the same hierarchy and layout could serve an unrelated prompt after merely changing colors or images. When the brief names a recognizable subject, that subject must be unmistakable in the hero and supporting imagery without sacrificing Greg's human likeness in the contact portrait.

Set approved=true ONLY when score >= 8, prompt_fidelity >= 8, distinctiveness >= 8, cohesion >= 8, and there are no blocking issues.

Classify every defect you find with a severity:

"blocking" — a real visitor would immediately see the page as BROKEN. Only these fail the release:
- text overlapping or colliding with other text (navigation links rendered on top of each other, metadata overprinting titles, words running together with no separation)
- content overflowing the viewport horizontally, or elements escaping their containers
- unreadable text (illegible contrast, text on busy imagery without treatment)
- broken or missing images, raw placeholder artifacts, visible template tokens like {{NAME}}
- enormous empty dead zones, or a layout that reads as broken rather than designed
- on the mobile screenshot: anything cut off, crushed, or requiring horizontal scrolling
- the design is generic, visually basic, or fails to visibly embody the user's actual brief
- generated imagery is disconnected from the composition or the contact portrait loses the subject's credible likeness

"minor" — polish defects worth fixing but shippable: slightly tight or uneven spacing, small alignment nits, a stray border or artifact that does not obscure content, imperfect visual rhythm.

Do not inflate a small spacing nit to blocking; do not downgrade generic composition, prompt failure, or genuine breakage to minor.

OUT OF SCOPE — never raise these as blocking; they are fixed site facts, not defects of this design:
- The NUMBER of project or design cards. This portfolio genuinely has only a few items; a sparse grid is content reality, not a bug. Judge how well the layout treats the real count; a composition suggestion for handling few items is at most "minor" with target "css".
- The top utility bar ("← Prev Design … Next Design →", "START A PROJECT") and any CNA/consent banner. These are permanent, mechanically injected site chrome that appears on every page of every design — never "leftover debug elements".
- Anything fixable only by ADDING content (more projects, more designs, more copy).

EVIDENCE — every issue MUST include an "evidence" field naming the exact screenshot it is visible in (one of: ${screenshotLabels.join('; ')}) and where on it (e.g. "projects desktop 1440px — right of the second card"). An issue you cannot point to in a specific current screenshot does not exist; do not report it. Never output filler text like "placeholder" — every issue must be a complete, specific defect description.

When rejecting, each issue's target MUST be exactly "css" or one of: ${layoutKeys}. Describe each defect concretely enough that a repair model that CANNOT see the screenshots can fix it (name the element, the page, and what is visually wrong).

Target routing: spacing, sizing, color, contrast, overlap, and overflow defects are almost always STYLESHEET problems — target "css" for those (e.g. tags/chips/metadata running together without separation, text colliding, containers overflowing). Target a layout only when the DOM structure itself is wrong (missing section, wrong nesting, element in the wrong place).

OUTPUT: exactly one JSON object: { "approved": true, "score": 9, "prompt_fidelity": 9, "distinctiveness": 9, "cohesion": 9, "issues": [], "resolved_since_last_pass": [] }`,
  }];
  for (const [label, buf] of shots) {
    parts.push({ text: `Screenshot: ${label}` }, { inlineData: { mimeType: 'image/jpeg', data: buf.toString('base64') } });
  }

  const audit = extractJson(await openRouterVision(parts));
  if (!Array.isArray(audit.issues)) audit.issues = [];
  const sanitized = sanitizeAuditVerdict(audit, { screenshotLabels });
  // Ship the evidence with the verdict so a vision-capable repair model can
  // analyze the SAME pixels the reviewer judged (text-only repairs stall —
  // see the generator skill's gotchas). Base64 JPEG, ~600KB per pass, held
  // in memory only for the life of the pass.
  sanitized.screenshots = shots.map(([label, buf]) => ({
    label,
    mimeType: 'image/jpeg',
    data: buf.toString('base64'),
  }));
  return sanitized;
}

// ── CLI ──
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/render-audit.mjs <design-slug>');
    process.exit(1);
  }
  renderAudit(slug).then((audit) => {
    console.log(JSON.stringify(audit, null, 2));
    process.exit(audit.approved ? 0 : 1);
  }).catch((e) => {
    console.error(`[render-audit] ${e.message}`);
    process.exit(1);
  });
}
