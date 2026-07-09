// Standalone branded webmail app served on the mail.gregiteen.xyz vhost.
// Owns its own auth (real IMAP/SMTP login, not the main site's cookie auth)
// and its own tiny router — kept separate from serve.mjs so the main site's
// routing table doesn't balloon. See scripts/lib/webmail.mjs for the
// IMAP/SMTP calls this renders around.
import { randomBytes } from 'node:crypto';
import { verifyLogin, listMessages, getMessage, sendMessage } from './webmail.mjs';

// token -> { email, password, createdAt }. Deliberately in-memory only —
// mailbox passwords never touch disk. A server restart just means everyone
// re-logs in, which is an acceptable trade for not persisting credentials.
const sessions = new Map();
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12h

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getSession(req) {
  const token = parseCookies(req.headers.cookie).gi_webmail;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(token);
    return null;
  }
  return { token, ...session };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params);
}

function shell({ title, body, flash }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — Greg Iteen Mail</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="https://gregiteen.xyz/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--black:#0a0a0a;--white:#f5f5f3;--gray:rgba(245,245,243,.55);--faint:rgba(245,245,243,.22);--line:rgba(245,245,243,.28);--accent:#ff6a00}
html,body{min-height:100%}
body{font-family:'Archivo',sans-serif;background:var(--black);color:var(--white)}
.frame{max-width:820px;margin:0 auto;padding:clamp(20px,4vw,48px)}
.top{display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gray);margin-bottom:clamp(24px,4vw,48px);border-bottom:1px solid var(--line);padding-bottom:16px}
.top a{color:var(--gray);text-decoration:none}
.top a:hover{color:var(--white)}
.top .logo{height:18px;width:auto;display:block}
h1{font-family:'Archivo Black',sans-serif;font-size:1.6rem;margin-bottom:20px}
.flash{font-family:'IBM Plex Mono',monospace;font-size:.8rem;color:var(--accent);border:1px solid var(--accent);padding:10px 14px;margin-bottom:20px}
label{display:block;font-family:'IBM Plex Mono',monospace;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:16px 0 6px}
input[type=email],input[type=password],input[type=text],textarea{width:100%;background:transparent;border:none;border-bottom:1px solid var(--line);color:var(--white);font-family:'Archivo',sans-serif;font-size:1rem;padding:10px 0;outline:none}
input:focus,textarea:focus{border-color:var(--accent)}
textarea{min-height:220px;resize:vertical;font-family:'IBM Plex Mono',monospace;font-size:.85rem;line-height:1.5}
button,.btn{display:inline-block;background:var(--accent);color:var(--white);border:none;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:.8rem;letter-spacing:.05em;text-decoration:none;padding:12px 24px;margin-top:24px;cursor:pointer;transition:opacity .2s}
button:hover,.btn:hover{opacity:.85}
.list{border-top:1px solid var(--line)}
.row{display:flex;gap:16px;padding:14px 0;border-bottom:1px solid var(--line);text-decoration:none;color:var(--white)}
.row:hover{background:rgba(245,245,243,.04)}
.row .from{width:200px;flex-shrink:0;color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .subject{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row.unseen .subject{font-weight:700}
.row .date{width:110px;flex-shrink:0;text-align:right;color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.72rem}
.meta{font-family:'IBM Plex Mono',monospace;font-size:.8rem;color:var(--gray);margin-bottom:24px;line-height:1.8}
.meta strong{color:var(--white)}
.body-frame{border:1px solid var(--line);width:100%;min-height:300px;background:var(--white)}
.body-text{white-space:pre-wrap;font-family:'IBM Plex Mono',monospace;font-size:.85rem;line-height:1.6;border:1px solid var(--line);padding:20px}
.attachments{margin-top:20px;font-family:'IBM Plex Mono',monospace;font-size:.8rem}
.attachments a{color:var(--accent);text-decoration:none}
.empty{color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.85rem;padding:40px 0;text-align:center}
</style>
</head>
<body>
<div class="frame">
<div class="top"><img class="logo" src="https://gregiteen.xyz/gi-logo-transparent-dark.png" alt="greg.iteen">${title !== 'Sign in' ? '<a href="/logout">Sign out</a>' : ''}</div>
${flash ? `<div class="flash">${escapeHtml(flash)}</div>` : ''}
${body}
</div>
</body>
</html>`;
}

function loginPage(flash) {
  return shell({
    title: 'Sign in',
    flash,
    body: `<h1>Sign in</h1>
<form method="POST" action="/login">
  <label>Email</label>
  <input type="email" name="email" required autofocus placeholder="sales@gregiteen.xyz">
  <label>Password</label>
  <input type="password" name="password" required>
  <button type="submit">Sign in</button>
</form>`,
  });
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: sameYear ? undefined : 'numeric' });
}

function inboxPage(messages) {
  const rows = messages.length
    ? messages.map((m) => `<a class="row${m.seen ? '' : ' unseen'}" href="/message/${m.uid}">
        <span class="from">${escapeHtml(m.fromName || m.from)}</span>
        <span class="subject">${escapeHtml(m.subject)}</span>
        <span class="date">${escapeHtml(formatDate(m.date))}</span>
      </a>`).join('\n')
    : '<div class="empty">No messages.</div>';
  return shell({
    title: 'Inbox',
    body: `<h1>Inbox</h1>
<a class="btn" href="/compose">Compose</a>
<div class="list">${rows}</div>`,
  });
}

function messagePage(msg) {
  const bodyHtml = msg.html
    ? `<iframe class="body-frame" sandbox="" srcdoc="${escapeHtml(msg.html)}"></iframe>`
    : `<div class="body-text">${escapeHtml(msg.text || '(empty message)')}</div>`;
  const attachments = msg.attachments.length
    ? `<div class="attachments"><strong>Attachments:</strong><br>${msg.attachments
        .map((a) => `<a href="/message/${msg.uid}/attachment/${a.index}">${escapeHtml(a.filename)}</a> (${Math.round(a.size / 1024)} KB)`)
        .join('<br>')}</div>`
    : '';
  return shell({
    title: msg.subject,
    body: `<h1>${escapeHtml(msg.subject)}</h1>
<div class="meta">
  <strong>From:</strong> ${escapeHtml(msg.from)}<br>
  <strong>To:</strong> ${escapeHtml(msg.to)}<br>
  <strong>Date:</strong> ${escapeHtml(msg.date ? new Date(msg.date).toLocaleString('en-US') : '')}
</div>
${bodyHtml}
${attachments}
<a class="btn" href="/compose?to=${encodeURIComponent(msg.from)}&subject=${encodeURIComponent(`Re: ${msg.subject}`)}">Reply</a>`,
  });
}

function composePage({ to = '', subject = '', flash } = {}) {
  return shell({
    title: 'Compose',
    flash,
    body: `<h1>Compose</h1>
<form method="POST" action="/compose">
  <label>To</label>
  <input type="text" name="to" required value="${escapeHtml(to)}">
  <label>Subject</label>
  <input type="text" name="subject" value="${escapeHtml(subject)}">
  <label>Message</label>
  <textarea name="text" required></textarea>
  <button type="submit">Send</button>
</form>`,
  });
}

function setCookie(res, token) {
  res.setHeader('Set-Cookie', `gi_webmail=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL / 1000}`);
}

function clearCookie(res) {
  res.setHeader('Set-Cookie', 'gi_webmail=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}

export async function handleWebmail(req, res, urlPath) {
  const session = getSession(req);

  if (urlPath === '/login' && req.method === 'GET') {
    return sendHtml(res, 200, loginPage());
  }

  if (urlPath === '/login' && req.method === 'POST') {
    const { email, password } = await readBody(req);
    try {
      await verifyLogin(email, password);
    } catch {
      return sendHtml(res, 401, loginPage('Invalid email or password.'));
    }
    const token = randomBytes(24).toString('hex');
    sessions.set(token, { email, password, createdAt: Date.now() });
    setCookie(res, token);
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (urlPath === '/logout') {
    if (session) sessions.delete(session.token);
    clearCookie(res);
    res.writeHead(302, { Location: '/login' });
    return res.end();
  }

  if (!session) {
    res.writeHead(302, { Location: '/login' });
    return res.end();
  }

  if (urlPath === '/' && req.method === 'GET') {
    try {
      const messages = await listMessages(session.email, session.password, { limit: 50 });
      return sendHtml(res, 200, inboxPage(messages));
    } catch (e) {
      return sendHtml(res, 502, shell({ title: 'Error', body: `<h1>Couldn't reach the mail server</h1><p class="meta">${escapeHtml(e.message)}</p>` }));
    }
  }

  const msgMatch = urlPath.match(/^\/message\/(\d+)$/);
  if (msgMatch && req.method === 'GET') {
    try {
      const msg = await getMessage(session.email, session.password, msgMatch[1]);
      return sendHtml(res, 200, messagePage(msg));
    } catch (e) {
      return sendHtml(res, 502, shell({ title: 'Error', body: `<h1>Couldn't load message</h1><p class="meta">${escapeHtml(e.message)}</p>` }));
    }
  }

  const attMatch = urlPath.match(/^\/message\/(\d+)\/attachment\/(\d+)$/);
  if (attMatch && req.method === 'GET') {
    try {
      const msg = await getMessage(session.email, session.password, attMatch[1]);
      const att = msg._rawAttachments[Number(attMatch[2])];
      if (!att) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, {
        'content-type': att.contentType || 'application/octet-stream',
        'content-disposition': `attachment; filename="${(att.filename || 'attachment').replace(/[^\w.\- ]/g, '_')}"`,
      });
      return res.end(att.content);
    } catch (e) {
      res.writeHead(502);
      return res.end(String(e.message));
    }
  }

  if (urlPath === '/compose' && req.method === 'GET') {
    const q = new URL(req.url, 'http://x').searchParams;
    return sendHtml(res, 200, composePage({ to: q.get('to') || '', subject: q.get('subject') || '' }));
  }

  if (urlPath === '/compose' && req.method === 'POST') {
    const { to, subject, text } = await readBody(req);
    try {
      await sendMessage(session.email, session.password, { to, subject, text });
      res.writeHead(302, { Location: '/' });
      return res.end();
    } catch (e) {
      return sendHtml(res, 502, composePage({ to, subject, flash: `Send failed: ${e.message}` }));
    }
  }

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
}
