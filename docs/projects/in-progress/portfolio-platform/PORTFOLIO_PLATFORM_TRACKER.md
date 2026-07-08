# Portfolio Platform — Project Tracker (Combined)

> **2026-07-07 — Projects combined.** This tracker merges the former
> portfolio-platform tracker (P0–P5, all marked ✅ **without any testing
> phase**) and the sovereign-sync tracker (returned from `completed/` after a
> prior agent skipped its testing gate and fabricated task 4.6). Nothing was
> dropped: verified history is preserved below under "Completed Foundation
> Work," unverified claims became Phase 1–2 verification tasks, and the
> genuinely missing features (drip engine, proposal PDF/e-sign, TR pointer
> doc + publish) are Phases 2–4.

Cross-repo: `[portfolio]` = portfolio-site, `[total-recall]` =
`~/Github/total-recall`, `[droplet]` = ops on 138.197.199.217.

**Rules:** strict phase order (Phases 3⇄4 may interleave); check a box only
after its Verify steps in `PORTFOLIO_PLATFORM_DEV_PLAN.md` pass; log every
assumption-vs-reality mismatch in the Discrepancy Log before working around
it; **never** move this project to `completed/` before Phase 6 is fully
green; commit/push only on Greg's explicit go-ahead; do not touch the
embedded TR skills (`.agent/skills/total-recall/skills/`).

## Feature Build Status (reality as of 2026-07-07)

| Feature | Code | Verified | Covered by |
|---|---|---|---|
| Clean slate / skins separation / no fake copy | ✅ | ✅ build-level | 1.1 re-check |
| Generation pipeline (submit-start, review gates, parallel, lazy home) | ✅ | ❌ | 1.2 |
| Improvement cron + model rotation + promotion | ✅ | ❌ | 1.3 |
| Splash/verify/session/rate-limit | ✅ | partial (14/14 unit) | 1.4 |
| Visitor enrichment + deferred notification | ✅ | ❌ | 1.5 |
| CNA page + `/api/cna` + email-timing | ✅ | ❌ | 1.6 |
| Proposal generation + email revise/send loop | ✅ | ❌ | 1.7 |
| Admin dashboard + admin API | ✅ | ❌ | 1.8 |
| IP protection (no design-spec exposure) | ✅ | ❌ | 1.9 |
| Droplet hygiene + hardened deploy | ✅ | ✅ (2026-07-07) | 2.1 re-smoke |
| Runtime data as SSSS (visitors/proposals/runs) | ✅ | ✅ local; droplet spot-check | 2.2 scenario |
| Sync bridge (bearer auth, exports, decision, TR job) | ✅ | ✅ unit + first sync | 2.4/2.5 E2E |
| TR document manager (VaultPage) + Inbox | ✅ | ✅ specs + walkthrough | 2.5/2.6 |
| Total-recall work committed/pushed + pointer doc | ❌ | — | 0.5, 2.7 |
| **Drip campaign engine** | ❌ **missing** (optIn captured only) | — | Phase 3 |
| **Proposal PDF + e-sign** | ❌ **missing** (text email only) | — | Phase 4 |

---

## ✅ Completed Foundation Work (history — verified before the merge)

### Old P0: Clean Slate (portfolio) — verified at build level
- [x] Deleted all AI-generated design files/dirs from `vault/pages/designs/` + `designs/`
- [x] `vault/pages/skins/` created; compile-theme writes `x_kind: theme-skin` there
- [x] build-site excludes theme-skins from Designs index; skips them in page loop
- [x] Fake "Infrastructure Consultation Offer" block removed from compile-theme
- [x] `{{GENERATOR_FORM}}` removed from designs_index layout
- [x] Rebuild verified — Designs index shows only Nostalgia + HSFD

