# THEME_REVIEW_BOARD_OVERHAUL — Development Plan

> **Project Prefix**: `THEME_REVIEW_BOARD_OVERHAUL`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-20

---

Ordered by cost-of-inaction: the loop bounds and mechanical gate stop the money leak immediately; prompt contract stops anchoring; Total Recall integration makes it compound.

## Phase 1 — Stop the bleeding: loop bounds + mechanical gate

The SPACE run burned ~19 useless passes; these two changes make that impossible regardless of model behavior.

1. Add `MAX_REPAIR_PASSES` (default 5, env `THEME_MAX_REPAIR_PASSES`) to the same-candidate loop in `compile-theme.mjs`; at cap, decide promote-vs-fail via a new pure helper in `theme-release.mjs` (`decideAtCap({score, blocking})`, threshold default 7, env `THEME_PROMOTE_THRESHOLD`). Terminal failure keeps today's fail-closed cleanup; `runUntilApproved()` then starts a fresh candidate.
2. Empty-repair detection: byte-floor + section-parse check on every repair response; one rephrase-retry then the pass is marked failed. Log line must say `repair response EMPTY — pass counted as failed` so it's greppable.
3. Stagnation escalation: issue key (`slot + normalized summary`) surviving 2 passes → single full-section vision-aware rewrite; surviving that → drop from blocking (recorded for Phase 3 to persist).
4. Mechanical artifact gate after every build: scan visible HTML for `{{…}}`, orphan `"}` / `{"` / `",` fragments, and fence leakage; on hit, skip screenshots/review and go straight to targeted repair with exact-string evidence.
5. Unit tests for all pure pieces (gate scanner, empty detection, `decideAtCap`).

## Phase 2 — Honest reviewer: prompt contract v2

1. Verdict schema: add per-issue `{page, viewport, region}` evidence; demote evidence-less issues to minor.
2. Carried-over re-verification: prior verdict passed in a separate section; require `resolved_since_last_pass`; forbid verbatim re-reporting.
3. Scope contract: hard-exclude content volume, flipper bar, CNA banner, and "needs new content" issues from blocking severity.
4. Reject filler ("placeholder") issues — one re-ask, then drop.
5. Regression check: re-run the reviewer against the archived SPACE pass-20 screenshots (saved in scratchpad/tmp) and confirm the `" }` issue is *not* re-reported and content-volume is not blocking.

## Phase 3 — Total Recall integration (durable learning)

1. Build `scripts/lib/review-memory.mjs`: `recallLessons` / `rememberLesson` via `npx total-recall` (CLI-first mandate), detached spawn with bounded wait (watcher-hang mitigation), optional `TR_API_URL` daemon path for the droplet; best-effort — errors return `[]`/no-op, never block generation.
2. Write path: dedup-keyed lesson writes per review cycle (`anti-pattern`/`pattern`, tags `slot:*`, `class:*`, `outcome:*`, `run:*`).
3. Read path: run-start `recallLessons` per prompt slot → immutable run-scoped lesson pack injected into Director/CSS/layout/reviewer/repairer prompts as clearly-marked background (anti-anchoring phrasing).
4. Retire the destructive rewrite: remove the `pitfalls.json` full-rewrite call from `orchestrator-brain.mjs`; keep at most a read-only compiled surface generated at run start.
5. Run-end summarizer (success *and* terminal failure): ≤3 lessons → project brain.

## Phase 4 — Verification & release

1. Full local gates: `node .agent/skills/code-quality` scripts flow + `npm test` (33+ suite) green.
2. Boot check: `node scripts/serve.mjs` starts clean locally (never deploy on a SyntaxError).
3. Deploy to droplet via `/push` → `/deploy` skill protocol.
4. Live generation run on the droplet with a fresh prompt; verify from `pm2` logs: pass count ≤5, no empty-repair re-reviews, no out-of-scope blockers, TR lesson nodes written, `pitfalls.json` untouched mid-run.
5. Second live run (different prompt); confirm recall injection appears in prompt logs (lessons from run 1 visible to run 2).
6. Update `.claude/skills/generator/SKILL.md` (flow description + Gotchas: pitfalls.json paragraph) and archive the project per the global skill.

## Risks

- **TR CLI latency/hang** (known ~60s watcher hold): mitigated by detached spawn + deadline; worst case learning is skipped, generation unaffected.
- **Over-strict reviewer contract** could suppress real defects: evidence demotion only downgrades to minor, never deletes; monitored during Phase 4 live runs.
- **Cap-induced quality drop:** promote-above-threshold requires score ≥7 *and* zero valid blockers — same bar the SPACE run eventually met at pass 21, now enforced cheaply.
