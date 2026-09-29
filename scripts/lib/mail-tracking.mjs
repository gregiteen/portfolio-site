// Delivery and open tracking for mail sent from the webmail.
//
// Delivery: outgoing mail leaves Postfix through the Brevo relay, so the
// Postfix log can say "relayed" (Brevo accepted it), "deferred" or "bounced"
// (the relay refused it). A later rejection by the recipient's server comes
// back as a bounce notice into the mailbox; findBouncedMessageIds() matches
// those to the original Message-ID. Confirmed "delivered" would need Brevo's
// event API, which needs an API key this server does not hold.
//
// Opens: every message carries a 1x1 image served from /api/track/open/<id>.gif. Gmail,
// Yahoo and Apple Mail Privacy Protection fetch images through proxies, often
// without the recipient reading anything, so those loads are counted apart.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Transparent 1x1 GIF. */
export const PIXEL_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

const PROXY_UA = /GoogleImageProxy|ggpht\.com|YahooMailProxy|Yahoo! Slurp|OutlookImageProxy|Microsoft Office|Mimecast|Proofpoint|Barracuda|^Mozilla\/5\.0$/i;

/** True when an open came from a mail provider's image proxy rather than a reader. */
export function isProxyOpen(userAgent) {
  const ua = String(userAgent || '').trim();
  return !ua || PROXY_UA.test(ua);
}

const STATUS_RANK = { bounced: 3, deferred: 2, sent: 1 };

/**
 * Reads Postfix log text for one Message-ID.
 * @returns {{ status: 'queued'|'relayed'|'deferred'|'bounced', detail: string|null, recipients: Array<{to:string,status:string,detail:string}> }}
 */
export function parsePostfixDelivery(logText, messageId) {
  const id = String(messageId || '').replace(/^<|>$/g, '');
  if (!id) return { status: 'queued', detail: null, recipients: [] };
  const lines = String(logText || '').split('\n');
  const queueIds = new Set();
  for (const line of lines) {
    const m = line.match(/\s([0-9A-F]{6,}):\s+message-id=<([^>]+)>/i);
    if (m && m[2] === id) queueIds.add(m[1]);
  }
  const byRecipient = new Map();
  for (const line of lines) {
    const m = line.match(/\s([0-9A-F]{6,}):\s+to=<([^>]+)>.*?status=(sent|deferred|bounced)\s*\((.*)\)\s*$/i);
    if (!m || !queueIds.has(m[1])) continue;
    byRecipient.set(m[2].toLowerCase(), { to: m[2].toLowerCase(), status: m[3].toLowerCase(), detail: m[4] });
  }
  const recipients = [...byRecipient.values()];
  if (!recipients.length) return { status: 'queued', detail: null, recipients };
  const worst = recipients.reduce((a, b) => (STATUS_RANK[b.status] > STATUS_RANK[a.status] ? b : a));
  return { status: worst.status === 'sent' ? 'relayed' : worst.status, detail: worst.detail, recipients };
}

/** Message-IDs from `candidates` that a bounce notice refers to. */
export function findBouncedMessageIds(bounceText, candidates) {
  const text = String(bounceText || '');
  return candidates.filter((id) => {
    const bare = String(id).replace(/^<|>$/g, '');
    return bare && text.includes(bare);
  });
}

/** Postfix log lines from the Mailcow stack for the last `since`. */
export async function readPostfixLog({ since = '72h', mailcowRoot = process.env.MAILCOW_ROOT || '/opt/mailcow-dockerized' } = {}) {
  const { stdout } = await execFileAsync('docker', ['compose', 'logs', '--no-color', '--since', since, 'postfix-mailcow'], {
    cwd: mailcowRoot,
    maxBuffer: 64 * 1024 * 1024,
    timeout: 20_000,
  });
  return stdout;
}
