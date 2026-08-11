// @ts-nocheck
import { createEngine } from '@ssss/cli/engine';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');
const engine = createEngine({ registryDir });
export async function writeCalendarEvent(id, { summary, dtstart, opportunity_id }) {
  const rel = `runtime/calendar/${String(id).toLowerCase().replace(/[^a-z0-9_-]+/g,'-')}.md`;
  const content = `---
type: calendar_event
title: "${String(summary).replace(/"/g,"'")}"
description: "Kickoff for ${opportunity_id||''}"
timestamp: "${new Date().toISOString()}"
event_id: "${id}"
summary: "${String(summary).replace(/"/g,"'")}"
dtstart: "${dtstart}"
dtend: "${new Date(Date.parse(dtstart)+60*60*1000).toISOString()}"
opportunity_id: "${opportunity_id||''}"
---

# ${summary}

Opportunity ${opportunity_id||''}
`;
  const res = engine.processOperation({ type:'operation', idempotency_key: createHash('sha256').update(rel+'\n'+content).digest('hex'), workspace_id:'portfolio-runtime', path: rel, content, actor:{role:'system'} }, vaultRoot);
  if (!res.success) throw new Error(res.validation?.errors?.join(';'));
}
