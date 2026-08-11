// @ts-nocheck
// crm-store.mjs — Revenue OS vault helpers (PORTFOLIO_REVENUE_ENGINE Phase 1)
// Mirrors runtime-store.mjs patterns: engine-backed writes, idempotent via sha256(relPath+content),
// debounced scheduleWrite, plus state-machine validation for opportunity/application stages.
// All new types are tenant_private and must never appear in sale exports — verified in
// docs/projects/planned/GENERATION_DELIVERY_PIPELINE Phase 0 portability baseline.

import { createEngine } from '@ssss/cli/engine';
import { parseDocument } from '@ssss/cli/frontmatter';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');

const engine = createEngine({ registryDir });
const writeTimers = new Map();
const flushPromises = new Map();

// ── helpers (shared shape with runtime-store.mjs) ────────────────────────────

function nowIso() {
  return new Date().toISOString();
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

export async function flushCrmStore() {
  await Promise.allSettled([...flushPromises.values()]);
}

// ── state machines ───────────────────────────────────────────────────────────

export const OPPORTUNITY_STAGES = Object.freeze(['inbox','qualifying','proposal_draft','proposal_sent','negotiating','won','lost','dormant']);

// Allowed transitions — fail-closed: unknown is denied, same-stage is no-op elsewhere but here treated as error so callers are explicit.
export const OPP_TRANSITIONS = Object.freeze({
  inbox: new Set(['qualifying','lost']),
  qualifying: new Set(['proposal_draft','dormant','lost','inbox']),
  proposal_draft: new Set(['proposal_sent','qualifying','lost']),
  proposal_sent: new Set(['negotiating','won','lost','proposal_draft']),
  negotiating: new Set(['won','lost','proposal_draft']),
  won: new Set(['dormant']),
  lost: new Set(['dormant','qualifying']),
  dormant: new Set(['qualifying','lost']),
});

export const APPLICATION_STAGES = Object.freeze(['found','scored','opportunity_created','applied','awaiting_reply','interview','offer','won','lost','dismissed','withdrawn','dormant']);

export const APP_TRANSITIONS = Object.freeze({
  found: new Set(['scored','dismissed']),
  scored: new Set(['opportunity_created','dismissed']),
  opportunity_created: new Set(['applied','dismissed']),
  applied: new Set(['awaiting_reply','withdrawn']),
  awaiting_reply: new Set(['interview','lost','dormant','withdrawn']),
  interview: new Set(['offer','lost','withdrawn']),
  offer: new Set(['won','lost','withdrawn']),
  won: new Set(['dormant']),
  lost: new Set(['dormant']),
  dismissed: new Set(['dormant']),
  withdrawn: new Set(['dormant']),
  dormant: new Set(['found']),
});

function assertOppTransition(from, to) {
  if (!OPPORTUNITY_STAGES.includes(from)) throw new Error(`Invalid opportunity stage: ${from}`);
  if (!OPPORTUNITY_STAGES.includes(to)) throw new Error(`Invalid opportunity stage: ${to}`);
  if (from === to) throw new Error(`Already in stage: ${to}`);
  const allowed = OPP_TRANSITIONS[from];
  if (!allowed || !allowed.has(to)) throw new Error(`Opportunity transition not allowed: ${from} → ${to}`);
}

function assertAppTransition(from, to) {
  if (!APPLICATION_STAGES.includes(from)) throw new Error(`Invalid application status: ${from}`);
  if (!APPLICATION_STAGES.includes(to)) throw new Error(`Invalid application status: ${to}`);
  if (from === to) throw new Error(`Already in status: ${to}`);
  const allowed = APP_TRANSITIONS[from];
  if (!allowed || !allowed.has(to)) throw new Error(`Application transition not allowed: ${from} → ${to}`);
}

// ── dirs ─────────────────────────────────────────────────────────────────────

export const crmDirs = {
  leads: join(vaultRoot, 'runtime', 'leads'),
  opportunities: join(vaultRoot, 'runtime', 'opportunities'),
  applications: join(vaultRoot, 'runtime', 'applications'),
  gigListings: join(vaultRoot, 'runtime', 'gig-listings'),
  pipelineEvents: join(vaultRoot, 'runtime', 'pipeline-events'),
  inbox: join(vaultRoot, 'runtime', 'inbox'),
  snapshots: join(vaultRoot, 'runtime', 'snapshots'),
};

// ── body builders ────────────────────────────────────────────────────────────

function leadBody(lead) {
  return [
    '# Lead',
    '',
    '## Detail JSON',
    jsonBlock({
      email: lead.email || null,
      company: lead.company || null,
      source: lead.source || null,
      enrichment: lead.enrichment || {},
      consent: lead.consent || null,
    }),
    '',
    lead.notes ? `## Notes\n\n${lead.notes}\n` : '',
  ].join('\n');
}

function opportunityBody(o) {
  return [
    '# Opportunity',
    '',
    '## Detail JSON',
    jsonBlock({
      lead_id: o.lead_id || null,
      proposal_id: o.proposal_id || null,
      application_id: o.application_id || null,
      value_cents: typeof o.value_cents === 'number' ? o.value_cents : null,
      probability: typeof o.probability === 'number' ? o.probability : null,
      next_action_at: o.next_action_at || null,
      source: o.source || null,
      notes: o.notes || null,
    }),
    '',
  ].join('\n');
}

function applicationBody(a) {
  return [
    '# Application',
    '',
    '## Detail JSON',
    jsonBlock({
      gig_listing_id: a.gig_listing_id || null,
      opportunity_id: a.opportunity_id || null,
      lead_id: a.lead_id || null,
      external_url: a.external_url || null,
      applied_at: a.applied_at || null,
      notes: a.notes || null,
    }),
    '',
  ].join('\n');
}

function gigListingBody(g) {
  return [
    '# Gig Listing',
    '',
    '## Detail JSON',
    jsonBlock({
      budget_min: typeof g.budget_min === 'number' ? g.budget_min : null,
      budget_max: typeof g.budget_max === 'number' ? g.budget_max : null,
      posted_at: g.posted_at || null,
      expires_at: g.expires_at || null,
      score: typeof g.score === 'number' ? g.score : null,
      score_reasons: g.score_reasons || null,
      raw: g.raw || null,
    }),
    '',
  ].join('\n');
}

function pipelineEventBody(evt) {
  return [
    '# Pipeline Event',
    '',
    '## Detail JSON',
    jsonBlock({
      actor: evt.actor || 'system',
      reason: evt.reason || null,
      metadata: evt.metadata || null,
    }),
    '',
  ].join('\n');
}

// ── low-level dir scans ─────────────────────────────────────────────────────

async function loadDocs(dir) {
  const out = [];
  try {
    const files = await readdir(dir);
    for (const file of files.filter((f) => f.endsWith('.md'))) {
      try {
        const raw = await readFile(join(dir, file), 'utf8');
        const { data } = parseDocument(raw);
        out.push({ file, data, raw });
      } catch { /* unreadable — skip */ }
    }
  } catch { /* dir missing */ }
  return out;
}

async function loadRecursive(dir) {
  const out = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...await loadRecursive(p));
      } else if (e.name.endsWith('.md')) {
        try {
          const raw = await readFile(p, 'utf8');
          const { data } = parseDocument(raw);
          out.push({ file: p, data, raw });
        } catch { /* skip */ }
      }
    }
  } catch { /* missing */ }
  return out;
}

