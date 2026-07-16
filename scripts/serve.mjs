#!/usr/bin/env node
// @ts-nocheck
// Tiny static server for dist/site with a recursive vault watcher, live-reload
// dev-status endpoint, an async theme-generation job endpoint, and 2FA auth.
import { createServer } from 'node:http';
import { readFile, appendFile } from 'node:fs/promises';
import { watch, readdirSync, statSync } from 'node:fs';
import { execFile, spawn } from 'node:child_process';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { createTransport } from 'nodemailer';
import https from 'node:https';
import Stripe from 'stripe';
// Robust model-output JSON parser: strips ```json fences + repairs trailing
// commas, then throws on total failure (callers wrap in try/catch → fallback).
// Bare JSON.parse fails on fenced output, which the models emit constantly.
import { extractJson } from './lib/theme.mjs';
import { buildLetterheadPdf, SIGNATURE_FIELD } from './lib/letterhead.mjs';
import { createSigningRequest, signingStatusForEvent, verifyWebhookSecret, startDocumensoPoller } from './lib/documenso.mjs';
import { advanceDripState, createUnsubscribeToken, enrollInCampaign, renderDripTemplate, verifyUnsubscribeToken } from './lib/drip.mjs';

function emailTextToHtml(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#{1,3}\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[-*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g, '<ul>$1</ul>')
    .replace(/^[─═]{10,}$/gm, '<hr style="border:0; border-top:1px solid #ccc; margin: 16px 0;">');
  
  html = html.split('\n').map(line => {
    if (line.match(/^(<h|<ul|<li|<hr|<\/ul)/)) return line;
    return line + '<br>';
  }).join('\n');

  // Letterhead-style wrapper so every outbound email carries the brand —
  // absolute image URLs because email clients have no origin to resolve
  // against. Table layout for broad email-client compatibility.
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f3;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e5e2;">
<tr><td style="padding:24px 32px 16px;border-bottom:1px solid #eeeeee;">
  <img src="https://gregiteen.xyz/gi-logo-transparent.png" alt="greg.iteen" height="24" style="height:24px;width:auto;display:block;">
</td></tr>
<tr><td style="padding:24px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222222;">${html}</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #eeeeee;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#999999;">
  <a href="https://gregiteen.xyz" style="color:#999999;text-decoration:none;">gregiteen.xyz</a> &nbsp;·&nbsp; sales@gregiteen.xyz &nbsp;·&nbsp; e-signatures by <img src="https://gregiteen.xyz/signedgi-logo.png" alt="SignedGI" height="14" style="height:14px;width:auto;vertical-align:-3px;">
</td></tr>
</table>
</td></tr></table>`;
}

import { parseProposalOutput } from './lib/proposal-output.mjs';
import { handleWebmail, webmailSessions } from './lib/webmail-ui.mjs';
import {
  initRuntimeStore,
  listVisitors,
  listProposals,
  upsertVisitor,
  upsertProposal,
  deleteProposal,
  appendRun,
  pendingNotifications,
  getRateCard,
  ensureRateCardSeeded,
  getBannerOffers,
  ensureBannerOffersSeeded,
  appendBannerEvent,
  getDripCampaign,
  getAllDripCampaigns,
  pendingDripVisitors,
  getWebmailSettings,
  updateWebmailSettings,
  dirs,
} from './runtime-store.mjs';

import {
  fetchInbox,
  startImapPoller,
} from './lib/imap.mjs';

import { startCalendarPoller } from './lib/calendar.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

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
// Theme children write source only. This server is the single owner of static
// builds so vault watcher events cannot race generator/improver rm() calls.
const serializedThemeEnv = { ...process.env, THEME_DEFER_BUILD: '1' };
const port = Number(process.env.PORT ?? 4173);

// Rate card + banner offers live in runtime-store.mjs (vault/runtime/config/),
// written through the Operation Contract. readRateCard() re-reads per proposal
// (not cached) so edits to the vault doc take effect without a redeploy.
async function readRateCard() {
  return getRateCard();
}

const DEFAULT_RATE_CARD_BODY = `This is the ONLY source of pricing for automated proposals. The CNA proposal
generator (\`scripts/serve.mjs\`, \`/api/cna-proposal\`) reads this file and MUST
quote within these bands — it never invents numbers. Edit the figures below
any time; changes take effect on the next proposal generated, no redeploy
needed.

Positioning: aggressive, not cheap. These rates should read as a specialist,
not a commodity freelancer — priced to filter for serious engagements while
still winning good-fit smaller work.

Tagline: Independent full-stack & AI engineering. Transparent price bands by
service category — every engagement gets a detailed, fixed-scope proposal.

## Baseline

- **Hourly rate:** $150/hr (ad-hoc, scoping, small revisions)
- **Retainer:** $6,000–$10,000/mo (ongoing maintenance + feature work, priority response)

## Price bands by service category

| Category | Range | Notes |
|---|---|---|
| Marketing / brochure site | $2,500 – $6,000 | Portfolio-style site, templated AI-generated design, few pages |
| Multi-page site / web app | $6,000 – $18,000 | CMS-backed, custom interactivity, more than ~6 pages |
| E-commerce | $10,000 – $30,000 | Storefront, payments, inventory, order management |
| Automation / integration tooling | $6,000 – $15,000 | Scheduling, browser automation, deploy tooling, API glue |
| AI integration | $12,000 – $40,000 | LLM features added to an existing product — chat, RAG, agents |
| AI calling & SMS | $15,000 – $45,000 | Voice/SMS AI agents, telephony integration, compliance, latency-sensitive |
| Authentication | $5,000 – $15,000 | SSO/OAuth, MFA, session infrastructure, standalone hardening |
| AI model hosting & fine-tuning | $20,000 – $60,000 | Custom model deployment, fine-tuning pipelines, inference infra |
| Mobile apps | $20,000 – $60,000 | Native or cross-platform |
| Cloud platform / infra build | $15,000 – $50,000 | Multi-service architecture, IaC, scaling |
| Full product build | $40,000 – $120,000+ | Multi-month, full-stack + AI + infra (UltraChat-scale) |

## Product setups (Greg's own platforms, deployed for your business)

| Package | Range | Notes |
|---|---|---|
| UltraChat workspace setup | $8,000 – $25,000 | A private AI workspace on UltraChat: assistants, workflows, telephony/email channels, and a skill marketplace configured to the client's business. Tenant data stays portable (.ucw export). Low end = standard workspace + branding; high end = custom skills, integrations, and multi-team rollout. |
| festech.live event platform setup | $10,000 – $35,000 | The full event-operations platform stood up for a festival or event brand: web + mobile + communications apps, artist logistics, mapping, and AI-assisted comms. Low end = single event; high end = season-long multi-event operation with custom integrations. |

Product setups include deployment, configuration, and a training handoff.
Ongoing operation falls under the retainer.

## Rules for the proposal generator

1. Match the CNA assessment's \`project_type\` (and conversation context) to the
   closest category above. If a project spans multiple categories, sum the
   relevant bands and note the composite in the proposal.
2. Position within the band using \`complexity\` from the assessment: Low → low
   end, Medium → middle, High → high end (or above, called out explicitly, if
   scope clearly exceeds the band).
3. Never quote below the low end of the matched band. Never quote a bare
   number — always a range, with the rationale for where in the range it
   lands.
4. If nothing matches well, fall back to the hourly rate and estimate hours,
   rather than fabricating a project-type band.`;

// Every variant is a real OFFER — a concrete incentive with value (discount,
// freebie, or guarantee), routed to the automated proposal system. Never a
// call: a call only happens if the client asks for one AFTER reviewing their
// proposal. The proposal generator receives the variant the visitor saw and
// must honor it as explicit terms.
const DEFAULT_BANNER_OFFERS = [
  { id: 'sign7-discount', text: '10% off your first project — locked in when you sign within 7 days of your proposal.', cta: 'Claim your proposal →' },
  { id: 'free-support-30', text: '30 days of post-launch support and fixes included free with every project.', cta: 'Get your proposal →' },
  { id: 'price-lock', text: 'The price on your proposal is the price you pay — fixed, guaranteed, no overruns.', cta: 'Request your proposal →' },
];
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf' };

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
      console.error(`[Watcher] Build failed:`, (stderr || (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err))).trim());
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
const genJob = { status: 'idle', phase: '', prompt: '', email: null, error: null, startedAt: null, finishedAt: null, runId: null, slug: null };

// Mirror of compile-theme.mjs's styleName derivation — lets the waiting page
// peek at the in-progress design's generated assets as they are written.
function slugForPrompt(prompt) {
  return prompt.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 40).toLowerCase() || 'custom';
}
const genQueue = [];

/** Start now if idle, otherwise queue — nothing gets silently dropped. */
function requestGeneration(prompt, email = null) {
  if (genJob.status === 'running') {
    genQueue.push({ prompt, email });
    console.log(`[Generator] Queued "${prompt}" for ${email} (${genQueue.length} waiting)`);
    return;
  }
  startGeneration(prompt, email);
}

function drainQueue() {
  const next = genQueue.shift();
  if (next) startGeneration(next.prompt, next.email);
}