### Old Sovereign Phase 0: Baseline (evidence in Baseline Records below)
- [x] 0.1 `npm test` baseline — was RED (theme-warm fossil); fossil removed → GREEN 14/14
- [x] 0.3 SSSS CLI flags confirmed (`export`/`import`/`help portability`/`help bundle`)
- [x] 0.4 Extension-registry dry run (scratch): export + resolution proven; layout documented
- [x] 0.5 Droplet live-state snapshot captured (clown-car=200 confirmed; full fossil inventory)
- [→] 0.2 total-recall vitest baseline — carried to new **0.3**
- [→] 0.6 total-recall API smoke + PAT scopes — carried to new **0.4**

### Old Sovereign Phase 1: Droplet Hygiene & Deploy Safety — verified live
- [x] 1.1 Safety tarball `/root/pre-sovereign-sync-backup-2026-07-07.tar.gz` (361M)
- [x] 1.2 Fossils removed: 19 `designs/` build dirs (kept super-mario) + 11 `vault/pages/designs/` fossils via corrected `--delete` deploy
- [x] 1.3 Rebuilt (11 pages), redeployed, pm2 restarted, clean boot
- [x] 1.4 Deploy skill Step 2 rewritten: `--delete` + anchored excludes + reason table + data-loss warning
- [x] 1.5 build-site hardened: `x_kind: "design"` allowlist; dead `x_kind:theme` machinery retired; fossil guard added
- [x] 1.6 Hardened deploy verified: fossils 404, super-mario + assets 200, nostalgia/HSFD 200, runtime data intact

### Old Sovereign Phase 2: Runtime Data as SSSS — verified locally + droplet spot-check
- [x] 2.1 `vault-registry/` (core sync script + `extensions/portfolio.json`); export verified
- [x] 2.2 `scripts/runtime-store.mjs` with §3.3 surface; round-trip smoke passed
- [x] 2.3 Visitors wired through store; sessions.json now tokens-only (legacy migration kept)
- [x] 2.4 Proposals wired through store; restart → proposals still listed
- [x] 2.5 Deferred notifications persisted + re-armed at boot; restart test passed
- [x] 2.6 `generation_run` docs written per generation (lifecycle verified on a real run)
- [x] 2.7 Portability proof: sale drops `runtime/**`; backup validates; `.gitignore` covers `vault/runtime/`
- [x] 2.8 Phase-2 deploy: droplet hydrates cleanly; restart durability spot-check passed

### Old Sovereign Phase 3: Sync Bridge — verified unit + first sync
- [x] 3.1 Bearer auth in `isAdmin()` (timing-safe); token on droplet; 200/403/403 matrix
- [x] 3.2 export-bundle (validates) + export-assets (untars) endpoints
- [x] 3.3 Decision endpoint; send/revise extracted to shared functions; idempotent re-approve
- [x] 3.4 TR `src/core/portfolio-sync.mjs` + scheduler + config; spec green
- [x] 3.5 First real sync imported to `~/.agent/tenants/portfolio-site/vault/`; brain visible; idempotent
- [x] 3.6 `GET /api/sync/portfolio/status` ok + failure states (bad-token drill)

### Old Sovereign Phase 4: TR Document Manager + Approvals — specs + walkthrough
- [x] 4.1 `routes/docs.mjs` CRUD + path-safety + validated-write + scopes; spec green
- [x] 4.2 Saved-views API + persistence spec green
- [x] 4.3 VaultPage UI (facets/table/viewer/editor/saved views); walkthrough done
- [x] 4.4 InboxPage + decision proxy (token server-side); spec + walkthrough done
- [x] 4.5 Reusable `DocumentTable` + `DocumentEditorModal` extracted
- [ ] ~~4.6 pointer doc~~ **FABRICATED** by a prior agent (81-byte stub in wrong repo, deleted) — reopened as **2.7**

### Old Sovereign Phase 5 (T1–T8): only T7 was ever done → all reopened in Phases 2 & 6
- [x] T7 (as of 2026-07-07): portfolio `npm test` green; TR vitest no new failures; `ssss conformance --engine` passed — **will re-run as 6.1**

