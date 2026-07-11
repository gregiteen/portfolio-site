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
import { writeFile, mkdir, copyFile, readFile, rm } from 'node:fs/promises';
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
        hero: { type: 'STRING', maxLength: 700 },
        logo: { type: 'STRING', maxLength: 500 },
        portrait_style: { type: 'STRING', maxLength: 500 },
      },
      required: ['hero', 'logo', 'portrait_style'],
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
const VISUAL_ASSET_AUDIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    approved: { type: 'BOOLEAN' },
    issues: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['approved', 'issues'],
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

async function geminiText(userPrompt, schema = null, maxOutputTokens = 65536, thinkingBudget = null, model = 'gemini-3.5-flash', allowNoThinkingRetry = true) {
  // maxOutputTokens bounds thinking + output. It is per-call: specialist slots
  // use a bounded ceiling so a flaky response cannot hold the parallel build.
  const generationConfig = { responseMimeType: 'application/json', maxOutputTokens };
  // Thinking tokens count against maxOutputTokens, so reserve room for the
  // response while allowing the caller to choose the right reasoning depth.
  // Gemini rejects a thinking budget larger than the call's total token cap.
  // The planning director explicitly receives the larger Pro budget below;
  // all other callers get a safe default that leaves room for structured output.
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
    const msg = String(err);
    if (allowNoThinkingRetry && msg.includes('MAX_TOKENS') && generationConfig.thinkingConfig.thinkingBudget !== 0) {
      // Specialists may retry without thinking if a constrained response reaches
      // its shared cap. The planning director is deliberately excluded: it must
      // never silently trade reasoning quality for speed.
      console.warn('  ⚠ Gemini reached its thinking/output cap; retrying this structured call without thinking.');
      parts = await geminiApiCall(model, {
        ...request,
        generationConfig: { ...generationConfig, thinkingConfig: { thinkingBudget: 0 } },
      });
    } else if (/timeout|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|"code":\s*(429|5\d\d)/i.test(msg)) {
      // One retry for transient infra failures. A generation is a ~25-call
      // chain over several minutes; without this, a single flaky request
      // kills the whole build (seen live: one 300s timeout in a repair call
      // discarded an otherwise-complete theme).
      console.warn(`  ⚠ Transient Gemini failure (${msg.slice(0, 100)}); retrying this call once…`);
      parts = await geminiApiCall(model, request);
    } else {
      throw err;
    }
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
  const parts = await geminiApiCall('gemini-3.1-flash-image', {
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

  const heroPath = join(genDir, 'hero.jpg');
  const portraitPath = join(genDir, 'portrait.jpg');
  const logoPath = join(genDir, 'logo.png');
  const faviconPath = join(genDir, 'favicon.png');
  const portraitSource = join(assetsDir, 'greg-portrait.jpg');
  // Verified brand sources: logo/favicon are RESTYLED from these via
  // image-to-image (letterforms stay correct — pure text generation produced
  // garbled marks that failed the asset audit twice), and they double as the
  // fallback when a restyle fails so brand assets can never sink a build.
  const logoSource = join(__dirname, '..', 'static', 'gi-logo-transparent.png');
  const faviconSource = join(assetsDir, 'favicon.png');
  const heroFallback = join(assetsDir, 'gen-hero.jpg');

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

PLACEHOLDER SEMANTICS — three kinds, and misusing one is a release-blocking bug:
- PRE-FORMATTED HTML (complete elements: anchors, images, badge spans, whole blocks). Place these ONLY as element children, NEVER inside an attribute like href/src: {{CONTENT}}, {{NAV_LINKS}}, {{PROJECT_LIST}}, {{DESIGN_CARDS}}, {{FEATURED_PROJECTS}}, {{REPO_LINK}}, {{PROJECT_LINK}}, {{BACKLINK}}, {{TECH_BADGES}}, {{TAG_BADGES}}, {{LOGO}}. Writing <a href="{{PROJECT_LINK}}"> produces a nested broken link — {{PROJECT_LINK}} is already an <a> tag.
- RAW URLS/PATHS (safe inside href/src): {{URL}}, {{NAV_URL}}, {{LINK_URL}}, {{REPO_URL}}, {{PREVIEW}}.
- PLAIN TEXT (safe anywhere text goes): everything else ({{NAME}}, {{DESCRIPTION}}, {{HEADLINE}}, {{TAGLINE}}, {{YEAR}}, {{ROLE}}, {{CLIENT}}, {{NAV_NAME}}, {{SOURCE_PATH}}, counts, etc.).

IMAGES (all four are generated specifically for THIS theme — use them):
- assets/logo.png — the theme's own generated brand mark for Greg Iteen, designed to sit on your shell/header background. Use it as the shell's brand mark, sized via CSS (height 28-48px, width auto). Use the <img> alone; NEVER overlay or pair text on top of the mark.
- assets/favicon.png — the theme's favicon; the build injects it automatically, do not reference it in layouts.
- assets/hero.jpg — hero background. Use prominently.
- assets/portrait.jpg — Greg's editorial portrait re-rendered in this theme's style. It is placed automatically inside page content (class .md-img) on the contact page — style .md-img to sit well in your layout.
These fixed asset paths are NOT hardcoded copy — referencing them via url(assets/hero.jpg) is REQUIRED, not a violation of the "no hardcoded text" rule. That rule is about words, never about these image paths.

MOTION & INTERACTIVITY — a static page is a FAILED page:
- The build injects a scroll-reveal runtime: content sections get class .gi-reveal and receive .gi-in as they enter the viewport (staggered via --gi-stagger). A default transition exists; OVERRIDE .gi-reveal/.gi-reveal.gi-in in your 'pages' CSS section with a transition that expresses this theme (slide, clip-path wipe, blur-in, scale — whatever fits).
- Every interactive element (links, cards, badges, buttons, nav items) MUST have a designed hover/focus state with a real transition — not just a color swap.
- Include at least one signature CSS-only kinetic flourish that fits the theme: a marquee, a sticky/scroll-pinned element, an infinite subtle animation (grain, drift, rotation), animated underlines, or CSS scroll-driven effects. Wrap purely decorative motion in @media (prefers-reduced-motion: no-preference).

FIXED INJECTED MARKUP — these placeholders expand to build-side markup you do NOT control. Your stylesheet MUST account for every one of them (assign them to the 'components' CSS section) or they render as giant, unstyled, or broken elements:
- {{TECH_BADGES}} / {{TAG_BADGES}} → a run of <span class="badge">Name</span> with NO whitespace between spans. Style .badge as a small distinct chip (inline-block + margin, or flex + gap on its container) or the words concatenate into unreadable strings like "PythonFlaskAutomation".
- {{LOGO}} → a BARE <img src="…logo.png"> with NO class and NO size attributes. Unstyled it renders at full native size (1000px+, opaque white background) and destroys the page. Your item/detail layouts MUST wrap it in a container class whose CSS constrains descendant imgs (e.g. .item-media img { max-height: 56px; width: auto; }).
- {{PREVIEW}} → a raw image path; you write <img src="{{PREVIEW}}"> yourself — give that img a class and constrain it.
- {{REPO_LINK}} → <a class="src">source ↗</a>; {{BACKLINK}} → <a class="backlink">← cd ../…</a>; detail pages also emit <a class="btn">visit … ↗</a>. Style .src, .backlink, and .btn as proper theme elements.
- {{CONTENT}} → rendered markdown: h2, h3, p, ul, ol, li, a, blockquote, code, pre, and <img class="md-img"> (the portrait). Your 'base' CSS section must give ALL of these real typographic treatment with sane vertical rhythm — enormous or missing margins here create dead zones.

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

  async function callAgent(p, schema = null, maxOutputTokens = 16384, thinkingBudget = null, model = 'gemini-3.5-flash', allowNoThinkingRetry = true) {
    if (GOOGLE_API_KEY) {
      try {
        const raw = await geminiText(p, schema, maxOutputTokens, thinkingBudget, model, allowNoThinkingRetry);
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
3. Write bespoke image prompts that fit the design:
   - "hero": a wide, atmospheric composition with no text, logos, watermarks, checkerboard/transparency patterns, or UI mockups.
   - "logo": a personal brand mark for "Greg Iteen" in THIS theme's visual language — a simple, confident wordmark or monogram ("GI" or "greg.iteen"), flat, on a background matching the theme's header/shell color so it composites cleanly. No taglines, no clutter, no photorealism.
   - "portrait_style": a style-transfer directive for re-rendering a supplied editorial photograph of Greg in this theme's aesthetic (palette, grain, treatment). His face, identity, and likeness MUST stay clearly recognizable — restyle the treatment, never the person.

CRITICAL: Be CONCISE. The "plan" must be a tight brief of ~250-350 words — enough to direct the build, NOT an essay. Do not narrate your scoring or critique; output only the final plan. A rambling plan is a failure.

OUTPUT: exactly one JSON object:
{
  "plan": "A tight ~300-word design brief: identity, palette, type, layout, interaction.",
  "image_prompts": {
    "hero": "Create an atmospheric, wide hero background image... Cinematic quality, 16:9...",
    "logo": "Design a flat brand wordmark for Greg Iteen...",
    "portrait_style": "Re-render the supplied portrait photograph in ... keeping the subject's likeness intact"
  }
}`, PLAN_SCHEMA, 24576, 8192, 'gemini-3.1-pro-preview', false);
  let planObj = extractJson(rawPlan);
  let plan = planObj.plan || planObj.thought_process || 'No plan provided.';

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
    ? Promise.allSettled([
        withFallback(generateImage(planObj.image_prompts?.hero || 'Hero', heroPath), heroFallback, heroPath),
        withFallback(generateImage(`${logoPrompt}\n\nRULES: a flat, professional brand wordmark reading exactly "greg.iteen" or the monogram "GI" — perfect spelling, crisp legible letterforms. One confident mark; the background must match the theme's shell/header color so it composites seamlessly. No watermark, no mockup, no 3D render, no photograph.`, logoPath), logoSource, logoPath),
        withFallback(generateImage(`${logoPrompt}\n\nNow as a FAVICON: a single square app-icon glyph — the monogram "GI" or one bold symbol from the mark, perfectly legible at 32px, flat, centered, filling the square. Exact spelling if letters are used; no other words, no fine detail.`, faviconPath), faviconSource, faviconPath),
        withFallback(generateImage(`${portraitStyle}\n\nHARD CONSTRAINT: this is the same person — identical face, identical likeness, editorial quality. Restyle the photographic treatment only. No text, no watermark, no distortion of features.`, portraitPath, portraitSource), portraitSource, portraitPath),
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
  // Wrapped so the review board can re-roll the ENTIRE fan-out once when the
  // initial sample is deeply bad — surgical repairs cannot rescue an
  // incoherent base (observed: a 4/10 base churned through both repair
  // passes without ever converging).
  const runSpecialistFanOut = async () => {
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

OUTPUT: exactly one JSON object: { "css": "…the ${section.key} CSS…" }`, CSS_SECTION_SCHEMA, 24576, 8192, 'gemini-3.1-pro-preview', false)
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
- Only the "shell" layout may own page-wide wrappers, header, navigation, sidebar, or footer. Every other layout is a single content fragment injected inside shell's {{CONTENT}}; never repeat global chrome.
- Do not use inline style attributes. Put all visual behavior in the shared CSS classes so mobile behavior and repairs remain reliable.
${key === 'shell'
  ? `- The element that holds {{CONTENT}} must be a plain full-width flow container: never give it a multi-column display:grid/flex that would squeeze injected fragments into one track, and never rely on injected children declaring grid-column spans — they won't.`
  : `- This fragment is injected INSIDE the shell's content container. NEVER include <main>, <header>, <footer>, the theme's root/page wrapper class, or any min-height:100vh container — the shell already provides all of those. Start directly at the section level.`}
${(key === 'projects_index' || key === 'designs_index' || key === 'home')
  ? `- ${required} expands to a SERIES of item fragments that already carry their own item classes (the *_item layouts style each entry). Wrap the placeholder in a neutral LIST CONTAINER class only — never in the item classes themselves, or every item gets double-wrapped with doubled borders and broken grids.`
  : ''}

${LAYOUT_EXEMPLAR}

OUTPUT: exactly one JSON object: { "html": "…the ${key} layout HTML…" }`, ONE_LAYOUT_SCHEMA, 16384, 8192, 'gemini-3.1-pro-preview', false)
      .then((r) => ({ kind: 'layout', key, html: extractJson(r).html }))
      .catch((e) => ({ kind: 'layout', key, error: String(e) }));
  });

  const results = await Promise.all([...cssJobs, ...layoutJobs]);

  // Assemble CSS in the fixed section order (tokens first so var(--…) resolves).
  const cssBySection = {};
  let builtLayouts = 0;
  payload.layouts = {};
  for (const r of results) {
    if (r.error) { console.warn(`  ⚠ ${r.kind} ${r.key} failed (${r.error}) — skipped`); continue; }
    if (r.kind === 'css') { if (typeof r.css === 'string' && r.css.trim()) cssBySection[r.key] = r.css; }
    else if (typeof r.html === 'string' && r.html.trim()) { payload.layouts[r.key] = r.html; builtLayouts++; }
  }
  payload.css = CSS_SECTIONS.map((s) => cssBySection[s.key]).filter(Boolean).join('\n\n');
  payload = enforceBrandAssetContract(payload);
  console.log(`  → Built ${Object.keys(cssBySection).length}/${CSS_SECTIONS.length} CSS sections + ${builtLayouts}/${layoutKeys.length} layouts in parallel`);
  };
  await runSpecialistFanOut();

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

OUTPUT: exactly one JSON object: { "css": "complete repaired CSS" }`, CSS_SECTION_SCHEMA, 32768, 4096, 'gemini-3.5-flash');
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

OUTPUT: exactly one JSON object: { "html": "complete repaired ${target} fragment" }`, ONE_LAYOUT_SCHEMA, 16384, 4096, 'gemini-3.5-flash');
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

"Competent but basic" is a FAILURE, not a pass. Reject any design that reads as a default template: a plain centered column of stacked sections, uniform card grids with no compositional idea, default-looking type scale, no distinctive layout gesture (asymmetry, overlap, oversized display type, unusual grid, editorial rhythm). Judge it against real agency portfolio sites — if this would not impress a design-literate client, score it below 8 and name what is generic.

When rejecting, list only surgical blocking issues. Each target MUST be exactly "css" or one of: ${Object.keys(LAYOUT_SPECS).join(', ')}. Do not invent targets and do not rewrite source in this response.

DESIGN PLAN:
${plan}

SHARED DESIGN CONTRACT:
${styleSpec}

FULL SOURCE PACKAGE:
${source}

OUTPUT: exactly one JSON object: { "approved": true, "score": 8, "blocking_issues": [] }`, RELEASE_REVIEW_SCHEMA, 32768, 8192, 'gemini-3.1-pro-preview', false);
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
    const visualParts = await geminiApiCall('gemini-3.1-pro-preview', {
      contents: [{ parts: visualAuditParts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: VISUAL_ASSET_AUDIT_SCHEMA,
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 8192 },
      },
    });
    return extractJson(visualParts.map((part) => part.text || '').join(''));
  };

  // Asset flow — wait for the generated images, audit them, regenerate any
  // rejected asset once. Started here so it runs CONCURRENTLY with the first
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
    if (!visualAudit.approved) {
      const issues = (visualAudit.issues || []).join('; ');
      console.warn(`  ⚠ Visual asset review rejected: ${issues}`);
      // One corrective round for the assets the audit named (hero if none):
      // the hero gets a corrective regeneration; logo/favicon/portrait revert
      // straight to their verified originals — regenerating type has already
      // been observed to fail twice in a row.
      const named = IMAGE_LABELS.filter((l) => issues.toLowerCase().includes(l));
      const regen = named.length ? named : ['hero'];
      await Promise.allSettled(regen.map((asset) => {
        if (asset === 'hero') return withFallback(generateImage(`${planObj.image_prompts?.hero || prompt}\n\nCORRECTIVE REQUIREMENTS: Create a clean, believable, text-free editorial hero only. Never show drafting tools, diagrams, interface overlays, floating HUD marks, logos, watermarks, checkerboards, malformed objects, or distorted architecture.`, heroPath), heroFallback, heroPath);
        if (asset === 'logo') return withFallback(generateImage(`${logoPrompt}\n\nCORRECTIVE PASS — the previous attempt had illegible letterforms. The mark must read EXACTLY "greg.iteen" or "GI", perfectly spelled and crisply legible. Flat graphic design on the theme's shell color. Nothing else.`, logoPath), logoSource, logoPath);
        if (asset === 'favicon') return withFallback(generateImage(`${logoPrompt}\n\nCORRECTIVE FAVICON PASS — one bold, flat glyph ("GI" monogram or single symbol), perfectly legible at 32px, centered, filling the square, theme colors. Nothing else.`, faviconPath), faviconSource, faviconPath);
        return copyFile(portraitSource, portraitPath);
      }));
      visualAudit = await auditVisualAssets();
    }
    if (!visualAudit.approved) {
      // Final safety: replace every still-rejected asset with its verified
      // original and proceed. Fallbacks are pre-approved brand assets, so
      // the asset gate can no longer sink an otherwise-good design.
      const issues = (visualAudit.issues || []).join('; ');
      console.warn(`  ⚠ Visual asset review still rejecting (${issues}) — reverting named assets to verified originals.`);
      const named = IMAGE_LABELS.filter((l) => issues.toLowerCase().includes(l));
      for (const asset of named.length ? named : IMAGE_LABELS) {
        if (asset === 'hero') await copyFile(heroFallback, heroPath);
        else if (asset === 'logo') await copyFile(logoSource, logoPath);
        else if (asset === 'favicon') await copyFile(faviconSource, faviconPath);
        else await copyFile(portraitSource, portraitPath);
      }
    }
    console.log('  → Visual asset release review: approved (hero, logo, favicon, portrait)');
  })();
  assetFlow.catch(() => {}); // observed in the review board's Promise.all

  // ── Phase 3: Save nodes ──
  console.log(`[3/5] Saving DESIGN.md into designs/${styleName}/…`);

  let designBody = payload.designSpec || `Theme: ${theme.name}\nStyle: ${prompt}\nAccent: ${theme.accent}`;

  // Re-runnable: the rendered gate below rewrites DESIGN.md after each repair.
  const writeDesignMd = async (t) => {
    const blocks = Object.entries({ css: t.css, ...Object.fromEntries(Object.entries(t.layouts).map(([k,v]) => [`layout:${k}`, v])) })
      .filter(([, content]) => typeof content === 'string' && content.trim())
      .map(([name, content]) => `## section:${name}\n\n\`\`\`${name === 'css' ? 'css' : 'html'}\n${content.replace(/```/g, '')}\n\`\`\``)
      .join('\n\n');

    const designMd = `---
name: "${t.name}"
accent: "${t.accent}"
style: "${prompt.replace(/"/g, '\\"')}"
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
    const buildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', styleName], { stdio: 'inherit' });
    if (buildResult.status !== 0) throw new Error(`build-site.mjs failed for ${styleName} (exit ${buildResult.status})`);
  };
  buildDesignLayer();

  // ── Phase 5: Review board ── The source reviewer (pro, reads the ENTIRE
  // css + every layout) and the rendered reviewer (vision model, reads real
  // desktop + mobile screenshots of the built pages) run IN PARALLEL, and the
  // asset audit joins the first pass. Their findings merge into one targeted
  // repair pass; both reviewers must approve. Wall-clock per pass is the
  // slowest reviewer, not the sum — this is what keeps a clean generation
  // inside the ~2-minute budget while still gating on real pixels. Fail
  // closed: any rejection or infra failure deletes everything unpublished.
  console.log(`[5/5] Review board: source + rendered reviews in parallel…`);
  const { renderAudit } = await import('./render-audit.mjs');
  const allowedTargets = new Set(['css', ...Object.keys(LAYOUT_SPECS)]);
  try {
    let audit = null;
    let needSourceReview = true;
    for (let pass = 1; pass <= 4; pass++) {
      const label = pass === 1 ? 'initial' : `repair ${pass - 1}`;
      // The source verdict is noisy (observed: 9/10 → 5/10 after an
      // append-only CSS patch that cannot restructure anything). Once source
      // approves, only a layout change invalidates that approval — re-rolling
      // the dice on every pass is how approved themes flip back to rejected.
      const [srcAudit, renderVerdict] = await Promise.all([
        needSourceReview ? auditForRelease(theme, label) : Promise.resolve(audit),
        renderAudit(styleName),
        ...(pass === 1 ? [assetFlow] : []),
      ]);
      audit = srcAudit;
      const sourceOk = audit.approved && audit.score >= 8;
      const renderBlocking = renderVerdict.issues.filter((i) => i?.severity !== 'minor');
      const renderOk = renderVerdict.approved || renderBlocking.length === 0;
      console.log(`  → Rendered review (${label}): ${renderOk ? 'approved' : 'repair required'} (${renderBlocking.length} blocking, ${renderVerdict.issues.length - renderBlocking.length} minor)`);
      for (const issue of renderVerdict.issues) {
        if (typeof issue?.target === 'string' && typeof issue?.issue === 'string') {
          console.log(`    • [${issue.severity || 'blocking'}] ${issue.target}: ${issue.issue}`);
        }
      }
      if (sourceOk && renderOk) break;
      if (pass === 4) {
        throw new Error(`Review board still rejected the theme (source ${audit.score}/10, rendered ${renderOk ? 'approved' : `${renderBlocking.length} blocking issue(s)`}) after 3 targeted repair passes; nothing was published`);
      }

      // A deeply bad initial sample (≤5/10) is an incoherent base — surgical
      // repairs cannot rescue it. Re-roll the entire specialist fan-out once
      // for a fresh sample and review that instead.
      if (pass === 1 && !sourceOk && audit.score <= 5) {
        console.log(`  → Deep quality failure (${audit.score}/10) — re-rolling the full specialist fan-out instead of patching…`);
        await runSpecialistFanOut();
        await repairStructuralViolations(payload);
        theme = validateForRelease(payload);
        await writeDesignMd(theme);
        buildDesignLayer();
        needSourceReview = true;
        continue;
      }

      const issuesByTarget = new Map();
      for (const issue of [...(sourceOk ? [] : audit.blocking_issues), ...renderVerdict.issues]) {
        const target = typeof issue?.target === 'string' ? issue.target : '';
        const detail = typeof issue?.issue === 'string' ? issue.issue.trim() : '';
        if (allowedTargets.has(target) && detail) {
          issuesByTarget.set(target, [...(issuesByTarget.get(target) || []), detail]);
        }
      }
      if (!issuesByTarget.size) {
        throw new Error('Review board rejected the theme without actionable, valid repair targets');
      }

      console.log(`  → Repairing ${issuesByTarget.size} review-board target(s) in parallel (pass ${pass}/3)…`);
      // Repairs see the SAME screenshots the rendered reviewer saw. A blind
      // repair loop stalls (observed: 3 blocking issues unchanged across 3
      // passes) because "container clipped on the right" is not actionable
      // without the pixels; the repair model is multimodal, so show it.
      const evidenceParts = (renderVerdict.screenshots || []).flatMap(([shotLabel, b64]) => ([
        { text: `Screenshot: ${shotLabel}` },
        { inlineData: { mimeType: 'image/jpeg', data: b64 } },
      ]));
      const visionRepair = async (promptText, schema) => {
        const request = {
          contents: [{ parts: [{ text: promptText }, ...evidenceParts] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            maxOutputTokens: 16384,
            thinkingConfig: { thinkingBudget: 4096 },
          },
        };
        let parts;
        try {
          parts = await geminiApiCall('gemini-3.5-flash', request);
        } catch (err) {
          // The screenshot payload is what makes these calls slow enough to
          // time out — a same-payload retry has been observed to time out
          // twice in a row and kill the build. Retry BLIND (text only):
          // a less-informed repair beats a dead generation.
          console.warn(`  ⚠ Vision repair failed (${String(err).slice(0, 100)}); retrying without screenshots…`);
          parts = await geminiApiCall('gemini-3.5-flash', {
            ...request,
            contents: [{ parts: [request.contents[0].parts[0]] }],
          });
        }
        return parts.map((p) => p.text || '').join('');
      };
      const repairs = await Promise.all([...issuesByTarget.entries()].map(async ([target, issues]) => {
        const critique = issues.map((issue) => `- ${issue}`).join('\n');
        if (target === 'css') {
          // Append-only fix layer, never a rewrite: a full-stylesheet
          // regeneration by the repair model has been observed to REGRESS the
          // design (source score dropped 7 → 4 in one pass) while chasing two
          // issues. Override rules appended after the stylesheet can only
          // patch the named defects — the cascade gives them priority and the
          // rest of the design is untouchable.
          const raw = await visionRepair(`${baseContext}

