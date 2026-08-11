# GENERATIVE_DESIGN_STUDIO — PRD

> **Project Prefix**: `GENERATIVE_DESIGN_STUDIO`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Problem

The theme generator reliably produces *valid* skins and cannot produce *distinctive* ones. Every design that has shipped reads as the same 2010-era page with different colours. This is not a model-capability problem — it is a contract problem. Five structural ceilings, each verified against the current code:

1. **One information architecture for every design.** `LAYOUT_SPECS` (in `scripts/lib/theme.mjs`) defines exactly 10 slots — `shell, home, projects_index, designs_index, project_detail, design_detail, page, project_item, design_item, nav_item` — and `validateThemePayload` in release mode *requires complete layout coverage*. The Director explores three directions, then expresses whichever it picks through an identical DOM. Every skin is therefore CSS variation over one page structure. That is the definition of templated.

2. **Behaviour is forbidden.** `validateThemePayload` neutralizes `<script>` tags in layouts (covered by the test `validateThemePayload neutralizes script tags in layouts`) and rejects generated dialog/popover navigation. No canvas, no WebGL, no View Transitions, no scroll-driven 3D, no audio, no video. The pipeline is *structurally incapable* of the immersive work it is being asked for.

3. **Motion is uniform boilerplate.** `build-site.mjs` mechanically injects the *same* scroll-reveal script into every generated skin, deliberately, because "layout specialists can't be trusted to include them reliably." Motion is therefore decoration applied after the fact — never a designed, per-design behaviour.

4. **The pipeline selects for safe.** The release reviewer's prompt says "competent but basic is a FAILURE," but every mechanical gate punishes deviation, the repair loop iterates a *single* candidate toward passing, and `runUntilApproved` retries the *same* approach up to 3 times. Net selection pressure runs toward the most conservative artifact that survives the gates. Boldness has no scored dimension anywhere in the system.

5. **The evidence is being thrown away.** `render-audit.mjs` writes screenshots to `os.tmpdir()` as `render-audit-<slug>-<i>-<page>.jpeg` — a deterministic filename with no pass number and no timestamp, so **each repair pass overwrites the previous one**. Measured on the droplet: 45 files = 9 slugs × 5 shots = exactly one pass retained per design, zero history. `/tmp` is purged at 10 days (`q /tmp 1777 root root 10d`); the current set is 7–8 days old. The audit *verdicts* — issues, scores, evidence citations — are never persisted at all, only logged to console. We cannot tell whether "analyze and improve" improves anything, because we keep neither the before nor the reasoning.

A sixth problem surfaced during brand-mark work on 2026-07-30 and is live: an image model handed the theme word "LEGOS" rendered the **actual LEGO® corporate trademark** locked up beside "GREG ITEEN". Visitor prompts routinely name real franchises, so this is a systemic IP exposure, not a one-off.

## Goals

- **G1 — Structural variety.** A design chooses its own *composition archetype* (editorial long-read, horizontal-scroll gallery, single-canvas scene, terminal/CLI, spatial map, …), not just its palette. Two designs with different archetypes must differ in DOM structure and navigation model, not only CSS.
- **G2 — Behaviour as a designed, gated capability.** Replace blanket script-stripping with a declared, allowlisted motion/interaction budget. A design declares which vetted capabilities it uses; anything undeclared is still stripped. Fail-closed is preserved.
- **G3 — Divergent generation.** Generate N genuinely different directions in parallel and have a judge panel select, instead of repairing one candidate toward safety.
- **G4 — Distinctiveness as a blocking score.** "Reads as a default template" becomes a scored, evidence-backed dimension with real teeth, judged against a reference corpus — not a line of prompt text the gates quietly overrule.
- **G5 — A durable evidence corpus.** Every pass's screenshots *and* its verdict persist as SSSS documents, keyed by run and pass, surviving both fail-closed deletion and `/tmp` cleanup.
- **G6 — On-demand improvement of shipped themes.** Re-run analysis and improvement against an existing design without regenerating it from scratch, using the corpus from G5.
- **G7 — IP safety.** No generated asset reproduces a third-party trademark, brand wordmark, or franchise emblem.

