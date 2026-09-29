import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDocument } from '@ssss/cli/frontmatter';
import { validateBrief, briefSummary, briefFields } from '../scripts/lib/brief.mjs';

const contact = parseDocument(readFileSync('vault/pages/contact.md', 'utf8')).data;
const questions = contact.x_brief;
const good = {
  engagement: 'agent-memory', brief: 'Three agents across twelve repositories need one set of rules.',
  organization: 'startup', timeline: 'month', budget: '25k-75k',
  name: 'Ada Lovelace', company: 'Analytical Engines', email: 'Ada@Example.com', consent: true,
};

test('the contact document declares seven brief questions with unique inputs', () => {
  assert.equal(questions.length, 7);
  const names = briefFields(questions).map((f) => f.name);
  assert.equal(new Set(names).size, names.length);
  for (const n of ['engagement', 'brief', 'name', 'email', 'consent']) assert.ok(names.includes(n), n);
});

test('a complete brief validates and normalises the email', () => {
  const r = validateBrief(questions, good);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.answers.email, 'ada@example.com');
  assert.equal(r.answers.consent, true);
});

test('undeclared choices, bad emails, short answers and missing consent are rejected', () => {
  const r = validateBrief(questions, { ...good, engagement: 'crypto', email: 'nope', brief: 'short', consent: false });
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['brief', 'consent', 'email', 'engagement']);
});

test('the optional organization may be omitted; form posts accept "on"', () => {
  const r = validateBrief(questions, { ...good, company: '', consent: 'on' });
  assert.equal(r.ok, true);
  assert.equal(r.answers.company, undefined);
});

test('summary shows labels, not machine values', () => {
  const rows = briefSummary(questions, validateBrief(questions, good).answers);
  assert.ok(rows.some(([, a]) => a === 'Agent memory and instruction infrastructure'));
  assert.ok(!rows.some(([, a]) => a === 'agent-memory'));
});
