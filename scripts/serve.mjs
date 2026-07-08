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
import https from 'node:https';
import {
  initRuntimeStore,
  listVisitors,
  listProposals,
  upsertVisitor,
  upsertProposal,
  deleteProposal,
  appendRun,
  pendingNotifications,
} from './runtime-store.mjs';

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
const improveScript = join(__dirname, 'improve-theme.mjs');
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
const genJob = { status: 'idle', phase: '', prompt: '', error: null, startedAt: null, finishedAt: null, runId: null };
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
  const runId = randomBytes(8).toString('hex');
  genJob.status = 'running';
  genJob.phase = 'Starting generator…';
  genJob.prompt = prompt;
  genJob.error = null;
  genJob.startedAt = Date.now();
  genJob.finishedAt = null;
  genJob.runId = runId;
  appendRun({ run_id: runId, prompt, status: 'running', startedAt: genJob.startedAt }).catch((err) => {
    console.error('[Runtime] Failed to persist generation start:', err.message);
  });

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
    appendRun({ run_id: runId, prompt, status: 'failed', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt, error: err.message }).catch((e) => {
      console.error('[Runtime] Failed to persist generation failure:', e.message);
    });
    drainQueue();
  });
  child.on('close', (code) => {
    genJob.finishedAt = Date.now();
    if (code === 0) {
      genJob.status = 'done';
      genJob.phase = 'Theme compiled';
      console.log(`[Generator] Done in ${Math.round((genJob.finishedAt - genJob.startedAt) / 1000)}s.`);
      appendRun({ run_id: runId, prompt, status: 'done', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt }).catch((e) => {
        console.error('[Runtime] Failed to persist generation completion:', e.message);
      });
      rebuild('generated theme'); // watcher usually catches it, but be certain
    } else {
      genJob.status = 'error';
      genJob.error = (stderrTail.trim().split('\n').pop() || `generator exited with code ${code}`).slice(0, 300);
      console.error(`[Generator] Failed:`, genJob.error);
      appendRun({ run_id: runId, prompt, status: 'failed', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt, error: genJob.error }).catch((e) => {
        console.error('[Runtime] Failed to persist generation failure:', e.message);
      });
    }
    drainQueue();
  });
}

// ─── 2FA Auth System ────────────────────────────────────────────────────────────

/** In-memory store: email → { code, expiresAt, attempts } */
const pendingCodes = new Map();

/** Deferred visitor notifications: token → { sessionInfo, cnaData, timer } */
const pendingVisitEmails = new Map();

