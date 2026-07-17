#!/usr/bin/env node
/**
 * check-webmail-env.mjs
 *
 * This repo has TWO independent IMAP stacks (see SKILL.md) with two
 * different env-var families. This script reports which vars are set for
 * each stack, WITHOUT ever printing secret values, so it's obvious which
 * stack is configured before debugging "webmail is broken" reports.
 *
 * Usage:
 *   node .agent/skills/webmail/scripts/check-webmail-env.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* rely on real env */ }

function report(title, vars) {
  console.log(`\n${title}`);
  for (const { name, fallback } of vars) {
    const set = Boolean(process.env[name] && process.env[name].length > 0);
    const note = !set && fallback ? ` (defaults to ${fallback} if unset)` : set ? '' : ' (unset)';
    console.log(`  ${set ? '✅' : '⬜'} ${name}${note}`);
  }
}

console.log('🔎 Webmail env var presence (values withheld) — two independent stacks:');

report('Stack 1 — standalone mail.gregiteen.xyz CRM (webmail.mjs / webmail-ui.mjs, per-request IMAP/SMTP with per-user session creds):', [
  { name: 'WEBMAIL_IMAP_HOST', fallback: '127.0.0.1 (correct in production — same droplet as Dovecot)' },
  { name: 'WEBMAIL_IMAP_PORT', fallback: '993' },
  { name: 'WEBMAIL_SMTP_HOST', fallback: '127.0.0.1' },
  { name: 'WEBMAIL_SMTP_PORT', fallback: '587' },
]);

report('Stack 2 — legacy single-mailbox admin client (imap.mjs: OOO poller + old /api/admin/webmail/* routes):', [
  { name: 'IMAP_HOST', fallback: 'mail.gregiteen.xyz' },
  { name: 'IMAP_PORT', fallback: '993' },
  { name: 'IMAP_USER' },
  { name: 'IMAP_PASS' },
  { name: 'MAIL_USER', fallback: 'alias for IMAP_USER' },
  { name: 'MAIL_PASS', fallback: 'alias for IMAP_PASS' },
]);

console.log('\nRemember: IMAP_USER also doubles as the Documenso SSO fallback identity');
console.log('(DOCUMENSO_SSO_EMAIL || IMAP_USER) — see the documenso skill. Changing IMAP_USER');
console.log('can silently change SSO behavior too.');
