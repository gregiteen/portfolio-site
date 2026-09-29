// Inbox rules for the sales@gregiteen.xyz mailbox. One list drives both the
// Mailcow Sieve prefilter (new mail, filed at delivery) and the IMAP sweep
// (mail already in the inbox), so the two can never disagree.
//
// Nothing here deletes mail: automated traffic is filed into folders and the
// inbox keeps only correspondence. Real spam is rspamd's job; Mailcow's global
// Sieve script moves it to Junk before these rules run.

export const FILTER_DESC = 'portfolio-site inbox rules';

// Order matters: the first rule that matches files the message.
// mode 'any': a from OR a subject match is enough.
// mode 'all': needs a from match AND a subject match.
export const MAIL_RULES = [
  {
    folder: 'Reports',
    mode: 'any',
    from: ['dmarc'],
    subject: ['Report domain:'],
  },
  {
    folder: 'Bounces',
    mode: 'any',
    from: ['mailer-daemon@', 'postmaster@'],
    subject: ['Mail delivery failed', 'Undelivered Mail Returned', 'Delivery Status Notification'],
  },
  {
    folder: 'Signing',
    mode: 'all',
    from: ['@gregiteen.xyz'],
    subject: ['has signed', 'Signing Complete', 'Document Cancelled', 'has rejected', 'Document Completed'],
  },
  {
    folder: 'System',
    mode: 'any',
    from: ['@gregiteen.xyz'],
    subject: [],
  },
];

/** Folders the webmail shows, in navigation order. */
export const MAIL_FOLDERS = ['INBOX', ...MAIL_RULES.map((r) => r.folder), 'Junk'];

const has = (haystack, needles) => {
  const h = String(haystack || '').toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
};

/** The folder a message belongs in, or null to leave it in the inbox. */
export function folderFor({ from, subject }) {
  for (const rule of MAIL_RULES) {
    const f = rule.from.length > 0 && has(from, rule.from);
    const s = rule.subject.length > 0 && has(subject, rule.subject);
    if (rule.mode === 'all' ? f && s : f || s) return rule.folder;
  }
  return null;
}

const quote = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const list = (items) => `[${items.map(quote).join(', ')}]`;

/** Sieve script equivalent to folderFor(). Header tests default to case-insensitive. */
export function toSieve(rules = MAIL_RULES) {
  const blocks = rules.map((rule) => {
    const tests = [];
    if (rule.from.length) tests.push(`address :contains "from" ${list(rule.from)}`);
    if (rule.subject.length) tests.push(`header :contains "subject" ${list(rule.subject)}`);
    const test = tests.length === 1 ? tests[0] : `${rule.mode === 'all' ? 'allof' : 'anyof'}(${tests.join(', ')})`;
    return `if ${test} {\n  fileinto :create ${quote(rule.folder)};\n  stop;\n}`;
  });
  return `# ${FILTER_DESC}: generated from scripts/lib/mail-rules.mjs. Edit there, not here.\nrequire ["fileinto", "mailbox"];\n\n${blocks.join('\n\n')}\n`;
}