## Non-Goals

- **Not "add audio, video and 3D everywhere."** Volume of effects is how sites read dated fastest, and it costs performance, mobile, and accessibility. The target is *one strong conceptual idea executed precisely*. G2 makes immersive work **possible**; the distinctiveness gate (G4) decides when it is **warranted**.
- **Not a rewrite of the orchestration.** `compile-theme.mjs`'s staging → gate → atomic-promotion → fail-closed flow is sound and stays. This project changes the *contract* the pipeline executes, not the pipeline's control flow.
- **Not abandoning fail-closed.** Nothing unpublished may ever become partially visible. Every new capability inherits that guarantee.
- **Not relaxing the brand-asset contract.** `enforceBrandAssetContract()` and the mechanical CNA-banner injection remain — they exist because model compliance is unreliable.

## Users & Use Cases

| User | Use case |
|---|---|
| Site visitor | Submits a style prompt, gets a bespoke, genuinely distinctive skin in a bounded wait |
| Greg | Promotes a generated skin to real portfolio work (`promote-theme.mjs`); re-runs improvement on a shipped design that has aged |
| Greg (diagnostic) | Reviews a run's pass-by-pass evidence to judge whether the review board converged or churned |

## Success Metrics

| # | Metric | Baseline (2026-07-30) | Target |
|---|---|---|---|
| M1 | Distinct composition archetypes across shipped designs | 1 (all 10 slots, identical IA) | ≥4 archetypes across ≥8 designs |
| M2 | Distinctiveness score (new G4 gate), median | not measured | ≥8/10, none promoted below 7 |
| M3 | Passes retained as durable evidence | 1 (last pass only, `/tmp`) | 100% of passes, in the vault |
| M4 | Verdicts persisted | 0% | 100%, joined to their screenshots |
| M5 | Designs using ≥1 declared motion capability | 0 (uniform injected script) | ≥60% |
| M6 | Third-party trademarks in generated assets | ≥1 known (LEGO®) | 0, enforced by an automated gate |
| M7 | Median wall-clock to promotion | ~2–4 min claimed, 21 passes / 3h38m worst case observed | ≤6 min median, hard cap preserved |

## Constraints

- **SSSS-first (absolute).** Archetype registry, capability allowlist, evidence, and critiques are all SSSS VFS documents. No side databases, no ad-hoc JSON stores. Mutations flow through the Operation Contract.
- **Portability (§5.5).** Archetypes and motion capabilities are `structural` — they are the sellable model and ship in `template`/`sale` exports. Evidence and critiques are `tenant_private` and must never appear in a sale bundle.
- **Cost.** Each review cycle is 4–6 paid calls. Tournament generation multiplies per-run cost by N; N must be configurable and the cap enforced.
- **No new runtime provider surface** without a WebSearch confirmation of current pricing/availability first.

## Risks

| Risk | Mitigation |
|---|---|
| Allowlisted scripts become an XSS/supply-chain vector | Capabilities are vault-declared, code-implemented; generated layouts never supply raw JS. Pinned local libs only — no CDN. CSP on the design routes. |
| Tournament cost blowup | `THEME_TOURNAMENT_N` env-capped; judge panel runs on the cheap model; only the winner enters the expensive repair loop. |
| Archetypes degenerate into "10 slots with different names" | An archetype must declare a distinct nav model + at least one structural rule the others lack; enforced by a conformance test, not review. |
| Distinctiveness judge drifts toward its own house style | Judge against a stored reference corpus with cited comparisons, and keep the judge model separate from the generator model. |
| Evidence corpus grows unbounded in the vault | Screenshots stored as JPEG at existing quality 70, retention policy per run count, pruning is itself an SSSS operation. |
