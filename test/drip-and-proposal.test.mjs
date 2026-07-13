import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceDripState,
  createUnsubscribeToken,
  enrollInCampaign,
  renderDripTemplate,
  verifyUnsubscribeToken,
} from '../scripts/lib/drip.mjs';
import { parseProposalOutput } from '../scripts/lib/proposal-output.mjs';
import { signingStatusForEvent, verifyWebhookSecret } from '../scripts/lib/documenso.mjs';

const campaign = {
  slug: 'test-campaign',
  steps: [
    { delay_minutes: 1, subject: 'First', body_template: 'Hi {{FIRST_NAME}}' },
    { delay_minutes: 2, subject: 'Second', body_template: 'Link {{UNSUBSCRIBE_URL}}' },
  ],
};

test('drip enrollment and advancement use durable absolute timestamps', () => {
  const enrolled = enrollInCampaign(campaign, 1_000);
  assert.equal(enrolled.status, 'active');
  assert.equal(enrolled.step, 0);
  assert.equal(enrolled.next_send_at, new Date(61_000).toISOString());

  const second = advanceDripState(campaign, enrolled, 61_000);
  assert.equal(second.step, 1);
  assert.equal(second.next_send_at, new Date(181_000).toISOString());

  const complete = advanceDripState(campaign, second, 181_000);
  assert.equal(complete.status, 'completed');
  assert.equal(complete.next_send_at, null);
});

test('drip templates and unsubscribe tokens are scoped and tamper-resistant', () => {
  assert.equal(renderDripTemplate('Hi {{FIRST_NAME}} — {{UNKNOWN}}', { FIRST_NAME: 'Sam' }), 'Hi Sam — ');
  const token = createUnsubscribeToken('sam@example.com', 'test-secret', { expiresAt: 10_000 });
  assert.deepEqual(verifyUnsubscribeToken(token, 'test-secret', 9_999), { email: 'sam@example.com', expiresAt: 10_000 });
  assert.equal(verifyUnsubscribeToken(token, 'wrong-secret', 9_999), null);
  assert.equal(verifyUnsubscribeToken(token, 'test-secret', 10_001), null);
});

test('proposal parser accepts delimited Markdown and rejects missing sections', () => {
  const parsed = parseProposalOutput(`SUBJECT: Proposal for Acme
---PROPOSAL---
# Scope

Build the thing.
---CLIENT_EMAIL---
Hi Acme,

Attached is the proposal.
---PRICE_CENTS---
1500000
---END---`);
  assert.equal(parsed.subject_line, 'Proposal for Acme');
  assert.match(parsed.proposal_text, /# Scope/);
  assert.match(parsed.client_email_draft, /Attached/);
  assert.throws(() => parseProposalOutput('SUBJECT: Missing sections'), /delimiter contract/);
});

test('revision parser requires and preserves a change summary', () => {
  const parsed = parseProposalOutput(`SUBJECT: Revised
---PROPOSAL---
Updated scope
---CLIENT_EMAIL---
Updated note
---PRICE_CENTS---
1600000
---CHANGES---
Added the requested milestone.
---END---`, { requireChanges: true });
  assert.equal(parsed.changes_made, 'Added the requested milestone.');
});

test('Documenso webhook verification requires the configured secret and maps lifecycle states', () => {
  assert.equal(verifyWebhookSecret('same-secret', 'same-secret'), true);
  assert.equal(verifyWebhookSecret('wrong-secret', 'same-secret'), false);
  assert.equal(verifyWebhookSecret('', 'same-secret'), false);
  assert.equal(verifyWebhookSecret('same-secret', ''), false);
  assert.equal(signingStatusForEvent('DOCUMENT_COMPLETED'), 'signed');
  assert.equal(signingStatusForEvent('DOCUMENT_REJECTED'), 'client_rejected');
  assert.equal(signingStatusForEvent('DOCUMENT_SIGNED'), 'partially_signed');
  assert.equal(signingStatusForEvent('OTHER_EVENT'), null);
});
