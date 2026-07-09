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
import { writeFile, mkdir, copyFile } from 'node:fs/promises';
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
} from './lib/theme.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vaultDir = join(__dirname, '..', 'vault');
const assetsDir = join(__dirname, '..', 'assets');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

// Response schemas for constrained decoding (see geminiText). Since the build
// fans out into per-section CSS + per-layout specialists, each call returns one
// small typed object — no monolithic full-payload schema is needed anymore.
const ONE_LAYOUT_SCHEMA = {
  type: 'OBJECT',
  properties: { html: { type: 'STRING' } },
  required: ['html'],
};
// Planning output: a single self-critiqued plan + the three image prompts.
// Constrained decoding keeps the nested image_prompts object well-formed so the
// (necessarily serial) planning step never needs a second corrective round-trip.
const PLAN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    plan: { type: 'STRING', maxLength: 1600 },
    image_prompts: {
      type: 'OBJECT',
      properties: {
        logo: { type: 'STRING', maxLength: 600 },
        favicon: { type: 'STRING', maxLength: 500 },
        hero: { type: 'STRING', maxLength: 700 },
      },
    },
  },
  required: ['plan', 'image_prompts'],
};
// Few-shot exemplar handed to every layout specialist. One concrete, correct
// layout — design-system classes reused, EVERY text slot a {{PLACEHOLDER}},
// zero hardcoded copy — makes flash reproduce the contract on the first try
// instead of inventing copy or a new visual language.
const LAYOUT_EXEMPLAR = `EXEMPLAR — the "home" layout, given a design system that exposes classes .frame / .hero / .grid:
{"html":"<section class=\\"frame\\"><div class=\\"hero\\"><h1 class=\\"display\\">{{HEADLINE}}</h1><p class=\\"lede\\">{{TAGLINE}}</p><div class=\\"prose\\">{{INTRO}}</div></div><div class=\\"grid\\">{{FEATURED_PROJECTS}}</div></section>"}
Note: every piece of text is a {{PLACEHOLDER}}, the design system's real classes are reused, and nothing is hardcoded.`;
// Director output: the SHARED design contract. No CSS or HTML here — just the
// palette, tokens, and the ENUMERATED class vocabulary that every CSS-section
// and layout specialist builds against in parallel. Small + fast; it is what
// lets the whole build fan out with zero serial monolith.
const STYLESPEC_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    accent: { type: 'STRING' },
    designSpec: { type: 'STRING' },
    styleSpec: { type: 'STRING' },
  },
  required: ['name', 'accent', 'styleSpec'],
};
// One CSS section = one specialist's output.
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
// The stylesheet is partitioned into independent sections, each a parallel
// specialist. Concatenated in THIS order (tokens first so var(--…) resolves).
const CSS_SECTIONS = [
  { key: 'tokens', intent: 'The :root custom properties ONLY — every color, font stack, type-scale step, spacing step, radius, and shadow named in the contract, with concrete values. No selectors beyond :root.' },
  { key: 'base', intent: 'Reset, box-sizing, html/body, base typography (headings, paragraphs, lists), links, images, and any global element defaults. Reference tokens via var(--…).' },
  { key: 'layout', intent: 'Structural scaffolding: header/nav/footer, page containers/wrappers, and the grid/column systems. Style ONLY the layout-group classes the contract assigns.' },
  { key: 'components', intent: 'Reusable pieces: cards, project/design items, badges/pills, buttons, forms, and their states/hover. Style ONLY the component-group classes the contract assigns.' },
  { key: 'pages', intent: 'Page-specific styling, the hero, responsive @media rules, and tasteful interactive/animation flourishes. Style ONLY the page-group classes the contract assigns.' },
];

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

// ─── Gemini API (direct, no CLI overhead) ───────────────────────────────────

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

