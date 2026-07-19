#!/usr/bin/env node
// Generate a bespoke SSSS theme (CSS + layout templates) via a headless CLI
// agent, following the tr-cli-agents priority-fallback dispatch pattern.
//
// Reliability contract:
//  - Agents are spawned with argument arrays (no shell, no injection/escaping).
//  - The model outputs *templates with {{PLACEHOLDER}} slots*, never portfolio
//    copy — the build script injects real vault content, so content can't drift.
//  - Output is validated against the placeholder contract; one repair round
//    asks the model to fix its own JSON before we give up.
//  - The theme is stored as fenced sections in a normal SSSS page doc — no
//    YAML block scalars, no bespoke frontmatter parser.
import { writeFile, mkdir, copyFile, readFile, rm, rename } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import https from 'node:https';
import {
  LAYOUT_SPECS,
  extractJson,
  validateThemePayload,
  serializeThemeDoc,
  enforceBrandAssetContract,
} from './lib/theme.mjs';
import {
  generationRetryDelay,
  repairUntilApproved,
  renderedReviewState,
  requireApprovedVisualAudit,
  requireValidTheme,
} from './lib/theme-release.mjs';
import {
  CLAUDE_VISION_MODEL,
  DEEPSEEK_REPAIR_MODEL,
  callOpenRouter,
  isRetryableOpenRouterError,
} from './lib/openrouter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const vaultDir = join(repoRoot, 'vault');
const assetsDir = join(repoRoot, 'assets');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
let activeStagingRoot = null;

// Response schemas for constrained decoding. Since the build
// fans out into per-section CSS + per-layout specialists, each call returns one
// small typed object — no monolithic full-payload schema is needed anymore.
const ONE_LAYOUT_SCHEMA = {
  type: 'OBJECT',
  properties: { html: { type: 'STRING' } },
  required: ['html'],
};
const LAYOUT_BLUEPRINT_SCHEMA = {
  type: 'OBJECT',
  properties: Object.fromEntries(Object.keys(LAYOUT_SPECS).map((key) => [key, {
    type: 'OBJECT',
    properties: {
      rootClass: { type: 'STRING' },
      composition: { type: 'STRING', maxLength: 700 },
    },
    required: ['rootClass', 'composition'],
  }])),
  required: Object.keys(LAYOUT_SPECS),
};

// One high-leverage director call replaces the former draft -> critique ->
// StyleSpec chain. It explores three directions internally, chooses one, and
// returns a machine-readable constitution shared by every parallel worker.
const DIRECTOR_SCHEMA = {
  type: 'OBJECT',
  properties: {
    concepts: { type: 'ARRAY', items: { type: 'STRING', maxLength: 500 } },
    critique: { type: 'STRING', maxLength: 900 },
    plan: { type: 'STRING', maxLength: 1800 },
    name: { type: 'STRING', maxLength: 80 },
    accent: { type: 'STRING', maxLength: 20 },
    designSpec: { type: 'STRING', maxLength: 1800 },
    signatureGesture: { type: 'STRING', maxLength: 700 },
    mobileStrategy: { type: 'STRING', maxLength: 700 },
    imageTreatment: { type: 'STRING', maxLength: 700 },
    tokens: {
      type: 'OBJECT',
      properties: {
        colors: { type: 'STRING', maxLength: 700 },
        typography: { type: 'STRING', maxLength: 700 },
        spacing: { type: 'STRING', maxLength: 500 },
        shape: { type: 'STRING', maxLength: 500 },
        motion: { type: 'STRING', maxLength: 500 },
      },
      required: ['colors', 'typography', 'spacing', 'shape', 'motion'],
    },
    classVocabulary: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          owner: { type: 'STRING' },
          purpose: { type: 'STRING' },
        },
        required: ['name', 'owner', 'purpose'],
      },
    },
    layoutBlueprints: LAYOUT_BLUEPRINT_SCHEMA,
    image_prompts: {
      type: 'OBJECT',
      properties: {
        hero: { type: 'STRING', maxLength: 700 },
        logo: { type: 'STRING', maxLength: 500 },
        portrait_style: { type: 'STRING', maxLength: 500 },
      },
      required: ['hero', 'logo', 'portrait_style'],
    },
    selected_mechanics: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    },
  },
  required: [
    'concepts', 'critique', 'plan', 'name', 'accent', 'designSpec',
    'signatureGesture', 'mobileStrategy', 'imageTreatment', 'tokens',
    'classVocabulary', 'layoutBlueprints', 'image_prompts', 'selected_mechanics',
  ],
};
import { DIRECTOR_EXEMPLARS, CSS_MECHANICS, LAYOUT_EXEMPLARS } from './lib/design-exemplars.mjs';
import { ORCHESTRATOR_BRAIN } from './lib/orchestrator-brain.mjs';

// A single CSS owner implements the whole visual system while layout families
// fan out in parallel. This avoids cross-section cascade conflicts without
// sacrificing the four-minute wall-clock target.
const CSS_SECTION_SCHEMA = {
  type: 'OBJECT',
  properties: { css: { type: 'STRING' } },
  required: ['css'],
};
// Release review is intentionally small: it audits the complete assembled
// source before any skin doc is written or static HTML is built. Repairs stay
// targeted and parallel so this gate adds one fast call in the normal case.
const RELEASE_REVIEW_SCHEMA = {
  type: 'OBJECT',
  properties: {
    approved: { type: 'BOOLEAN' },
    score: { type: 'INTEGER' },
    blocking_issues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { target: { type: 'STRING' }, issue: { type: 'STRING' } },
        required: ['target', 'issue'],
      },
    },
  },
  required: ['approved', 'score', 'blocking_issues'],
};
const VISUAL_ASSET_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    approved: { type: 'BOOLEAN' },
    issues: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['approved', 'issues'],
};
const prompt = process.argv.slice(2).join(' ').trim();
if (!prompt) {
  console.error('Error: Prompt is required. Usage: node compile-theme.mjs "style description"');
  process.exit(1);
}
if (prompt.length > 500) {
  console.error('Error: Prompt too long (max 500 chars).');
  process.exit(1);
}

// ─── Agent Registry (from agents.yml) ────────────────────────────────────────

const AGENTS = [
  {
    name: 'antigravity', binary: 'antigravity', priority: 1,
    args: (p) => ['-p', p, '-o', 'json'],
  },
  {
    name: 'claude', binary: 'claude', priority: 2,
    args: (p) => ['-p', p, '--output-format', 'json', '--permission-mode', 'bypassPermissions', '--setting-sources', 'local', '--tools', ''],
  },
  {
    name: 'codex', binary: 'codex', priority: 3,
    args: (p) => ['exec', p, '--full-auto', '--json', '--skip-git-repo-check'],
  },
];

function findBinaryInPath(binaryName) {
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    const fullPath = join(dir, binaryName);
    try {
      const stats = statSync(fullPath);
      if (stats.isFile() && (os.platform() === 'win32' || (stats.mode & 0o111) !== 0)) return fullPath;
    } catch {}
  }
  return null;
}

function parseAgentOutput(output) {
  try {
    const parsed = JSON.parse(output);
    if (parsed.response) return parsed.response;
    if (parsed.result) return parsed.result;
    if (parsed.content) return parsed.content;
    if (parsed.text) return parsed.text;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const last = parsed[parsed.length - 1];
      return last.content || last.text || last.response || JSON.stringify(last);
    }
  } catch {}
  return output;
}

// ─── Dispatch Engine ─────────────────────────────────────────────────────────

