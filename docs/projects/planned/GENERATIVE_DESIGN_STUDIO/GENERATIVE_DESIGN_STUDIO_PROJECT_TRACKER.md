# GENERATIVE_DESIGN_STUDIO — Project Tracker

> **Project Prefix**: `GENERATIVE_DESIGN_STUDIO`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## ⏳ Phase 0: Evidence corpus + tagged asset library (time-critical)

Goal: never lose a pass again, rescue what was about to be deleted, and make the whole history browsable as a tagged library showing each site's progression.

- [x] Rescue the existing 45 `/tmp/render-audit-*.jpeg` files off the droplet into the repo (includes `minimalist-japanese-zen-garden-raked-san`, the only surviving rejected-generation record) — `evidence-library/rescued-2026-07-30/`, 5.6M
- [x] **Evidence storage policy decided (2026-07-30, Greg): keep everything.** Full library retained — no delete-after-email. Measured cost: ~124KB/screenshot, ~5MB per full run (25 audit shots + 5 generated images), so ~500MB per 100 generations. Acceptable at current volume; revisit only if it becomes a real constraint.
- [x] Define `design_evidence` + `design_critique` SSSS types; confirm both classify `tenant_private` via `npx ssss help portability` — added, plus `delivery_settings`/`delivery_event` for the sibling project, to `vault-registry/extensions/portfolio.json`; all four confirmed `tenant_private`
- [x] Build `scripts/lib/evidence-store.mjs` writing through the Operation Contract (no raw `fs` writes for state) — `recordEvidence()` writes binary screenshots to `evidence-library/<slug>/<runId>/` on disk and one `design_evidence` doc per pass through `engine.processOperation`; smoke-tested end to end (write + `listEvidenceForSlug` read-back), scratch record removed after
- [x] Rewrite `render-audit.mjs` persistence: key on `(runId, pass, label)`, store the verdict alongside its screenshots — `recordEvidence` call keyed on `slug/runId/pass`, one doc per label's screenshot listed in `assets`
- [x] Replace the silent `.catch(() => {})` on evidence writes with a warning — removed the `os.tmpdir()` write entirely; `recordEvidence()` failures now `console.warn`, and the pass still throws through so the caller sees the real audit failure
- [x] Thread `runId`/`pass` from `compile-theme.mjs` into `renderAudit()` — `serve.mjs` passes `GENERATION_RUN_ID` env to the child process; `compile-theme.mjs` forwards it (falling back to `styleName`) plus the loop's `pass` counter
- [x] Capture **all** generated imagery into the library, not just render-audit screenshots — `hero`, `portrait`, `logo`, `favicon`, `brandkit` per run — wired: `compile-theme.mjs`'s `renderAudit()` call now passes `generatedAssets` (all 5 kinds) on every pass; `recordEvidence()` in `evidence-store.mjs` now **copies** the bytes into `evidence-library/<slug>/<runId>/pass-<n>-<kind>.<ext>` instead of referencing the live `genDir` path — those files get overwritten in place on every repair pass, so a reference alone would have silently pointed a pass-1 doc at pass-3's bytes; a missing source (e.g. an asset that fell back and was never written) is skipped, not recorded as a dangling path. Smoke-tested with real PNG/JPEG bytes via `sharp`, including one deliberately-missing asset; `npm test` 113/113 still green after.
- [x] Tag schema: `slug`, `runId`, `pass`, `asset_kind`, `viewport`, `archetype`, `outcome` (promoted / rejected / superseded), `created` — implemented as `design_evidence` frontmatter; `outcome` is currently pass-level (`approved`/`rejected`/`unknown` from that pass's own verdict), not yet reconciled with the run's final promote/reject decision — see verify item below
- [x] Backfill tags for the rescued 2026-07-30 set (9 slugs; pass unknown → tag `pass: unknown`) — `scripts/backfill-rescued-evidence.mjs` (one-off, kept in-repo for reference) wrote one `design_evidence` doc per slug (`run_id: rescued-2026-07-30`, `pass: 'unknown'`, `outcome: 'unknown'`) referencing the existing files in place under `evidence-library/rescued-2026-07-30/` — no binary copy, just tagging; read-back verified via `listEvidenceSlugs()`/`listEvidenceForSlug()`, `npm test` + `npm run validate` still green after
- [x] Library view: per-site progression — every asset for a slug in chronological order, so one page shows a design's whole visual history — built as a new "Library" tab in the real admin frontend (`static/crm-app.html`, the CRM UI reachable at `/crm` inside the authenticated webmail app — corrected mid-session; this is NOT a separate page that needed inventing). Grid of per-slug cards (pass count, latest outcome, latest run) → "View Progression" opens a modal with every pass in order, thumbnails, score, and issues.
- [x] Expose the library in the admin UI behind existing admin auth — three new endpoints under the existing `isAdmin(req)` gate in `serve.mjs`: `GET /api/admin/evidence-library` (per-slug summary), `GET /api/admin/evidence-library/:slug` (full progression), `GET /api/admin/evidence-asset?path=...` (streams one screenshot/generated-image, validated against path traversal — confirmed `../../etc/passwd` and `evidence-library/../scripts/serve.mjs` both 400, unauthenticated request 403, a real asset 200 `image/jpeg`). Live-verified against a running `serve.mjs` with the 9 backfilled rescued slugs. The frontend markup/JS was separately verified rendering standalone (no console errors, graceful failure toast with no backend) — full authenticated-session click-through wasn't verified live since `/crm` requires a real webmail login this machine has no credentials for, same gap as the sibling delivery-pipeline project's IMAP items.
- [ ] Pruning available as an SSSS operation but **not scheduled** — retention is "keep everything" per the decision above; the operation exists for manual use if volume ever demands it — not built
- [ ] Verify: a multi-pass run leaves one evidence doc per pass; a fail-closed rejection retains its full trail; the library shows progression for every slug — needs a real generation run (droplet or local `npm run dev` + a live prompt), not provable from a unit smoke test alone

## ⏳ Phase 1: Composition archetypes

Goal: structure becomes a design decision, not a constant.

- [ ] Define `composition_archetype` type (`structural`)
- [ ] Author 5 seed archetypes; `default-editorial` reproduces today's 10-slot behaviour byte-identically
- [ ] `scripts/lib/archetypes.mjs` — load + validate from the vault
- [ ] Anti-degeneracy conformance test (distinct `nav_model` + ≥1 unique invariant per archetype)
- [ ] Parameterise `validateThemePayload` on a slot vocabulary instead of the `LAYOUT_SPECS` constant
- [ ] Director prompt + `DIRECTOR_SCHEMA` gain archetype selection with justification
- [ ] Archetype-scope the specialist fan-out
- [ ] `build-site.mjs` renders any archetype's slot set
- [ ] Resolve open question 3 (`scopeCss` revival) and record the decision in the architecture doc
- [ ] Verify: two archetypes differ in built HTML structure; `default-editorial` output unchanged from baseline

## ⏳ Phase 2: Motion & interaction capabilities

Goal: behaviour becomes possible, declared, and bounded — without reopening the XSS surface.

- [ ] Define `motion_capability` type (`structural`)
- [ ] Author 6 reviewed capability modules under `scripts/lib/capabilities/`
- [ ] Unit-test that every module no-ops under `prefers-reduced-motion`
- [ ] Declare-and-allowlist in `validateThemePayload` (declared+known ⇒ inject; undeclared ⇒ strip; unknown ⇒ build error)
- [ ] `build-site.mjs` injects capability modules in place of the single hardcoded scroll-reveal script
- [ ] Perf capture in `render-audit.mjs`; budget overrun = blocking issue with automatic evidence
- [ ] CSP on design routes; confirm no capability reaches an external host
- [ ] `security` skill review of the capability loader + CSP — **blocking for merge**
- [ ] Verify: declared capability works; undeclared script still stripped; unknown id fails the build

## ⏳ Phase 3: Tournament generation

Goal: divergence replaces convergence-toward-safe.

- [ ] `THEME_TOURNAMENT_N` (default 1, env-capped); N=1 reproduces today's path exactly
- [ ] Director emits N plans with mechanically-enforced distinct archetypes
- [ ] Cheap parallel low-res render per candidate
- [ ] Judge panel → `design_critique` per candidate, losers included
- [ ] Winner enters the existing vision repair loop unchanged
- [ ] Cost telemetry into `generation_run`; confirm fan-out stays within the wait-page budget
- [ ] Verify: N structurally distinct candidates, a critique for each, one promoted

## ⏳ Phase 4: Distinctiveness gate

Goal: "reads as a template" becomes blocking and evidenced.

- [ ] Build the reference corpus (extend `design-exemplars.mjs`, currently generation-only)
- [ ] `scripts/lib/distinctiveness.mjs`; assert `THEME_DISTINCTIVENESS_MODEL` differs from the generator model
- [ ] Every rejection cites a concrete comparison (reuse the `evidence`-required contract)
- [ ] Wire as a dimension parallel to — not inside — the correctness audit
- [ ] Thresholds: <7 blocks; 7–8 promotes with a flag on the run doc
- [ ] Feed scores into `review-memory.mjs` for Total Recall accumulation
- [ ] Verify: a deliberately bland candidate scores <7 and is blocked with a citation

## ⏳ Phase 5: On-demand improvement

Goal: improve a shipped design without regenerating it.

- [ ] `scripts/improve-design.mjs <slug>` — staging → vision audit + repair → atomic promote or roll back
- [ ] Feed prior `design_evidence` in as `priorIssues`
- [ ] Delete legacy `improve-theme.mjs` and its `ENABLE_LEGACY_THEME_IMPROVER` gate (delete, do not defer)
- [ ] Expose via `serve.mjs` behind admin auth
- [ ] Verify: improvement raises distinctiveness without full regeneration; a failed run leaves the live design untouched

## ⏳ Phase 6: Testing & verification

Goal: prove it, don't assert it. Every box below needs an entry in the Verification Log.

- [ ] `npm test` green (baseline at planning time: 113/113)
- [ ] `npm run validate` (`ssss conformance --engine`) green
- [ ] Code-quality skill flow clean (`syntax scan → SSSS conformance → tests`; this repo has no tsc/eslint)
- [ ] Export round-trip: archetypes + capabilities **present** in a `sale` bundle
- [ ] Export round-trip: evidence + critiques **absent** from a `sale` bundle (§5.5)
- [ ] `npx ssss inspect dist/bundle.ucw.json --files` clean
- [ ] `node scripts/serve.mjs` boots natively without crashing — **before** any deploy
- [ ] Live run 1 on the droplet: promotes within the pass cap, evidence complete for every pass
- [ ] Live run 2: a different archetype is selected and renders correctly
- [ ] Trademark gate: prompt "LEGOS" produces **no** LEGO® mark (the known-bad 2026-07-30 case)
- [ ] Accessibility: every capability honours `prefers-reduced-motion` in a real browser, not just unit test
- [ ] Mobile: 390px render clean across all shipped archetypes
- [ ] Deploy via `/push` → `/deploy` protocol
- [ ] Rewrite `.claude/skills/generator/SKILL.md` (flow, three-locations table, gotchas) to match shipped reality
- [ ] Strip phase flags that are verified stable; file the rest as tracked cleanup
- [ ] Archive project to `completed/`, extracting unchecked items to `DEFERRED_BACKLOG.md`

---

## Verification Log

- 2026-07-30: Planning survey — `docs/projects/in-progress/` empty; no active project, no collision. `PORTFOLIO_VISITOR_FUNNEL_RECOVERY` sits in `planned/` and shares `serve.mjs` only.
- 2026-07-30: `npm test` — 113/113 passing (pre-project baseline).
- 2026-07-30: `LAYOUT_SPECS` confirmed as 10 fixed keys via runtime introspection — `shell, home, projects_index, designs_index, project_detail, design_detail, page, project_item, design_item, nav_item`.
- 2026-07-30: Evidence loss confirmed on droplet — 45 files in `/tmp` = 9 slugs × 5 shots = exactly one pass retained each; `/tmp` purge policy `q /tmp 1777 root root 10d`; files dated Jul 22–23.
- 2026-07-30: Trademark exposure confirmed — prompt "LEGOS" rendered the actual LEGO® corporate mark into `designs/legos/assets/logo.png`. Prompt-layer guard added same day; **detection gate still outstanding (Phase 6)**.
- 2026-07-31: Closed three more Phase 0 items in one pass. (1) Backfilled the 9 rescued slugs via `scripts/backfill-rescued-evidence.mjs`, verified via `listEvidenceSlugs()`/`listEvidenceForSlug()`. (2) Wired `generatedAssets` (hero/portrait/logo/favicon/brandkit) into `compile-theme.mjs`'s `renderAudit()` call; `evidence-store.mjs` now copies those bytes per-pass into `evidence-library/` instead of referencing the live (overwritten-in-place) generation path — smoke-tested with real image bytes including a deliberately-missing asset. (3) Built the library view as a new "Library" tab inside the real admin frontend, `static/crm-app.html` (corrected: this is the existing CRM UI at `/crm` inside authenticated webmail, not a page that needed inventing) — grid of per-slug cards + a progression modal — backed by three new `GET /api/admin/evidence-library[/:slug]` and `/evidence-asset` endpoints under the existing `isAdmin(req)` gate in `serve.mjs`. Live-verified: list/detail return real data for the 9 rescued slugs, asset streaming returns correct `image/jpeg` bytes, two path-traversal payloads both 400, unauthenticated request 403. Frontend markup/JS verified rendering standalone with no console errors and a graceful failure state with no backend; full authenticated click-through not verified live — `/crm` needs a real webmail login this machine has no credentials for. `npm test` 113/113 and `npm run validate` green throughout.

---

## Out of scope (do not drift into these)

- Rewriting `compile-theme.mjs`'s staging → gate → atomic-promotion control flow. It is sound; only the contract it executes changes.
- Relaxing fail-closed, `enforceBrandAssetContract()`, or the mechanical CNA-banner injection.
- Resurrecting any text-only repair path — a previously-diagnosed bug pattern, not a style preference.
- Adding audio/video/3D as a default. Phase 2 makes them possible; Phase 4 decides when they are warranted.