function startGeneration(prompt, email = null) {
  const runId = randomBytes(8).toString('hex');
  genJob.status = 'running';
  genJob.phase = 'Starting generator…';
  genJob.prompt = prompt;
  genJob.email = email;
  genJob.error = null;
  genJob.startedAt = Date.now();
  genJob.finishedAt = null;
  genJob.runId = runId;
  genJob.slug = slugForPrompt(prompt);
  appendRun({ run_id: runId, prompt, status: 'running', startedAt: genJob.startedAt }).catch((err) => {
    console.error('[Runtime] Failed to persist generation start:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
  });

  // Argument array — the prompt never touches a shell.
  const child = spawn(process.execPath, [compileScript, prompt], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: serializedThemeEnv,
  });
  let stderrTail = '';
  let genSlug = null; // captured from compile-theme's "→ designs/<slug>" line

  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split('\n')) {
      const l = line.trim();
      if (!l) continue;
      console.log(`[Generator] ${l}`);
      if (l.startsWith('[')) genJob.phase = l;
      const m = l.match(/→\s+designs\/(\S+)/);
      if (m) genSlug = m[1];
    }
  });
  child.stderr.on('data', (chunk) => {
    stderrTail = (stderrTail + String(chunk)).slice(-2000);
    const detail = String(chunk).trim();
    if (detail) console.error(`[Generator] ${detail}`);
  });
  child.on('error', (err) => {
    genJob.status = 'error';
    genJob.error = (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err));
    genJob.finishedAt = Date.now();
    appendRun({ run_id: runId, prompt, status: 'failed', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt, error: (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) }).catch((e) => {
      console.error('[Runtime] Failed to persist generation failure:', e.message);
    });
    drainQueue();
  });
  child.on('close', (code) => {
    if (code === 0) {
      // compile-theme owns planning, screenshot review, bounded repair, and
      // atomic publication. Never mutate an approved design with the legacy
      // source-only improver after that release decision.
      genJob.status = 'done';
      genJob.phase = 'Theme reviewed and published';
      genJob.finishedAt = Date.now();
      if (genSlug) console.log(`[Generator] Approved design: ${genSlug}`);
      console.log(`[Generator] Done in ${Math.round((genJob.finishedAt - genJob.startedAt) / 1000)}s.`);
      if (genJob.email) {
        sendGenerationCompleteEmail(genJob.email, genSlug || genJob.slug, genJob.prompt).catch(err => {
          console.error('[Mail] Failed to send completion email:', err.message);
        });
      }
      appendRun({ run_id: runId, prompt, status: 'done', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt }).catch((e) => {
        console.error('[Runtime] Failed to persist generation completion:', e.message);
      });
      rebuild('generated theme');
      drainQueue();
    } else {
      genJob.status = 'error';
      genJob.finishedAt = Date.now();
      genJob.error = (stderrTail.trim().split('\n').pop() || `generator exited with code ${code}`).slice(0, 300);
      console.error(`[Generator] Failed:`, genJob.error);
      appendRun({ run_id: runId, prompt, status: 'failed', startedAt: genJob.startedAt, finishedAt: genJob.finishedAt, error: genJob.error }).catch((e) => {
        console.error('[Runtime] Failed to persist generation failure:', e.message);
      });
      drainQueue();
    }
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
const passwordResets = new Map(); // token -> { email, expires }

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
if (await ensureRateCardSeeded(DEFAULT_RATE_CARD_BODY)) console.log('[Runtime] Seeded default rate card at vault/runtime/config/rate-card.md — edit real figures there.');
if (await ensureBannerOffersSeeded(DEFAULT_BANNER_OFFERS)) console.log('[Runtime] Seeded default banner offers at vault/runtime/config/banner-offers.md');
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

// Trigger startup sync
startImapPoller(smtpTransport).catch(e => console.error('[IMAP] Poller failed to start:', e.message));
startCalendarPoller(dirs.calendar);
startDocumensoPoller(proposalThreads, upsertProposal, async (proposalId, label) => {
  await smtpTransport.sendMail({
    from: mailFrom,
    to: mailOwner,
    subject: `Proposal ${label}: ${proposalId}`,
    text: `SignedGI reported that proposal ${proposalId} was ${label}.`,
  });
});

const mailFrom = process.env.MAIL_FROM;   // e.g. "Greg Iteen" <sales@gregiteen.xyz>
const mailOwner = process.env.MAIL_OWNER; // where visitor notifications go

const originalSendMail = smtpTransport.sendMail.bind(smtpTransport);
smtpTransport.sendMail = async function(options) {
  if (options.html && typeof options.to === 'string' && options.to !== mailOwner) {
    const trackingUrl = process.env.BASE_URL || 'https://gregiteen.xyz';
    const emailParam = encodeURIComponent(options.to);
    
    options.html = options.html.replace(/href="([^"]+)"/g, (match, url) => {
      if (url.startsWith('mailto:') || url.startsWith('tel:') || url.includes('/api/track/')) return match;
      const targetParam = encodeURIComponent(url);
      return `href="${trackingUrl}/api/track/link?e=${emailParam}&url=${targetParam}"`;
    });
    
    const pixelHtml = `<img src="${trackingUrl}/api/track/pixel?e=${emailParam}" width="1" height="1" alt="" style="display:none;" />`;
    if (options.html.includes('</body>')) {
      options.html = options.html.replace('</body>', pixelHtml + '</body>');
    } else {
      options.html += pixelHtml;
    }
  }
  return originalSendMail(options);
};

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

async function sendGenerationCompleteEmail(email, slug, style) {
  if (!email) return;
  const mailFrom = process.env.MAIL_FROM || 'admin@gregiteen.xyz';
  const url = `${SITE_URL}/designs/${slug}/index.html`;
  
  const html = emailShell({
    eyebrow: 'Greg Iteen — Portfolio · Generated',
    headline: "It's done.",
    bodyHtml: `
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0 0 16px;">The generator just finished building your custom <em>${style}</em> edition.</p>
      <a href="${url}" style="display:block;background:#f5f5f3;color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;text-align:center;padding:18px;margin:28px 0 0;">View it live →</a>
    `,
  });

  await smtpTransport.sendMail({
    from: mailFrom,
    to: email,
    subject: `Your ${style} edition is complete`,
    html,
    text: `Your custom "${style}" design has finished generating.\n\nView it live here: ${url}\n\n— Greg`,
  });
}

// ─── Visitor Logging & Notification ──────────────────────────────────────────

