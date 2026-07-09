import { createHmac, timingSafeEqual } from 'node:crypto';

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const ACTIVE_STATUSES = new Set(['active', 'paused', 'completed', 'unsubscribed', 'unenrolled']);

function positiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function delayMs(step = {}) {
  if (step.delay_minutes !== undefined) return positiveNumber(step.delay_minutes) * MINUTE_MS;
  return positiveNumber(step.delay_hours) * HOUR_MS;
}

export function normalizeDripState(value) {
  if (!value || typeof value !== 'object') return null;
  const campaign = String(value.campaign || '').trim();
  const status = String(value.status || 'active').trim();
  if (!campaign || !ACTIVE_STATUSES.has(status)) return null;
  return {
    campaign,
    step: Math.max(0, Math.floor(positiveNumber(value.step))),
    status,
    next_send_at: value.next_send_at || null,
    enrolled_at: value.enrolled_at || null,
    last_sent_at: value.last_sent_at || null,
    pause_reason: value.pause_reason || null,
  };
}

export function enrollInCampaign(campaign, now = Date.now()) {
  const firstStep = campaign?.steps?.[0];
  if (!firstStep) throw new Error(`Campaign "${campaign?.slug || 'unknown'}" has no steps`);
  const at = new Date(now);
  return {
    campaign: campaign.slug,
    step: 0,
    status: 'active',
    enrolled_at: at.toISOString(),
    last_sent_at: null,
    next_send_at: new Date(now + delayMs(firstStep)).toISOString(),
    pause_reason: null,
  };
}

export function advanceDripState(campaign, current, sentAt = Date.now()) {
  const state = normalizeDripState(current);
  if (!state) throw new Error('Cannot advance an invalid drip state');
  const nextStep = state.step + 1;
  const next = campaign?.steps?.[nextStep];
  if (!next) {
    return { ...state, step: nextStep, status: 'completed', last_sent_at: new Date(sentAt).toISOString(), next_send_at: null, pause_reason: null };
  }
  return {
    ...state,
    step: nextStep,
    status: 'active',
    last_sent_at: new Date(sentAt).toISOString(),
    next_send_at: new Date(sentAt + delayMs(next)).toISOString(),
    pause_reason: null,
  };
}

export function renderDripTemplate(template, variables = {}) {
  return String(template || '').replace(/\{\{([A-Z0-9_]+)\}\}/gi, (_, key) => String(variables[key] ?? ''));
}

export function createUnsubscribeToken(email, secret, { expiresAt = Date.now() + 180 * 24 * HOUR_MS } = {}) {
  if (!secret) throw new Error('DRIP_UNSUBSCRIBE_SECRET is required');
  const payload = Buffer.from(JSON.stringify({ email: String(email).trim().toLowerCase(), exp: expiresAt })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyUnsubscribeToken(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const email = String(parsed.email || '').trim().toLowerCase();
    if (!email.includes('@') || !Number.isFinite(Number(parsed.exp)) || Number(parsed.exp) < now) return null;
    return { email, expiresAt: Number(parsed.exp) };
  } catch {
    return null;
  }
}