async function geminiText(userPrompt, schema = null, maxOutputTokens = 65536, thinkingBudget = null, model = 'gemini-3.5-flash') {
  // maxOutputTokens bounds THINKING + output combined on flash. It is
  // per-call: specialist slots use a bounded ceiling so a flaky response
  // truncates quickly instead of holding the whole parallel build open.
  const generationConfig = { responseMimeType: 'application/json', maxOutputTokens };
  // Bound thinking. flash is a thinking model and its thinking tokens count
  // against maxOutputTokens. Capping thinking keeps room for real output and
  // stops open-ended prompts from spiralling. A normal plan needs <2K thinking
  // tokens, so 8192 is generous headroom.
  // Gemini rejects a thinking budget larger than the call's total token cap.
  // Planning/director calls deliberately use small caps for speed, so scale the
  // budget down and reserve room for the structured response instead of
  // falling through to unavailable CLI agents after a 400 response.
  generationConfig.thinkingConfig = {
    thinkingBudget: thinkingBudget ?? Math.min(8192, Math.max(0, maxOutputTokens - 1024)),
  };
  // A strict responseSchema puts Gemini into constrained decoding, which emits
  // valid, properly-escaped JSON — the durable fix for the bad-escape failures
  // that made theme generation die ~half the time (a `\` inside a CSS/HTML
  // string value would break the whole payload).
  if (schema) generationConfig.responseSchema = schema;
  const request = { contents: [{ parts: [{ text: userPrompt }] }], generationConfig };
  let parts;
  try {
    parts = await geminiApiCall(model, request);
  } catch (err) {
    // A constrained response can still exhaust its shared thinking/output cap
    // despite an explicitly concise prompt. Retry once without thinking: this
    // preserves the schema gate and avoids an unrelated CLI-agent fallback.
    if (!String(err).includes('MAX_TOKENS') || generationConfig.thinkingConfig.thinkingBudget === 0) throw err;
    console.warn('  ⚠ Gemini reached its thinking/output cap; retrying this structured call without thinking.');
    parts = await geminiApiCall(model, {
      ...request,
      generationConfig: { ...generationConfig, thinkingConfig: { thinkingBudget: 0 } },
    });
  }
  return parts.map(p => p.text || '').join('');
}

async function generateImage(imagePrompt, outputPath, baseImagePath = null) {
  const parts = [];
  if (baseImagePath) {
    const { readFile: rf } = await import('node:fs/promises');
    const data = (await rf(baseImagePath)).toString('base64');
    parts.push({ inlineData: { mimeType: 'image/jpeg', data } });
  }
  parts.push({ text: imagePrompt });
  return generateImageParts(parts, outputPath, imagePrompt);
}

