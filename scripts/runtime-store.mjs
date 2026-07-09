// @ts-nocheck
import { createEngine } from '@ssss/cli/engine';
import { parseDocument } from '@ssss/cli/frontmatter';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');
const runtimeRoot = join(vaultRoot, 'runtime');
const campaignsDir = join(vaultRoot, 'campaigns');
export const dirs = {
  visitors: join(runtimeRoot, 'visitors'),
  proposals: join(runtimeRoot, 'proposals'),
  runs: join(runtimeRoot, 'runs'),
  config: join(runtimeRoot, 'config'),
  calendar: join(runtimeRoot, 'calendar'),
};

const engine = createEngine({ registryDir });
const visitorCache = new Map();
const proposalCache = new Map();
const writeTimers = new Map();
const flushPromises = new Map();
let initialized = false;

const VALID_PROPOSAL_STATUSES = new Set(['draft', 'pending_approval', 'revising', 'approved', 'sent', 'rejected']);
const VALID_RUN_STATUSES = new Set(['queued', 'running', 'done', 'failed']);

function nowIso() {
  return new Date().toISOString();
}

function emailKey(email) {
  return String(email || '').trim().toLowerCase();
}

function slugEmail(email) {
  return emailKey(email).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function safeId(id) {
  return String(id || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || createHash('sha256').update(String(id || Date.now())).digest('hex').slice(0, 16);
}

function toIso(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return value instanceof Date ? value.toISOString() : String(value);
}

function serializable(value) {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.parse(JSON.stringify(value));
}

function yamlScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(String(value));
}

function yamlLines(key, value, indent = 0) {
  const pad = ' '.repeat(indent);
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return [`${pad}${key}: ${yamlScalar(value)}`];
  }
  const entries = Object.entries(value);
  if (!entries.length) return [`${pad}${key}: {}`];
  return [`${pad}${key}:`, ...entries.flatMap(([k, v]) => yamlLines(k, v, indent + 2))];
}

function serializeRuntimeDocument(frontmatter, body = '') {
  const lines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) lines.push(...yamlLines(key, value));
  lines.push('---', '');
  return `${lines.join('\n')}${body ? `${body.replace(/^\n+/, '')}\n` : ''}`;
}

function jsonBlock(value) {
  return '```json\n' + JSON.stringify(serializable(value ?? null), null, 2) + '\n```';
}

function visitorBody(visitor) {
  return [
    '# Visitor Profile',
    '',
    '## Runtime JSON',
    jsonBlock({
      status: visitor.status || 'Lead',
      timeline: visitor.timeline || [],
      enrichment: visitor.enrichment || {},
      pending_notification: visitor.pending_notification || null,
      drip: visitor.drip || null,
    }),
    '',
    '## Notes',
    visitor.notes || '',
    '',
    '## Session Enrichment',
    jsonBlock(visitor.enrichment || {}),
    '',
  ].join('\n');
}

function proposalBody(proposal) {
  const revisions = Array.isArray(proposal.revision_history) ? proposal.revision_history : [];
  return [
    '## Thread JSON',
    jsonBlock({
      clientEmail: proposal.clientEmail || '',
      assessment: proposal.assessment || {},
      enrichment: proposal.enrichment || {},
      bannerVariant: proposal.bannerVariant || null,
      signingUrl: proposal.signingUrl || null,
      signingDocumentId: proposal.signingDocumentId || null,
      signingStatus: proposal.signingStatus || null,
      signingUpdatedAt: proposal.signingUpdatedAt || null,
      proposal: proposal.proposal || {},
      history: proposal.history || '',
      revision_history: revisions,
      status: proposal.status || 'pending_approval',
      decidedAt: proposal.decidedAt || null,
      decisionNotes: proposal.decisionNotes || null,
    }),
    '',
    '## Assessment',
    jsonBlock(proposal.assessment || {}),
    '',
    '## Current proposal',
    proposal.proposal?.proposal_text || '',
    '',
    '## Client email draft',
    proposal.proposal?.client_email_draft || '',
    '',
    '## Revision history',
    revisions.length ? revisions.map((r, i) => `### Revision ${i + 1}\n\n${jsonBlock(r)}`).join('\n\n') : '_No revisions yet._',
    '',
    '## Enrichment',
    jsonBlock(proposal.enrichment || {}),
    '',
    '## Conversation history',
    proposal.history || '',
    '',
  ].join('\n');
}

