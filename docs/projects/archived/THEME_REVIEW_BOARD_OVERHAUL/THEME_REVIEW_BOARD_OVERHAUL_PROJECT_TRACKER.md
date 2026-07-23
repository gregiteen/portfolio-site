# THEME_REVIEW_BOARD_OVERHAUL — Project Tracker

> **Project Prefix**: `THEME_REVIEW_BOARD_OVERHAUL`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-20

---

## ✅ Phase 1: Loop bounds + mechanical gate

Goal: no generation can exceed 5 same-candidate repair passes or waste a pass on an empty repair.

- [x] `MAX_REPAIR_PASSES` cap (env `THEME_MAX_REPAIR_PASSES`, default 5) in [compile-theme.mjs](../../../../scripts/compile-theme.mjs)
- [x] `decideAtCap()` promote-vs-fail helper (env `THEME_PROMOTE_THRESHOLD`, default 7) in [theme-release.mjs](../../../../scripts/lib/theme-release.mjs)
- [x] Empty-repair detection: one rephrased retry per target, skipped-target logging, 2 consecutive no-progress passes → `terminal` error → immediate cap decision
- [x] Stagnation escalation via `createIssueLedger()`: fuzzy issue matching (overlap coefficient + plural stemming), escalated prompt on 2nd observation, dropped from blocking on 3rd
- [x] Mechanical artifact gate: [artifact-gate.mjs](../../../../scripts/lib/artifact-gate.mjs) scans layout templates + built pages pre-screenshot, short-circuits review with exact-string evidence
- [x] Unit tests: 7 gate tests in [artifact-gate.test.mjs](../../../../test/artifact-gate.test.mjs), 7 new cap/ledger/terminal tests in [theme-release.test.mjs](../../../../test/theme-release.test.mjs)

## ✅ Phase 2: Reviewer prompt contract v2

Goal: reviewer verdicts are evidence-bound, re-verified, and scoped.

- [x] Per-issue `evidence` field (required in schema, names screenshot + region) in [render-audit.mjs](../../../../scripts/render-audit.mjs); evidence-less blocking → demoted to minor by `sanitizeAuditVerdict()`
- [x] Carried-over issue re-verification: `priorIssues` fed into the prompt, `resolved_since_last_pass` required in schema, logged per pass in compile-theme
- [x] Scope contract: content volume, flipper bar, CNA banner, needs-new-content excluded in prompt AND enforced mechanically by `OUT_OF_SCOPE_BLOCKING` regex demotion
- [x] Filler-issue rejection: `sanitizeAuditVerdict()` drops "placeholder"/"TBD"/short-fragment issues outright (mechanical drop is stronger than a re-ask — no second vision call needed)
- [x] Regression fixtures: verbatim SPACE-incident issue texts (`" }` re-report, "only shows two cards", flipper-bar-as-debug, literal "placeholder") covered in [render-audit-sanitize.test.mjs](../../../../test/render-audit-sanitize.test.mjs); the live-reviewer screenshot check folds into Phase 4's droplet run

## ✅ Phase 3: Total Recall learning integration

Goal: lessons persist append-only across runs and are recalled into prompts; destructive pitfalls.json rewrites eliminated.

- [x] New [review-memory.mjs](../../../../scripts/lib/review-memory.mjs): `recallLessons`/`rememberLesson` via TR CLI, detached spawn + bounded wait (absorbs the ~60s vault-watcher hold), best-effort contract (reads → `[]`, writes → `false`, never blocks generation). Daemon `TR_API_URL` path deferred — CLI-only until the daemon's REST shape is verified against its source
- [x] Per-cycle deduped lesson writes via `createRunLessonRecorder` (normalized-content dedup, 6-write cap/run, fire-and-forget + bounded `flush()`): mechanical-gate hits, structural failures, unfixable-suppressed issues — tagged `slot:*`/`mechanical-gate`/`unfixable`/`structural`
- [x] Run-start recall (topK 8) merged with the now-READ-ONLY pitfalls.json seed into an immutable run-scoped lesson pack, injected into Director + CSS/layout specialist prompts. Deliberately NOT injected into the reviewer — past defect text in the reviewer prompt is the anchoring failure mode
- [x] Both destructive pitfalls.json full-rewrite blocks removed (they lived inline in [compile-theme.mjs](../../../../scripts/compile-theme.mjs), structural loop + review loop; orchestrator-brain.mjs was a static catalog and needed no change)
- [x] Run-end summarizer `summarizeRunLessons()`: ≤3 transferable lessons distilled from the full review history, written on approval, capped promotion, AND terminal failure (before staging teardown)

## ✅ Phase 3.5: Vision analyze-and-improve repair (scope added by Greg mid-project)

Goal: the repairer sees the same screenshots the reviewer judged, per the documented "analyze and improve" contract.

- [x] Structural repair loop bounded too (`THEME_MAX_STRUCTURAL_PASSES`, default 4) — found unbounded during live run 1, contradicting the generator skill's "bounded 2-pass" description
- [x] `renderAudit()` returns the pass's screenshots (base64, in-memory) with the verdict
- [x] Review-board repairs moved to a vision model (`THEME_REPAIR_MODEL`, default `anthropic/claude-fable-5`) with explicit ANALYZE (locate defect in pixels) → IMPROVE (write fix) prompt; mechanical-gate passes fall back to exact-string evidence
- [x] DeepSeek retained for generation fan-out, structural fixes, and lesson distillation (unbounded-volume, cheap work)

## ⏳ Phase 4: Verification & release

Goal: proven on live droplet runs, docs synced. (Required before moving to `completed/`.)

- [ ] Code-quality skill flow + `npm test` green
- [ ] `node scripts/serve.mjs` boots clean locally
- [ ] Deploy via /push → /deploy protocol
- [ ] Live run 1: ≤5 passes, no empty-repair re-review, no out-of-scope blockers, TR nodes written, pitfalls.json untouched mid-run
- [ ] Live run 2: recall injection from run 1 visible in prompt logs
- [ ] Update [generator SKILL.md](../../../../.claude/skills/generator/SKILL.md) (flow + Gotchas) and archive project

## Verification Log

- 2026-07-20: Diagnosis run — SPACE generation, 21 passes/3h38m; evidence captured in pm2 logs and Total Recall node `anti-patterns-4389b1ad`.
- 2026-07-20: Phase 1 — `node .agent/skills/code-quality/scripts/check-syntax.mjs` → 88 files, 0 errors; `npm run validate` → all conformance + 6/6 bundle checks passed; `npm test` → 66/66 pass (incl. 14 new Phase-1 tests).
- 2026-07-20: Phases 2+3 — syntax scan → 91 files, 0 errors; `npm run validate` → clean; `npm test` → 81/81 pass (8 new sanitize tests, 7 new review-memory tests). All CLI/network access in tests is injected; nothing spawns the real total-recall CLI.
