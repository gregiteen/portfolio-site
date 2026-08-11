# GENERATIVE_DESIGN_STUDIO — Architecture

> **Project Prefix**: `GENERATIVE_DESIGN_STUDIO`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Design principle

**The vault owns the design space; the code owns the execution.**

Today the design space is hardcoded: `LAYOUT_SPECS` is a JS object, motion is a string injected by `build-site.mjs`, and "what counts as good" lives inside prompt literals. Every expansion of creative range therefore requires a code change, and none of it is portable or reviewable.

This project moves the design space into SSSS documents. Archetypes, capabilities, and reference exemplars become vault primitives the Director selects from; the pipeline becomes a generic executor. Adding a new archetype becomes a vault write, not a deploy.

## New SSSS document types

| Type | Portability | Location | Purpose |
|---|---|---|---|
| `composition_archetype` | `structural` | `vault/design-system/archetypes/` | A page-structure family: slot vocabulary, nav model, structural invariants, exemplars |
| `motion_capability` | `structural` | `vault/design-system/capabilities/` | One vetted interaction/motion technique: id, implementation module, budget, a11y contract |
| `design_evidence` | `tenant_private` | `vault/runtime/evidence/` | One pass: screenshots + the verdict that judged them, keyed `(runId, pass)` |
| `design_critique` | `tenant_private` | `vault/runtime/critiques/` | One tournament judgment: candidate scores, cited comparisons, selection rationale |

`generation_run` (existing, `tenant_private`, via `scripts/runtime-store.mjs`) gains `archetype`, `capabilities[]`, and `tournamentId` fields.

> **Portability check.** Archetypes and capabilities are the sellable model and must round-trip through `npx ssss export vault --profile sale`. Evidence and critiques are tenant data and must be *absent* from that bundle. Run `npx ssss help portability` before adding either type, and prove both halves in the testing phase.

## Component 1 — Composition archetypes (G1)

### Current

```
Director plan ──▶ LAYOUT_SPECS (10 fixed keys, hardcoded)
                      │
                      ▼
              one CSS owner + 10 layout workers
                      │
                      ▼
        validateThemePayload(release) requires ALL 10 slots
```

Consequence: structure is a constant. Only CSS varies.

### Target

```
Director plan ──▶ selects composition_archetype from the vault
                      │
                      ├── archetype.slots  ──▶ fan-out is archetype-scoped
                      ├── archetype.navModel
                      └── archetype.invariants ──▶ validator loads these, not a fixed list
```

`LAYOUT_SPECS` becomes the `default-editorial` archetype's slot set — a preserved special case, not the universal contract. `validateThemePayload` takes the archetype's slot vocabulary as a parameter instead of closing over a module constant.

**Archetype document shape** (`type: composition_archetype`):

```yaml
id: horizontal-gallery
name: Horizontal Scroll Gallery
nav_model: lateral            # lateral | vertical | canvas | command
slots: [shell, rail, panel, panel_item, detail_overlay, nav_item]
invariants:
  - "primary scroll axis is X; the vertical axis must not scroll on desktop"
  - "every panel is a full-viewport-height stop"
required_capabilities: [scroll-snap-lateral]
exemplars: [...]
```

**Anti-degeneracy rule (from PRD risks):** an archetype must declare a `nav_model` distinct from at least one sibling *and* at least one invariant no sibling has. Enforced by a conformance test over the archetype registry, not by review — otherwise archetypes become the same 10 slots with new names.

