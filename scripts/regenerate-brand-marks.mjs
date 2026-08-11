#!/usr/bin/env node
// Redo the logo + favicon for one or more ALREADY-GENERATED designs, using a
// fresh brand kit and the same buildMark pipeline compile-theme.mjs uses for
// the initial generation (background removal + edge-to-edge trim). Existing
// assets are backed up first and used as the fallback if a regeneration
// fails, so a bad run degrades to "unchanged," never "broken."
//
// Usage:
//   node scripts/regenerate-brand-marks.mjs <slug> [<slug> ...]
//   node scripts/regenerate-brand-marks.mjs --all

import { readFile, copyFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMAGE_MODEL_LITE } from './lib/openrouter.mjs';
import {
  LOGO_SUBJECT,
  LOGO_EXTRACTION,
  FAVICON_SUBJECT,
  FAVICON_EXTRACTION,
  generateBrandKit,
  buildMark,
} from './lib/brand-marks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const designsDir = join(repoRoot, 'designs');

// Unlike compile-theme.mjs (only ever run as a child of serve.mjs, which
// already loaded .env into its own process before spawning), this script is
// meant to be run standalone — it needs to load .env itself. Node 20.12+.
try { process.loadEnvFile(join(repoRoot, '.env')); } catch { /* no .env — rely on real env */ }

// Reconstruct the same design context compile-theme.mjs hands its art director
// at generation time, from what a shipped DESIGN.md still carries.
//
// DESIGN.md frontmatter values are written with JSON.stringify (see
// compile-theme.mjs's writeDesignMd), so JSON.parse is the exact inverse — no
// bespoke YAML unescaping needed. The token_colors field is the one that
// matters most: it holds the design's real palette (hex + OKLCH), which is
// what lets the art director specify exact brand colours instead of inventing
// its own. The bare `style` field alone ("LEGOS") produced marks with no
// relationship to either the theme or the page they sit on.
async function readThemeContext(slug) {
  const designMdPath = join(designsDir, slug, 'DESIGN.md');
  const raw = await readFile(designMdPath, 'utf8');
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) throw new Error(`${slug}: DESIGN.md has no frontmatter block`);
  const field = (name) => {
    const line = frontmatter[1].split('\n').find((l) => l.startsWith(`${name}:`));
    if (!line) return null;
    try { return JSON.parse(line.slice(name.length + 1).trim()); } catch { return null; }
  };
  // Constitution values that have no frontmatter mirror are pulled from the
  // embedded JSON block instead.
  const fromConstitution = (key) => {
    const match = raw.match(new RegExp(`"${key}":\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (!match) return null;
    try { return JSON.parse(`"${match[1]}"`); } catch { return null; }
  };
  const style = field('style');
  if (!style) throw new Error(`${slug}: DESIGN.md frontmatter has no "style" field`);
  return {
    style,
    name: field('name'),
    accent: field('accent'),
    colors: field('token_colors') || fromConstitution('colors'),
    typography: field('token_typography') || fromConstitution('typography'),
    imageTreatment: fromConstitution('imageTreatment'),
    signatureGesture: field('signature_gesture') || fromConstitution('signatureGesture'),
  };
}

async function regenerateOne(slug) {
  const assetsDir = join(designsDir, slug, 'assets');
  if (!existsSync(assetsDir)) throw new Error(`${slug}: no assets/ directory under designs/${slug}`);

  const themeContext = await readThemeContext(slug);
  console.log(`\n[${slug}] theme: "${themeContext.style}"${themeContext.name && themeContext.name !== themeContext.style ? ` — ${themeContext.name}` : ''}`);

  const logoPath = join(assetsDir, 'logo.png');
  const faviconPath = join(assetsDir, 'favicon.png');
  const backupDir = join(assetsDir, 'pre-regen-backup');
  await mkdir(backupDir, { recursive: true });
  const logoBackup = join(backupDir, 'logo.png');
  const faviconBackup = join(backupDir, 'favicon.png');
  if (existsSync(logoPath)) await copyFile(logoPath, logoBackup);
  if (existsSync(faviconPath)) await copyFile(faviconPath, faviconBackup);

  const brandKitPath = join(assetsDir, 'brandkit.png');
  const { ok: kitSuccess, direction } = await generateBrandKit(themeContext, brandKitPath, IMAGE_MODEL_LITE);
  if (!kitSuccess) console.warn(`  ⚠ ${slug}: brand kit generation failed; extracting marks from the previous asset instead.`);

  const [logoOk, faviconOk] = await Promise.all([
    buildMark(logoPath, LOGO_SUBJECT, '1200x630', LOGO_EXTRACTION, logoBackup, kitSuccess ? brandKitPath : logoBackup, direction?.emblem_concept || ''),
    buildMark(faviconPath, FAVICON_SUBJECT, '512x512', FAVICON_EXTRACTION, faviconBackup, kitSuccess ? brandKitPath : faviconBackup, direction?.favicon_concept || ''),
  ]);

  return { slug, kitSuccess, logoOk, faviconOk, concept: direction?.emblem_concept || null };
}

async function main() {
  const args = process.argv.slice(2);
  let slugs = args.filter((a) => !a.startsWith('-'));
  if (args.includes('--all')) {
    const entries = await readdir(designsDir, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory() && existsSync(join(designsDir, e.name, 'DESIGN.md'))).map((e) => e.name);
  }
  if (!slugs.length) {
    console.error('Usage: node scripts/regenerate-brand-marks.mjs <slug> [<slug> ...] | --all');
    process.exitCode = 1;
    return;
  }

  console.log(`Regenerating brand marks for: ${slugs.join(', ')}`);
  const results = [];
  for (const slug of slugs) {
    try {
      const result = await regenerateOne(slug);
      results.push(result);
      // designs/<slug>/assets/ is the SOURCE tree; the live site is served
      // from dist/site/designs/<slug>/, which build-site.mjs populated with
      // its own copy at generation time. Without this rebuild the freshly
      // regenerated PNGs would sit on disk unseen by any visitor.
      console.log(`  → rebuilding dist/site/designs/${slug}/ …`);
      const build = spawnSync(process.execPath, [join(__dirname, 'build-site.mjs'), '--design', slug], { stdio: 'inherit' });
      if (build.status !== 0) console.error(`  ⚠ ${slug}: build-site.mjs exited ${build.status}; live assets may still be stale.`);
    } catch (error) {
      console.error(`[${slug}] FAILED: ${error.message}`);
      results.push({ slug, error: error.message });
    }
  }

  console.log('\n── Summary ──');
  for (const r of results) {
    if (r.error) {
      console.log(`  ${r.slug}: ERROR — ${r.error}`);
    } else {
      console.log(`  ${r.slug}: brandkit=${r.kitSuccess ? 'ok' : 'fallback'} logo=${r.logoOk ? 'ok' : 'fallback'} favicon=${r.faviconOk ? 'ok' : 'fallback'}`);
    }
  }
}

main().catch((error) => {
  console.error(`[Failed] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
