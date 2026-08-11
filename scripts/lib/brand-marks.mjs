// Brand-mark generation: an AI art-direction pass turns the design's own
// constitution into a concrete, palette-exact identity brief; that brief drives
// a themed brand kit (logo + favicon sketched together); then each mark is
// extracted individually on a chroma-key background, keyed transparent, and
// trimmed to content.
//
// Why the art-direction call exists: the previous prompt interpolated the raw
// theme string into a fixed template and told the image model to "EMBRACE THE
// THEME FULLY". That is not art direction — it is a wish. Measured on live
// runs, the model answered it with its own house style regardless of theme: a
// LEGO-brick design and a Paris-in-spring design both came back as an ornate
// scrollwork badge wrapped around the wordmark. Image models render CONCRETE
// NOUNS reliably and abstract enthusiasm not at all, so a text model now does
// the design thinking first and hands the image model specific objects,
// geometry, and hex values.
//
// Shared by compile-theme.mjs (initial generation AND same-candidate visual
// corrections) and regenerate-brand-marks.mjs (redoing marks for designs that
// already shipped). Both callers MUST go through buildMark rather than a
// bespoke generateImage call — a corrective pass that once wrote a raw
// generated PNG straight to disk produced a small mark stranded in a huge
// opaque canvas, because it skipped both the edge-to-edge composition
// instruction below and the background-removal/trim pipeline.
import { readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { generateImage } from './image-gen.mjs';
import { buildTransparentMark } from './logo-transparency.mjs';
import { extractJson } from './theme.mjs';
import { callOpenRouter } from './openrouter.mjs';

// Art direction is a creative + instruction-following task on a SMALL JSON
// output, so it gets a strong model rather than the pipeline's bulk text model
// (which is tuned for long CSS/layout generation). Overridable for the same
// reason THEME_TEXT_MODEL is.
const ART_DIRECTOR_MODEL = process.env.THEME_ART_DIRECTOR_MODEL || 'anthropic/claude-sonnet-5';

// Green, not white. Keying against white pits the key colour against the
// artwork — logo art is frequently white, cream or pale, and that collision
// is what erased a "GREG ITEEN" wordmark in an earlier run. Logo art is
// essentially never pure green, so the key and the mark cannot be confused,
// and the despill pass removes the rim it leaves behind.
export const KEY_BACKGROUND = '#00FF00 pure green (chroma key green screen)';

export const LOGO_SUBJECT = 'a single logo';
// "Do not return the standalone GI monogram" is load-bearing: a past skin
// shipped with the FAVICON ("GI") sitting in the logo slot, which is why its
// brand mark was a bare monogram instead of the wordmark.
export const LOGO_EXTRACTION = 'Extract the main logo wordmark ("GREG ITEEN") ALONG WITH its integrated graphic emblem or icon. The text "GREG ITEEN" and the thematic graphic elements must remain together as one unified logo. Do not isolate the text. DO NOT return the standalone square "GI" monogram — that is the separate favicon, not this asset. The words "GREG ITEEN" MUST be present and legible.';
export const FAVICON_SUBJECT = 'a single square favicon';
export const FAVICON_EXTRACTION = 'Extract the favicon typography ("GI") ALONG WITH its integrated graphic emblem or icon. The text "GI" and the thematic graphic elements must remain together as one unified icon. Do not isolate the text.';

// The generic marks an image model reaches for when a prompt gives it no
// concrete subject. Listed once and injected into BOTH the art-director brief
// (as a design constraint) and the final image prompt (as a negative prompt),
// because suppressing them at only one stage was not enough — the director
// would propose a real concept and the image model would still drift back.
const GENERIC_FALLBACK_MARKS = 'vintage badges, heraldic crests, shields, banners, crowns, laurel wreaths, ornate filigree or scrollwork frames, compass roses, sunbursts or starburst rays used as generic decoration, swooshes, generic "tech" hexagons, circuit-board traces, globes, and generic abstract swirls';

// Themes are the visitor's own words and routinely name a real franchise or
// product ("LEGOS", "MAD MAX"). Image models resolve a brand name in a logo
// prompt by drawing that brand's ACTUAL registered mark — a LEGOS run came
// back with the real LEGO® corporate logo locked up beside "GREG ITEEN",
// which is a trademark problem on a public site, not a taste problem. The
// guard runs at both stages: the art director must describe forms generically
// so the trademark name never reaches the image prompt, and the image prompt
// refuses real marks outright in case one slips through anyway.
const TRADEMARK_GUARD = 'Do not reproduce, imitate, or incorporate any real-world company logo, brand wordmark, registered trademark, franchise emblem, sports-team mark, or product logotype. The ONLY text anywhere in the image is "GREG ITEEN" and "GI"';

export const BRAND_ART_DIRECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    emblem_concept: { type: 'STRING' },
    emblem_construction: { type: 'STRING' },
    wordmark_typography: { type: 'STRING' },
    favicon_concept: { type: 'STRING' },
    palette: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { hex: { type: 'STRING' }, role: { type: 'STRING' } },
        required: ['hex', 'role'],
      },
    },
    composition: { type: 'STRING' },
    avoid: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: [
    'emblem_concept',
    'emblem_construction',
    'wordmark_typography',
    'favicon_concept',
    'palette',
    'composition',
    'avoid',
  ],
};