function extractJsonBlock(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^## ${escaped}\\s*\\n\\s*\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``, 'm');
  const match = body.match(re);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function runBody(run) {
  return [
    '# Generation Run',
    '',
    '## Scores',
    jsonBlock(run.scores || {}),
    '',
    '## Events',
    ...(Array.isArray(run.events) ? run.events.map((event) => `- ${event}`) : []),
    '',
  ].join('\n');
}

async function loadDir(dir, cache, normalize) {
  try {
    const files = await readdir(dir);
    for (const file of files.filter((f) => f.endsWith('.md'))) {
      const raw = await readFile(join(dir, file), 'utf8');
      const { data } = parseDocument(raw);
      const item = normalize(data, raw);
      cache.set(item.key, item.value);
    }
  } catch {}
}

function normalizeVisitorData(data, raw) {
  const email = emailKey(data.email);
  const runtime = extractJsonBlock(parseDocument(raw).body, 'Runtime JSON') || {};
  return {
    key: email,
    value: {
      email,
      style: data.style_prompt || data.style || '',
      optIn: data.opt_in ?? false,
      firstSeen: data.first_seen ? Date.parse(data.first_seen) : Date.now(),
      lastSeen: data.last_seen ? Date.parse(data.last_seen) : Date.now(),
      visits: Number(data.visits || 0),
      generations: Number(data.generation_count || data.generations || 0),
      status: runtime.status || data.status || 'Lead',
      timeline: runtime.timeline || [],
      enrichment: runtime.enrichment || {},
      pending_notification: runtime.pending_notification || null,
      drip: runtime.drip || null,
    },
  };
}

function normalizeProposalData(data, raw) {
  const id = safeId(data.proposal_id);
  const thread = extractJsonBlock(parseDocument(raw).body, 'Thread JSON') || {};
  return {
    key: id,
    value: {
      id,
      clientEmail: thread.clientEmail || data.client_email || '',
      assessment: thread.assessment || {},
      enrichment: thread.enrichment || { company_name: data.company || '' },
      bannerVariant: thread.bannerVariant || null,
      signingUrl: thread.signingUrl || null,
      signingDocumentId: thread.signingDocumentId || null,
      signingStatus: thread.signingStatus || null,
      signingUpdatedAt: thread.signingUpdatedAt || null,
      proposal: thread.proposal || {},
      history: thread.history || '',
      revision_history: Array.isArray(thread.revision_history) ? thread.revision_history : [],
      revisions: Number(data.revisions || 0),
      createdAt: data.created_at ? Date.parse(data.created_at) : Date.now(),
      status: thread.status || data.status || 'pending_approval',
      decidedAt: thread.decidedAt || data.decided_at || null,
      decisionNotes: thread.decisionNotes || data.decision_notes || null,
    },
  };
}

async function writeDocument(relPath, content) {
  const result = engine.processOperation({
    type: 'operation',
    idempotency_key: createHash('sha256').update(relPath + '\n' + content).digest('hex'),
    workspace_id: 'portfolio-runtime',
    path: relPath,
    content,
    actor: { role: 'system' },
  }, vaultRoot);
  if (!result.success) {
    const errors = result.validation?.errors || result.repair?.field_errors?.map((e) => e.issue) || ['unknown error'];
    throw new Error(`SSSS write failed for ${relPath}: ${errors.join('; ')}`);
  }
}

function scheduleWrite(relPath, content, delay = 250) {
  clearTimeout(writeTimers.get(relPath));
  const pending = new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      writeTimers.delete(relPath);
      try {
        await writeDocument(relPath, content);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        flushPromises.delete(relPath);
      }
    }, delay);
    writeTimers.set(relPath, timer);
  });
  flushPromises.set(relPath, pending);
  return pending;
}

async function persistVisitor(email, visitor) {
  const rel = `runtime/visitors/${slugEmail(email)}.md`;
  const fm = {
    type: 'visitor_profile',
    title: `Visitor profile: ${emailKey(email)}`,
    description: 'Runtime visitor profile for gregiteen.xyz.',
    timestamp: toIso(visitor.lastSeen) || nowIso(),
    email: emailKey(email),
    first_seen: toIso(visitor.firstSeen) || nowIso(),
    last_seen: toIso(visitor.lastSeen) || nowIso(),
    visits: Number(visitor.visits || 0),
    style_prompt: visitor.style || '',
    opt_in: !!visitor.optIn,
    generation_count: Number(visitor.generations || 0),
    status: visitor.status || 'Lead',
    timeline: serializable(visitor.timeline || []),
    enrichment: serializable(visitor.enrichment || {}),
    pending_notification: serializable(visitor.pending_notification || null),
    drip: serializable(visitor.drip || null),
  };
  await scheduleWrite(rel, serializeRuntimeDocument(fm, visitorBody(visitor)));
}