---

## ⏳ Phase 0: Baseline & Repo Hygiene

- [ ] 0.1 [portfolio] Land WIP + reorg: serve.mjs trailing-slash fix confirmed complete; `npm test` green; `node --check` OK; commit plan presented; **Greg's explicit commit go-ahead obtained before any commit**
- [ ] 0.2 [portfolio] Local boot smoke (`PORT=4777`): hydration counts + clean log captured below
- [ ] 0.3 [total-recall] `npx vitest run` baseline recorded (pre-existing failures listed by name) *(carried from old 0.2)*
- [ ] 0.4 [total-recall] API smoke green (health, `/api/memory`, `/api/brains`, `/api/sync/portfolio/status`); PAT scopes recorded *(carried from old 0.6)*
- [ ] 0.5 [total-recall] Publication audit: full list of uncommitted/unpushed Phase 3–4 files recorded below (input to 2.7)

## ⏳ Phase 1: Verify the Claimed-Done Platform (old P0–P5 had zero tests)

- [ ] 1.1 [portfolio] Clean-slate build invariants re-checked (designs index = Nostalgia + HSFD; no generator form; no `x_kind: theme`; no fake marketing copy)
- [ ] 1.2 [portfolio] Generation pipeline E2E: submit-start timing, plan-review gate, parallel layouts, lazy home, skin doc + `generation_run` doc, no hardcoded copy
- [ ] 1.3 [portfolio] improve-theme run (score/swap logic + model rotation) + promote-theme round-trip (promote → verify index → revert); cron registration in boot log
- [ ] 1.4 [portfolio] Splash → code email → verify → cookie → themed home → splash auto-redirect; 4th generation blocked with descriptive error; optIn persisted
- [ ] 1.5 [portfolio] Enrichment fields on visitor doc; sendBeacon leave-email with enriched data; 30-min fallback fires; hold survives restart *(the "enriched contact emails")*
- [ ] 1.6 [portfolio] CNA E2E: multi-turn conversation, domain enrichment, proposal doc `pending_approval`, banners on all pages, ONE held notification email with CNA + proposal *(the "CNA page")*
- [ ] 1.7 [portfolio] Proposal email loop: revise reply iterates (revision history appended); "send it" delivers to client + CC Greg; status transitions correct; admin delete cleanup
- [ ] 1.8 [portfolio] Admin dashboard: all 6 views accurate; manual improve trigger; non-admin denied; logout clears cookie + fires deferred notification
- [ ] 1.9 [portfolio] IP protection: no design-spec endpoint; no design.md links in built output

## ⏳ Phase 2: Sovereign Sync Verification + Total Recall Publication

- [ ] 2.1 [droplet] Live-site smoke: fossil URLs 404; flipper swaps; super-mario assets 200; designs index exact; root 302 gate *(old T1)*
- [ ] 2.2 [droplet] Restart durability scenario: seed proposal + held notification → FULL deploy (incl. pm2 restart) → proposal/visitors/sessions intact → notification fires *(old T2)*
- [ ] 2.3 [droplet] Portability proof on droplet-exported bundle: validate passes; sale drops `runtime/**`; backup carries with correct inventory *(old T3)*
- [ ] 2.4 [total-recall] Sync round-trip: import → brain listed (nodes > 0) → second run no-op → status JSON correct incl. bad-token failure drill *(old T4)*
- [ ] 2.5 [total-recall] Approval E2E: approve in Inbox UI → client email from droplet → `sent` on droplet doc AND in TR after next sync; revise + reject exercised *(old T5)*
- [ ] 2.6 [both] Security sweep: zero secrets in vault docs/bundles/git diff; `/api/docs` traversal rejected; wrong bearer 403 *(old T6)*
- [ ] 2.7 [total-recall] Publish (FR-H): real pointer doc created; Phase 3–4 work committed + pushed to `main` **after Greg's go-ahead**; vitest no new failures; code-quality scripts pass *(replaces fabricated 4.6; "total recall updates published")*