// ── LEAD ─────────────────────────────────────────────────────────────────────

export async function upsertLead(id, patch) {
  const lead_id = safeId(id);
  const rel = `runtime/leads/${lead_id}.md`;
  let prior = null;
  try {
    const raw = await readFile(join(vaultRoot, rel), 'utf8');
    prior = parseDocument(raw).data;
  } catch { /* new */ }
  const created_at = prior?.created_at || nowIso();
  const now = nowIso();
  const next = {
    type: 'lead',
    title: patch.title || prior?.title || `Lead: ${patch.display_name || lead_id}`,
    description: patch.description || prior?.description || `Lead ${lead_id} for ${patch.company || 'unknown'}.`,
    timestamp: now,
    lead_id,
    display_name: patch.display_name || prior?.display_name || lead_id,
    company: patch.company ?? prior?.company ?? null,
    email: patch.email ? String(patch.email).toLowerCase() : (prior?.email || null),
    source: patch.source || prior?.source || 'manual',
    status: patch.status || prior?.status || 'new',
    created_at,
    updated_at: now,
    enrichment: serializable(patch.enrichment ?? prior?.enrichment ?? {}),
    consent: patch.consent ?? prior?.consent ?? null,
  };
  // Validate required_fields for the type — engine will enforce, but give a friendlier error early
  if (!next.display_name || !next.status || !next.created_at) throw new Error('Lead missing required field: display_name/status/created_at');
  await mkdir(crmDirs.leads, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(next, leadBody({ ...patch, ...next })));
  return next;
}

