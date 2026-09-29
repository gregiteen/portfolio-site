// A small custom webmail client for gregiteen.xyz mailboxes — talks straight
// to Dovecot (IMAP) and Postfix (SMTP) over the loopback interface, so it's
// completely independent of Mailcow's own web UI (which is hard-wired to a
// single hostname for CORS/session purposes and can't be white-labeled —
// see the mail.gregiteen.xyz investigation this replaces). Credentials are
// the mailbox's real IMAP/SMTP credentials; nothing is proxied or spoofed.
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createTransport } from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import { randomBytes } from 'node:crypto';
import { composeOutgoing } from './mail-signature.mjs';
import { upsertSentMessage } from './crm-store.mjs';

// Read lazily (not as module-level consts) — static imports run before the
// importing file's own process.loadEnvFile() call, so a top-level read here
// would always see undefined and silently fall back to the loopback default.
function imapClient(email, password) {
  const host = process.env.WEBMAIL_IMAP_HOST || process.env.IMAP_HOST || 'mail.gregiteen.xyz';
  const isLoopback = host === '127.0.0.1' || host === 'localhost';
  return new ImapFlow({
    host,
    port: Number(process.env.WEBMAIL_IMAP_PORT || process.env.IMAP_PORT || 993),
    secure: true,
    tls: { rejectUnauthorized: isLoopback ? false : true },
    auth: { user: email, pass: password },
    logger: false,
  });
}

/** Throws on bad credentials or unreachable server. */
export async function verifyLogin(email, password) {
  const client = imapClient(email, password);
  await client.connect();
  await client.logout();
}

/** Latest messages in a folder, newest first. */
export async function listMessages(email, password, { limit = 50, folder = 'INBOX' } = {}) {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const lock = await client.getMailboxLock(folder);
    try {
      const total = client.mailbox.exists;
      if (!total) return [];
      const start = Math.max(1, total - limit + 1);
      const messages = [];
      for await (const msg of client.fetch(`${start}:${total}`, { envelope: true, flags: true, uid: true, size: true })) {
        messages.push({
          uid: msg.uid,
          subject: msg.envelope?.subject || '(no subject)',
          from: msg.envelope?.from?.[0]?.address || msg.envelope?.from?.[0]?.name || 'unknown',
          fromName: msg.envelope?.from?.[0]?.name || '',
          to: msg.envelope?.to?.[0]?.address || '',
          messageId: msg.envelope?.messageId || '',
          date: msg.envelope?.date || null,
          seen: msg.flags?.has('\\Seen') || false,
          size: msg.size || 0,
        });
      }
      messages.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      return messages;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

/** Full parsed message body + attachment metadata for one UID in a folder. */
export async function getMessage(email, password, uid, folder = 'INBOX') {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const lock = await client.getMailboxLock(folder);
    let raw;
    try {
      const { content } = await client.download(String(uid), null, { uid: true });
      const chunks = [];
      for await (const chunk of content) chunks.push(chunk);
      raw = Buffer.concat(chunks);
      await client.messageFlagsAdd({ uid: String(uid) }, ['\\Seen'], { uid: true });
    } finally {
      lock.release();
    }
    const parsed = await simpleParser(raw);
    return {
      uid,
      subject: parsed.subject || '(no subject)',
      from: parsed.from?.text || 'unknown',
      to: parsed.to?.text || '',
      date: parsed.date || null,
      text: parsed.text || '',
      html: parsed.html || null,
      attachments: (parsed.attachments || []).map((a, i) => ({
        index: i,
        filename: a.filename || `attachment-${i}`,
        contentType: a.contentType,
        size: a.size,
      })),
      messageId: parsed.messageId || '',
      _rawAttachments: parsed.attachments || [],
    };
  } finally {
    await client.logout().catch(() => {});
  }
}

/** Raw sources of messages in a folder received in the last `days` days. */
export async function listRecentSources(email, password, folder, { days = 14 } = {}) {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const lock = await client.getMailboxLock(folder);
    try {
      const uids = await client.search({ since: new Date(Date.now() - days * 86400000) }, { uid: true });
      if (!uids?.length) return [];
      const out = [];
      for await (const msg of client.fetch(uids.join(','), { source: true }, { uid: true })) out.push(msg.source.toString('utf8'));
      return out;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }
}

/** Files a sent message's MIME source into the Sent folder, marked read. */
async function saveToSent(email, password, raw) {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const boxes = await client.list();
    const sent = boxes.find((b) => b.specialUse === '\\Sent')?.path || 'Sent';
    await client.append(sent, raw, ['\\Seen']);
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Sends with the signature and an open-tracking pixel, keeps a copy in Sent and
 * records the message for delivery and open tracking.
 */
export async function sendMessage(email, password, { to, subject, text, inReplyTo }) {
  const smtpHost = process.env.WEBMAIL_SMTP_HOST || process.env.SMTP_HOST || 'mail.gregiteen.xyz';
  const isLoopback = smtpHost === '127.0.0.1' || smtpHost === 'localhost';
  const transport = createTransport({
    host: smtpHost,
    port: Number(process.env.WEBMAIL_SMTP_PORT || process.env.SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    tls: { rejectUnauthorized: isLoopback ? false : true },
    auth: { user: email, pass: password },
  });
  const sentId = randomBytes(12).toString('hex');
  const messageId = `<${sentId}@${email.split('@')[1] || 'gregiteen.xyz'}>`;
  const base = (process.env.BASE_URL || 'https://gregiteen.xyz').replace(/\/$/, '');
  const body = composeOutgoing({ text, pixelUrl: `${base}/api/track/open/${sentId}.gif` });
  const mail = {
    from: { name: 'Greg Iteen', address: email },
    to,
    subject,
    text: body.text,
    html: body.html,
    messageId,
    inReplyTo: inReplyTo || undefined,
    references: inReplyTo || undefined,
  };
  await transport.sendMail(mail);
  const sentAt = new Date().toISOString();
  // Tracking and the Sent copy are bookkeeping: the message is already out, so
  // a failure here is logged rather than reported as a failed send.
  await upsertSentMessage(sentId, { message_id: messageId, to, subject: subject || '(no subject)', sent_at: sentAt, delivery_status: 'queued' })
    .catch((err) => console.error('[webmail] tracking record failed:', err.message));
  const raw = await new MailComposer(mail).compile().build();
  await saveToSent(email, password, raw).catch((err) => console.error('[webmail] Sent copy failed:', err.message));
  return { sentId, messageId };
}
