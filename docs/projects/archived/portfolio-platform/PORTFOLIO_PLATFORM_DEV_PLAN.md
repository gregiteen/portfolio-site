# Portfolio Platform — Development Plan (Combined)

> **Archived 2026-07-16:** Superseded and merged into
> `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/`.

> **2026-07-07.** Combined and improved plan superseding the former
> portfolio-platform P0–P5 plan and the sovereign-sync Phase 0–5 plan. The
> single biggest finding of the audit: **most features exist as code but were
> rubber-stamped "done" with zero testing.** This plan therefore has three
> kinds of work, in strict order: (1) verify everything claimed done,
> (2) build what's genuinely missing (drip engine, proposal PDF/e-sign,
> total-recall pointer doc), (3) pass one mandatory end-to-end testing gate.

Execution order is strict: **Phase 0 → 1 → 2 → 3 → 4 → 5 → 6**. Do not start
a phase while the previous phase has unchecked tracker items (exception:
Phase 3 and Phase 4 are independent of each other and may interleave).
Repo tags: `[portfolio]` = `~/Github/portfolio-site`, `[total-recall]` =
`~/Github/total-recall`, `[droplet]` = ssh ops on `138.197.199.217`.

## Ground rules for the implementing agent

- Read `PORTFOLIO_PLATFORM_PRD.md` and `PORTFOLIO_PLATFORM_ARCHITECTURE.md`
  first. The architecture contains component specs — this plan says *when*,
  the architecture says *what*.
- Every task has **Verify** steps. A task is not done until they pass. Check
  the tracker box only after Verify passes. **Never** move this project to
  `completed/` without Phase 6 fully green (this exact violation happened
  once already).
- If reality contradicts a task's stated assumption: STOP, log it in the
  tracker's Discrepancy Log, resolve the assumption before coding around it.
- Never run `tsc`/`npm run typecheck` directly — use
  `node .agent/skills/code-quality/scripts/start-here-ts.mjs` and
  `…/start-here-lint.mjs`.
- Droplet: IP is `DROPLET_IP` in portfolio `.env`; ssh as root. Never print
  `.env` contents into logs or docs. Secrets never enter vault docs/bundles.
- **Commit only when Greg explicitly asks.** Deploys only via the deploy
  skill (which never auto-commits). No GitHub Actions.
- Do NOT touch `.agent/skills/total-recall/skills/` (embedded TR skills) —
  parked by Greg for a separate discussion.
- Emails in tests: use Greg's own inboxes (MAIL_OWNER / gregiteen@gmail.com)
  as the "client" — never a real third party.

---

## Phase 0 — Baseline & repo hygiene

**0.1 [portfolio] Land the WIP + reorg.** Working tree currently holds: the
docs/skills reorg (renames from `.docs/` and `completed/sovereign-sync/`,
deleted stray pointer stub, untracked deploy/push skill files now symlinked
to `~/.agent/skills/`) and a serve.mjs trailing-slash → index.html fix.
Finish = confirm the serve.mjs diff is complete and correct, run the suite,
then ask Greg for the commit go-ahead (one commit for the reorg + docs, one
for the serve.mjs fix, or as Greg prefers).
**Verify:** `npm test` green (14/14); `node --check scripts/serve.mjs` OK;
`git status` shows only intended changes; Greg has explicitly approved any
commit before it happens.

**0.2 [portfolio] Local boot smoke.** `PORT=4777 node scripts/serve.mjs` —
confirm clean boot: runtime store hydration counts logged, no errors, cron
registered, watcher up. Kill afterwards.
**Verify:** boot log lines captured into the tracker.

**0.3 [total-recall] Test baseline (carried from old 0.2).** Run
`npx vitest run` (or targeted `src/server src/core` if slow). Record result
by name — pre-existing failures are not ours to fix, only not to worsen.
**Verify:** result recorded in tracker.

**0.4 [total-recall] API smoke (carried from old 0.6).** With the server
running locally: health endpoint, `GET /api/memory?limit=1`,
`GET /api/brains`, `GET /api/sync/portfolio/status` using a PAT or dashboard
session. **Verify:** 200s; PAT scopes recorded in tracker.

