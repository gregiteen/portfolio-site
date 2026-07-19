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
        },
        required: ['target', 'issue', 'severity'],
      },
    },
  },
  required: ['approved', 'score', 'prompt_fidelity', 'distinctiveness', 'cohesion', 'issues'],
};

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
  const parts = [{
    text: `You are the rendered-page release inspector for an AI-generated portfolio skin. Below are full-page screenshots of the ACTUAL rendered site. Judge the pixels, not intent or source-code promises.

USER BRIEF: ${brief || '(not supplied)'}
ART DIRECTION PLAN: ${designPlan || '(not supplied)'}

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

When rejecting, each issue's target MUST be exactly "css" or one of: ${layoutKeys}. Describe each defect concretely enough that a repair model that CANNOT see the screenshots can fix it (name the element, the page, and what is visually wrong).

Target routing: spacing, sizing, color, contrast, overlap, and overflow defects are almost always STYLESHEET problems — target "css" for those (e.g. tags/chips/metadata running together without separation, text colliding, containers overflowing). Target a layout only when the DOM structure itself is wrong (missing section, wrong nesting, element in the wrong place).

OUTPUT: exactly one JSON object: { "approved": true, "score": 9, "prompt_fidelity": 9, "distinctiveness": 9, "cohesion": 9, "issues": [] }`,
  }];
  for (const [label, buf] of shots) {
    parts.push({ text: `Screenshot: ${label}` }, { inlineData: { mimeType: 'image/jpeg', data: buf.toString('base64') } });
  }

  const audit = extractJson(await openRouterVision(parts));
  if (!Array.isArray(audit.issues)) audit.issues = [];
  return audit;
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