async function persistProposal(id, proposal) {
  const rel = `runtime/proposals/${safeId(id)}.md`;
  const status = proposal.status || 'pending_approval';
  if (!VALID_PROPOSAL_STATUSES.has(status)) throw new Error(`Invalid proposal status: ${status}`);
  const fm = {
    type: 'proposal',
    title: `Proposal: ${safeId(id)}`,
    description: 'Runtime proposal thread for gregiteen.xyz.',
    timestamp: toIso(proposal.createdAt) || nowIso(),
    proposal_id: safeId(id),
    client_email: proposal.clientEmail || '',
    company: proposal.enrichment?.company_name || '',
    project_type: proposal.assessment?.project_type || '',
    banner_variant: proposal.bannerVariant || '',
    status,
    revisions: Number(proposal.revisions || 0),
    created_at: toIso(proposal.createdAt) || nowIso(),
    decided_at: proposal.decidedAt || null,
    decision_notes: proposal.decisionNotes || null,
    assessment: serializable(proposal.assessment || {}),
  };
  await scheduleWrite(rel, serializeRuntimeDocument(fm, proposalBody(proposal)));
}

export async function initRuntimeStore() {
  for (const dir of Object.values(dirs)) await mkdir(dir, { recursive: true });
  visitorCache.clear();
  proposalCache.clear();
  await loadDir(dirs.visitors, visitorCache, normalizeVisitorData);
  await loadDir(dirs.proposals, proposalCache, normalizeProposalData);
  initialized = true;
  return { visitors: visitorCache.size, proposals: proposalCache.size };
}

// ── Rate card (tenant_private singleton) ────────────────────────────────────
// The sole source of pricing for AI-generated proposals. Written once through
// the Operation Contract on first boot (ensureRateCardSeeded); after that,
// Greg edits vault/runtime/config/rate-card.md directly like any other doc —
// figures change without touching code or redeploying.
async function readRuntimeConfigDoc(filename) {
  try {
    const raw = await readFile(join(dirs.config, filename), 'utf8');
    return parseDocument(raw).body.trim();
  } catch {
    return null;
  }
}

export async function getRateCard() {
  return (await readRuntimeConfigDoc('rate-card.md')) || '';
}

export async function ensureRateCardSeeded(defaultBody) {
  await mkdir(dirs.config, { recursive: true });
  if (await readRuntimeConfigDoc('rate-card.md')) return false;
  await writeDocument('runtime/config/rate-card.md', serializeRuntimeDocument({
    type: 'rate_card',
    title: 'Rate Card',
    description: 'Source-of-truth pricing bands for AI-generated client proposals.',
    timestamp: nowIso(),
  }, defaultBody));
  return true;
}

// ── Banner offers (structural — A/B-tested CTA copy, not private data) ─────
function bannerOffersBody(offers) {
  return ['# CNA Banner Offers', '', '## Variants JSON', jsonBlock(offers), ''].join('\n');
}

export async function getBannerOffers() {
  try {
    const raw = await readFile(join(dirs.config, 'banner-offers.md'), 'utf8');
    return extractJsonBlock(parseDocument(raw).body, 'Variants JSON') || [];
  } catch {
    return [];
  }
}

export async function ensureBannerOffersSeeded(defaultOffers) {
  await mkdir(dirs.config, { recursive: true });
  const existing = await getBannerOffers();
  if (existing.length) return false;
  await writeDocument('runtime/config/banner-offers.md', serializeRuntimeDocument({
    type: 'banner_offer',
    title: 'CNA Banner Offers',
    description: 'A/B-tested offer variants shown in the CNA CTA banner.',
    timestamp: nowIso(),
  }, bannerOffersBody(defaultOffers)));
  return true;
}

// ── Drip campaigns (structural definitions; visitor state stays private) ────
export async function getDripCampaign(slug) {
  const safeSlug = String(slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!safeSlug) return null;
  try {
    const raw = await readFile(join(campaignsDir, `${safeSlug}.md`), 'utf8');
    const { data, body } = parseDocument(raw);
    if (data.type !== 'drip_campaign') return null;
    const sequence = extractJsonBlock(body, 'Sequence JSON') || {};
    const steps = Array.isArray(sequence.steps) ? sequence.steps : [];
    if (!steps.length) return null;
    return { slug: data.slug || safeSlug, name: data.name || data.title || safeSlug, steps };
  } catch {
    return null;
  }
}

export function pendingDripVisitors(now = Date.now()) {
  return [...visitorCache.values()].filter((visitor) => {
    const drip = visitor.drip;
    if (!drip || drip.status !== 'active') return false;
    const dueAt = Date.parse(drip.next_send_at || '');
    return Number.isFinite(dueAt) && dueAt <= now;
  });
}

// ── Banner events (append-only analytics log for the A/B test) ─────────────
const bannerEventsRel = 'runtime/events/banner-events.md';