export async function getLead(id) {
  const rel = `runtime/leads/${safeId(id)}.md`;
  try {
    const { data } = parseDocument(await readFile(join(vaultRoot, rel), 'utf8'));
    return data?.type === 'lead' ? data : null;
  } catch { return null; }
}

export async function listLeads() {
  const docs = await loadDocs(crmDirs.leads);
  return docs.filter((d) => d.data?.type === 'lead').map((d) => d.data).sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));
}

// ── OPPORTUNITY ──────────────────────────────────────────────────────────────

export async function upsertOpportunity(id, patch) {
  const opportunity_id = safeId(id);
  const rel = `runtime/opportunities/${opportunity_id}.md`;
  let prior = null;
  try {
    const raw = await readFile(join(vaultRoot, rel), 'utf8');
    prior = parseDocument(raw).data;
  } catch { /* new */ }
  const created_at = prior?.created_at || nowIso();
  const now = nowIso();
  const lead_id = patch.lead_id ? safeId(patch.lead_id) : (prior?.lead_id || null);
  if (!lead_id) throw new Error('Opportunity requires lead_id');
  const stage = patch.stage || prior?.stage || 'inbox';
  if (!OPPORTUNITY_STAGES.includes(stage)) throw new Error(`Invalid opportunity stage: ${stage}`);
  const next = {
    type: 'opportunity',
    title: patch.title || prior?.title || `Opportunity: ${patch.title || opportunity_id}`,
    description: patch.description || prior?.description || `Opportunity ${opportunity_id} for lead ${lead_id}.`,
    timestamp: now,
    opportunity_id,
    lead_id,
    stage,
    created_at,
    updated_at: now,
    value_cents: typeof patch.value_cents === 'number' ? patch.value_cents : (prior?.value_cents ?? null),
    probability: typeof patch.probability === 'number' ? patch.probability : (prior?.probability ?? null),
    next_action_at: patch.next_action_at ?? prior?.next_action_at ?? null,
    source: patch.source || prior?.source || 'manual',
    proposal_id: patch.proposal_id ? safeId(patch.proposal_id) : (prior?.proposal_id || null),
    application_id: patch.application_id ? safeId(patch.application_id) : (prior?.application_id || null),
  };
  // registry requires opportunity_id, lead_id, title, stage, created_at
  if (!next.opportunity_id || !next.lead_id || !next.title || !next.stage || !next.created_at) throw new Error('Opportunity missing required field');
  await mkdir(crmDirs.opportunities, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(next, opportunityBody(patch)));
  return next;
}

export async function getOpportunity(id) {
  const rel = `runtime/opportunities/${safeId(id)}.md`;
  try {
    const { data } = parseDocument(await readFile(join(vaultRoot, rel), 'utf8'));
    return data?.type === 'opportunity' ? data : null;
  } catch { return null; }
}

