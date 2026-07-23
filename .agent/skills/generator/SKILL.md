---
name: generator
description: "Use this skill when working on the AI theme/skin generation pipeline (compile-theme.mjs, the Director→CSS/layout fan-out→render-audit review board→promotion flow), the static site builder (build-site.mjs), or design/skin promotion. Not for the one-off scripts/gen-*.mjs branding scripts (those are dead/historical, see Gotchas). MANDATORY: read the full SKILL.md before executing."
---

# Theme / Site Generator

This repo has two generation-adjacent systems — don't conflate them:

1. **The static site builder** (`scripts/build-site.mjs`) — always runs, reads `vault/pages/**.md`, renders Markdown, injects theme CSS/layouts, writes `dist/site/`.
2. **The AI theme/skin generator** (`scripts/compile-theme.mjs` and friends) — an on-demand pipeline that turns a visitor's style prompt into a fully bespoke, screenshot-reviewed visual skin.

Run `node .agent/skills/generator/scripts/check-generator-env.mjs` and `node .agent/skills/generator/scripts/list-designs.mjs` before making changes — they show what's actually configured and what's currently in each of the three design-shaped locations (a recurring source of confusion, see below).

## The three design-shaped locations — do not confuse these

| Location | What it is | Owned by |
|---|---|---|
| `vault/pages/designs/` | **Real portfolio design pages** — Nostalgia, High Stakes Field Day, etc. | The repo. Committed. Belongs in the public Designs index. |
| `vault/pages/skins/` | **Generated skin documents** (`x_kind: theme-skin`), written by `compile-theme.mjs`'s atomic promotion step. Powers the flipper. | Runtime. Gitignored. Must never appear in the Designs index. |
| `designs/<slug>/` | **Generated skin build output** — static assets/images for one skin. | Runtime. Gitignored. Regenerated on demand. |

A skin becoming a real design requires the deliberate, separate step `node scripts/promote-theme.mjs <slug>` — never hand-copy a skin doc into `vault/pages/designs/`.

## Core pipeline file map

| File | Purpose |
|---|---|
| `scripts/compile-theme.mjs` | The generator: prompt → Director plan → parallel CSS+layout fan-out → images → structural validation/repair → isolated build → screenshot review board → atomic promotion |
| `scripts/lib/theme.mjs` | `LAYOUT_SPECS` contract, `fillTemplate`, `hoistCssImports`, `scopeCss` (see Gotchas — largely dead code now), `validateThemePayload`, `extractJson`, `enforceBrandAssetContract` |
| `scripts/lib/theme-release.mjs` | Small pure helpers: `requireValidTheme`, `renderedReviewState`, `requireApprovedVisualAudit`, `generationRetryDelay`, `generationRetryDecision` (bounded at 3 attempts by default), `decideAtCap` (promote-vs-fail at repair pass limit) |
| `scripts/render-audit.mjs` | Playwright screenshot capture (desktop 1440px + mobile 390px, 5 pages) + Gemini vision review → `{approved, score, issues[], screenshots[]}` |
| `scripts/lib/design-exemplars.mjs` | Few-shot prompt exemplars fed into planning/CSS/layout prompts |
| `scripts/lib/orchestrator-brain.mjs`, `scripts/lib/pitfalls.json` | Additional prompt context — `pitfalls.json` is now **read-only** at runtime (destructive rewrites removed). Lessons persist via Total Recall (`scripts/lib/review-memory.mjs`) |
| `scripts/lib/review-memory.mjs` | Total Recall learning integration: `recallLessons` (topK 8 at run start), `rememberLesson` (append-only), `createRunLessonRecorder` (deduped, 6-write cap/run). Lessons injected into Director + CSS/layout prompts but NOT reviewer prompts (anchoring failure mode) |
| `scripts/lib/artifact-gate.mjs` | Mechanical pre-screenshot artifact gate: scans layouts + built pages for exact-string defects before invoking the vision reviewer |
| `scripts/lib/logo-transparency.mjs` | Logo transparency pipeline: background removal, chroma keying, difference matting for clean brand marks |
| `scripts/build-site.mjs` | Static site compiler; also builds isolated per-design trees via `--design <slug> --design-source <dir> --out-dir <dir>` |
| `scripts/runtime-store.mjs` | Vault-backed persistence for `visitor`/`proposal`/`generation_run` docs under `vault/runtime/`. Used by `serve.mjs`, not imported by `compile-theme.mjs` directly |
| `scripts/promote-theme.mjs` | Standalone CLI: copies a `designs/<slug>/` into `vault/pages/designs/` as real portfolio work |
| `scripts/improve-theme.mjs` | **Legacy, opt-in only** (`ENABLE_LEGACY_THEME_IMPROVER=1`) — see Gotchas |

**Dead/historical, not part of this pipeline:** the ~19 one-off `scripts/gen-*.mjs` files at the repo root (`gen-logos.mjs`, `gen-favicon.mjs`, `gen-gi-*.mjs`, `gen-tr-*.mjs`, `crop-logos.mjs`, `make-transparent.mjs`, etc). Confirmed zero call sites from `package.json`, `serve.mjs`, or `compile-theme.mjs` — each was a standalone script used once to hand-generate this portfolio's own branding assets, with its own inlined Gemini call. Don't extend or "fix" these as if they're reusable infrastructure; if they're ever truly dead weight, that's a separate cleanup decision to raise with the user, not something to fold into pipeline work.

## End-to-end generation flow