export async function appendBannerEvent(evt) {
  await mkdir(dirname(join(vaultRoot, bannerEventsRel)), { recursive: true });
  let priorBody = '';
  if (existsSync(join(vaultRoot, bannerEventsRel))) {
    priorBody = parseDocument(await readFile(join(vaultRoot, bannerEventsRel), 'utf8')).body.replace(/\s+$/, '');
  }
  const line = `- ${nowIso()} event=${evt.event || 'unknown'} variant=${evt.variant || 'unknown'} trigger=${evt.trigger || '-'} email=${evt.email || 'anon'}`;
  const body = priorBody ? `${priorBody}\n${line}\n` : `# Banner Events\n\n${line}\n`;
  await writeDocument(bannerEventsRel, serializeRuntimeDocument({
    type: 'banner_event_log',
    title: 'Banner Events',
    description: 'Append-only log of CNA banner impressions/clicks for A/B analysis.',
    timestamp: nowIso(),
  }, body));
}

export function getVisitor(email) {
  return visitorCache.get(emailKey(email)) || null;
}

export async function upsertVisitor(email, patch) {
  if (!initialized) await initRuntimeStore();
  const key = emailKey(email);
  const prior = visitorCache.get(key) || { email: key, firstSeen: Date.now(), visits: 0, generations: 0 };
  const next = { ...prior, ...patch, email: key };
  visitorCache.set(key, next);
  await persistVisitor(key, next);
  return next;
}

export function listVisitors() {
  return [...visitorCache.values()];
}

export function getProposal(id) {
  return proposalCache.get(safeId(id)) || null;
}

export async function upsertProposal(id, patch) {
  if (!initialized) await initRuntimeStore();
  const key = safeId(id);
  const prior = proposalCache.get(key) || { id: key, revisions: 0, createdAt: Date.now(), status: 'draft' };
  const next = { ...prior, ...patch, id: key };
  if (!VALID_PROPOSAL_STATUSES.has(next.status || 'draft')) throw new Error(`Invalid proposal status: ${next.status}`);
  proposalCache.set(key, next);
  await persistProposal(key, next);
  return next;
}

export function listProposals(filter = {}) {
  return [...proposalCache.values()].filter((proposal) => {
    if (filter.status && proposal.status !== filter.status) return false;
    return true;
  });
}

export async function appendRun(run) {
  if (!initialized) await initRuntimeStore();
  const id = safeId(run.run_id || run.id || createHash('sha256').update(`${run.prompt || ''}:${Date.now()}`).digest('hex').slice(0, 16));
  const status = run.status || 'queued';
  if (!VALID_RUN_STATUSES.has(status)) throw new Error(`Invalid generation_run status: ${status}`);
  const rel = `runtime/runs/${id}.md`;
  let priorBody = '';
  if (existsSync(join(vaultRoot, rel))) {
    priorBody = parseDocument(await readFile(join(vaultRoot, rel), 'utf8')).body.replace(/\s+$/, '');
  }
  const timestamp = nowIso();
  const event = `${timestamp} ${status}${run.error ? `: ${run.error}` : ''}`;
  const body = priorBody ? `${priorBody}\n- ${event}\n` : runBody({ ...run, events: [event] });
  const fm = {
    type: 'generation_run',
    title: `Generation run: ${id}`,
    description: 'Runtime design generation lifecycle record.',
    timestamp,
    run_id: id,
    prompt: run.prompt || '',
    email: run.email || null,
    status,
    started_at: toIso(run.started_at || run.startedAt) || timestamp,
    finished_at: toIso(run.finished_at || run.finishedAt) || null,
    error: run.error || null,
  };
  await writeDocument(rel, serializeRuntimeDocument(fm, body));
  return { id, ...fm };
}

export function pendingNotifications() {
  return [...visitorCache.values()].filter((v) => v.pending_notification);
}

export async function getWebmailSettings() {
  const filePath = join(dirs.config, 'webmail-settings.md');
  try {
    const raw = await readFile(filePath, 'utf8');
    const doc = parseDocument(raw);
    return doc.frontmatter;
  } catch (e) {
    return null;
  }
}

export async function updateWebmailSettings(updates) {
  const filePath = join(dirs.config, 'webmail-settings.md');
  let doc = { frontmatter: {}, body: '' };
  try {
    const raw = await readFile(filePath, 'utf8');
    doc = parseDocument(raw);
  } catch (e) {
    doc.frontmatter = { type: 'webmail_settings' };
  }
  Object.assign(doc.frontmatter, updates);
  const content = serializeRuntimeDocument(doc.frontmatter, doc.body);
  await mkdir(dirs.config, { recursive: true });
  await writeAtomic(filePath, content);
}

export async function deleteProposal(id) {
  const key = safeId(id);
  proposalCache.delete(key);
  await rm(join(dirs.proposals, `${key}.md`), { force: true });
}

export async function flushRuntimeStore() {
  await Promise.allSettled([...flushPromises.values()]);
}
