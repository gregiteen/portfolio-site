#!/usr/bin/env node
/**
 * check-drip-templates.mjs — lint every drip campaign in vault/campaigns/.
 *
 * Usage:
 *   node .agent/skills/marketing/scripts/check-drip-templates.mjs
 *
 * For each campaign doc: extracts the "Sequence JSON" fence, parses it, renders
 * every step's subject + body_template through the real renderDripTemplate()
 * with sample variables, and fails on:
 *   - unparseable JSON
 *   - steps missing delay_hours / subject / body_template
 *   - tokens left unreplaced after render (a typo'd {{FIRSTNAME}} would otherwise
 *     go out to a real lead verbatim)
 *   - a body without an {{UNSUBSCRIBE_URL}} token (compliance requirement)
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDripTemplate } from '../../../../scripts/lib/drip.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../../');
const CAMPAIGNS_DIR = path.join(ROOT, 'vault/campaigns');

const SAMPLE_VARS = {
  FIRST_NAME: 'Sample',
  SITE_URL: 'https://gregiteen.xyz',
  UNSUBSCRIBE_URL: 'https://gregiteen.xyz/unsubscribe?token=sample',
};

let errors = 0;
const files = readdirSync(CAMPAIGNS_DIR).filter((f) => f.endsWith('.md'));
if (!files.length) {
  console.error(`No campaign docs found in ${CAMPAIGNS_DIR}`);
  process.exit(1);
}

for (const file of files) {
  const src = readFileSync(path.join(CAMPAIGNS_DIR, file), 'utf8');
  const fence = src.match(/```json\n([\s\S]*?)\n```/);
  if (!fence) {
    console.error(`✗ ${file}: no \`\`\`json Sequence JSON fence found`);
    errors++;
    continue;
  }

  let seq;
  try {
    seq = JSON.parse(fence[1]);
  } catch (e) {
    console.error(`✗ ${file}: Sequence JSON does not parse — ${e.message}`);
    errors++;
    continue;
  }

  const steps = seq.steps || [];
  if (!steps.length) {
    console.error(`✗ ${file}: sequence has no steps`);
    errors++;
    continue;
  }

  steps.forEach((step, i) => {
    for (const key of ['delay_hours', 'subject', 'body_template']) {
      if (step[key] === undefined) {
        console.error(`✗ ${file} step ${i + 1}: missing '${key}'`);
        errors++;
      }
    }
    for (const [label, tpl] of [['subject', step.subject], ['body', step.body_template]]) {
      if (typeof tpl !== 'string') continue;
      const rendered = renderDripTemplate(tpl, SAMPLE_VARS);
      const leftover = rendered.match(/\{\{[A-Z0-9_]+\}\}/g);
      if (leftover) {
        console.error(`✗ ${file} step ${i + 1} ${label}: unreplaced token(s) ${[...new Set(leftover)].join(', ')} — would reach a real lead verbatim`);
        errors++;
      }
    }
    if (typeof step.body_template === 'string' && !step.body_template.includes('{{UNSUBSCRIBE_URL}}')) {
      console.error(`✗ ${file} step ${i + 1}: body has no {{UNSUBSCRIBE_URL}} token`);
      errors++;
    }
  });

  if (!errors) console.log(`✓ ${file}: ${steps.length} step(s) render clean`);
}

if (errors) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}
console.log('\nAll drip campaigns lint clean.');
