#!/usr/bin/env node
// Tiny static server for dist/site with a recursive vault watcher, live-reload
// dev-status endpoint, an async theme-generation job endpoint, and 2FA auth.
import { createServer } from 'node:http';
import { readFile, appendFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFile, spawn } from 'node:child_process';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { createTransport } from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from the repo root (gitignored; see .env.example). Node 20.12+.
try { process.loadEnvFile(join(__dirname, '..', '.env')); } catch { /* no .env — rely on real env */ }

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'MAIL_OWNER'];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')} — copy .env.example to .env and fill it in.`);
  process.exit(1);
}
const root = join(__dirname, '..', 'dist', 'site');
const vaultDir = join(__dirname, '..', 'vault');
const visitorsLog = join(__dirname, '..', 'vault', 'visitors.md');
const buildScript = join(__dirname, 'build-site.mjs');
const compileScript = join(__dirname, 'compile-theme.mjs');
const port = Number(process.env.PORT ?? 4173);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };

let buildVersion = Date.now();

// ─── Rebuild pipeline: debounced, and changes during a build queue a follow-up ─
let building = false;
let pending = false;
let debounceTimer = null;

function rebuild(reason) {
  if (building) { pending = true; return; }
  building = true;
  console.log(`[Watcher] Rebuilding (${reason})…`);
  execFile(process.execPath, [buildScript], (err, stdout, stderr) => {
    building = false;
    if (err) {
      console.error(`[Watcher] Build failed:`, (stderr || err.message).trim());
    } else {
      buildVersion = Date.now();
      console.log(`[Watcher] ${stdout.trim()} (version ${buildVersion})`);
    }
    if (pending) { pending = false; rebuild('queued change'); }
  });
}

console.log(`[Watcher] Watching SSSS vault at ${vaultDir}`);
watch(vaultDir, { recursive: true }, (eventType, filename) => {
  if (!filename || !filename.endsWith('.md')) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => rebuild(filename), 150);
});

// ─── Theme generation job (queued, async, polled via /generate-status) ────────
const genJob = { status: 'idle', phase: '', prompt: '', error: null, startedAt: null, finishedAt: null };
const genQueue = [];

/** Start now if idle, otherwise queue — nothing gets silently dropped. */
function requestGeneration(prompt) {
  if (genJob.status === 'running') {
    genQueue.push(prompt);
    console.log(`[Generator] Queued "${prompt}" (${genQueue.length} waiting)`);
    return;
  }
  startGeneration(prompt);
}

function drainQueue() {
  const next = genQueue.shift();
  if (next) startGeneration(next);
}

function startGeneration(prompt) {
  genJob.status = 'running';
  genJob.phase = 'Starting generator…';
  genJob.prompt = prompt;
  genJob.error = null;
  genJob.startedAt = Date.now();
  genJob.finishedAt = null;

  // Argument array — the prompt never touches a shell.
  const child = spawn(process.execPath, [compileScript, prompt], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderrTail = '';

  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split('\n')) {
      const l = line.trim();
      if (!l) continue;
      console.log(`[Generator] ${l}`);
      if (l.startsWith('[')) genJob.phase = l;
    }
  });
  child.stderr.on('data', (chunk) => {
    stderrTail = (stderrTail + String(chunk)).slice(-2000);
  });
  child.on('error', (err) => {
    genJob.status = 'error';
    genJob.error = err.message;
    genJob.finishedAt = Date.now();
    drainQueue();
  });
  child.on('close', (code) => {
    genJob.finishedAt = Date.now();
    if (code === 0) {
      genJob.status = 'done';
      genJob.phase = 'Theme compiled';
      console.log(`[Generator] Done in ${Math.round((genJob.finishedAt - genJob.startedAt) / 1000)}s.`);
      rebuild('generated theme'); // watcher usually catches it, but be certain
    } else {
      genJob.status = 'error';
      genJob.error = (stderrTail.trim().split('\n').pop() || `generator exited with code ${code}`).slice(0, 300);
      console.error(`[Generator] Failed:`, genJob.error);
    }
    drainQueue();
  });
}

// ─── 2FA Auth System ────────────────────────────────────────────────────────────

/** In-memory store: email → { code, expiresAt, attempts } */
const pendingCodes = new Map();

/** token → { email, style, issuedAt, … } — persisted so sessions survive restarts */
const authTokens = new Map();

/** email → { style, firstSeen, lastSeen, visits } — visitor memory for auto-login/welcome-back */
const visitorProfiles = new Map();

