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
 * Keep one generated candidate alive until the rendered review approves it.
 * A rejected repair is rolled back in place, preserving candidate identity.
 */
export async function repairUntilApproved(candidate, {
  review,
  repair,
  validate = async () => {},
  afterRepair = async () => {},
  isRetryableError = () => false,
  onRetryableError = async () => {},
  onRejectedRepair = async () => {},
} = {}) {
  if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate is required');
  if (typeof review !== 'function') throw new TypeError('review callback is required');
  if (typeof repair !== 'function') throw new TypeError('repair callback is required');

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

    const snapshot = structuredClone(candidate);
    try {
      await repair(candidate, verdict, pass);
      await validate(candidate, verdict, pass);
      await afterRepair(candidate, verdict, pass);
    } catch (error) {
      restoreCandidate(candidate, snapshot);
      if (isRetryableError(error)) {
        await onRetryableError(error, { candidate, pass, phase: 'repair' });
      } else {
        await onRejectedRepair(error, { candidate, pass, verdict });
      }
    }
  }
}
