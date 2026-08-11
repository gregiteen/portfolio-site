# GENERATIVE_DESIGN_STUDIO — Development Plan

> **Project Prefix**: `GENERATIVE_DESIGN_STUDIO`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Sequencing rationale

Phases are ordered by **dependency and evidence**, not by excitement.

Phase 0 is first because it is time-critical (the `/tmp` corpus starts deleting in ~2 days) and because **every later phase needs it to prove it worked**. Shipping archetypes without an evidence corpus means judging "is this more distinctive?" on vibes — exactly the failure mode the `project-management` skill warns against.

Phase 1 (archetypes) precedes Phase 2 (capabilities) because structure without behaviour is still a real improvement, while behaviour bolted onto one fixed skeleton is polish on a template.

Phase 3 (tournament) comes after 1 and 2 because a tournament is only meaningful once candidates have a genuinely wide space to diverge within — running it against today's contract would just pick between three shades of the same page.

Each phase is independently shippable and leaves the pipeline green.

---

## Phase 0 — Evidence corpus (foundation, time-critical)

**Goal:** never lose a pass again, and rescue what is about to be lost.

1. **Rescue first.** `rsync` the 45 `/tmp/render-audit-*.jpeg` files off the droplet into the repo before they age out (`q /tmp … 10d`; files dated Jul 22–23). Includes `minimalist-japanese-zen-garden-raked-san` — the only surviving record of a rejected generation.
2. Define `design_evidence` and `design_critique` SSSS types; register them and confirm portability classes (`tenant_private`) via `npx ssss help portability`.
3. Build `scripts/lib/evidence-store.mjs` — writes through the Operation Contract, never `fs.writeFileSync` for state.
4. Rewrite the `render-audit.mjs` persistence block: key on `(runId, pass, label)`, store the verdict alongside the screenshots, and **stop swallowing write errors** (`.catch(() => {})` → warn).
5. Thread `runId`/`pass` from `compile-theme.mjs` into `renderAudit()`.
6. Retention + pruning as an SSSS operation with a documented policy.

**Exit:** a multi-pass run leaves one `design_evidence` doc per pass, each joining screenshots to the verdict that judged them. A fail-closed rejection still leaves its full evidence trail.

---

## Phase 1 — Composition archetypes

**Goal:** structure becomes a design decision.

