/**
 * Unit tests for the Total Recall client used by the theme generator
 * (scripts/lib/review-memory.mjs). All network/CLI access is injected —
 * nothing here spawns the real total-recall CLI.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createRunLessonRecorder,
  extractJsonPayload,
  formatLessonPack,
  recallLessons,
  rememberLesson,
} from '../scripts/lib/review-memory.mjs';

test('extractJsonPayload finds JSON embedded in noisy CLI output', () => {
  assert.deepEqual(
    extractJsonPayload('⏳ searching...\n[{"content":"lesson one"}]\n✅ done'),
    [{ content: 'lesson one' }],
  );
  assert.deepEqual(extractJsonPayload('{"results":[]} trailing'), { results: [] });
  assert.equal(extractJsonPayload('no json here'), null);
  assert.equal(extractJsonPayload(''), null);
});

test('recallLessons normalizes result rows and never throws', async () => {
  const lessons = await recallLessons({
    query: 'theme pitfalls',
    topK: 2,
    runner: async () => ({
      ok: true,
      stdout: 'log line\n[{"content":"Always bound repair passes"},{"text":"Treat empty repairs as failures"},{"content":"a third lesson"}]',
    }),
  });
  assert.deepEqual(lessons, ['Always bound repair passes', 'Treat empty repairs as failures']);
});

test('recallLessons returns [] on CLI failure, empty output, or missing query', async () => {
  assert.deepEqual(await recallLessons({ query: 'x', runner: async () => ({ ok: false, stdout: '' }) }), []);
  assert.deepEqual(await recallLessons({ query: 'x', runner: async () => ({ ok: true, stdout: 'not json' }) }), []);
  assert.deepEqual(await recallLessons({ runner: async () => { throw new Error('must not be called'); } }), []);
});

test('rememberLesson builds CLI-first args and reports success', async () => {
  let seenArgs;
  const ok = await rememberLesson({
    category: 'anti-pattern',
    content: 'Empty repair responses must count as failed passes',
    tags: ['generator', 'review-board'],
    runner: async (args) => { seenArgs = args; return { ok: true, stdout: '✅ Permanent SSSS memory node created' }; },
  });
  assert.equal(ok, true);
  assert.equal(seenArgs[0], 'remember');
  assert.equal(seenArgs[1], 'anti-pattern');
  assert.ok(seenArgs.includes('--project'));
  assert.ok(seenArgs.includes('--tags'));
  assert.equal(await rememberLesson({ content: '', runner: async () => ({ ok: true, stdout: '' }) }), false);
});

test('formatLessonPack frames lessons as background and handles empty input', () => {
  assert.equal(formatLessonPack([]), '');
  const pack = formatLessonPack(['Bound the loop', '  ', 'Verify evidence']);
  assert.match(pack, /LESSONS FROM PRIOR RUNS/);
  assert.match(pack, /never re-report them as current findings/);
  assert.match(pack, /- Bound the loop\n- Verify evidence/);
});

test('run lesson recorder dedups near-identical content and caps writes', async () => {
  const written = [];
  const recorder = createRunLessonRecorder({
    runId: 'space',
    prompt: 'SPACE',
    writer: async (entry) => { written.push(entry); return true; },
  });

  assert.equal(recorder.record('anti-pattern', 'Stray template syntax next to project cards', ['slot:home']), true);
  // Same content modulo punctuation/case → deduped.
  assert.equal(recorder.record('anti-pattern', 'Stray template syntax, next to PROJECT cards!', ['slot:home']), false);
  for (let i = 0; i < 10; i++) recorder.record('anti-pattern', `distinct lesson number ${i}`, []);

  const flushed = await recorder.flush();
  assert.equal(recorder.writeCount, 6); // capped
  assert.equal(flushed, 6);
  assert.match(written[0].content, /brief: "SPACE"; run: space/);
  assert.ok(written[0].tags.includes('generator'));
  assert.ok(written[0].tags.includes('slot:home'));
});

test('run lesson recorder survives a writer that rejects', async () => {
  const recorder = createRunLessonRecorder({
    writer: async () => { throw new Error('vault offline'); },
  });
  recorder.record('anti-pattern', 'some lesson content here', []);
  const flushed = await recorder.flush();
  assert.equal(flushed, 0);
});