export async function listOpportunities(filter = {}) {
  const docs = await loadDocs(crmDirs.opportunities);
  let out = docs.filter((d) => d.data?.type === 'opportunity').map((d) => d.data);
  if (filter.stage) out = out.filter((o) => o.stage === filter.stage);
  if (filter.source) out = out.filter((o) => o.source === filter.source);
  if (filter.lead_id) out = out.filter((o) => o.lead_id === safeId(filter.lead_id));
  return out.sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));
}

export async function transitionOpportunity(id, toStage, { actor = 'system', reason = null } = {}) {
  const opportunity_id = safeId(id);
  const curr = await getOpportunity(opportunity_id);
  if (!curr) throw new Error(`Opportunity not found: ${opportunity_id}`);
  const from = curr.stage;
  assertOppTransition(from, toStage);
  const next = await upsertOpportunity(opportunity_id, { ...curr, stage: toStage, next_action_at: toStage==='won' ? null : (curr.next_action_at || new Date(Date.now()+3*24*60*60*1000).toISOString()) });
  await recordPipelineEvent({ entity_type: 'opportunity', entity_id: opportunity_id, from_stage: from, to_stage: toStage, actor, reason });
  // Phase 6: stage → task auto-creation (qualifying→follow up 3d, proposal_sent→check viewed 2d, won→kickoff)
  try {
    const { upsertTask } = await import('./task-helpers.mjs').catch(()=> ({ upsertTask: null }));
    if (upsertTask) {
      if (toStage === 'qualifying') await upsertTask(`task-${opportunity_id}-followup`, { title: `Follow up — ${next.title}`, due: new Date(Date.now()+3*24*60*60*1000).toISOString(), opportunity_id });
      if (toStage === 'proposal_sent') await upsertTask(`task-${opportunity_id}-viewed`, { title: `Check viewed — ${next.title}`, due: new Date(Date.now()+2*24*60*60*1000).toISOString(), opportunity_id });
      if (toStage === 'won') {
        await upsertTask(`task-${opportunity_id}-kickoff`, { title: `Kickoff — ${next.title}`, due: new Date(Date.now()+2*24*60*60*1000).toISOString(), opportunity_id });
        // Also create calendar_event via writeDocument path (vault/runtime/calendar)
        const { writeCalendarEvent } = await import('./calendar-helpers.mjs').catch(()=> ({ writeCalendarEvent: null }));
        if (writeCalendarEvent) await writeCalendarEvent(`cal-${opportunity_id}`, { summary: `Kickoff: ${next.title}`, dtstart: new Date(Date.now()+2*24*60*60*1000).toISOString(), opportunity_id });
      }
    }
  } catch {}
  return next;
}

// ── APPLICATION ──────────────────────────────────────────────────────────────

export async function upsertApplication(id, patch) {
  const application_id = safeId(id);
  const rel = `runtime/applications/${application_id}.md`;
  let prior = null;
  try {
    const raw = await readFile(join(vaultRoot, rel), 'utf8');
    prior = parseDocument(raw).data;
  } catch { /* new */ }
  const created_at = prior?.created_at || nowIso();
  const now = nowIso();
  const status = patch.status || prior?.status || 'found';
  if (!APPLICATION_STAGES.includes(status)) throw new Error(`Invalid application status: ${status}`);
  const next = {
    type: 'application',
    title: patch.title || prior?.title || `Application: ${application_id}`,
    description: patch.description || prior?.description || `Application ${application_id}.`,
    timestamp: now,
    application_id,
    status,
    created_at,
    updated_at: now,
    gig_listing_id: patch.gig_listing_id ? safeId(patch.gig_listing_id) : (prior?.gig_listing_id || null),
    opportunity_id: patch.opportunity_id ? safeId(patch.opportunity_id) : (prior?.opportunity_id || null),
    lead_id: patch.lead_id ? safeId(patch.lead_id) : (prior?.lead_id || null),
    external_url: patch.external_url || prior?.external_url || null,
    applied_at: patch.applied_at ? toIso(patch.applied_at) : (prior?.applied_at || null),
  };
  if (!next.application_id || !next.status || !next.created_at) throw new Error('Application missing required field');
  await mkdir(crmDirs.applications, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(next, applicationBody(patch)));
  return next;
}

