#!/usr/bin/env node
/**
 * list-designs.mjs
 *
 * Inventories the three places "design"-shaped content can live in this repo
 * so it's obvious which is which — this exact confusion (generated skins vs
 * real portfolio work) is called out repeatedly in openwiki/content-and-domains.md
 * as a recurring mistake:
 *
 *   - vault/pages/designs/   real portfolio design pages (repo-owned, committed)
 *   - vault/pages/skins/     generated skin *documents* (x_kind:theme-skin, runtime)
 *   - /designs/<slug>/       generated skin *build output* (runtime, gitignored)
 *
 * Usage:
 *   node .agent/skills/generator/scripts/list-designs.mjs
 */
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

function listDir(rel) {
  const full = path.join(ROOT, rel);
  if (!existsSync(full)) return null;
  return readdirSync(full).filter((f) => !f.startsWith('.'));
}

function section(title, rel, note) {
  const entries = listDir(rel);
  console.log(`\n${title}  (${rel})`);
  console.log(`  ${note}`);
  if (entries === null) {
    console.log('  — directory does not exist locally (expected if nothing has been generated/committed yet).');
  } else if (!entries.length) {
    console.log('  — empty.');
  } else {
    for (const e of entries) console.log(`  - ${e}`);
  }
}

console.log('🎨 Design/skin inventory — do not confuse these three:');

section(
  'Real portfolio designs (repo-owned, committed, belongs in the public Designs index)',
  'vault/pages/designs',
  'Add new real client/portfolio work here via scripts/promote-theme.mjs, never by hand-copying a generated skin.',
);

section(
  'Generated skin documents (runtime, x_kind:theme-skin, gitignored on the droplet)',
  'vault/pages/skins',
  'Written by compile-theme.mjs\'s atomic promotion step. These power the flipper — they are NOT real portfolio work and must never appear in the Designs index.',
);

section(
  'Generated skin build output (runtime, gitignored everywhere)',
  'designs',
  'Static build artifacts + images for each generated skin, written by compile-theme.mjs. Regenerated on demand; the repo intentionally ships none of these.',
);

console.log('\nIf a slug appears under vault/pages/skins/ or designs/ but you expected it in');
console.log('vault/pages/designs/, it has NOT been promoted as real portfolio work — run');
console.log('scripts/promote-theme.mjs <slug> deliberately if that\'s actually intended.');