/**
 * Flatten whatever design context a caller has into one brief for the art
 * director. compile-theme.mjs has the live Director plan; regenerate-brand-
 * marks.mjs reconstructs an equivalent from a shipped DESIGN.md. A bare string
 * is accepted so a caller with only the raw user prompt still works.
 */
export function buildThemeBrief(themeContext) {
  if (typeof themeContext === 'string') return `Theme: "${themeContext}"`;
  const {
    style, name, accent, colors, typography, imageTreatment, signatureGesture,
  } = themeContext || {};
  const lines = [];
  if (style) lines.push(`Theme (the visitor's own words): "${style}"`);
  if (name && name !== style) lines.push(`Concept name the design ships under: "${name}"`);
  if (accent) lines.push(`Primary brand accent already used across the live pages: ${accent}`);
  if (colors) lines.push(`Full colour token set: ${colors}`);
  if (typography) lines.push(`Typography token set: ${typography}`);
  if (imageTreatment) lines.push(`How this design treats imagery: ${imageTreatment}`);
  if (signatureGesture) lines.push(`The design's signature gesture: ${signatureGesture}`);
  return lines.join('\n');
}

const ART_DIRECTOR_PROMPT = (brief) => `You are a world-class brand identity designer — the calibre that ships identities out of Pentagram or Collins. Design a personal brand identity for GREG ITEEN, a full-stack engineer who builds local-first, file-native AI systems where the filesystem is the database and users keep custody of their own data.

The identity must be a bespoke expression of ONE specific design world, given below. Your output is an art-direction brief that a text-to-image model will render literally, so every instruction must be CONCRETE enough to draw without interpretation.

═══ THE DESIGN WORLD ═══
${brief}

═══ WHAT TO DESIGN ═══
1. THE LOGO — a graphic emblem locked up beside the exact words "GREG ITEEN".
2. THE FAVICON — a SEPARATE square icon containing the letters "GI".

═══ REQUIREMENTS ═══
• emblem_concept: name the CONCRETE OBJECTS or STRUCTURES the emblem is built from, and they must literally belong to this design world. "A 2x4 studded brick drawn in true orthographic plan, studs reading as a row of filled circles" is usable. "A dynamic shape evoking creativity and innovation" is a failure.
• emblem_construction: exact geometry — counts, proportions, stroke weights, angles, symmetry, how negative space is used. A competent designer should be able to redraw your mark from this sentence alone.
• wordmark_typography: precise letterform treatment for "GREG ITEEN" — weight, width, case, letter-spacing, terminals, any custom cut or ligature. It must sit in the same family of feeling as the design world's display face.
• favicon_concept: how "GI" is set, and how it relates to the emblem without simply repeating it. It has to hold up as a 32px browser-tab icon.
• palette: pick from the supplied colour tokens and return EXACT HEX values (convert any OKLCH to hex yourself). Assign each a role. Prefer 2–4 colours; a restrained palette reads as premium, a rainbow reads as clip-art. If the tokens are essentially neutral, say so and let one accent carry the whole mark.
• composition: how the two marks sit on one white sheet — relative scale, spacing, alignment — with clear separation so they can be cropped apart afterward.
• avoid: 3–6 specific traps for THIS design world — the clichés a lazy designer would reach for when handed this exact theme.

═══ HARD CONSTRAINTS ═══
• Strictly 2D flat vector. No 3D, bevels, embossing, drop shadows, gloss, gradient meshes, or photographic texture.
• Both marks must stay legible at 32px: no hairlines, no fine interior detail.
• NEVER use these generic fallbacks — every one of them means you did not engage with the actual design world: ${GENERIC_FALLBACK_MARKS}.
• TRADEMARK SAFETY — this is absolute. The design world above may name a real company, franchise, film, or product. You are designing GREG ITEEN's identity, never theirs. NEVER name a real brand, franchise, or product anywhere in your brief: an image model that reads a brand name in a logo prompt will draw that brand's actual registered logo. Describe the FORM generically instead — "a studded interlocking plastic toy brick in orthographic plan" is correct; "a LEGO brick" is a trademark violation waiting to be rendered. Take the design world's shapes, materials, colours and mood; take none of its branding.

═══ THE TEST ═══
Before you answer, swap this design world for an unrelated one. Would your emblem still make sense? If yes, it is too generic — throw it out and design the specific thing.`;

