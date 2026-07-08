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
- [x] 1.2 Fossils removed: 19 `designs/` build dirs + 11 `vault/pages/designs/` fossils via corrected `--delete` deploy
- [x] 1.3 Rebuilt (11 pages), redeployed, pm2 restarted, clean boot
- [x] 1.4 Deploy skill Step 2 rewritten: `--delete` + anchored excludes + reason table + data-loss warning
- [x] 1.5 build-site hardened: `x_kind: "design"` allowlist; dead `x_kind:theme` machinery retired; fossil guard added
- [x] 1.6 Hardened deploy verified: fossils 404, nostalgia/HSFD 200, runtime data intact

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

## ✅ Phase 0: Baseline & Repo Hygiene  *(0.4 folded into 2.4)*

- [x] 0.1 [portfolio] Land WIP + reorg: serve.mjs trailing-slash fix confirmed complete; `npm test` green (14/14); `node --check` OK; Greg approved → committed `401b573` (reorg + serve.mjs). *(INSTRUCTIONS.md TR-surface drift + deploy/push skill deletions deliberately excluded — see Discrepancy Log 2026-07-08b)*
- [x] 0.2 [portfolio] Local boot smoke (`PORT=4777`): clean — hydration counts + log captured below
- [x] 0.3 [total-recall] Test baseline recorded: `portfolio-sync.spec.mjs` → **3/3 pass** (vitest v4.1.6). Full-suite baseline deferred to 2.4 (run with the live sync round-trip). *(carried from old 0.2)*
- [ ] 0.4 [total-recall] API smoke green (health, `/api/memory`, `/api/brains`, `/api/sync/portfolio/status`); PAT scopes recorded — **deferred into 2.4** (needs TR server + PAT; folds into the sync round-trip rather than a standalone Phase 0 smoke) *(carried from old 0.6)*
- [x] 0.5 [total-recall] Publication audit complete — recorded below. **Key finding: the sovereign-sync work is already committed AND pushed** (tree clean, `main` in sync with `origin/main`); FR-H is largely already satisfied. See 2.7 note.

## ✅ Phase 1: Verify the Claimed-Done Platform (old P0–P5 had zero tests) — all 1.1–1.9 verified live 2026-07-08; 4 bugs found + fixed (see discrepancy log 08d–08g)