1. Define the `composition_archetype` type (`structural`). Author the 5 seed documents; `default-editorial` must reproduce today's 10-slot behaviour **byte-identically** — it is the regression anchor.
2. `scripts/lib/archetypes.mjs`: load, validate, and enforce the anti-degeneracy rule (distinct `nav_model` + ≥1 unique invariant) as a conformance test over the registry.
3. Parameterise `validateThemePayload` on a slot vocabulary instead of the module-level `LAYOUT_SPECS` constant. Keep the existing signature working for `default-editorial` so current tests stay meaningful.
4. Director prompt + `DIRECTOR_SCHEMA` gain archetype selection with a justification field.
5. Archetype-scope the specialist fan-out (`runSpecialistFanOut` iterates the archetype's slots).
6. `build-site.mjs` renders any archetype's slot set.
7. Resolve open question 3 (`scopeCss` revival) with a decision recorded in the architecture doc.

**Exit:** two designs generated from different archetypes differ structurally in their built HTML, not only in CSS. `default-editorial` output is unchanged from baseline.

---

## Phase 2 — Motion & interaction capabilities

**Goal:** behaviour becomes possible, declared, and bounded.

1. Define the `motion_capability` type (`structural`).
2. Author 6 reviewed implementation modules under `scripts/lib/capabilities/`. Every module honours `prefers-reduced-motion` — non-negotiable, and asserted by unit test, not by review.
3. Replace blanket script-stripping with declare-and-allowlist in `validateThemePayload`: declared+known ⇒ inject repo module; undeclared ⇒ strip (unchanged); unknown id ⇒ **build error**.
4. `build-site.mjs` injects capability modules in place of the single hardcoded scroll-reveal script. The existing mechanical CNA-banner injection is untouched.
5. Add perf capture to `render-audit.mjs`; exceeding a declared budget is a blocking issue with automatic evidence.
6. CSP on design routes; confirm no capability reaches an external host.

**Exit:** a design declaring `lateral-scroll-snap` ships working lateral scroll; a design declaring nothing is byte-identical to Phase 1 output; an undeclared script is still stripped; an unknown capability id fails the build.

> **Security gate:** this phase changes what executes in a visitor's browser. It does not merge without the `security` skill's review of the capability loader and CSP.

---

## Phase 3 — Tournament generation

**Goal:** divergence replaces convergence-toward-safe.

1. `THEME_TOURNAMENT_N` (default 3, env-capped). N=1 must reproduce today's single-candidate path exactly — the escape hatch and the regression anchor.
2. Director emits N plans; **enforce distinct archetypes mechanically**, not by prompt.
3. Cheap parallel render of each candidate (low-res, no vision repair).
4. Judge panel on the cheap model → `design_critique` per candidate, including the losers.
5. Winner enters the existing vision repair loop unchanged.
6. Cost telemetry into `generation_run`; verify the N-way fan-out stays within the wait-page budget.

**Exit:** a run produces N structurally distinct candidates, records a critique for each, and promotes one. N=1 is indistinguishable from pre-phase behaviour.

---

## Phase 4 — Distinctiveness gate

**Goal:** "looks templated" becomes a blocking, evidenced score.

1. Build the reference corpus (extend `design-exemplars.mjs`, which currently feeds generation only).
2. `scripts/lib/distinctiveness.mjs` — judge on `THEME_DISTINCTIVENESS_MODEL`, **required to differ from the generator model**.
3. Every rejection cites a concrete comparison, reusing the `evidence`-required contract `sanitizeAuditVerdict()` already enforces.
4. Wire as a parallel dimension to the correctness audit — *not* inside it; the correctness reviewer stays conservative by design.
5. Thresholds: <7 blocks; 7–8 promotes with a flag on the run doc.
6. Feed scores back into `review-memory.mjs` so lessons accumulate in Total Recall.

**Exit:** a deliberately bland candidate scores <7 and is blocked with a citation. A strong candidate passes. Scores land in the evidence corpus.

---

## Phase 5 — On-demand improvement

**Goal:** improve a shipped design without regenerating it.

1. `scripts/improve-design.mjs <slug>` — rebuild to staging, run the **vision** audit + repair loop, promote atomically or roll back.
2. Feed prior `design_evidence` in as `priorIssues` (already supported by `render-audit.mjs`'s re-verification section).
3. Delete legacy `improve-theme.mjs` and its `ENABLE_LEGACY_THEME_IMPROVER` gate. Per user preference: **delete outright rather than deferring** — it is a known-broken text-only path superseded by this entry point.
4. Expose via `serve.mjs` behind admin auth.

**Exit:** improving a shipped design raises its distinctiveness score without a full regeneration, and a failed improvement leaves the live design untouched.

---

## Phase 6 — Verification & release

Per the repo's definition of done, plus this project's specifics. See the tracker for the checklist — every item is binary and must be evidenced in the Verification Log.

Key gates:
- `npm test` green; `npm run validate` (`ssss conformance --engine`) green.
- Export round-trip proves archetypes/capabilities **present** and evidence/critiques **absent** in a `sale` bundle.
- `node scripts/serve.mjs` boots clean natively before any deploy (never blind-deploy).
- Two live generation runs on the droplet, both within the pass cap.
- Trademark gate proven against the known-bad case: the prompt "LEGOS" must not produce a LEGO® mark.
- `/push` → `/deploy` protocol; `generator` SKILL.md rewritten before archival.

---

## Rollout & flags

Every phase lands behind a flag defaulting to today's behaviour:

| Flag | Default | Phase |
|---|---|---|
| `THEME_ARCHETYPES` | `0` | 1 |
| `THEME_CAPABILITIES` | `0` | 2 |
| `THEME_TOURNAMENT_N` | `1` | 3 |
| `THEME_DISTINCTIVENESS` | `0` | 4 |

Flags are stripped once a phase is verified stable — that cleanup is tracked work, not indefinite debt.

## Dependencies & risks to sequencing

- **Phase 0 is genuinely time-critical.** The rescue step must run within ~2 days or that evidence is gone.
- **Phase 2 is the security-sensitive one.** Budget review time; do not let it ride along with a Phase 1 merge.
- **Phases 3–4 multiply cost.** Verify cost telemetry in Phase 3 before enabling tournaments by default.
- The unrelated `PORTFOLIO_VISITOR_FUNNEL_RECOVERY` project sits in `planned/`; this project does not depend on it, but both touch `serve.mjs` — coordinate if they run concurrently.
