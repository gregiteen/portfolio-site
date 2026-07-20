# THEME_REVIEW_BOARD_OVERHAUL — Architecture

> **Project Prefix**: `THEME_REVIEW_BOARD_OVERHAUL`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-20

---

## Current flow (relevant slice)

```
compile-theme.mjs
  └─ review board (parallel): render-audit.mjs (Playwright screenshots + vision review)
       └─ blocking issues → vision-aware repair loop (same candidate, UNBOUNDED passes)
            ├─ per-slot DeepSeek repair calls (0KB responses accepted silently)
            ├─ rebuild via build-site.mjs → re-screenshot → re-review
            └─ orchestrator-brain.mjs meta-learning → DESTRUCTIVE pitfalls.json rewrite
```

## Target flow

```
compile-theme.mjs
  ├─ [NEW] mechanical artifact gate (post-build, pre-screenshot)
  │     static scan of built HTML for leaked template/JSON syntax
  │     → fails route straight to targeted repair with exact-string evidence
  ├─ review board: render-audit.mjs
  │     [CHANGED] reviewer prompt contract v2 (evidence, re-verification, scope)
  │     [NEW] recall-injection: top-K Total Recall lessons per prompt slot
  └─ repair loop (same candidate)
        [CHANGED] hard pass cap + stagnation escalation + promote-above-threshold
        [CHANGED] empty-repair detection (failed pass + one rephrase-retry)
        [CHANGED] learning writes append-only TR nodes; pitfalls.json rewrite removed
  run end (success OR terminal failure)
        [NEW] summarizer distills ≤3 lessons → total-recall remember (project brain)
```

## Components

### 1. `scripts/lib/review-memory.mjs` (new)

Thin client over Total Recall, honoring the CLI-first mandate:

- `recallLessons({ slot, tags, topK })` → spawns `npx total-recall recall "<query>" --project --format json -k <K>`; parses JSON; returns `[]` on any error (learning is best-effort, never blocks generation).
- `rememberLesson({ category, content, tags, importance })` → spawns `npx total-recall remember …` **detached with a bounded wait** (the CLI's vault watcher holds the process ~60s after output; we must not inherit that stall — `child.unref()` after first stdout line or a 15s deadline).
- On the droplet, an env switch (`TR_API_URL`) may use the daemon REST API instead of spawning the CLI; identical interface either way.
- No direct filesystem access to `memory-vault/` — ever.

### 2. Reviewer prompt contract v2 (`render-audit.mjs`)

Structured verdict schema additions:

- **Evidence requirement:** each issue must carry `{ page, viewport, region }` naming the screenshot it is visible in. Issues without evidence are demoted to minor.
- **Carried-over re-verification:** the previous verdict is passed in a distinct section with the instruction: *for each prior issue, first decide `still_present | resolved` against the CURRENT screenshots; output a `resolved_since_last_pass` list.* Prior issue text may not be copied into new issues verbatim.
- **Scope contract (hard exclusions, cannot be blocking):**
  - content volume / number of cards (portfolio has few projects/designs by fact);
  - the prev/next design flipper bar and CNA banner (mechanically injected site chrome, see `build-site.mjs`);
  - anything requiring new content rather than CSS/layout change.
- **Format hygiene:** literal filler like "placeholder" is rejected → one re-ask, then the issue is dropped.
- Recall-injected lessons appear as a short "known pitfalls for this slot" block, clearly marked as background, not as issues to re-report (anti-anchoring phrasing).

### 3. Repair-loop bounds (`compile-theme.mjs`)

- `MAX_REPAIR_PASSES` (default **5**, env-overridable).
- **Empty-repair detection:** response `< MIN_REPAIR_BYTES` or failing section-parse ⇒ failed pass; one retry with a rephrased prompt (and the failure noted); second failure ⇒ pass consumed, move on.
- **Stagnation escalation:** the same issue key (`slot + normalized summary`) surviving 2 consecutive passes escalates once to a full-section rewrite (still vision-aware, still same candidate); if it survives that, it is recorded to TR as `unfixable-by-repair` and stops counting as blocking.
- **Promote-above-threshold:** at the cap, promote if `score ≥ PROMOTE_THRESHOLD` (default 7) and no *valid* blocking issues remain; otherwise terminal failure (fail-closed cleanup as today). `runUntilApproved()`'s outer retry then generates a *fresh* candidate rather than grinding the old one.

### 4. Learning subsystem (replaces destructive `pitfalls.json` rewrites)

- **Write path:** after each review cycle, genuinely *new* findings (deduped by issue key against this run's already-written nodes) are appended via `rememberLesson` as `anti-pattern` (defect classes) or `pattern` (approaches that fixed them), tagged: `slot:<layout-key>`, `class:<issue-class>`, `outcome:<fixed|unfixable|false-positive>`, `run:<run_id>`.
- **Read path:** at run start, one `recallLessons` per prompt slot (Director, CSS owner, each layout specialist, reviewer, repairer) builds an in-memory, run-scoped lesson pack. **Never mutated mid-run** — this alone removes the 20→0 rules failure mode.
- **Run-end summarizer:** one model call over the run's review history distills ≤3 durable lessons → `rememberLesson(--project)`. Runs on success *and* terminal failure (failures teach the most).
- `pitfalls.json` + its rewrite call in `orchestrator-brain.mjs` are retired; if a file surface is still wanted, it becomes a read-only artifact compiled *from* TR recall at run start.

### 5. Mechanical artifact gate (new, in `compile-theme.mjs` after each build)

Deterministic scan of built HTML (visible text only — `<script>`/`<style>` excluded):

- unresolved `{{…}}` placeholders;
- orphan JSON/template fragments (`"}`, `",`, `{"` patterns in text nodes);
- raw markdown fence leakage (```) in rendered output.

Failure short-circuits straight to targeted repair with the exact string, file, and line as evidence — no screenshot or review call spent. (The `" }` defect that cost 19 passes would have been caught here on pass 0.)

## SSSS compliance

| State | Where it lives |
|---|---|
| Durable lessons (patterns/anti-patterns) | Total Recall SSSS memory-vault nodes, via CLI/daemon only |
| Run lifecycle (status, scores, pass count telemetry) | `generation_run` docs via `runtime-store.mjs` (`vault/runtime/runs/`) |
| Run-scoped lesson pack / verdict history | In-memory only; summarized to TR at run end |
| Retired | `pitfalls.json` as a mutable store |

## Files touched

- `scripts/compile-theme.mjs` — loop bounds, empty-repair detection, mechanical gate, learning hooks
- `scripts/render-audit.mjs` — reviewer prompt contract v2, verdict schema
- `scripts/lib/orchestrator-brain.mjs` — remove destructive rewrite; delegate to review-memory
- `scripts/lib/review-memory.mjs` — **new** TR client
- `scripts/lib/theme-release.mjs` — promote-above-threshold helper (pure, unit-testable)
- `test/theme-utils.test.mjs` (or new test file) — unit tests for gate scan, empty-repair detection, pass-cap/promotion decisions
