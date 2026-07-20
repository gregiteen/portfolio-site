import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createIssueLedger,
  decideAtCap,
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

test('decideAtCap promotes a clean candidate at threshold and rejects everything else', () => {
  assert.equal(decideAtCap({ score: 7, blocking: [] }).promote, true);
  assert.equal(decideAtCap({ score: 8, blocking: [] }).promote, true);
  assert.equal(decideAtCap({ score: 6, blocking: [] }).promote, false);
  assert.equal(decideAtCap({ score: 9, blocking: [{ target: 'home', issue: 'broken' }] }).promote, false);
  assert.equal(decideAtCap({}).promote, false);
  assert.equal(decideAtCap({ score: 6, blocking: [] }, { threshold: 6 }).promote, true);
});

test('repair loop caps passes and promotes a clean-enough candidate', async () => {
  const reviews = [];
  const result = await repairUntilApproved({ id: 'capped' }, {
    maxPasses: 3,
    review(_c, pass) {
      reviews.push(pass);
      // Never approved by the reviewer, but clean and high-scoring.
      return { approved: false, score: 8, blocking: [], issues: [] };
    },
    repair() {},
  });
  assert.deepEqual(reviews, [1, 2, 3]);
  assert.equal(result.cappedPromotion, true);
  assert.equal(result.pass, 3);
});

test('repair loop caps passes and fails a candidate with blocking issues', async () => {
  await assert.rejects(
    repairUntilApproved({ id: 'doomed' }, {
      maxPasses: 2,
      review: () => ({ approved: false, score: 4, blocking: [{ target: 'home', issue: 'stray "}' }], issues: [] }),
      repair() {},
    }),
    /Repair loop ended after 2 pass\(es\)/,
  );
});

test('a terminal repair error ends the loop immediately via the cap decision', async () => {
  let reviewCalls = 0;
  const result = await repairUntilApproved({ id: 'no-progress' }, {
    maxPasses: 10,
    review() {
      reviewCalls += 1;
      return { approved: false, score: 7, blocking: [], issues: [] };
    },
    repair() {
      throw Object.assign(new Error('no usable repair output'), { terminal: true });
    },
  });
  // Clean + at threshold → terminal error promotes instead of burning passes.
  assert.equal(result.cappedPromotion, true);
  assert.equal(reviewCalls, 1);
});

test('a terminal repair error fails a dirty candidate immediately', async () => {
  await assert.rejects(
    repairUntilApproved({ id: 'no-progress-dirty' }, {
      maxPasses: 10,
      review: () => ({ approved: false, score: 3, blocking: [{ target: 'css', issue: 'bad' }], issues: [] }),
      repair() {
        throw Object.assign(new Error('no usable repair output'), { terminal: true });
      },
    }),
    /no usable repair output/,
  );
});

test('issue ledger escalates a persistent issue, then suppresses it, despite paraphrasing', () => {
  const ledger = createIssueLedger();
  const phrasings = [
    'Stray literal text fragments reading " } appear floating next to each project card on the home page feed',
    'The same stray " } text artifact appears floating next to every project card, appearing as leftover template syntax',
    'Stray raw text fragments reading exactly " } appear next to the project cards and read as leaked template syntax',
  ];

  const first = ledger.observe([{ target: 'home', issue: phrasings[0] }]);
  assert.equal(first.repairable.length, 1);
  assert.equal(first.repairable[0].escalate, undefined);
  assert.equal(first.suppressed.length, 0);

  const second = ledger.observe([{ target: 'home', issue: phrasings[1] }]);
  assert.equal(second.repairable.length, 1);
  assert.equal(second.repairable[0].escalate, true);

  const third = ledger.observe([{ target: 'home', issue: phrasings[2] }]);
  assert.equal(third.repairable.length, 0);
  assert.equal(third.suppressed.length, 1);
});

test('issue ledger keeps distinct issues and targets independent', () => {
  const ledger = createIssueLedger();
  const cardIssue = { target: 'home', issue: 'Stray template syntax floating next to project cards on the home feed' };
  const navIssue = { target: 'css', issue: 'Primary navigation wraps awkwardly on mobile leaving CONTACT isolated on its own line' };

  const first = ledger.observe([cardIssue, navIssue]);
  assert.equal(first.repairable.length, 2);
  assert.equal(first.suppressed.length, 0);

  // Same nav issue again, but the card issue was fixed: only nav escalates.
  const second = ledger.observe([navIssue]);
  assert.equal(second.repairable.length, 1);
  assert.equal(second.repairable[0].escalate, true);
  assert.equal(second.repairable[0].target, 'css');
});