/**
 * Run the art-direction pass. Returns a validated direction object, or null if
 * the call fails — callers fall back to the fixed template prompt rather than
 * losing the asset entirely.
 */
export async function artDirectBrandKit(themeContext) {
  const brief = buildThemeBrief(themeContext);
  try {
    const raw = await callOpenRouter({
      model: ART_DIRECTOR_MODEL,
      prompt: ART_DIRECTOR_PROMPT(brief),
      schema: BRAND_ART_DIRECTION_SCHEMA,
      // Small structured output, so a high reasoning budget is cheap here and
      // buys materially better concepts. (The bulk CSS/layout calls run 'low'
      // for the opposite reason — there, reasoning crowds out the payload.)
      maxTokens: 8192,
      reasoningEffort: 'high',
    });
    const direction = extractJson(raw);
    if (!direction?.emblem_concept) return null;
    console.log(`  → Art direction: ${direction.emblem_concept}`);
    if (Array.isArray(direction.palette) && direction.palette.length) {
      console.log(`    palette: ${direction.palette.map((p) => `${p.hex} ${p.role}`).join(' · ')}`);
    }
    return direction;
  } catch (error) {
    console.warn(`  ⚠ Art direction failed (${error.message}); falling back to the template brand-kit prompt.`);
    return null;
  }
}

/** Fixed-template prompt — the fallback when art direction is unavailable. */
export const brandKitPrompt = (themePrompt) => `Subject: A flat, 2D digital graphic on a perfectly solid #FFFFFF white background. It must contain TWO completely separate designs on the same canvas: a Logo and a Favicon.\nContext: Digital asset.\nStyle: THE THEME IS "${themePrompt}". EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. Pick a primary and accent color that perfectly match the "${themePrompt}" theme. Design it like a world-class agency. NO 2008 DESIGNS. NO BASIC SHIT.\n\nCRITICAL LAYOUT INSTRUCTION: You must draw TWO separate items:\n1. THE LOGO: A highly creative graphic emblem (fitting the "${themePrompt}" theme) placed next to the exact words "GREG ITEEN". Do NOT put the letters "GI" inside this graphic emblem.\n2. THE FAVICON: A completely separate, standalone square icon spelling exactly "GI".\nDO NOT combine the Favicon text into the Logo's graphic emblem. Keep them distinct.\n\nANTI-PATTERN — DO NOT DEFAULT TO THIS: ${GENERIC_FALLBACK_MARKS}. Every visual element must be a concrete, literal object or motif drawn FROM "${themePrompt}" itself.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. NO CLIP-ART. NO GENERIC AI SHAPES. The background MUST be perfectly solid #FFFFFF white.`;

/** Build the image prompt for the two-up brand kit from an art-direction brief. */
export function composeBrandKitPrompt(direction) {
  const palette = (direction.palette || []).map((p) => `${p.hex} (${p.role})`).join(', ');
  const avoid = [...(direction.avoid || []), GENERIC_FALLBACK_MARKS].join('; ');
  return `Subject: A flat 2D vector brand identity sheet on a perfectly solid #FFFFFF white background, containing TWO clearly separated marks.

MARK 1 — THE LOGO: ${direction.emblem_concept}
Construction: ${direction.emblem_construction}
Locked up beside it, the exact words "GREG ITEEN", set as: ${direction.wordmark_typography}
The emblem and the wordmark read as ONE unified logo. Do not place the letters "GI" inside this emblem.

MARK 2 — THE FAVICON: a completely separate, standalone square icon containing exactly the letters "GI". ${direction.favicon_concept}
Keep it visually distinct from and physically separated from the logo above. Do not merge it into the logo.

COLOR: use only these exact colors — ${palette}. No other hues anywhere in the image.

COMPOSITION: ${direction.composition} Both marks drawn large and clearly separated, on a perfectly solid #FFFFFF white background.

RENDERING: strictly 2D flat vector artwork. Crisp geometry, clean hard edges, solid flat fills. Precise, intentional, premium — the work of a world-class identity studio. Both marks must stay fully legible at 32 pixels.

DO NOT DRAW: ${avoid}. No 3D effects, bevels, embossing, drop shadows, gloss, gradient meshes, photographic texture, product mockups, physical objects, or clip-art. ${TRADEMARK_GUARD}. The background must be perfectly solid #FFFFFF white, edge to edge.`;
}

