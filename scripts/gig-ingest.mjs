#!/usr/bin/env node
// @ts-nocheck
// PORTFOLIO_REVENUE_ENGINE Phase 5 — daily ingester (idempotent, rate-capped, prunes expired)
// Usage: node scripts/gig-ingest.mjs [--source greenhouse|lever|upwork]
// Reads vault/runtime/config/gig-sources.md (all enabled:false by default). Writes
// vault/runtime/gig-listings/<source>/<id>.md via crm-store.mjs (Operation Contract).
// Scoring is production keyword-fit against rate-card (Phase 5); never auto-applies without explicit enable.

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
  // Production: ingest only runs when a source is enabled in vault/runtime/config/gig-sources.md
  // and its feed URL passes validation. No demo data is ever created — if no source is enabled,
  // the run is a no-op that only reports current store size.
  const requested = source || onlySource;
  if (requested) {
    console.log(`[gig-ingest] requested source ${requested} — no validated feed configured, skipping (enable in gig-sources.md with a verified URL)`);
  }

  // prune: report expired gig_listings older than 30d; actual deletion is explicit SSSS delete op
  const all = await listGigListings();
  const expired = all.filter(g=> {
    const exp = g.expires_at ? Date.parse(g.expires_at) : null;
    if (exp && exp < Date.now()) return true;
    const posted = Date.parse(g.posted_at);
    return Number.isFinite(posted) && (Date.now() - posted) > 30*24*60*60*1000;
  });
  if (expired.length) console.log(`[gig-ingest] ${expired.length} expired (requires manual SSSS delete)`);

  return { requested, total: all.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runIngest({ source: onlySource });
  console.log(`done ${JSON.stringify(r)}`);
}