export async function getApplication(id) {
  const rel = `runtime/applications/${safeId(id)}.md`;
  try {
    const { data } = parseDocument(await readFile(join(vaultRoot, rel), 'utf8'));
    return data?.type === 'application' ? data : null;
  } catch { return null; }
}

export async function listApplications(filter = {}) {
  const docs = await loadDocs(crmDirs.applications);
  let out = docs.filter((d) => d.data?.type === 'application').map((d) => d.data);
  if (filter.status) out = out.filter((a) => a.status === filter.status);
  if (filter.source) out = out.filter((a) => a.source === filter.source);
  return out.sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));
}

export async function transitionApplication(id, toStatus, { actor = 'system', reason = null } = {}) {
  const application_id = safeId(id);
  const curr = await getApplication(application_id);
  if (!curr) throw new Error(`Application not found: ${application_id}`);
  const from = curr.status;
  assertAppTransition(from, toStatus);
  const next = await upsertApplication(application_id, { ...curr, status: toStatus });
  await recordPipelineEvent({ entity_type: 'application', entity_id: application_id, from_stage: from, to_stage: toStatus, actor, reason });
  return next;
}

// ── GIG LISTING ──────────────────────────────────────────────────────────────

export async function upsertGigListing(id, patch) {
  const gig_listing_id = safeId(id);
  const source = patch.source || 'unknown';
  const external_id = patch.external_id || gig_listing_id;
  const required = { gig_listing_id, source, external_id, url: patch.url, title: patch.title, posted_at: patch.posted_at ? toIso(patch.posted_at) : nowIso() };
  if (!required.url || !required.title || !required.posted_at) throw new Error('Gig listing missing required field: url/title/posted_at');
  const rel = `runtime/gig-listings/${safeId(source)}/${gig_listing_id}.md`;
  const now = nowIso();
  const fm = {
    type: 'gig_listing',
    title: patch.title || gig_listing_id,
    description: patch.description || `Gig listing ${gig_listing_id} from ${source}.`,
    timestamp: now,
    gig_listing_id,
    source,
    external_id,
    url: required.url,
    title: required.title,
    posted_at: required.posted_at,
    budget_min: typeof patch.budget_min === 'number' ? patch.budget_min : null,
    budget_max: typeof patch.budget_max === 'number' ? patch.budget_max : null,
    expires_at: patch.expires_at ? toIso(patch.expires_at) : null,
    score: typeof patch.score === 'number' ? patch.score : null,
    score_reasons: patch.score_reasons || null,
    created_at: patch.created_at ? toIso(patch.created_at) : now,
    updated_at: now,
  };
  await mkdir(join(vaultRoot, `runtime/gig-listings/${safeId(source)}`), { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(fm, gigListingBody(patch)));
  return fm;
}

export async function listGigListings(filter = {}) {
  const docs = await loadRecursive(crmDirs.gigListings);
  let out = docs.filter((d) => d.data?.type === 'gig_listing').map((d) => d.data);
  if (filter.source) out = out.filter((g) => g.source === filter.source);
  if (filter.min_score != null) out = out.filter((g) => typeof g.score === 'number' && g.score >= filter.min_score);
  return out.sort((a,b)=> String(b.posted_at).localeCompare(String(a.posted_at)));
}

// ── PIPELINE EVENT (append_only) ─────────────────────────────────────────────

export async function recordPipelineEvent({ entity_type, entity_id, from_stage, to_stage, actor = 'system', reason = null, metadata = null }) {
  const event_id = safeId(createHash('sha256').update(`${entity_type}:${entity_id}:${from_stage}→${to_stage}:${Date.now()}:${Math.random()}`).digest('hex').slice(0, 16));
  const created_at = nowIso();
  const rel = `runtime/pipeline-events/${event_id}.md`;
  const fm = {
    type: 'pipeline_event',
    title: `Pipeline: ${entity_type} ${entity_id} ${from_stage}→${to_stage}`,
    description: `Stage transition for ${entity_type} ${entity_id}.`,
    timestamp: created_at,
    event_id,
    entity_type,
    entity_id: safeId(entity_id),
    from_stage,
    to_stage,
    actor,
    reason,
    created_at,
  };
  await mkdir(crmDirs.pipelineEvents, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(fm, pipelineEventBody({ actor, reason, metadata })));
  return fm;
}

export async function listPipelineEvents(filter = {}) {
  const docs = await loadDocs(crmDirs.pipelineEvents);
  let out = docs.filter((d) => d.data?.type === 'pipeline_event').map((d) => d.data);
  if (filter.entity_type) out = out.filter((e) => e.entity_type === filter.entity_type);
  if (filter.entity_id) out = out.filter((e) => e.entity_id === safeId(filter.entity_id));
  return out.sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)));
}

