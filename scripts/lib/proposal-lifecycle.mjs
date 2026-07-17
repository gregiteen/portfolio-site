export const PROPOSAL_STATUSES = Object.freeze([
  'draft',
  'pending_approval',
  'revising',
  'approved',
  'sent',
  'signed',
  'client_rejected',
  'rejected',
]);

const PROPOSAL_STATUS_SET = new Set(PROPOSAL_STATUSES);

export function isValidProposalStatus(status) {
  return PROPOSAL_STATUS_SET.has(status);
}

export function applyDocumensoLifecycle(thread, signingStatus, updatedAt = new Date().toISOString()) {
  const previousSigningStatus = thread?.signingStatus || null;
  const previousProposalStatus = thread?.status || 'draft';
  const next = {
    ...thread,
    signingStatus,
    signingUpdatedAt: updatedAt,
  };

  if (signingStatus === 'signed') next.status = 'signed';
  if (signingStatus === 'client_rejected') next.status = 'client_rejected';

  const terminal = signingStatus === 'signed' || signingStatus === 'client_rejected';
  return {
    thread: next,
    changed: previousSigningStatus !== signingStatus || previousProposalStatus !== next.status,
    terminal,
  };
}
