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
          if (!json.candidates?.[0]?.content?.parts) {
            return reject(new Error(`Gemini API error: ${data.slice(0, 300)}`));
          }
          resolve(json.candidates[0].content.parts);
        } catch (e) {
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

async function geminiText(userPrompt) {
  const parts = await geminiApiCall('gemini-3.5-flash', {
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });
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
  const basePortrait = join(assetsDir, 'greg-portrait-base.jpg');

  // ── Phase 1: Planning and Architecture (including Image Prompts) ──
  console.log(`[1/3] Theme Architecture and Image Planning…`);

  const frontendSkillPath = join(__dirname, '..', '.agent', 'skills', 'frontend-design', 'SKILL.md');
  const frontendSkill = await import('node:fs/promises').then(m => m.readFile(frontendSkillPath, 'utf8')).catch(() => '');

  const baseContext = `You are the design lead at a boutique studio. Every site you ship has a visual identity so specific it could never be mistaken for a template. You are designing for a REAL client — Greg Iteen, a full-stack engineer who builds local, file-native AI systems.

CRITICAL DIRECTIVE: NO TRITE DESIGNS. ALL MUST BE BESPOKE, AGENCY LEVEL DESIGNS. NO AI SLOP. Do NOT output crappy cyberpunk AI slop. You MUST write custom HTML with awesome, interactive frontend features. Avoid generic gradients, overused tech aesthetics, or lazy layouts. Push the visual envelope and write real, bespoke code.

THE BRIEF: "${prompt}"

FRONTEND DESIGN PRINCIPLES & GUIDANCE:
${frontendSkill}

SITE CONTEXT:
${SITE_CONTEXT}

PLACEHOLDER CONTRACT:
${placeholderContract}

IMAGES (already generated, use them):
- assets/logo.png — GI monogram, transparent PNG. Use as logo.
- assets/favicon.png — GI favicon. Use in <link rel="icon">.
- assets/hero.jpg — hero background. Use prominently.
- assets/portrait.jpg — portrait of Greg restyled to match this theme. It appears inside page content (class .md-img) on the contact page — style it to sit well in your layout.
`;

  async function callAgent(p) {
    if (GOOGLE_API_KEY) {
      try {
        const raw = await geminiText(p);
        console.log(`  → API response (${Math.round(raw.length / 1024)}KB)`);
        return raw;
      } catch (err) {
        console.error('Icon conversion failed:', String(err));
      }
    }
    return executeAgentCall(p);
  }

  // Pass 1: Planning and Architecture
  console.log('  → Pass 1: Planning and Architecture');
  let rawPlan = await callAgent(`${baseContext}

You are starting a new design build. Before writing any code, you must deeply plan out the architecture and visual identity.
1. Analyze the brief.
2. Decide on typography, color palette, layouts, and interactive elements.
3. Critique your own plan and improve it to make it radically bespoke. Do NOT settle for the first idea.
4. Write 3 image generation prompts (logo, favicon, hero background) that perfectly fit this bespoke design. For the logo and favicon, DO NOT just use generic monograms if it doesn't fit the design.

OUTPUT: Return exactly one JSON object with your plan and image prompts:
{
  "thought_process": "Your deep analysis and critique...",
  "image_prompts": {
    "logo": "Create a logo for Greg Iteen. Style: [Your bespoke style]. CRITICAL: FULLY TRANSPARENT background (PNG alpha)...",
    "favicon": "Crop and optimize the provided logo into a tiny square favicon (64x64). TRANSPARENT background...",
    "hero": "Create an atmospheric, wide hero background image... Cinematic quality, 16:9..."
  }
}`);
  let planObj = extractJson(rawPlan);
  let plan = planObj.thought_process || 'No plan provided.';
  
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

  // Pass 2: Base CSS & Core Pages
  console.log('  → Pass 2: DESIGN.md, CSS, home, projects_index');
  let raw1 = await callAgent(`${baseContext}

Here is your approved architectural plan:
${plan}

OUTPUT: One JSON object. Generate the DESIGN.md, the complete CSS, and the first 2 pages (home, projects_index):
{
  "name": "Short Theme Name",
  "accent": "#rrggbb",
  "designSpec": "A strict Google Standard DESIGN.md file format...",
  "css": "…complete stylesheet…",
  "layouts": { "home": "…", "projects_index": "…" }
}`);
  let payload = extractJson(raw1);

  // Pass 2: Next 2 pages
  console.log('  → Pass 2: designs_index, project_detail');
  let raw2 = await callAgent(`${baseContext}

Here is the base theme generated so far:
` + JSON.stringify(payload) + `

OUTPUT: One JSON object containing ONLY the next 2 layouts (designs_index, project_detail):
{
  "layouts": { "designs_index": "…", "project_detail": "…" }
}`);
  let payload2 = extractJson(raw2);
  Object.assign(payload.layouts, payload2.layouts);

  // Pass 3: Next 2 pages
  console.log('  → Pass 3: design_detail, page');
  let raw3 = await callAgent(`${baseContext}

Here is the base theme generated so far:
` + JSON.stringify(payload) + `

OUTPUT: One JSON object containing ONLY the next 2 layouts (design_detail, page):
{
  "layouts": { "design_detail": "…", "page": "…" }
}`);
  let payload3 = extractJson(raw3);
  Object.assign(payload.layouts, payload3.layouts);

  // Pass 4: Remaining items
  console.log('  → Pass 4: project_item, design_item, nav_item');
  let raw4 = await callAgent(`${baseContext}

Here is the base theme generated so far:
` + JSON.stringify(payload) + `

OUTPUT: One JSON object containing ONLY the remaining item layouts:
{
  "layouts": { "project_item": "…", "design_item": "…", "nav_item": "…" }
}`);
  let payload4 = extractJson(raw4);
  Object.assign(payload.layouts, payload4.layouts);

  // Pass 5: Analyze and Improve
  console.log('  → Pass 5: Analyze & Improve (Cleanup)');
  let raw5 = await callAgent(`${baseContext}

You have generated a full theme. Here is the complete assembled JSON:
` + JSON.stringify(payload) + `

ANALYZE AND IMPROVE: Make a second pass to clean everything up. Check for unclosed HTML tags, ensure CSS classes match the layouts, and ensure the design principles and DESIGN.md constraints were perfectly followed. Improve any sloppy areas.

OUTPUT: The FINAL cleaned up, validated JSON object with all fields:
{ "name": "...", "accent": "...", "designSpec": "...", "css": "...", "layouts": { ...all 9 layouts... } }`);
  
  let finalPayload = extractJson(raw5);
  let verdict = validateThemePayload(finalPayload, { strict: true });
  
  if (!verdict.theme) {
    console.log('  → Repairing final validation errors...');
    let raw6 = await callAgent(`Fix these JSON problems:\n${verdict.errors.join('\n')}\n\nRespond ONLY with corrected JSON.\n\nPrevious:\n${JSON.stringify(finalPayload).slice(0, 50000)}`);
    finalPayload = extractJson(raw6);
    verdict = validateThemePayload(finalPayload, { strict: false });
  }

  if (!verdict.theme) throw new Error(`Theme failed: ${verdict.errors.join('; ')}`);
  for (const w of verdict.warnings) console.warn(`  ⚠ ${w}`);
  const theme = verdict.theme;
  payload = finalPayload;
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
  designBody += `\n\n<br>\n<hr>\n\n### Architecture by Greg Iteen\n\n> **Generative Design Infrastructure**  \n> This interface and underlying design system were procedurally generated using an AI-native build engine. The architecture bypasses traditional databases in favor of stateless, strictly typed markup pipelines.\n\n**Infrastructure Consultation Offer**\nWe assist select organizations in migrating to fully automated, AI-driven digital architectures. Mention this design specification during your initial inquiry to receive a 20% credit toward your first architectural audit.\n\n**Website:** [gregiteen.xyz](https://gregiteen.xyz)  \n**Direct Inquiry:** [sales@gregiteen.xyz](mailto:sales@gregiteen.xyz)`;

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

  // Write the portfolio entry so it shows up on the main site's Designs index
  const designMeta = {
    slug: `design-${styleName}`,
    name: theme.name,
    title: `${theme.name} — Design Spec`,
    description: `AI-generated design: "${prompt}"`,
    timestamp: new Date().toISOString(),
    sandbox_entry: `designs/${styleName}/index.html`,
    x_kind: 'design',
    x_year: new Date().getFullYear(),
    x_role: 'AI-Generated Theme',
    x_client: 'Portfolio Generator',
    x_tags: ['AI Generated', 'Theme'],
    x_preview: `/designs/${styleName}/assets/hero.jpg`,
    x_logo: `/designs/${styleName}/assets/logo.png`,
    x_link: `/designs/${styleName}/index.html`
  };
  const specFm = Object.entries(designMeta)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map(t => `  - "${t}"`).join('\n')}`;
      return `${k}: ${JSON.stringify(String(v))}`;
    }).join('\n');
  
  await writeFile(
    join(vaultDir, 'pages', 'designs', `${styleName}.md`),
    `---\ntype: page\n${specFm}\n---\n\n${(payload.designSpec || '').trim() || `Generated design for: ${prompt}`}\n`,
    'utf8'
  );

  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log(`[Success] "${theme.name}" → designs/${styleName} [${elapsed}s]`);

  // ── Phase 4: Build HTML ──
  console.log(`[4/4] Building isolated HTML...`);
  const buildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', styleName], { stdio: 'inherit' });
  if (buildResult.status !== 0) {
    console.warn(`  ⚠ build-site.mjs exited with code ${buildResult.status}`);
  }

  console.log(`[4/4] Rebuilding main site to register design...`);
  const mainBuildResult = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs')], { stdio: 'inherit' });
  if (mainBuildResult.status !== 0) {
    console.warn(`  ⚠ build-site.mjs (main) exited with code ${mainBuildResult.status}`);
  }
}

run().catch((e) => {
  console.error(`[Failed] ${e.message}`);
  process.exit(1);
});
