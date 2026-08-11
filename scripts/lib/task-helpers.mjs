// @ts-nocheck
// task-helpers.mjs — minimal task creator for Phase 6 (stage → task)
// Uses core `task` primitive (tenant_private, not in sale)
import { createEngine } from '@ssss/cli/engine';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const vaultRoot = join(repoRoot, 'vault');
const registryDir = join(repoRoot, 'vault-registry');
const engine = createEngine({ registryDir });

export async function upsertTask(id, { title, due, opportunity_id }) {
  const slug = String(id).toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
  const rel = `tasks/${slug}.md`;
  const content = `---
type: task
title: "${String(title).replace(/"/g,"'")}"
description: "Auto-task for ${opportunity_id||'unknown'} (stage trigger)."
timestamp: "${new Date().toISOString()}"
priority: normal
category: revenue
status: pending
scheduled_for: "${due}"
opportunity_id: "${opportunity_id||''}"
---

# ${title}

Auto-created on transition. Due ${due}. Opportunity \`${opportunity_id||''}\`.
`;
  const res = engine.processOperation({ type:'operation', idempotency_key: createHash('sha256').update(rel+'\n'+content).digest('hex'), workspace_id:'portfolio-runtime', path: rel, content, actor:{role:'system'} }, vaultRoot);
  if (!res.success) throw new Error(res.validation?.errors?.join(';'));
  return slug;
}