**0.5 [total-recall] Publication audit (FR-H1 prep).** `git status` +
`git log origin/main..HEAD` in `~/Github/total-recall`: enumerate every
uncommitted/unpushed change from sovereign-sync Phases 3–4
(portfolio-sync.mjs, routes/docs.mjs, saved views, VaultPage, InboxPage,
DocumentTable, DocumentEditorModal, specs, scheduler/config wiring).
**Verify:** complete file list recorded in tracker; nothing unrelated mixed in.

---

## Phase 1 — Verify the claimed-done platform (formerly P0–P5, all ✅ with zero tests)

Each task below verifies a feature that exists in code. If a verify step
fails, fix-forward within the task and log the discrepancy.

**1.1 [portfolio] Clean-slate build invariants (old P0).**
**Verify:** local `npm run build` → designs index lists exactly Nostalgia +
HSFD; no `{{GENERATOR_FORM}}` on designs page; zero `x_kind: theme` docs
(`grep -r "x_kind: theme$" vault/` empty); no "Infrastructure Consultation
Offer" string anywhere (`grep -ri "infrastructure consultation" vault/ designs/ dist/` empty).

**1.2 [portfolio] Generation pipeline end-to-end (old P1).** Local server,
real generation: submit splash form with a test style + Greg's email.
**Verify:** generation starts before verification (log timestamps);
Pass 1b plan-review runs (log); layouts generated in parallel (log);
home served early (lazy-load path); final skin doc lands in
`vault/pages/skins/` with `x_kind: theme-skin`; `generation_run` doc in
`vault/runtime/runs/` with lifecycle fields; build has no hardcoded fake
copy (spot-check layouts for `{{PLACEHOLDER}}` usage).

**1.3 [portfolio] Continuous improvement + promotion (old P2).**
Run `node scripts/improve-theme.mjs` on one existing skin; then
`node scripts/promote-theme.mjs` on a scratch skin and revert.
**Verify:** improve: scores logged, swap-if-better honored (or clean no-swap);
model rotation observable across two runs; cron registration visible in
serve.mjs boot log (3 AM job). Promote: skin appears on designs index with
proper metadata; revert leaves index at exactly Nostalgia + HSFD.

**1.4 [portfolio] Splash → verify → session (old P5).** Full local pass with
a fresh browser profile: splash → code email arrives → verify →
`gi_auth` cookie (30d) → home in generated design → revisit splash while
authed → auto-redirect to `/`.
**Verify:** each step observed; 4th generation attempt for the same email
returns the descriptive rate-limit error; `optIn` recorded on the visitor doc.

**1.5 [portfolio] Visitor enrichment + deferred notification (old P3, the
"enriched contact emails").**
**Verify:** visitor doc contains enrichment fields (screen, timezone,
language, referrer, platform, touch); leaving the site fires sendBeacon
(`/api/leaving` hit in log) and Greg's notification email arrives with the
enriched data; with beacon suppressed, the 30-min fallback fires (shorten
the window via env/config for the test if needed — restore after);
restart-mid-hold: notification still fires after `pm2`-style restart
(kill + reboot serve.mjs locally).

**1.6 [portfolio] CNA end-to-end (old P3, the "CNA page").** Complete a real
CNA conversation on `static/consult.html` locally as a fake prospect
(Greg-owned email).
**Verify:** `/api/cna` conversation coherent multi-turn; enrichment (email
domain → company inference) present in the result; proposal generated with
scope/timeline/pricing; proposal doc in `vault/runtime/proposals/` with
status `pending_approval`; CNA banners present on every portfolio page;
notification email is HELD during CNA and arrives ONCE afterward with CNA +
proposal attached (email-timing logic).

