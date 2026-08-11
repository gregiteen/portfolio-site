// @ts-nocheck
// revenue-report.mjs — PORTFOLIO_REVENUE_ENGINE Phase 7
// Pure aggregation over vault docs (leads/opportunities/applications/delivery_events)
// No new store — derived from vault truth. Also writes daily revenue_snapshot.

import { listLeads } from './crm-store.mjs';
import { listOpportunities } from './crm-store.mjs';
import { listApplications } from './crm-store.mjs';
import { listPipelineEvents, writeRevenueSnapshot, listRevenueSnapshots } from './crm-store.mjs';
import { listRecentDeliveryEvents } from '../runtime-store.mjs';

export async function buildRevenueReport() {
  const [opps, apps, leads, events, delivery] = await Promise.all([
    listOpportunities(),
    listApplications(),
    listLeads(),
    listPipelineEvents(),
    listRecentDeliveryEvents(200),
  ]);

  const pipeline_by_stage = {};
  const source_counts = {};
  let weighted_value_cents = 0;
  let overdue_count = 0;
  const now = Date.now();

  for (const opp of opps) {
    pipeline_by_stage[opp.stage] = (pipeline_by_stage[opp.stage] || 0) + 1;
    source_counts[opp.source || 'unknown'] = (source_counts[opp.source || 'unknown'] || 0) + 1;
    if (typeof opp.value_cents === 'number' && typeof opp.probability === 'number') {
      weighted_value_cents += Math.round(opp.value_cents * opp.probability);
    } else if (typeof opp.value_cents === 'number' && opp.stage === 'won') {
      weighted_value_cents += opp.value_cents;
    }
    if (opp.next_action_at && Date.parse(opp.next_action_at) < now && opp.stage !== 'won' && opp.stage !== 'lost' && opp.stage !== 'dormant') {
      overdue_count++;
    }
  }

  const won = (pipeline_by_stage['won'] || 0);
  const lost = (pipeline_by_stage['lost'] || 0);
  const totalClosed = won + lost;

  // avg cycle: from pipeline_events earliest → won for each won opp
  let avg_cycle_days = null;
  if (won > 0) {
    const byId = new Map();
    for (const e of events) {
      if (e.entity_type !== 'opportunity') continue;
      if (!byId.has(e.entity_id)) byId.set(e.entity_id, []);
      byId.get(e.entity_id).push(e);
    }
    let sumDays = 0;
    let n = 0;
    for (const opp of opps.filter(o=>o.stage==='won')) {
      const evts = byId.get(opp.opportunity_id) || [];
      if (!evts.length) continue;
      const first = evts.slice().sort((a,b)=> String(a.created_at).localeCompare(String(b.created_at)))[0];
      const lastWon = evts.filter(e=> e.to_stage==='won').sort((a,b)=> String(b.created_at).localeCompare(String(a.created_at)))[0];
      if (first && lastWon) {
        const days = (Date.parse(lastWon.created_at) - Date.parse(first.created_at)) / (1000*60*60*24);
        if (Number.isFinite(days) && days >=0) { sumDays += days; n++; }
      }
    }
    if (n) avg_cycle_days = Math.round((sumDays/n)*10)/10;
  }

  const delivery_stats = {
    total: delivery.length,
    sent: delivery.filter(d=> d.outcome==='sent').length,
    drafted: delivery.filter(d=> d.outcome==='drafted').length,
    failed: delivery.filter(d=> d.outcome==='failed').length,
  };

  return {
    generated_at: new Date().toISOString(),
    totals: {
      leads: leads.length,
      opportunities: opps.length,
      applications: apps.length,
      pipeline_by_stage,
      weighted_value_cents,
      overdue_count,
      win_rate: totalClosed ? Math.round((won/totalClosed)*100)/100 : null,
      avg_cycle_days,
    },
    attribution: source_counts,
    delivery: delivery_stats,
  };
}

export async function writeDailySnapshot() {
  const payload = await buildRevenueReport();
  const date = new Date().toISOString().slice(0,10);
  await writeRevenueSnapshot(date, payload);
  return { date, payload };
}
