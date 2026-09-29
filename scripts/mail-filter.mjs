#!/usr/bin/env node
// Installs the inbox rules from scripts/lib/mail-rules.mjs on the mailbox and,
// with --sweep, files mail already sitting in the inbox by the same rules.
// Runs on the droplet (needs .env, Mailcow API and loopback IMAP):
//
//   node scripts/mail-filter.mjs            # install or update the Sieve prefilter
//   node scripts/mail-filter.mjs --sweep    # also file existing inbox mail
//   node scripts/mail-filter.mjs --dry-run  # print the script and the plan only
import { existsSync } from 'node:fs';
import { ImapFlow } from 'imapflow';
import { FILTER_DESC, MAIL_RULES, folderFor, toSieve } from './lib/mail-rules.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const sweep = args.has('--sweep') || dryRun;

const mailbox = (process.env.PORTFOLIO_WEBMAIL_EMAIL || process.env.IMAP_USER || '').trim().toLowerCase();
const password = process.env.PORTFOLIO_WEBMAIL_PASSWORD || process.env.IMAP_PASS;
const apiUrl = (process.env.MAILCOW_API_URL || '').replace(/\/$/, '');
const apiKey = process.env.MAILCOW_API_KEY;
if (!mailbox || !password) throw new Error('PORTFOLIO_WEBMAIL_EMAIL and PORTFOLIO_WEBMAIL_PASSWORD must be set');

async function mailcow(method, path, body) {
  if (!apiUrl || !apiKey) throw new Error('MAILCOW_API_URL and MAILCOW_API_KEY must be set');
  const res = await fetch(`${apiUrl}/api/v1/${path}`, {
    method,
    headers: { 'X-API-Key': apiKey, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  const failed = !res.ok || (Array.isArray(data) && data.some((r) => r.type === 'danger' || r.type === 'error'));
  if (failed) throw new Error(`Mailcow ${method} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function installFilter(script) {
  const existing = await mailcow('GET', `get/filters/${encodeURIComponent(mailbox)}`);
  const rows = Array.isArray(existing) ? existing : Object.values(existing || {});
  const ours = rows.find((f) => f.script_desc === FILTER_DESC && f.filter_type === 'prefilter');
  const attr = { script_desc: FILTER_DESC, script_data: script, filter_type: 'prefilter', active: '1' };
  if (ours) {
    await mailcow('POST', 'edit/filter', { items: [String(ours.id)], attr });
    console.log(`Updated Sieve prefilter ${ours.id} on ${mailbox}`);
  } else {
    await mailcow('POST', 'add/filter', { username: mailbox, ...attr });
    console.log(`Installed Sieve prefilter on ${mailbox}`);
  }
}

async function sweepInbox() {
  const client = new ImapFlow({
    host: process.env.WEBMAIL_IMAP_HOST || '127.0.0.1',
    port: Number(process.env.WEBMAIL_IMAP_PORT || 993),
    secure: true,
    tls: { rejectUnauthorized: false },
    auth: { user: mailbox, pass: password },
    logger: false,
  });
  await client.connect();
  try {
    const present = new Set((await client.list()).map((b) => b.path));
    const plan = new Map();
    const lock = await client.getMailboxLock('INBOX');
    try {
      for await (const msg of client.fetch('1:*', { envelope: true, uid: true })) {
        const folder = folderFor({ from: msg.envelope?.from?.[0]?.address, subject: msg.envelope?.subject });
        if (!folder) continue;
        if (!plan.has(folder)) plan.set(folder, []);
        plan.get(folder).push(msg.uid);
      }
      for (const [folder, uids] of plan) {
        console.log(`${dryRun ? 'Would file' : 'Filing'} ${uids.length} message(s) into ${folder}`);
        if (dryRun) continue;
        if (!present.has(folder)) await client.mailboxCreate(folder);
        await client.messageMove(uids.join(','), folder, { uid: true });
      }
    } finally {
      lock.release();
    }
    if (!dryRun) {
      for (const { folder } of MAIL_RULES.filter((r) => r.folder)) {
        if (!present.has(folder) && !plan.has(folder)) await client.mailboxCreate(folder);
        await client.mailboxSubscribe(folder).catch(() => {});
      }
    }
    const status = await client.status('INBOX', { messages: true, unseen: true });
    console.log(`Inbox now holds ${status.messages} message(s), ${status.unseen} unread`);
  } finally {
    await client.logout().catch(() => {});
  }
}

const script = toSieve();
if (dryRun) console.log(script);
else await installFilter(script);
if (sweep) await sweepInbox();