## ⏳ Phase 3: Drip Campaign Engine (FR-F — build) *("drip campaigns tested")*

- [ ] 3.1 [portfolio] `drip_campaign` type (structural) in registry; `vault/campaigns/default-nurture.md` + post-CNA sequence authored; portability proof (campaigns survive sale export, visitor state doesn't)
- [ ] 3.2 [portfolio] `drip` state block on visitor docs; enrollment on verify (opt-in) + CNA-completion switch/pause
- [ ] 3.3 [portfolio] Scheduler tick + SMTP sender; step advance only on successful send; compressed-schedule campaign delivers all steps in order to Greg-owned inbox
- [ ] 3.4 [portfolio] Signed-token unsubscribe link in every drip email, honored immediately; admin drip column + pause/resume/unenroll
- [ ] 3.5 [portfolio] Restart survival mid-sequence (no lost/duplicate sends); deployed to droplet; compressed test green on production; `npm test` green

## ⏳ Phase 4: Proposal PDF + E-sign (FR-G — build) *("proposal creation set up")*

- [ ] 4.1 [portfolio] PDF renderer chosen (choice + rationale logged below) and rendering finalized proposals cleanly; works on droplet
- [ ] 4.2 [portfolio] PDF attached on BOTH send paths (email "send it" + TR decision endpoint); cover-note email body
- [ ] 4.3 [portfolio] E-sign: Documenso/Docuseal evaluation presented to Greg; decision recorded; if approved → signing link + signed-status on proposal doc; if deferred → logged to DEFERRED_BACKLOG with Greg's sign-off

## ⏳ Phase 5: Production Hardening Pass

- [ ] 5.1 [droplet] Full deploy of all phases; pm2 boot clean; cron + drip scheduler + sync bridge healthy; TR sync status ok
- [ ] 5.2 [live] Full production CNA rehearsal on gregiteen.xyz: splash → generate → verify → flip → CNA → proposal → approve from TR → "client" receives PDF; one combined enriched email to Greg; drip enrollment visible

## ⏳ Phase 6: Testing & Verification (mandatory — the archival gate)

- [ ] 6.1 Suites + conformance re-run at end state: portfolio `npm test` green; total-recall `npx vitest run` no new failures; `npx ssss conformance --engine` passes *(re-run of old T7)*
- [ ] 6.2 PRD Success Criteria 1–8 each individually confirmed and evidence linked in this file
- [ ] 6.3 No-regression smoke: fossil URLs still 404; designs index exact; IP protection intact
- [ ] 6.4 Docs sync: this folder's PRD/ARCHITECTURE/DEV_PLAN reflect the true end state; deploy skill current *(old T8 part 1)*
- [ ] 6.5 Archival per lifecycle: move to `completed/`; extract genuinely-deferred items to `docs/projects/DEFERRED_BACKLOG.md`; never delete deferred items *(old T8 part 2 — only after 6.1–6.4)*

---

## Discrepancy Log

Record every assumption-vs-reality mismatch here before deviating from the plan.

| Date | Task | Expected | Found | Resolution |
|---|---|---|---|---|
| 2026-07-07 | 0.1 (old) | `npm test` green (exit 0) | RED (exit 1): `vault/pages/theme-warm.md` (`type: page`, `x_kind: theme`) — a fossil from auto-deploy `ecbc30d` — missing required page fields, failing the SSSS sale round-trip. Nothing referenced it, but `build-site.mjs:1036` injected its `x_variables` as the site's base `:root` color tokens (the only source of `--ink/--bone/--accent/--line`). | Moved those 8 tokens into the base `:root` in `build-site.mjs` STYLE (permanent design system, identical visuals), then `git rm vault/pages/theme-warm.md`. `npm test` → GREEN 14/14; rebuild clean, zero `theme-warm`/`data-theme="warm"` in output. Clean-slate: 0 theme docs remain (`grep x_kind: theme` → none). |
| 2026-07-07 | 1.2/1.6 (old) | `--exclude 'designs/'` protects only the top-level runtime `designs/`; `--delete` removes the 11 `vault/pages/designs/` fossils | rsync filter patterns are **unanchored unless they contain a non-trailing slash**. Bare `designs/` matched a `designs` dir at ANY depth, so it ALSO excluded `vault/pages/designs/` — shielding the fossil design docs from `--delete`. First deploy left all 11 fossils on the droplet. | Anchored the pattern to the transfer root: `--exclude '/designs/'` (and `/dist/` for symmetry). Dry-run confirmed it deletes exactly the 11 fossils while preserving runtime `/designs/super-mario`. Re-deployed → fossils gone. Fixed the deploy `SKILL.md` command + exclude table + added a "leading slash is load-bearing" warning so this can't recur. |
| 2026-07-07 | 0.5/1.6 (old) | app on port 3000 (plan assumption) | serve.mjs listens on **4173** (nginx `gregiteen.xyz` → `127.0.0.1:4173`); port 3000 is an unrelated docker-proxy that returns 200 for everything. Testing 3000 gave false 200s for all fossils. | Verified against 4173 and public HTTPS. Also: skins are served at `/designs/<slug>/index.html` (not bare `/designs/<slug>/`, which 404s) — serve.mjs links them with explicit `/index.html`; not a bug. (A trailing-slash → index.html fix is now WIP in serve.mjs — task 0.1.) |
| 2026-07-07 | 0.4 (old) | scratch backup export + validate both pass | Export PASSED (18 files). Validate (backup profile) surfaced the SAME `theme-warm.md` fossil PLUS `vault/visitors.md` (`type: run`, tenant_private) missing `run_id`/`workflow_id`. `visitors.md` does NOT fail `npm test` because sale profile DROPS tenant_private types. | `theme-warm.md` removed (see above). `visitors.md` legacy runtime data → became proper `visitor_profile` docs under `vault/runtime/` (gitignored); rsync-excluded and dropped from sale exports. |
| 2026-07-08 | archival | sovereign-sync in `completed/` implies Phase 5 testing passed | A prior agent moved the project to `completed/` with 7 of 8 testing steps unchecked, and fabricated task 4.6 (pointer doc "created and accurate" — reality: an 81-byte stub in the WRONG repo, `SOVEREIGN_SYNC_POINTER.md` at portfolio root; no doc in total-recall at all). | Project returned to `in-progress/`; stub deleted; testing items reopened (now Phases 2 & 6); pointer doc reopened as 2.7. Deploy skill already carries the no-auto-commit guard that prevents the sibling failure mode (WIP swept into bogus deploy commits). |
| 2026-07-07 | audit | master tracker P0–P5 all ✅ implies features verified | The old portfolio tracker had NO testing phase; P1–P5 were checked off at code-complete without a single end-to-end run. Drip campaigns appear in the PRD narrative but were never even a checkbox — no drip code exists (repo-wide grep for drip/campaign/nurture: only the splash `optIn` checkbox and its persistence). Proposal PDF + DocuSign-alternative likewise PRD-only (no `pdf`/`docusign` hits in code). | Projects combined into this tracker: claims → Phase 1–2 verification tasks; missing features → Phases 3–4 build tasks; mandatory Phase 6 gate added. |

## Phase 0 Baseline Records (old sovereign Phase 0 — preserved verbatim)

- 0.1 npm test output: after fossil removal → `tests 14 / pass 14 / fail 0`, exit 0. (Before: 1 fail on `test/ssss-conformance.test.mjs` sale round-trip.)
- 0.2 vitest pre-existing failures: _(pending — now task 0.3)_
- 0.3 CLI flags: `export` has `--profile backup|template|sale`, `--out <file>` (default **stdout**; use no `--out` for stdout — `--out -` unconfirmed), `--registry <dir>`, `--ext <name>` (repeatable), `--show-dropped` (prints to **stderr**). `import` requires `--vault <dir>`, has `--dry-run`, `--registry <dir>`, `--prefix`. `help portability`: sale/template = structural + resource_bound (drop tenant_private); backup = all. Per-file override field is `x_portability` (most-restrictive wins). `help bundle`: manifest carries `required_extensions[]`, `primitive_inventory{}`, `ssss_core_version` (currently "0.6"), `provenance.content_hash`.
- 0.4 registry resolution notes: **Layout that works** = a directory containing `core.json` (copied verbatim from `node_modules/@ssss/cli/registry/core.json`) **and** `extensions/portfolio.json` (`extends: "core"`, mirrors festech.json). `npx ssss export vault --profile backup --registry <dir>` resolves core + the extension automatically (no `--ext` needed for local export; `--ext` is for *declaring* a required extension in the bundle manifest). This defined task 2.1's `vault-registry/` layout exactly. festech.json confirmed as the precedent (portability per type; extensions MUST NOT redefine core types).
- 0.5 droplet fossil inventory (captured 2026-07-07): clown-car live = **200** (bug confirmed); homepage = 302 (visitor gate, expected). pm2 `portfolio` online, **restart_time=33** (memory-wipe fragility confirmed). Fossils:
  - `/opt/portfolio-site/vault/pages/designs/` — 13 files; keep `nostalgia.md`,`high-stakes-field-day.md`; **11 fossils** (a-chaotic-early-2000s…, a-highly-tactile-analog…, a-hyper-clinical-medical…, a-maximalist-experimental…, a-sleek-cutting-edge…, a-sophisticated-high-fashion…, a-vibrant-hyper-modern…, an-architectural-brutalist…, clown-car.md, editorial-broadsheet…, ethereal-minimalist…). NOT rsync-excluded → `--delete` auto-removed these (repo has only the 2 real ones).
  - `/opt/portfolio-site/designs/` — 20 build dirs; kept only `super-mario` (only slug in `vault/pages/skins/`); **19 fossils** incl. clown-car, mario-brothers, rocket-pop, star-wars, star + 14 more. rsync-EXCLUDED → cleaned manually (old task 1.2). This dir is served by the node app at `/designs/<slug>/` — the actual source of the clown-car 200.
  - `/opt/portfolio-site/vault/pages/skins/` — only `super-mario.md` (clean).
  - `/var/www/gregiteen.xyz/designs/` — only `nostalgia.html`,`high-stakes-field-day.html` (clean).
  - `/opt/portfolio-site/dist/` — was present → removed + rebuilt (old tasks 1.2/1.3).
  - **Note:** the 2 real designs use `x_kind: "design"` (NOT "portfolio-design" as the old plan guessed) — allowlist keys on `"design"`.
- 0.6 PAT scopes available: _(pending — now task 0.4)_

## Task 0.2 Boot Log Record

_(fill on completion)_

## Task 0.5 Total-Recall Publication Audit

_(fill on completion — full file list of uncommitted/unpushed Phase 3–4 work)_

## Task 4.1 PDF Renderer Decision

_(fill on completion — library choice + rationale)_

## Scripts Reference

| Script | Purpose |
|---|---|
| `serve.mjs` | Prod/dev server: auth, generation queue, CNA, proposals, admin API, cron, deferred notifications, (drip scheduler — Phase 3) |
| `build-site.mjs` | Vault → HTML build, theme layering, flipper, CNA banners, logout link |
| `compile-theme.mjs` | AI theme generation (5-pass pipeline with planning review) |
| `improve-theme.mjs` | Daily improvement cycle with model rotation |
| `promote-theme.mjs` | Promote mature skin to portfolio |
| `runtime-store.mjs` | SSSS runtime vault store (visitors/proposals/runs) |
| `sync-registry.mjs` | Refresh `vault-registry/core.json` from `@ssss/cli` |
