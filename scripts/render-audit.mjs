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

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import https from 'node:https';
import { LAYOUT_SPECS, extractJson } from './lib/theme.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BASE_URL = process.env.RENDER_AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const AUDIT_MODEL = 'gemini-3.1-pro-preview';

const RENDER_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    approved: { type: 'BOOLEAN' },
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
  required: ['approved', 'issues'],
};

function geminiVision(parts) {
  return new Promise((resolve, reject) => {
    const key = process.env.GOOGLE_API_KEY || '';
    if (!key) return reject(new Error('GOOGLE_API_KEY not set'));
    const body = JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RENDER_AUDIT_SCHEMA,
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 8192 },
      },
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${AUDIT_MODEL}:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.candidates?.[0]?.content?.parts) {
            return reject(new Error(`Gemini API error: ${data.slice(0, 300)}`));
          }
          resolve(json.candidates[0].content.parts.map((p) => p.text || '').join(''));
        } catch (/** @type {any} */ e) {
          reject(new Error(`Failed to parse Gemini response: ${String(e)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(300_000, () => { req.destroy(); reject(new Error('Gemini API timeout')); });
    req.write(body);
    req.end();
  });
}

async function screenshotPage(browser, url, viewport) {
  const page = await browser.newPage({ viewport });
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

/**
 * Screenshot the built pages of a design at desktop + mobile widths and have
 * the vision model audit the actual rendering. Returns
 * { approved: boolean, issues: [{ target, issue }] } where each target is
 * "css" or a layout key — the same repair vocabulary as the source review.
 * Throws if the browser, server, or API is unavailable (callers fail closed).
 */
export async function renderAudit(slug, { baseUrl = DEFAULT_BASE_URL } = {}) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    throw new Error('playwright is not installed — run: npm install playwright && npx playwright install --with-deps chromium');
  }

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
    ];
    for (const [label, url, viewport] of targets) {
      shots.push([label, await screenshotPage(browser, url, viewport)]);
    }
  } finally {
    await browser.close();
  }

  // Persist the evidence: a fail-closed rejection deletes the design, so the
  // screenshots are the only way to postmortem what the reviewer saw.
  for (const [i, [label, buf]] of shots.entries()) {
    const file = join(tmpdir(), `render-audit-${slug}-${i}-${label.split(' ')[0]}.jpeg`);
    await writeFile(file, buf).catch(() => {});
  }

  const layoutKeys = Object.keys(LAYOUT_SPECS).join(', ');
  const parts = [{
    text: `You are the rendered-page release inspector for an AI-generated portfolio skin. Below are full-page screenshots of the ACTUAL rendered site. Judge the pixels, not intent.

Classify every defect you find with a severity:

"blocking" — a real visitor would immediately see the page as BROKEN. Only these fail the release:
- text overlapping or colliding with other text (navigation links rendered on top of each other, metadata overprinting titles, words running together with no separation)
- content overflowing the viewport horizontally, or elements escaping their containers
- unreadable text (illegible contrast, text on busy imagery without treatment)
- broken or missing images, raw placeholder artifacts, visible template tokens like {{NAME}}
- enormous empty dead zones, or a layout that reads as broken rather than designed
- on the mobile screenshot: anything cut off, crushed, or requiring horizontal scrolling

"minor" — polish defects worth fixing but shippable: slightly tight or uneven spacing, small alignment nits, a stray border or artifact that does not obscure content, imperfect visual rhythm.

Set approved=true when there are NO blocking issues — even if you list minor ones. Do not inflate a minor nit to blocking; do not downgrade genuine breakage to minor.

When rejecting, each issue's target MUST be exactly "css" or one of: ${layoutKeys}. Describe each defect concretely enough that a repair model that CANNOT see the screenshots can fix it (name the element, the page, and what is visually wrong).

Target routing: spacing, sizing, color, contrast, overlap, and overflow defects are almost always STYLESHEET problems — target "css" for those (e.g. tags/chips/metadata running together without separation, text colliding, containers overflowing). Target a layout only when the DOM structure itself is wrong (missing section, wrong nesting, element in the wrong place).

OUTPUT: exactly one JSON object: { "approved": true, "issues": [] }`,
  }];
  for (const [label, buf] of shots) {
    parts.push({ text: `Screenshot: ${label}` }, { inlineData: { mimeType: 'image/jpeg', data: buf.toString('base64') } });
  }

  const audit = extractJson(await geminiVision(parts));
  if (!Array.isArray(audit.issues)) audit.issues = [];
  // Hand the evidence to the caller: repair models are multimodal too, and a
  // blind repair loop has been observed to stall (3 blocking issues unchanged
  // across 3 passes) because a textual defect description is not actionable
  // without the pixels.
  audit.screenshots = shots.map(([label, buf]) => [label, buf.toString('base64')]);
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
