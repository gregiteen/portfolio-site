#!/usr/bin/env node
// Continuous improvement script for AI-generated theme skins.
// Loads an existing theme's DESIGN.md, sends CSS + layouts to the LLM for critique,
// generates an improved version, and swaps it in if the score improves.
//
// Usage:
//   node scripts/improve-theme.mjs                    # improve ALL themes
//   node scripts/improve-theme.mjs <slug>             # improve one specific theme
//   node scripts/improve-theme.mjs --model gemini-3.1-pro  # use a specific model

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import https from 'node:https';
import {
  LAYOUT_SPECS,
  extractJson,
  extractSections,
  validateThemePayload,
  serializeThemeDoc,
} from './lib/theme.mjs';
import { CSS_MECHANICS, LAYOUT_EXEMPLARS } from './lib/design-exemplars.mjs';

const CSS_EXEMPLARS = Object.values(CSS_MECHANICS).join('\n\n');

const __dirname = dirname(fileURLToPath(import.meta.url));
const designsDir = join(__dirname, '..', 'designs');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

// Parse CLI args
const args = process.argv.slice(2);
let targetSlug = null;
let modelOverride = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--model' && args[i + 1]) {
    modelOverride = args[++i];
  } else if (!args[i].startsWith('-')) {
    targetSlug = args[i];
  }
}

// Model rotation: cycle through current-generation models for fresh
// perspectives. IDs verified live against generativelanguage v1beta
// generateContent (2026-07-08). Gemini 2.5-pro is deliberately EXCLUDED —
// it is an older generation and must never be used here.
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
];

function pickModel(slug) {
  if (modelOverride) return modelOverride;
  // Deterministic rotation based on day + slug hash
  const day = Math.floor(Date.now() / 86400000);
  const hash = [...slug].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return MODELS[(day + hash) % MODELS.length];
}

// ─── Gemini API ──────────────────────────────────────────────────────────────

function geminiApiCall(model, bodyObj) {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_API_KEY) return reject(new Error('GOOGLE_API_KEY not set'));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
    const body = JSON.stringify(bodyObj);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.candidates?.[0]?.content?.parts) {
            return reject(new Error(`Gemini API error: ${data.slice(0, 300)}`));
          }
          resolve(json.candidates[0].content.parts.map(p => p.text || '').join(''));
        } catch (/** @type {any} */ e) {
          reject(new Error(`Failed to parse Gemini response: ${String(e)}`));
        }
      });
    });
    req.on('error', reject);
    // 300s: the improve call regenerates a full stylesheet + every layout as
    // one schema-constrained JSON payload, which can run well past 180s. This
    // runs async (cron / post-generation hot-swap), so the viewer never waits.
    req.setTimeout(300_000, () => { req.destroy(); reject(new Error('Gemini API timeout')); });
    req.write(body);
    req.end();
  });
}

// Strict response schemas force Gemini's constrained decoder to emit valid,
// properly-escaped JSON — the durable fix for current-gen models (flash,
// 3.1-pro-preview) intermittently emitting bad escapes inside CSS/layout
// strings. This is why we do NOT need (or want) an older model as a fallback.
const SCORE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: { type: 'INTEGER' },
    distinctiveness: { type: 'INTEGER' },
    cohesion: { type: 'INTEGER' },
    technical: { type: 'INTEGER' },
    placeholders: { type: 'INTEGER' },
    critique: { type: 'STRING' },
    should_improve: { type: 'BOOLEAN' },
  },
  required: ['score', 'critique', 'should_improve'],
};

const COMPARE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: { type: 'INTEGER' },
    is_better: { type: 'BOOLEAN' },
    reason: { type: 'STRING' },
  },
  required: ['score', 'is_better'],
};

// Specialist fan-out schemas: each component is improved by its own focused
// call so they run in parallel and a single slow/failed slot can't nuke the
// whole improve (that slot just keeps its original).
const CSS_ONLY_SCHEMA = {
  type: 'OBJECT',
  properties: { css: { type: 'STRING' } },
  required: ['css'],
};
const LAYOUT_ONLY_SCHEMA = {
  type: 'OBJECT',
  properties: { html: { type: 'STRING' } },
  required: ['html'],
};

