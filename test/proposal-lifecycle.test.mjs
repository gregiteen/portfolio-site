import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyDocumensoLifecycle,
  isValidProposalStatus,
  PROPOSAL_STATUSES,
} from '../scripts/lib/proposal-lifecycle.mjs';

test('proposal lifecycle accepts every persisted terminal status', () => {
  assert.equal(isValidProposalStatus('sent'), true);
  assert.equal(isValidProposalStatus('signed'), true);
  assert.equal(isValidProposalStatus('client_rejected'), true);
  assert.equal(isValidProposalStatus('partially_signed'), false);
  assert.equal(PROPOSAL_STATUSES.includes('signed'), true);
});

test('Documenso lifecycle preserves sent status until terminal completion', () => {
  const initial = { status: 'sent', signingStatus: 'pending_signature' };
  const partial = applyDocumensoLifecycle(initial, 'partially_signed', '2026-07-16T00:00:00.000Z');
  assert.equal(partial.thread.status, 'sent');
  assert.equal(partial.thread.signingStatus, 'partially_signed');
  assert.equal(partial.terminal, false);

  const signed = applyDocumensoLifecycle(partial.thread, 'signed', '2026-07-16T00:01:00.000Z');
  assert.equal(signed.thread.status, 'signed');
  assert.equal(signed.thread.signingStatus, 'signed');
  assert.equal(signed.terminal, true);
});

test('Documenso lifecycle makes repeated webhook deliveries a no-op', () => {
  const thread = { status: 'signed', signingStatus: 'signed' };
  const duplicate = applyDocumensoLifecycle(thread, 'signed', '2026-07-16T00:02:00.000Z');
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.thread.status, 'signed');
});
