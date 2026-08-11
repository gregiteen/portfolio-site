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
export const webmailSessions = new Map();
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
  return getWebmailSessionByToken(token);
}

export function getWebmailSessionByToken(token) {
  if (!token) return null;
  const session = webmailSessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL) {
    webmailSessions.delete(token);
    return null;
  }
  return { token, ...session };
}

export function updateWebmailSessionPasswords(email, password) {
  const address = String(email || '').trim().toLowerCase();
  for (const session of webmailSessions.values()) {
    if (String(session.email || '').trim().toLowerCase() === address) session.password = password;
  }
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
:root{--black:#0a0a0a;--panel:#111113;--white:#f5f5f3;--gray:rgba(245,245,243,.55);--faint:rgba(245,245,243,.22);--line:rgba(245,245,243,.12);--line-strong:rgba(245,245,243,.18);--accent:#ff6a00;--accent-2:#ff8a3d}
html,body{min-height:100%}
body{font-family:'Archivo',system-ui,sans-serif;background:
  radial-gradient(900px 500px at 15% 0%, rgba(255,106,0,.08), transparent 60%),
  radial-gradient(700px 400px at 85% 10%, rgba(255,138,61,.06), transparent 60%),
  var(--black);color:var(--white);-webkit-font-smoothing:antialiased}
.frame{max-width:980px;margin:0 auto;padding:clamp(20px,4vw,40px)}
.top{display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gray);margin-bottom:28px;border:1px solid var(--line);background:rgba(17,17,19,.6);backdrop-filter:blur(12px);padding:14px 18px}
.top a{color:var(--gray);text-decoration:none;margin-left:18px;transition:color .15s}
.top a:hover{color:var(--white)}
.top .logo{height:18px;width:auto;display:block;opacity:.9}
h1{font-family:'Archivo Black',sans-serif;font-size:clamp(1.6rem,3vw,2.1rem);letter-spacing:-.02em;line-height:.9;margin-bottom:10px}
.subhead{font-family:'IBM Plex Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:24px}
.flash{font-family:'IBM Plex Mono',monospace;font-size:.8rem;color:var(--accent);border:1px solid rgba(255,106,0,.35);background:rgba(255,106,0,.08);padding:12px 14px;margin-bottom:20px}
label{display:block;font-family:'IBM Plex Mono',monospace;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin:18px 0 8px}
input[type=email],input[type=password],input[type=text],textarea{width:100%;background:rgba(255,255,255,.02);border:1px solid var(--line);color:var(--white);font-family:'Archivo',sans-serif;font-size:.95rem;padding:12px 14px;outline:none;transition:border-color .15s, background .15s}
input:focus,textarea:focus{border-color:rgba(255,106,0,.5);background:rgba(255,255,255,.04)}
textarea{min-height:260px;resize:vertical;font-family:'IBM Plex Mono',monospace;font-size:.85rem;line-height:1.6}
button,.btn{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#0a0a0a;border:1px solid var(--accent);font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;padding:11px 18px;margin-top:18px;cursor:pointer;transition:all .15s}
button:hover,.btn:hover{background:var(--accent-2);border-color:var(--accent-2);transform:translateY(-1px)}
.btn-ghost{background:transparent;color:var(--white);border-color:var(--line-strong)}
.btn-ghost:hover{background:rgba(255,255,255,.06);color:var(--white)}
.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.count{font-family:'IBM Plex Mono',monospace;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gray)}
.list{border:1px solid var(--line);background:rgba(17,17,19,.55);backdrop-filter:blur(10px);overflow:hidden}
.row{display:grid;grid-template-columns:200px 1fr 120px;gap:16px;padding:14px 18px;border-bottom:1px solid var(--line);text-decoration:none;color:var(--white);transition:background .12s}
.row:last-child{border-bottom:none}
.row:hover{background:rgba(255,255,255,.04)}
.row .from{color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row.unseen .from{color:var(--white)}
.row .subject{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.92rem}
.row.unseen .subject{font-weight:700}
.row .date{width:auto;text-align:right;color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.72rem;align-self:center}
.dot{width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block;margin-right:8px;vertical-align:middle}
.meta{font-family:'IBM Plex Mono',monospace;font-size:.8rem;color:var(--gray);margin-bottom:18px;line-height:1.8}
.meta strong{color:var(--white)}
.body-frame{border:1px solid var(--line);width:100%;min-height:420px;background:#fff;border-radius:2px}
.body-text{white-space:pre-wrap;font-family:'IBM Plex Mono',monospace;font-size:.85rem;line-height:1.65;border:1px solid var(--line);padding:20px;background:rgba(17,17,19,.4)}
.attachments{margin-top:18px;font-family:'IBM Plex Mono',monospace;font-size:.8rem}
.attachments a{color:var(--accent);text-decoration:none}
.attachments a:hover{text-decoration:underline}
.empty{color:var(--gray);font-family:'IBM Plex Mono',monospace;font-size:.82rem;padding:56px 24px;text-align:center;line-height:1.6}
.empty strong{color:var(--white);font-family:'Archivo Black',sans-serif;font-size:1rem;display:block;margin-bottom:8px;letter-spacing:-.01em}
@media(max-width:640px){.row{grid-template-columns:1fr auto}.row .from{grid-column:1/-1;font-size:.74rem}.toolbar{flex-direction:column;align-items:stretch}}
</style>
</head>
<body>
<div class="frame">
<div class="top">
  <img class="logo" src="https://gregiteen.xyz/gi-logo-transparent-dark.png" alt="greg.iteen">
  ${title !== 'Sign in' ? '<div><a href="/">Inbox</a><a href="/crm">CRM & Settings</a><a href="/logout">Sign out</a></div>' : ''}
</div>
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
  <input type="email" id="login-email" name="email" required autofocus placeholder="sales@gregiteen.xyz">
  <label style="display:flex; justify-content:space-between; align-items:baseline;">
    <span>Password</span>
    <a href="#" onclick="requestPasswordReset(event)" style="font-size:0.85em; color:var(--gray); text-decoration:none;">Forgot password?</a>
  </label>
  <input type="password" name="password" required>
  <button type="submit">Sign in</button>
</form>
<script>
  async function requestPasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (!email) return alert('Please enter your email address first.');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) alert('Success! A reset link has been sent to the backup email.');
      else alert('Failed: ' + (data.error || 'Unknown error'));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
</script>`,
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
  const unread = messages.filter(m=> !m.seen).length;
  const rows = messages.length
    ? messages.map((m) => `<a class="row${m.seen ? '' : ' unseen'}" href="/message/${m.uid}">
        <span class="from">${!m.seen ? '<span class="dot"></span>' : ''}${escapeHtml(m.fromName || m.from)}</span>
        <span class="subject">${escapeHtml(m.subject)}</span>
        <span class="date">${escapeHtml(formatDate(m.date))}</span>
      </a>`).join('\n')
    : `<div class="empty"><strong>Inbox is empty</strong>No live mail yet — real IMAP (sales@gregiteen.xyz) is connected; messages appear here as they arrive. Try sending yourself a test from /compose.</div>`;
  return shell({
    title: 'Inbox',
    body: `<h1>Inbox</h1>
<div class="subhead">${messages.length} messages ${unread ? `· ${unread} unread` : ''}</div>
<div class="toolbar"><span class="count">${messages.length ? 'Newest first' : 'Live IMAP — no mocks'}</span><a class="btn" href="/compose">Compose</a></div>
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
    webmailSessions.set(token, { email, password, createdAt: Date.now() });
    setCookie(res, token);
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (urlPath === '/logout') {
    if (session) webmailSessions.delete(session.token);
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

  if (urlPath === '/crm' && req.method === 'GET') {
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const __dirname = new URL('.', import.meta.url).pathname;
      const html = await fs.readFile(path.join(__dirname, '..', '..', 'static', 'crm-app.html'), 'utf8');
      
      // Inject the webmail navigation bar into the top of the CRM app
      const navHtml = `<div style="max-width:820px; margin:0 auto; padding:20px 4vw 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(245,245,243,.55);border-bottom:1px solid rgba(245,245,243,.28);padding-bottom:16px;margin-bottom:20px;">
          <img style="height:18px;width:auto;display:block" src="https://gregiteen.xyz/gi-logo-transparent-dark.png" alt="greg.iteen">
          <div>
            <a href="/" style="color:rgba(245,245,243,.55);text-decoration:none;margin-left:20px;">Inbox</a>
            <a href="/crm" style="color:#fff;text-decoration:none;margin-left:20px;">CRM & Settings</a>
            <a href="/logout" style="color:rgba(245,245,243,.55);text-decoration:none;margin-left:20px;">Sign out</a>
          </div>
        </div>
      </div>`;
      
      // Remove the old admin title and insert our nav bar
      let modifiedHtml = html.replace(/<title>Greg Iteen — Admin<\/title>/, '<title>Greg Iteen — CRM</title>');
      modifiedHtml = modifiedHtml.replace(/<div class="frame">/, `${navHtml}\n<div class="frame" style="padding-top:0;">`);
      modifiedHtml = modifiedHtml.replace(/<header class="top">[\s\S]*?<\/header>/, '');
      
      return sendHtml(res, 200, modifiedHtml);
    } catch (e) {
      return sendHtml(res, 502, shell({ title: 'Error', body: `<h1>Error loading CRM</h1><p class="meta">${escapeHtml(e.message)}</p>` }));
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
