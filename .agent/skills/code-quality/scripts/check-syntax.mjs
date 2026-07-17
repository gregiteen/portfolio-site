#!/usr/bin/env node
/**
 * check-syntax.mjs
 *
 * This repo has no TypeScript and no ESLint installed (plain .mjs/.js Node
 * code, no tsconfig.json, no eslint config, no `typescript`/`eslint` deps in
 * package.json). There is nothing for `tsc`/`eslint` to run against.
 *
 * This script is the real, honest substitute: it walks every .mjs/.js/.cjs
 * file in the repo (excluding node_modules, dist, designs, .theme-staging,
 * and other generated/vendored trees) and runs `node --check` on each one,
 * which parses the file without executing it and catches syntax errors —
 * the class of mistake most likely from a bad edit.
 *
 * Usage:
 *   node .agent/skills/code-quality/scripts/check-syntax.mjs
 *
 * Exits 0 if every file parses cleanly, 1 otherwise.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

const EXCLUDE_DIRS = new Set([
  'node_modules', 'dist', '.git', 'designs', '.theme-staging',
  '.data', '.agents', '.claude', '.remember', '.vscode', '.github',
]);
const EXTENSIONS = new Set(['.mjs', '.js', '.cjs']);

function collectFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      collectFiles(full, out);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const files = collectFiles(ROOT);

  const failures = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      failures.push({ file: rel, output: (result.stderr || result.stdout || '').trim() });
    }
  }

  console.log(`🔎 Checked ${files.length} JS files for syntax errors.`);
  if (!failures.length) {
    console.log('✅ No syntax errors found.');
    process.exit(0);
  }

  console.log(`\n🚨 ${failures.length} file(s) failed to parse:\n`);
  for (const { file, output } of failures) {
    console.log(`📂 ${file}`);
    console.log(`  ${output.split('\n').join('\n  ')}\n`);
  }
  process.exit(1);
}

main();