**1.7 [portfolio] Proposal loop — email path (old P3).** Using the 1.6
proposal: exercise `/api/proposal-reply` with a revise-style reply, then a
"send it" reply.
**Verify:** revision iterates the proposal (revisions count increments, body
history appended); "send it" → client email sent (to Greg-owned address),
CC Greg; status transitions `pending_approval → revising → sent` on the doc;
`DELETE /api/admin/proposals/:id` works for cleanup.

**1.8 [portfolio] Admin dashboard (old P4).** Log in as MAIL_OWNER /
ADMIN_EMAIL; walk all six views (dashboard, visitors, themes, proposals,
settings, logs).
**Verify:** stats accurate vs runtime docs; visitors table shows enrichment;
themes list shows scores with preview/promote/delete; proposals view lists
1.6's proposal with revisions; settings load/save; manual improvement
trigger works; non-admin session → denied; logout clears cookie and fires
deferred notification.

**1.9 [portfolio] IP protection (old P5).**
**Verify:** `/api/design-spec` returns 404/absent; no design.md download
button or inline link in any built page (`grep -ri "design-spec\|design.md" dist/site/` clean).

---

## Phase 2 — Sovereign sync verification + Total Recall publication

**2.1 [droplet] Live-site smoke (old T1).**
**Verify:** clown-car and all fossil URLs → 404; flipper swaps themes; all
whatever skin(s) are live serve 200; designs index shows exactly Nostalgia + HSFD;
site root → 302 visitor gate.

**2.2 [droplet] Restart durability scenario (old T2).** Seed a proposal +
held notification on the droplet → run the FULL deploy skill (including
`pm2 restart`).
**Verify:** proposal, visitor profiles, sessions intact after restart;
deferred notification still fires; boot log shows hydration counts.

**2.3 [droplet] Portability proof on droplet-exported bundle (old T3).**
Pull `GET /api/admin/export-bundle`.
**Verify:** `ssss validate` passes; sale-profile re-export drops every
`vault/runtime/**` doc (`--show-dropped`); backup profile carries them with
correct `primitive_inventory` counts.

**2.4 [total-recall] Sync round-trip (old T4).**
**Verify:** scheduled/triggered sync imports the droplet bundle into
`~/.agent/tenants/portfolio-site/vault/`; brain listed in `/api/brains` with
node count > 0; second run is a no-op diff; `GET /api/sync/portfolio/status`
correct for ok AND failure (bad-token drill).

**2.5 [total-recall] Approval end-to-end (old T5).** Approve a real synced
proposal in the Inbox UI.
**Verify:** client (Greg-owned address) receives the proposal email from
the droplet; droplet doc status `sent`; TR shows `sent` after next sync;
revise + reject paths also exercised on scratch proposals.

**2.6 [both] Security sweep (old T6).**
**Verify:** grep for token/SMTP/key patterns in every vault doc, exported
bundle, and `git diff` — zero hits; traversal attempts on `/api/docs`
(`../`, absolute) rejected; wrong bearer → 403; no-auth → 403.

**2.7 [total-recall] Publish (FR-H).** Commit the Phase 3–4 total-recall work
(file list from 0.5) with a real pointer doc
`docs/projects/…/PORTFOLIO_PLATFORM_POINTER.md` (links here; lists every
added/changed file). Push to `main` **after Greg's explicit go-ahead**.
**Verify:** `npx vitest run` no new failures; code-quality scripts pass;
`git log origin/main` shows the work; pointer doc exists and is accurate.

---

## Phase 3 — Drip campaign engine (FR-F — build)

**3.1 [portfolio] Registry + campaign type.** Add `drip_campaign`
(structural) to `vault-registry/extensions/portfolio.json`; author
`vault/campaigns/default-nurture.md` (3–5 steps) and a post-CNA sequence.
**Verify:** backup export validates; sale export KEEPS campaign docs
(structural) but drops visitor state (tenant_private).

**3.2 [portfolio] Visitor drip state + enrollment.** Extend runtime-store
visitor shape with the `drip` block (Architecture §4.3); enroll on verify
when `opt_in`; switch/pause on CNA completion.
**Verify:** scratch driver: verify flow → visitor doc gains
`drip.campaign/step/next_send_at/status`.

