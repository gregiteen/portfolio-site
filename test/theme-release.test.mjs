import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generationRetryDecision,
  generationRetryDelay,
  isRetryableGenerationFailure,
  repairUntilApproved,
} from '../scripts/lib/theme-release.mjs';

test('generation retry delay is exponential and capped', () => {
  assert.equal(generationRetryDelay(1), 2_000);
  assert.equal(generationRetryDelay(5), 32_000);
  assert.equal(generationRetryDelay(20), 60_000);
});

test('retryable generation infrastructure failures do not exhaust by default', () => {
  assert.deepEqual(
    generationRetryDecision(1, 'Visual review rejected the theme'),
    {
      retry: true,
      retryable: true,
      exhausted: false,
      delayMs: 2_000,
    },
  );
  assert.deepEqual(
    generationRetryDecision(50, 'Transient provider failure'),
    {
      retry: true,
      retryable: true,
      exhausted: false,
      delayMs: 60_000,
    },
  );
});

test('configuration and code failures stop immediately', () => {
  const failures = [
    'OPENROUTER_API_KEY is missing from Total Recall',
    'GOOGLE_API_KEY is not set',
    'Gemini API error: {"code": 401, "status": "UNAUTHENTICATED"}',
    'ReferenceError: retryGeneration is not defined',
    'spawn failed: ENOENT',
  ];

  for (const failure of failures) {
    assert.equal(isRetryableGenerationFailure(failure), false, failure);
    assert.deepEqual(
      generationRetryDecision(1, failure),
      {
        retry: false,
        retryable: false,
        exhausted: false,
        delayMs: 0,
      },
      failure,
    );
  }
});

test('one candidate survives beyond three rejected reviews and is eventually approved', async () => {
  const candidate = { id: 'one-candidate', revision: 0 };
  const identities = [];
  const reviews = [];

  const result = await repairUntilApproved(candidate, {
    review(current, pass) {
      identities.push(current);
      reviews.push(pass);
      return { approved: pass === 5, issues: pass === 5 ? [] : ['repair'] };
    },
    repair(current) {
      identities.push(current);
      current.revision += 1;
    },
  });

  assert.equal(result.candidate, candidate);
  assert.equal(result.pass, 5);
  assert.equal(candidate.revision, 4);
  assert.deepEqual(reviews, [1, 2, 3, 4, 5]);
  assert.ok(identities.every((identity) => identity === candidate));
});

test('invalid repair rolls back in place and retries the same candidate', async () => {
  const candidate = { id: 'one-candidate', css: 'approved-base' };
  let repairs = 0;
  let rejected = 0;

  const result = await repairUntilApproved(candidate, {
    review(current) {
      return { approved: current.css === 'valid-repair' };
    },
    repair(current) {
      repairs += 1;
      current.css = repairs === 1 ? 'invalid-repair' : 'valid-repair';
    },
    validate(current) {
      if (current.css === 'invalid-repair') throw new Error('invalid CSS');
    },
    onRejectedRepair(error, { candidate: current }) {
      rejected += 1;
      assert.match(error.message, /invalid CSS/);
      assert.equal(current, candidate);
      assert.equal(current.css, 'approved-base');
    },
  });

  assert.equal(result.candidate, candidate);
  assert.equal(candidate.css, 'valid-repair');
  assert.equal(repairs, 2);
  assert.equal(rejected, 1);
});

test('retryable review errors retain the same candidate and same pass', async () => {
  const candidate = { id: 'one-candidate' };
  let reviewCalls = 0;
  let retryCalls = 0;

  const result = await repairUntilApproved(candidate, {
    review(current, pass) {
      reviewCalls += 1;
      assert.equal(current, candidate);
      assert.equal(pass, 1);
      if (reviewCalls === 1) throw Object.assign(new Error('provider timeout'), { status: 503 });
      return { approved: true };
    },
    repair() {
      throw new Error('repair should not run');
    },
    isRetryableError(error) {
      return error.status === 503;
    },
    onRetryableError(_error, context) {
      retryCalls += 1;
      assert.equal(context.candidate, candidate);
    },
  });

  assert.equal(result.candidate, candidate);
  assert.equal(reviewCalls, 2);
  assert.equal(retryCalls, 1);
});