/** Active proposal threads: proposalId → { clientEmail, assessment, enrichment, proposal, revisions } */
const proposalThreads = new Map();

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
    for (const [e, p] of Object.entries(raw.profiles ?? {})) {
      if (!visitorProfiles.has(e)) {
        const migrated = await upsertVisitor(e, p);
        visitorProfiles.set(e, migrated);
      }
    }
    console.log(`[Sessions] Restored ${authTokens.size} sessions; runtime store has ${visitorProfiles.size} visitor profiles`);
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
    });
    const tmp = sessionsFile + '.tmp';
    await writeFile(tmp, payload, 'utf8');
    await rename(tmp, sessionsFile);
  }, 250);
}
const runtimeCounts = await initRuntimeStore();
for (const visitor of listVisitors()) visitorProfiles.set(visitor.email, visitor);
for (const proposal of listProposals()) proposalThreads.set(proposal.id, proposal);
await loadSessions();
for (const pending of pendingNotifications()) {
  const token = pending.pending_notification?.token;
  const sessionInfo = pending.pending_notification?.sessionInfo;
  if (!token || !sessionInfo) continue;
  const sendAfter = Date.parse(pending.pending_notification.send_after || '') || Date.now() + 30 * 60 * 1000;
  const delay = Math.max(0, sendAfter - Date.now());
  const timer = setTimeout(() => {
    sendDeferredNotification(token);
  }, delay);
  pendingVisitEmails.set(token, { sessionInfo, cnaData: pending.pending_notification.cnaData || null, timer });
}
console.log(`[Runtime] Hydrated ${runtimeCounts.visitors} visitor profiles, ${runtimeCounts.proposals} proposals, ${pendingVisitEmails.size} pending notifications`);

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
    ['Total Recall', 'A memory OS for AI agents. Zero database — the filesystem is the brain.', `${SITE_URL}/projects/total-recall.html`],
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
    text: `Hey — Greg here. Thanks for stopping by.\n\nYou asked for "${style}", so the site rebuilt itself around that — every visitor gets their own edition.\n\nA few things I've been building:\n- UltraChat — AI-powered communication platform (https://ultrachat.app)\n- Total Recall — memory OS for AI agents\n- SSSS — the open standard this site runs on\n- Festech.live — live event technology (https://festech.live)\n\nYour edition: ${SITE_URL}\n\nWant to build something together? Just reply — this lands straight in my inbox.\n\n— Greg`,
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
        ${info.screen ? row('Screen', info.screen, true) : ''}
        ${info.timezone ? row('Timezone', info.timezone) : ''}
        ${info.language ? row('Language', info.language) : ''}
        ${info.referrer ? row('Referrer', info.referrer, true) : ''}
        ${info.platform ? row('Platform', info.platform) : ''}
        ${row('Touch', info.touch ? 'Yes' : 'No')}
      </table>
      ${info.cnaAssessment ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e22b22;margin-top:20px;">
        <tr><td colspan="2" style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e22b22;padding:14px 0 8px;">CNA Assessment</td></tr>
        ${Object.entries(info.cnaAssessment).map(([k, v]) => row(k.replace(/_/g, ' '), v)).join('')}
      </table>` : ''}
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

/** Send the deferred notification with everything collected during the visit */
function sendDeferredNotification(token) {
  const pending = pendingVisitEmails.get(token);
  if (!pending) return;
  clearTimeout(pending.timer);
  pendingVisitEmails.delete(token);

  const info = pending.sessionInfo;
  const cna = pending.cnaData;

  // Build a comprehensive email with all session data
  if (cna) {
    // Visitor did CNA — include assessment in the notification
    info.cnaAssessment = cna;
  }

  const existing = visitorProfiles.get(info.email);
  if (existing) {
    const next = { ...existing, pending_notification: null };
    visitorProfiles.set(info.email, next);
    upsertVisitor(info.email, next).catch((err) => {
      console.error('[Runtime] Failed to clear pending notification:', err.message);
    });
  }

  notifyOwner(info).catch(err => console.error('[Visitors] Notify error:', err.message));
}

// ─── Gemini API Helper ───────────────────────────────────────────────────────

function geminiCall(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!text) return reject(new Error(`Empty Gemini response: ${data.slice(0, 200)}`));
          resolve(text);
        } catch (/** @type {any} */ e) {
          reject(new Error(`Gemini parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(120_000, () => { req.destroy(); reject(new Error('Gemini timeout')); });
    req.write(body);
    req.end();
  });
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
  if (urlPath === '/splash.html' || urlPath === '/verify.html' || urlPath === '/consult.html') return true;
  if (urlPath.startsWith('/api/')) return true;
  if (urlPath.startsWith('/assets/')) return true;
  if (urlPath.startsWith('/designs/')) return true;
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

