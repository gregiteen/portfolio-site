import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createTransport } from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { getWebmailSettings } from '../runtime-store.mjs';

// GENERATION_DELIVERY_PIPELINE Phase 2 — configured fallback for servers
// that don't advertise \Drafts via SPECIAL-USE (RFC 6154). Never hardcode a
// literal folder name as the primary path; try the advertised attribute
// first, always.
const DRAFTS_FOLDER_FALLBACK = process.env.IMAP_DRAFTS_FOLDER || 'Drafts';

const IMAP_HOST = process.env.IMAP_HOST || 'mail.ultrachat.app';
const IMAP_PORT = parseInt(process.env.IMAP_PORT || '993', 10);
function imapCredentials() {
  return {
    user: process.env.IMAP_USER || process.env.MAIL_USER || process.env.PORTFOLIO_WEBMAIL_EMAIL,
    pass: process.env.IMAP_PASS || process.env.MAIL_PASS || process.env.PORTFOLIO_WEBMAIL_PASSWORD,
  };
}

let client = null;
const repliedTo = new Set(); // Prevent loop storms during runtime

export async function getImapClient() {
  if (client) return client;
  const { user, pass } = imapCredentials();
  if (!user || !pass) throw new Error('IMAP credentials not configured');
  
  client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user,
      pass
    },
    logger: false // Suppress verbose logs
  });
  
  await client.connect();
  return client;
}

export async function refreshImapPassword(password) {
  process.env.IMAP_PASS = password;
  const previous = client;
  client = null;
  await previous?.logout().catch(() => {});
}

/**
 * Resolve the Drafts mailbox by its SPECIAL-USE `\Drafts` attribute
 * (RFC 6154) — never a hardcoded literal name, since it varies across
 * servers and clients (e.g. "Drafts" vs "INBOX.Drafts" vs a localized name).
 * Falls back to IMAP_DRAFTS_FOLDER / 'Drafts' if the server doesn't
 * advertise the attribute, then throws rather than silently guessing.
 */
export async function resolveDraftsMailbox() {
  const c = await getImapClient();
  const mailboxes = await c.list();
  const bySpecialUse = mailboxes.find((mb) => mb.specialUse === '\\Drafts');
  if (bySpecialUse) return bySpecialUse.path;
  const byFallbackName = mailboxes.find((mb) => mb.path === DRAFTS_FOLDER_FALLBACK || mb.name === DRAFTS_FOLDER_FALLBACK);
  if (byFallbackName) return byFallbackName.path;
  throw new Error(`No Drafts mailbox found: no \\Drafts SPECIAL-USE attribute, and no mailbox named "${DRAFTS_FOLDER_FALLBACK}" (set IMAP_DRAFTS_FOLDER to override)`);
}

/**
 * Compose a MIME message via nodemailer's MailComposer (never sent — just
 * built) and APPEND it to the resolved Drafts mailbox with the \Draft flag.
 * GENERATION_DELIVERY_PIPELINE Phase 2 — the caller is responsible for
 * idempotency (one draft per (visitorEmail, generationRunId); see
 * proposal.draftAppended in runtime-store.mjs) since only it knows the
 * business key.
 */
export async function appendDraft({ to, from, subject, html, text }) {
  const { user } = imapCredentials();
  const mailFrom = from || process.env.MAIL_FROM || user;
  if (!to || !subject || (!html && !text)) {
    throw new Error('appendDraft requires to, subject, and html or text');
  }
  const composer = new MailComposer({ from: mailFrom, to, subject, html, text });
  const mime = await new Promise((resolve, reject) => {
    composer.compile().build((err, message) => (err ? reject(err) : resolve(message)));
  });
  const draftsPath = await resolveDraftsMailbox();
  const c = await getImapClient();
  const result = await c.append(draftsPath, mime, ['\\Draft']);
  return { path: draftsPath, uid: result?.uid ?? null };
}

export async function fetchInbox() {
  const c = await getImapClient();
  // Guard empty INBOX — '1:*' throws on some servers when mailbox is empty; handle gracefully
  try {
    const status = await c.status('INBOX', { messages: true });
    if (!status.messages) return [];
  } catch {}
  const lock = await c.getMailboxLock('INBOX');
  try {
    const messages = [];
    for await (const message of c.fetch('1:*', { envelope: true, source: true }, { uid: true })) {
      const parsed = await simpleParser(message.source);
      messages.push({
        id: message.uid,
        from: parsed.from?.text || message.envelope.from[0]?.address,
        subject: parsed.subject || message.envelope.subject,
        snippet: parsed.text?.slice(0, 100).replace(/\s+/g, ' ') || '',
        date: parsed.date || message.envelope.date
      });
    }
    // Return newest first, up to 50
    return messages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);
  } finally {
    lock.release();
  }
}

export async function startImapPoller(smtpTransport) {
  const { user, pass } = imapCredentials();
  if (!user || !pass) {
    console.log('[IMAP] Credentials missing, skipping poller daemon.');
    return;
  }
  
  const c = await getImapClient();
  let lock = await c.getMailboxLock('INBOX');
  
  console.log('[IMAP] Poller daemon started, listening for new messages...');
  
  c.on('exists', async (data) => {
    // New message arrived!
    const settings = await getWebmailSettings();
    if (!settings || !settings.ooo_enabled) return;
    
    // Check dates
    const now = new Date();
    if (settings.ooo_start_date && new Date(settings.ooo_start_date) > now) return;
    if (settings.ooo_end_date && new Date(settings.ooo_end_date) < now) return;
    
    try {
      const message = await c.fetchOne(data.count, { envelope: true });
      const fromAddr = message.envelope.from[0]?.address;
      
      if (!fromAddr || fromAddr.includes('noreply') || fromAddr.includes('daemon') || fromAddr === user) {
        return; // Avoid loop
      }
      
      if (repliedTo.has(fromAddr)) {
        return; // Already replied this session
      }
      
      console.log(`[IMAP] OOO Auto-replying to ${fromAddr}`);
      
      const mailOptions = {
        from: process.env.MAIL_FROM || user,
        to: fromAddr,
        subject: settings.ooo_subject || 'Out of Office',
        text: (settings.ooo_body_text || "I am currently out of the office.").replace(/\\n/g, '\n'),
        html: settings.ooo_body_html || "<p>I am currently out of the office.</p>"
      };
      
      await smtpTransport.sendMail(mailOptions);
      repliedTo.add(fromAddr);
      
    } catch (e) {
      console.error('[IMAP] Error auto-replying:', e.message);
    }
  });

  // Re-lock if lost
  c.on('close', () => {
    client = null;
    setTimeout(() => startImapPoller(smtpTransport), 10000); // Reconnect
  });
}
