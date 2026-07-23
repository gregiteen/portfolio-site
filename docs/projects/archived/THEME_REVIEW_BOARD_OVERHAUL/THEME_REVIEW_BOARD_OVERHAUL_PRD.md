# THEME_REVIEW_BOARD_OVERHAUL — PRD

> **Project Prefix**: `THEME_REVIEW_BOARD_OVERHAUL`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-20

---

## Problem

The theme generator's review board (`compile-theme.mjs` → `render-audit.mjs` → same-candidate repair loop) is functionally unbounded and learns nothing durable. Evidence from the 2026-07-20 "SPACE" run (Total Recall node `anti-patterns-4389b1ad`):

1. **Unbounded repair loop.** Since commit `8faf5e2` ("Keep generated designs alive until review approval") the same-candidate repair loop has no pass cap. The SPACE run took **21 passes / 3h38m** for a pipeline whose wait page promises 2–4 minutes.
2. **Empty repairs treated as success.** Roughly half the DeepSeek repair responses were 0KB. The loop rebuilt and re-reviewed the identical page anyway — passes 1–19 burned paid calls making no progress.
3. **Reviewer anchoring.** The reviewer re-reported a fixed defect (the `" }` template artifact) in near-identical wording for 19 passes, and once emitted a literal `[minor] home: placeholder` issue — pattern-matching its own expected output format rather than describing the fresh screenshots.
4. **False-positive blockers.** The reviewer blocks on issues that are content-determined or mechanically injected and therefore unfixable by CSS/layout repair: "Designs index only shows two cards" (only 2 designs exist) and the prev/next flipper bar flagged as "leftover debug element" (it is permanent site chrome).
5. **Destructive learning.** `pitfalls.json` is wholesale-rewritten by a meta-learning call every cycle; during the SPACE run it went 20 rules → 20 → **0** → 1 within 15 minutes. Learning does not survive within a run, let alone across runs (three separate SPACE attempts shared zero knowledge).

Each review cycle costs 4–6 paid OpenRouter/Gemini calls (~2 min), so non-convergence is a direct money leak and a visitor-facing embarrassment (196-minute wait page).

## Goals

- **G1 — Bounded convergence.** A generation either promotes or terminally fails within a hard cap of same-candidate repair passes (default 5). Typical runs converge in ≤3 passes.
- **G2 — No wasted passes.** An empty/unusable repair response is detected and counted as a failed pass (with one bounded rephrase-retry), never silently re-reviewed.
- **G3 — Honest reviews.** Carried-over issues must be re-verified against the fresh screenshots; every blocking issue names the screenshot and region it appears in; out-of-scope subjects (content volume, injected chrome) cannot block.
- **G4 — Durable, append-only learning.** Review lessons persist as Total Recall SSSS memory nodes (append-only, tagged, semantically recallable) and are injected into the relevant prompt slots on subsequent runs. `pitfalls.json` destructive rewrites are eliminated.
- **G5 — Mechanical gates before vision.** Deterministically detectable defects (leaked template syntax, orphan JSON fragments in visible HTML) are caught by a static post-build scan before any screenshot or review call is spent.

## Non-Goals

- Changing the Director / image-generation stages (they were not implicated).
- Swapping reviewer or repairer models (prompt/loop mechanics first; model choice is orthogonal).
- Reviving the legacy text-only `improve-theme.mjs` path (confirmed anti-pattern; stays opt-in/legacy).
- Building a UI for the learning memory (CLI/daemon access is sufficient).

## Success Metrics

- Next 3 live generation runs each promote or fail in ≤5 repair passes (log-verifiable).
- Zero passes triggered by an empty repair response reaching re-review.
- Zero blocking issues raised about content volume or injected chrome in those runs.
- ≥1 Total Recall lesson node written per completed run; recall injection visible in prompt logs.
- `pitfalls.json` is no longer rewritten mid-run (file becomes a compiled read-only surface or is retired).

## Constraints

- **SSSS compliance:** all persistent learning state lives as SSSS memory-vault nodes managed via the `total-recall` CLI (or its daemon REST API on the droplet) — never hand-written JSON/YAML state files. Run-scoped state stays in `generation_run` docs via `runtime-store.mjs`.
- The `total-recall` CLI's vault watcher holds the process open ~60s after output; the pipeline client must spawn it detached / with a bounded wait so generation is never blocked on it.
- Vision-aware repair (screenshots into the repair prompt) is a hard invariant — do not regress it (see generator skill Gotchas).
- All quality gates (`npm test`, code-quality skill scripts) stay green; heavy verification runs on the droplet, not the laptop.
