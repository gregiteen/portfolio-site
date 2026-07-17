#!/usr/bin/env node
/**
 * push-preflight.mjs
 *
 * Runs the full pre-push gate for portfolio-site in one deterministic pass:
 * syntax scan -> SSSS conformance -> test suite -> static site build.
 * Stops at the first failure so the caller doesn't have to babysit four
 * separate commands. Exits 0 only if every stage passes.
 *
 * Usage:
 *   node .agent/skills/push/scripts/push-preflight.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

const STAGES = [
  {
    label: 'Syntax scan',
    cmd: process.execPath,
    args: [path.join(ROOT, '.agent/skills/code-quality/scripts/check-syntax.mjs')],
  },
  { label: 'SSSS conformance (npm run validate)', cmd: 'npm', args: ['run', 'validate'] },
  { label: 'Test suite (npm test)', cmd: 'npm', args: ['test'] },
  { label: 'Static site build (npm run build)', cmd: 'npm', args: ['run', 'build'] },
];

function run() {
  for (const stage of STAGES) {
    console.log(`\n▶ ${stage.label}`);
    const result = spawnSync(stage.cmd, stage.args, { cwd: ROOT, stdio: 'inherit' });
    if (result.status !== 0) {
      console.error(`\n❌ ${stage.label} failed. Fix this before pushing.`);
      process.exit(result.status || 1);
    }
  }
  console.log('\n✅ All pre-push gates passed: syntax, validate, test, build.');
}

run();
