#!/usr/bin/env node
/**
 * check-generator-env.mjs
 *
 * Reports which env vars/flags control the theme generator pipeline, WITHOUT
 * printing secret values. The pipeline silently changes behavior based on
 * these (falls back to CLI agents, defers builds, enables a legacy cron) —
 * confirm what's actually active before debugging "generation looks wrong."
 *
 * Usage:
 *   node .agent/skills/generator/scripts/check-generator-env.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* rely on real env */ }

const FLAGS = [
  { name: 'GOOGLE_API_KEY', kind: 'secret', note: 'required for the Director, CSS/layout specialists, image gen, and the render-audit vision review. Without it, ALLOW_CLI_THEME_FALLBACK=1 permits falling back to local CLI agents (antigravity > claude > codex, first on PATH wins).' },
  { name: 'ALLOW_CLI_THEME_FALLBACK', kind: 'flag', note: 'set to "1" to permit the CLI-agent fallback path when GOOGLE_API_KEY is absent.' },
  { name: 'THEME_DEFER_BUILD', kind: 'flag', note: 'used by serve.mjs to serialize main-site rebuilds after a generation completes, avoiding dist/site race conditions. Not meaningful when running compile-theme.mjs standalone.' },
  { name: 'ENABLE_LEGACY_THEME_IMPROVER', kind: 'flag', note: 'opt-in for improve-theme.mjs\'s 3am cron. OFF by default and should generally stay off — its repair prompts are text-only (no screenshots), demoted for exactly that reason. See SKILL.md.' },
  { name: 'RENDER_AUDIT_BASE_URL', kind: 'value', note: 'override for render-audit.mjs\'s static preview server. If unset, render-audit.mjs spins up its own ephemeral HTTP server over the staged site root — that\'s the normal path.' },
];

console.log('🔎 Theme generator env/flags (secret values withheld):\n');
for (const { name, kind, note } of FLAGS) {
  const val = process.env[name];
  const set = Boolean(val && val.length > 0);
  const display = kind === 'secret' ? (set ? 'set' : 'unset') : (set ? val : 'unset');
  console.log(`  ${set ? '✅' : '⬜'} ${name} = ${display}`);
  console.log(`     ${note}`);
}

console.log();
if (!process.env.GOOGLE_API_KEY) {
  console.log('⚠️  GOOGLE_API_KEY is unset. The pipeline will only work at all if');
  console.log('    ALLOW_CLI_THEME_FALLBACK=1 is set AND one of antigravity/claude/codex is on PATH.');
}
