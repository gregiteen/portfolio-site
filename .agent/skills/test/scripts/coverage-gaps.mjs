#!/usr/bin/env node
/**
 * coverage-gaps.mjs
 *
 * Lists every scripts/lib/*.mjs file with no test importing it, by actually
 * parsing import statements in test/*.test.mjs — not a hardcoded list, so it
 * stays accurate as files are added on either side.
 *
 * Usage:
 *   node .agent/skills/test/scripts/coverage-gaps.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const LIB_DIR = path.join(ROOT, 'scripts/lib');
const TEST_DIR = path.join(ROOT, 'test');

const libFiles = readdirSync(LIB_DIR)
  .filter((f) => f.endsWith('.mjs'))
  .sort();

const testFiles = readdirSync(TEST_DIR).filter((f) => f.endsWith('.test.mjs'));

const importedLibBasenames = new Set();
const IMPORT_RE = /from\s+['"](.*?scripts\/lib\/([\w-]+)\.mjs)['"]/g;

for (const tf of testFiles) {
  const src = readFileSync(path.join(TEST_DIR, tf), 'utf8');
  for (const match of src.matchAll(IMPORT_RE)) {
    importedLibBasenames.add(match[2]);
  }
}

const covered = [];
const gaps = [];
for (const file of libFiles) {
  const base = file.replace(/\.mjs$/, '');
  (importedLibBasenames.has(base) ? covered : gaps).push(file);
}

console.log(`📋 scripts/lib coverage: ${covered.length}/${libFiles.length} files imported by a test.\n`);
console.log('✅ Covered:');
covered.forEach((f) => console.log(`  - ${f}`));
console.log('\n⬜ No test imports this file:');
if (!gaps.length) console.log('  (none — full coverage)');
gaps.forEach((f) => console.log(`  - ${f}`));

console.log('\nA gap here does not automatically mean "write a test now" — some of these are');
console.log('thin glue/prompt-data files. Use this list to make an informed call, not a mandate.');