// ── INBOX MESSAGE ────────────────────────────────────────────────────────────

export async function upsertInboxMessage(id, patch) {
  const inbox_id = safeId(id);
  const rel = `runtime/inbox/${inbox_id}.md`;
  const now = nowIso();
  const fm = {
    type: 'inbox_message',
    title: patch.subject || `Inbox: ${inbox_id}`,
    description: `Inbound message ${patch.message_id || inbox_id}.`,
    timestamp: now,
    inbox_id,
    message_id: patch.message_id || inbox_id,
    subject: patch.subject || null,
    from: patch.from || null,
    to: patch.to || null,
    received_at: patch.received_at ? toIso(patch.received_at) : now,
    created_at: now,
    updated_at: now,
  };
  await mkdir(crmDirs.inbox, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(fm, ['# Inbox Message','', '## Detail JSON', jsonBlock(patch), ''].join('\n')));
  return fm;
}

export async function listInboxMessages() {
  const docs = await loadDocs(crmDirs.inbox);
  return docs.filter((d)=> d.data?.type === 'inbox_message').map((d)=> d.data).sort((a,b)=> String(b.received_at).localeCompare(String(a.received_at)));
}

// ── REVENUE SNAPSHOT ─────────────────────────────────────────────────────────

export async function writeRevenueSnapshot(dateStr, payload) {
  const snapshot_date = dateStr || new Date().toISOString().slice(0,10);
  const created_at = nowIso();
  const rel = `runtime/snapshots/${snapshot_date}.md`;
  const fm = {
    type: 'revenue_snapshot',
    title: `Revenue snapshot: ${snapshot_date}`,
    description: `Daily revenue rollup for ${snapshot_date}.`,
    timestamp: created_at,
    snapshot_date,
    created_at,
  };
  await mkdir(crmDirs.snapshots, { recursive: true });
  await scheduleWrite(rel, serializeRuntimeDocument(fm, ['# Revenue Snapshot', '', '## Payload JSON', jsonBlock(payload || {}), ''].join('\n')));
  return fm;
}

export async function listRevenueSnapshots() {
  const docs = await loadDocs(crmDirs.snapshots);
  return docs.filter((d)=> d.data?.type === 'revenue_snapshot').map((d)=> d.data).sort((a,b)=> String(a.snapshot_date).localeCompare(String(b.snapshot_date)));
}

// ── pipeline query (join) ────────────────────────────────────────────────────

export async function queryPipeline({ stage, source, due_before, search } = {}) {
  let opps = await listOpportunities({ stage, source });
  if (due_before) {
    const cutoff = Date.parse(due_before);
    opps = opps.filter((o) => o.next_action_at && Date.parse(o.next_action_at) <= cutoff);
  }
  if (search) {
    const q = String(search).toLowerCase();
    opps = opps.filter((o) => `${o.title || ''} ${o.source || ''} ${o.lead_id || ''}`.toLowerCase().includes(q));
  }
  return opps;
}