async function callLLM(prompt, model, schema = null) {
  const generationConfig = { responseMimeType: 'application/json' };
  if (schema) generationConfig.responseSchema = schema;
  return geminiApiCall(model, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });
}

// ─── Improvement Logic ───────────────────────────────────────────────────────

const placeholderContract = Object.entries(LAYOUT_SPECS)
  .map(([key, spec]) => `- "${key}": required slots ${spec.required.join(', ')}${spec.optional.length ? `; optional slots ${spec.optional.join(', ')}` : ''}`)
  .join('\n');

async function improveTheme(slug) {
  const designMdPath = join(designsDir, slug, 'DESIGN.md');
  let raw;
  try {
    raw = await readFile(designMdPath, 'utf8');
  } catch {
    console.warn(`  ⚠ No DESIGN.md found for ${slug}, skipping`);
    return null;
  }

  const sections = extractSections(raw);
  const css = sections.css || '';
  const layouts = {};
  for (const [key, content] of Object.entries(sections)) {
    if (key.startsWith('layout:')) layouts[key.slice('layout:'.length)] = content;
  }

  // Extract frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  const fmLines = fmMatch ? fmMatch[1].split('\n') : [];
  const name = fmLines.find(l => l.startsWith('name:'))?.replace(/^name:\s*"?|"?\s*$/g, '') || slug;
  const accent = fmLines.find(l => l.startsWith('accent:'))?.replace(/^accent:\s*"?|"?\s*$/g, '') || '#888888';
  const style = fmLines.find(l => l.startsWith('style:'))?.replace(/^style:\s*"?|"?\s*$/g, '') || '';

  const model = pickModel(slug);
  console.log(`  [${slug}] Using model: ${model}`);

  // Step 1: Score the current design. The old prompt only included the first
  // CSS slice and layout names, so it could never catch broken markup hidden
  // in one of the actual templates. This receives the whole source package.
  const scoreRaw = await callLLM(`You are a senior design critic. Inspect the COMPLETE stylesheet and EVERY full HTML layout below, then score this AI-generated portfolio theme 1-10 on:
- Visual distinctiveness (does it look like a template or something bespoke?)
- Cohesion (do the CSS and layouts feel like they belong together?)
- Technical quality (clean HTML, valid CSS, no broken layouts?)
- Placeholder compliance (all required {{PLACEHOLDER}} variables present?)

Theme name: ${name}
Style brief: ${style}
Accent: ${accent}

FULL SOURCE PACKAGE:
${JSON.stringify({ css, layouts })}

PLACEHOLDER CONTRACT:
${placeholderContract}

TECHNICAL TOOLKIT (HIGH-END FRONTEND MECHANICS):
The CSS and HTML should aggressively utilize the high-end techniques demonstrated below (like scroll-driven animations, fluid masking, or glassmorphism). If the theme just uses basic flex/grid layouts without these mechanics, score it lower and force an improvement.
${CSS_EXEMPLARS}
${LAYOUT_EXEMPLARS}

OUTPUT: Return exactly one JSON object:
{
  "score": 7,
  "distinctiveness": 7,
  "cohesion": 8,
  "technical": 6,
  "placeholders": 9,
  "critique": "What's wrong and how to improve it...",
  "should_improve": true
}`, model, SCORE_SCHEMA);

  let scoreObj;
  try {
    scoreObj = extractJson(scoreRaw);
  } catch {
    console.warn(`  [${slug}] Failed to parse score response, skipping`);
    return null;
  }

  console.log(`  [${slug}] Current score: ${scoreObj.score}/10 (dist:${scoreObj.distinctiveness} coh:${scoreObj.cohesion} tech:${scoreObj.technical} ph:${scoreObj.placeholders})`);

  if (!scoreObj.should_improve && scoreObj.score >= 9) {
    console.log(`  [${slug}] Score is ${scoreObj.score}/10 — at plateau, skipping`);
    return { slug, score: scoreObj.score, improved: false };
  }

  // Step 2: Improve each component in parallel (specialist per slot).
  // One call for CSS + one per layout, all concurrent. A slot that fails or
  // times out simply keeps its original — the improve never dies wholesale,
  // and wall-clock is the slowest single slot, not the serial sum.
  const sharedBrief = `Theme name: ${name}
Style brief: ${style}
Accent: ${accent}
Critique to address (focus on the weakest areas):
${scoreObj.critique}

RULES:
- Preserve the aesthetic intent; make targeted improvements, don't restart from scratch.
- NEVER write hardcoded text, titles, or copy. Use ONLY {{PLACEHOLDER}} variables.
- NEVER remove a required placeholder.
- The theme's generated images at assets/logo.png, assets/favicon.png, assets/hero.jpg, and assets/portrait.jpg (referenced via url(...) or <img>) are NOT hardcoded copy — using them is required, not a violation of the no-hardcoding rule. In particular, the "home" layout's top-level hero element MUST carry a class the CSS gives background-image: url(assets/hero.jpg) — a theme with no visible hero image is a failed improve.
- NEVER write <script>…</script> or any inline JS. Layouts are inert markup only; interactivity must come from CSS alone (:hover, :focus, transitions, animations). Any script tag found will be stripped, so it's wasted effort.`;

  const cssTask = callLLM(`You are a CSS specialist improving one portfolio theme's stylesheet.
${sharedBrief}

Current CSS:
${css}

OUTPUT: exactly one JSON object: { "css": "…improved complete stylesheet…" }`, model, CSS_ONLY_SCHEMA)
    .then((r) => ({ kind: 'css', value: extractJson(r).css }))
    .catch((e) => ({ kind: 'css', error: String(e) }));

  const layoutTasks = Object.entries(layouts).map(([key, tpl]) => {
    const spec = LAYOUT_SPECS[key];
    const required = spec ? spec.required.join(', ') : '(none)';
    return callLLM(`You are a layout specialist improving the "${key}" layout of one portfolio theme.
${sharedBrief}

This layout MUST contain these exact placeholder(s): ${required}

Current "${key}" layout HTML:
${tpl}

OUTPUT: exactly one JSON object: { "html": "…improved layout HTML with the required placeholders…" }`, model, LAYOUT_ONLY_SCHEMA)
      .then((r) => ({ kind: 'layout', key, value: extractJson(r).html }))
      .catch((e) => ({ kind: 'layout', key, error: String(e) }));
  });

  const results = await Promise.all([cssTask, ...layoutTasks]);

  // Assemble: start from the current theme, overlay only the slots that
  // improved cleanly; failed/empty slots keep their original content.
  let improvedCss = css;
  const improvedLayouts = { ...layouts };
  let improvedSlots = 0;
  for (const r of results) {
    if (r.error) { console.warn(`  [${slug}] ${r.kind}${r.key ? ':' + r.key : ''} slot failed (${r.error}) — keeping original`); continue; }
    if (r.kind === 'css' && typeof r.value === 'string' && r.value.trim()) { improvedCss = r.value; improvedSlots++; }
    if (r.kind === 'layout' && typeof r.value === 'string' && r.value.trim()) { improvedLayouts[r.key] = r.value; improvedSlots++; }
  }
  if (improvedSlots === 0) {
    console.warn(`  [${slug}] No slot improved, skipping`);
    return { slug, score: scoreObj.score, improved: false };
  }
  console.log(`  [${slug}] Improved ${improvedSlots}/${results.length} slot(s) in parallel`);
  const improvedPayload = { name, accent, css: improvedCss, layouts: improvedLayouts };

  // Step 3: Validate the improved version
  const verdict = validateThemePayload(improvedPayload, {
    strict: true,
    requireAllLayouts: true,
    requireHero: true,
  });
  if (!verdict.theme) {
    console.warn(`  [${slug}] Improved version failed validation: ${verdict.errors.join('; ')}`);
    return { slug, score: scoreObj.score, improved: false };
  }

  for (const w of verdict.warnings) console.warn(`  ⚠ ${w}`);

  // Step 4: Score the improved version
  const newScoreRaw = await callLLM(`Score this improved theme 1-10. Be honest — is it actually better than the original?

Original score: ${scoreObj.score}/10
Original critique: ${scoreObj.critique}

FULL IMPROVED SOURCE PACKAGE (inspect all CSS and every HTML layout):
${JSON.stringify({ css: verdict.theme.css, layouts: verdict.theme.layouts })}

OUTPUT: { "score": 8, "is_better": true, "reason": "..." }`, model, COMPARE_SCHEMA);

  let newScoreObj;
  try {
    newScoreObj = extractJson(newScoreRaw);
  } catch {
    console.warn(`  [${slug}] Failed to parse new score, keeping original`);
    return { slug, score: scoreObj.score, improved: false };
  }

  console.log(`  [${slug}] Improved score: ${newScoreObj.score}/10 (was ${scoreObj.score}/10)`);

  if (!newScoreObj.is_better || newScoreObj.score <= scoreObj.score) {
    console.log(`  [${slug}] No improvement, keeping original`);
    return { slug, score: scoreObj.score, improved: false };
  }

  // Step 5: Write improved version
  const theme = verdict.theme;
  const blocks = Object.entries({ css: theme.css, ...Object.fromEntries(Object.entries(theme.layouts).map(([k, v]) => [`layout:${k}`, v])) })
    .filter(([, content]) => typeof content === 'string' && content.trim())
    .map(([bname, content]) => `## section:${bname}\n\n\`\`\`${bname === 'css' ? 'css' : 'html'}\n${content.replace(/```/g, '')}\n\`\`\``)
    .join('\n\n');

  const designMd = `---
name: "${theme.name}"
accent: "${theme.accent}"
style: "${style.replace(/"/g, '\\"')}"
improvement_score: "${newScoreObj.score}"
last_improved: "${new Date().toISOString()}"
---

# Design System

${blocks}
`;

  await writeFile(designMdPath, designMd, 'utf8');
  console.log(`  [${slug}] ✓ Improved! ${scoreObj.score} → ${newScoreObj.score}`);

  // serve.mjs coordinates one rebuild after this child exits. Keeping builds
  // out of this process prevents a watcher/improver race over dist/site.
  if (process.env.THEME_DEFER_BUILD !== '1') {
    try {
      const result = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', slug], { stdio: 'inherit' });
      if (result.status !== 0) throw new Error(`exit ${result.status}`);
    } catch (/** @type {any} */ e) {
      console.warn(`  [${slug}] Rebuild failed: ${e.message}`);
    }
  } else {
    console.log(`  [${slug}] Build deferred to the serialized server rebuild`);
  }

  return { slug, score: newScoreObj.score, improved: true, previousScore: scoreObj.score };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  if (!GOOGLE_API_KEY) {
    console.error('Error: GOOGLE_API_KEY required for improvement.');
    process.exit(1);
  }

  let slugs;
  if (targetSlug) {
    slugs = [targetSlug];
  } else {
    // Discover all design directories
    try {
      const entries = await readdir(designsDir, { withFileTypes: true });
      slugs = entries.filter(e => e.isDirectory()).map(e => e.name);
    } catch {
      console.log('No designs directory found. Nothing to improve.');
      return;
    }
  }

  if (slugs.length === 0) {
    console.log('No designs to improve.');
    return;
  }

  console.log(`[Improve] Processing ${slugs.length} design(s)…`);
  const results = [];

  for (const slug of slugs) {
    console.log(`\n[Improve] ${slug}`);
    try {
      const result = await improveTheme(slug);
      if (result) results.push(result);
    } catch (/** @type {any} */ e) {
      console.error(`  [${slug}] Error: ${e.message}`);
    }
  }

  // Summary
  const improved = results.filter(r => r.improved);
  const skipped = results.filter(r => !r.improved);
  console.log(`\n[Improve] Done. ${improved.length} improved, ${skipped.length} unchanged.`);
  for (const r of improved) {
    console.log(`  ✓ ${r.slug}: ${r.previousScore} → ${r.score}`);
  }

  // Rebuild main site if anything changed
  if (improved.length > 0 && process.env.THEME_DEFER_BUILD !== '1') {
    console.log('\n[Improve] Rebuilding main site…');
    spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
  }
}

run().catch((e) => {
  console.error(`[Improve] Fatal: ${e.message}`);
  process.exit(1);
});