async function generateImageParts(requestParts, outputPath, label) {
  const parts = await geminiApiCall('gemini-3.1-flash-lite-image', {
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
  const designDir = join(__dirname, '..', 'designs', styleName);
  const genDir = join(designDir, 'assets');
  await mkdir(genDir, { recursive: true });

  const logoPath = join(genDir, 'logo.png');
  const faviconPath = join(genDir, 'favicon.png');
  const heroPath = join(genDir, 'hero.jpg');
  const portraitPath = join(genDir, 'portrait.jpg');
  const basePortrait = join(assetsDir, 'greg-portrait-source.png');

  // ── Phase 1: Planning and Architecture (including Image Prompts) ──
  console.log(`[1/3] Theme Architecture and Image Planning…`);

  const frontendSkillPath = join(__dirname, '..', '.agent', 'skills', 'frontend-design', 'SKILL.md');
  const frontendSkill = await import('node:fs/promises').then(m => m.readFile(frontendSkillPath, 'utf8')).catch(() => '');

  const baseContext = `You are a STRICT structural HTML layout engineer. You do not write copy. Every site you ship has a visual identity so specific it could never be mistaken for a template. You are designing for a REAL client — Greg Iteen, a full-stack engineer who builds local, file-native AI systems.

CRITICAL DIRECTIVE: NO TRITE DESIGNS. ALL MUST BE BESPOKE, AGENCY LEVEL DESIGNS. NO AI SLOP. Do NOT output crappy cyberpunk AI slop. You MUST write custom HTML with awesome, interactive frontend features. Avoid generic gradients, overused tech aesthetics, or lazy layouts. Push the visual envelope and write real, bespoke code.

ABSOLUTE SYSTEM RULE - NO FAKE COPY ALLOWED:
You MUST NEVER write any hardcoded text, marketing copy, titles, or "lorem ipsum" into the HTML layouts. Your ONLY job is to write the structural HTML/CSS.
For ALL text, you MUST USE the EXACT {{PLACEHOLDER}} variables provided in the Placeholder Contract. The build script will inject Greg's real portfolio copy into those variables.
FURTHERMORE:
- You MUST NOT write fake copy inside HTML attributes (e.g., alt="", title=""). Leave them empty or use a placeholder if appropriate.
- You MUST NOT hallucinate Markdown formatting tags (like <strong> or <em>) outside of placeholders.
- You MUST NOT mutate, alter, case-change, or combine placeholders.
- Do NOT JSON-escape the placeholders.
If you hardcode any real text into the layouts, YOU FAIL.

THE BRIEF: "${prompt}"

FRONTEND DESIGN PRINCIPLES & GUIDANCE:
${frontendSkill}

SITE CONTEXT:
${SITE_CONTEXT}

PLACEHOLDER CONTRACT (YOU MUST USE THESE EXACT VARIABLES INSTEAD OF HARDCODING TEXT):
${placeholderContract}

IMAGES (already generated, use them):
- assets/logo.png — GI monogram, transparent PNG. Use as logo.
- assets/favicon.png — GI favicon. Use in <link rel="icon">.
- assets/hero.jpg — hero background. Use prominently.
- assets/portrait.jpg — portrait of Greg restyled to match this theme. It is placed automatically inside page content (class .md-img) on the contact page — style .md-img to sit well in your layout.
These four fixed paths are NOT hardcoded copy — referencing them via url(assets/hero.jpg) or <img src="assets/logo.png"> etc. is REQUIRED, not a violation of the "no hardcoded text" rule. That rule is about words, never about these image paths.

NO INLINE <script> TAGS. Layouts are inert markup only — never write <script>…</script> or any inline JS. Interactivity must come from CSS alone (:hover, :focus, transitions, animations). Any layout containing a script tag will have it stripped, so it is always wasted effort.
`;
  // Architecture needs the brief and site shape, not the entire HTML contract
  // or frontend skill. Keeping this serial request compact lets the parallel
  // CSS/layout fan-out start promptly without weakening later guardrails.
  const planningContext = `You are an award-winning digital art director creating a distinctive visual system for a real creative-technologist portfolio.

THE BRIEF: "${prompt}"

SITE CONTEXT:
${SITE_CONTEXT}

Choose a specific, credible design movement and make concrete decisions. Avoid generic dark-tech, glass, gradient, and cyberpunk tropes.`;

  async function callAgent(p, schema = null, maxOutputTokens = 16384, thinkingBudget = null, model = 'gemini-3.5-flash') {
    if (GOOGLE_API_KEY) {
      try {
        const raw = await geminiText(p, schema, maxOutputTokens, thinkingBudget, model);
        console.log(`  → API response (${Math.round(raw.length / 1024)}KB)`);
        return raw;
      } catch (err) {
        console.error('Gemini call failed:', String(err));
        if (process.env.ALLOW_CLI_THEME_FALLBACK !== '1') throw err;
        console.warn('  ⚠ ALLOW_CLI_THEME_FALLBACK=1; attempting a local CLI agent.');
      }
    }
    return executeAgentCall(p);
  }

  // Pass 1: Plan + self-critique in ONE call. The plan feeds both image
  // generation and the CSS foundation, so it is necessarily serial — but the
  // old separate "plan review gate" was a second serial round-trip improving a
  // plan this prompt already self-critiques. Folded into one call (constrained
  // decoding via PLAN_SCHEMA), it keeps the quality bar and drops ~9s off the
  // critical path.
  console.log('  → Pass 1: Planning (plan + self-critique, single pass)');
  let rawPlan = await callAgent(`${planningContext}

You are starting a new design build. Plan the architecture and visual identity, silently critiquing and improving your first idea before you write — never settle for a generic result.
1. Analyze the brief; decide typography, color palette, layouts, and interactive mechanics.
2. Reject generic AI tropes (neon gradients, generic dark modes, lazy cyberpunk); reference real design movements, specific typographic choices, and concrete palettes.
3. Write 3 bespoke image-generation prompts (logo, favicon, hero) that fit the design. For logo/favicon, do NOT default to a generic monogram if it does not fit.

CRITICAL: Be CONCISE. The "plan" must be a tight brief of ~250-350 words — enough to direct the build, NOT an essay. Do not narrate your scoring or critique; output only the final plan. A rambling plan is a failure.

OUTPUT: exactly one JSON object:
{
  "plan": "A tight ~300-word design brief: identity, palette, type, layout, interaction.",
  "image_prompts": {
    "logo": "Create a logo for Greg Iteen. Style: [Your bespoke style]. CRITICAL: FULLY TRANSPARENT background (PNG alpha)...",
    "favicon": "Crop and optimize the provided logo into a tiny square favicon (64x64). TRANSPARENT background...",
    "hero": "Create an atmospheric, wide hero background image... Cinematic quality, 16:9..."
  }
}`, PLAN_SCHEMA, 4096, 0, 'gemini-2.5-flash');
  let planObj = extractJson(rawPlan);
  let plan = planObj.plan || planObj.thought_process || 'No plan provided.';

  // The portrait uses a strict A/B tested prompt to perfectly preserve identity while styling to match the theme.
  const portraitPrompt = `Art-direct this portrait for a portfolio site whose design brief is "${prompt}". Preserve the subject's identity exactly — same face, same friendly expression, natural human eyes, same pose. Completely replace the setting: re-render the wardrobe, backdrop, lighting, and color grade so the portrait belongs to that visual world (do not keep the original office background). Editorial photography quality, tasteful, portfolio-grade. No text, no watermarks.`;
  
  // Now that we have the image prompts, kick off the image generation in the background!
  console.log(`[2/3] Generating Images in background using bespoke prompts…`);
  const imagePromise = GOOGLE_API_KEY
    ? Promise.allSettled([
        (async () => {
          if (await generateImage(planObj.image_prompts?.logo || 'Logo', logoPath)) {
            await generateImage(planObj.image_prompts?.favicon || 'Favicon', faviconPath, logoPath);
          }
        })(),
        generateImage(planObj.image_prompts?.hero || 'Hero', heroPath),
        generateImage(portraitPrompt, portraitPath, basePortrait).catch(e => console.error('Portrait gen failed', e))
      ])
    : (console.warn('  ⚠ GOOGLE_API_KEY not set — skipping images'), Promise.resolve([]));

  // ── Director → StyleSpec ── One small, fast call defines the SHARED design
  // contract: palette, tokens, and the ENUMERATED class vocabulary. It holds NO
  // css/html, so it stays small (never truncates) and EVERYTHING downstream fans
  // out against it in parallel. This is the whole point — there is no serial CSS
  // monolith. Wall-clock from here = slowest single specialist, not a sum.
  console.log('  → Director: StyleSpec (shared design contract)');
  let rawSpec = await callAgent(`${baseContext}

Here is your approved architectural plan:
${plan}

You are the DESIGN DIRECTOR. Do NOT write CSS or HTML. Define the SHARED design contract that every CSS-section specialist and every layout specialist will build against IN PARALLEL — so it must be complete and unambiguous: anything you do not name here will not exist.

OUTPUT: exactly one JSON object:
{
  "name": "Short Theme Name",
  "accent": "#rrggbb",
  "designSpec": "A strict DESIGN.md: the visual identity, mood, and rules.",
  "styleSpec": "The build contract. MUST enumerate: (1) TOKENS — every CSS custom property (--name: value) for palette, font stacks, type scale, spacing scale, radius, and shadow, with concrete values. (2) CLASS VOCABULARY — the exact, complete list of CSS class names the site uses, each with a one-line purpose, GROUPED under the sections tokens/base/layout/components/pages so each CSS specialist knows which classes it owns. Layout specialists compose using ONLY these class names. (3) HERO IMAGE — you MUST name exactly one class (e.g. '.hero') that the 'pages' CSS specialist gives a background-image: url(assets/hero.jpg) (with background-size/position) — the 'home' layout specialist MUST apply that class to its top-level hero element. This is mandatory: a theme with no visible hero.jpg is a failed build."
}`, STYLESPEC_SCHEMA, 24576);
  let payload = extractJson(rawSpec);
  const styleSpec = payload.styleSpec || '';
  payload.layouts = {};

  // ── One parallel fan-out: every CSS section + every layout, all at once ──
  // Both sides key off the SAME styleSpec vocabulary, so CSS and markup cohere
  // without any of them waiting on a big serial stylesheet. A failed slot is
  // skipped, not fatal; the async improve pass regenerates weak slots later.
  const layoutKeys = Object.keys(LAYOUT_SPECS);
  console.log(`  → Fan-out: ${CSS_SECTIONS.length} CSS sections + ${layoutKeys.length} layouts = ${CSS_SECTIONS.length + layoutKeys.length} specialists in parallel`);

  const cssJobs = CSS_SECTIONS.map((section) =>
    callAgent(`${baseContext}

You are a CSS specialist. Write ONLY the "${section.key}" section of the stylesheet.

SHARED DESIGN CONTRACT (build to this exactly — the same tokens/classes every other specialist uses, so it all coheres):
${styleSpec}

THIS SECTION'S JOB: ${section.intent}

RULES:
- Implement ONLY the classes/tokens the contract assigns to "${section.key}". Do not restyle other sections' classes.
- Reference tokens via var(--…); never hardcode a value a token already holds.

OUTPUT: exactly one JSON object: { "css": "…the ${section.key} CSS…" }`, CSS_SECTION_SCHEMA)
      .then((r) => ({ kind: 'css', key: section.key, css: extractJson(r).css }))
      .catch((e) => ({ kind: 'css', key: section.key, error: String(e) }))
  );

  const layoutJobs = layoutKeys.map((key) => {
    const spec = LAYOUT_SPECS[key];
    const required = spec && spec.required.length ? spec.required.join(', ') : '(none)';
    const optional = spec && spec.optional?.length ? spec.optional.join(', ') : '';
    return callAgent(`${baseContext}

You are a layout specialist. Generate ONLY the "${key}" layout, composed from the shared design system's class vocabulary.

SHARED DESIGN CONTRACT (use ONLY these class names — the CSS for them is being written in parallel):
${styleSpec}

This "${key}" layout MUST contain these exact placeholder(s): ${required}${optional ? `\nOptional placeholder(s): ${optional}` : ''}

RULES:
- Use ONLY {{PLACEHOLDER}} variables — NEVER hardcode text, titles, or copy.
- Compose using ONLY the contract's class names; do not invent a new visual language.

${LAYOUT_EXEMPLAR}

OUTPUT: exactly one JSON object: { "html": "…the ${key} layout HTML…" }`, ONE_LAYOUT_SCHEMA)
      .then((r) => ({ kind: 'layout', key, html: extractJson(r).html }))
      .catch((e) => ({ kind: 'layout', key, error: String(e) }));
  });

  const results = await Promise.all([...cssJobs, ...layoutJobs]);

  // Assemble CSS in the fixed section order (tokens first so var(--…) resolves).
  const cssBySection = {};
  let builtLayouts = 0;
  for (const r of results) {
    if (r.error) { console.warn(`  ⚠ ${r.kind} ${r.key} failed (${r.error}) — skipped`); continue; }
    if (r.kind === 'css') { if (typeof r.css === 'string' && r.css.trim()) cssBySection[r.key] = r.css; }
    else if (typeof r.html === 'string' && r.html.trim()) { payload.layouts[r.key] = r.html; builtLayouts++; }
  }
  payload.css = CSS_SECTIONS.map((s) => cssBySection[s.key]).filter(Boolean).join('\n\n');
  console.log(`  → Built ${Object.keys(cssBySection).length}/${CSS_SECTIONS.length} CSS sections + ${builtLayouts}/${layoutKeys.length} layouts in parallel`);

  // ── Release gate: validate every template, then have a fresh model inspect
  // the complete CSS + every actual HTML layout before any public artifact is
  // written. The old post-generation improver only saw layout *names* in its
  // score prompt and ran after the first build had already been served.
  const validateForRelease = (candidate) => {
    const verdict = validateThemePayload(candidate, {
      strict: true,
      requireAllLayouts: true,
      requireHero: true,
    });
    if (!verdict.theme) throw new Error(`Release gate rejected theme: ${verdict.errors.join('; ')}`);
    for (const warning of verdict.warnings) console.warn(`  ⚠ ${warning}`);
    return verdict.theme;
  };

  // The structural validator is deliberately stricter than an LLM: it catches
  // unbalanced markup, missing placeholders, and visible invented copy before
  // any source document is written. Feed those concrete findings back to only
  // the failing slot once, then run the same fail-closed gate again.
  const repairStructuralViolations = async (candidate) => {
    // Keep the source contract absolute: a layout may carry data placeholders,
    // but model-authored words are never allowed to ship. Preserve placeholders
    // while removing any literal text node before each validation pass.
    const stripHardcodedTextNodes = (html) => String(html).replace(/>([^<]*)</g, (whole, text) => {
      const placeholders = text.match(/\{\{[A-Z0-9_]+\}\}/g) || [];
      const remainder = text.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
      return /[A-Za-z0-9]/.test(remainder) ? `>${placeholders.join('')}<` : whole;
    });

    for (let pass = 1; pass <= 2; pass++) {
      for (const [key, html] of Object.entries(candidate.layouts || {})) {
        if (typeof html === 'string') candidate.layouts[key] = stripHardcodedTextNodes(html);
      }
      const verdict = validateThemePayload(candidate, {
        strict: true,
        requireAllLayouts: true,
        requireHero: true,
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
        throw new Error(`Release gate rejected theme: ${verdict.errors.join('; ')}`);
      }

      console.log(`  → Structural validation pass ${pass}/2 found ${issuesByTarget.size} repair target(s); repairing before review…`);
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

OUTPUT: exactly one JSON object: { "css": "complete repaired CSS" }`, CSS_SECTION_SCHEMA);
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

OUTPUT: exactly one JSON object: { "html": "complete repaired ${target} fragment" }`, ONE_LAYOUT_SCHEMA);
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
    const finalVerdict = validateThemePayload(candidate, { strict: true, requireAllLayouts: true, requireHero: true });
    throw new Error(`Release gate rejected theme: ${finalVerdict.errors.join('; ')}`);
  };

  const auditForRelease = async (candidate, label) => {
    const source = JSON.stringify({ css: candidate.css, layouts: candidate.layouts });
    const raw = await callAgent(`${baseContext}

You are the final RELEASE REVIEWER. Inspect the complete source package below: it contains the ENTIRE stylesheet and EVERY generated HTML layout, not a summary. Read all of it before deciding.

Approve only if it is an agency-quality, coherent, responsive portfolio skin with no likely visible breakage. A score below 8 MUST be rejected. Reject for any structural, visual, responsive, placeholder, asset, hierarchy, accessibility, or hardcoded-copy issue that could ship to a visitor.

When rejecting, list only surgical blocking issues. Each target MUST be exactly "css" or one of: ${Object.keys(LAYOUT_SPECS).join(', ')}. Do not invent targets and do not rewrite source in this response.

DESIGN PLAN:
${plan}

SHARED DESIGN CONTRACT:
${styleSpec}

FULL SOURCE PACKAGE:
${source}

OUTPUT: exactly one JSON object: { "approved": true, "score": 8, "blocking_issues": [] }`, RELEASE_REVIEW_SCHEMA, 16384);
    const audit = extractJson(raw);
    if (!Array.isArray(audit.blocking_issues)) audit.blocking_issues = [];
    console.log(`  → Release review (${label}): ${audit.score}/10 — ${audit.approved ? 'approved' : 'repair required'}`);
    return audit;
  };

  await repairStructuralViolations(payload);
  let theme = validateForRelease(payload);
  let audit = await auditForRelease(theme, 'initial');
  if (!audit.approved || audit.score < 8) {
    const allowedTargets = new Set(['css', ...Object.keys(LAYOUT_SPECS)]);
    const issuesByTarget = new Map();
    for (const issue of audit.blocking_issues) {
      const target = typeof issue?.target === 'string' ? issue.target : '';
      const detail = typeof issue?.issue === 'string' ? issue.issue.trim() : '';
      if (allowedTargets.has(target) && detail) {
        issuesByTarget.set(target, [...(issuesByTarget.get(target) || []), detail]);
      }
    }
    if (!issuesByTarget.size) {
      throw new Error('Release review rejected the theme without actionable, valid repair targets');
    }

    console.log(`  → Repairing ${issuesByTarget.size} release-review target(s) in parallel…`);
    const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
      const critique = issues.map((issue) => `- ${issue}`).join('\n');
      if (target === 'css') {
        const raw = await callAgent(`${baseContext}

You are repairing ONLY the stylesheet after a release review. Keep the approved plan and class vocabulary intact; correct every issue below without adding hardcoded copy.

RELEASE ISSUES:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE CSS:
${theme.css}

OUTPUT: exactly one JSON object: { "css": "…complete repaired stylesheet…" }`, CSS_SECTION_SCHEMA);
        return { target, value: extractJson(raw).css };
      }

      const spec = LAYOUT_SPECS[target];
      const raw = await callAgent(`${baseContext}

You are repairing ONLY the "${target}" HTML layout after a release review. Keep the approved visual language and preserve these exact required placeholder(s): ${spec.required.join(', ')}. Do not add hardcoded copy, document wrappers, or scripts.

RELEASE ISSUES:
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE "${target}" HTML:
${theme.layouts[target]}

OUTPUT: exactly one JSON object: { "html": "…complete repaired ${target} layout…" }`, ONE_LAYOUT_SCHEMA);
      return { target, value: extractJson(raw).html };
    }));

    for (const repair of repairs) {
      if (typeof repair.value !== 'string' || !repair.value.trim()) {
        throw new Error(`Release repair for "${repair.target}" returned no content`);
      }
      if (repair.target === 'css') payload.css = repair.value;
      else payload.layouts[repair.target] = repair.value;
    }
    // Reviewer repairs are model output too; send them through the exact same
    // structural gate before the post-repair score so a visual fix cannot
    // reintroduce malformed HTML or hardcoded copy.
    await repairStructuralViolations(payload);
    theme = validateForRelease(payload);
    audit = await auditForRelease(theme, 'post-repair');
    if (!audit.approved || audit.score < 8) {
      throw new Error(`Release review still rejected the theme (${audit.score}/10); nothing was published`);
    }
  }
  // Wait for images
  const imageResults = await imagePromise;
  if (Array.isArray(imageResults)) {
    for (const [i, r] of imageResults.entries()) {
      if (r.status === 'rejected') console.warn(`  ⚠ ${i === 0 ? 'logo' : 'hero'} failed: ${r.reason?.message}`);
    }
  }

  // ── Phase 3: Save nodes ──
  console.log(`[3/3] Saving DESIGN.md into designs/${styleName}/…`);

  let designBody = payload.designSpec || `Theme: ${theme.name}\nStyle: ${prompt}\nAccent: ${theme.accent}`;

  const blocks = Object.entries({ css: theme.css, ...Object.fromEntries(Object.entries(theme.layouts).map(([k,v]) => [`layout:${k}`, v])) })
    .filter(([, content]) => typeof content === 'string' && content.trim())
    .map(([name, content]) => `## section:${name}\n\n\`\`\`${name === 'css' ? 'css' : 'html'}\n${content.replace(/```/g, '')}\n\`\`\``)
    .join('\n\n');

  const designMd = `---
name: "${theme.name}"
accent: "${theme.accent}"
style: "${prompt.replace(/"/g, '\\"')}"
---

# Design System

${designBody.trim()}

${blocks}
`;

  await writeFile(join(designDir, 'DESIGN.md'), designMd, 'utf8');

  // Write the skin registry entry (separate from portfolio designs)
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
    x_logo: `/designs/${styleName}/assets/logo.png`,
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
  await writeFile(join(skinsDir, `${styleName}.md`), vaultSkinMd, 'utf8');
  
  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log(`[Success] "${theme.name}" → designs/${styleName} [${elapsed}s]`);

  // ── Phase 4: Build HTML ──
  // serve.mjs owns the one serialized build when it launches this script. That
  // avoids the watcher / generator / improver race that previously caused
  // ENOTEMPTY failures while deleting dist/site/designs/* directories.
  if (process.env.THEME_DEFER_BUILD === '1') {
    console.log(`[4/4] Build deferred to the serialized server rebuild.`);
  } else {
    console.log(`[4/4] Building isolated HTML...`);
    const buildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', styleName], { stdio: 'inherit' });
    if (buildResult.status !== 0) throw new Error(`build-site.mjs failed for ${styleName} (exit ${buildResult.status})`);

    console.log(`[4/4] Rebuilding main site to register design...`);
    const mainBuildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
    if (mainBuildResult.status !== 0) throw new Error(`build-site.mjs failed for the main site (exit ${mainBuildResult.status})`);
  }
}

run().catch((e) => {
  console.error(`[Failed] ${e.message}`);
  process.exit(1);
});
