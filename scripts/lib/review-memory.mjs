// Total Recall client for the theme generator's durable learning loop.
//
// Replaces the old pitfalls.json meta-learning, which WHOLESALE-REWROTE its
// rule file via a model call on every failed review cycle — observed going
// 20 rules → 0 → 1 within fifteen minutes of a single run. Lessons now live
// as append-only SSSS memory-vault nodes managed exclusively through the
// `total-recall` CLI (the repo's CLI-first mandate: the CLI owns schema
// validation, dedup/conflict detection, and surface compilation).
//
// Everything here is best-effort by contract: a memory failure must never
// block or fail a paid generation run. Reads return [], writes resolve false.
//
// Known CLI quirk this module exists to absorb: total-recall starts a vault
// filesystem watcher that holds the process open ~60s AFTER the answer has
// already printed. Every spawn is detached with a bounded wait — whatever
// stdout produced by the deadline IS the result, then the process group is
// terminated.

import { spawn } from 'node:child_process';

const CLI_TIMEOUT_MS = Math.max(5_000, Number(process.env.TR_CLI_TIMEOUT_MS) || 20_000);
const MAX_IMMEDIATE_WRITES_PER_RUN = 6;

/** Bounded, detached run of the total-recall CLI. Never rejects. */
export function runTotalRecall(args, { timeoutMs = CLI_TIMEOUT_MS, spawnImpl = spawn } = {}) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const settle = (result) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };
    let child;
    try {
      child = spawnImpl('npx', ['total-recall', ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
      });
    } catch (error) {
      settle({ ok: false, stdout, stderr: String(error), timedOut: false });
      return;
    }
    const timer = setTimeout(() => {
      // Watcher hold: the answer (if any) has printed by now. Reap the group.
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* already gone */ }
      settle({ ok: stdout.trim().length > 0, stdout, stderr, timedOut: true });
    }, timeoutMs);
    child.stdout?.on('data', (chunk) => { stdout += chunk; });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timer);
      settle({ ok: false, stdout, stderr: `${stderr}${error}`, timedOut: false });
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      settle({ ok: code === 0, stdout, stderr, timedOut: false });
    });
    child.unref();
  });
}

/** First JSON array/object embedded in CLI output (the CLI logs around it). */
export function extractJsonPayload(text) {
  const source = String(text || '');
  const candidates = [['[', ']'], ['{', '}']]
    .map(([open, close]) => ({ close, start: source.indexOf(open) }))
    .filter((candidate) => candidate.start !== -1)
    .sort((a, b) => a.start - b.start);
  for (const { close, start } of candidates) {
    const end = source.lastIndexOf(close);
    if (end <= start) continue;
    try {
      return JSON.parse(source.slice(start, end + 1));
    } catch { /* keep trying */ }
  }
  return null;
}

/**
 * Semantic recall of prior lessons for this project. Returns an array of
 * plain-text lesson strings (possibly empty — never throws).
 */
export async function recallLessons({ query, topK = 8, runner = runTotalRecall } = {}) {
  if (!query) return [];
  const result = await runner([
    'recall', query,
    '--project',
    '--format', 'json',
    '--top-k', String(Math.min(20, Math.max(1, topK))),
  ]);
  if (!result.stdout) return [];
  const payload = extractJsonPayload(result.stdout);
  const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.results) ? payload.results : []);
  return rows
    .map((row) => (typeof row === 'string' ? row : (row?.content || row?.text || row?.summary || '')))
    .map((text) => String(text).trim())
    .filter(Boolean)
    .slice(0, topK);
}

/** Append-only lesson write to the project brain. Resolves true on success. */
export async function rememberLesson({
  category = 'anti-pattern',
  content,
  tags = [],
  importance = 3,
  runner = runTotalRecall,
} = {}) {
  if (!content || !String(content).trim()) return false;
  const args = [
    'remember', category, String(content).trim(),
    '--importance', String(importance),
    '--project',
  ];
  if (tags.length) args.push('--tags', tags.join(','));
  const result = await runner(args);
  return result.ok || /memory node created/i.test(result.stdout);
}

/**
 * Format recalled lessons for prompt injection. Deliberately framed as
 * background: injecting past defect text as if it were current findings is
 * exactly the anchoring failure the reviewer contract forbids.
 */
export function formatLessonPack(lessons = [], { heading = 'LESSONS FROM PRIOR RUNS' } = {}) {
  const clean = lessons.map((lesson) => String(lesson).trim()).filter(Boolean);
  if (!clean.length) return '';
  return `\n${heading} (background from earlier generations — apply as guidance; these describe PAST runs, never re-report them as current findings):\n${clean.map((lesson) => `- ${lesson}`).join('\n')}\n`;
}

/**
 * Per-run lesson recorder: dedups by normalized content, caps immediate
 * writes, fires them without blocking the pipeline, and lets the run flush
 * (bounded) before exit so writes survive process teardown.
 */
export function createRunLessonRecorder({ runId = '', prompt = '', writer = rememberLesson } = {}) {
  const seen = new Set();
  const pending = [];
  let writes = 0;
  return {
    record(category, content, tags = []) {
      const text = String(content || '').trim();
      if (!text) return false;
      const key = text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 160);
      if (seen.has(key)) return false;
      seen.add(key);
      if (writes >= MAX_IMMEDIATE_WRITES_PER_RUN) return false;
      writes += 1;
      const context = [prompt && `brief: "${prompt}"`, runId && `run: ${runId}`].filter(Boolean).join('; ');
      pending.push(writer({
        category,
        content: context ? `${text} (${context})` : text,
        tags: ['generator', 'review-board', ...tags],
      }).catch(() => false));
      return true;
    },
    async flush() {
      const settled = await Promise.allSettled(pending);
      return settled.filter((entry) => entry.status === 'fulfilled' && entry.value === true).length;
    },
    get writeCount() { return writes; },
  };
}