1. Visitor/CLI submits a prompt → `serve.mjs` `/generate-theme` → spawns `compile-theme.mjs "<prompt>"` as a child process (no shell) → `runtime-store.mjs` `appendRun()` writes a `generation_run` doc.
2. **Director call** (Gemini, thinking-budget model): explores 3 directions, locks one "Design Constitution" — tokens, class vocabulary, layout blueprints, image prompts.
3. **Parallel fan-out**: one CSS-owner call + one call per `LAYOUT_SPECS` key, concurrently with 4 image generations (hero, logo, favicon restyle, portrait) — each with fallback-to-verified-asset on failure. Brand assets (logo/favicon) are **restyled via image-to-image, not generated from text** — pure text-to-image produced garbled letterforms. **Image models**: FLUX Pro v1.1 (`fal-ai/flux-pro/v1.1`) for hero/portrait, Ideogram v4 (`fal-ai/ideogram/v4`) for logos/brandkits/favicons (crisp text rendering). All image generation routes through `callFalImage()` in `openrouter.mjs`, with `FAL_KEY` resolved from Total Recall secrets store.
4. **Structural gate**: `validateThemePayload` (strict, all-layouts, hero, font-import, brand-logo, class-bindings required); failures feed a bounded repair loop (env `THEME_MAX_STRUCTURAL_PASSES`, default 4) targeting only the failing slots.
5. Writes `designs/<slug>/DESIGN.md` — frontmatter + `## section:css` / `## section:layout:<key>` fenced blocks (the confirmed convention; parsed by `extractSections()`, written by `serializeThemeDoc()`).
6. Builds an isolated staging site: `build-site.mjs --design <slug> --out-dir .theme-staging/<id>/site/...`.
7. **Review board** (parallel): `render-audit.mjs` screenshots + a visual asset audit. Blocking issues require per-issue `evidence` (screenshot + region); evidence-less blocking issues are demoted to minor by `sanitizeAuditVerdict()`. Out-of-scope complaints (content volume, flipper bar, CNA banner) are mechanically demoted. Repairs use a **vision model** (`THEME_REPAIR_MODEL`, default `anthropic/claude-fable-5`) that receives the *same screenshots* — up to `THEME_MAX_REPAIR_PASSES` (default 5), rebuild + re-screenshot each pass. `decideAtCap()` promotes clean-enough candidates or fails dirty ones at threshold. `createIssueLedger()` tracks persistent issues with fuzzy matching: escalated prompt on 2nd observation, suppressed on 3rd.
8. On approval: atomic rename-based promotion (`designDir → designs/<slug>`, staging build → `dist/site/designs/<slug>`, staged skin doc → `vault/pages/skins/<slug>.md`), with rollback on any step failure. On failure anywhere: the whole staging root is removed — **fail-closed**, nothing unpublished is ever partially visible.
9. Main site rebuild (registers the skin in the flipper nav) — deferred to `serve.mjs`'s serialized rebuild when `THEME_DEFER_BUILD=1`.
10. `runUntilApproved()` wraps the whole thing in a bounded retry loop (env `THEME_MAX_GENERATION_ATTEMPTS`, default 3) with exponential backoff — a generation ends in success, exhausted attempts, or process exit. Provider credit exhaustion (402) stops immediately instead of looping.

## Running it

- Standalone: `node scripts/compile-theme.mjs "prompt text"` — requires `npm install playwright && npx playwright install --with-deps chromium` for the render gate.
- Promote a skin to a real design: `node scripts/promote-theme.mjs <slug>`.
- Tests: `node --test test/theme-utils.test.mjs` (or `npm test`, which also round-trips the SSSS vault).

## Gotchas

- **Doc/code conflict on `scopeCss()`**: `openwiki/architecture/overview.md` describes CSS scoping as how theme isolation works. In the actual code, `scopeCss` is exported and unit-tested but **never called** by `build-site.mjs` or `compile-theme.mjs` — dead code. Real isolation comes from building each design as a fully separate static site tree under `dist/site/designs/<slug>/` with **unscoped** CSS (comment at `build-site.mjs`: `// Un-scoped for standalone site`); the flipper navigates between whole pages, not a `data-theme` toggle in-place. The `tl-default`/`tl-custom` dual-layer CSS still exists in the main-site build path but never receives generated skin CSS — appears vestigial for the current architecture. If you're touching CSS isolation, verify against the code, not the architecture doc.
- **`improve-theme.mjs` vs. the live review board**: `improve-theme.mjs`'s repair prompts are text-only (score/critique JSON, no screenshots) — that's exactly why it's demoted to opt-in/legacy (`serve.mjs` gates it behind `ENABLE_LEGACY_THEME_IMPROVER=1`, off by default). The comment in `compile-theme.mjs` cites the observed failure directly: "3 blocking issues unchanged across 3 passes... not actionable without the pixels." The *current* live repair loop explicitly passes rendered screenshots into the repair call. **Do not resurrect a text-only repair path** — this is a confirmed, previously-diagnosed bug pattern, not a style preference.
- `pitfalls.json` is now **read-only** at runtime (destructive rewrites removed in the Review Board Overhaul). Lessons accumulate in Total Recall via `review-memory.mjs` and are recalled (topK 8) at run start, merged with the static pitfalls seed into an immutable lesson pack.
- Every generated skin gets a CNA banner and scroll-reveal motion script mechanically injected in `build-site.mjs`, not via prompt compliance — layout specialists can't be trusted to include them reliably. `enforceBrandAssetContract()` similarly backfills brand-mark CSS/logo references as a deterministic safety net independent of model compliance. Don't remove these mechanical injections as "redundant" without checking whether the model output actually covers them reliably first.

## Reference

- [references/design-md-format.md](./references/design-md-format.md) — the exact `DESIGN.md` convention and section-parsing contract.
