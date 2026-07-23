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
import { join, dirname, delimiter, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import {
  LAYOUT_SPECS,
  extractJson,
  validateThemePayload,
  serializeThemeDoc,
  enforceBrandAssetContract,
} from './lib/theme.mjs';
import {
  createIssueLedger,
  decideAtCap,
  generationRetryDelay,
  repairUntilApproved,
  renderedReviewState,
  requireApprovedVisualAudit,
  requireValidTheme,
  routeStructuralErrors,
} from './lib/theme-release.mjs';
import { scanLayoutSources, scanBuiltHtml } from './lib/artifact-gate.mjs';
import { buildTransparentMark } from './lib/logo-transparency.mjs';
import {
  createRunLessonRecorder,
  formatLessonPack,
  recallLessons,
  rememberLesson,
} from './lib/review-memory.mjs';
import {
  CLAUDE_VISION_MODEL,
  TEXT_MODEL,
  IMAGE_MODEL,
  IMAGE_MODEL_LITE,
  callOpenRouter,
  callOpenRouterImage,
  callFalImage,
  isRetryableOpenRouterError,
} from './lib/openrouter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const vaultDir = join(repoRoot, 'vault');
const assetsDir = join(repoRoot, 'assets');
let activeStagingRoot = null;

// Review-board bounds. The same-candidate repair loop once ran 21 passes /
// 3h38m on a single prompt; these keep any candidate's cost finite. At the
// cap, decideAtCap() promotes a clean-enough candidate (score >= threshold,
// no blocking issues) or fails it so the outer retry starts a FRESH one.
const MAX_REPAIR_PASSES = Math.max(1, Number(process.env.THEME_MAX_REPAIR_PASSES) || 5);
const PROMOTE_THRESHOLD = Math.min(10, Math.max(1, Number(process.env.THEME_PROMOTE_THRESHOLD) || 7));
const MAX_STRUCTURAL_PASSES = Math.max(1, Number(process.env.THEME_MAX_STRUCTURAL_PASSES) || 4);
// Review-board repairs are ANALYZE-AND-IMPROVE passes on a vision-capable
// model: the repairer receives the SAME screenshots the reviewer judged and
// must locate each defect in the pixels before fixing it. Text-only repairs
// were observed to stall for 19 passes on a defect any vision model could
// see. Generation fan-out, structural fixes, and distillation stay on the
// cheaper text model — repairs are bounded, so the premium model's cost is
// bounded too.
const REPAIR_MODEL = process.env.THEME_REPAIR_MODEL || 'anthropic/claude-fable-5';

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

// ─── OpenRouter model APIs ─────────────────────────────────────────────────

// Bounded even for genuinely transient errors: a sustained 429/5xx from the
// provider is indistinguishable from an outage, and an unbounded loop here
// would stall the run for hours exactly the way the 402 loop did.
const TEXT_REQUEST_ATTEMPTS = Math.max(1, Number(process.env.THEME_TEXT_ATTEMPTS) || 6);

async function generateText(userPrompt, schema = null, maxOutputTokens = 32768, label = 'design') {
  for (let attempt = 1; ; attempt++) {
    try {
      const raw = await callOpenRouter({
        model: TEXT_MODEL,
        prompt: userPrompt,
        schema,
        maxTokens: maxOutputTokens,
        // xhigh consumes about 95% of max_tokens as hidden reasoning, leaving
        // too little room for the actual CSS/layout JSON and taking many
        // minutes per specialist. Low still reasons while preserving output.
        reasoningEffort: 'low',
      });
      console.log(`  → OpenRouter ${TEXT_MODEL} ${label} response (${Math.round(raw.length / 1024)}KB)`);
      return raw;
    } catch (error) {
      if (!isRetryableOpenRouterError(error) || attempt >= TEXT_REQUEST_ATTEMPTS) throw error;
      const delay = generationRetryDelay(attempt);
      console.warn(`  ⚠ OpenRouter ${label} request failed transiently (attempt ${attempt}/${TEXT_REQUEST_ATTEMPTS}); retrying the same candidate in ${Math.ceil(delay / 1000)}s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function openRouterVision(parts, schema, label = 'visual review', model = CLAUDE_VISION_MODEL, maxTokens = 16384) {
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
        model,
        content,
        schema,
        maxTokens,
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

// Logo/favicon stay on the full OpenRouter image model — it renders small legible text
// far more reliably, and that's exactly the defect ("garbled letterforms",
// "GI" reading as "CII") that's been triggering repair passes and re-rolls.
// Hero/portrait have no text to render, so they get the ~4x faster Lite
// model (Nano Banana 2 Lite) with no observed quality tradeoff.
async function generateImage(imagePrompt, outputPath, baseImagePath = null, model = IMAGE_MODEL) {
  let imageUrl = null;
  if (baseImagePath) {
    // Fal accepts data URIs for image_url
    const mimeType = /\.png$/i.test(baseImagePath) ? 'image/png' : 'image/jpeg';
    const data = (await readFile(baseImagePath)).toString('base64');
    imageUrl = `data:${mimeType};base64,${data}`;
  }
  const filename = outputPath.split('/').pop() || '';
  const aspectRatio = filename.startsWith('hero') || filename.startsWith('logo') || filename.startsWith('brandkit')
    ? '16:9'
    : filename.startsWith('portrait') ? '3:4' : '1:1';
  const result = await callFalImage({
    model,
    prompt: imagePrompt,
    imageUrl,
    aspectRatio,
  });
  const sharp = (await import('sharp')).default;
  let output = result.buffer;
  if (/\.jpe?g$/i.test(extname(outputPath))) {
    output = await sharp(output).jpeg({ quality: 90 }).toBuffer();
  } else if (/\.png$/i.test(extname(outputPath))) {
    output = await sharp(output).png().toBuffer();
  }
  await writeFile(outputPath, output);
  console.log(`  → Fal ${model} saved ${outputPath} (${Math.round(output.length / 1024)}KB)`);
  return true;
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

  // pitfalls.json is now a READ-ONLY curated seed — the old meta-learning
  // rewrote it wholesale mid-run (20 rules → 0 in one observed run). Durable
  // lessons live in Total Recall; recalled here once and frozen for the run.
  const pitfallsPath = join(__dirname, 'lib', 'pitfalls.json');
  const pitfalls = JSON.parse(await readFile(pitfallsPath, 'utf8').catch(() => '[]'));
  const seedPitfallsDoc = pitfalls.map((rule) => [
    `- [${rule.id}] ${rule.symptom}`,
    `  Detector: ${rule.detector}`,
    `  Repair: ${rule.repair}`,
  ].join('\n')).join('\n');
  const recalledLessons = await recallLessons({
    query: `theme generation design pitfalls and repair lessons for brief: ${prompt}`,
    topK: 8,
  });
  if (recalledLessons.length) {
    console.log(`[Memory] Recalled ${recalledLessons.length} lesson(s) from Total Recall for this brief.`);
  }
  const pitfallsDoc = `${seedPitfallsDoc}${formatLessonPack(recalledLessons)}`;
  const lessonRecorder = createRunLessonRecorder({ runId: styleName, prompt });
  const reviewHistory = [];

  // Run-end distillation: one model call over the whole review history →
  // at most 3 transferable lessons into the project brain. Fires on success
  // AND terminal failure (failures teach the most). Best-effort only.
  const summarizeRunLessons = async (outcome) => {
    try {
      if (!reviewHistory.length) return;
      const SUMMARY_SCHEMA = {
        type: 'OBJECT',
        properties: { lessons: { type: 'ARRAY', items: { type: 'STRING' } } },
        required: ['lessons'],
      };
      const historyDoc = reviewHistory.map((entry) => [
        `pass ${entry.pass}: score ${entry.score}/10, ${entry.blocking} blocking, ${entry.resolved} resolved since prior pass`,
        ...entry.issues.map((text) => `  - ${text}`),
      ].join('\n')).join('\n');
      const raw = await generateText(`You are distilling durable lessons from one AI theme-generation run so FUTURE runs avoid repeating its failures.

BRIEF: "${prompt}"
OUTCOME: ${outcome}
REVIEW HISTORY:
${historyDoc}

Output at most 3 short, generalizable lessons (imperative, one sentence each) about generating or repairing portfolio theme designs. Only include lessons that transfer to OTHER briefs — skip anything tied to this brief's subject matter.

OUTPUT: exactly one JSON object: { "lessons": ["…"] }`, SUMMARY_SCHEMA, 2048, 'lesson distillation');
      const lessons = (extractJson(raw).lessons || []).slice(0, 3);
      for (const lesson of lessons) {
        await rememberLesson({
          category: 'pattern',
          content: `${lesson} (distilled from run "${styleName}", outcome: ${outcome})`,
          tags: ['generator', 'review-board', 'distilled'],
        });
      }
      if (lessons.length) console.log(`[Memory] Distilled ${lessons.length} lesson(s) into Total Recall.`);
    } catch (error) {
      console.warn(`[Memory] Lesson distillation skipped: ${String(error).slice(0, 120)}`);
    }
  };

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
      return await generateText(p, schema, maxOutputTokens, 'generation');
    } catch (err) {
      console.error(`OpenRouter ${TEXT_MODEL} call failed:`, String(err));
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

Return exactly the DIRECTOR_SCHEMA JSON object.`, DIRECTOR_SCHEMA, 32768);

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
  // `name` comes only from the Director call, and NOTHING downstream can add
  // it: the structural repair loop rewrites `css` and `layouts` and nothing
  // else, so a Director that omitted `name` produced a candidate that failed
  // `missing "name"` on every pass until the loop gave up — observed burning a
  // full hour of repair calls on a field no repair prompt can reach. Backfill
  // it deterministically, the same mechanical-safety-net pattern as
  // enforceBrandAssetContract: the model gets to name the theme, but never
  // gets to block the release by declining to.
  // The prompt guard above only enforces non-empty and <=500 chars, so a
  // punctuation-only prompt ("!!!") reaches here and must not throw.
  const fallbackName = prompt
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 60) || 'Custom Skin';
  const resolvedName = typeof planObj.name === 'string' && planObj.name.trim()
    ? planObj.name.trim().slice(0, 60)
    : fallbackName;
  if (resolvedName === fallbackName && planObj.name !== resolvedName) {
    console.warn(`  ⚠ Director returned no theme name; backfilling "${fallbackName}" from the prompt.`);
  }
  let payload = {
    name: resolvedName,
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
  const imagePromise = (async () => {
        const p1 = withFallback(generateImage(`Subject: A visually explicit, recognizable editorial interpretation of the user's exact brief: "${prompt}".\nContext: Wide hero artwork for a premium portfolio website; the requested subject must be clearly present, not reduced to an abstract palette or texture.\nStyle: ${planObj.image_prompts?.hero || planObj.imageTreatment || 'High-end editorial art direction'}\n\nCRITICAL CONSTRAINTS: Do not include text, watermarks, signatures, logos, interface overlays, or nonsensical symbols. Leave usable contrast for real page content.`, heroPath, null, IMAGE_MODEL), heroFallback, heroPath);
        const p2 = withFallback(generateImage(`Subject: Editorial portrait photograph of the supplied human, surrounded by a visually recognizable interpretation of the exact brief: "${prompt}".\nContext: Portfolio bio picture. Keep the person's face and body credible while incorporating the requested subject into the environment, backdrop, lighting, wardrobe detail, or surrounding scene.\nStyle: ${portraitStyle}\n\nHARD CONSTRAINT: this is the same person — identical face and likeness. Never transform the person into the requested animal, object, or character. Do not include text, distortion, extra limbs, or low-quality artifacts.`, portraitPath, portraitSource, IMAGE_MODEL), portraitSource, portraitPath);

        const brandKitPath = logoPath.replace('logo.png', 'brandkit.png');
        const kitSuccess = await generateImage(`Subject: A flat, 2D digital graphic on a perfectly solid #FFFFFF white background. It must contain TWO completely separate designs on the same canvas: a Logo and a Favicon.\nContext: Digital asset.\nStyle: THE THEME IS "${prompt}". EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. Pick a primary and accent color that perfectly match the "${prompt}" theme. Design it like a world-class agency. NO 2008 DESIGNS. NO BASIC SHIT.\n\nCRITICAL LAYOUT INSTRUCTION: You must draw TWO separate items:\n1. THE LOGO: A highly creative graphic emblem (fitting the "${prompt}" theme) placed next to the exact words "GREG ITEEN". Do NOT put the letters "GI" inside this graphic emblem.\n2. THE FAVICON: A completely separate, standalone square icon spelling exactly "GI".\nDO NOT combine the Favicon text into the Logo's graphic emblem. Keep them distinct.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. NO CLIP-ART. NO GENERIC AI SHAPES. The background MUST be perfectly solid #FFFFFF white.`, brandKitPath, null, IMAGE_MODEL_LITE).catch(() => false);

        // Brand marks need a real alpha channel, and Google's image models
        // cannot emit one — verified against the current docs: the whole Nano
        // Banana family (including 3.1 Flash Image, used here) returns flat RGB.
        // So each mark is rendered TWICE from the same brand kit, once over
        // white and once over black, and the true alpha is recovered by
        // difference matting: Cw - Cb = (1-a)*255. That solves anti-aliased
        // edges exactly, where colour keying can only guess at them.
        const markPrompt = (subject, size, extraction, background) => `Subject: A flat, 2D digital graphic on a perfectly solid ${background} background. It is ${subject} extracted from the provided Brand Kit image in ${size} size.\nContext: Digital asset.\nStyle: EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. ${extraction} MATCH THE AESTHETIC OF THE BASE IMAGE PERFECTLY.\n\nCOMPOSITION: Draw the mark large, filling the canvas edge to edge with only a small even margin. Do not centre a small mark in a large empty field.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. The background MUST be perfectly solid ${background}, edge to edge, with nothing else on it. Render the artwork itself IDENTICALLY regardless of the background colour.`;

        // Green, not white. Keying against white pits the key colour against
        // the artwork — logo art is frequently white, cream or pale, and that
        // collision is what erased the "GREG ITEEN" wordmark. Logo art is
        // essentially never pure green, so the key and the mark cannot be
        // confused, and the despill pass removes the rim it leaves behind.
        const KEY_BACKGROUND = '#00FF00 pure green (chroma key green screen)';

        const LOGO_SUBJECT = 'a single logo';
        // "Do not return the standalone GI monogram" is load-bearing: the SPACE
        // skin shipped with the FAVICON ("GI") sitting in the logo slot, which
        // is why its brand mark was a bare monogram instead of the wordmark.
        const LOGO_EXTRACTION = 'Extract the main logo wordmark ("GREG ITEEN") ALONG WITH its integrated graphic emblem or icon. The text "GREG ITEEN" and the thematic graphic elements must remain together as one unified logo. Do not isolate the text. DO NOT return the standalone square "GI" monogram — that is the separate favicon, not this asset. The words "GREG ITEEN" MUST be present and legible.';
        const FAVICON_SUBJECT = 'a single square favicon';
        const FAVICON_EXTRACTION = 'Extract the favicon typography ("GI") ALONG WITH its integrated graphic emblem or icon. The text "GI" and the thematic graphic elements must remain together as one unified icon. Do not isolate the text.';

        // Renders the white/black pair, mattes them, and writes the result.
        // Every step is awaited — the previous implementation fired the
        // write-back as a floating promise, so the transparent version raced
        // the pipeline and the opaque original sometimes won (SPACE shipped
        // with no alpha channel at all).
        const buildMark = async (targetPath, subject, size, extraction, sourceFallback) => {
          const whitePath = `${targetPath}.white.png`;
          const blackPath = `${targetPath}.black.png`;
          const base = kitSuccess ? brandKitPath : sourceFallback;
          const label = targetPath.split('/').pop();
          try {
            await generateImage(markPrompt(subject, size, extraction, KEY_BACKGROUND), whitePath, base);
            // Second render only when matting is explicitly enabled: the image
            // model redraws the mark at a different position/scale between
            // runs, so the pair usually cannot be subtracted (measured: a
            // double-exposure ghost). Keying the green screen is the reliable
            // path; matting stays available behind a flag.
            let blackOk = false;
            if (process.env.THEME_MARK_MATTE === '1') {
              try {
                await generateImage(markPrompt(subject, size, extraction, '#000000 black'), blackPath, base);
                blackOk = true;
              } catch (error) {
                console.warn(`  ⚠ ${label}: black-background render failed (${error.message}); keying instead.`);
              }
            }
            const sharp = (await import('sharp')).default;
            const result = await buildTransparentMark(
              await readFile(whitePath),
              blackOk ? await readFile(blackPath) : null,
              sharp,
            );
            if (!result.buffer) {
              console.warn(`  ⚠ ${label}: could not build a transparent mark (${result.reason}); keeping the verified brand asset.`);
              await copyFile(sourceFallback, targetPath);
              return false;
            }
            await writeFile(targetPath, result.buffer);
            console.log(`  → ${label}: transparent via ${result.method} (${Math.round(result.buffer.length / 1024)}KB)`);
            return true;
          } catch (error) {
            console.warn(`  ⚠ ${label}: generation failed (${error.message}); keeping the verified brand asset.`);
            await copyFile(sourceFallback, targetPath).catch(() => {});
            return false;
          } finally {
            await rm(whitePath, { force: true }).catch(() => {});
            await rm(blackPath, { force: true }).catch(() => {});
          }
        };

        const p3 = buildMark(logoPath, LOGO_SUBJECT, '1200x630', LOGO_EXTRACTION, logoSource);
        const p4 = buildMark(faviconPath, FAVICON_SUBJECT, '512x512', FAVICON_EXTRACTION, faviconSource);

        await Promise.allSettled([p1, p2, p3, p4]);
        return true;
      })();
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

OUTPUT: exactly one JSON object: { "css": "the complete stylesheet" }`, CSS_SECTION_SCHEMA, 32768)
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
    return callAgent(prompt, ONE_LAYOUT_SCHEMA, 16384)
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
      // Bounded like the review board: an unfixable structural defect must
      // fail this candidate (outer retry generates a fresh one), not spin the
      // repair model forever. The generator skill always documented this loop
      // as bounded; the code never actually was.
      if (pass > MAX_STRUCTURAL_PASSES) {
        throw new Error(`Structural repair did not converge after ${MAX_STRUCTURAL_PASSES} pass(es): ${verdict.errors.slice(0, 3).join('; ')}`);
      }
      const { byTarget: issuesByTarget, unrouted } = routeStructuralErrors(
        verdict.errors,
        Object.keys(LAYOUT_SPECS),
      );
      if (unrouted.length) {
        console.warn(`  ⚠ ${unrouted.length} structural error(s) have no natural repair target; sending to CSS: ${unrouted.join('; ').slice(0, 200)}`);
      }

      // Append-only learning: each structural failure class is recorded once
      // per run to Total Recall (fire-and-forget, deduped, capped). The old
      // destructive pitfalls.json rewrite lived here.
      for (const error of verdict.errors.slice(0, 3)) {
        lessonRecorder.record('anti-pattern', `Structural validation failure in generated theme: ${String(error).slice(0, 300)}`, ['structural']);
      }

      console.log(`  → Structural validation pass ${pass} found ${issuesByTarget.size} repair target(s); repairing the same candidate…`);
      const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
      const critique = issues.map((issue) => `- ${issue}`).join('\n');
      if (target === 'css') {
        const raw = await callAgent(`${baseContext}

You are repairing ONLY the complete stylesheet below. Correct the structural issues without changing the approved design contract or adding hardcoded copy.

A finding of the form 'layout "X" uses CSS class(es) with no matching selector: a, b, c' means THE STYLESHEET IS INCOMPLETE, not that the layout is wrong. Add a real, design-consistent rule for every one of those class names. Never respond by asking for classes to be removed from the layout — the layout is using the agreed class vocabulary and will not change.

VALIDATOR FINDINGS:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE CSS:
${candidate.css}

OUTPUT: exactly one JSON object: { "css": "complete repaired CSS" }`, CSS_SECTION_SCHEMA, 32768);
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

OUTPUT: exactly one JSON object: { "html": "complete repaired ${target} fragment" }`, ONE_LAYOUT_SCHEMA, 16384);
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

OUTPUT: exactly one JSON object: { "approved": true, "score": 8, "blocking_issues": [] }`, RELEASE_REVIEW_SCHEMA, 32768);
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
  // Built pages the mechanical gate scans, mapped to the layout slot a repair
  // should aim at (same pages the render audit screenshots).
  const GATE_PAGES = [
    ['index.html', 'home'],
    ['projects.html', 'projects_index'],
    ['designs.html', 'designs_index'],
    ['contact.html', 'page'],
  ];
  const issueLedger = createIssueLedger();
  let assetFlowAwaited = false;
  let noProgressPasses = 0;
  let priorReviewIssues = [];
  let capResult;
  try {
    capResult = await repairUntilApproved(payload, {
      maxPasses: MAX_REPAIR_PASSES,
      capDecider: (verdict) => decideAtCap(verdict, { threshold: PROMOTE_THRESHOLD }),
      review: async (candidate, pass) => {
        const label = pass === 1 ? 'initial' : `repair ${pass - 1}`;
        // Mechanical gate: deterministic scan for leaked template/JSON syntax
        // in the candidate's templates and the built pages. Costs nothing and
        // short-circuits the screenshot+vision spend when it hits.
        const gateIssues = [...scanLayoutSources(candidate.layouts || {})];
        for (const [file, target] of GATE_PAGES) {
          const html = await readFile(join(reviewOutDir, file), 'utf8').catch(() => '');
          gateIssues.push(...scanBuiltHtml(html, target, file));
        }
        if (gateIssues.length) {
          console.log(`  → Mechanical gate (${label}): ${gateIssues.length} artifact(s) found — skipping screenshot review this pass`);
          for (const issue of gateIssues) console.log(`    • [blocking] ${issue.target}: ${issue.issue}`);
          for (const issue of gateIssues.slice(0, 2)) {
            lessonRecorder.record('anti-pattern', `Layout specialist emitted template/JSON debris that the mechanical gate caught: ${issue.issue.slice(0, 240)}`, [`slot:${issue.target}`, 'mechanical-gate']);
          }
          return { approved: false, mechanical: true, score: 0, blocking: gateIssues, issues: gateIssues };
        }
        const [renderVerdict] = await Promise.all([
          renderAudit(styleName, {
            siteRoot: reviewSiteRoot,
            brief: prompt,
            designPlan: plan,
            priorIssues: priorReviewIssues,
          }),
          ...(assetFlowAwaited ? [] : [assetFlow]),
        ]);
        assetFlowAwaited = true;
        const renderState = renderedReviewState(renderVerdict);
        priorReviewIssues = renderState.issues;
        for (const resolved of renderVerdict.resolved_since_last_pass || []) {
          console.log(`    ✓ resolved since last pass: ${String(resolved).slice(0, 120)}`);
        }
        console.log(`  → Rendered review (${label}): ${renderState.score}/10 — ${renderState.approved ? 'approved' : 'repair required'} (${renderState.blocking.length} blocking, ${renderState.issues.length - renderState.blocking.length} minor)`);
        for (const issue of renderState.issues) {
          if (typeof issue?.target === 'string' && typeof issue?.issue === 'string') {
            console.log(`    • [${issue.severity || 'blocking'}] ${issue.target}: ${issue.issue}`);
          }
        }
        // Issues the repair model has repeatedly failed to clear stop blocking
        // the loop — the cap decision or a fresh candidate handles them.
        const { repairable, suppressed } = issueLedger.observe(renderState.blocking);
        for (const issue of suppressed) {
          console.warn(`  ⚠ Dropping issue from blocking after repeated failed repairs (unfixable by this loop): [${issue.target}] ${String(issue.issue).slice(0, 140)}`);
          lessonRecorder.record('anti-pattern', `Repair loop repeatedly failed to fix: [${issue.target}] ${String(issue.issue).slice(0, 240)}`, [`slot:${issue.target}`, 'unfixable']);
        }
        reviewHistory.push({
          pass,
          score: renderState.score,
          blocking: repairable.length,
          resolved: (renderVerdict.resolved_since_last_pass || []).length,
          issues: renderState.blocking.map((issue) => `[${issue.target}] ${String(issue.issue).slice(0, 200)}`),
        });
        return { ...renderState, blocking: repairable, renderVerdict };
      },
      repair: async (candidate, renderState, pass) => {
        const repairIssues = renderState.blocking.length > 0
          ? renderState.blocking
          : renderState.issues;
        const issuesByTarget = new Map();
        const escalatedTargets = new Set();
        for (const issue of repairIssues) {
        const target = typeof issue?.target === 'string' ? issue.target : '';
        const detail = typeof issue?.issue === 'string' ? issue.issue.trim() : '';
        if (allowedTargets.has(target) && detail) {
          issuesByTarget.set(target, [...(issuesByTarget.get(target) || []), detail]);
          if (issue?.escalate) escalatedTargets.add(target);
        }
      }
      if (!issuesByTarget.size) {
          issuesByTarget.set('css', [
            `The rendered result scored ${renderState.score}/10 and did not pass the release threshold. Improve prompt fidelity, distinctiveness, cohesion, hierarchy, and production polish while preserving the design contract.`,
          ]);
      }

        // An empty or unparsable repair response used to throw, roll back, and
        // silently burn a full rebuild+review cycle on an unchanged candidate
        // (observed ~half of all passes in the 21-pass incident). Now: one
        // rephrased retry, then the target is skipped and the miss is counted.
        const requestRepair = async (target, buildPrompt) => {
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const value = await buildPrompt(attempt === 2
                ? '\n\nIMPORTANT: Your previous response was empty or unparsable. You MUST output the complete JSON object exactly as specified — never an empty response.'
                : '');
              if (typeof value === 'string' && value.trim()) return value;
            } catch (error) {
              console.warn(`  ⚠ ${target} repair attempt ${attempt} failed to parse (${String(error).slice(0, 100)})`);
            }
            console.warn(`  ⚠ ${target} repair response EMPTY (attempt ${attempt}${attempt === 1 ? ', retrying with rephrased prompt' : ', skipping target this pass'})`);
          }
          return null;
        };
        const escalationNote = (target) => (escalatedTargets.has(target)
          ? '\n\nESCALATION: previous targeted repairs failed to clear these exact issues on earlier passes. Take a structurally different approach — rethink the section\'s composition rather than re-patching the previous attempt — while still honoring the design contract and required placeholders.'
          : '');

        // Analyze-and-improve: the repairer gets the reviewer's screenshots
        // and must locate each defect in the pixels before writing the fix.
        // On mechanical-gate passes there are no screenshots; the exact-string
        // evidence in the issue text stands in for them.
        const screenshotParts = (renderState.renderVerdict?.screenshots || []).flatMap((shot) => ([
          { text: `Screenshot: ${shot.label}` },
          { inlineData: { mimeType: shot.mimeType, data: shot.data } },
        ]));
        const analyzeAndImprove = async (promptText, schema, label, maxTokens) => {
          const raw = await openRouterVision(
            [...screenshotParts, { text: promptText }],
            schema,
            label,
            REPAIR_MODEL,
            maxTokens,
          );
          console.log(`  → OpenRouter ${REPAIR_MODEL} ${label} response (${Math.round(raw.length / 1024)}KB)`);
          return raw;
        };
        const analyzePreamble = screenshotParts.length
          ? 'ANALYZE AND IMPROVE: the screenshots above are the CURRENT rendered pages of this candidate, exactly as the review board saw them. First ANALYZE — locate each review issue in the screenshots and identify its root cause in the source below. Then IMPROVE — write the fix.\n\n'
          : 'ANALYZE AND IMPROVE: a deterministic scan found the exact defects quoted below in the source. First ANALYZE their root cause, then IMPROVE — write the fix.\n\n';

        console.log(`  → ${REPAIR_MODEL} analyze-and-improve on ${issuesByTarget.size} target(s), same candidate (pass ${pass})…`);
      const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
        const critique = issues.map((issue) => `- ${issue}`).join('\n');
        if (target === 'css') {
          // Append-only fix layer, never a rewrite: a full-stylesheet
          // regeneration by the repair model has been observed to REGRESS the
          // design (source score dropped 7 → 4 in one pass) while chasing two
          // issues. Override rules appended after the stylesheet can only
          // patch the named defects — the cascade gives them priority and the
          // rest of the design is untouchable.
          const value = await requestRepair(target, async (retryNote) => {
            const raw = await analyzeAndImprove(`${baseContext}

${analyzePreamble}You are writing a CSS FIX LAYER after a release review board. Do NOT rewrite or re-emit the existing stylesheet. Output ONLY new override rules that will be APPENDED after it — use the same selectors (or more specific ones) and write only as many rules as the issues below require. Fix every issue; change nothing else.${escalationNote(target)}

REVIEW ISSUES:
${critique}

SHARED DESIGN CONTRACT (use its existing selectors; do not invent a second vocabulary):
${styleSpec}

CURRENT COMPLETE CSS:
${candidate.css}

OUTPUT: exactly one JSON object: { "css": "…ONLY the appended fix-layer override rules…" }${retryNote}`, CSS_SECTION_SCHEMA, 'CSS repair', 32768);
            return extractJson(raw).css;
          });
          return value === null ? null : { target, value, mode: 'patch' };
        }
        const spec = LAYOUT_SPECS[target];
        const value = await requestRepair(target, async (retryNote) => {
          const raw = await analyzeAndImprove(`${baseContext}

${analyzePreamble}You are repairing ONLY the "${target}" HTML layout after a release review board. Keep the approved visual language and preserve these exact required placeholder(s): ${spec.required.join(', ')}. Do not add hardcoded copy, document wrappers, or scripts.${escalationNote(target)}

REVIEW ISSUES:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE "${target}" HTML:
${candidate.layouts[target]}

OUTPUT: exactly one JSON object: { "html": "…complete repaired ${target} layout…" }${retryNote}`, ONE_LAYOUT_SCHEMA, `${target} repair`, 16384);
          return extractJson(raw).html;
        });
        return value === null ? null : { target, value };
      }));

      const applied = repairs.filter(Boolean);
      if (!applied.length) {
        noProgressPasses += 1;
        const message = `Review-board repair produced no usable output for any target (pass ${pass})`;
        if (noProgressPasses >= 2) {
          // Two consecutive all-empty passes: the repair model is not going to
          // move this candidate. End the loop now via the cap decision instead
          // of burning the remaining passes on rebuilds of an unchanged page.
          throw Object.assign(new Error(`${message}; ${noProgressPasses} consecutive no-progress passes`), { terminal: true });
        }
        throw new Error(message);
      }
      noProgressPasses = 0;
      for (const repair of applied) {
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
    // Only unrecoverable infrastructure errors or a cap-failed candidate leave
    // this loop. Distill what the run taught before the evidence is torn down;
    // the outer retry starts a FRESH candidate that recalls these lessons.
    await summarizeRunLessons(`terminal failure: ${String(err?.message || err).slice(0, 160)}`);
    await lessonRecorder.flush();
    await rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
    throw err;
  }
  if (capResult?.cappedPromotion) {
    console.warn(`  ⚠ Promoted at the ${MAX_REPAIR_PASSES}-pass cap (clean but not reviewer-approved): ${capResult.capReason}`);
  }
  await summarizeRunLessons(capResult?.cappedPromotion ? 'promoted at pass cap' : 'approved by review board');
  await lessonRecorder.flush();

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