**Seed set (5):** `default-editorial` (today's behaviour, preserved verbatim), `horizontal-gallery`, `single-canvas`, `terminal`, `spatial-map`.

## Component 2 — Motion & interaction capabilities (G2)

The current rule is binary and absolute: `validateThemePayload` neutralizes all `<script>`. That is correct as a default and wrong as a ceiling.

**Replacement: declare-and-allowlist.**

- A design's constitution declares `capabilities: [scroll-choreography, view-transitions]`.
- Each declared id must resolve to a `motion_capability` document in the vault.
- `build-site.mjs` injects the capability's **repo-owned implementation module** — generated layouts never supply raw JS. The model chooses *which* behaviour and parameterises it; it never writes the behaviour.
- Anything undeclared is still stripped. Unknown id ⇒ build error (fail-closed, same posture as a missing `DESIGN.md`).

**Capability document shape** (`type: motion_capability`):

```yaml
id: scroll-choreography
module: scripts/lib/capabilities/scroll-choreography.mjs
params_schema: { stagger_ms: integer, axis: enum[x,y] }
budget: { max_bytes: 8192, main_thread_ms: 4 }
a11y: "must no-op under prefers-reduced-motion"
```

**Seed set (6):** `scroll-choreography`, `view-transitions`, `lateral-scroll-snap`, `canvas-field` (2D), `webgl-scene` (pinned local lib), `ambient-audio` (explicit opt-in, muted by default, visible control).

**Security posture.** No CDN — the artifact CSP already forbids external hosts and the same rule applies here. Pinned local libraries only. Each capability module is reviewed once, in the repo, by a human; the generator can only reference reviewed modules. This keeps the attack surface at "code we wrote" rather than "code a model emitted."

**Budget enforcement.** `render-audit.mjs` gains a performance capture (main-thread time, transferred bytes). Exceeding a capability's declared budget is a blocking issue with automatic evidence — no vision judgment required.

## Component 3 — Tournament generation (G3)

### Current

```
Director ──▶ 1 plan ──▶ 1 candidate ──▶ repair×5 toward passing ──▶ promote/fail
                                   ▲                                    │
                                   └──── runUntilApproved retries same approach ×3
```

### Target

```
Director ──▶ N divergent plans (different archetypes REQUIRED)
                 │
                 ├─ candidate 1 ─┐
                 ├─ candidate 2 ─┼──▶ cheap render + judge panel ──▶ design_critique
                 └─ candidate N ─┘                │
                                                  ▼
                                    winner ──▶ existing repair loop ──▶ promote
```

- `THEME_TOURNAMENT_N` (default 3, env-capped) controls breadth.
- Candidates must differ by archetype — enforced mechanically, so divergence is structural rather than a prompt request.
- Judging runs on the cheap model over low-res screenshots; only the **winner** enters the expensive vision repair loop. This is what keeps cost bounded despite N-way fan-out.
- Losers are not discarded silently: each is written as a `design_critique` so the corpus records what was rejected and why.

## Component 4 — Distinctiveness gate (G4)

A new scored dimension in the review board, run alongside the existing correctness audit rather than inside it — the correctness reviewer is deliberately conservative and must stay that way.

- Judged against a stored reference corpus of agency-grade exemplars (extends `scripts/lib/design-exemplars.mjs`, which today feeds *generation* prompts only and is not used for judging).
- Every distinctiveness rejection must cite a concrete comparison ("the card grid on `projects desktop 1440px` is a uniform 3-up with no compositional idea") — matching the existing `evidence`-required contract that `sanitizeAuditVerdict()` already enforces for blocking issues.
- Score <7 blocks promotion. Between 7 and 8, promotion is allowed but the run is flagged in its `generation_run` doc.
- **Judge model must differ from the generator model** (`THEME_DISTINCTIVENESS_MODEL`), so the gate is not grading its own homework.

## Component 5 — Evidence corpus (G5)

### Current (defective)

```js
join(tmpdir(), `render-audit-${slug}-${i}-${label.split(' ')[0]}.jpeg`)
```

No pass number, no timestamp, no run id ⇒ each pass overwrites the last. Written with `.catch(() => {})` ⇒ silent on failure. `/tmp` purges at 10 days. Verdicts never persisted.

### Target

`design_evidence` documents keyed `(runId, pass)`, holding the pass's screenshots *and* the verdict that judged them — so a postmortem can see what the reviewer saw **and** what it concluded, for every pass, not just the last.

Write failures become warnings, never silence. Retention is a documented policy enforced by an SSSS pruning operation, not by `/tmp` semantics.

**Migration:** the existing 45 files in `/tmp` on the droplet — including `minimalist-japanese-zen-garden-raked-san`, the only surviving record of a rejected generation — are rescued into the corpus before they age out. This is Phase 0 and time-boxed: they begin deleting in ~2 days.

## Component 6 — On-demand improvement (G6)

Today `improve-theme.mjs` is legacy and gated off (`ENABLE_LEGACY_THEME_IMPROVER=1`) for a *correct* reason: its repair prompts are text-only, and blind repairs stall.

The replacement is not a resurrection — it is a new entry point that runs the **existing vision repair loop** against an already-promoted design:

```
improve <slug> ──▶ rebuild to staging ──▶ render-audit (vision)
                        ▲                        │
                        └── repair (sees pixels)─┘
                                 │
                        promote atomically or roll back
```

It reuses staging + atomic promotion, so an improvement run has exactly the same fail-closed guarantee as a generation run. Prior `design_evidence` for that slug is fed in as prior-pass context, which `render-audit.mjs` already supports via its `priorIssues` re-verification section.

> **Do not resurrect a text-only repair path.** This is a previously-diagnosed bug pattern documented in the `generator` skill, not a style preference.

## Component 7 — IP safety gate (G7)

Two layers, because prompt-level suppression alone demonstrably failed (the LEGO® render happened *with* an anti-generic clause already in the prompt):

1. **Prompt layer** (landed 2026-07-30, unverified): the art director must describe forms generically and never name a real brand; the image prompt refuses trademarks outright.
2. **Detection layer** (this project): the existing visual asset audit gains an explicit trademark question — "does any mark resemble a real-world company logo, franchise emblem, or product logotype?" — as a blocking issue with named-asset evidence.

Layer 2 is the load-bearing one. Prompts express intent; only a gate enforces it.

## Files touched

| File | Change |
|---|---|
| `scripts/lib/theme.mjs` | `LAYOUT_SPECS` → archetype-scoped; `validateThemePayload` takes a slot vocabulary; capability declaration parsing |
| `scripts/lib/archetypes.mjs` *(new)* | Load/validate `composition_archetype` docs from the vault |
| `scripts/lib/capabilities/*.mjs` *(new)* | One reviewed implementation module per motion capability |
| `scripts/lib/evidence-store.mjs` *(new)* | `design_evidence` / `design_critique` read+write via the Operation Contract |
| `scripts/lib/distinctiveness.mjs` *(new)* | Reference-corpus judge |
| `scripts/compile-theme.mjs` | Archetype selection; tournament fan-out; evidence writes; capability threading |
| `scripts/render-audit.mjs` | Durable evidence output; perf capture; trademark question |
| `scripts/build-site.mjs` | Capability module injection replacing the single hardcoded scroll-reveal script |
| `scripts/improve-design.mjs` *(new)* | G6 entry point (replaces legacy `improve-theme.mjs`) |
| `scripts/runtime-store.mjs` | `generation_run` gains archetype/capabilities/tournamentId |
| `vault/design-system/**` *(new)* | Archetype + capability documents |
| `.claude/skills/generator/SKILL.md` | Rewritten flow + gotchas once shipped |

## Open questions

1. **Archetype ↔ vault content coupling.** A `terminal` archetype renders the same `vault/pages/**` content as `default-editorial`. Do some archetypes need content *hints* (e.g. "this archetype needs a short tagline per project"), or must every archetype render any content? *Leaning: every archetype must render any content — otherwise archetypes become content requirements and the vault stops being the single source of truth.*
2. **Evidence storage of binaries.** `DEFERRED_BACKLOG.md` already flags "binary assets inside `.ucw` bundles" as an open spec question for the `ssss` repo. Evidence screenshots are `tenant_private` and therefore never exported, which sidesteps it — but confirm before implementing rather than assuming.
3. **Does `scopeCss` come back?** It is currently dead code (exported, unit-tested, never called). A `single-canvas` archetype embedding multiple visual zones might need it. Decide in Phase 1 rather than leaving the doc/code conflict unresolved a third time.
