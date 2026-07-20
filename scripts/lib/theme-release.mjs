export function requireValidTheme(verdict, label = 'Release gate') {
  if (verdict?.theme) return verdict.theme;
  const errors = Array.isArray(verdict?.errors) && verdict.errors.length
    ? verdict.errors.join('; ')
    : 'validation returned no approved theme';
  throw new Error(`${label} rejected theme: ${errors}`);
}

export function renderedReviewState(verdict, minimumScore = 8) {
  const issues = Array.isArray(verdict?.issues) ? verdict.issues : [];
  const blocking = issues.filter((issue) => issue?.severity !== 'minor');
  const score = Number(verdict?.score) || 0;
  return {
    approved: verdict?.approved === true && score >= minimumScore && blocking.length === 0,
    blocking,
    issues,
    score,
  };
}

export function requireApprovedVisualAudit(audit, label = 'Visual asset review') {
  if (audit?.approved === true) return audit;
  const issues = Array.isArray(audit?.issues) && audit.issues.length
    ? audit.issues.join('; ')
    : 'review returned no approval';
  throw new Error(`${label} rejected theme: ${issues}`);
}

export function generationRetryDelay(attempt, { baseMs = 2_000, maxMs = 60_000 } = {}) {
  const safeAttempt = Math.max(1, Number.isFinite(attempt) ? Math.floor(attempt) : 1);
  return Math.min(maxMs, baseMs * (2 ** Math.min(safeAttempt - 1, 10)));
}

const NON_RETRYABLE_GENERATION_FAILURES = [
  /\b(?:OPENROUTER_API_KEY|GOOGLE_API_KEY|GEMINI_API_KEY)\b.*\b(?:not found|not set|missing)\b/i,
  /\b(?:API_KEY_INVALID|INVALID_ARGUMENT|PERMISSION_DENIED|UNAUTHENTICATED)\b/,
  /"code"\s*:\s*(?:400|401|403|404)\b/,
  /\bCannot find module\b/i,
  /\b(?:SyntaxError|ReferenceError)\b/,
  /\bENOENT\b/,
];

export function isRetryableGenerationFailure(reason) {
  const detail = reason instanceof Error ? reason.message : String(reason || '');
  return !NON_RETRYABLE_GENERATION_FAILURES.some((pattern) => pattern.test(detail));
}

export function generationRetryDecision(
  attempt,
  reason,
  { maxAttempts = Number.POSITIVE_INFINITY, baseMs = 2_000, maxMs = 60_000 } = {},
) {
  const safeAttempt = Math.max(1, Number.isFinite(attempt) ? Math.floor(attempt) : 1);
  const safeMaxAttempts = Number.isFinite(maxAttempts)
    ? Math.max(1, Math.floor(maxAttempts))
    : Number.POSITIVE_INFINITY;
  const retryable = isRetryableGenerationFailure(reason);
  const exhausted = safeAttempt >= safeMaxAttempts;
  const retry = retryable && !exhausted;
  return {
    retry,
    retryable,
    exhausted,
    delayMs: retry ? generationRetryDelay(safeAttempt, { baseMs, maxMs }) : 0,
  };
}

function restoreCandidate(candidate, snapshot) {
  for (const key of Object.keys(candidate)) delete candidate[key];
  Object.assign(candidate, structuredClone(snapshot));
}

/**
 * Decide whether a candidate that hit the repair-pass cap ships anyway.
 * The reviewer's own approval bar stays higher (renderedReviewState's
 * minimumScore); this is the explicit "good enough after bounded effort"
 * escape hatch that keeps one candidate from looping for hours.
 */
export function decideAtCap(state = {}, { threshold = 7 } = {}) {
  const score = Number(state?.score) || 0;
  const blocking = Array.isArray(state?.blocking) ? state.blocking : [];
  if (blocking.length > 0) {
    return { promote: false, reason: `${blocking.length} blocking issue(s) remain` };
  }
  if (score < threshold) {
    return { promote: false, reason: `score ${score}/10 below promotion threshold ${threshold}` };
  }
  return { promote: true, reason: `score ${score}/10 with no blocking issues` };
}