export const markPrompt = (subject, size, extraction, background, concept = '') => `Subject: A flat, 2D digital graphic on a perfectly solid ${background} background. It is ${subject} extracted from the provided Brand Kit image in ${size} size.\nContext: Digital asset.\nStyle: EMBRACE THE THEME FULLY, BUT EXECUTE IT WITH A HIGH-END, PREMIUM ARTISTIC VISION. ${extraction} MATCH THE AESTHETIC OF THE BASE IMAGE PERFECTLY.${concept ? `\n\nTHE MARK YOU ARE EXTRACTING IS: ${concept} Reproduce it faithfully from the base image — same concept, same geometry, same colours.` : ''}\n\nCOMPOSITION: Draw the mark large, filling the canvas edge to edge with only a small even margin. Do not centre a small mark in a large empty field.\n\nHARD CONSTRAINT: This must be a strictly 2D FLAT vector style graphic. DO NOT use 3D effects, bevels, embossing, drop shadows, or gloss. DO NOT generate physical objects. ${TRADEMARK_GUARD}. The background MUST be perfectly solid ${background}, edge to edge, with nothing else on it. Render the artwork itself IDENTICALLY regardless of the background colour.`;

/**
 * Art-direct and generate the two-up logo+favicon sketch a single mark is
 * later extracted from.
 *
 * @returns {{ok: boolean, direction: object|null}} `direction` is threaded into
 *   buildMark so the extraction call restates the concept instead of relying on
 *   image-to-image alone to carry it.
 */
export async function generateBrandKit(themeContext, outputPath, model) {
  const direction = await artDirectBrandKit(themeContext);
  const style = typeof themeContext === 'string' ? themeContext : (themeContext?.style || '');
  const prompt = direction ? composeBrandKitPrompt(direction) : brandKitPrompt(style);
  const ok = await generateImage(prompt, outputPath, null, model).catch(() => false);
  return { ok, direction };
}

/**
 * Renders one mark (white/black pair when matting is enabled), mattes/keys it
 * transparent, trims it to content, and writes the result. Every step is
 * awaited — a floating write-back previously let the opaque original race the
 * transparent version to disk.
 *
 * @param {string} targetPath final asset path, e.g. designs/<slug>/assets/logo.png
 * @param {string} sourceFallback verified asset to fall back to if generation/matting fails
 * @param {string} basePath   image-to-image base: the brand kit on success, a verified fallback otherwise
 * @param {string} concept    one-line restatement of the art-directed mark, if any
 */
export async function buildMark(targetPath, subject, size, extraction, sourceFallback, basePath, concept = '') {
  const whitePath = `${targetPath}.white.png`;
  const blackPath = `${targetPath}.black.png`;
  const base = basePath || sourceFallback;
  const label = targetPath.split('/').pop();
  try {
    await generateImage(markPrompt(subject, size, extraction, KEY_BACKGROUND, concept), whitePath, base);
    // Second render only when matting is explicitly enabled: the image model
    // redraws the mark at a different position/scale between runs, so the
    // pair usually cannot be subtracted (measured: a double-exposure ghost).
    // Keying the green screen is the reliable path; matting stays available
    // behind a flag.
    let blackOk = false;
    if (process.env.THEME_MARK_MATTE === '1') {
      try {
        await generateImage(markPrompt(subject, size, extraction, '#000000 black', concept), blackPath, base);
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
      if (sourceFallback) await copyFile(sourceFallback, targetPath);
      return false;
    }
    await writeFile(targetPath, result.buffer);
    console.log(`  → ${label}: transparent via ${result.method} (${Math.round(result.buffer.length / 1024)}KB)`);
    return true;
  } catch (error) {
    console.warn(`  ⚠ ${label}: generation failed (${error.message}); keeping the verified brand asset.`);
    if (sourceFallback) await copyFile(sourceFallback, targetPath).catch(() => {});
    return false;
  } finally {
    await rm(whitePath, { force: true }).catch(() => {});
    await rm(blackPath, { force: true }).catch(() => {});
  }
}
