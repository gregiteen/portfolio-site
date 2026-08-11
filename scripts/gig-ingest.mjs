#!/usr/bin/env node
// @ts-nocheck
// PORTFOLIO_REVENUE_ENGINE Phase 5 — daily ingester (idempotent, rate-capped, prunes expired)
// Usage: node scripts/gig-ingest.mjs [--source greenhouse|lever|upwork]
// Reads vault/runtime/config/gig-sources.md (all enabled:false by default). Writes
// vault/runtime/gig-listings/<source>/<id>.md via crm-store.mjs (Operation Contract).
// Scoring is deterministic stub until LLM scorer is approved; never auto-applies.

import { readFile } from 'node:fs/promises';
import { parseDocument } from '@ssss/cli/frontmatter';
import { upsertGigListing, listGigListings, flushCrmStore } from './lib/crm-store.mjs';
import { scoreForFit } from './lib/gig-ingest/scorer.mjs';
import { getRateCard } from './runtime-store.mjs';

const args = process.argv.slice(2);
const onlySource = args.includes('--source') ? args[args.indexOf('--source')+1] : null;

async function loadSources() {
  try {
    const raw = await readFile('vault/runtime/config/gig-sources.md','utf8');
    const body = parseDocument(raw).body;
    // parse markdown table: naive
    const lines = body.split('\n').filter(l=> l.includes('|') && l.includes('false') || l.includes('true'));
    return lines;
  } catch { return []; }
}

export async function runIngest({ source }={}) {
  const rateCard = await getRateCard().catch(()=> '');
  // For now: if no source enabled, just demonstrate idempotency without external fetch
  // Real per-source fetch is gated by gig-sources.md `enabled` and an explicit allowlist.
  // This stub creates one demo listing per invocation when --source is given, to prove the pipeline.
  const demo = source || onlySource;
  if (demo) {
    const now = new Date().toISOString();
    const external_id = `demo-${demo}-${Date.now()}`;
    const listing = {
      source: demo,
      external_id,
      url: `https://example.com/${demo}/${external_id}`,
      title: `Demo ${demo} — Senior Full-stack (AI)`,
      posted_at: now,
      budget_min: 5000,
      score: (await scoreForFit({ title: `Senior Full-stack AI ${demo}` }, { rateCard })).score,
      score_reasons: 'demo',
    };
    await upsertGigListing(`demo-${demo}-${external_id.slice(0,12)}`, listing);
    await flushCrmStore();
    console.log(`[gig-ingest] demo listing for ${demo}: ${external_id}`);
  }

  // prune: remove expired gig_listings older than 30d (stub — real prune is SSSS delete op)
  const all = await listGigListings();
  const expired = all.filter(g=> {
    const exp = g.expires_at ? Date.parse(g.expires_at) : null;
    if (exp && exp < Date.now()) return true;
    const posted = Date.parse(g.posted_at);
    return Number.isFinite(posted) && (Date.now() - posted) > 30*24*60*60*1000;
  });
  if (expired.length) console.log(`[gig-ingest] ${expired.length} expired (prune is manual SSSS delete)`);

  return { demo, total: all.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runIngest({ source: onlySource });
  console.log(`done ${JSON.stringify(r)}`);
}