/** ip → { count, resetAt } — rate limiting for /api/send-code */
const ipRateLimit = new Map();

// ── Persistence: .data/sessions.json (gitignored — contains tokens) ──
const dataDir = join(__dirname, '..', '.data');
const sessionsFile = join(dataDir, 'sessions.json');
const TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days — remembers returning visitors

async function loadSessions() {
  try {
    const raw = JSON.parse(await readFile(sessionsFile, 'utf8'));
    for (const [t, s] of Object.entries(raw.tokens ?? {})) {
      if (Date.now() - s.issuedAt < TOKEN_TTL) authTokens.set(t, s);
    }
    for (const [e, p] of Object.entries(raw.profiles ?? {})) visitorProfiles.set(e, p);
    console.log(`[Sessions] Restored ${authTokens.size} sessions, ${visitorProfiles.size} visitor profiles`);
  } catch { /* first boot — nothing to restore */ }
}

let saveTimer = null;
function saveSessions() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const { mkdir, rename, writeFile } = await import('node:fs/promises');
    await mkdir(dataDir, { recursive: true });
    const payload = JSON.stringify({
      tokens: Object.fromEntries(authTokens),
      profiles: Object.fromEntries(visitorProfiles),
    });
    const tmp = sessionsFile + '.tmp';
    await writeFile(tmp, payload, 'utf8');
    await rename(tmp, sessionsFile);
  }, 250);
}
await loadSessions();

/** SMTP transporter */
const smtpTransport = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const mailFrom = process.env.MAIL_FROM;   // e.g. "Greg Iteen" <sales@gregiteen.xyz>
const mailOwner = process.env.MAIL_OWNER; // where visitor notifications go

