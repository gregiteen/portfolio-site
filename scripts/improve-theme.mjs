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

// Model rotation: cycle through available models for fresh perspectives
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-pro',
  'gemini-3.5-pro',
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
    req.setTimeout(180_000, () => { req.destroy(); reject(new Error('Gemini API timeout')); });
    req.write(body);
    req.end();
  });
}

async function callLLM(prompt, model) {
  return geminiApiCall(model, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
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

  // Step 1: Score the current design
  const scoreRaw = await callLLM(`You are a senior design critic. Score this AI-generated portfolio theme 1-10 on:
- Visual distinctiveness (does it look like a template or something bespoke?)
- Cohesion (do the CSS and layouts feel like they belong together?)
- Technical quality (clean HTML, valid CSS, no broken layouts?)
- Placeholder compliance (all required {{PLACEHOLDER}} variables present?)

Theme name: ${name}
Style brief: ${style}
Accent: ${accent}

CSS (first 3000 chars):
${css.slice(0, 3000)}

Layouts: ${Object.keys(layouts).join(', ')}

PLACEHOLDER CONTRACT:
${placeholderContract}

OUTPUT: Return exactly one JSON object:
{
  "score": 7,
  "distinctiveness": 7,
  "cohesion": 8,
  "technical": 6,
  "placeholders": 9,
  "critique": "What's wrong and how to improve it...",
  "should_improve": true
}`, model);

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

  // Step 2: Generate improved version
  const improveRaw = await callLLM(`You are improving an AI-generated portfolio theme. Here is the critique:

${scoreObj.critique}

Current theme:
Name: ${name}
Style: ${style}
Accent: ${accent}

Current CSS:
${css}

Current layouts:
${JSON.stringify(layouts)}

PLACEHOLDER CONTRACT (you MUST use these exact variables):
${placeholderContract}

RULES:
- You MUST NOT write any hardcoded text, titles, or copy into the layouts. Use ONLY {{PLACEHOLDER}} variables.
- You MUST NOT remove any required placeholders.
- You MUST preserve the general aesthetic intent but make targeted improvements based on the critique.
- Focus on the weakest scoring areas.

OUTPUT: Return exactly one JSON object with the improved theme:
{
  "name": "${name}",
  "accent": "${accent}",
  "css": "…improved complete stylesheet…",
  "layouts": { ...all layouts... }
}`, model);

  let improvedPayload;
  try {
    improvedPayload = extractJson(improveRaw);
  } catch {
    console.warn(`  [${slug}] Failed to parse improved theme, skipping`);
    return { slug, score: scoreObj.score, improved: false };
  }

  // Step 3: Validate the improved version
  const verdict = validateThemePayload(improvedPayload, { strict: false });
  if (!verdict.theme) {
    console.warn(`  [${slug}] Improved version failed validation: ${verdict.errors.join('; ')}`);
    return { slug, score: scoreObj.score, improved: false };
  }

  for (const w of verdict.warnings) console.warn(`  ⚠ ${w}`);

  // Step 4: Score the improved version
  const newScoreRaw = await callLLM(`Score this improved theme 1-10. Be honest — is it actually better than the original?

Original score: ${scoreObj.score}/10
Original critique: ${scoreObj.critique}

Improved CSS (first 3000 chars):
${verdict.theme.css.slice(0, 3000)}

Improved layouts: ${Object.keys(verdict.theme.layouts).join(', ')}

OUTPUT: { "score": 8, "is_better": true, "reason": "..." }`, model);

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

  // Rebuild this design layer
  try {
    spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', slug], { stdio: 'inherit' });
  } catch (/** @type {any} */ e) {
    console.warn(`  [${slug}] Rebuild failed: ${e.message}`);
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
  if (improved.length > 0) {
    console.log('\n[Improve] Rebuilding main site…');
    spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
  }
}

run().catch((e) => {
  console.error(`[Improve] Fatal: ${e.message}`);
  process.exit(1);
});
