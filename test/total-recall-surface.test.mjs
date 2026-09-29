import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildRulesBlock,
  loadSurfaceNodes,
} from 'total-recall-brain/src/core/surface.mjs';

function writeMemory(vaultDir, category, slug, body, extra = '') {
  const categoryDir = path.join(vaultDir, category);
  fs.mkdirSync(categoryDir, { recursive: true });
  fs.writeFileSync(path.join(categoryDir, `${slug}.md`), `---
type: memory
slug: ${slug}
category: ${category}
title: ${slug}
status: active
importance: 5
modality: should
${extra}---
${body}
`);
}

test('project instruction surfaces layer global and project directives', async (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-tr-surface-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const globalVaultDir = path.join(
    temporaryRoot,
    'global-agent',
    'skills',
    'total-recall',
    'memory-vault',
  );
  const projectVaultDir = path.join(
    temporaryRoot,
    'project',
    '.agent',
    'skills',
    'total-recall',
    'memory-vault',
  );

  writeMemory(globalVaultDir, 'invariants', 'global-invariant', 'Keep the global invariant.');
  writeMemory(globalVaultDir, 'preferences', 'shared-preference', 'Global version.');
  writeMemory(globalVaultDir, 'anti-patterns', 'global-correction', 'Keep the global correction.');
  writeMemory(projectVaultDir, 'preferences', 'shared-preference', 'Project override.');
  writeMemory(
    projectVaultDir,
    'preferences',
    'project-preference',
    'Keep the project preference.\n\nContinue safely.',
  );

  const nodes = loadSurfaceNodes(projectVaultDir, { globalVaultDir });
  const bySlug = new Map(nodes.map(node => [node.slug, node]));

  assert.equal(bySlug.get('global-invariant')._layer, 'global');
  assert.equal(bySlug.get('global-correction')._layer, 'global');
  assert.equal(bySlug.get('shared-preference')._layer, 'project');
  assert.match(bySlug.get('shared-preference').body, /Project override/);

  const rules = await buildRulesBlock(null, nodes);
  assert.match(rules, /^## Active Rules: 1 invariants, 2 preferences, 1 corrections$/m);
  assert.match(rules, /Keep the global invariant/);
  assert.match(rules, /Keep the global correction/);
  assert.match(rules, /Keep the project preference/);
  assert.doesNotMatch(rules, / +$/m);
});

test('project directives survive category caps', async (t) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-tr-surface-cap-'));
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const globalVaultDir = path.join(
    temporaryRoot,
    'global-agent',
    'skills',
    'total-recall',
    'memory-vault',
  );
  const projectVaultDir = path.join(
    temporaryRoot,
    'project',
    '.agent',
    'skills',
    'total-recall',
    'memory-vault',
  );

  for (let index = 0; index < 16; index += 1) {
    writeMemory(
      globalVaultDir,
      'invariants',
      `global-invariant-${index}`,
      `Global invariant ${index}.`,
      'priority: absolute\n',
    );
  }
  writeMemory(
    projectVaultDir,
    'invariants',
    'project-critical-invariant',
    'Keep the project critical invariant.',
    'priority: absolute\n',
  );

  const nodes = loadSurfaceNodes(projectVaultDir, { globalVaultDir });
  const rules = await buildRulesBlock(null, nodes);

  assert.match(rules, /^## Active Rules: 15 invariants, 0 preferences, 0 corrections$/m);
  assert.match(rules, /Keep the project critical invariant/);
});
