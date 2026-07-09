// A small custom webmail client for gregiteen.xyz mailboxes — talks straight
// to Dovecot (IMAP) and Postfix (SMTP) over the loopback interface, so it's
// completely independent of Mailcow's own web UI (which is hard-wired to a
// single hostname for CORS/session purposes and can't be white-labeled —
// see the mail.gregiteen.xyz investigation this replaces). Credentials are
// the mailbox's real IMAP/SMTP credentials; nothing is proxied or spoofed.
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createTransport } from 'nodemailer';

// Read lazily (not as module-level consts) — static imports run before the
// importing file's own process.loadEnvFile() call, so a top-level read here
// would always see undefined and silently fall back to the loopback default.
function imapClient(email, password) {
  return new ImapFlow({
    host: process.env.WEBMAIL_IMAP_HOST || '127.0.0.1',
    port: Number(process.env.WEBMAIL_IMAP_PORT || 993),
    secure: true,
    tls: { rejectUnauthorized: false }, // loopback connection, cert CN won't match 127.0.0.1
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

/** Latest messages in INBOX, newest first. */
export async function listMessages(email, password, { limit = 50 } = {}) {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
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

/** Full parsed message body + attachment metadata for one UID. */
export async function getMessage(email, password, uid) {
  const client = imapClient(email, password);
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
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
      _rawAttachments: parsed.attachments || [],
    };
  } finally {
    await client.logout().catch(() => {});
  }
}

export async function sendMessage(email, password, { to, subject, text, inReplyTo }) {
  const transport = createTransport({
    host: process.env.WEBMAIL_SMTP_HOST || '127.0.0.1',
    port: Number(process.env.WEBMAIL_SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    tls: { rejectUnauthorized: false },
    auth: { user: email, pass: password },
  });
  await transport.sendMail({
    from: email,
    to,
    subject,
    text,
    inReplyTo: inReplyTo || undefined,
  });
}