// Trailing-s strip is deliberate: the reviewer paraphrases each pass
// ("fragment appears" / "fragments appear"), and plural drift alone was
// enough to break exact-token matching.
const tokenizeIssue = (text) => new Set(
  (String(text || '').toLowerCase().match(/[a-z0-9]{4,}/g) || [])
    .map((token) => token.replace(/s$/, '')),
);

// Overlap coefficient (not Jaccard): heavy paraphrasing inflates the union
// and under-counts genuinely identical defects.
function issueSimilarity(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.min(a.size, b.size);
}

/**
 * Track blocking issues across repair passes. The reviewer paraphrases the
 * same defect differently each pass, so matching is fuzzy (token overlap per
 * target). An issue surviving `escalateAt` observations gets one escalated
 * (structurally different) repair attempt; surviving `suppressAt` observations
 * proves it unfixable by this repair loop and stops it from blocking — the cap
 * decision or a fresh candidate handles it from there.
 */
export function createIssueLedger({ escalateAt = 2, suppressAt = 3, similarityThreshold = 0.4 } = {}) {
  const entries = [];
  return {
    observe(issues = []) {
      const repairable = [];
      const suppressed = [];
      for (const issue of issues) {
        const target = typeof issue?.target === 'string' ? issue.target : '';
        const tokens = tokenizeIssue(issue?.issue);
        let entry = entries.find((e) => e.target === target
          && issueSimilarity(e.tokens, tokens) >= similarityThreshold);
        if (entry) {
          entry.count += 1;
          entry.tokens = tokens;
        } else {
          entry = { target, tokens, count: 1 };
          entries.push(entry);
        }
        if (entry.count >= suppressAt) {
          suppressed.push(issue);
        } else if (entry.count >= escalateAt) {
          repairable.push({ ...issue, escalate: true });
        } else {
          repairable.push(issue);
        }
      }
      return { repairable, suppressed };
    },
  };
}

/**
 * Keep one generated candidate alive until the rendered review approves it.
 * A rejected repair is rolled back in place, preserving candidate identity.
 *
 * The loop is bounded: after `maxPasses` failed reviews (or a repair error
 * marked `terminal: true`, e.g. the repair model producing nothing on
 * consecutive passes), `capDecider` chooses promote-vs-fail. Failure throws,
 * which the caller's outer retry turns into a FRESH candidate — the one thing
 * 21 passes on the same candidate proved this loop must never do again.
 */
export async function repairUntilApproved(candidate, {
  review,
  repair,
  validate = async () => {},
  afterRepair = async () => {},
  isRetryableError = () => false,
  onRetryableError = async () => {},
  onRejectedRepair = async () => {},
  maxPasses = Number.POSITIVE_INFINITY,
  capDecider = decideAtCap,
} = {}) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate is required');
  if (typeof review !== 'function') throw new TypeError('review callback is required');
  if (typeof repair !== 'function') throw new TypeError('repair callback is required');

  const finishAtCap = (verdict, pass, cause) => {
    const decision = capDecider ? capDecider(verdict, pass) : { promote: false, reason: 'no cap decider' };
    if (decision?.promote) {
      return { candidate, verdict, pass, cappedPromotion: true, capReason: decision.reason };
    }
    const causeDetail = cause ? ` [${cause}]` : '';
    throw new Error(`Repair loop ended after ${pass} pass(es) without approval${causeDetail}: ${decision?.reason || 'not promotable'}`);
  };

  for (let pass = 1; ; pass++) {
    let verdict;
    try {
      verdict = await review(candidate, pass);
    } catch (error) {
      if (!isRetryableError(error)) throw error;
      await onRetryableError(error, { candidate, pass, phase: 'review' });
      pass -= 1;
      continue;
    }
    if (verdict?.approved === true) return { candidate, verdict, pass };
    if (pass >= maxPasses) return finishAtCap(verdict, pass, 'pass cap reached');

    const snapshot = structuredClone(candidate);
    try {
      await repair(candidate, verdict, pass);
      await validate(candidate, verdict, pass);
      await afterRepair(candidate, verdict, pass);
    } catch (error) {
      restoreCandidate(candidate, snapshot);
      if (error?.terminal) return finishAtCap(verdict, pass, error.message);
      if (isRetryableError(error)) {
        await onRetryableError(error, { candidate, pass, phase: 'repair' });
      } else {
        await onRejectedRepair(error, { candidate, pass, verdict });
      }
    }
  }
}
