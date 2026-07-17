#!/usr/bin/env node
/**
 * check-documenso-env.mjs
 *
 * Reports which Documenso/SignedGI env vars are set, WITHOUT ever printing
 * their values (they're secrets). Useful first step when signing/SSO/webhook
 * behavior looks wrong — most "bugs" here are actually a missing env var
 * causing a silent fallback (see SKILL.md).
 *
 * Usage:
 *   node .agent/skills/documenso/scripts/check-documenso-env.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* rely on real env */ }

const VARS = [
  { name: 'DOCUMENSO_BASE_URL', note: 'gates the whole integration — unset means createSigningRequest() returns null and emails fall back to a plain PDF attachment with no signing link' },
  { name: 'DOCUMENSO_API_KEY', note: 'Bearer token, Documenso Settings > API Tokens' },
  { name: 'DOCUMENSO_WEBHOOK_SECRET', note: 'must match what Documenso sends as X-Documenso-Secret; mismatched values fail closed (webhook rejected)' },
  { name: 'DOCUMENSO_SSO_SECRET', note: 'Bearer auth for POST /api/documenso/sso/consume' },
  { name: 'DOCUMENSO_SSO_EMAIL', note: 'falls back to IMAP_USER if unset — easy to misconfigure silently' },
  { name: 'IMAP_USER', note: 'fallback identity for SSO if DOCUMENSO_SSO_EMAIL is unset (see above)' },
];

console.log('🔎 Documenso / SignedGI env var presence (values withheld):\n');
let allCriticalSet = true;
for (const { name, note } of VARS) {
  const set = Boolean(process.env[name] && process.env[name].length > 0);
  console.log(`  ${set ? '✅' : '⬜'} ${name}${set ? '' : ' (unset)'}`);
  console.log(`     ${note}`);
  if (['DOCUMENSO_BASE_URL', 'DOCUMENSO_API_KEY'].includes(name) && !set) allCriticalSet = false;
}

console.log();
if (!allCriticalSet) {
  console.log('⚠️  DOCUMENSO_BASE_URL and/or DOCUMENSO_API_KEY are unset — the app is running in');
  console.log('    plain-PDF-attachment fallback mode, not real e-signing. This may be intentional');
  console.log('    (e.g. local dev) — confirm with the user before treating it as a bug.');
} else {
  console.log('✅ Core signing config present. If behavior still looks wrong, check the webhook');
  console.log('   secret and SSO vars above, and confirm the DOCUMENSO_BASE_URL instance is reachable.');
}