function executeAgentCall(userPrompt) {
  const availableAgents = [...AGENTS].sort((a, b) => a.priority - b.priority);
  let lastError;

  while (availableAgents.length) {
    const spec = availableAgents[0];
    const binaryPath = findBinaryInPath(spec.binary);
    if (!binaryPath) { availableAgents.shift(); continue; }

    console.log(`  → dispatching to ${spec.name}…`);
    const result = spawnSync(binaryPath, spec.args(userPrompt), {
      encoding: 'utf8',
      timeout: 300_000,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    if (result.status === 0 && result.stdout?.trim()) {
      return parseAgentOutput(result.stdout.trim());
    }
    const err = (result.stderr || result.stdout || result.error?.message || 'unknown error').slice(0, 500);
    console.error(`  ✗ ${spec.name} failed (exit ${result.status}): ${err.slice(0, 200)}`);
    lastError = `${spec.name}: ${err}`;
    availableAgents.shift();
  }
  throw new Error(lastError ? `All CLI agents failed. Last error: ${lastError}` : 'No CLI agents available.');
}

// ─── Image synthesis API ────────────────────────────────────────────────────
// Text planning, generation, review, and repair all use OpenRouter below.
// This direct endpoint remains only for the image models that create pixels.

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
          const cand = json.candidates?.[0];
          if (!cand?.content?.parts) {
            return reject(new Error(`Gemini API error: ${data.slice(0, 300)}`));
          }
          // A MAX_TOKENS finish means the payload was truncated mid-string —
          // with a responseSchema that yields unterminated JSON downstream.
          // Fail loudly so the caller retries/falls back instead of parsing
          // a half-written CSS blob.
          if (cand.finishReason === 'MAX_TOKENS') {
            return reject(new Error('Gemini response truncated (MAX_TOKENS) — raise maxOutputTokens or split the payload'));
          }
          resolve(cand.content.parts);
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${String(e)}`));
        }
      });
    });
    req.on('error', reject);
    // Individual specialists are intentionally small. A 90s ceiling prevents
    // one stalled model call from holding the entire parallel generation open.
    req.setTimeout(90_000, () => { req.destroy(); reject(new Error('Gemini API timeout')); });
    req.write(body);
    req.end();
  });
}

async function deepSeekText(userPrompt, schema = null, maxOutputTokens = 32768, label = 'design') {
  for (let attempt = 1; ; attempt++) {
    try {
      const raw = await callOpenRouter({
        model: DEEPSEEK_REPAIR_MODEL,
        prompt: userPrompt,
        schema,
        maxTokens: maxOutputTokens,
        // xhigh consumes about 95% of max_tokens as hidden reasoning, leaving
        // too little room for the actual CSS/layout JSON and taking many
        // minutes per specialist. Low still reasons while preserving output.
        reasoningEffort: 'low',
      });
      console.log(`  → OpenRouter ${DEEPSEEK_REPAIR_MODEL} ${label} response (${Math.round(raw.length / 1024)}KB)`);
      return raw;
    } catch (error) {
      if (!isRetryableOpenRouterError(error)) throw error;
      const delay = generationRetryDelay(attempt);
      console.warn(`  ⚠ OpenRouter ${label} request failed transiently; retrying the same candidate in ${Math.ceil(delay / 1000)}s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function openRouterVision(parts, schema, label = 'visual review') {
  const content = parts.map((part) => {
    if (typeof part?.text === 'string') return { type: 'text', text: part.text };
    if (part?.inlineData?.data) {
      return {
        type: 'image_url',
        image_url: { url: `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}` },
      };
    }
    throw new Error(`Unsupported ${label} content part`);
  });
  for (let attempt = 1; ; attempt++) {
    try {
      return await callOpenRouter({
        model: CLAUDE_VISION_MODEL,
        content,
        schema,
        maxTokens: 16384,
        reasoningEffort: 'high',
      });
    } catch (error) {
      if (!isRetryableOpenRouterError(error)) throw error;
      const delay = generationRetryDelay(attempt);
      console.warn(`  ⚠ OpenRouter ${label} failed transiently; retrying in ${Math.ceil(delay / 1000)}s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Logo/favicon stay on the full image model — it renders small legible text
// far more reliably, and that's exactly the defect ("garbled letterforms",
// "GI" reading as "CII") that's been triggering repair passes and re-rolls.
// Hero/portrait have no text to render, so they get the ~4x faster Lite
// model (Nano Banana 2 Lite) with no observed quality tradeoff.
const IMAGE_MODEL = 'gemini-3.1-flash-image';
const IMAGE_MODEL_LITE = 'gemini-3.1-flash-lite-image';

async function generateImage(imagePrompt, outputPath, baseImagePath = null, model = IMAGE_MODEL) {
  const parts = [];
  if (baseImagePath) {
    const { readFile: rf } = await import('node:fs/promises');
    const data = (await rf(baseImagePath)).toString('base64');
    parts.push({ inlineData: { mimeType: 'image/jpeg', data } });
  }
  parts.push({ text: imagePrompt });
  return generateImageParts(parts, outputPath, imagePrompt, model);
}

async function generateImageParts(requestParts, outputPath, label, model = IMAGE_MODEL) {
  const parts = await geminiApiCall(model, {
    contents: [{ parts: requestParts }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });
  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType) {
      const buf = Buffer.from(part.inlineData.data, 'base64');
      await writeFile(outputPath, buf);
      console.log(`  → saved ${outputPath} (${Math.round(buf.length / 1024)}KB)`);
      return true;
    }
  }
  console.warn(`  ⚠ No image data for: ${label.slice(0, 80)}`);
  return false;
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

const placeholderContract = Object.entries(LAYOUT_SPECS)
  .map(([key, spec]) => `- "${key}": required slots ${spec.required.join(', ')}${spec.optional.length ? `; optional slots ${spec.optional.join(', ')}` : ''}`)
  .join('\n');

const SITE_CONTEXT = `The site is the portfolio of Greg Iteen, a full-stack engineer building
local, file-native AI systems. Pages: home (hero + featured projects), projects index,
project detail pages, designs index (visual work with preview images), design detail pages,
about, contact. Dark, technical, editorial baseline. Your theme fully re-skins it.`;

// ─── Main Pipeline ───────────────────────────────────────────────────────────

async function run() {
  const t0 = Date.now();

  const styleName = prompt.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40).toLowerCase() || 'custom';
  const stageId = `${styleName}-${process.pid}-${Date.now()}`;
  const stagingRoot = join(repoRoot, '.theme-staging', stageId);
  activeStagingRoot = stagingRoot;
  const reviewSiteRoot = join(stagingRoot, 'site');
  const reviewOutDir = join(reviewSiteRoot, 'designs', styleName);
  const designDir = join(stagingRoot, 'design');
  const finalDesignDir = join(repoRoot, 'designs', styleName);
  const finalOutDir = join(repoRoot, 'dist', 'site', 'designs', styleName);
  const genDir = join(designDir, 'assets');
  await mkdir(genDir, { recursive: true });

  const heroPath = join(genDir, 'hero.jpg');
  const portraitPath = join(genDir, 'portrait.jpg');
  const logoPath = join(genDir, 'logo.png');
  const faviconPath = join(genDir, 'favicon.png');
  const portraitSource = join(assetsDir, 'greg-portrait.jpg');
  // Verified brand sources: logo/favicon are RESTYLED from these via
  // image-to-image (letterforms stay correct — pure text generation produced
  // garbled marks that failed the asset audit twice), and they double as the
  // fallback when a restyle fails so brand assets can never sink a build.
  const logoSource = join(repoRoot, 'static', 'gi-logo-transparent.png');
  const faviconSource = join(assetsDir, 'favicon.png');
  // The old generated fallback was intentionally deleted. Keep a quiet,
  // text-free neutral image as the infrastructure fallback; visual review can
  // still reject a design whose generated hero is missing or inappropriate.
  const heroFallback = join(assetsDir, 'designs', 'retro.jpg');

  // ── Phase 1: Planning and Architecture (including Image Prompts) ──
  console.log(`[1/3] Theme Architecture and Image Planning…`);

  const frontendSkillPath = join(__dirname, '..', '.agent', 'skills', 'frontend-design', 'SKILL.md');
  const frontendSkill = await import('node:fs/promises').then(m => m.readFile(frontendSkillPath, 'utf8')).catch(() => '');

  const pitfallsPath = join(__dirname, 'lib', 'pitfalls.json');
  const pitfalls = JSON.parse(await readFile(pitfallsPath, 'utf8'));
  const pitfallsDoc = pitfalls.map((rule) => [
    `- [${rule.id}] ${rule.symptom}`,
    `  Detector: ${rule.detector}`,
    `  Repair: ${rule.repair}`,
  ].join('\n')).join('\n');

  // Production workers receive a compact contract. The former prompt repeated
  // the entire frontend skill, toolbox, examples, and an ever-growing memory
  // document into every specialist call; that consumed time and encouraged
  // compliance theater instead of focused execution.
  const baseContext = `You are building structural CSS/HTML for Greg Iteen's portfolio.
THE BRIEF: "${prompt}"
SITE: ${SITE_CONTEXT}

NON-NEGOTIABLES:
- The vault owns all copy. Layouts use only the exact placeholders in their contract; never author visible words, scripts, document wrappers, or inline styles.
- Preformatted HTML placeholders belong only as element children. Raw URL placeholders may be used in href/src attributes.
- Use only class names from the locked Design Constitution. Every static layout class must have a matching CSS selector.
- CSS is mobile-first, uses min-width media queries for expansion, and gives interactive controls at least 44px touch targets.
- Style build-injected .badge, .src, .backlink, .btn, and .md-img classes explicitly. Bound logo and preview images with component-specific selectors.
- Use assets/hero.jpg prominently, assets/logo.png in the shell, and preserve reduced-motion behavior.
- No cyberpunk, generic dashboard tropes, decorative sequence numbers, fake copy, or theme-pun class names.

PLACEHOLDER CONTRACT:
${placeholderContract}

FRONTEND DESIGN STANDARD:
${frontendSkill}

KNOWN PITFALLS (DO NOT REPEAT THESE MISTAKES):
${pitfallsDoc}`;
  // Architecture needs the brief and site shape, not the entire HTML contract
  // or frontend skill. Keeping this serial request compact lets the parallel
  // CSS/layout fan-out start promptly without weakening later guardrails.
  const planningContext = `You are an award-winning digital art director creating a distinctive visual system for a real creative-technologist portfolio.

THE BRIEF: "${prompt}"

SITE CONTEXT:
${SITE_CONTEXT}

TECHNICAL TOOLKIT (HIGH-END FRONTEND MECHANICS):
${ORCHESTRATOR_BRAIN}
${pitfallsDoc}
FRONTEND DESIGN STANDARD:
${frontendSkill}
AVAILABLE MECHANICS TO SELECT: ${Object.keys(CSS_MECHANICS).join(', ')}
${DIRECTOR_EXEMPLARS}

ABSOLUTE SYSTEM RULE - CREATIVE SPRINGBOARD:
The user's prompt is a SPRINGBOARD for a CREATIVE process, not something to simply be decoded.
If the user asks for a theme like "BATMAN", "TURTLES", or "BEACHFRONT", you must creatively theme the ENTIRE architecture around that vibe. Do not scrub it away into a generic "credible design movement" or "dark tech" template.
Give the user what they asked for by building an incredible, agency-quality visual system that embodies their prompt (e.g., for BATMAN: use actual comic book styles, Bat symbols, and Gotham palettes).
PROMPT FIDELITY IS LITERAL: if the brief names an animal, place, object, era, or character archetype, the chosen direction and generated imagery must visibly contain recognizable subject matter from that brief. Do not hide the request behind euphemisms, abstract textures, palette changes, or obscure vocabulary. Preserve Greg's face in the portrait, but bring the requested subject into the portrait's environment, backdrop, lighting, wardrobe details, or surrounding scene.

ABSOLUTE SYSTEM RULE - STRICT AESTHETIC PROHIBITIONS:
1. DO NOT generate "neon cyan", "holographic gradients", "Y2K", "warm cream backgrounds", or other lazy, generic AI tropes unless EXPLICITLY prompted.
2. Adhere strictly to high-end, editorial, or highly deliberate design principles. DO NOT USE BRUTALIST DESIGN.
3. Never, under any circumstances, generate, suggest, or use "Cyberpunk" as a theme, aesthetic, or prompt. NO CYBERPUNK.
4. Avoid generic clip-art and basic geometric AI slop. Push for highly distinct, specific aesthetic universes.
5. NO BASIC SHIT. The design must be incredibly premium and state-of-the-art.
6. NO 2008 DESIGNS. Do not use outdated web 2.0 aesthetics, drop shadows, or generic corporate layouts.

Execute this creative vision using the high-end mechanics from the Technical Toolkit. You are the Orchestrator; explicitly dictate WHICH mechanics will execute this creative springboard flawlessly.`;

  async function callAgent(p, schema = null, maxOutputTokens = 16384) {
    try {
      return await deepSeekText(p, schema, maxOutputTokens, 'generation');
    } catch (err) {
      console.error('OpenRouter DeepSeek call failed:', String(err));
      if (process.env.ALLOW_CLI_THEME_FALLBACK !== '1') throw err;
      console.warn('  ⚠ ALLOW_CLI_THEME_FALLBACK=1; attempting a local CLI agent.');
      return executeAgentCall(p);
    }
  }

  console.log('  → Art Director: explore, critique, select, and lock the Design Constitution');
  const rawDirector = await callAgent(`${planningContext}

In ONE response:
1. Explore three materially different art directions for this exact brief.
2. Critique them against the anti-template standard and select the strongest.
3. Lock one complete Design Constitution for parallel execution.

The constitution is a production contract, not inspirational prose:
- classVocabulary must contain 24-40 semantic kebab-case class names. Each class has exactly one owner: css, shell, home, projects_index, designs_index, project_detail, design_detail, page, project_item, design_item, or nav_item.
- Never use theme-pun or anatomy class names. Theme specificity belongs in composition, tokens, imagery, and motion—not unstable selector spelling.
- Include the injected runtime classes badge, src, backlink, btn, and md-img in classVocabulary with owner css.
- layoutBlueprints must define the root class, DOM regions, hierarchy, and composition for EVERY layout in the placeholder contract. Only shell owns global chrome.
- Every layoutBlueprint must expose one rootClass from classVocabulary; downstream validation requires that exact class on the fragment's first element.
- tokens.typography must name EXACT font families that exist on fonts.google.com — one distinctive display face plus one refined body face, loadable together via a single @import. Typography is the strongest identity carrier: NEVER use Impact, Arial, Helvetica, Times, Verdana, or system-ui as identity fonts, and NEVER the site's default trio (Fraunces, Archivo, IBM Plex Mono). Different briefs must land on different families — treat a font pairing another theme could plausibly pick as a failure.
- Mobile is the base architecture; expansion uses min-width breakpoints.
- Do not design dialog, popover, drawer, or hidden-menu navigation. Navigation stays visible, wraps cleanly on mobile, and expands at min-width breakpoints.
- The home blueprint must apply exactly one named hero class that the stylesheet will give background-image: url(assets/hero.jpg).
- The selected composition must contain one justified visual risk that makes it impossible to mistake for an unrelated prompt, while keeping the actual portfolio content legible.

Return exactly the DIRECTOR_SCHEMA JSON object.`, DIRECTOR_SCHEMA, 32768, 8192, (process.env.DEFAULT_MODEL || 'gemini-3.1-pro'), false);

  const planObj = extractJson(rawDirector);
  const plan = planObj.plan || 'No plan provided.';
  const styleSpec = JSON.stringify({
    name: planObj.name,
    accent: planObj.accent,
    signatureGesture: planObj.signatureGesture,
    mobileStrategy: planObj.mobileStrategy,
    imageTreatment: planObj.imageTreatment,
    tokens: planObj.tokens,
    classVocabulary: planObj.classVocabulary,
    layoutBlueprints: planObj.layoutBlueprints,
  }, null, 2);
  const requiredLayoutClasses = Object.fromEntries(
    Object.entries(planObj.layoutBlueprints || {})
      .map(([key, blueprint]) => [key, blueprint?.rootClass])
      .filter(([, rootClass]) => typeof rootClass === 'string' && rootClass.trim())
  );
  let payload = {
    name: planObj.name,
    accent: planObj.accent,
    designSpec: planObj.designSpec,
    layouts: {},
  };

  // Four generated assets per design: hero, brand logo, favicon, and a
  // theme-styled portrait (style transfer over the real photo so likeness is
  // preserved). Each falls back safely: portrait → the untouched source photo;
  // logo/favicon failures surface in the asset audit.
  console.log(`[2/3] Generating Images (hero, logo, favicon, portrait) in background…`);
  const logoPrompt = planObj.image_prompts?.logo
    || `A flat, minimal personal brand wordmark for "Greg Iteen" fitting this brief: ${prompt}. No tagline, no photo, no clutter.`;
  const portraitStyle = planObj.image_prompts?.portrait_style
    || `Re-render this portrait photograph to match this design brief: ${prompt}. Keep the subject's face and likeness clearly recognizable; change only the treatment, palette, and grain.`;
  // Logo/favicon are image-to-image RESTYLES of the verified marks: the model
  // recolors and retextures existing correct letterforms instead of inventing
  // type (which produced garbled "GH" marks that failed the audit). Every
  // asset has a with-fallback wrapper so a failed generation degrades to a
  // verified original instead of sinking the build.
  const withFallback = (promise, fallbackSource, targetPath) => promise
    .then(async (ok) => { if (!ok) await copyFile(fallbackSource, targetPath); return ok; })
    .catch(async () => { await copyFile(fallbackSource, targetPath); return false; });
  const imagePromise = GOOGLE_API_KEY
    ? (async () => {
        const p1 = withFallback(generateImage(`Subject: A visually explicit, recognizable editorial interpretation of the user's exact brief: "${prompt}".\nContext: Wide hero artwork for a premium portfolio website; the requested subject must be clearly present, not reduced to an abstract palette or texture.\nStyle: ${planObj.image_prompts?.hero || planObj.imageTreatment || 'High-end editorial art direction'}\n\nCRITICAL CONSTRAINTS: Do not include text, watermarks, signatures, logos, interface overlays, or nonsensical symbols. Leave usable contrast for real page content.`, heroPath, null, IMAGE_MODEL), heroFallback, heroPath);
        const p2 = withFallback(generateImage(`Subject: Editorial portrait photograph of the supplied human, surrounded by a visually recognizable interpretation of the exact brief: "${prompt}".\nContext: Portfolio bio picture. Keep the person's face and body credible while incorporating the requested subject into the environment, backdrop, lighting, wardrobe detail, or surrounding scene.\nStyle: ${portraitStyle}\n\nHARD CONSTRAINT: this is the same person — identical face and likeness. Never transform the person into the requested animal, object, or character. Do not include text, distortion, extra limbs, or low-quality artifacts.`, portraitPath, portraitSource, IMAGE_MODEL), portraitSource, portraitPath);

        const brandKitPath = logoPath.replace('logo.png', 'brandkit.png');
        const kitSuccess = await generateImage(`Subject: A flat, 2D digital graphic on a perfectly solid #FFFFFF white background. It must contain TWO completely separate designs on the same canvas: a Logo and a Favicon.\nContext: Digital asset.\nStyle: THE THEME IS "${prompt}". EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. Pick a primary and accent color that perfectly match the "${prompt}" theme. Design it like a world-class agency. NO 2008 DESIGNS. NO BASIC SHIT.\n\nCRITICAL LAYOUT INSTRUCTION: You must draw TWO separate items:\n1. THE LOGO: A highly creative graphic emblem (fitting the "${prompt}" theme) placed next to the exact words "GREG ITEEN". Do NOT put the letters "GI" inside this graphic emblem.\n2. THE FAVICON: A completely separate, standalone square icon spelling exactly "GI".\nDO NOT combine the Favicon text into the Logo's graphic emblem. Keep them distinct.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. NO CLIP-ART. NO GENERIC AI SHAPES. The background MUST be perfectly solid #FFFFFF white.`, brandKitPath, null, IMAGE_MODEL_LITE).catch(() => false);

        const p3 = withFallback(generateImage(`Subject: A flat, 2D digital graphic on a perfectly solid #FFFFFF white background. It is a single logo extracted from the provided Brand Kit image in 1200x630 size.\nContext: Digital asset.\nStyle: EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. Extract the main logo wordmark ("GREG ITEEN") ALONG WITH its integrated graphic emblem or icon. The text "GREG ITEEN" and the thematic graphic elements must remain together as one unified logo. Do not isolate the text. MATCH THE AESTHETIC OF THE BASE IMAGE PERFECTLY.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. The background MUST be perfectly solid #FFFFFF white.`, logoPath, kitSuccess ? brandKitPath : logoSource), logoSource, logoPath);
        const p4 = withFallback(generateImage(`Subject: A flat, 2D digital graphic on a perfectly solid #FFFFFF white background. It is a single square favicon extracted from the provided Brand Kit image in 512x512 size.\nContext: Digital asset.\nStyle: EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. Extract the favicon typography ("GI") ALONG WITH its integrated graphic emblem or icon. The text "GI" and the thematic graphic elements must remain together as one unified icon. Do not isolate the text. MATCH THE AESTHETIC OF THE BASE IMAGE PERFECTLY.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. The background MUST be perfectly solid #FFFFFF white.`, faviconPath, kitSuccess ? brandKitPath : faviconSource), faviconSource, faviconPath);

        await Promise.allSettled([p1, p2, p3, p4]);
        try {
          const sharp = (await import('sharp')).default;
          async function dropWhite(img) {
            try {
              const { data, info } = await sharp(img).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const minVal = Math.min(r, g, b);
                const A = 255 - minVal;
                if (A === 0) {
                  data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 0;
                } else {
                  const a = A / 255;
                  data[i] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - a)) / a)));
                  data[i+1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - a)) / a)));
                  data[i+2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - a)) / a)));
                  data[i+3] = A;
                }
              }
              await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(img + '.tmp');
              import('node:fs/promises').then(fs => {
                fs.copyFile(img + '.tmp', img).then(() => fs.rm(img + '.tmp'));
              });
            } catch (e) {
              console.warn('Transparency drop failed for', img, e.message);
            }
          }
          await dropWhite(brandKitPath);
          await dropWhite(logoPath);
          await dropWhite(faviconPath);
        } catch (err) {
          console.warn('Sharp module failed to load', err.message);
        }
        return true;
      })()
    : (console.warn('  ⚠ GOOGLE_API_KEY not set — skipping images'), Promise.resolve([]));
  // Images continue in parallel while one CSS owner and the layout-family
  // workers execute the locked constitution.
  const layoutKeys = Object.keys(LAYOUT_SPECS);
  const runSpecialistFanOut = async () => {
  console.log(`  → Fan-out: 1 complete stylesheet + ${layoutKeys.length} bounded layouts = ${layoutKeys.length + 1} workers in parallel`);

  const customExemplars = (planObj.selected_mechanics || [])
    .map(m => CSS_MECHANICS[m])
    .filter(Boolean)
    .join('\n\n');

  const cssJob = callAgent(`${baseContext}

You are the sole CSS owner. Implement the ENTIRE stylesheet for this locked Design Constitution:
${styleSpec}

RULES:
- The stylesheet MUST BEGIN with exactly one @import url("https://fonts.googleapis.com/css2?family=...&display=swap") that loads the constitution's exact typography families (with the weights/axes you use), then expose them as custom properties (e.g. --font-display, --font-body) consumed everywhere. The build pipeline hoists @import to a spec-valid position, so it WILL load — never fall back to Impact/Arial/system-ui/default-site fonts as the identity face.
- Define every class in classVocabulary within one coherent cascade. Do not invent selectors outside the constitution except pseudo states, keyframes, and required runtime states.
- Organize the stylesheet: tokens; reset/base content; shell/layout; reusable components; page families; motion; min-width responsive expansion.
- The home hero visibly uses background-image: url(assets/hero.jpg). Explicitly style .badge, .src, .backlink, .btn, .md-img, .gi-reveal, and .gi-reveal.gi-in.
- Mobile 390px is the base. Never use max-width media queries for core structure. Prevent overflow with min-width:0 and minmax(0,1fr) where relevant.
- Typography and spatial rhythm carry the identity. Implement the director's signature gesture as one orchestrated moment, not scattered effects.
- Keep text legible when generated imagery is visually busy.
- Every container with a background-image MUST also declare a background-color of similar darkness — text must stay readable before the image finishes downloading.
- pointer-events: none belongs ONLY on empty decorative overlay elements (grain, vignette). Never apply such a class to any container that holds content or navigation — pointer-events inherits and kills every link inside.

SELECTED MECHANIC REFERENCES (quality only; do not copy blindly):
${customExemplars}

OUTPUT: exactly one JSON object: { "css": "the complete stylesheet" }`, CSS_SECTION_SCHEMA, 32768, 8192, (process.env.DEFAULT_MODEL || 'gemini-3.1-pro'), false)
    .then((raw) => ({ kind: 'css', css: extractJson(raw).css }))
    .catch((error) => ({ kind: 'css', error: String(error) }));

  const layoutJobs = layoutKeys.map((key) => {
    const spec = LAYOUT_SPECS[key];
    const required = spec && spec.required.length ? spec.required.join(', ') : '(none)';
    const optional = spec && spec.optional?.length ? spec.optional.join(', ') : '';
    const prompt = `${baseContext}

You are a layout specialist. Generate ONLY the "${key}" layout, composed from the shared design system's class vocabulary.

SHARED DESIGN CONTRACT (use ONLY these class names — the CSS for them is being written in parallel):
${styleSpec}

This "${key}" layout MUST contain these exact placeholder(s): ${required}${optional ? `\nOptional placeholder(s): ${optional}` : ''}

RULES:
- Use ONLY {{PLACEHOLDER}} variables — NEVER hardcode text, titles, or copy.
- Compose using ONLY the contract's class names; do not invent a new visual language.
- Only the "shell" layout may own page-wide wrappers, header, navigation, sidebar, or footer. Every other layout is a single content fragment injected inside shell's {{CONTENT}}; never repeat global chrome.
- Do not use inline style attributes. Put all visual behavior in the shared CSS classes so mobile behavior and repairs remain reliable.
- INNOVATE AND DIFFERENTIATE: The exemplars below show the QUALITY BAR, but you MUST invent completely unique, bespoke HTML architecture for this specific prompt. DO NOT COPY THE EXEMPLARS EXACTLY. Make it innovative and inspired.
${key === 'shell'
  ? `- The element that holds {{CONTENT}} must be a plain full-width flow container: never give it a multi-column display:grid/flex that would squeeze injected fragments into one track, and never rely on injected children declaring grid-column spans — they won't.`
  : `- This fragment is injected INSIDE the shell's content container. NEVER include <main>, <header>, <footer>, the theme's root/page wrapper class, or any min-height:100vh container — the shell already provides all of those. Start directly at the section level.`}
${(key === 'projects_index' || key === 'designs_index' || key === 'home')
  ? `- ${required} expands to a SERIES of item fragments that already carry their own item classes (the *_item layouts style each entry). Wrap the placeholder in a neutral LIST CONTAINER class only — never in the item classes themselves, or every item gets double-wrapped with doubled borders and broken grids.`
  : ''}

HIGH-END LAYOUT EXEMPLARS (Study these to understand the quality bar):
${LAYOUT_EXEMPLARS}

OUTPUT: exactly one JSON object: { "html": "…the ${key} layout HTML…" }`;
    return callAgent(prompt, ONE_LAYOUT_SCHEMA, 16384, 4096, (process.env.DEFAULT_MODEL || 'gemini-3.1-pro'), false)
      .then((raw) => ({ kind: 'layout', key, html: extractJson(raw).html }))
      .catch((error) => ({ kind: 'layout', key, error: String(error) }));
  });

  const results = await Promise.all([cssJob, ...layoutJobs]);

  let builtLayouts = 0;
  payload.layouts = {};
  for (const r of results) {
    if (r.error) { console.warn(`  ⚠ ${r.kind} ${r.key} failed (${r.error}) — skipped`); continue; }
    if (r.kind === 'css') { if (typeof r.css === 'string' && r.css.trim()) payload.css = r.css; }
    else if (typeof r.html === 'string' && r.html.trim()) { payload.layouts[r.key] = r.html; builtLayouts++; }
  }
  payload = enforceBrandAssetContract(payload);
  console.log(`  → Built ${payload.css ? '1/1' : '0/1'} complete stylesheet + ${builtLayouts}/${layoutKeys.length} layouts in parallel`);
  };
  await runSpecialistFanOut();
  await imagePromise;

  // ── Release gate: validate every template, then have a fresh model inspect
  // the complete CSS + every actual HTML layout before any public artifact is
  // written. The old post-generation improver only saw layout *names* in its
  // score prompt and ran after the first build had already been served.
  const validateForRelease = (candidate) => {
    let verdict = validateThemePayload(candidate, {
      strict: true,
      requireAllLayouts: true,
      requireHero: true,
      requireClassBindings: true,
      requireFontImport: true,
      requireBrandLogo: true,
      requiredLayoutClasses,
    });
    if (!verdict.theme) {
      console.warn(`[Structural Repair] Release gate rejected theme: ${verdict.errors.join('; ')} — applying last-resort fallback templates.`);
      for (const [key, spec] of Object.entries(LAYOUT_SPECS)) {
        if (typeof candidate.layouts[key] !== 'string') candidate.layouts[key] = '';
        
        const hasSyntaxError = verdict.errors.some(e => e.includes(`layout "${key}" HTML`) || e.includes(`missing required layout "${key}"`));
        if (hasSyntaxError || !candidate.layouts[key].trim()) {
           const rootClass = requiredLayoutClasses[key] ? `class="${requiredLayoutClasses[key]}"` : '';
           candidate.layouts[key] = `<div ${rootClass}>\n  ` + spec.required.join('\n  ') + `\n</div>`;
        } else {
          const missing = spec.required.filter((ph) => !candidate.layouts[key].includes(ph));
          if (missing.length > 0) {
            candidate.layouts[key] += '\n<div class="fallback-missing-tags" style="margin-top: 2rem;">' + missing.join('\n') + '</div>';
          }
        }
      }
      
      verdict = validateThemePayload(candidate, {
        strict: true,
        requireAllLayouts: true,
        requireHero: true,
        requireClassBindings: true,
        requireFontImport: true,
      requireBrandLogo: true,
        requiredLayoutClasses,
      });
      
    }
    for (const warning of verdict.warnings) console.warn(`  ⚠ ${warning}`);
    return requireValidTheme(verdict, 'Structural release gate');
  };

  // The structural validator is deliberately stricter than an LLM: it catches
  // unbalanced markup, missing placeholders, and visible invented copy before
  // any source document is written. Keep repairing the same candidate until
  // the deterministic gate accepts it; validation rejection never starts a
  // new design attempt.
  const repairStructuralViolations = async (candidate) => {
    // Keep the source contract absolute: a layout may carry data placeholders,
    // but model-authored words are never allowed to ship. Preserve placeholders
    // while removing any literal text node before each validation pass.
    const stripHardcodedTextNodes = (html) => String(html).replace(/>([^<]*)</g, (whole, text) => {
      const placeholders = text.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
      const remainder = text.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
      return /[A-Za-z0-9]/.test(remainder) ? `>${placeholders.join('')}<` : whole;
    });

    for (let pass = 1; ; pass++) {
      for (const [key, html] of Object.entries(candidate.layouts || {})) {
        if (typeof html === 'string') candidate.layouts[key] = stripHardcodedTextNodes(html);
      }
      const verdict = validateThemePayload(candidate, {
        strict: true,
        requireAllLayouts: true,
        requireHero: true,
        requireClassBindings: true,
        requireFontImport: true,
        requireBrandLogo: true,
        requiredLayoutClasses,
      });
      if (verdict.theme) return;
      const issuesByTarget = new Map();
      for (const error of verdict.errors) {
        const layoutMatch = error.match(/^layout "([a-z_]+)"/);
        const target = layoutMatch?.[1]
          || (/^("css"|stylesheet)/.test(error) ? 'css' : null);
        if (target && (target === 'css' || LAYOUT_SPECS[target])) {
          issuesByTarget.set(target, [...(issuesByTarget.get(target) || []), error]);
        }
      }
      if (!issuesByTarget.size) {
        issuesByTarget.set('css', verdict.errors);
      }
      
      try {
        const pitfallsPath = join(__dirname, 'lib', 'pitfalls.json');
        const currentPitfalls = await readFile(pitfallsPath, 'utf8');
        const LEARNING_SCHEMA = {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              symptom: { type: "STRING" },
              detector: { type: "STRING" },
              repair: { type: "STRING" }
            },
            required: ["id", "symptom", "detector", "repair"]
          }
        };
        const rawLearn = await deepSeekText(`You are a meta-learning system managing the global pitfalls database for a UI generator.\n\nCURRENT PITFALLS:\n${currentPitfalls}\n\nThe generator just made the following HTML/CSS structural mistakes (missing placeholders, bad tags):\n${verdict.errors.join('\n')}\n\nREWRITE the entire pitfalls array. Incorporate a new rule for these failures, or modify an existing rule if it overlaps. Consolidate and rewrite the entire array to keep it concise, comprehensive, and perfectly accurate. Output the full JSON array.`, LEARNING_SCHEMA, 16384, 'structural learning');
        const rewrittenPitfalls = JSON.parse(rawLearn);
        await writeFile(pitfallsPath, JSON.stringify(rewrittenPitfalls, null, 2), 'utf8');
        console.warn(`[Learning] Completely rewrote pitfalls.json based on structural mistakes (pass ${pass}). Now contains ${rewrittenPitfalls.length} rules.`);
      } catch (e) {
        console.warn(`[Learning Error] Failed to write to pitfalls.json:`, e);
      }

      console.log(`  → Structural validation pass ${pass} found ${issuesByTarget.size} repair target(s); repairing the same candidate…`);
      const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
      const critique = issues.map((issue) => `- ${issue}`).join('\n');
      if (target === 'css') {
        const raw = await callAgent(`${baseContext}

You are repairing ONLY the complete stylesheet below. Correct the structural issues without changing the approved design contract or adding hardcoded copy.

VALIDATOR FINDINGS:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE CSS:
${candidate.css}

OUTPUT: exactly one JSON object: { "css": "complete repaired CSS" }`, CSS_SECTION_SCHEMA, 32768, 4096, (process.env.DEFAULT_MODEL || 'gemini-3.5-flash'));
        return { target, value: extractJson(raw).css };
      }
      const spec = LAYOUT_SPECS[target];
      const raw = await callAgent(`${baseContext}

You are repairing ONLY the "${target}" HTML fragment after structural validation. Return a balanced fragment, never a full document. Use one root <section> and at most two nested element levels; every non-void opening tag must have its own closing tag. Preserve these exact required placeholder(s): ${spec.required.join(', ')}. Every visible word must be a listed {{PLACEHOLDER}}; do not invent labels, headings, button text, or copy. Do not use scripts.

VALIDATOR FINDINGS:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT "${target}" HTML:
${candidate.layouts[target] || '(missing)'}

OUTPUT: exactly one JSON object: { "html": "complete repaired ${target} fragment" }`, ONE_LAYOUT_SCHEMA, 16384, 4096, (process.env.DEFAULT_MODEL || 'gemini-3.5-flash'));
      return { target, value: extractJson(raw).html };
      }));

      for (const repair of repairs) {
        if (typeof repair.value !== 'string' || !repair.value.trim()) {
          throw new Error(`Structural repair for "${repair.target}" returned no content`);
        }
        if (repair.target === 'css') candidate.css = repair.value;
        else candidate.layouts[repair.target] = repair.value;
      }
    }
  };

  const auditForRelease = async (candidate, label) => {
    const source = JSON.stringify({ css: candidate.css, layouts: candidate.layouts });
    const raw = await callAgent(`${baseContext}

You are the final RELEASE REVIEWER. Inspect the complete source package below: it contains the ENTIRE stylesheet and EVERY generated HTML layout, not a summary. Read all of it before deciding.

Approve only if it is an agency-quality, coherent, responsive portfolio skin with no likely visible breakage. A score below 8 MUST be rejected. Reject for any structural, visual, responsive, placeholder, asset, hierarchy, accessibility, or hardcoded-copy issue that could ship to a visitor.

"Competent but basic" is a FAILURE, not a pass. Reject any design that reads as a default template: a plain centered column of stacked sections, uniform card grids with no compositional idea, default-looking type scale, no distinctive layout gesture (asymmetry, overlap, oversized display type, unusual grid, editorial rhythm). Judge it against real agency portfolio sites — if this would not impress a design-literate client, score it below 8 and name what is generic.

When rejecting, list only surgical blocking issues. Each target MUST be exactly "css" or one of: ${Object.keys(LAYOUT_SPECS).join(', ')}. Do not invent targets and do not rewrite source in this response.

DESIGN PLAN:
${plan}

SHARED DESIGN CONTRACT:
${styleSpec}

FULL SOURCE PACKAGE:
${source}

OUTPUT: exactly one JSON object: { "approved": true, "score": 8, "blocking_issues": [] }`, RELEASE_REVIEW_SCHEMA, 32768, 8192, (process.env.DEFAULT_MODEL || 'gemini-3.1-pro'), false);
    const audit = extractJson(raw);
    if (!Array.isArray(audit.blocking_issues)) audit.blocking_issues = [];
    console.log(`  → Release review (${label}): ${audit.score}/10 — ${audit.approved ? 'approved' : 'repair required'}`);
    for (const issue of audit.blocking_issues) {
      if (typeof issue?.target === 'string' && typeof issue?.issue === 'string') {
        console.log(`    • ${issue.target}: ${issue.issue}`);
      }
    }
    return audit;
  };

  await repairStructuralViolations(payload);
  let theme = validateForRelease(payload);

  const auditVisualAssets = async () => {
    const visualAuditParts = [{
      text: `You are the final visual asset release inspector for a premium creative-technologist portfolio. Review the four supplied assets:
- hero: must be a text-free, wide atmospheric visual. Reject watermarks, garbled text, UI mockups, checkerboard/transparency patterns, broken anatomy, low-res artifacts.
- portrait: a theme-styled editorial portrait. It may be stylized, but must read as a credible, undistorted human portrait — reject melted features, extra limbs, or uncanny artifacts.
- logo: a flat brand mark for "Greg Iteen" or "GI". Its text MUST be legible and correctly spelled; reject garbled letterforms, watermarks, photorealism, or a mark that reads as clip-art.
- favicon: a single bold glyph readable at small size; reject fine detail, multiple words, or mush.
Be strict: when uncertain, reject and name the asset in the issue text (e.g. "logo: ...").
Inspect all four assets completely and list EVERY rejection in one response; do not stop after finding the first problem.

OUTPUT: exactly one JSON object: { "approved": true, "issues": [] }`,
    }];
    for (const [label, imagePath, mimeType, required] of [
      ['hero', heroPath, 'image/jpeg', true],
      ['portrait', portraitPath, 'image/jpeg', true],
      ['logo', logoPath, 'image/png', true],
      ['favicon', faviconPath, 'image/png', true],
    ]) {
      const data = await readFile(imagePath).catch(() => null);
      if (!data) {
        if (required) throw new Error(`Release gate rejected theme: required ${label} image was not generated`);
        continue;
      }
      visualAuditParts.push({ text: `Image: ${label}` }, { inlineData: { mimeType, data: data.toString('base64') } });
    }
    return extractJson(await openRouterVision(
      visualAuditParts,
      VISUAL_ASSET_AUDIT_SCHEMA,
      'asset review',
    ));
  };

  // Asset flow — wait for the generated images, then keep repairing rejected
  // assets on this candidate. Started here so it runs CONCURRENTLY with the first
  // review-board pass below instead of adding a serial vision round-trip.
  const IMAGE_LABELS = ['hero', 'logo', 'favicon', 'portrait'];
  const assetFlow = (async () => {
    const imageResults = await imagePromise;
    if (Array.isArray(imageResults)) {
      for (const [i, r] of imageResults.entries()) {
        if (r.status === 'rejected') console.warn(`  ⚠ ${IMAGE_LABELS[i] || i} failed: ${r.reason?.message}`);
      }
    }
    let visualAudit = await auditVisualAssets();
    for (let correctionRound = 1; !visualAudit.approved; correctionRound++) {
      const issues = (visualAudit.issues || []).join('; ');
      console.warn(`  ⚠ Visual asset review rejected (correction ${correctionRound}): ${issues}`);
      const named = IMAGE_LABELS.filter((l) => issues.toLowerCase().includes(l));
      if (correctionRound % 3 === 0) {
        console.warn('  → Restoring verified brand marks before the next same-candidate asset review.');
        if (!named.length || named.includes('logo')) await copyFile(logoSource, logoPath);
        if (!named.length || named.includes('favicon')) await copyFile(faviconSource, faviconPath);
      }
      const regen = named.length ? named : ['hero'];
      await Promise.allSettled(regen.map((asset) => {
        if (asset === 'hero') return withFallback(generateImage(`Subject: A visually explicit, recognizable editorial interpretation of the exact brief: "${prompt}".\nContext: Wide hero artwork for a premium portfolio website.\nStyle: ${planObj.image_prompts?.hero || planObj.imageTreatment || prompt}\n\nCRITICAL CORRECTIVE PASS: The Review Board rejected the previous generation for this exact reason: "${issues}". Fix it while keeping the requested subject clearly visible. Do not include text, watermarks, signatures, logos, interface overlays, or floating marks.`, heroPath, null, IMAGE_MODEL), heroFallback, heroPath);
        if (asset === 'logo') return withFallback(generateImage(`Subject: A flat, professional brand wordmark.\nContext: Flat logo design centered on a solid background matching the theme shell color.\nStyle: ${logoPrompt}\n\nCRITICAL CORRECTIVE PASS: The Review Board rejected the previous generation for this exact reason: "${issues}". You MUST specifically address and fix this failure. The wordmark must clearly read exactly "GI" with crisp, legible typography. Do not add any extra words, mockups, or photographs.`, logoPath), logoSource, logoPath);
        if (asset === 'favicon') return withFallback(generateImage(`Subject: A single square app-icon glyph.\nContext: Favicon design, flat, perfectly centered, filling the square.\nStyle: ${logoPrompt}\n\nCRITICAL CORRECTIVE PASS: The Review Board rejected the previous generation for this exact reason: "${issues}". You MUST specifically address and fix this failure. The icon must clearly read exactly "GI" with perfect legibility. Do not add any extra words, mockups, or complex details that won't scale.`, faviconPath), faviconSource, faviconPath);
        return withFallback(generateImage(`Subject: Corrected editorial portrait of the supplied human with a recognizable "${prompt}" environment.\nStyle: ${portraitStyle}\n\nCRITICAL CORRECTIVE PASS: Fix this exact rejection: "${issues}". Preserve the person's face and likeness; correct all background anatomy and artifacts. Never transform the person into the requested subject.`, portraitPath, portraitSource, IMAGE_MODEL), portraitSource, portraitPath);
      }));
      visualAudit = await auditVisualAssets();
    }
    requireApprovedVisualAudit(visualAudit);
    console.log('  → Visual asset release review: approved (hero, logo, favicon, portrait)');
  })();
  assetFlow.catch(() => {}); // observed in the review board's Promise.all

  // ── Phase 3: Save nodes ──
  console.log(`[3/5] Saving DESIGN.md into designs/${styleName}/…`);

  let designBody = `${payload.designSpec || `Theme: ${theme.name}\nStyle: ${prompt}\nAccent: ${theme.accent}`}

## Locked Design Constitution

\`\`\`json
${styleSpec}
\`\`\``;

  // Re-runnable: the rendered gate below rewrites DESIGN.md after each repair.
  const writeDesignMd = async (t) => {
    const blocks = Object.entries({ css: t.css, ...Object.fromEntries(Object.entries(t.layouts).map(([k,v]) => [`layout:${k}`, v])) })
      .filter(([, content]) => typeof content === 'string' && content.trim())
      .map(([name, content]) => `## section:${name}\n\n\`\`\`${name === 'css' ? 'css' : 'html'}\n${content.replace(/```/g, '')}\n\`\`\``)
      .join('\n\n');

    const designMd = `---
name: ${JSON.stringify(t.name)}
accent: ${JSON.stringify(t.accent)}
style: ${JSON.stringify(prompt)}
constitution_version: "2"
token_colors: ${JSON.stringify(String(planObj.tokens?.colors || ''))}
token_typography: ${JSON.stringify(String(planObj.tokens?.typography || ''))}
token_spacing: ${JSON.stringify(String(planObj.tokens?.spacing || ''))}
signature_gesture: ${JSON.stringify(String(planObj.signatureGesture || ''))}
---

# Design System

${designBody.trim()}

${blocks}
`;
    await writeFile(join(designDir, 'DESIGN.md'), designMd, 'utf8');
  };
  await writeDesignMd(theme);

  // ── Phase 4: Build the isolated design layer ── This always runs (even under
  // THEME_DEFER_BUILD): the rendered gate must inspect real built pages. Only
  // the MAIN-site rebuild defers to serve.mjs's serialized build — this slug is
  // not yet registered as a skin, so no concurrent full build touches its
  // dist directory.
  console.log(`[4/5] Building isolated HTML…`);
  const buildDesignLayer = () => {
    const buildResult = spawnSync(process.execPath, [
      join(__dirname, 'build-site.mjs'),
      '--design', styleName,
      '--design-source', designDir,
      '--out-dir', reviewOutDir,
    ], { stdio: 'inherit' });
    if (buildResult.status !== 0) throw new Error(`build-site.mjs failed for ${styleName} (exit ${buildResult.status})`);
  };
  buildDesignLayer();

  // ── Phase 5: Review board ── Claude sees the rendered screenshots through
  // OpenRouter. DeepSeek V4 Pro receives Claude's concrete findings plus the
  // current source and repairs this exact candidate until it is approved.
  console.log(`[5/5] Review board: rendered review + same-candidate repair loop…`);
  const { renderAudit } = await import('./render-audit.mjs');
  const allowedTargets = new Set(['css', ...Object.keys(LAYOUT_SPECS)]);
  try {
    await repairUntilApproved(payload, {
      review: async (_candidate, pass) => {
        const label = pass === 1 ? 'initial' : `repair ${pass - 1}`;
        const [renderVerdict] = await Promise.all([
          renderAudit(styleName, { siteRoot: reviewSiteRoot, brief: prompt, designPlan: plan }),
          ...(pass === 1 ? [assetFlow] : []),
        ]);
        const renderState = renderedReviewState(renderVerdict);
        console.log(`  → Rendered review (${label}): ${renderState.score}/10 — ${renderState.approved ? 'approved' : 'repair required'} (${renderState.blocking.length} blocking, ${renderState.issues.length - renderState.blocking.length} minor)`);
        for (const issue of renderState.issues) {
          if (typeof issue?.target === 'string' && typeof issue?.issue === 'string') {
            console.log(`    • [${issue.severity || 'blocking'}] ${issue.target}: ${issue.issue}`);
          }
        }
        return { ...renderState, renderVerdict };
      },
      repair: async (candidate, renderState, pass) => {
        const repairIssues = renderState.blocking.length > 0
          ? renderState.blocking
          : renderState.issues;
        if (repairIssues.length > 0) {
        try {
          const pitfallsPath = join(__dirname, 'lib', 'pitfalls.json');
          const currentPitfalls = await readFile(pitfallsPath, 'utf8');
          const LEARNING_SCHEMA = {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                symptom: { type: "STRING" },
                detector: { type: "STRING" },
                repair: { type: "STRING" }
              },
              required: ["id", "symptom", "detector", "repair"]
            }
          };
          const rawLearn = await deepSeekText(`You are a meta-learning system managing the global pitfalls database for a UI generator.\n\nCURRENT PITFALLS:\n${currentPitfalls}\n\nThe generator just failed the review board with the following issues:\n${repairIssues.map((issue) => issue.issue).join('\n')}\n\nREWRITE the entire pitfalls array. Incorporate a new rule for these failures, or modify an existing rule if it overlaps. Consolidate and rewrite the entire array to keep it concise, comprehensive, and perfectly accurate. Output the full JSON array.`, LEARNING_SCHEMA, 16384, 'review learning');
          const rewrittenPitfalls = JSON.parse(rawLearn);
          await writeFile(pitfallsPath, JSON.stringify(rewrittenPitfalls, null, 2), 'utf8');
          console.warn(`[Learning] Completely rewrote pitfalls.json based on new failures. Now contains ${rewrittenPitfalls.length} rules.`);
        } catch (e) {
          console.warn(`[Learning Error] Failed to write to pitfalls.json:`, e);
        }
      }

        const issuesByTarget = new Map();
        for (const issue of repairIssues) {
        const target = typeof issue?.target === 'string' ? issue.target : '';
        const detail = typeof issue?.issue === 'string' ? issue.issue.trim() : '';
        if (allowedTargets.has(target) && detail) {
          issuesByTarget.set(target, [...(issuesByTarget.get(target) || []), detail]);
        }
      }
      if (!issuesByTarget.size) {
          issuesByTarget.set('css', [
            `The rendered result scored ${renderState.score}/10 and did not pass the release threshold. Improve prompt fidelity, distinctiveness, cohesion, hierarchy, and production polish while preserving the design contract.`,
          ]);
      }

        console.log(`  → DeepSeek V4 Pro repairing ${issuesByTarget.size} target(s) on the same candidate (pass ${pass})…`);
      const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
        const critique = issues.map((issue) => `- ${issue}`).join('\n');
        if (target === 'css') {
          // Append-only fix layer, never a rewrite: a full-stylesheet
          // regeneration by the repair model has been observed to REGRESS the
          // design (source score dropped 7 → 4 in one pass) while chasing two
          // issues. Override rules appended after the stylesheet can only
          // patch the named defects — the cascade gives them priority and the
          // rest of the design is untouchable.
          const raw = await deepSeekText(`${baseContext}

You are writing a CSS FIX LAYER after a release review board. Do NOT rewrite or re-emit the existing stylesheet. Output ONLY new override rules that will be APPENDED after it — use the same selectors (or more specific ones) and write only as many rules as the issues below require. Fix every issue; change nothing else.

REVIEW ISSUES:
${critique}

SHARED DESIGN CONTRACT (use its existing selectors; do not invent a second vocabulary):
${styleSpec}

CURRENT COMPLETE CSS:
${candidate.css}

OUTPUT: exactly one JSON object: { "css": "…ONLY the appended fix-layer override rules…" }`, CSS_SECTION_SCHEMA, 32768, 'CSS repair');
          return { target, value: extractJson(raw).css, mode: 'patch' };
        }
        const spec = LAYOUT_SPECS[target];
        const raw = await deepSeekText(`${baseContext}

You are repairing ONLY the "${target}" HTML layout after a release review board. Keep the approved visual language and preserve these exact required placeholder(s): ${spec.required.join(', ')}. Do not add hardcoded copy, document wrappers, or scripts.

REVIEW ISSUES:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE "${target}" HTML:
${candidate.layouts[target]}

OUTPUT: exactly one JSON object: { "html": "…complete repaired ${target} layout…" }`, ONE_LAYOUT_SCHEMA, 16384, `${target} repair`);
        return { target, value: extractJson(raw).html };
      }));

      for (const repair of repairs) {
        if (typeof repair.value !== 'string' || !repair.value.trim()) {
          throw new Error(`Review-board repair for "${repair.target}" returned no content`);
        }
        if (repair.target === 'css') {
          candidate.css = `${candidate.css}\n\n/* review-board fix layer (pass ${pass}) */\n${repair.value}`;
        } else {
          candidate.layouts[repair.target] = repair.value;
        }
      }
      },
      validate: async (candidate) => {
        await repairStructuralViolations(candidate);
        theme = validateForRelease(candidate);
      },
      afterRepair: async () => {
      await writeDesignMd(theme);
      buildDesignLayer();
      },
      isRetryableError: isRetryableOpenRouterError,
      onRetryableError: async (error, { pass, phase }) => {
        const delay = generationRetryDelay(pass);
        console.warn(`  ⚠ ${phase} provider failure on repair pass ${pass}; retaining the candidate and retrying in ${Math.ceil(delay / 1000)}s (${String(error).slice(0, 120)})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      },
      onRejectedRepair: async (error, { candidate, pass }) => {
        console.warn(`  ⚠ Repair pass ${pass} was invalid; rolled back to the prior candidate (${String(error).slice(0, 160)}).`);
        theme = validateForRelease(candidate);
        await writeDesignMd(theme);
        buildDesignLayer();
      },
    });
  } catch (err) {
    // Only unrecoverable infrastructure/configuration errors leave this loop.
    // Aesthetic and validation rejection always retain and repair the candidate.
    await rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
    throw err;
  }

  // Register the skin only now — the flipper and main site must never list a
  // design that has not passed the rendered gate.
  const skinMeta = {
    slug: `skin-${styleName}`,
    name: theme.name,
    title: `${theme.name} — Generated Skin`,
    description: `AI-generated skin: "${prompt}"`,
    timestamp: new Date().toISOString(),
    sandbox_entry: `designs/${styleName}/index.html`,
    x_kind: 'theme-skin',
    x_year: new Date().getFullYear(),
    x_preview: `/designs/${styleName}/assets/hero.jpg`,
    x_logo: `/designs/${styleName}/gi-logo-transparent-dark.png`,
    x_link: `/designs/${styleName}/index.html`
  };
  const specFm = Object.entries(skinMeta)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(t => `  - "${t}"`).join('\n')}`;
      return `${k}: ${JSON.stringify(String(v))}`;
    }).join('\n');

  const skinsDir = join(__dirname, '..', 'vault', 'pages', 'skins');
  await mkdir(skinsDir, { recursive: true });
  const vaultSkinMd = `---\ntype: page\n${specFm}\n---\n\n${designBody.trim()}\n`;
  const stagedSkinPath = join(stagingRoot, `${styleName}.md`);
  const finalSkinPath = join(skinsDir, `${styleName}.md`);
  await writeFile(stagedSkinPath, vaultSkinMd, 'utf8');

  // Promote the approved source, rendered site, and SSSS skin registration as
  // one rollback-capable transaction. Existing approved output remains intact
  // until every review gate has passed.
  const backups = {
    design: join(stagingRoot, 'previous-design'),
    output: join(stagingRoot, 'previous-output'),
    skin: join(stagingRoot, 'previous-skin.md'),
  };
  const movedExisting = { design: false, output: false, skin: false };
  const promoted = { design: false, output: false, skin: false };
  const moveExisting = async (from, to, key) => {
    try {
      await rename(from, to);
      movedExisting[key] = true;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  };

  await mkdir(dirname(finalDesignDir), { recursive: true });
  await mkdir(dirname(finalOutDir), { recursive: true });
  try {
    await moveExisting(finalDesignDir, backups.design, 'design');
    await moveExisting(finalOutDir, backups.output, 'output');
    await moveExisting(finalSkinPath, backups.skin, 'skin');

    await rename(designDir, finalDesignDir);
    promoted.design = true;
    await rename(reviewOutDir, finalOutDir);
    promoted.output = true;
    await rename(stagedSkinPath, finalSkinPath);
    promoted.skin = true;
  } catch (error) {
    if (promoted.skin) await rm(finalSkinPath, { force: true }).catch(() => {});
    if (promoted.output) await rm(finalOutDir, { recursive: true, force: true }).catch(() => {});
    if (promoted.design) await rm(finalDesignDir, { recursive: true, force: true }).catch(() => {});
    if (movedExisting.skin) await rename(backups.skin, finalSkinPath).catch(() => {});
    if (movedExisting.output) await rename(backups.output, finalOutDir).catch(() => {});
    if (movedExisting.design) await rename(backups.design, finalDesignDir).catch(() => {});
    throw error;
  }
  await rm(backups.skin, { force: true }).catch(() => {});
  await rm(backups.output, { recursive: true, force: true }).catch(() => {});
  await rm(backups.design, { recursive: true, force: true }).catch(() => {});
  await rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
  activeStagingRoot = null;

  // Main-site rebuild (registers the now-approved skin in the flipper).
  // serve.mjs owns the one serialized build when it launches this script — that
  // avoids the watcher / generator / improver race that previously caused
  // ENOTEMPTY failures while deleting dist/site/designs/* directories.
  if (process.env.THEME_DEFER_BUILD === '1') {
    console.log(`  → Main-site rebuild deferred to the serialized server rebuild.`);
  } else {
    console.log(`  → Rebuilding main site to register design…`);
    let mainBuildResult;
    for (let attempt = 1; attempt <= 2; attempt++) {
      mainBuildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
      if (mainBuildResult.status === 0) break;
      console.warn(`  ⚠ Main-site rebuild attempt ${attempt}/2 failed (exit ${mainBuildResult.status})`);
    }
    if (mainBuildResult.status !== 0) {
      // The approved standalone route was already promoted atomically. Report
      // registration drift without converting a valid published design into a
      // false generation failure; serve.mjs will run its serialized rebuild.
      console.warn(`  ⚠ Approved route is ready, but the main flipper rebuild still needs retrying.`);
    }
  }

  statSync(join(finalOutDir, 'index.html'));
  console.log(`  → Route ready: /designs/${styleName}/ and /designs/${styleName}/index.html`);
  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log(`[Success] "${theme.name}" → designs/${styleName} [${elapsed}s]`);
}

async function runGenerationAttempt() {
  const requestedAttempt = Number(process.env.GENERATION_ATTEMPT || 1);
  const attempt = Number.isFinite(requestedAttempt) && requestedAttempt > 0
    ? Math.floor(requestedAttempt)
    : 1;
  console.log(`[Attempt ${attempt}] Generating a reviewable design…`);
  try {
    await run();
  } catch (error) {
    if (activeStagingRoot) {
      await rm(activeStagingRoot, { recursive: true, force: true }).catch(() => {});
      activeStagingRoot = null;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Attempt ${attempt}] Failed: ${message}`);
    throw error;
  }
}

runGenerationAttempt().catch((error) => {
  console.error(`[Failed] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
