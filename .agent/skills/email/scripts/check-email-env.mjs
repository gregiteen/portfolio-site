#!/usr/bin/env node
/**
 * check-email-env.mjs — report which email-infrastructure env vars are set,
 * WITHOUT ever printing a value.
 *
 * Usage:
 *   node .agent/skills/email/scripts/check-email-env.mjs
 *
 * Covers both sending stacks this repo uses:
 *   - SMTP2GO / generic SMTP (transactional sends from serve.mjs)
 *   - Mailcow admin API (mailbox management, password sync)
 * Reads .env from the repo root the same way the server does. On the laptop many
 * of these are expected to be absent — production values live in the droplet's
 * /opt/portfolio-site/.env, which is rsync-excluded and must never be overwritten.
 */
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const envPath = path.join(ROOT, '.env');

if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch {
    console.error(`(.env exists at ${envPath} but could not be parsed)`);
  }
} else {
  console.error('(no .env at repo root — checking process env only)');
}

const GROUPS = {
  'SMTP sending': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'MAIL_FROM', 'MAIL_OWNER'],
  'SMTP2GO API': ['SMTP2GO_API_KEY'],
  'Mailcow admin': ['MAILCOW_API_URL', 'MAILCOW_API_KEY', 'MAILCOW_DOMAIN', 'MAILCOW_ADMIN_PASSWORD'],
  'IMAP (legacy inbox poller)': ['IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS'],
};

let missing = 0;
for (const [group, keys] of Object.entries(GROUPS)) {
  console.log(`\n${group}:`);
  for (const key of keys) {
    const set = Boolean(process.env[key]);
    if (!set) missing++;
    console.log(`  ${set ? '✅ set  ' : '⬜ unset'} ${key}`);
  }
}

console.log(`\n${missing === 0 ? 'All email env vars present.' : `${missing} unset — fine locally; verify on the droplet before debugging "email broken" reports.`}`);
console.log('Values are never printed by this script. To check the droplet (names only):');
console.log("  ssh root@<droplet> \"grep -oE '^(SMTP|MAIL|IMAP|MAILCOW)[A-Z0-9_]*=' /opt/portfolio-site/.env | sed 's/=$//' | sort\"");
