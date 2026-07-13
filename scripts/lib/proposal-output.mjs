function cleanSection(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:markdown|text)?\s*\n/i, '')
    .replace(/\n```$/i, '')
    .trim();
}

function section(raw, start, end) {
  const startIndex = raw.indexOf(start);
  if (startIndex < 0) return null;
  const from = startIndex + start.length;
  const endIndex = end ? raw.indexOf(end, from) : raw.length;
  if (endIndex < 0) return null;
  return cleanSection(raw.slice(from, endIndex));
}

/** Parse proposal text generated with explicit delimiters, never JSON strings. */
export function parseProposalOutput(raw, { requireChanges = false } = {}) {
  const source = String(raw || '').trim();
  const subject = source.match(/^SUBJECT:\s*(.+)$/mi)?.[1]?.trim();
  const proposalText = section(source, '---PROPOSAL---', '---CLIENT_EMAIL---');
  const clientEmailDraft = section(source, '---CLIENT_EMAIL---', '---PRICE_CENTS---');
  const priceCentsStr = section(source, '---PRICE_CENTS---', requireChanges ? '---CHANGES---' : '---END---');
  const changesMade = requireChanges ? section(source, '---CHANGES---', '---END---') : null;
  if (!subject || !proposalText || !clientEmailDraft || !priceCentsStr || (requireChanges && !changesMade)) {
    throw new Error('model response did not match the required proposal delimiter contract');
  }
  const price_cents = parseInt(priceCentsStr.replace(/[^0-9]/g, ''), 10);
  return {
    subject_line: subject,
    proposal_text: proposalText,
    client_email_draft: clientEmailDraft,
    price_cents: isNaN(price_cents) ? 0 : price_cents,
    ...(requireChanges ? { changes_made: changesMade } : {}),
  };
}