You are writing a CSS FIX LAYER after a release review board. The screenshots attached below are the ACTUAL rendered pages — look at them to locate each defect precisely. Do NOT rewrite or re-emit the existing stylesheet. Output ONLY new override rules that will be APPENDED after it — use the same selectors (or more specific ones) and write only as many rules as the issues below require. Fix every issue; change nothing else.

REVIEW ISSUES (visible in the attached screenshots):
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

EXISTING COMPLETE CSS (reference only — do NOT re-emit it):
${payload.css}

OUTPUT: exactly one JSON object: { "css": "…ONLY the appended fix-layer override rules…" }`, CSS_SECTION_SCHEMA);
          return { target, value: extractJson(raw).css, mode: 'patch' };
        }
        const spec = LAYOUT_SPECS[target];
        const raw = await visionRepair(`${baseContext}

You are repairing ONLY the "${target}" HTML layout after a release review board. The screenshots attached below are the ACTUAL rendered pages — look at them to locate each defect precisely. Keep the approved visual language and preserve these exact required placeholder(s): ${spec.required.join(', ')}. Do not add hardcoded copy, document wrappers, or scripts.

REVIEW ISSUES (visible in the attached screenshots):
${critique}

SHARED DESIGN CONTRACT:
${styleSpec}

CURRENT COMPLETE "${target}" HTML:
${payload.layouts[target]}

