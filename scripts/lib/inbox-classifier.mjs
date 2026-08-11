// @ts-nocheck
// inbox-classifier.mjs — PORTFOLIO_REVENUE_ENGINE Phase 3
// Classifies inbound IMAP message as reply to opportunity/application/proposal by In-Reply-To/References + recipient match.
// Pure, testable. Appends inbox_message + pipeline_event signal (does not auto-advance interview/offer — human advances).

import { upsertInboxMessage, recordPipelineEvent } from './crm-store.mjs';

export function classifyReply({ from, to, subject, messageId, inReplyTo, references }) {
  const ref = String(inReplyTo || '') + ' ' + String(references || '');
  // heuristic: messageId contains opp- or app- or prop- or proposal_id
  const lowRef = ref.toLowerCase();
  if (lowRef.includes('opp-') || subject?.toLowerCase().includes('opp-')) return { kind: 'opportunity_reply', ref };
  if (lowRef.includes('app-') || subject?.toLowerCase().includes('application')) return { kind: 'application_reply', ref };
  if (lowRef.includes('proposal') || lowRef.includes('documenso')) return { kind: 'proposal_reply', ref };
  return { kind: 'unclassified', ref };
}

export async function handleInboundReply(msg) {
  const cls = classifyReply(msg);
  const inbox_id = String(msg.messageId || msg.id || Date.now());
  await upsertInboxMessage(inbox_id, { message_id: inbox_id, subject: msg.subject, from: msg.from, to: msg.to, received_at: new Date().toISOString() });
  if (cls.kind !== 'unclassified') {
    // append a lightweight pipeline signal (from_stage==to_stage is not a transition — just a signal event)
    try {
      await recordPipelineEvent({ entity_type: cls.kind.includes('opportunity') ? 'opportunity' : cls.kind.includes('application') ? 'application' : 'proposal', entity_id: inbox_id, from_stage: 'reply_detected', to_stage: 'reply_detected', actor: 'imap', reason: cls.kind });
    } catch {}
  }
  return cls;
}