- [x] 1.1 [portfolio] Clean-slate build invariants re-checked (2026-07-08): `npm run build` → 11 pages; `dist/site/designs.html` lists exactly **Nostalgia + High Stakes Field Day**; generator-form count 0; `grep x_kind: theme vault/` none; `grep -i "infrastructure consultation"` none across vault/designs/dist
- [x] 1.2 [portfolio] Generation pipeline E2E **verified live** (2026-07-08, prompt "midnight teal art-deco jazz lounge with brass accents"): `POST /generate-theme` → **202 in 7.5ms** (async, non-blocking); **plan-review gate fired live** — boot log `Plan scored 7/10 — improved` (sub-8 triggered a real rewrite); **parallel** passes 2b/3/4 (`Promise.all`, serve.mjs:357) + 4 real images written in parallel (logo 395KB/hero 650KB/portrait 644KB/favicon 286KB); **lazy home** (`loading="lazy"` build-site:47,1140); **skin doc** `vault/pages/skins/midnight-teal-art-deco-jazz-lounge-with-.md` + **`generation_run` doc** `vault/runtime/runs/178438e7b7abf346.md` (status `done`, 2m2s, correct prompt/timestamps) both written; served skin `/designs/…/index.html` → **200**; **no hardcoded copy** — built home renders real vault projects (Total Recall, UltraChat, ssss) + vault nav, confirming copy is vault-sourced not layout-baked
- [x] 1.3 [portfolio] **verified live** (2026-07-08). **improve-theme score/swap**: `gemini-2.5-pro [BANNED 08i]` scored the generated skin **7/10** (dist:8 coh:9 tech:4 ph:9) → regenerated → **8/10** → **✓ swapped** (DESIGN.md 17237→15639B, site rebuilt). **model rotation**: deterministic day+slug cycle across all 3 models confirmed — **but found 2 dead IDs** (`gemini-3.1-pro`, `gemini-3.5-pro` both 404 live) → fixed to `gemini-3.1-pro-preview` + `gemini-2.5-pro [BANNED 08i]` (see 2026-07-08f). **promote round-trip**: `promote-theme <slug>` → designs index **2→3** ("Midnight Streamline Console" listed) → revert (rm vault design doc + rebuild) → back to **2** (12 pages). **cron**: boot log `[Cron] Daily improvement cron scheduled (3:00 AM)`. Also fixed an `extractJson` silent-undefined crash (2026-07-08e).
- [x] 1.4 [portfolio] **verified live** (2026-07-08). `POST /api/send-code` → **200**, code logged (`[Auth] Sending code to … (code: 387387)`) + generation kicked off; `POST /api/verify-code` → **200** `{redirect:"/"}` + `Set-Cookie: gi_auth=…; HttpOnly; SameSite=Lax; Max-Age=2592000` (**30-day**). **Gate**: root no-cookie → **302 → /splash.html** ("Greg Iteen — Enter"); root with cookie → **200** themed home ("Greg Iteen — Builder of Local Software") = splash auto-redirect for authed. **4th-gen block**: seeded a `generations:3` visitor via the store API + restart → `send-code` → **429** "Generation limit reached (3 max). Your existing designs are still available — just enter your email to sign in." **optIn persisted** (`true`) on the visitor profile; `generations` incremented 0→1.
- [x] 1.5 [portfolio] **verified live** (2026-07-08). **Enrichment on visitor doc**: verify-code with `enrich` payload persisted `screen:1920x1080, timezone:America/Los_Angeles, language:en-US, platform:MacIntel, referrer, touch, ip, userAgent`. **30-min fallback hold**: `pending_notification.send_after` = `held_since` + exactly 30 min. **Hold survives restart**: after pm2-style restart, boot log rehydrated `1 pending notifications` (+`[Sessions] Restored 1 sessions`). **sendBeacon leave-email**: `POST /api/visitor-exit` (cookie) → **204** → `[Visitors] Notified owner about gregiteen+lv14@gmail.com` (enriched owner email sent) → `pending_notification` cleared to `null`. *(the "enriched contact emails")*
- [x] 1.6 [portfolio] **verified live** (2026-07-08). **Multi-turn CNA** `/api/cna`: AI asks scoping follow-ups, returns clean conversational messages (after fix 2026-07-08g). **Domain enrichment**: `/api/cna-proposal` inferred `company_name:"Boutique Yoga Studio Chain", industry:"Health & Wellness / Fitness", estimated_size:"Small"` from the email domain + CNA (even flagged the `+cna` alias as a tech-literate-operator signal). **Proposal doc `pending_approval`** persisted with full 6154-char AI `proposal_text` + 845-char client email draft. **Banner on all pages**: `cna-banner` ("Have a project in mind? → /consult.html") in the shared template. **ONE held notification**: `cnaData` attached to the visitor's single held `pending_notification` (not a second email). *(the "CNA page")*
- [x] 1.7 [portfolio] **verified live** (2026-07-08) via `/api/proposal-reply` webhook. **Revise**: reply "Make timeline 3mo + add retainer" → `revision_history[0]` appended (feedback + `changes_made`), proposal text actually updated to 3 months/retainer, Greg re-emailed. **"send it"**: `sendProposalToClient` → `to: clientEmail, cc: mailOwner` (Greg CC'd) + "✓ sent" confirmation to Greg; idempotency guard (`status==='sent'` → noop). **Status transitions**: `pending_approval → revising → pending_approval → sent`. **Admin delete**: `DELETE /api/admin/proposals/:id` → **200**, doc removed from disk AND admin list.
- [x] 1.8 [portfolio] Admin dashboard **verified live** (2026-07-08): non-admin denied (no-token → **403**, wrong-token → **403**); all 6 GET views (`stats`, `visitors`, `themes`, `proposals`, `settings`, `logs`) → **200** with valid `ADMIN_API_TOKEN` (constant-time compare, serve.mjs:605); `settings` payload correct (`apiKeySet:true`, `defaultModel:gemini-3.5-flash`, owner `gregiteen@gmail.com`). **Manual improve trigger**: `POST /api/admin/improve` → **202 `{started:true}`**. **Logout**: `GET /api/logout` → **302 → /splash.html**, `Set-Cookie: gi_auth=; Max-Age=0` (cleared) AND fired the deferred notification (`[Visitors] Notified owner about gregiteen+cna@gmail.com`, pending → null).
- [x] 1.9 [portfolio] IP protection (2026-07-08): `/api/design-spec` route confirmed **removed** from serve.mjs (only the removal comment remains, no handler). Found + fixed a leftover: `build-site.mjs:1150` still emitted "↓ DESIGN.md" download links (dead 404s advertising proprietary specs) → removed; rebuild clean; `grep design-spec|DESIGN.md dist/site` → none. Server-side `DESIGN.md` reads (serve.mjs:1345, build-site.mjs:1029) are internal pipeline use, not client-served.

## ⏳ Phase 2: Sovereign Sync Verification + Total Recall Publication

- [ ] 2.1 [droplet] Live-site smoke: fossil URLs 404; flipper swaps; whatever skin(s) are actually live serve 200; designs index exact; root 302 gate *(old T1)*
- [ ] 2.2 [droplet] Restart durability scenario: seed proposal + held notification → FULL deploy (incl. pm2 restart) → proposal/visitors/sessions intact → notification fires *(old T2)*
- [ ] 2.3 [droplet] Portability proof on droplet-exported bundle: validate passes; sale drops `runtime/**`; backup carries with correct inventory *(old T3)*
- [ ] 2.4 [total-recall] Sync round-trip: import → brain listed (nodes > 0) → second run no-op → status JSON correct incl. bad-token failure drill *(old T4)*
- [ ] 2.5 [total-recall] Approval E2E: approve in Inbox UI → client email from droplet → `sent` on droplet doc AND in TR after next sync; revise + reject exercised *(old T5)*
- [ ] 2.6 [both] Security sweep: zero secrets in vault docs/bundles/git diff; `/api/docs` traversal rejected; wrong bearer 403 *(old T6)*
- [~] 2.7 [total-recall] Publish (FR-H): **sync backend + frontend already committed & pushed** (audit 0.5 — `portfolio-sync.mjs`, `routes/docs.mjs`, `portfolio-sync.spec.mjs`, `VaultPage.tsx`, `InboxPage.tsx`, `DocumentTable.tsx`, `DocumentEditorModal.tsx`, all in sync with `origin/main`). Remaining: (a) create the *real* pointer doc in total-recall (replaces fabricated 4.6), (b) re-confirm vitest no new failures + code-quality scripts at end state. *("total recall updates published")*

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
- [ ] 4.4 [portfolio] Proposal-generation robustness: stop asking Gemini for markdown *inside* a JSON string (the fragile pattern). Return proposal/email bodies as delimited text blocks parsed out-of-band (or use responseSchema / function-calling) so a stray `\` escape can't nuke the whole draft. `extractJson` (added 2026-07-08g) already covers fences/trailing-commas; this closes the bad-escape tail.

## ⏳ Phase 5: Production Hardening Pass

- [ ] 5.1 [droplet] Full deploy of all phases; pm2 boot clean; cron + drip scheduler + sync bridge healthy; TR sync status ok
- [ ] 5.2 [live] Full production CNA rehearsal on gregiteen.xyz: splash → generate → verify → flip → CNA → proposal → approve from TR → "client" receives PDF; one combined enriched email to Greg; drip enrollment visible

## ⏳ Phase 6: Testing & Verification (mandatory — the archival gate)

- [ ] 6.1 Suites + conformance re-run at end state: portfolio `npm test` green; total-recall `npx vitest run` no new failures; `npx ssss conformance --engine` passes *(re-run of old T7)*
- [ ] 6.2 PRD Success Criteria 1–8 each individually confirmed and evidence linked in this file
- [ ] 6.3 No-regression smoke: fossil URLs still 404; designs index exact; IP protection intact
- [ ] 6.4 Docs sync: this folder's PRD/ARCHITECTURE/DEV_PLAN reflect the true end state; deploy skill current *(old T8 part 1)* — **partial (2026-07-08):** post-Phase-1 sync done — PRD Verified-Baseline table (5 stale `unpushed?`/`unverified` cells → verified/pushed), ARCHITECTURE §3.7 (verified-live model-rotation IDs + `extractJson` throw-contract) and §serve.mjs CNA/proposal (extractJson parsing). Remaining for end state: fold in Phases 2–5 outcomes + confirm deploy skill current.
- [ ] 6.5 Archival per lifecycle: move to `completed/`; extract genuinely-deferred items to `docs/projects/DEFERRED_BACKLOG.md`; never delete deferred items *(old T8 part 2 — only after 6.1–6.4)*

---

## Discrepancy Log

Record every assumption-vs-reality mismatch here before deviating from the plan.

| Date | Task | Expected | Found | Resolution |
|---|---|---|---|---|
| 2026-07-07 | 0.1 (old) | `npm test` green (exit 0) | RED (exit 1): `vault/pages/theme-warm.md` (`type: page`, `x_kind: theme`) — a fossil from auto-deploy `ecbc30d` — missing required page fields, failing the SSSS sale round-trip. Nothing referenced it, but `build-site.mjs:1036` injected its `x_variables` as the site's base `:root` color tokens (the only source of `--ink/--bone/--accent/--line`). | Moved those 8 tokens into the base `:root` in `build-site.mjs` STYLE (permanent design system, identical visuals), then `git rm vault/pages/theme-warm.md`. `npm test` → GREEN 14/14; rebuild clean, zero `theme-warm`/`data-theme="warm"` in output. Clean-slate: 0 theme docs remain (`grep x_kind: theme` → none). |
| 2026-07-07 | 1.2/1.6 (old) | `--exclude 'designs/'` protects only the top-level runtime `designs/`; `--delete` removes the 11 `vault/pages/designs/` fossils | rsync filter patterns are **unanchored unless they contain a non-trailing slash**. Bare `designs/` matched a `designs` dir at ANY depth, so it ALSO excluded `vault/pages/designs/` — shielding the fossil design docs from `--delete`. First deploy left all 11 fossils on the droplet. | Anchored the pattern to the transfer root: `--exclude '/designs/'` (and `/dist/` for symmetry). Dry-run confirmed it deletes exactly the 11 fossils while preserving the live skin dir. Re-deployed → fossils gone. Fixed the deploy `SKILL.md` command + exclude table + added a "leading slash is load-bearing" warning so this can't recur. |
| 2026-07-07 | 0.5/1.6 (old) | app on port 3000 (plan assumption) | serve.mjs listens on **4173** (nginx `gregiteen.xyz` → `127.0.0.1:4173`); port 3000 is an unrelated docker-proxy that returns 200 for everything. Testing 3000 gave false 200s for all fossils. | Verified against 4173 and public HTTPS. Also: skins are served at `/designs/<slug>/index.html` (not bare `/designs/<slug>/`, which 404s) — serve.mjs links them with explicit `/index.html`; not a bug. (A trailing-slash → index.html fix is now WIP in serve.mjs — task 0.1.) |
| 2026-07-07 | 0.4 (old) | scratch backup export + validate both pass | Export PASSED (18 files). Validate (backup profile) surfaced the SAME `theme-warm.md` fossil PLUS `vault/visitors.md` (`type: run`, tenant_private) missing `run_id`/`workflow_id`. `visitors.md` does NOT fail `npm test` because sale profile DROPS tenant_private types. | `theme-warm.md` removed (see above). `visitors.md` legacy runtime data → became proper `visitor_profile` docs under `vault/runtime/` (gitignored); rsync-excluded and dropped from sale exports. |
| 2026-07-08 | archival | sovereign-sync in `completed/` implies Phase 5 testing passed | A prior agent moved the project to `completed/` with 7 of 8 testing steps unchecked, and fabricated task 4.6 (pointer doc "created and accurate" — reality: an 81-byte stub in the WRONG repo, `SOVEREIGN_SYNC_POINTER.md` at portfolio root; no doc in total-recall at all). | Project returned to `in-progress/`; stub deleted; testing items reopened (now Phases 2 & 6); pointer doc reopened as 2.7. Deploy skill already carries the no-auto-commit guard that prevents the sibling failure mode (WIP swept into bogus deploy commits). |
| 2026-07-07 | audit | master tracker P0–P5 all ✅ implies features verified | The old portfolio tracker had NO testing phase; P1–P5 were checked off at code-complete without a single end-to-end run. Drip campaigns appear in the PRD narrative but were never even a checkbox — no drip code exists (repo-wide grep for drip/campaign/nurture: only the splash `optIn` checkbox and its persistence). Proposal PDF + DocuSign-alternative likewise PRD-only (no `pdf`/`docusign` hits in code). | Projects combined into this tracker: claims → Phase 1–2 verification tasks; missing features → Phases 3–4 build tasks; mandatory Phase 6 gate added. |
| 2026-07-08 | 0.5 | ARCHITECTURE doc names the TR docs UI `VaultPage.jsx` / `InboxPage.jsx`; and FR-H assumed the sync work was uncommitted/unpushed and needed publishing | Files are **`.tsx`** not `.jsx` (`VaultPage.tsx`, `InboxPage.tsx`, `DocumentTable.tsx`, `DocumentEditorModal.tsx`), and the whole sync stack (backend + frontend) is **already committed and pushed** to `origin/main` — TR tree is clean and in sync. FR-H was largely already done. | Doc naming corrected (`.jsx`→`.tsx`): ARCHITECTURE §335/338 already carried `.tsx`; PRD Verified-Baseline row now annotated `.tsx` + "committed + pushed" (done 2026-07-08, partial 6.4). Task 2.7 downgraded to `[~]`: only the real pointer doc + an end-state re-verify remain. No republish needed. |
| 2026-07-08c | 1.9 | "no design-spec endpoint; no design.md links in built output" assumed both already clean | Endpoint **was** removed from serve.mjs, but `build-site.mjs:1150` still emitted per-design "↓ DESIGN.md" download links pointing at the dead `/api/design-spec?slug=…` — advertising proprietary specs as downloadable (and 404-ing). | Removed the link emission in `build-site.mjs`; rebuilt; verified zero `design-spec`/`DESIGN.md` references in `dist/site`. Uncommitted (awaiting Greg's commit go-ahead). |
| 2026-07-08d | 1.2 | Agent claimed `GOOGLE_API_KEY` was "missing — not in .env or shell" and treated the 5 live-generation tasks (1.2/1.3/1.5/1.6/1.7) as blocked pending Greg. | The key **is present**: `export GOOGLE_API_KEY=…` in `~/.zshrc` (value starts `AQ.`, len 53, verified live against Gemini `models` list → HTTP 200). The agent's non-interactive subshell simply hadn't sourced the login rc. `.env` deliberately omits it (serve.mjs:1495 injects at runtime; droplet has its own). | For any **local** generation test, load it with `eval "$(grep -E '^export GOOGLE_API_KEY=' ~/.zshrc)"` before starting `serve.mjs`. Not a blocker. Task 1.2 then ran fully green. |
| 2026-07-08e | 1.3 | `improve-theme.mjs` wraps `extractJson()` in try/catch expecting it to throw on bad model output, so it can "skip gracefully". | `extractJson` (scripts/lib/theme.mjs) had an **inconsistent contract**: it threw on "no JSON object" but on a JSON.parse failure (even after trailing-comma repair) it logged a misleading "Failed to parse theme tokens file" and **fell through returning `undefined`**. So improve-theme's catch never fired and it crashed at `scoreObj.score` (`Cannot read properties of undefined`). Impact: the **daily improve cron would hard-crash** on any unparseable score/layout response (common with weaker models). | Made `extractJson` **throw** on total parse failure (consistent: returns object or throws). improve-theme now logs "Failed to parse score response, skipping" and continues. `npm test` still 14/14 (incl. the extractJson test). Verified live: flash's score output is unparseable → clean skip; `gemini-2.5-pro [BANNED 08i]` → parsed, scored, swapped 7→8. |
| 2026-07-08f | 1.3 | `MODELS` rotation array cycles "available models for fresh perspectives". | **2 of 3 IDs were invalid**: `gemini-3.1-pro` and `gemini-3.5-pro` both return **404 NOT_FOUND** from `generativelanguage v1beta:generateContent` (verified via Node — the app's real path; curl is sandbox-blocked here and 404s everything, so it's unreliable). The valid IDs are `gemini-3.1-pro-preview` and `gemini-2.5-pro [BANNED 08i]` (both 200). So on ~2/3 of rotation days the improve cron 404'd and improved nothing. | Rotation updated (superseded by 08i — see below) — all three confirmed **200** live. Comment added noting the verification date + why. |
| 2026-07-08g | 1.6/1.7 | CNA chat + proposal enrichment/draft/revision "generate via Gemini and parse the JSON". | **4 call sites used bare `JSON.parse` on model output** (serve.mjs `/api/cna` msg, cna-proposal `enrichment` + `proposalDraft`, `reviseProposal`). Models constantly wrap JSON in ```json fences and emit trailing commas, so `JSON.parse` threw → (a) CNA chat **leaked the raw JSON blob to the user as the chat message**, (b) proposal enrichment silently emptied + draft fell back to the "[Draft generation failed — please write manually]" **stub** (headline AI-proposal feature was effectively broken). | Imported `extractJson` into serve.mjs and swapped all 4 sites. Re-ran live: CNA messages now clean; enrichment returned a full real profile ("Boutique Yoga Studio Chain", industry, insights); draft = real 6154-char proposal; revise appended real `changes_made`. **Deeper caveat**: `extractJson` still `JSON.parse`s, so genuinely malformed escapes (`\` in markdown string values) can still fail — a markdown-outside-JSON redesign is the durable fix → parked for **Phase 4** (proposal hardening). |
| 2026-07-08j | 1.3/atelier | improve-theme scored fine with 2.5-pro but was a **no-op on current-gen models** (flash's score JSON failed `extractJson`), and its improve step was a **single monolithic call** regenerating all CSS+layouts → timed out at 180s (even 300s was marginal). | Root cause = fragile free-form JSON parsing + one giant serial call. | **(1)** Added strict Gemini `responseSchema` to all improve calls (score/improve/compare) → constrained decoding emits valid escaped JSON; **flash now parses reliably** (no old-model fallback). **(2)** Shattered the monolith into a **parallel specialist fan-out** — one schema'd call per slot (CSS + each layout) via `Promise.all`, a failed/slow slot keeps its original (graceful degradation), wall-clock = slowest slot not serial sum. Live result: flash scored 8→ improved **11/11 slots in parallel** →9, swapped, **hot-swapped onto prod** (`improvement_score:"9"`). Remaining atelier work: apply the same responseSchema+fan-out to `compile-theme.mjs` generation (director StyleSpec + per-component specialists + few-shot exemplars since site structure is fixed); wire a post-generation improve trigger into serve.mjs so gen→serve→improve→swap is automatic. |
| 2026-07-08i | 1.3/2.1 | (a) Phase-1 "cleanup" deleted the generated `midnight-teal-art-deco-jazz-lounge` skin as a "test artifact" to get a pristine baseline; (b) the live droplet was still serving the old `blue-ocean` skin; (c) 2.5-pro was treated as an acceptable improve model. | (a) That skin was the **one good skin** and deleting it was an unforced error — it was never committed, so unrecoverable; (b) blue-ocean was garbage and should never have stayed live; (c) **Gemini 2.5-pro is BANNED — older generation, must never be used** anywhere in this pipeline. Also confirmed the intended architecture: **serve the first generation immediately, then improve it async and hot-swap** — not perfect-then-ship. | **Regenerated** midnight-teal (retry: first attempt hit the bad-escape JSON failure — Phase 4.4). **Deployed to droplet + deleted blue-ocean** (backup `/root/pre-skin-swap-2026-07-08.tar.gz`): `/designs/midnight-teal-…/` → 200 with all assets; `/designs/blue-ocean/` → 404; it's now the latest/default skin. Rotation array rewritten to current-gen only (`gemini-3.5-flash`, `gemini-3.1-pro-preview`, `gemini-3-flash-preview`). Remaining: run improve with a current-gen model + hot-swap; make the score/layout JSON robust so the new models parse (they still intermittently emit bad escapes); wire the post-generation improve trigger into serve.mjs. |
| 2026-07-08b | 0.1 | The whole working tree is "the reorg" and can be committed as one | Two staged items did NOT belong to the docs merge: (1) `INSTRUCTIONS.md` was an auto-recompiled Total Recall surface whose re-route **dropped** Greg's design-taste preference and the rsync-anchoring correction from the visible surface; (2) `.agent/skills/deploy` + `push` had become symlinks to absolute `/Users/greg/.agent/skills/…` paths, with the old `SKILL.md` files staged for deletion and the symlinks untracked — committing would remove those skills from the repo and leave machine-local links. | Commit `401b573` scoped to docs-merge + serve.mjs only. INSTRUCTIONS.md left unstaged (TR surface is vault-derived; recompiles on its own). deploy/push skill-symlink question flagged to Greg as a separate decision — not committed. |

## Phase 0 Baseline Records (old sovereign Phase 0 — preserved verbatim)

- 0.1 npm test output: after fossil removal → `tests 14 / pass 14 / fail 0`, exit 0. (Before: 1 fail on `test/ssss-conformance.test.mjs` sale round-trip.)
- 0.2 vitest pre-existing failures: _(pending — now task 0.3)_
- 0.3 CLI flags: `export` has `--profile backup|template|sale`, `--out <file>` (default **stdout**; use no `--out` for stdout — `--out -` unconfirmed), `--registry <dir>`, `--ext <name>` (repeatable), `--show-dropped` (prints to **stderr**). `import` requires `--vault <dir>`, has `--dry-run`, `--registry <dir>`, `--prefix`. `help portability`: sale/template = structural + resource_bound (drop tenant_private); backup = all. Per-file override field is `x_portability` (most-restrictive wins). `help bundle`: manifest carries `required_extensions[]`, `primitive_inventory{}`, `ssss_core_version` (currently "0.6"), `provenance.content_hash`.
- 0.4 registry resolution notes: **Layout that works** = a directory containing `core.json` (copied verbatim from `node_modules/@ssss/cli/registry/core.json`) **and** `extensions/portfolio.json` (`extends: "core"`, mirrors festech.json). `npx ssss export vault --profile backup --registry <dir>` resolves core + the extension automatically (no `--ext` needed for local export; `--ext` is for *declaring* a required extension in the bundle manifest). This defined task 2.1's `vault-registry/` layout exactly. festech.json confirmed as the precedent (portability per type; extensions MUST NOT redefine core types).
- 0.5 droplet fossil inventory (captured 2026-07-07): clown-car live = **200** (bug confirmed); homepage = 302 (visitor gate, expected). pm2 `portfolio` online, **restart_time=33** (memory-wipe fragility confirmed). Fossils:
  - `/opt/portfolio-site/vault/pages/designs/` — 13 files; keep `nostalgia.md`,`high-stakes-field-day.md`; **11 fossils** (a-chaotic-early-2000s…, a-highly-tactile-analog…, a-hyper-clinical-medical…, a-maximalist-experimental…, a-sleek-cutting-edge…, a-sophisticated-high-fashion…, a-vibrant-hyper-modern…, an-architectural-brutalist…, clown-car.md, editorial-broadsheet…, ethereal-minimalist…). NOT rsync-excluded → `--delete` auto-removed these (repo has only the 2 real ones).
  - `/opt/portfolio-site/designs/` — 20 build dirs; kept only the single live skin; **19 fossils** incl. clown-car, rocket-pop, star-wars, star + 15 more. rsync-EXCLUDED → cleaned manually (old task 1.2). This dir is served by the node app at `/designs/<slug>/` — the actual source of the clown-car 200.
  - `/opt/portfolio-site/vault/pages/skins/` — one live skin doc (clean).
  - `/var/www/gregiteen.xyz/designs/` — only `nostalgia.html`,`high-stakes-field-day.html` (clean).
  - `/opt/portfolio-site/dist/` — was present → removed + rebuilt (old tasks 1.2/1.3).
  - **Note:** the 2 real designs use `x_kind: "design"` (NOT "portfolio-design" as the old plan guessed) — allowlist keys on `"design"`.
- 0.6 PAT scopes available: _(pending — now task 0.4)_

## Task 0.2 Boot Log Record

`PORT=4777 node scripts/serve.mjs` (2026-07-08) — clean boot, no errors:

```
[Watcher] Watching SSSS vault at /Users/greg/Github/portfolio-site/vault
[Runtime] Hydrated 1 visitor profiles, 1 proposals, 0 pending notifications
[Cron] Daily improvement cron scheduled (3:00 AM)
portfolio-site → http://localhost:4777
```

Runtime store hydrates (1 visitor / 1 proposal / 0 notifications), cron
registered, vault watcher up. Server stopped with SIGTERM afterwards.

## Task 0.5 Total-Recall Publication Audit

`~/Github/total-recall` on 2026-07-08:

- `git status --short` → **empty** (clean working tree).
- `git status -sb` → `## main...origin/main` (no ahead/behind) — **in sync with origin, nothing unpushed**.
- Sovereign-sync files present + tracked (committed) + pushed:
  - `src/core/portfolio-sync.mjs` (added in commit `bd8b211`)
  - `src/core/portfolio-sync.spec.mjs`
  - `src/server/routes/docs.mjs`
  - `frontend/src/pages/VaultPage.tsx`
  - `frontend/src/pages/InboxPage.tsx`
  - `frontend/src/components/DocumentTable.tsx`
  - `frontend/src/components/DocumentEditorModal.tsx`

**Conclusion:** the Phase 3–4 sovereign-sync work is already published to
`origin/main`. FR-H is largely satisfied by existing history; the only
genuinely-missing deliverable is the *real* pointer doc (the fabricated one
was an 81-byte stub in the wrong repo, now deleted). See task 2.7.

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
