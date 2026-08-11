#!/usr/bin/env node
// @ts-nocheck
// PORTFOLIO_REVENUE_ENGINE Phase 5 — daily ingester (idempotent, rate-capped, prunes expired)
// Usage: node scripts/gig-ingest.mjs [--source greenhouse|lever|upwork]
// Reads vault/runtime/config/gig-sources.md (all enabled:false by default). Writes
// vault/runtime/gig-listings/<source>/<id>.md via crm-store.mjs (Operation Contract).
// Scoring is production keyword-fit against rate-card (Phase 5); filtered by keywords in config.

import { readFile } from 'node:fs/promises';
import { parseDocument } from '@ssss/cli/frontmatter';
import { upsertGigListing, listGigListings, flushCrmStore } from './lib/crm-store.mjs';
import { scoreForFit } from './lib/gig-ingest/scorer.mjs';
import { getRateCard } from './runtime-store.mjs';
import { fetchGreenhouseJobs } from './lib/gig-ingest/greenhouse.mjs';
import { fetchLeverPostings } from './lib/gig-ingest/lever.mjs';
import { fetchUpworkJobs } from './lib/gig-ingest/upwork.mjs';

const args = process.argv.slice(2);
const onlySource = args.includes('--source') ? args[args.indexOf('--source')+1] : null;

function parseEnabledSources(mdBody) {
  const enabled = new Map();
  const lines = mdBody.split('\n').filter(l => l.trim().startsWith('|'));
  for (const line of lines) {
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;
    const src = cols[0].toLowerCase();
    if (!['upwork','greenhouse','lever','linkedin','contra','toptal'].includes(src)) continue;
    const en = cols[1].toLowerCase() === 'true';
    enabled.set(src, en);
  }
  return enabled;
}

async function loadEnabled() {
  try {
    const raw = await readFile('vault/runtime/config/gig-sources.md','utf8');
    const body = parseDocument(raw).body || raw;
    return parseEnabledSources(body);
  } catch { return new Map(); }
}

function allowlistFor(source) {
  if (source === 'greenhouse') return (process.env.GREENHOUSE_BOARD_TOKENS || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (source === 'lever') return (process.env.LEVER_SITES || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (source === 'upwork') return process.env.UPWORK_FEED_URL ? [process.env.UPWORK_FEED_URL] : [];
  return [];
}

export async function runIngest({ source }={}) {
  const rateCard = await getRateCard().catch(()=> '');
  const enabledMap = await loadEnabled();
  const requested = source || onlySource;
  const targets = requested ? [requested] : [...enabledMap.entries()].filter(([,en])=>en).map(([k])=>k);

  if (targets.length === 0) {
    console.log('[gig-ingest] no enabled sources — nothing to fetch (enable in gig-sources.md)');
  }

  let ingested = 0;
  for (const src of targets) {
    const isEnabled = enabledMap.get(src);
    if (!isEnabled && !requested) continue;
    if (requested && enabledMap.get(src) === false) {
      console.log(`[gig-ingest] ${src} is disabled in gig-sources.md — skipping per config`);
      continue;
    }
    const allow = allowlistFor(src);
    if (allow.length === 0) {
      console.log(`[gig-ingest] ${src}: no allowlist configured (GREENHOUSE_BOARD_TOKENS / LEVER_SITES / UPWORK_FEED_URL) — skipping`);
      continue;
    }
    try {
      let jobs = [];
      if (src === 'greenhouse') {
        for (const token of allow) {
          const fetched = await fetchGreenhouseJobs(token);
          jobs.push(...fetched.map(j => ({ ...j, source: src })));
        }
      } else if (src === 'lever') {
        for (const site of allow) {
          const fetched = await fetchLeverPostings(site);
          jobs.push(...fetched.map(j => ({ ...j, source: src })));
        }
      } else if (src === 'upwork') {
        for (const url of allow) {
          const fetched = await fetchUpworkJobs(url);
          jobs.push(...fetched.map(j => ({ ...j, source: src })));
        }
      } else {
        console.log(`[gig-ingest] ${src}: no fetcher implemented yet — skipping`);
        continue;
      }

      // Cap per-source to 50, total cap 100 across run
      jobs = jobs.slice(0, 100);
      for (const job of jobs.slice(0, 50)) {
        const { score, reasons } = await scoreForFit({ title: job.title }, { rateCard });
        const slug = `${src}-${String(job.external_id).slice(0,40).replace(/[^a-zA-Z0-9_-]/g,'_')}`;
        await upsertGigListing(slug, {
          source: src,
          external_id: String(job.external_id),
          url: job.url,
          title: job.title,
          location: job.location || '',
          posted_at: job.posted_at,
          score,
          score_reasons: reasons,
          raw: job.raw || null,
        });
        ingested++;
        if (ingested >= 100) break;
      }
      console.log(`[gig-ingest] ${src}: fetched ${jobs.length}, upserted ${ingested}`);
    } catch (e) {
      console.error(`[gig-ingest] ${src} fetch failed:`, e.message);
    }
    if (ingested >= 100) break;
  }

  if (ingested > 0) await flushCrmStore();

  // prune: report expired gig_listings older than 30d; actual deletion is explicit SSSS delete op
  const all = await listGigListings();
  const expired = all.filter(g=> {
    const exp = g.expires_at ? Date.parse(g.expires_at) : null;
    if (exp && exp < Date.now()) return true;
    const posted = Date.parse(g.posted_at);
    return Number.isFinite(posted) && (Date.now() - posted) > 30*24*60*60*1000;
  });
  if (expired.length) console.log(`[gig-ingest] ${expired.length} expired (requires manual SSSS delete)`);

  return { requested: requested || null, ingested, total: all.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runIngest({ source: onlySource });
  console.log(`done ${JSON.stringify(r)}`);
}
