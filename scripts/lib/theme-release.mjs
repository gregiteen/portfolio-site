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