function generateCode() {
  // 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

// ─── Email design system (matches the B&W splash/verify UI) ──────────────────

const SITE_URL = process.env.SITE_URL || 'https://gregiteen.xyz';

/** Shared black & white email shell — table-safe, inline styles only. */
function emailShell({ eyebrow, headline, bodyHtml }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <tr>
            <td style="padding:0 8px 28px;text-align:left;">
              <p style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#8a8a88;margin:0;">${eyebrow}</p>
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #333;background:#111111;padding:44px 36px;text-align:left;">
              <h1 style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:34px;line-height:1.02;letter-spacing:-0.5px;text-transform:uppercase;color:#f5f5f3;margin:0 0 24px;">${headline}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px;text-align:left;">
              <p style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;margin:0;">gregiteen.xyz &nbsp;·&nbsp; SSSS-native &nbsp;·&nbsp; vault-driven</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendVerificationEmail(email, code) {
  const html = emailShell({
    eyebrow: 'Greg Iteen — Portfolio · Nº 002 / Verify',
    headline: 'Your access<br>code.',
    bodyHtml: `
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#8a8a88;margin:0 0 28px;">Enter this code at the portfolio to continue. It expires in 10 minutes.</p>
      <div style="border:1px solid #f5f5f3;padding:26px 20px;text-align:center;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:700;letter-spacing:16px;color:#f5f5f3;">${code}</span>
      </div>
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#555;margin:28px 0 0;">Didn't request this? You can safely ignore this email.</p>`,
  });

  await smtpTransport.sendMail({
    from: mailFrom,
    to: email,
    subject: `${code} — Your access code`,
    html,
    text: `Your verification code is: ${code}\n\nEnter this code at the portfolio site to continue.\nThis code expires in 10 minutes.`,
  });
}

/** One-time welcome — personal note + project marketing, sent from sales@ after first verify. */
async function sendConfirmationEmail(email, style, optIn) {
  const projects = [
    ['UltraChat', 'An AI-powered communication platform — chat, voice, email, and automation under one roof.', 'https://ultrachat.app'],
    ['Total Recall', 'A sovereign memory OS for AI agents. Zero database — the filesystem is the brain.', `${SITE_URL}/projects/total-recall.html`],
    ['SSSS', 'The Structured Semantic Syntax System — the open standard this very site runs on.', `${SITE_URL}/projects/ssss.html`],
    ['Festech.live', 'Live event technology, from ticketing to production.', 'https://festech.live'],
  ];
  const projectRows = projects.map(([name, blurb, url]) => `
      <tr>
        <td style="padding:18px 0;border-top:1px solid #2a2a2a;">
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:1px;color:#f5f5f3;margin:0 0 6px;"><a href="${url}" style="color:#f5f5f3;text-decoration:none;">${name} →</a></p>
          <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8a8a88;margin:0;">${blurb}</p>
        </td>
      </tr>`).join('');

  const optInText = optIn 
    ? `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0 0 16px;">I see you opted in to the architectural deep-dive series. I'll be sending over the first installment covering native markup pipelines shortly.</p>`
    : '';

  const html = emailShell({
    eyebrow: 'Greg Iteen — Portfolio · Welcome',
    headline: "You're in.",
    bodyHtml: `
      <img src="${SITE_URL}/assets/greg-portrait.jpg" width="120" height="120" alt="Greg Iteen" style="display:block;border-radius:50%;filter:grayscale(1);border:1px solid #333;margin:0 0 24px;object-fit:cover;">
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0 0 16px;">Hey — Greg here. Thanks for stopping by.</p>
      ${optInText}
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0 0 16px;">You asked for <em style="color:#f5f5f3;font-style:normal;border-bottom:1px solid #555;">${style}</em>, so the site rebuilt itself around that — every visitor gets their own edition. That's not a gimmick; it's a live demo of how I build: AI-native systems that generate, remember, and adapt.</p>
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0 0 28px;">A few things I've been building lately:</p>
      <table width="100%" cellpadding="0" cellspacing="0">${projectRows}</table>
      <a href="${SITE_URL}" style="display:block;background:#f5f5f3;color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;text-align:center;padding:18px;margin:28px 0 0;">View your edition →</a>
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.8;color:#8a8a88;margin:28px 0 0;">Want to build something together? Just reply — this lands straight in my inbox.<br><br>— Greg</p>`,
  });

  await smtpTransport.sendMail({
    from: mailFrom,
    to: email,
    subject: `You're in — your ${style} edition is ready`,
    html,
    text: `Hey — Greg here. Thanks for stopping by.\n\nYou asked for "${style}", so the site rebuilt itself around that — every visitor gets their own edition.\n\nA few things I've been building:\n- UltraChat — AI-powered communication platform (https://ultrachat.app)\n- Total Recall — sovereign memory OS for AI agents\n- SSSS — the open standard this site runs on\n- Festech.live — live event technology (https://festech.live)\n\nYour edition: ${SITE_URL}\n\nWant to build something together? Just reply — this lands straight in my inbox.\n\n— Greg`,
  });
  console.log(`[Mail] Confirmation sent to ${email}`);
}

// ─── Visitor Logging & Notification ──────────────────────────────────────────

async function logVisitor(info) {
  const ts = new Date().toISOString();
  const line = `| ${ts} | ${info.email} | ${info.style} | ${info.ip} | ${info.userAgent.slice(0, 60)} |\n`;
  try {
    await readFile(visitorsLog, 'utf8');
  } catch {
    await appendFile(visitorsLog, `---\ntype: run\ntitle: Portfolio Visitors\ndescription: Append-only log of verified portfolio visitors (tenant_private, never exported).\ntimestamp: ${ts}\n---\n\n# Portfolio Visitors\n\n| Timestamp | Email | Style | IP | User Agent |\n|-----------|-------|-------|----|-----------|\n`, 'utf8');
  }
  await appendFile(visitorsLog, line, 'utf8');
  console.log(`[Visitors] Logged ${info.email} (${info.style})`);
}

async function notifyOwner(info) {
  const ts = new Date().toISOString();
  // Parse user agent for readable summary
  const ua = info.userAgent || 'Unknown';
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown browser';
  const os = ua.match(/(Mac OS X|Windows NT|Linux|Android|iOS)[\s\d._]*/)?.[0] || 'Unknown OS';

  const row = (k, v, mono = false) => `
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a8a88;padding:9px 16px 9px 0;white-space:nowrap;vertical-align:top;">${k}</td>
        <td style="font-family:${mono ? "'Courier New',Courier,monospace" : "'Helvetica Neue',Helvetica,Arial,sans-serif"};font-size:13px;color:#f5f5f3;padding:9px 0;">${v}</td>
      </tr>`;

  const html = emailShell({
    eyebrow: 'Greg Iteen — Portfolio · Visitor alert',
    headline: 'New<br>visitor.',
    bodyHtml: `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2a2a;">
        ${row('Email', `<strong>${info.email}</strong>`)}
        ${row('Style', info.style)}
        ${row('Time', ts, true)}
        ${row('IP', info.ip, true)}
        ${row('Browser', browser)}
        ${row('OS', os)}
      </table>
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.6;color:#555;margin:20px 0 0;word-break:break-all;">${ua}</p>`,
  });

  await smtpTransport.sendMail({
    from: mailFrom,
    to: mailOwner,
    subject: `New visitor: ${info.email} — "${info.style}"`,
    text: `New portfolio visitor!\n\nEmail: ${info.email}\nDesign Style: ${info.style}\nTime: ${ts}\nIP: ${info.ip}\nBrowser: ${browser}\nOS: ${os}\nFull UA: ${ua}`,
    html,
  });
  console.log(`[Visitors] Notified owner about ${info.email}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendJson(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) { req.destroy(); reject(new Error('Body too large')); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────

/** Paths that bypass the auth check */
function isPublicPath(urlPath) {
  if (urlPath === '/splash.html' || urlPath === '/verify.html') return true;
  if (urlPath.startsWith('/api/')) return true;
  if (urlPath.startsWith('/assets/')) return true;
  // Dev/generation endpoints are API-like
  if (urlPath === '/dev-status' || urlPath === '/generate-status' || urlPath === '/generate-theme') return true;
  return false;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.gi_auth;
  if (!token) return false;
  const session = authTokens.get(token);
  if (!session) return false;
  if (Date.now() - session.issuedAt > TOKEN_TTL) {
    authTokens.delete(token);
    saveSessions();
    return false;
  }
  return true;
}

// ─── Server ──────────────────────────────────────────────────────────────────

createServer(async (req, res) => {
  const urlObj = new URL(req.url, 'http://x');
  const urlPath = decodeURIComponent(urlObj.pathname);

  // ── Auth check for protected routes ──
  if (!isPublicPath(urlPath) && !isAuthenticated(req)) {
    res.writeHead(302, { 'Location': '/splash.html' });
    res.end();
    return;
  }

  // ── API: Send verification code ──
  if (urlPath === '/api/send-code' && req.method === 'POST') {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const now = Date.now();
      const rl = ipRateLimit.get(ip) || { count: 0, resetAt: now + 3600000 };
      if (now > rl.resetAt) { rl.count = 0; rl.resetAt = now + 3600000; }
      if (rl.count >= 10) {
        return sendJson(res, 429, { success: false, error: 'Too many requests. Please try again later.' });
      }
      rl.count++;
      ipRateLimit.set(ip, rl);

      const { email, style, optIn } = await readBody(req);
      if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
        return sendJson(res, 400, { success: false, error: 'Valid email required.' });
      }
      if (!style || typeof style !== 'string' || !style.trim() || style.length > 500) {
        return sendJson(res, 400, { success: false, error: 'Design style required.' });
      }

      const code = generateCode();
      pendingCodes.set(email.toLowerCase(), {
        code,
        style: style.trim(),
        optIn: !!optIn,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
      });

      console.log(`[Auth] Sending code to ${email} (code: ${code})`);

      // Send email (don't block the response on it)
      sendVerificationEmail(email, code).catch(err => {
        console.error(`[Auth] Failed to send email to ${email}:`, err.message);
      });

      // Start (or queue) theme generation in background — never dropped
      const cleanStyle = style.trim().slice(0, 500);
      console.log(`[Generator] Requested for prompt: "${cleanStyle}"`);
      requestGeneration(cleanStyle);

      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // ── API: Verify code ──
  if (urlPath === '/api/verify-code' && req.method === 'POST') {
    try {
      const { email, code } = await readBody(req);
      if (!email || !code) {
        return sendJson(res, 400, { success: false, error: 'Email and code required.' });
      }

      const entry = pendingCodes.get(email.toLowerCase());
      if (!entry) {
        return sendJson(res, 400, { success: false, error: 'No code found. Request a new one.' });
      }

      if (Date.now() > entry.expiresAt) {
        pendingCodes.delete(email.toLowerCase());
        return sendJson(res, 400, { success: false, error: 'Code expired. Request a new one.' });
      }

      entry.attempts++;
      if (entry.attempts > 5) {
        pendingCodes.delete(email.toLowerCase());
        return sendJson(res, 429, { success: false, error: 'Too many attempts. Request a new code.' });
      }

      if (entry.code !== code.trim()) {
        return sendJson(res, 400, { success: false, error: 'Incorrect code. Try again.' });
      }

      // Code is valid — issue auth token
      const style = entry.style || 'default';
      const optIn = entry.optIn || false;
      pendingCodes.delete(email.toLowerCase());
      const token = generateToken();
      authTokens.set(token, {
        email: email.toLowerCase(),
        style,
        issuedAt: Date.now(),
        userAgent: req.headers['user-agent'] || '',
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
      });

      console.log(`[Auth] Verified ${email}, token issued.`);

      // Visitor memory: profile upsert (drives welcome-back + one-time confirmation email)
      const emailKey = email.toLowerCase();
      const prior = visitorProfiles.get(emailKey);
      visitorProfiles.set(emailKey, {
        style,
        optIn: prior?.optIn ?? optIn,
        firstSeen: prior?.firstSeen ?? Date.now(),
        lastSeen: Date.now(),
        visits: (prior?.visits ?? 0) + 1,
      });
      saveSessions();

      // Log visitor and notify Greg with full session info
      const sessionInfo = { email: emailKey, style, optIn, ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '', userAgent: req.headers['user-agent'] || '' };
      logVisitor(sessionInfo).catch(err => console.error('[Visitors] Log error:', err.message));
      notifyOwner(sessionInfo).catch(err => console.error('[Visitors] Notify error:', err.message));

      // First visit → personal confirmation/welcome email from sales@
      if (!prior) {
        sendConfirmationEmail(emailKey, style, optIn).catch(err => console.error('[Mail] Confirmation error:', err.message));
      }

      res.writeHead(200, {
        'content-type': 'application/json',
        'set-cookie': `gi_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(TOKEN_TTL / 1000)}`,
      });
      res.end(JSON.stringify({ success: true, redirect: '/' }));
      return;
    } catch (err) {
      return sendJson(res, 400, { success: false, error: err.message });
    }
  }

  // ── API: Download design spec ──
  if (urlPath === '/api/design-spec') {
    const slug = urlObj.searchParams.get('slug');
    const designsDir = join(__dirname, '..', 'vault', 'pages', 'designs');
    let designPath;
    if (slug && /^design-[a-z0-9]+$/.test(slug)) {
      designPath = join(designsDir, `${slug}.md`);
    } else {
      // Find the latest design-*.md file
      try {
        const files = (await readFile(designsDir, 'utf8').catch(() => null), 
          await import('node:fs/promises').then(fs => fs.readdir(designsDir)));
        const designFiles = files.filter(f => f.startsWith('design-') && f.endsWith('.md'))
          .sort().reverse();
        designPath = designFiles.length
          ? join(designsDir, designFiles[0])
          : join(designsDir, 'design.md');
      } catch {
        designPath = join(designsDir, 'design.md');
      }
    }
    try {
      const content = await readFile(designPath, 'utf8');
      const filename = designPath.split('/').pop();
      res.writeHead(200, {
        'content-type': 'text/markdown; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
      });
      res.end(content);
    } catch {
      return sendJson(res, 404, { error: 'No design spec available yet.' });
    }
    return;
  }

  // ── API: Session info (what cookies tell us) ──
  if (urlPath === '/api/session') {
    const cookies = parseCookies(req.headers.cookie);
    const session = authTokens.get(cookies.gi_auth);
    if (session) {
      return sendJson(res, 200, {
        authenticated: true,
        email: session.email,
        style: session.style,
        authenticatedAt: new Date(session.issuedAt).toISOString(),
        sessionAge: Math.round((Date.now() - session.issuedAt) / 1000) + 's',
        userAgent: session.userAgent,
        ip: session.ip,
      });
    }
    return sendJson(res, 200, { authenticated: false });
  }

  // ── Existing endpoints ──
  if (urlPath === '/dev-status') {
    return sendJson(res, 200, { version: buildVersion });
  }

  if (urlPath === '/generate-status') {
    return sendJson(res, 200, {
      status: genJob.status,
      phase: genJob.phase,
      error: genJob.error,
      version: buildVersion,
    });
  }

  if (urlPath === '/generate-theme' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) req.destroy();
    });
    req.on('end', () => {
      try {
        const { prompt } = JSON.parse(body);
        const clean = typeof prompt === 'string' ? prompt.trim() : '';
        if (!clean) return sendJson(res, 400, { started: false, error: 'No prompt provided' });
        if (clean.length > 500) return sendJson(res, 400, { started: false, error: 'Prompt too long (max 500 chars)' });
        console.log(`[Generator] Requested for prompt: "${clean}"`);
        requestGeneration(clean);
        sendJson(res, 202, { started: true, queued: genJob.status === 'running' });
      } catch {
        sendJson(res, 400, { started: false, error: 'Invalid JSON body' });
      }
    });
    return;
  }

  // ── Static file serving ──
  let file = normalize(join(root, urlPath === '/' ? 'index.html' : urlPath));
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
}).listen(port, () => console.log(`portfolio-site → http://localhost:${port}`));
