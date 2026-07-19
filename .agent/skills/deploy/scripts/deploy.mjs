#!/usr/bin/env node
/**
 * deploy.mjs (pre-deploy guardrail)
 *
 * This is NOT the deploy script — the actual rsync + PM2 restart + health
 * check lives at repo root: `scripts/deploy.sh`. This script only runs the
 * two things SKILL.md requires *before* deploy.sh, so an agent can't skip
 * them by accident:
 *
 *   1. Report the exact working-tree scope that will ship. Dirty trees are
 *      allowed because the repository push workflow stages every file.
 *   2. Take the pre-deploy safety backup on the droplet (tar of
 *      /opt/portfolio-site and /var/www/gregiteen.xyz) before any --delete
 *      rsync runs.
 *
 * Usage:
 *   node .agent/skills/deploy/scripts/deploy.mjs
 *   Then run: bash scripts/deploy.sh
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* no .env — rely on real env */ }

const DROPLET_IP = process.env.DROPLET_IP || '138.197.199.217';
function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

function main() {
  const status = sh('git', ['status', '--short']);
  const dirty = status.stdout.trim().length > 0;

  if (dirty) {
    console.log('⚠️  Working tree changes included in this deployment:\n');
    console.log(status.stdout);
    console.log('Proceeding with the complete working tree.');
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
