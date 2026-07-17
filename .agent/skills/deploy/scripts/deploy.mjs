#!/usr/bin/env node
/**
 * deploy.mjs (pre-deploy guardrail)
 *
 * This is NOT the deploy script — the actual rsync + PM2 restart + health
 * check lives at repo root: `scripts/deploy.sh`. This script only runs the
 * two things SKILL.md requires *before* deploy.sh, so an agent can't skip
 * them by accident:
 *
 *   1. Refuse to proceed if the git tree is dirty, unless --confirm-dirty
 *      is passed (i.e. the user has explicitly confirmed the working tree
 *      should ship as-is).
 *   2. Take the pre-deploy safety backup on the droplet (tar of
 *      /opt/portfolio-site and /var/www/gregiteen.xyz) before any --delete
 *      rsync runs.
 *
 * Usage:
 *   node .agent/skills/deploy/scripts/deploy.mjs           # dirty tree -> exits 1 with the diff
 *   node .agent/skills/deploy/scripts/deploy.mjs --confirm-dirty   # user has confirmed, proceed
 *   Then run: bash scripts/deploy.sh
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env — rely on real env */ }

const DROPLET_IP = process.env.DROPLET_IP || '138.197.199.217';
const confirmDirty = process.argv.includes('--confirm-dirty');

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

function main() {
  const status = sh('git', ['status', '--short']);
  const dirty = status.stdout.trim().length > 0;

  if (dirty && !confirmDirty) {
    console.log('⚠️  Working tree is not clean:\n');
    console.log(status.stdout);
    console.log('Deploy ships the working tree exactly as-is. Show this to the user and ask');
    console.log('whether these changes are intended to go live before proceeding.');
    console.log('Once confirmed, re-run with --confirm-dirty.');
    process.exit(1);
  }
  if (dirty) {
    console.log('⚠️  Proceeding with a dirty tree — user-confirmed (--confirm-dirty passed).');
  } else {
    console.log('✅ Working tree is clean.');
  }

  const today = new Date().toISOString().slice(0, 10);
  console.log(`\n📦 Taking pre-deploy backup on droplet (${DROPLET_IP})...`);
  const backup = sh('ssh', [
    '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=8',
    `root@${DROPLET_IP}`,
    `tar czf /root/pre-deploy-backup-${today}.tar.gz /opt/portfolio-site /var/www/gregiteen.xyz`,
  ]);
  if (backup.status !== 0) {
    console.error('❌ Pre-deploy backup failed:\n' + (backup.stderr || backup.stdout));
    console.error('Do not proceed with scripts/deploy.sh until this is resolved.');
    process.exit(1);
  }
  console.log(`✅ Backup written to /root/pre-deploy-backup-${today}.tar.gz on the droplet.`);
  console.log('\n▶ Now run: bash scripts/deploy.sh');
}

main();