**3.3 [portfolio] Scheduler + sender.** Interval tick in serve.mjs (mirror
improvement-cron pattern): due sends → SMTP → advance step → persist. Step
not advanced on SMTP failure.
**Verify:** compressed-schedule campaign (minutes) delivers all steps to a
Greg-owned inbox in order.

**3.4 [portfolio] Unsubscribe + admin surface.** Signed-token
`/api/unsubscribe` + link in every drip email; admin visitors view gains
drip column + pause/resume/unenroll.
**Verify:** unsubscribe link from a real received email halts the sequence
immediately; admin actions persist.

**3.5 [portfolio] Restart survival + deploy.** Kill serve.mjs mid-sequence,
reboot, sequence resumes from persisted `next_send_at`. Then deploy via the
skill and repeat the compressed test on the droplet.
**Verify:** no lost/duplicate sends across restart; droplet run green
(`npm test` still green).

---

## Phase 4 — Proposal PDF + e-sign (FR-G — build)

**4.1 [portfolio] PDF render.** Pick the lightest acceptable server-side PDF
approach (evaluate: md-to-PDF via headless-free lib vs minimal HTML-to-PDF;
record choice + rationale in tracker); render the finalized proposal
(branded cover, scope/timeline/pricing sections).
**Verify:** generated PDF opens correctly, professional layout, no
placeholder leakage; render runs on the droplet (no missing native deps).

**4.2 [portfolio] Attach on send.** `sendProposalToClient()` attaches the
PDF; email body becomes the cover note. Applies to BOTH approval paths
(email "send it" and TR decision endpoint).
**Verify:** both paths deliver the PDF to a Greg-owned inbox.

**4.3 [portfolio] E-sign evaluation + integration (may be split out with
Greg's sign-off).** Evaluate Documenso vs Docuseal (self-host cost,
API, webhook support); present recommendation to Greg; integrate chosen
tool: signing link in client email; signed-status webhook (or poll) updates
proposal doc to a `signed` terminal state.
**Verify:** full sign flow on a test document; proposal doc reflects signed
state; TR shows it after sync. If Greg defers hosting, record the decision
and move this item to DEFERRED_BACKLOG (PDF alone gates "proposals set up").

---

## Phase 5 — Production hardening pass

**5.1 [droplet] Deploy everything.** Full deploy skill run with all phases'
changes; confirm boot, cron, drip scheduler, sync bridge all healthy.
**Verify:** pm2 log clean; TR sync status ok afterwards.

**5.2 [portfolio] Full production CNA rehearsal (the user-facing "everything
verified" bar).** As a fake prospect on the LIVE site (gregiteen.xyz):
splash → generate → verify → browse (flip themes) → CNA → proposal → Greg
approves from Total Recall → "client" receives PDF proposal.
**Verify:** every hop observed live; one combined enriched notification
email to Greg; drip enrollment visible for the opted-in test visitor.

---

## Phase 6 — Testing & Verification (mandatory gate — see tracker)

The tracker's Phase 6 checklist is authoritative. Highlights: re-run both
suites + conformance (`npm test`, `npx vitest run`,
`npx ssss conformance --engine`); confirm every success criterion in the
PRD (§Success Criteria 1–8); docs sync (this folder + deploy skill reflect
end state); archival per the project-management lifecycle (move to
`completed/`, extract genuinely-deferred items to
`docs/projects/DEFERRED_BACKLOG.md`).

---

## Deferred (explicitly out of this project — seed for DEFERRED_BACKLOG.md)

- `RUNTIME_DATA_DIR` relocation of generated designs out of the deploy tree.
- Two-way generic sync (TR-edited docs pushed back to droplet beyond
  proposal decisions).
- Visitor-profile analytics/reporting inside Total Recall.
- Binary assets inside `.ucw` bundles (spec question for `ssss` repo).
- Embedded Total Recall skills rework (`.agent/skills/total-recall/skills/`)
  — parked by Greg, separate discussion.
- E-sign hosting decision if Greg defers (4.3).