function isAdmin(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.gi_auth;
  if (!token) return false;
  const session = authTokens.get(token);
  if (!session) return false;
  // Admin = the site owner's email
  return session.email === mailOwner || session.email === process.env.ADMIN_EMAIL;
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

  // ── Returning user: splash → home redirect ──
  if (urlPath === '/splash.html' && isAuthenticated(req)) {
    res.writeHead(302, { 'Location': '/' });
    res.end();
    return;
  }

  // ── API: Logout ──
  if (urlPath === '/api/logout') {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.gi_auth;
    if (token) {
      // Fire deferred notification before logout
      sendDeferredNotification(token);
      authTokens.delete(token);
      saveSessions();
    }
    res.writeHead(302, {
      'Location': '/splash.html',
      'Set-Cookie': 'gi_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    });
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

      // Check generation rate limit per email (3 max)
      const emailKey = email.toLowerCase();
      const existingProfile = visitorProfiles.get(emailKey);
      const genCount = existingProfile?.generations ?? 0;
      if (genCount >= 3) {
        return sendJson(res, 429, { success: false, error: 'Generation limit reached (3 max). Your existing designs are still available — just enter your email to sign in.' });
      }

      const code = generateCode();
      pendingCodes.set(emailKey, {
        code,
        style: style.trim(),
        optIn: !!optIn,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
      });

      console.log(`[Auth] Sending code to ${email} (code: ${code})`);

      // Send email (don't block the response on it)
      sendVerificationEmail(email, code).catch(err => {
        console.error('Failed to send magic link:', String(err));
      });

      // Start (or queue) theme generation in background — never dropped
      const cleanStyle = style.trim().slice(0, 500);
      console.log(`[Generator] Requested for prompt: "${cleanStyle}"`);
      requestGeneration(cleanStyle);

      return sendJson(res, 200, { success: true });
    } catch (/** @type {any} */ err) {
      return sendJson(res, 400, { success: false, error: String(err) });
    }
  }

  // ── API: Verify code ──
  if (urlPath === '/api/verify-code' && req.method === 'POST') {
    try {
      const { email, code, enrich } = await readBody(req);
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
      const nextProfile = {
        style,
        optIn: prior?.optIn ?? optIn,
        firstSeen: prior?.firstSeen ?? Date.now(),
        lastSeen: Date.now(),
        visits: (prior?.visits ?? 0) + 1,
        generations: (prior?.generations ?? 0) + 1,
        enrichment: prior?.enrichment || {},
        pending_notification: prior?.pending_notification || null,
      };
      visitorProfiles.set(emailKey, nextProfile);
      await upsertVisitor(emailKey, nextProfile);
      saveSessions();

      // Log visitor and notify Greg with full session info + enrichment
      const sessionInfo = {
        email: emailKey, style, optIn,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        screen: enrich?.screen || '',
        timezone: enrich?.tz || '',
        language: enrich?.lang || '',
        referrer: enrich?.ref || '',
        touch: enrich?.touch || false,
        platform: enrich?.platform || '',
      };
      logVisitor(sessionInfo).catch(err => console.error('Event stream error:', String(err)));

      // Defer notification — wait until visitor leaves the site
      const exitTimer = setTimeout(() => {
        sendDeferredNotification(token);
      }, 30 * 60 * 1000); // 30 min fallback
      const pendingNotification = {
        token,
        held_since: new Date().toISOString(),
        send_after: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        sessionInfo,
        cnaData: null,
      };
      pendingVisitEmails.set(token, { sessionInfo, cnaData: null, timer: exitTimer });
      const withPending = { ...nextProfile, enrichment: sessionInfo, pending_notification: pendingNotification };
      visitorProfiles.set(emailKey, withPending);
      upsertVisitor(emailKey, withPending).catch((err) => {
        console.error('[Runtime] Failed to persist pending notification:', err.message);
      });

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
    } catch (/** @type {any} */ err) {
      return sendJson(res, 400, { success: false, error: String(err) });
    }
  }

  // (design-spec download removed — designs are proprietary)

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
    let latestUrl = null;
    try {
      const fs = await import('node:fs/promises');
      const designsDir = join(__dirname, '..', 'vault', 'pages', 'designs');
      const files = await fs.readdir(designsDir);
      
      const stats = await Promise.all(
        files.filter(f => f.endsWith('.md') && f !== 'nostalgia.md' && f !== 'high-stakes-field-day.md')
             .map(async f => {
                const s = await fs.stat(join(designsDir, f));
                return { name: f, mtime: s.mtimeMs };
             })
      );
      
      stats.sort((a, b) => b.mtime - a.mtime);
      if (stats.length > 0) {
        latestUrl = `/designs/${stats[0].name.replace('.md', '')}/index.html`;
      }
    } catch {}

    return sendJson(res, 200, {
      status: genJob.status,
      phase: genJob.phase,
      error: genJob.error,
      version: buildVersion,
      latestUrl
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

  // ── API: Visitor Exit (sendBeacon) ──
  if (urlPath === '/api/visitor-exit' && req.method === 'POST') {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.gi_auth;
    if (token) {
      sendDeferredNotification(token);
    }
    res.writeHead(204).end();
    return;
  }

  // ── API: CNA Chat ──
  if (urlPath === '/api/cna' && req.method === 'POST') {
    try {
      const { history } = await readBody(req);
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
      if (!GOOGLE_API_KEY) {
        return sendJson(res, 500, { message: 'AI service unavailable.' });
      }

      const systemPrompt = `You are an AI assistant conducting a Client Needs Assessment for Greg Iteen, a software engineer and designer. Your job is to understand the prospect's project needs through a natural conversation.

Gather the following information through the conversation:
1. Project type (website, web app, mobile app, branding, design, infrastructure, etc.)
2. Project description and goals
3. Timeline expectations
4. Budget range (if they're comfortable sharing)
5. Technical requirements / preferred technologies
6. Current pain points or problems to solve
7. Target audience
8. Any existing assets or systems to integrate with

Be professional, warm, and concise. Ask one or two questions at a time, not all at once. When you have enough information to generate a meaningful proposal (usually after 4-8 exchanges), respond with a JSON assessment.

When the assessment is complete, your response MUST be valid JSON with this exact structure:
{"message": "Your closing message to the prospect...", "complete": true, "assessment": {"project_type": "...", "description": "...", "timeline": "...", "budget_range": "...", "technologies": "...", "complexity": "Low/Medium/High", "priority": "...", "pain_points": "...", "target_audience": "..."}}

If NOT complete, respond with just:
{"message": "Your next question or response...", "complete": false}`;

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will conduct the needs assessment as described.' }] },
      ];

      if (!history || history.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'The prospect just arrived. Start the conversation with a warm greeting and your first question.' }] });
      } else {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      const apiBody = JSON.stringify({
        contents,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const apiUrl = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GOOGLE_API_KEY}`);
      const apiRes = await new Promise((resolve, reject) => {
        const req2 = https.request({
          hostname: apiUrl.hostname,
          path: apiUrl.pathname + apiUrl.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(apiBody) },
        }, (res2) => {
          let data = '';
          res2.on('data', (c) => data += c);
          res2.on('end', () => resolve(data));
        });
        req2.on('error', reject);
        req2.setTimeout(60000, () => { req2.destroy(); reject(new Error('timeout')); });
        req2.write(apiBody);
        req2.end();
      });

      const parsed = JSON.parse(apiRes);
      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let cnaResponse;
      try {
        cnaResponse = JSON.parse(text);
      } catch {
        cnaResponse = { message: text || 'I\'d love to hear about your project. What are you looking to build?', complete: false };
      }

      return sendJson(res, 200, cnaResponse);
    } catch (/** @type {any} */ err) {
      console.error('[CNA] Error:', err.message);
      return sendJson(res, 500, { message: 'Something went wrong. Please try again.' });
    }
  }

  // ── API: CNA Proposal Generation ──
  if (urlPath === '/api/cna-proposal' && req.method === 'POST') {
    try {
      const { assessment, history } = await readBody(req);
      if (!assessment) {
        return sendJson(res, 400, { success: false, error: 'Assessment data required.' });
      }

      // Get visitor info from auth token
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.gi_auth;
      const session = token ? authTokens.get(token) : null;
      const clientEmail = session?.email || 'unknown';

      // Attach CNA to deferred visitor notification
      if (token && pendingVisitEmails.has(token)) {
        const pending = pendingVisitEmails.get(token);
        pending.cnaData = assessment;
        const sessionEmail = pending.sessionInfo?.email;
        const existing = sessionEmail ? visitorProfiles.get(sessionEmail) : null;
        if (existing?.pending_notification) {
          const next = {
            ...existing,
            pending_notification: {
              ...existing.pending_notification,
              cnaData: assessment,
            },
          };
          visitorProfiles.set(sessionEmail, next);
          upsertVisitor(sessionEmail, next).catch((err) => {
            console.error('[Runtime] Failed to persist CNA notification payload:', err.message);
          });
        }
      }

      // Generate proposal in background — respond to client immediately
      sendJson(res, 200, { success: true });

      // Kick off enrichment + proposal generation
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
      if (!GOOGLE_API_KEY) {
        console.error('[Proposal] No GOOGLE_API_KEY — cannot generate proposal');
        return;
      }

      const proposalId = randomBytes(8).toString('hex');
      const conversationText = (history || []).map(m => `${m.role === 'user' ? 'CLIENT' : 'AI'}: ${m.content}`).join('\n\n');
      const assessmentText = Object.entries(assessment).map(([k, v]) => `${k}: ${v}`).join('\n');

      // Step 1: Enrich client info via Gemini
      console.log(`[Proposal ${proposalId}] Enriching client info…`);
      const emailDomain = clientEmail.includes('@') ? clientEmail.split('@')[1] : '';
      const enrichPrompt = `You are a business intelligence analyst. Research and analyze this prospect for a proposal.

Client email: ${clientEmail}
Email domain: ${emailDomain}
CNA Assessment:
${assessmentText}

Full conversation:
${conversationText}

Based on the email domain and all available context, provide a comprehensive client profile. Infer what you can about their business, industry, company size, and likely needs. If the domain suggests a specific company, describe what that company likely does.

OUTPUT: Return exactly one JSON object:
{
  "company_name": "Best guess at company name or 'Individual'",
  "industry": "Their likely industry",
  "company_description": "What this company/person likely does",
  "estimated_size": "Solo/Small/Medium/Enterprise",
  "likely_budget_tier": "Based on company size and project scope",
  "key_insights": "Anything notable that should inform the proposal",
  "recommended_approach": "How Greg should position this engagement"
}`;

      let enrichment = {};
      try {
        const enrichRaw = await geminiCall(GOOGLE_API_KEY, enrichPrompt);
        enrichment = JSON.parse(enrichRaw);
      } catch (/** @type {any} */ e) {
        console.warn(`[Proposal ${proposalId}] Enrichment failed: ${e.message}`);
        enrichment = { company_name: emailDomain || 'Unknown', industry: 'Unknown' };
      }

      // Step 2: Generate proposal draft
      console.log(`[Proposal ${proposalId}] Generating proposal draft…`);
      const proposalPrompt = `You are writing a professional project proposal on behalf of Greg Iteen, a software engineer and designer.

CLIENT PROFILE:
${JSON.stringify(enrichment, null, 2)}

CLIENT NEEDS ASSESSMENT:
${assessmentText}

CONVERSATION CONTEXT:
${conversationText}

Write a professional, compelling project proposal. Include:
1. Executive summary
2. Understanding of the client's needs (show you listened)
3. Proposed solution and approach
4. Scope of work (itemized deliverables)
5. Timeline with milestones
6. Investment (pricing — use ranges based on the budget tier and project complexity)
7. Why Greg is the right fit
8. Next steps

Keep it direct, confident, and professional. No fluff. This is from a technical expert, not a sales department.

OUTPUT: Return exactly one JSON object:
{
  "subject_line": "Proposal: [project type] for [company]",
  "proposal_text": "The full proposal in clean markdown format",
  "client_email_draft": "A brief, warm email to the client that would accompany the proposal"
}`;

      let proposalDraft = {};
      try {
        const proposalRaw = await geminiCall(GOOGLE_API_KEY, proposalPrompt);
        proposalDraft = JSON.parse(proposalRaw);
      } catch (/** @type {any} */ e) {
        console.warn(`[Proposal ${proposalId}] Draft generation failed: ${e.message}`);
        proposalDraft = {
          subject_line: `Proposal for ${enrichment.company_name || clientEmail}`,
          proposal_text: `[Draft generation failed — please write manually]\n\nClient: ${clientEmail}\nAssessment:\n${assessmentText}`,
          client_email_draft: '',
        };
      }

      // Store proposal for email thread
      const proposalThread = {
        clientEmail,
        assessment,
        enrichment,
        proposal: proposalDraft,
        history: conversationText,
        revisions: 0,
        createdAt: Date.now(),
        status: 'pending_approval',
      };
      proposalThreads.set(proposalId, proposalThread);
      await upsertProposal(proposalId, proposalThread);

      // Step 3: Email Greg with the full package
      console.log(`[Proposal ${proposalId}] Emailing to Greg…`);
      const enrichmentRows = Object.entries(enrichment)
        .map(([k, v]) => `**${k.replace(/_/g, ' ')}:** ${v}`)
        .join('\n');

      const emailToGreg = `PROPOSAL DRAFT — ${proposalId}
${'='.repeat(60)}

CLIENT: ${clientEmail}
COMPANY: ${enrichment.company_name || 'Unknown'}
INDUSTRY: ${enrichment.industry || 'Unknown'}

${'─'.repeat(60)}
CLIENT ENRICHMENT
${'─'.repeat(60)}
${enrichmentRows}

${'─'.repeat(60)}
CNA ASSESSMENT
${'─'.repeat(60)}
${assessmentText}

${'─'.repeat(60)}
PROPOSAL DRAFT
${'─'.repeat(60)}
${proposalDraft.proposal_text}

${'─'.repeat(60)}
DRAFT EMAIL TO CLIENT
${'─'.repeat(60)}
${proposalDraft.client_email_draft}

${'═'.repeat(60)}
INSTRUCTIONS:
• Reply to this email with edits/feedback — AI will revise the proposal.
• Reply "send it" to finalize and send to the client (${clientEmail}).
• The proposal will be attached to a formatted email and you'll be CC'd.
${'═'.repeat(60)}`;

      const replyTo = `proposal-${proposalId}@${process.env.MAIL_DOMAIN || 'gregiteen.xyz'}`;

      try {
        await smtpTransport.sendMail({
          from: mailFrom,
          to: mailOwner,
          replyTo,
          subject: `[PROPOSAL] ${proposalDraft.subject_line || 'New Proposal'} — Reply to edit`,
          text: emailToGreg,
          headers: { 'X-Proposal-ID': proposalId },
        });
        console.log(`[Proposal ${proposalId}] Email sent to Greg. Reply-To: ${replyTo}`);
      } catch (/** @type {any} */ emailErr) {
        console.error(`[Proposal ${proposalId}] Email failed:`, emailErr.message);
      }

    } catch (/** @type {any} */ err) {
      console.error('[Proposal] Error:', err.message);
      if (!res.writableEnded) sendJson(res, 500, { success: false, error: 'Failed to generate proposal.' });
    }
    return;
  }

  // ── API: Proposal Reply Webhook (inbound email from Greg) ──
  if (urlPath === '/api/proposal-reply' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      // SMTP2GO inbound webhook sends: from, to, subject, text, html
      const toAddr = body.to || body.envelope?.to?.[0] || '';
      const replyText = body.text || body.plain || body.body || '';
      const fromAddr = body.from || body.envelope?.from || '';

      // Extract proposal ID from the to address: proposal-<id>@domain
      const idMatch = toAddr.match(/proposal-([a-f0-9]+)@/);
      if (!idMatch) {
        console.warn('[Proposal Reply] No proposal ID found in:', toAddr);
        return sendJson(res, 400, { error: 'No proposal ID' });
      }

      const proposalId = idMatch[1];
      const thread = proposalThreads.get(proposalId);
      if (!thread) {
        console.warn(`[Proposal Reply] Unknown proposal ID: ${proposalId}`);
        return sendJson(res, 404, { error: 'Proposal not found' });
      }

      console.log(`[Proposal ${proposalId}] Reply from Greg: ${replyText.slice(0, 100)}…`);

      // Check for "send it" command
      const cleaned = replyText.replace(/^>.*$/gm, '').trim().toLowerCase();
      if (cleaned === 'send it' || cleaned === 'send it.' || cleaned.startsWith('send it')) {
        // FINALIZE: Send proposal to client
        console.log(`[Proposal ${proposalId}] SENDING to client: ${thread.clientEmail}`);

        const clientSubject = thread.proposal.subject_line || `Project Proposal from Greg Iteen`;

        try {
          await smtpTransport.sendMail({
            from: mailFrom,
            to: thread.clientEmail,
            cc: mailOwner,
            subject: clientSubject,
            text: `${thread.proposal.client_email_draft}\n\n${'─'.repeat(40)}\n\n${thread.proposal.proposal_text}\n\n— Greg Iteen\ngregiteen.xyz`,
          });

          // Notify Greg it was sent
          await smtpTransport.sendMail({
            from: mailFrom,
            to: mailOwner,
            subject: `✓ Proposal sent to ${thread.clientEmail}`,
            text: `Proposal ${proposalId} has been sent to ${thread.clientEmail}.\nYou were CC'd on the email.`,
          });

          thread.status = 'sent';
          thread.decidedAt = new Date().toISOString();
          proposalThreads.set(proposalId, thread);
          await upsertProposal(proposalId, thread);
          console.log(`[Proposal ${proposalId}] Sent and closed.`);
        } catch (/** @type {any} */ sendErr) {
          console.error(`[Proposal ${proposalId}] Send failed:`, sendErr.message);
          await smtpTransport.sendMail({
            from: mailFrom, to: mailOwner,
            subject: `✗ Failed to send proposal ${proposalId}`,
            text: `Error: ${sendErr.message}\n\nThe proposal was NOT sent. Try again or send manually.`,
          }).catch(() => {});
        }

        return sendJson(res, 200, { status: 'sent' });
      }

      // REVISION: Greg wants edits — send feedback to AI, generate revised proposal
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
      if (!GOOGLE_API_KEY) {
        return sendJson(res, 500, { error: 'No API key for revision' });
      }

      thread.revisions++;
      thread.status = 'revising';
      console.log(`[Proposal ${proposalId}] Revision #${thread.revisions}…`);

      const revisionPrompt = `You are revising a project proposal based on feedback from the author (Greg Iteen).

CURRENT PROPOSAL:
${thread.proposal.proposal_text}

CURRENT CLIENT EMAIL DRAFT:
${thread.proposal.client_email_draft}

GREG'S FEEDBACK:
${replyText}

Apply Greg's feedback precisely. Do not add anything he didn't ask for. Do not remove anything he didn't mention. If he gives specific wording, use it verbatim.

OUTPUT: Return exactly one JSON object:
{
  "subject_line": "Updated subject line if needed",
  "proposal_text": "The full revised proposal",
  "client_email_draft": "The revised email to accompany the proposal",
  "changes_made": "Brief summary of what changed"
}`;

      try {
        const revisionRaw = await geminiCall(GOOGLE_API_KEY, revisionPrompt);
        const revision = JSON.parse(revisionRaw);
        thread.revision_history = [
          ...(Array.isArray(thread.revision_history) ? thread.revision_history : []),
          { at: new Date().toISOString(), feedback: replyText, revision },
        ];
        thread.proposal = revision;
        thread.status = 'pending_approval';
        await upsertProposal(proposalId, thread);

        // Email revised version back to Greg
        const replyTo = `proposal-${proposalId}@${process.env.MAIL_DOMAIN || 'gregiteen.xyz'}`;
        await smtpTransport.sendMail({
          from: mailFrom,
          to: mailOwner,
          replyTo,
          subject: `Re: [PROPOSAL] ${revision.subject_line || 'Revised'} — Rev ${thread.revisions}`,
          text: `REVISION #${thread.revisions}
${'─'.repeat(60)}
CHANGES: ${revision.changes_made || 'Applied your feedback'}

${'─'.repeat(60)}
REVISED PROPOSAL
${'─'.repeat(60)}
${revision.proposal_text}

${'─'.repeat(60)}
REVISED CLIENT EMAIL
${'─'.repeat(60)}
${revision.client_email_draft}

${'═'.repeat(60)}
Reply with more edits, or reply "send it" to send to ${thread.clientEmail}.
${'═'.repeat(60)}`,
        });

        console.log(`[Proposal ${proposalId}] Revision ${thread.revisions} sent to Greg.`);
      } catch (/** @type {any} */ revErr) {
        console.error(`[Proposal ${proposalId}] Revision failed:`, revErr.message);
        await smtpTransport.sendMail({
          from: mailFrom, to: mailOwner,
          subject: `✗ Revision failed for proposal ${proposalId}`,
          text: `AI revision failed: ${revErr.message}\n\nYour feedback: ${replyText}\n\nReply again to retry.`,
        }).catch(() => {});
      }

      return sendJson(res, 200, { status: 'revised' });
    } catch (/** @type {any} */ err) {
      console.error('[Proposal Reply] Error:', err.message);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ── Admin: Protect admin page ──
  if (urlPath === '/admin.html' && !isAdmin(req)) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // ── Admin API ──
  if (urlPath.startsWith('/api/admin/')) {
    if (!isAdmin(req)) {
      return sendJson(res, 403, { error: 'Admin access required' });
    }

    const adminPath = urlPath.slice('/api/admin'.length);

    // GET /api/admin/stats
    if (adminPath === '/stats' && req.method === 'GET') {
      const uptimeMs = process.uptime() * 1000;
      const h = Math.floor(uptimeMs / 3600000);
      const m = Math.floor((uptimeMs % 3600000) / 60000);
      const recentVisitors = [...visitorProfiles.entries()]
        .map(([email, p]) => ({ email, ...p }))
        .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
        .slice(0, 10);

      // Count themes on disk
      let themeCount = 0;
      try {
        const { readdir } = await import('node:fs/promises');
        const entries = await readdir(join(__dirname, '..', 'designs'), { withFileTypes: true });
        themeCount = entries.filter(e => e.isDirectory()).length;
      } catch {}

      return sendJson(res, 200, {
        totalVisitors: visitorProfiles.size,
        totalSessions: authTokens.size,
        totalThemes: themeCount,
        activeProposals: proposalThreads.size,
        generatorStatus: genJob.status,
        uptime: `${h}h ${m}m`,
        genJob: { status: genJob.status, phase: genJob.phase, error: genJob.error, finishedAt: genJob.finishedAt },
        recentVisitors,
      });
    }

    // GET /api/admin/visitors
    if (adminPath === '/visitors' && req.method === 'GET') {
      const visitors = [...visitorProfiles.entries()]
        .map(([email, p]) => ({ email, ...p }))
        .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
      return sendJson(res, 200, visitors);
    }

    // GET /api/admin/themes
    if (adminPath === '/themes' && req.method === 'GET') {
      const themes = [];
      try {
        const { readdir, readFile: rf } = await import('node:fs/promises');
        const designsDir = join(__dirname, '..', 'designs');
        const entries = await readdir(designsDir, { withFileTypes: true });
        for (const e of entries) {
          if (!e.isDirectory()) continue;
          const slug = e.name;
          let meta = { slug, name: slug };
          try {
            const dm = await rf(join(designsDir, slug, 'DESIGN.md'), 'utf8');
            const nameMatch = dm.match(/^name:\s*"?([^"\n]+)"?/m);
            const accentMatch = dm.match(/^accent:\s*"?([^"\n]+)"?/m);
            const styleMatch = dm.match(/^style:\s*"?([^"\n]+)"?/m);
            const scoreMatch = dm.match(/^improvement_score:\s*"?([^"\n]+)"?/m);
            const improvedMatch = dm.match(/^last_improved:\s*"?([^"\n]+)"?/m);
            if (nameMatch) meta.name = nameMatch[1];
            if (accentMatch) meta.accent = accentMatch[1];
            if (styleMatch) meta.style = styleMatch[1];
            if (scoreMatch) meta.score = Number(scoreMatch[1]);
            if (improvedMatch) meta.lastImproved = improvedMatch[1];
          } catch {}
          themes.push(meta);
        }
      } catch {}
      return sendJson(res, 200, themes);
    }

    // POST /api/admin/themes/:slug/promote
    const promoteMatch = adminPath.match(/^\/themes\/([a-z0-9_-]+)\/promote$/);
    if (promoteMatch && req.method === 'POST') {
      const slug = promoteMatch[1];
      try {
        const { spawnSync } = await import('node:child_process');
        const result = spawnSync(process.execPath, [join(__dirname, 'promote-theme.mjs'), slug], { stdio: 'pipe' });
        return sendJson(res, 200, { success: result.status === 0, output: String(result.stdout) });
      } catch (/** @type {any} */ e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // DELETE /api/admin/themes/:slug
    const deleteThemeMatch = adminPath.match(/^\/themes\/([a-z0-9_-]+)$/);
    if (deleteThemeMatch && req.method === 'DELETE') {
      const slug = deleteThemeMatch[1];
      try {
        const { rm } = await import('node:fs/promises');
        await rm(join(__dirname, '..', 'designs', slug), { recursive: true, force: true });
        // Also remove vault skin if present
        await rm(join(__dirname, '..', 'vault', 'pages', 'skins', `${slug}.md`), { force: true }).catch(() => {});
        rebuild('admin: deleted theme');
        return sendJson(res, 200, { success: true });
      } catch (/** @type {any} */ e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // GET /api/admin/proposals
    if (adminPath === '/proposals' && req.method === 'GET') {
      const proposals = [...proposalThreads.entries()].map(([id, t]) => ({
        id,
        clientEmail: t.clientEmail,
        company: t.enrichment?.company_name || '',
        projectType: t.assessment?.project_type || '',
        status: t.status || 'pending_approval',
        revisions: t.revisions,
        createdAt: t.createdAt,
      }));
      return sendJson(res, 200, proposals);
    }

    // DELETE /api/admin/proposals/:id
    const deletePropMatch = adminPath.match(/^\/proposals\/([a-f0-9]+)$/);
    if (deletePropMatch && req.method === 'DELETE') {
      proposalThreads.delete(deletePropMatch[1]);
      await deleteProposal(deletePropMatch[1]);
      return sendJson(res, 200, { success: true });
    }

    // GET /api/admin/settings
    if (adminPath === '/settings' && req.method === 'GET') {
      return sendJson(res, 200, {
        apiKeySet: !!process.env.GOOGLE_API_KEY,
        defaultModel: process.env.DEFAULT_MODEL || 'gemini-3.5-flash',
        mailOwner: mailOwner,
        mailFrom: mailFrom,
        mailDomain: process.env.MAIL_DOMAIN || '',
        cronHour: 3,
      });
    }

    // POST /api/admin/settings
    if (adminPath === '/settings' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        if (body.apiKey) process.env.GOOGLE_API_KEY = body.apiKey;
        if (body.defaultModel) process.env.DEFAULT_MODEL = body.defaultModel;
        if (body.cronHour !== undefined) process.env.CRON_HOUR = String(body.cronHour);
        return sendJson(res, 200, { success: true });
      } catch (/** @type {any} */ e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    // POST /api/admin/improve — trigger improvement cycle manually
    if (adminPath === '/improve' && req.method === 'POST') {
      const child = spawn(process.execPath, [improveScript], { stdio: ['ignore', 'pipe', 'pipe'] });
      child.on('close', (code) => {
        console.log(`[Admin] Manual improvement run finished (exit ${code})`);
        if (code === 0) rebuild('admin: improvement run');
      });
      return sendJson(res, 202, { started: true });
    }

    // GET /api/admin/logs
    if (adminPath === '/logs' && req.method === 'GET') {
      return sendJson(res, 200, {
        logs: `Generator status: ${genJob.status}\nPhase: ${genJob.phase || '—'}\nPrompt: ${genJob.prompt || '—'}\nError: ${genJob.error || 'none'}\nStarted: ${genJob.startedAt ? new Date(genJob.startedAt).toISOString() : '—'}\nFinished: ${genJob.finishedAt ? new Date(genJob.finishedAt).toISOString() : '—'}\n\nActive sessions: ${authTokens.size}\nVisitor profiles: ${visitorProfiles.size}\nPending notifications: ${pendingVisitEmails.size}\nActive proposals: ${proposalThreads.size}\nGeneration queue: ${genQueue.length}`,
      });
    }

    return sendJson(res, 404, { error: 'Not found' });
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

// ─── Daily improvement cron ──────────────────────────────────────────────────
// Run improve-theme.mjs on ALL designs once per day at 3:00 AM local time.
let lastImproveDay = -1;

function checkImproveCron() {
  const now = new Date();
  const today = now.getDate();
  const hour = now.getHours();

  // Fire at 3 AM, once per day
  if (hour === 3 && today !== lastImproveDay) {
    lastImproveDay = today;
    console.log('[Cron] Starting daily theme improvement run…');
    const child = spawn(process.execPath, [improveScript], { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (chunk) => {
      for (const line of String(chunk).split('\n').filter(l => l.trim())) {
        console.log(`[Cron] ${line}`);
      }
    });
    child.stderr.on('data', (chunk) => {
      console.error(`[Cron] ${String(chunk).trim()}`);
    });
    child.on('close', (code) => {
      console.log(`[Cron] Improvement run finished (exit ${code})`);
      if (code === 0) rebuild('cron improvement');
    });
  }
}

// Check every 5 minutes
setInterval(checkImproveCron, 5 * 60 * 1000);
console.log('[Cron] Daily improvement cron scheduled (3:00 AM)');