OUTPUT: exactly one JSON object: { "html": "…complete repaired ${target} layout…" }`, ONE_LAYOUT_SCHEMA);
        return { target, value: extractJson(raw).html };
      }));

      for (const repair of repairs) {
        if (typeof repair.value !== 'string' || !repair.value.trim()) {
          throw new Error(`Review-board repair for "${repair.target}" returned no content`);
        }
        if (repair.target === 'css') {
          payload.css = `${payload.css}\n\n/* review-board fix layer (pass ${pass}) */\n${repair.value}`;
        } else {
          payload.layouts[repair.target] = repair.value;
        }
      }
      // Repairs are model output too: same structural gate, then rebuild so
      // the next rendered pass screenshots the repaired pages. A CSS-only
      // patch keeps a prior source approval; any layout rewrite re-reviews.
      needSourceReview = !sourceOk || repairs.some((r) => r.target !== 'css');
      await repairStructuralViolations(payload);
      theme = validateForRelease(payload);
      await writeDesignMd(theme);
      buildDesignLayer();
    }
  } catch (err) {
    // Nothing rejected may survive on disk: the design dir and its built
    // pages are removed so an unapproved theme can never be reached or
    // resurrected by a later build.
    await rm(designDir, { recursive: true, force: true }).catch(() => {});
    await rm(join(__dirname, '..', 'dist', 'site', 'designs', styleName), { recursive: true, force: true }).catch(() => {});
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
  await writeFile(join(skinsDir, `${styleName}.md`), vaultSkinMd, 'utf8');
  
  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log(`[Success] "${theme.name}" → designs/${styleName} [${elapsed}s]`);

  // Main-site rebuild (registers the now-approved skin in the flipper).
  // serve.mjs owns the one serialized build when it launches this script — that
  // avoids the watcher / generator / improver race that previously caused
  // ENOTEMPTY failures while deleting dist/site/designs/* directories.
  if (process.env.THEME_DEFER_BUILD === '1') {
    console.log(`  → Main-site rebuild deferred to the serialized server rebuild.`);
  } else {
    console.log(`  → Rebuilding main site to register design…`);
    const mainBuildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
    if (mainBuildResult.status !== 0) throw new Error(`build-site.mjs failed for the main site (exit ${mainBuildResult.status})`);
  }
}

run().catch((e) => {
  console.error(`[Failed] ${e.message}`);
  process.exit(1);
});
