#!/usr/bin/env node
/**
 * vault-stats.mjs — snapshot of this repo's "database": the vault/ filesystem
 * and the .data/ runtime store.
 *
 * Usage:
 *   node .agent/skills/database/scripts/vault-stats.mjs
 *
 * Read-only and side-effect free (deliberately does NOT import runtime-store.mjs,
 * whose module init touches the filesystem). Reports document counts per vault
 * area, type frontmatter distribution, and runtime-store file freshness —
 * the first thing to look at when CRM data "disappears" or a deploy is suspected
 * of clobbering state.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const VAULT = path.join(ROOT, 'vault');
const DATA = path.join(ROOT, '.data');

function mdFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function frontmatterType(file) {
  const head = readFileSync(file, 'utf8').slice(0, 500);
  const m = head.match(/^---[\s\S]*?\btype:\s*([\w-]+)/);
  return m ? m[1] : '(none)';
}

console.log(`Vault root: ${VAULT}\n`);
const areas = readdirSync(VAULT, { withFileTypes: true }).filter((e) => e.isDirectory());
const typeCounts = new Map();
for (const area of areas) {
  const files = mdFiles(path.join(VAULT, area.name));
  console.log(`vault/${area.name}: ${files.length} doc(s)`);
  for (const f of files) {
    const t = frontmatterType(f);
    typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
  }
}

console.log('\nDocument types (frontmatter `type:`):');
for (const [t, n] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)} × ${t}`);
}

console.log('\nRuntime store (.data/):');
if (!existsSync(DATA)) {
  console.log('  (absent — normal on a fresh checkout; production state lives on the droplet, rsync-excluded)');
} else {
  for (const e of readdirSync(DATA)) {
    const st = statSync(path.join(DATA, e));
    console.log(`  ${e} — ${st.size} bytes, modified ${st.mtime.toISOString()}`);
  }
}

console.log('\nReminder: production .data/ and vault/runtime/ exist ONLY on the droplet');
console.log('(deploy.sh rsync-excludes them — see database/hooks/pre-deploy-data-guard.sh).');
