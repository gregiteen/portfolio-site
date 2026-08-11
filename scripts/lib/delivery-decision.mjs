// GENERATION_DELIVERY_PIPELINE Phase 3 — the auto-propose decision path.
// Pure functions, no I/O, so the safety-critical branch logic is trivially
// testable in isolation from IMAP/SMTP/SSSS.
//
// PLACEHOLDER NOTICE: confidenceFromAssessment() below is a first-pass
// completeness heuristic (fraction of the 9 CNA fields that look filled),
// not a validated scoring function — the architecture doc's open question
// "Define the CNA → confidence scoring function (which fields, what
// weighting, what threshold shape)" is still genuinely open. It's safe to
// ship because propose_mode defaults to 'draft', which never reads
// confidence at all — the formula only matters once a human deliberately
// flips the mode to 'auto', and DEFAULT_CONFIDENCE_THRESHOLD is set high
// enough to be conservative until that formula gets real scrutiny.

export const CNA_ASSESSMENT_FIELDS = Object.freeze([
  'project_type', 'description', 'timeline', 'budget_range',
  'technologies', 'complexity', 'priority', 'pain_points', 'target_audience',
]);

export const DEFAULT_DELIVERY_SETTINGS = Object.freeze({
  propose_mode: 'draft', // 'draft' | 'auto'
  confidence_threshold: 0.85,
  rate_cap_max: 3,
  rate_cap_window_ms: 24 * 60 * 60 * 1000,
  kill_switch: false,
});

function looksFilled(value) {
  if (value == null) return false;
  const s = String(value).trim();
  if (s.length < 4) return false;
  return !/^(unknown|n\/a|na|none|tbd)$/i.test(s);
}

/** Fraction (0..1) of the 9 CNA assessment fields that look substantively
 * filled. See the PLACEHOLDER NOTICE above. */
export function confidenceFromAssessment(assessment) {
  if (!assessment || typeof assessment !== 'object') return 0;
  const filled = CNA_ASSESSMENT_FIELDS.filter((f) => looksFilled(assessment[f])).length;
  return filled / CNA_ASSESSMENT_FIELDS.length;
}

/**
 * The decision path from the architecture doc, verbatim:
 *   kill_switch set?        -> draft
 *   mode == 'draft'?        -> draft
 *   confidence < threshold? -> draft
 *   rate cap exceeded?      -> draft
 *   else                    -> auto
 *
 * Every branch except the last is a "draft" outcome — every failure mode
 * (unreadable settings, unparseable threshold, missing confidence) must
 * ALSO resolve to 'draft' by construction, which is why settings and
 * confidence are coerced defensively here rather than trusted as valid.
 *
 * @param {object} params
 * @param {object} params.settings - delivery_settings (may be partial/malformed)
 * @param {number} params.confidence - 0..1, or NaN/undefined if unavailable
 * @param {number} params.recentAutoSendCount - auto-sends within the rate cap window
 * @returns {{action: 'draft'|'auto', reason: string}}
 */
export function decideProposalDelivery({ settings, confidence, recentAutoSendCount = 0 }) {
  const s = { ...DEFAULT_DELIVERY_SETTINGS, ...(settings && typeof settings === 'object' ? settings : {}) };

  if (s.kill_switch) return { action: 'draft', reason: 'kill_switch' };
  if (s.propose_mode !== 'auto') return { action: 'draft', reason: 'mode_draft' };

  const threshold = Number(s.confidence_threshold);
  const conf = Number(confidence);
  if (!Number.isFinite(threshold) || !Number.isFinite(conf) || conf < threshold) {
    return { action: 'draft', reason: 'below_confidence_threshold' };
  }

  const cap = Number(s.rate_cap_max);
  if (!Number.isFinite(cap) || recentAutoSendCount >= cap) {
    return { action: 'draft', reason: 'rate_cap_exceeded' };
  }

  return { action: 'auto', reason: 'above_threshold' };
}