async function logVisitor(info) {
  const ts = new Date().toISOString();
  const line = `| ${ts} | ${info.email} | ${info.style} | ${info.ip} | ${info.userAgent.slice(0, 60)} |\n`;
  try {
    await readFile(visitorsLog, 'utf8');
  } catch {
    await appendFile(visitorsLog, `---\ntype: run\ntitle: Portfolio Visitors\ndescription: Append-only log of verified portfolio visitors (tenant_private, excluded from sale/template exports).\ntimestamp: ${ts}\nrun_id: portfolio-visitors\nworkflow_id: visitor-logging\n---\n\n# Portfolio Visitors\n\n| Timestamp | Email | Style | IP | User Agent |\n|-----------|-------|-------|----|-----------|\n`, 'utf8');
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
      console.error('[Runtime] Failed to clear pending notification:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
    });
  }

  notifyOwner(info).catch(err => console.error('[Visitors] Notify error:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err))));
}

// ─── Drip campaigns ─────────────────────────────────────────────────────────

const DRIP_UNSUBSCRIBE_SECRET = process.env.DRIP_UNSUBSCRIBE_SECRET || process.env.ADMIN_API_TOKEN || '';
const DRIP_TICK_MS = Math.max(5_000, Number(process.env.DRIP_TICK_MS || 60_000));
let dripTickInFlight = false;

async function updateVisitorDrip(email, drip) {
  const existing = visitorProfiles.get(email);
  if (!existing) return null;
  const next = { ...existing, drip };
  visitorProfiles.set(email, next);
  return upsertVisitor(email, next);
}

async function updateVisitorEnrichment(email, enrichment) {
  const existing = visitorProfiles.get(email);
  if (!existing) return null;
  const timeline = existing.timeline || [];
  timeline.push(`Enrichment data updated at ${new Date().toISOString()}`);
  const next = { ...existing, enrichment, timeline };
  visitorProfiles.set(email, next);
  return upsertVisitor(email, next);
}

async function enrollVisitorInCampaign(email, campaignSlug) {
  const visitor = visitorProfiles.get(email);
  if (!visitor?.optIn) return null;
  const campaign = await getDripCampaign(campaignSlug);
  if (!campaign) throw new Error(`Drip campaign "${campaignSlug}" is unavailable`);
  return updateVisitorDrip(email, enrollInCampaign(campaign));
}

async function pauseVisitorDripForProposal(email) {
  const visitor = visitorProfiles.get(email);
  if (!visitor?.drip || visitor.drip.status !== 'active') return null;
  return updateVisitorDrip(email, { ...visitor.drip, status: 'paused', pause_reason: 'proposal_active' });
}

async function sendDueDripEmails() {
  if (dripTickInFlight) return;
  dripTickInFlight = true;
  try {
    if (!DRIP_UNSUBSCRIBE_SECRET) {
      console.error('[Drip] DRIP_UNSUBSCRIBE_SECRET or ADMIN_API_TOKEN is required; scheduler is paused.');
      return;
    }
    for (const visitor of pendingDripVisitors()) {
      const drip = visitor.drip;
      const campaign = await getDripCampaign(drip.campaign);
      const step = campaign?.steps?.[drip.step];
      if (!campaign || !step) {
        await updateVisitorDrip(visitor.email, { ...drip, status: 'paused', pause_reason: 'campaign_or_step_missing' });
        console.error(`[Drip] Paused ${visitor.email}: campaign or step is missing.`);
        continue;
      }

      const unsubscribeToken = createUnsubscribeToken(visitor.email, DRIP_UNSUBSCRIBE_SECRET);
      const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
      const firstName = visitor.enrichment?.first_name || visitor.enrichment?.name || visitor.email.split('@')[0];
      const variables = {
        FIRST_NAME: firstName,
        EMAIL: visitor.email,
        SITE_URL,
        UNSUBSCRIBE_URL: unsubscribeUrl,
      };
      const subject = renderDripTemplate(step.subject, variables);
      const text = renderDripTemplate(step.body_template, variables);
      const html = emailShell({
        eyebrow: 'Greg Iteen — Portfolio',
        headline: escapeHtml(subject),
        bodyHtml: `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.8;color:#c9c9c7;margin:0;white-space:normal;">${escapeHtml(text).replace(/\n/g, '<br>')}</p>
        <div style="margin-top:32px;text-align:center;border-top:1px solid rgba(245,245,243,0.1);padding-top:16px;">
          <a href="${unsubscribeUrl}" style="font-size:11px;color:#888;text-decoration:underline;">Unsubscribe</a>
        </div>`,
      });

      // The state advances only after SMTP accepts the message. A failure keeps
      // the due timestamp intact, so the next tick retries without losing mail.
      await smtpTransport.sendMail({ from: mailFrom, to: visitor.email, subject, text, html });
      await updateVisitorDrip(visitor.email, advanceDripState(campaign, drip));
      console.log(`[Drip] Sent ${campaign.slug} step ${drip.step + 1} to ${visitor.email}`);
    }
  } catch (err) {
    console.error('[Drip] Scheduler tick failed:', err instanceof Error ? err.message : String(err));
  } finally {
    dripTickInFlight = false;
  }
}

// ─── Gemini API Helper ───────────────────────────────────────────────────────

function geminiCall(apiKey, prompt, { json = true, tools = [] } = {}) {
  return new Promise((resolve, reject) => {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: json ? { responseMimeType: 'application/json' } : {},
    };
    if (tools && tools.length > 0) payload.tools = tools;
    const body = JSON.stringify(payload);
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

async function generateDelimitedProposal(apiKey, prompt, { requireChanges = false } = {}) {
  const first = await geminiCall(apiKey, prompt, { json: false });
  try {
    return parseProposalOutput(first, { requireChanges });
  } catch {
    const repaired = await geminiCall(apiKey, `Reformat the following proposal response without changing its meaning. Output only this exact delimiter contract, with plain text outside JSON:\n\nSUBJECT: one-line subject\n---PROPOSAL---\n<div class="proposal-html">\nfull HTML proposal\n</div>\n---CLIENT_EMAIL---\nclient email\n---PRICE_CENTS---\ninteger price in USD cents${requireChanges ? '\n---CHANGES---\nbrief change summary' : ''}\n---END---\n\nSOURCE:\n${first}`, { json: false });
    return parseProposalOutput(repaired, { requireChanges });
  }
}


function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// gregiteen.xyz-branded handoff page in front of the Documenso signing link.
// Documenso's self-hosted CSP sends `frame-ancestors 'self'` (verified via
// curl), which blocks true iframe embedding — so this is a branded landing
// page with a top-level-navigation CTA into the actual sign.gregiteen.xyz
// flow, not an embed. The Documenso side is itself already branded (logo,
// colors, site link) via its own branding settings.
function renderSignPage({ found, clientName, subject, signingUrl }) {
  const heading = found ? 'Your proposal is ready to sign' : 'Signing link not found';
  const body = found
    ? `<p>${clientName ? escapeHtml(clientName) + ',' : 'Hi,'} your proposal${subject ? ` — <em>${escapeHtml(subject)}</em>` : ''} — is ready for review and signature.</p>
       <a class="cta" href="${signingUrl}" target="_top" rel="noopener">Review &amp; Sign Document →</a>
       <a class="cta secondary" href="/book-meeting.html" target="_top" rel="noopener">Request Meeting 🗓️</a>
       <p class="fine">You'll be taken to a secure SignedGI signing page. No account required.</p>`
    : `<p>This signing link has expired or is no longer valid.</p>
       <p class="fine">If you're expecting a proposal, reply to the original email from Greg and a fresh link will be sent.</p>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${found ? 'Sign your proposal' : 'Link not found'} — Greg Iteen</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--black:#0a0a0a;--white:#f5f5f3;--gray:rgba(245,245,243,.55);--line:rgba(245,245,243,.28);--accent:#ff6a00}
html,body{min-height:100%}
body{font-family:'Archivo',sans-serif;background:var(--black);color:var(--white);display:flex;flex-direction:column;min-height:100dvh;padding:clamp(20px,4vw,56px)}
.top{font-family:'IBM Plex Mono',monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gray);margin-bottom:clamp(32px,6vw,72px)}
main{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:640px}
img.logo{height:32px;width:auto;align-self:flex-start;margin-bottom:clamp(24px,5vw,48px)}
h1{font-family:'Archivo Black',sans-serif;font-size:clamp(1.6rem,4vw,2.6rem);line-height:1.15;margin-bottom:24px}
main p{color:var(--gray);font-size:1rem;line-height:1.6;margin-bottom:20px}
main p em{color:var(--white);font-style:normal}
.cta{display:inline-block;background:var(--accent);color:var(--white);font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:.85rem;letter-spacing:.05em;text-decoration:none;padding:16px 28px;margin:8px 8px 20px 0;transition:opacity .2s}
.cta.secondary{background:var(--white);color:var(--black)}
.cta:hover{opacity:.85}
.fine{font-size:.8rem;color:var(--gray)}
footer{font-family:'IBM Plex Mono',monospace;font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gray);border-top:1px solid var(--line);padding-top:20px;margin-top:clamp(32px,6vw,72px);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer a{color:var(--gray);text-decoration:none}
footer a:hover{color:var(--white)}
.powered{display:flex;align-items:center;gap:10px}
.powered img{height:22px;width:auto;opacity:.9}
</style>
</head>
<body>
<div class="top">Greg Iteen — Proposal</div>
<main>
<img class="logo" src="/gi-logo-transparent-dark.png" alt="Greg Iteen">
<h1>${heading}</h1>
${body}
</main>
<footer><a href="https://gregiteen.xyz">gregiteen.xyz</a><span class="powered">Powered by <img src="/signedgi-logo-dark.png" alt="SignedGI"></span></footer>
</body>
</html>`;
}

async function sendProposalToClient(proposalId, thread) {
  if (thread.status === 'sent') return { noop: true };
  const clientSubject = thread.proposal.subject_line || `Project Proposal from Greg Iteen`;

  // Render the FINAL (possibly revised) proposal as a letterhead PDF, then
  // hand it to Documenso for e-signature. Documenso is optional (gated on env
  // vars) — if it's not configured, the client still gets the branded PDF,
  // just without a signing link.
  const pdfBuffer = await buildLetterheadPdf({
    subject: clientSubject,
    bodyText: thread.proposal.proposal_text,
    clientName: thread.enrichment?.company_name,
    clientEmail: thread.clientEmail,
    proposalId,
  });
  let signingUrl = null;
  let signingDocumentId = null;
  try {
    const signing = await createSigningRequest({
      pdfBuffer,
      filename: `proposal-${proposalId}.pdf`,
      clientEmail: thread.clientEmail,
      clientName: thread.enrichment?.company_name,
      subject: clientSubject,
      proposalId,
      field: SIGNATURE_FIELD,
    });
    signingUrl = signing?.signingUrl || null;
    signingDocumentId = signing?.submissionId ? String(signing.submissionId) : null;
  } catch (/** @type {any} */ e) {
    console.error(`[Proposal ${proposalId}] Documenso submission failed, sending PDF without a signing link:`, e.message);
  }

  const wrapperSigningUrl = signingUrl ? `${SITE_URL}/sign/${proposalId}` : null;
  const signingBlock = wrapperSigningUrl
    ? `\n\nReview & sign securely with SignedGI (no account required): ${wrapperSigningUrl}\n`
    : `\n\n(A signable copy will follow separately — for now, please review the attached PDF.)\n`;

  const webUrl = `${SITE_URL}/proposal/${proposalId}`;
  const clientEmailText = `${thread.proposal.client_email_draft}\n\nView your interactive proposal here: ${webUrl}${signingBlock}\n\n— Greg Iteen\ngregiteen.xyz`;
  await smtpTransport.sendMail({
    from: mailFrom,
    to: thread.clientEmail,
    cc: mailOwner,
    subject: clientSubject,
    text: clientEmailText,
    html: emailTextToHtml(clientEmailText),
    attachments: [{ filename: `proposal-${proposalId}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
  });
  await smtpTransport.sendMail({
    from: mailFrom,
    to: mailOwner,
    subject: `✓ Proposal sent to ${thread.clientEmail}`,
    text: `Proposal ${proposalId} has been sent to ${thread.clientEmail}.\nYou were CC'd on the email.\n${signingUrl ? `SignedGI signing link: ${signingUrl}` : 'SignedGI e-sign not configured (DOCUMENSO_BASE_URL/DOCUMENSO_API_KEY unset) — sent as a plain PDF, no signature link.'}`,
  });
  thread.status = 'sent';
  thread.decidedAt = new Date().toISOString();
  thread.signingUrl = signingUrl;
  thread.signingDocumentId = signingDocumentId;
  thread.signingStatus = signingDocumentId ? 'pending_signature' : null;
  thread.signingUpdatedAt = signingDocumentId ? new Date().toISOString() : null;
  proposalThreads.set(proposalId, thread);
  await upsertProposal(proposalId, thread);
  // Once the proposal is delivered, opted-in prospects move out of the
  // paused general-nurture state and into the slower proposal follow-up.
  try {
    await enrollVisitorInCampaign(thread.clientEmail, 'post-proposal-nurture');
  } catch (err) {
    console.error(`[Drip] Could not enroll ${thread.clientEmail} in post-proposal follow-up:`, err instanceof Error ? err.message : String(err));
  }
  return { status: 'sent', signingUrl };
}

async function reviseProposal(proposalId, thread, replyText) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
  if (!GOOGLE_API_KEY) throw new Error('No API key for revision');
  thread.revisions++;
  thread.status = 'revising';
  const revisionPrompt = `You are revising a project proposal based on feedback from the author (Greg Iteen).\n\nCURRENT PROPOSAL:\n${thread.proposal.proposal_text}\n\nCURRENT CLIENT EMAIL DRAFT:\n${thread.proposal.client_email_draft}\n\nGREG'S FEEDBACK:\n${replyText}\n\nApply Greg's feedback precisely. Do not add anything he didn't ask for. Do not remove anything he didn't mention. If he gives specific wording, use it verbatim.\n\nReturn plain text using exactly this delimiter contract. Do NOT return JSON and do not wrap the response in a code fence:\nSUBJECT: updated one-line subject\n---PROPOSAL---\n<div class="proposal-html">\nfull revised HTML proposal\n</div>\n---CLIENT_EMAIL---\nrevised client email\n---PRICE_CENTS---\ninteger price in USD cents\n---CHANGES---\nbrief factual summary of changes\n---END---`;
  const revision = await generateDelimitedProposal(GOOGLE_API_KEY, revisionPrompt, { requireChanges: true });
  thread.revision_history = [
    ...(Array.isArray(thread.revision_history) ? thread.revision_history : []),
    { at: new Date().toISOString(), feedback: replyText, revision },
  ];
  thread.proposal = revision;
  thread.status = 'pending_approval';
  await upsertProposal(proposalId, thread);
  const replyTo = `proposal-${proposalId}@${process.env.MAIL_DOMAIN || 'gregiteen.xyz'}`;
  const revisionEmailText = `REVISION #${thread.revisions}\n${'─'.repeat(60)}\nCHANGES: ${revision.changes_made || 'Applied your feedback'}\n\n${'─'.repeat(60)}\nREVISED PROPOSAL\n${'─'.repeat(60)}\n${revision.proposal_text}\n\n${'─'.repeat(60)}\nREVISED CLIENT EMAIL\n${'─'.repeat(60)}\n${revision.client_email_draft}\n\n${'═'.repeat(60)}\nReply with more edits, or reply "send it" to send to ${thread.clientEmail}.\n${'═'.repeat(60)}`;
  await smtpTransport.sendMail({
    from: mailFrom,
    to: mailOwner,
    replyTo,
    subject: `Re: [PROPOSAL] ${revision.subject_line || 'Revised'} — Rev ${thread.revisions}`,
    text: revisionEmailText,
    html: emailTextToHtml(revisionEmailText),
  });
  return { status: 'revised' };
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
  if (urlPath === '/splash.html' || urlPath === '/verify.html' || urlPath === '/consult.html' || urlPath === '/forgot.html' || urlPath === '/reset.html') return true;
  if (urlPath.startsWith('/api/')) return true;
  if (urlPath.startsWith('/assets/')) return true;
  if (urlPath.startsWith('/gi-logo')) return true; // brand marks — used on pre-auth pages
  if (urlPath.startsWith('/signedgi-')) return true; // SignedGI e-sign brand marks
  // Browsers, bookmarks, and search crawlers request /favicon.ico directly;
  // redirecting it to the splash page made the site appear to have no favicon.
  if (urlPath === '/favicon.ico') return true;
  // Public marketing collateral — linked from proposals and outbound email.
  if (urlPath === '/rate-card.pdf') return true;
  if (urlPath.startsWith('/sign/')) return true;
  // Clients reach their proposal via the emailed link — it must not bounce
  // to the splash/login wall. Same unguessable-id access model as /sign/.
  if (urlPath.startsWith('/proposal/')) return true;
  if (urlPath.startsWith('/designs/')) return true;
  // Dev/generation endpoints are API-like; asset previews feed the waiting
  // page, which is also shown mid-verification.
  if (urlPath === '/dev-status' || urlPath === '/generate-status' || urlPath === '/generate-theme') return true;
  if (urlPath.startsWith('/generating-asset/')) return true;
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
  if (token) {
    const session = authTokens.get(token);
    if (session && (session.email === mailOwner || session.email === process.env.ADMIN_EMAIL)) {
      return true;
    }
  }
  
  const webToken = cookies.gi_webmail;
  if (webToken) {
    const session = webmailSessions.get(webToken);
    if (session && (session.email === mailOwner || session.email === process.env.ADMIN_EMAIL || session.email === 'sales@gregiteen.xyz')) {
      return true;
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const provided = authHeader.slice(7).trim();
    const expected = process.env.ADMIN_API_TOKEN;
    if (expected && provided.length === expected.length) {
      if (timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
        return true;
      }
    }
  }

  return false;
}

// ── Resolve latest generated skin ──
function getLatestSkinBase() {
  try {
    const skinsDir = join(__dirname, '..', 'vault', 'pages', 'skins');
    const files = readdirSync(skinsDir).filter(f => f.endsWith('.md'));
    if (files.length === 0) return null;
    files.sort((a, b) => statSync(join(skinsDir, b)).mtimeMs - statSync(join(skinsDir, a)).mtimeMs);
    return `/designs/${files[0].replace('.md', '')}`;
  } catch { return null; }
}

// ─── Server ──────────────────────────────────────────────────────────────────

createServer(async (req, res) => {
  const urlObj = new URL(req.url, 'http://x');
  const urlPath = decodeURIComponent(urlObj.pathname);

  // ── Standalone webmail app (mail.gregiteen.xyz) — own auth, own router.
  // Kept separate from Mailcow's own UI, which is hard-wired to a single
  // hostname for CORS/session purposes and can't be aliased. ──
  if ((req.headers.host || '').split(':')[0] === 'mail.gregiteen.xyz' && !urlPath.startsWith('/api/')) {
    return handleWebmail(req, res, urlPath);
  }

  // ── Auth check for protected routes ──
  if (!isPublicPath(urlPath) && !isAuthenticated(req)) {
    res.writeHead(302, { 'Location': '/splash.html' });
    res.end();
    return;
  }

  // ── Returning user: splash → latest skin, or the generate flow. The
  // default-theme site is NEVER a visitor destination: no design yet means
  // you make one, not that you get the fallback look. ──
  if (urlPath === '/splash.html' && isAuthenticated(req)) {
    const skinBase = getLatestSkinBase();
    res.writeHead(302, { 'Location': skinBase ? skinBase + '/index.html' : '/generate.html' });
    res.end();
    return;
  }

  // ── Root-level page → redirect to latest skin version, or to generation
  // when no design exists yet. Visitors never browse the default theme. ──
  const ROOT_PAGES = ['/', '/index.html', '/about.html', '/contact.html', '/projects.html', '/designs.html'];
  if (ROOT_PAGES.includes(urlPath) && isAuthenticated(req)) {
    const skinBase = getLatestSkinBase();
    if (skinBase) {
      const page = urlPath === '/' ? '/index.html' : urlPath;
      res.writeHead(302, { 'Location': skinBase + page });
    } else {
      res.writeHead(302, { 'Location': '/generate.html' });
    }
    res.end();
    return;
  }

  // ── Branded proposal HTML page ──
  if (urlPath.startsWith('/proposal/') && req.method === 'GET') {
    const proposalId = urlPath.slice('/proposal/'.length).replace(/\/+$/, '');
    const thread = proposalThreads.get(proposalId);
    if (!thread) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<h1>Proposal not found</h1>');
      return;
    }
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(thread.proposal.subject_line || 'Proposal')} — Greg Iteen</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after { box-sizing: border-box; }
  body { font-family: 'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: clamp(20px, 4vw, 40px); background: #f5f5f3; }
  .brand-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
  .brand-bar img { height: 26px; width: auto; display: block; }
  .brand-bar .ref { font-family: 'IBM Plex Mono', monospace; font-size: .68rem; letter-spacing: .18em; text-transform: uppercase; color: #888; }
  .proposal-html { background: #fff; padding: clamp(24px, 5vw, 48px); border: 1px solid #e5e5e2; }
  h1, h2, h3 { color: #111; margin-top: 1.5em; line-height: 1.2; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
  th { background-color: #f5f5f5; }
  a { color: #ff6a00; text-decoration: none; }
  .actions { margin-top: 40px; text-align: center; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .cta { display: inline-block; background: #ff6a00; color: #fff; font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: .85rem; letter-spacing: .05em; padding: 16px 28px; text-decoration: none; transition: opacity .2s; }
  .cta:hover { opacity: .85; }
  .actions .fine { flex-basis: 100%; font-size: .78rem; color: #999; margin-top: 4px; }
  footer { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; letter-spacing: .15em; text-transform: uppercase; color: #999; border-top: 1px solid #e0e0dd; padding-top: 18px; margin-top: 36px; display: flex; justify-content: space-between; gap: 12px; }
  footer a { color: #999; }
  footer a:hover { color: #333; }
</style>
</head>
<body>
  <div class="brand-bar">
    <a href="https://gregiteen.xyz"><img src="/gi-logo-transparent.png" alt="Greg Iteen"></a>
    <span class="ref">Proposal · Ref #${escapeHtml(proposalId)}</span>
  </div>
  ${thread.proposal.proposal_text}
  <div class="actions">
    ${thread.proposal.price_cents > 0 ? `
      <button class="cta" onclick="payProposal('${proposalId}')" style="cursor: pointer; border: none;">Pay $${(thread.proposal.price_cents / 100).toLocaleString()} &amp; Sign &rarr;</button>
    ` : `
      <a class="cta" href="/sign/${proposalId}">Review &amp; Sign &rarr;</a>
    `}
    <span class="fine">Secure e-signature by <img src="/signedgi-logo.png" alt="SignedGI" style="height:16px;vertical-align:-3px"> — no account required.</span>
  </div>
  <footer><a href="https://gregiteen.xyz">gregiteen.xyz</a><span>sales@gregiteen.xyz</span></footer>
  <script>
    async function payProposal(id) {
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposalId: id })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert(data.error || 'Failed to start checkout');
        }
      } catch (err) {
        alert('Failed to connect to checkout service.');
      }
    }
  </script>
</body>
</html>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // ── Branded proposal-signing handoff page ──
  if (urlPath.startsWith('/sign/') && req.method === 'GET') {
    const proposalId = urlPath.slice('/sign/'.length).replace(/\/+$/, '');
    const thread = proposalThreads.get(proposalId);
    const found = !!thread?.signingUrl;
    const html = renderSignPage({
      found,
      clientName: thread?.enrichment?.company_name,
      subject: thread?.proposal?.subject_line,
      signingUrl: thread?.signingUrl,
    });
    res.writeHead(found ? 200 : 404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // ── API: Stripe Checkout Session for Proposals ──
  if (urlPath === '/api/create-checkout-session' && req.method === 'POST') {
    if (!stripe) {
      return sendJson(res, 500, { error: 'Stripe is not configured on the server.' });
    }
    try {
      const { proposalId, successUrl, cancelUrl } = await readBody(req);
      if (!proposalId) return sendJson(res, 400, { error: 'Proposal ID is required' });

      const thread = proposalThreads.get(proposalId);
      if (!thread) return sendJson(res, 404, { error: 'Proposal not found' });

      const priceCents = thread.proposal?.price_cents;
      if (!priceCents || isNaN(priceCents) || priceCents <= 0) {
        return sendJson(res, 400, { error: 'This proposal does not have a valid structured price.' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: thread.proposal.subject_line || 'Project Proposal',
                description: `Payment for proposal ${proposalId}`,
              },
              unit_amount: priceCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${SITE_URL}/proposal/${proposalId}?payment=success`,
        cancel_url: cancelUrl || `${SITE_URL}/proposal/${proposalId}?payment=cancel`,
        customer_email: thread.clientEmail,
        metadata: { proposalId },
      });

      return sendJson(res, 200, { sessionId: session.id, url: session.url });
    } catch (err) {
      console.error('[Stripe] Checkout creation failed:', err instanceof Error ? err.message : String(err));
      return sendJson(res, 500, { error: 'Failed to create checkout session' });
    }
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

  // ── API: One-click drip unsubscribe ──
  if (urlPath === '/api/unsubscribe' && req.method === 'GET') {
    const verified = verifyUnsubscribeToken(urlObj.searchParams.get('token'), DRIP_UNSUBSCRIBE_SECRET);
    if (!verified) {
      res.writeHead(302, { 'Location': '/unsubscribe.html?error=1' });
      res.end();
      return;
    }
    const visitor = visitorProfiles.get(verified.email);
    if (visitor) {
      let drip = visitor.drip;
      if (drip) {
        drip = {
          ...drip,
          status: 'unsubscribed',
          next_send_at: null,
          pause_reason: 'visitor_unsubscribed',
        };
      }
      const updatedVisitor = { ...visitor, drip, status: 'Unsubscribed' };
      visitorProfiles.set(verified.email, updatedVisitor);
      await upsertVisitor(verified.email, updatedVisitor);
      console.log(`[Drip] ${verified.email} unsubscribed.`);
    }
    res.writeHead(302, { 'Location': '/unsubscribe.html?success=1' });
    res.end();
    return;
  }

  // ── API: Documenso document lifecycle webhook ──
  // The endpoint is public by design but closed unless its dedicated webhook
  // secret is configured and sent with a constant-time verified header.
  if (urlPath === '/api/documenso-webhook' && req.method === 'POST') {
    const expectedSecret = process.env.DOCUMENSO_WEBHOOK_SECRET || '';
    const receivedSecret = String(req.headers['x-documenso-secret'] || '');
    if (!verifyWebhookSecret(receivedSecret, expectedSecret)) {
      console.error('[Documenso] Rejected an unsigned or invalid webhook.');
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
    try {
      const event = await readBody(req);
      const documentId = event?.payload?.id === undefined || event?.payload?.id === null ? '' : String(event.payload.id);
      const signingStatus = signingStatusForEvent(event?.event);
      if (!documentId || !signingStatus) return sendJson(res, 200, { received: true, ignored: true });
      const entry = [...proposalThreads.entries()].find(([, thread]) => String(thread.signingDocumentId || '') === documentId);
      if (!entry) {
        console.warn(`[Documenso] Ignored lifecycle event for unknown document ${documentId}.`);
        return sendJson(res, 200, { received: true, ignored: true });
      }
      const [proposalId, thread] = entry;
      const previous = thread.signingStatus;
      thread.signingStatus = signingStatus;
      thread.signingUpdatedAt = event?.payload?.completedAt || event?.createdAt || new Date().toISOString();
      if (signingStatus === 'signed') thread.status = 'signed';
      if (signingStatus === 'client_rejected') thread.status = 'client_rejected';
      proposalThreads.set(proposalId, thread);
      await upsertProposal(proposalId, thread);
      if (previous !== signingStatus && (signingStatus === 'signed' || signingStatus === 'client_rejected')) {
        const label = signingStatus === 'signed' ? 'signed' : 'rejected by the client';
        await smtpTransport.sendMail({
          from: mailFrom,
          to: mailOwner,
          subject: `Proposal ${label}: ${proposalId}`,
          text: `SignedGI reported that proposal ${proposalId} was ${label}.`,
        });
      }
      console.log(`[Documenso] ${proposalId} -> ${signingStatus}`);
      return sendJson(res, 200, { received: true });
    } catch (err) {
      console.error('[Documenso] Webhook processing failed:', err instanceof Error ? err.message : String(err));
      return sendJson(res, 400, { error: 'Invalid webhook payload' });
    }
  }

  // ── API: Deep Health Check (Node + SMTP) ──
  if (urlPath === '/api/health' && req.method === 'GET') {
    try {
      await smtpTransport.verify();
      return sendJson(res, 200, { status: 'healthy', smtp: 'connected' });
    } catch (err) {
      console.error('[Health] SMTP Verify failed:', err.message);
      return sendJson(res, 500, { status: 'unhealthy', error: err.message });
    }
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

      const emailKey = email.toLowerCase();

      // Capture into CRM immediately, before they even verify the code
      const prior = visitorProfiles.get(emailKey);
      if (!prior) {
        const nextProfile = {
          style: style.trim(),
          optIn: !!optIn,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          visits: 1,
          generations: 0,
          enrichment: {},
          pending_notification: null,
          drip: null,
        };
        visitorProfiles.set(emailKey, nextProfile);
        upsertVisitor(emailKey, nextProfile).catch(err => console.error('[Runtime] Failed to persist pre-verify visitor:', err.message));
      } else {
        prior.lastSeen = Date.now();
        visitorProfiles.set(emailKey, prior);
        upsertVisitor(emailKey, prior).catch(err => console.error('[Runtime] Failed to persist pre-verify visitor:', err.message));
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
      requestGeneration(cleanStyle, email.toLowerCase());

      return sendJson(res, 200, { success: true });
    } catch (/** @type {any} */ err) {
      return sendJson(res, 400, { success: false, error: String(err) });
    }
  }

  // ── API: Webmail Forgot Password ──
  if (urlPath === '/api/forgot-password' && req.method === 'POST') {
    try {
      const { email } = await readBody(req);
      if (!email || email !== 'sales@gregiteen.xyz') {
        return sendJson(res, 400, { success: false, error: 'Invalid or unknown webmail address.' });
      }
      
      const resetToken = randomBytes(32).toString('hex');
      passwordResets.set(resetToken, { email, expires: Date.now() + 15 * 60 * 1000 });
      
      const resetUrl = `${SITE_URL}/reset.html?token=${resetToken}`;
      const mailOwner = process.env.MAIL_OWNER;
      
      await smtpTransport.sendMail({
        from: mailFrom,
        to: mailOwner,
        subject: 'Password Reset Request for Webmail',
        text: `A password reset was requested for ${email}.\n\nClick the link below to securely reset the password (expires in 15 minutes):\n${resetUrl}\n\nIf this wasn't you, ignore this email.`,
        html: `<div style="font-family:sans-serif;color:#111;">
          <h2>Webmail Password Reset</h2>
          <p>A password reset was requested for <strong>${email}</strong>.</p>
          <p><a href="${resetUrl}" style="background:#0a0a0a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:10px;">Reset Password</a></p>
          <p style="margin-top:20px;font-size:0.85em;color:#666;">This link expires in 15 minutes.</p>
        </div>`
      });
      
      return sendJson(res, 200, { success: true });
    } catch (err) {
      console.error('[Forgot Password Error]', err);
      return sendJson(res, 500, { success: false, error: 'Failed to request reset.' });
    }
  }

  // ── API: Webmail Reset Password ──
  if (urlPath === '/api/reset-password' && req.method === 'POST') {
    try {
      const { token, password } = await readBody(req);
      if (!token || !password || password.length < 8) {
        return sendJson(res, 400, { success: false, error: 'Invalid token or password too short.' });
      }
      
      const resetReq = passwordResets.get(token);
      if (!resetReq || Date.now() > resetReq.expires) {
        return sendJson(res, 400, { success: false, error: 'Reset token is invalid or expired.' });
      }
      
      // We must run doveadm on the docker container to generate the password hash.
      // And then run a mysql query to update the mailbox table in mailcow.
      const { execSync } = await import('node:child_process');
      
      // 1. Generate Mailcow SSHA512 hash using dovecot container
      const hashCmd = `docker exec mailcowdockerized-dovecot-mailcow-1 doveadm pw -s SHA512-CRYPT -p '${password.replace(/'/g, "'\\''")}'`;
      const hash = execSync(hashCmd).toString().trim();
      
      // 2. Update Mailcow database
      // Using the DBPASS from /opt/mailcow-dockerized/mailcow.conf (IMf6Q76lVXgzP1xmXCDOVg9TfRir)
      const dbCmd = `docker exec mailcowdockerized-mysql-mailcow-1 mysql -u mailcow -pIMf6Q76lVXgzP1xmXCDOVg9TfRir mailcow -e "UPDATE mailbox SET password='${hash}' WHERE username='${resetReq.email}';"`;
      execSync(dbCmd);
      
      // 3. Update the .env file with the new IMAP_PASS so the webmail works!
      const envPath = join(__dirname, '..', '.env');
      let envContent = await readFile(envPath, 'utf8');
      envContent = envContent.replace(/^IMAP_PASS=.*$/m, `IMAP_PASS="${password.replace(/"/g, '\\"')}"`);
      await writeFile(envPath, envContent, 'utf8');
      
      // Clear token
      passwordResets.delete(token);
      
      // Trigger PM2 reload so the new IMAP_PASS is loaded into process.env!
      // PM2 will gracefully reload this process in the background.
      setTimeout(() => execSync('pm2 reload portfolio'), 1000);
      
      return sendJson(res, 200, { success: true });
    } catch (err) {
      console.error('[Reset Error]', err);
      return sendJson(res, 500, { success: false, error: 'Failed to reset password.' });
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
      const effectiveOptIn = Boolean(prior?.optIn || optIn);
      let drip = prior?.drip || null;
      // A new opt-in is enrolled once. An explicit unsubscribe is never
      // silently overridden by a later verification attempt.
      if (effectiveOptIn && (!drip || drip.status === 'completed' || drip.status === 'unenrolled')) {
        const campaign = await getDripCampaign('default-nurture');
        if (campaign) drip = enrollInCampaign(campaign);
        else console.error('[Drip] default-nurture campaign is missing; opted-in visitor was not enrolled.');
      }
      const nextProfile = {
        style,
        optIn: effectiveOptIn,
        firstSeen: prior?.firstSeen ?? Date.now(),
        lastSeen: Date.now(),
        visits: (prior?.visits ?? 0) + 1,
        generations: (prior?.generations ?? 0) + 1,
        enrichment: prior?.enrichment || {},
        pending_notification: prior?.pending_notification || null,
        drip,
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
        console.error('[Runtime] Failed to persist pending notification:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
      });

      // First visit → personal confirmation/welcome email from sales@
      if (!prior) {
        sendConfirmationEmail(emailKey, style, optIn).catch(err => console.error('[Mail] Confirmation error:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err))));
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
      const skinsDir = join(__dirname, '..', 'vault', 'pages', 'skins');
      const files = await fs.readdir(skinsDir);
      
      const stats = await Promise.all(
        files.filter(f => f.endsWith('.md'))
             .map(async f => {
                const s = await fs.stat(join(skinsDir, f));
                return { name: f, mtime: s.mtimeMs };
             })
      );
      
      stats.sort((a, b) => b.mtime - a.mtime);
      if (stats.length > 0) {
        latestUrl = `/designs/${stats[0].name.replace('.md', '')}/index.html`;
      }
    } catch {}

    // In-progress generated assets, revealed on the waiting page as each one
    // is written by the pipeline.
    const assets = {};
    if (genJob.slug && (genJob.status === 'running' || genJob.status === 'done')) {
      const assetDir = join(__dirname, '..', 'designs', genJob.slug, 'assets');
      const { existsSync } = await import('node:fs');
      for (const file of ['hero.jpg', 'logo.png', 'favicon.png', 'portrait.jpg']) {
        if (existsSync(join(assetDir, file))) {
          assets[file.split('.')[0]] = `/generating-asset/${file}?v=${buildVersion}`;
        }
      }
    }

    return sendJson(res, 200, {
      status: genJob.status,
      phase: genJob.phase,
      error: genJob.error,
      version: buildVersion,
      startedAt: genJob.startedAt,
      assets,
      latestUrl
    });
  }

  // ── Waiting-page preview of the in-progress design's generated assets ──
  if (urlPath.startsWith('/generating-asset/')) {
    const file = urlPath.slice('/generating-asset/'.length);
    if (!genJob.slug || !/^[a-z]+\.(jpg|png)$/.test(file)) {
      res.writeHead(404).end();
      return;
    }
    try {
      const data = await readFile(join(__dirname, '..', 'designs', genJob.slug, 'assets', file));
      res.writeHead(200, {
        'content-type': file.endsWith('.png') ? 'image/png' : 'image/jpeg',
        'cache-control': 'no-store',
      });
      res.end(data);
    } catch {
      res.writeHead(404, { 'cache-control': 'no-store' }).end();
    }
    return;
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

  // ── API: Intake answers gathered on the generation waiting page ──
  // Business visitors answer 3 quick questions while their design builds;
  // answers land on the visitor profile and feed enrichment + proposals.
  if (urlPath === '/api/intake' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; if (body.length > 5_000) req.destroy(); });
    req.on('end', async () => {
      try {
        const cookies = parseCookies(req.headers.cookie);
        const session = cookies.gi_auth ? authTokens.get(cookies.gi_auth) : null;
        if (!session?.email) return sendJson(res, 401, { ok: false });
        const answers = JSON.parse(body);
        const clean = {};
        for (const key of ['reason', 'timeline', 'project']) {
          if (typeof answers[key] === 'string' && answers[key].trim()) clean[key] = answers[key].trim().slice(0, 300);
        }
        if (!Object.keys(clean).length) return sendJson(res, 400, { ok: false });
        const existing = visitorProfiles.get(session.email);
        if (existing) {
          const timeline = existing.timeline || [];
          timeline.push(`Waiting-page intake at ${new Date().toISOString()}: ${JSON.stringify(clean)}`);
          const next = { ...existing, intake: { ...(existing.intake || {}), ...clean }, timeline };
          visitorProfiles.set(session.email, next);
          await upsertVisitor(session.email, next).catch(() => {});
        }
        sendJson(res, 200, { ok: true });
      } catch {
        sendJson(res, 400, { ok: false });
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

  // ── API: Banner offers (A/B variant list for the CNA banner) ──
  if (urlPath === '/api/banner-offers' && req.method === 'GET') {
    const offers = await getBannerOffers();
    return sendJson(res, 200, { offers });
  }

  // ── API: Banner events (impression/click tracking for the A/B test) ──
  if (urlPath === '/api/banner-event' && req.method === 'POST') {
    try {
      const { event, variant, trigger } = await readBody(req);
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.gi_auth;
      const session = token ? authTokens.get(token) : null;
      appendBannerEvent({ event, variant, trigger, email: session?.email || null }).catch((err) => {
        console.error('[Banner] Failed to log event:', err.message);
      });
      res.writeHead(204).end();
    } catch (/** @type {any} */ err) {
      console.error('[Banner] Bad event request:', err.message);
      res.writeHead(204).end();
    }
    return;
  }

  // ── API: Email Tracking ──
  if (urlPath.startsWith('/api/track/pixel') && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('e');
    if (email) {
      const key = String(email).trim().toLowerCase();
      const visitor = visitorProfiles.get(key);
      if (visitor) {
        const timeline = visitor.timeline || [];
        timeline.push(`Email opened at ${new Date().toISOString()}`);
        const next = { ...visitor, timeline };
        visitorProfiles.set(key, next);
        upsertVisitor(key, next).catch(e => console.error('[Tracking] Pixel update failed:', e));
      }
    }
    // 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
    return;
  }

  if (urlPath.startsWith('/api/track/link') && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const email = url.searchParams.get('e');
    const targetUrl = url.searchParams.get('url');
    if (email && targetUrl) {
      const key = String(email).trim().toLowerCase();
      const visitor = visitorProfiles.get(key);
      if (visitor) {
        const timeline = visitor.timeline || [];
        timeline.push(`Clicked link to ${targetUrl} at ${new Date().toISOString()}`);
        const next = { ...visitor, timeline };
        visitorProfiles.set(key, next);
        upsertVisitor(key, next).catch(e => console.error('[Tracking] Link update failed:', e));
      }
    }
    res.writeHead(302, { 'Location': targetUrl || '/' });
    res.end();
    return;
  }

  // ── API: Calendar Booking ──
  if (urlPath === '/api/calendar/availability' && req.method === 'GET') {
    try {
      const events = [];
      try {
        const files = await fs.readdir(dirs.calendar);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const raw = await fs.readFile(path.join(dirs.calendar, file), 'utf8');
            const match = raw.match(/^---\n([\s\S]+?)\n---/);
            if (match) {
              const lines = match[1].split('\n');
              const event = {};
              for (const line of lines) {
                const m = line.match(/^([a-z_]+):\s*(.*)$/);
                if (m) {
                  let val = m[2];
                  if (val.startsWith('"') && val.endsWith('"')) val = JSON.parse(val);
                  event[m[1]] = val;
                }
              }
              events.push(event);
            }
          }
        }
      } catch(e) { }

      // Find available slots for the next 14 days (9am - 5pm MST)
      const slots = [];
      const now = new Date();
      for (let i = 1; i <= 14; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 10, 0, 0);
        if (d.getDay() !== 0 && d.getDay() !== 6) { // skip weekends
          slots.push(d.toISOString());
        }
      }
      return sendJson(res, 200, { slots, busy: events.map(e => e.dtstart) });
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  if (urlPath === '/api/calendar/book' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const email = String(body.email).trim().toLowerCase();
      const visitor = visitorProfiles.get(email);
      if (visitor) {
        const timeline = visitor.timeline || [];
        timeline.push(`Booked meeting for ${body.slot} at ${new Date().toISOString()}`);
        const next = { ...visitor, timeline };
        visitorProfiles.set(email, next);
        upsertVisitor(email, next).catch(e => console.error(e));
      }
      
      await smtpTransport.sendMail({
        from: mailFrom,
        to: mailOwner,
        subject: `Meeting Request: ${body.name || email}`,
        text: `A meeting has been requested by ${body.name} (${email}) for ${body.slot}.`,
      });

      return sendJson(res, 200, { success: true });
    } catch (e) {
      return sendJson(res, 500, { error: e.message });
    }
  }

  // ── API: CNA Chat ──
  if (urlPath === '/api/cna' && req.method === 'POST') {
    try {
      const { history } = await readBody(req);
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
      if (!GOOGLE_API_KEY) {
        return sendJson(res, 500, { message: 'AI service unavailable.' });
      }

      let upcomingSchedule = '';
      try {
        const events = [];
        const files = await fs.readdir(dirs.calendar);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const raw = await fs.readFile(path.join(dirs.calendar, file), 'utf8');
            const match = raw.match(/^---\n([\s\S]+?)\n---/);
            if (match) {
              const lines = match[1].split('\n');
              const event = {};
              for (const line of lines) {
                const m = line.match(/^([a-z_]+):\s*(.*)$/);
                if (m) {
                  let val = m[2];
                  if (val.startsWith('"') && val.endsWith('"')) val = JSON.parse(val);
                  event[m[1]] = val;
                }
              }
              events.push(event);
            }
          }
        }
        
        const now = new Date();
        const upcoming = events
          .filter(e => new Date(e.dtstart) >= now || new Date(e.dtend || e.dtstart) >= now)
          .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart))
          .slice(0, 15);
          
        if (upcoming.length > 0) {
          upcomingSchedule = `\nGreg's upcoming busy schedule:\n` + upcoming.map(e => `- ${e.summary} on ${e.dtstart}`).join('\n') + `\nIf the client wants to meet, do not suggest times that overlap with these busy slots. Instead, steer them towards open slots, usually between 9AM-5PM MST.`;
        }
      } catch (e) {
        // Ignore calendar fetch errors
      }

      const systemPrompt = `You are a consultative AI sales director for Greg Iteen (a software engineer and designer). Your job is to conduct a Client Needs Assessment through natural conversation and qualify the prospect using proven sales tactics (BANT/SPIN).${upcomingSchedule}

You already have their initial info (Name, Email, Company, Budget). Acknowledge this info, and then deeply probe into:
1. The core business problem they are trying to solve (Pain).
2. The implications of NOT solving this problem.
3. Their desired timeline and why that timeline matters.
4. BUDGET AND SCOPE: You MUST explicitly discuss their budget vs scope. If their budget is low, tell them what trade-offs might be required. Set realistic expectations.
5. Technical requirements and existing systems.

BEHAVIORAL RULES:
- Be professional, warm, but authoritative. You are an expert consultant, not an order-taker.
- Ask one or two focused questions at a time. Do not overwhelm them.
- When they give vague answers, gently push for specifics.
- Set process expectations: "After we align on the high-level needs, I will summarize the vision for you. Once you confirm, I will draft a formal proposal and send it to Greg for his review and approval. Greg will then email it to you directly. If you'd like to discuss the proposal with him, you'll also be able to pick a time on his calendar."
- When you have enough information (usually after 4-8 exchanges) AND have aligned on budget/scope feasibility, you MUST present a synthesized vision back to the customer in chat to confirm you understand perfectly.
- Once they confirm the vision, respond with a JSON assessment.

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
        // extractJson strips ```json fences the model often wraps around the
        // object; bare JSON.parse failed on those and leaked the raw JSON
        // blob to the user as the chat message.
        cnaResponse = extractJson(text);
      } catch {
        // Never fall back to raw `text` here — on genuine parse failure
        // (e.g. truncated output) it's still JSON-shaped and would leak
        // straight to the chat UI as the exact bug this fallback exists to
        // avoid. Always use a clean, human-facing message instead.
        cnaResponse = { message: 'I\'d love to hear about your project. What are you looking to build?', complete: false };
      }

      return sendJson(res, 200, cnaResponse);
    } catch (/** @type {any} */ err) {
      console.error('[CNA] Error:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
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
      // Which A/B banner offer (if any) this visitor was shown — read from the
      // cookie the banner script sets, so proposals can reference what drove
      // them here without any change needed in consult.html.
      const bannerVariant = cookies.cna_variant || null;

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
            console.error('[Runtime] Failed to persist CNA notification payload:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
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
        const enrichRaw = await geminiCall(GOOGLE_API_KEY, enrichPrompt, { json: true, tools: [{ googleSearch: {} }] });
        enrichment = extractJson(enrichRaw);
      } catch (/** @type {any} */ e) {
        console.warn(`[Proposal ${proposalId}] Enrichment failed: ${e.message}`);
        enrichment = { company_name: emailDomain || 'Unknown', industry: 'Unknown' };
      }

      // Step 2: Generate proposal draft
      console.log(`[Proposal ${proposalId}] Generating proposal draft…`);
      const rateCard = await readRateCard();
      const bannerOffers = await getBannerOffers();
      const matchedOffer = bannerVariant ? bannerOffers.find((o) => o.id === bannerVariant) : null;
      const proposalPrompt = `You are writing a professional project proposal on behalf of Greg Iteen, a software engineer and designer.

CLIENT PROFILE:
${JSON.stringify(enrichment, null, 2)}

CLIENT NEEDS ASSESSMENT:
${assessmentText}

CONVERSATION CONTEXT:
${conversationText}

RATE CARD (the ONLY source of pricing — never invent numbers outside this):
${rateCard || '(rate card unavailable — fall back to a generic "let\'s discuss scope" placeholder, do NOT invent a dollar figure)'}
${matchedOffer ? `\nOFFER THIS PROSPECT WAS SHOWN (id: ${matchedOffer.id}): "${matchedOffer.text}"
This offer is a COMMITMENT, not marketing fluff. You MUST:
- State it explicitly in the proposal under its own "Your offer" heading.
- Apply it to the numbers: a discount changes the quoted price (show both the base and discounted figures); an inclusion appears as a $0 line item with its normal value noted; a guarantee appears in the terms.
- Repeat it in the next-steps section so the client knows how to claim it (e.g. the signing deadline for a time-limited discount).
Never silently drop, weaken, or reinterpret the offer.` : ''}

Write a professional, compelling, and SUPER SPECIFIC project proposal. Include:
1. Executive summary
2. Understanding of the client's needs (show you listened)
3. Proposed solution and approach (convey a strong technical vision)
4. Scope of work (HIGHLY specific, broken down into granular line items and features. Be conservative but highly specific: we want to under-promise and over-deliver.)
5. Timeline with milestones (specific phases)
6. Investment (pricing — MUST come from the rate card above: match the project to its category band, position within the band by complexity, and briefly justify why)
7. Why Greg is the right fit
8. Next steps

Keep it direct, confident, and professional. No fluff. This is from a technical expert, not a sales department. Use rich, beautiful HTML (e.g., semantic tags, styled tables, CSS infographics, charts, and inline styles) so it looks highly structured and detailed, like a modern PRD.

Return plain text using exactly this delimiter contract. Do NOT put the HTML inside a JSON string and do not wrap the response in a code fence:
SUBJECT: Proposal: [project type] for [company]
---PROPOSAL---
<div class="proposal-html">
the full proposal in rich HTML
</div>
---CLIENT_EMAIL---
a brief, warm email to the client that accompanies the proposal
---PRICE_CENTS---
the total integer price in USD cents (e.g. 1500000 for $15,000)
---END---`;

      let proposalDraft = {};
      try {
        proposalDraft = await generateDelimitedProposal(GOOGLE_API_KEY, proposalPrompt);
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
        bannerVariant: bannerVariant || null,
        proposal: proposalDraft,
        history: conversationText,
        revisions: 0,
        createdAt: Date.now(),
        status: 'pending_approval',
      };
      proposalThreads.set(proposalId, proposalThread);
      await upsertProposal(proposalId, proposalThread);
      // A prospect with an active proposal should not receive general nurture
      // mail while Greg is already handling a real conversation.
      await pauseVisitorDripForProposal(clientEmail);

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

      // Attach a letterhead PDF preview so Greg reviews exactly what the
      // client will receive (final signable copy is regenerated at send time
      // in case he revises first).
      let previewPdf = null;
      try {
        previewPdf = await buildLetterheadPdf({
          subject: proposalDraft.subject_line,
          bodyText: proposalDraft.proposal_text,
          clientName: enrichment.company_name,
          clientEmail,
          proposalId,
        });
      } catch (/** @type {any} */ pdfErr) {
        console.error(`[Proposal ${proposalId}] Letterhead PDF preview failed:`, pdfErr.message);
      }

      try {
        await smtpTransport.sendMail({
          from: mailFrom,
          to: mailOwner,
          replyTo,
          subject: `[PROPOSAL] ${proposalDraft.subject_line || 'New Proposal'} — Reply to edit`,
          text: emailToGreg,
          html: emailTextToHtml(emailToGreg),
          headers: { 'X-Proposal-ID': proposalId },
          attachments: previewPdf ? [{ filename: `proposal-${proposalId}-preview.pdf`, content: previewPdf, contentType: 'application/pdf' }] : [],
        });
        console.log(`[Proposal ${proposalId}] Email sent to Greg. Reply-To: ${replyTo}`);
      } catch (/** @type {any} */ emailErr) {
        console.error(`[Proposal ${proposalId}] Email failed:`, emailErr.message);
      }

    } catch (/** @type {any} */ err) {
      console.error('[Proposal] Error:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
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
        try {
          const resObj = await sendProposalToClient(proposalId, thread);
          return sendJson(res, 200, resObj);
        } catch (sendErr) {
          console.error(`[Proposal ${proposalId}] Send failed:`, sendErr.message);
          await smtpTransport.sendMail({
            from: mailFrom, to: mailOwner,
            subject: `✗ Failed to send proposal ${proposalId}`,
            text: `Error: ${sendErr.message}\n\nThe proposal was NOT sent. Try again or send manually.`,
          }).catch(() => {});
          return sendJson(res, 500, { error: sendErr.message });
        }
      }

      // REVISION
      try {
        const resObj = await reviseProposal(proposalId, thread, replyText);
        return sendJson(res, 200, resObj);
      } catch (revErr) {
        console.error(`[Proposal ${proposalId}] Revision failed:`, revErr.message);
        await smtpTransport.sendMail({
          from: mailFrom, to: mailOwner,
          subject: `✗ Revision failed for proposal ${proposalId}`,
          text: `AI revision failed: ${revErr.message}\n\nYour feedback: ${replyText}\n\nReply again to retry.`,
        }).catch(() => {});
        return sendJson(res, 500, { error: revErr.message });
      }
    } catch (err) {
      console.error('[Proposal Reply] Error:', (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)));
      return sendJson(res, 500, { error: (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) });
    }
  }

// ── Admin: Protect admin page ──
  if (urlPath === '/crm-app.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
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

    // GET /api/admin/campaigns
    if (adminPath === '/campaigns' && req.method === 'GET') {
      const campaigns = await getAllDripCampaigns();
      return sendJson(res, 200, campaigns);
    }

    // POST /api/admin/campaigns
    if (adminPath === '/campaigns' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        const slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
        if (!slug) return sendJson(res, 400, { error: 'Invalid slug' });
        
        const title = String(body.name || slug).replace(/"/g, "'");
        const { writeFile } = await import('node:fs/promises');
        
        const content = `---
type: drip_campaign
slug: ${slug}
name: "${title}"
title: "${title} Campaign"
description: "Generated by Visual Builder"
timestamp: ${new Date().toISOString()}
---

# ${title} Campaign

## Sequence JSON

\`\`\`json
${JSON.stringify({ steps: body.steps || [] }, null, 2)}
\`\`\`
`;
        await writeFile(join(__dirname, '..', 'vault', 'campaigns', `${slug}.md`), content, 'utf8');
        return sendJson(res, 200, { success: true, slug });
      } catch (err) {
        return sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
      }
    }

    // POST /api/admin/visitors/drip { email, action: pause|resume|unenroll|enroll, campaign?: slug }
    if (adminPath === '/visitors/drip' && req.method === 'POST') {
      try {
        const { email, action, campaign: campaignSlug } = await readBody(req);
        const key = String(email || '').trim().toLowerCase();
        const visitor = visitorProfiles.get(key);
        if (!visitor) return sendJson(res, 404, { error: 'Visitor not found' });
        
        if (action === 'enroll') {
          if (!campaignSlug) return sendJson(res, 400, { error: 'Campaign slug required' });
          const campaign = await getDripCampaign(campaignSlug);
          if (!campaign) return sendJson(res, 409, { error: 'Campaign is unavailable' });
          const updated = await updateVisitorDrip(key, enrollInCampaign(campaign));
          return sendJson(res, 200, { success: true, visitor: updated });
        }

        if (!visitor.drip) return sendJson(res, 404, { error: 'Visitor has no drip enrollment' });
        let drip = { ...visitor.drip };
        if (action === 'pause') {
          drip = { ...drip, status: 'paused', pause_reason: 'admin_paused' };
        } else if (action === 'resume') {
          const campaign = await getDripCampaign(drip.campaign);
          if (!campaign) return sendJson(res, 409, { error: 'Campaign is unavailable' });
          drip = { ...drip, status: 'active', pause_reason: null, next_send_at: drip.next_send_at || new Date().toISOString() };
        } else if (action === 'unenroll') {
          drip = { ...drip, status: 'unenrolled', next_send_at: null, pause_reason: 'admin_unenrolled' };
        } else {
          return sendJson(res, 400, { error: 'Invalid drip action' });
        }
        const updated = await updateVisitorDrip(key, drip);
        return sendJson(res, 200, { success: true, visitor: updated });
      } catch (err) {
        return sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
      }
    }

    // POST /api/admin/visitors/research { email }
    if (adminPath === '/visitors/research' && req.method === 'POST') {
      try {
        const { email } = await readBody(req);
        const key = String(email || '').trim().toLowerCase();
        const visitor = visitorProfiles.get(key);
        if (!visitor) return sendJson(res, 404, { error: 'Visitor not found' });
        
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
        if (!GOOGLE_API_KEY) return sendJson(res, 500, { error: 'Missing GOOGLE_API_KEY' });
        
        const emailDomain = key.includes('@') ? key.split('@')[1] : '';
        const enrichPrompt = `You are a business intelligence analyst. Research this prospect: ${key} (Domain: ${emailDomain}). 
Search the web for their company and industry. 
OUTPUT JSON: { "company_name": "...", "industry": "...", "estimated_size": "..." }`;
        const enrichRaw = await geminiCall(GOOGLE_API_KEY, enrichPrompt, { json: true, tools: [{ googleSearch: {} }] });
        const enrichment = { ...(visitor.enrichment || {}), ...extractJson(enrichRaw) };
        const updated = await updateVisitorEnrichment(key, enrichment);
        
        return sendJson(res, 200, { success: true, visitor: updated });
      } catch (err) {
        return sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
      }
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


    // POST /api/admin/proposals/:id/decision
    const decisionMatch = adminPath.match(/^\/proposals\/([a-f0-9]+)\/decision$/);
    if (decisionMatch && req.method === 'POST') {
      const proposalId = decisionMatch[1];
      const thread = proposalThreads.get(proposalId);
      if (!thread) return sendJson(res, 404, { error: 'Proposal not found' });
      try {
        const { action, notes } = await readBody(req);
        if (action === 'approve') {
          const resObj = await sendProposalToClient(proposalId, thread);
          return sendJson(res, 200, resObj);
        } else if (action === 'revise') {
          const resObj = await reviseProposal(proposalId, thread, notes || 'Please revise');
          return sendJson(res, 200, resObj);
        } else if (action === 'reject') {
          thread.status = 'rejected';
          thread.decidedAt = new Date().toISOString();
          thread.decisionNotes = notes || '';
          proposalThreads.set(proposalId, thread);
          await upsertProposal(proposalId, thread);
          return sendJson(res, 200, { status: 'rejected' });
        } else {
          return sendJson(res, 400, { error: 'Invalid action' });
        }
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // GET /api/admin/export-bundle
    if (adminPath === '/export-bundle' && req.method === 'GET') {
      try {
        const { spawnSync } = await import('node:child_process');
        const ssssCmd = join(__dirname, '..', 'node_modules', '.bin', 'ssss');
        const result = spawnSync(process.execPath, [ssssCmd, 'export', 'vault', '--profile', 'backup', '--registry', 'vault-registry'], { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'] });
        if (result.status !== 0) throw new Error(String(result.stderr));
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(result.stdout);
        return;
      } catch (/** @type {any} */ e) {
        return sendJson(res, 500, { error: e.message, stderr: e.message });
      }
    }

    // GET /api/admin/export-assets
    if (adminPath === '/export-assets' && req.method === 'GET') {
      try {
        const { spawn } = await import('node:child_process');
        res.writeHead(200, { 'content-type': 'application/gzip', 'content-disposition': 'attachment; filename="assets.tar.gz"' });
        const child = spawn('tar', ['-czf', '-', 'designs', 'vault/pages/skins'], { cwd: join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'] });
        let stderr = '';
        child.stderr.on('data', (c) => stderr += String(c));
        child.stdout.pipe(res);
        child.on('close', (code) => {
          if (code !== 0) console.error('[Export Assets] tar failed:', stderr);
        });
        return;
      } catch (/** @type {any} */ e) {
        if (!res.headersSent) return sendJson(res, 500, { error: e.message });
        res.end();
        return;
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
      const webmail = await getWebmailSettings();
      return sendJson(res, 200, {
        apiKeySet: !!process.env.GOOGLE_API_KEY,
        defaultModel: process.env.DEFAULT_MODEL || 'gemini-3.5-flash',
        mailOwner: mailOwner,
        mailFrom: mailFrom,
        mailDomain: process.env.MAIL_DOMAIN || '',
        cronHour: 3,
        webmail,
      });
    }

    // POST /api/admin/settings
    if (adminPath === '/settings' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        if (body.apiKey) process.env.GOOGLE_API_KEY = body.apiKey;
        if (body.defaultModel) process.env.DEFAULT_MODEL = body.defaultModel;
        if (body.cronHour !== undefined) process.env.CRON_HOUR = String(body.cronHour);
        if (body.webmail) await updateWebmailSettings(body.webmail);
        return sendJson(res, 200, { success: true });
      } catch (/** @type {any} */ e) {
        return sendJson(res, 400, { error: e.message });
      }
    }

    // GET /api/admin/webmail/inbox
    if (adminPath === '/webmail/inbox' && req.method === 'GET') {
      try {
        const messages = await fetchInbox();
        return sendJson(res, 200, { messages });
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // POST /api/admin/webmail/send
    if (adminPath === '/webmail/send' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        await smtpTransport.sendMail({
          from: mailFrom,
          to: body.to,
          subject: body.subject,
          text: body.text,
          html: `<p>${body.text.replace(/\\n/g, '<br>')}</p>`,
        });
        return sendJson(res, 200, { success: true });
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // GET /api/admin/calendar
    if (adminPath === '/calendar' && req.method === 'GET') {
      try {
        const events = [];
        try {
          const files = await fs.readdir(dirs.calendar);
          for (const file of files) {
            if (file.endsWith('.md')) {
              const raw = await fs.readFile(path.join(dirs.calendar, file), 'utf8');
              const match = raw.match(/^---\n([\s\S]+?)\n---/);
              if (match) {
                const lines = match[1].split('\n');
                const event = {};
                for (const line of lines) {
                  const m = line.match(/^([a-z_]+):\s*(.*)$/);
                  if (m) {
                    let val = m[2];
                    if (val.startsWith('"') && val.endsWith('"')) val = JSON.parse(val);
                    event[m[1]] = val;
                  }
                }
                events.push(event);
              }
            }
          }
        } catch(e) {
          // calendar dir might not exist yet
        }
        return sendJson(res, 200, { events });
      } catch (e) {
        return sendJson(res, 500, { error: e.message });
      }
    }

    // POST /api/admin/improve — trigger improvement cycle manually
    if (adminPath === '/improve' && req.method === 'POST') {
      const child = spawn(process.execPath, [improveScript], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: serializedThemeEnv,
      });
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
  let resolved = urlPath === '/' ? 'index.html' : urlPath;
  // No .ico exists; serve the brand PNG at the conventional path (modern
  // browsers accept PNG bytes here — the content-type header is what counts).
  if (resolved === '/favicon.ico') resolved = '/assets/favicon.png';
  // Directory URLs (trailing slash) → index.html
  if (resolved.endsWith('/')) resolved += 'index.html';
  let file = normalize(join(root, resolved));
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' }).end(body);
  } catch {
    // Explicit no-store: without this, browsers may heuristically cache a 404
    // (RFC 7231 §6.1 makes 404 cacheable by default) and keep replaying it on
    // every later navigation even after the file exists — hit live via a
    // deploy race where an asset briefly 404'd before rsync finished.
    res.writeHead(404, { 'content-type': 'text/plain', 'cache-control': 'no-store' }).end('not found');
  }
}).listen(port, () => console.log(`portfolio-site → http://localhost:${port}`));

// ─── Legacy daily improvement cron ───────────────────────────────────────────
// Source-only improvement cannot satisfy the rendered release contract. Keep
// it opt-in for explicit experiments; approved designs are immutable by
// default until improve-theme is routed through the same staging gate.
let lastImproveDay = -1;

function checkImproveCron() {
  if (process.env.ENABLE_LEGACY_THEME_IMPROVER !== '1') return;
  const now = new Date();
  const today = now.getDate();
  const hour = now.getHours();

  // Fire at 3 AM, once per day
  if (hour === 3 && today !== lastImproveDay) {
    lastImproveDay = today;
    console.log('[Cron] Starting daily theme improvement run…');
    const child = spawn(process.execPath, [improveScript], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: serializedThemeEnv,
    });
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
console.log(process.env.ENABLE_LEGACY_THEME_IMPROVER === '1'
  ? '[Cron] Legacy daily theme improvement enabled (3:00 AM)'
  : '[Cron] Legacy theme improvement disabled; generated designs remain release-gated');

// Drip state is persisted as an absolute next_send_at timestamp, so this can
// run on boot and at a short cadence without losing or duplicating a sequence
// across a pm2 restart. DRIP_TICK_MS is configurable for compressed live tests.
setInterval(() => { void sendDueDripEmails(); }, DRIP_TICK_MS);
queueMicrotask(() => { void sendDueDripEmails(); });
console.log(`[Drip] Scheduler started (${DRIP_TICK_MS}ms interval)`);
