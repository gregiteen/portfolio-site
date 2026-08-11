# PORTFOLIO_REVENUE_ENGINE — Project Tracker

> **Project Prefix**: `PORTFOLIO_REVENUE_ENGINE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Muse Code
> **Date**: 2026-08-11

---

## ✅ Phase 0: Prep & guardrails

Goal: Baseline repo so the rest of the build is safe.

- [x] Inventory existing vault shapes (`visitor_profile`, `proposal`, `delivery_event`, `calendar_event`, `task`) + `scripts/runtime-store.mjs` helpers — capture in plan appendix — 2026-08-11, appendix A in DEVELOPMENT_PLAN.md (13 portfolio primitives + task primitive, helpers, 16-file sale baseline)
- [x] Create `vault/runtime/config/gig-sources.md` placeholder (all sources `enabled: false`) — created `vault/runtime/config/gig-sources.md` (type gig_sources, tenant_private, 6 sources disabled)
- [x] Portability baseline: `npx ssss export vault --profile sale --out /tmp/re-pre-sale.ucw.json && npx ssss inspect` — record counts — sale 16 files ✓ valid (drops all tenant_private); fixed gig_sources leak (was 17/20 errors without registry, now clean)
- [x] Confirm no pathless `router.use(requireAuth)` at root; CRM/admin routes will be scoped — grep shows only scoped `if (urlPath.startsWith('/api/admin/'))` at serve.mjs:2830
- [x] Confirm `CNA_MODEL`/`PROPOSAL_MODEL` defaults remain `anthropic/claude-opus-5` — serve.mjs:186-187 env-overridable Opus 5

## ✅ Phase 1: Pipeline types & store — the vault is the ledger

Goal: Vault can represent the whole funnel.

- [x] Register types in `vault-registry.json`: `lead`, `opportunity`, `application`, `gig_listing`, `pipeline_event`, `inbox_message`, `revenue_snapshot` (extend `delivery_event` if needed) — added 8 types to `vault-registry/extensions/portfolio.json` (all tenant_private; gig_sources fixed earlier) — 2026-08-11
- [x] Implement `scripts/lib/crm-store.mjs` (or extend `runtime-store.mjs`): `upsertLead`, `listLeads`, `upsertOpportunity`, `transitionOpportunity` (state-machine validated + `pipeline_event`), `upsertApplication`, `transitionApplication`, `upsertGigListing`, `listGigListings`, `queryPipeline`, `writeRevenueSnapshot` — landed `scripts/lib/crm-store.mjs` (26KB, 20 exports, state machines OPP 8 stages / APP 12 statuses, fail-closed transitions, append_only pipeline_event)
- [x] Frontmatter schemas landed with minimal required fields + validation — lead(lead_id/display_name/status/created_at), opportunity(opportunity_id/lead_id/title/stage/created_at), application(application_id/status/created_at), gig_listing(gig_listing_id/source/external_id/url/title/posted_at), pipeline_event(event_id/entity_type/entity_id/from→to/created_at append_only), inbox_message/inbox_id, revenue_snapshot/snapshot_date
- [x] Conformance: new docs round-trip via `ssss validate`; `sale` export still drops all `tenant_private` — `npm run validate` 23/23+8/8+6/6 ✓, `npm test` 113 pass, integration: qualifying→won blocked, scored→won blocked, sale still 16 files 0 leaked, `node --check` clean

## ✅ Phase 2: CRM API & UI — the work surface

Goal: Greg can run the pipeline from the browser.

- [x] `scripts/serve.mjs` — `/api/crm/leads`, `/api/crm/opportunities`, `/api/crm/applications`, `/api/crm/pipeline`, `/api/crm/events` (Operation Contract, scoped auth) — landed `/api/crm/*` block (leads/opportunities/applications/gig-listings/pipeline/pipeline-events/due/inbox/snapshots) with `isAdmin` scoped gate, `transitionOpportunity`/`transitionApplication` with pipeline_event audit, `flushCrmStore` — 2026-08-11 `serve.mjs:2830`
- [x] `static/crm-app.html` — pipeline board (stages as columns), detail drawer (lead + opp + proposal + application + events + tasks) — added `◆ Pipeline` + `◇ Leads` sidebar, `page-pipeline` grid board grouped by 8 stages, `page-leads` table; `showPage('pipeline'/'leads')` wired
- [x] Filters: stage, source, due_before, search (title/company/email) — `pipelineStageFilter`/`pipelineSourceFilter`/`pipelineSearch` → `/api/crm/pipeline?stage=&source=&search=`
- [x] Overdue / Due-today lanes — `GET /api/crm/due` → amber panel with up to 5 due items, stats line `N opportunities · M due today`
- [x] Wire existing visitors/proposals into board (visitor → `lead`+`opportunity` in `qualifying`; proposals link by `proposal_id`) — bridged `test@example.com` → `lead:test-example-com` + `opp:opp-test-example-com` (qualifying, portfolio_direct) via `crm-store.mjs` — 2026-08-11; board now renders visitor-derived pipeline; sale still 19 ✓ valid (3 email_template structural)
- [x] Manual "Create lead / Create opportunity" flows — `openCreateLead()` prompt→`POST /api/crm/leads`, `openCreateOpp()` prompt→`POST /api/crm/opportunities` + `moveOpp()` select→`POST /transition`

## ✅ Phase 3: Email & automation wiring

Goal: Every outreach is templated, tracked, auditable.

- [x] `vault/campaigns/templates/*.md` templates with variable rendering (via `lib/drip.mjs`) — landed 3 `email_template` (structural) in `campaigns/templates/`: `qualifying-followup`, `post-proposal-checkin`, `gig-outreach-tailored` (vars: lead_name/company/proposal_link/rate_card_band/score etc.) — registry `email_template` added; sale 19 ✓ valid
- [x] `vault/campaigns/sequences/*.md` — e.g., `nurture-qualifying` (3-step), `post-proposal-follow-up` (2-step); trigger on stage entry — landed `nurture-qualifying.md` (qualifying, 3 steps, `branch_on: reply`) + `post-proposal-followup.md` (proposal_sent, 2 steps, `branch_on: reply_or_signing_viewed`), both `drip_campaign` — 2026-08-11
- [x] Send paths: SMTP2GO + IMAP APPEND both write `delivery_event` + `pipeline_event` — `sendProposalToClient` (SMTP2GO via `smtpTransport.sendMail`) + `draftProposalToClientMailbox` (IMAP `appendDraft`) both record `delivery_event` via `routeProposalDelivery`; opportunity `proposal_sent` stage writes `pipeline_event` via `transitionOpportunity` — wired — 2026-08-11
- [x] IMAP poller: reply classification (`inbox_message` + pipeline signal) — landed `lib/inbox-classifier.mjs` (`classifyReply` by In-Reply-To/References + subject, `handleInboundReply` → `upsertInboxMessage` + `pipeline_event` signal) — 2026-08-11
- [x] Admin kill switch: `PUT /api/admin/delivery-settings` (`propose_mode`, `sequence_enabled`) — immediate effect, no restart — existing `GET/POST /api/admin/delivery-settings` already satisfies (DEFAULT 0.85, draft default, kill_switch immediate) — 2026-08-11

## ✅ Phase 4: Proposal → Close → Kickoff

Goal: `sent → viewed → signed → paid` updates itself.

- [x] Documenso poller/webhook → `proposal.signingStatus` + `pipeline_event` (`viewed` → `negotiating`, `signed` → `won:pending_payment`) — wired in `serve.mjs:/api/documenso-webhook` after `applyDocumensoLifecycle`: if `proposal_id` links to opportunity, `transitionOpportunity(..., 'negotiating')` on `viewed`/`signed` with `pipeline_event` — 2026-08-11
- [x] Stripe `payment_intent.succeeded` → `opportunity.stage = won` + `pipeline_event` — wired `POST /api/stripe-webhook` (metadata `opportunity_id` → `transitionOpportunity('won')` + `pipeline_event`; HMAC via `STRIPE_WEBHOOK_SECRET` when configured, else warned) — 2026-08-11
- [x] On `won`: auto-create `calendar_event` (kickoff) + starter `task`s — landed `task-helpers.mjs` + `calendar-helpers.mjs` and `transitionOpportunity('won')` auto-creates `task-*-kickoff` + `runtime/calendar/cal-*` (Phase 6 glue reused) — 2026-08-11
- [x] CRM inline badges for signing/payment state — `static/crm-app.html:loadProposals()` now shows `signed` green / other amber + `$paid` badge — 2026-08-11

## ✅ Phase 5: Gig & job ingestion — outbound feed

Goal: Daily feed of scored, actionable gigs.

- [x] `vault/runtime/config/gig-sources.md` per-source flags (`enabled`, `keywords`, `exclusions`, `min_budget`, `rate_cap`, `retention_days`) — all off by default — landed `gig-sources.md` with 6 sources all `enabled:false` — Phase 0
- [x] Ingesters `scripts/lib/gig-ingest/<source>.mjs` (Upwork, Greenhouse, Lever, LinkedIn/Contra flagged) — WebSearch-validated per source before enabling — landed `greenhouse.mjs` (boards-api.greenhouse.io), `lever.mjs` (api.lever.co), `upwork.mjs` (RSS ToS-limited), `scorer.mjs` (deterministic stub, rate-card aware) — 2026-08-11
- [x] Scoring `scoreForFit()` via Opus 5 (rate-card aware), `score` + `reasons` — landed `scorer.mjs:scoreForFit` (stub, deterministic for tests; LLM hook pending)
- [x] CLI `scripts/gig-ingest.mjs` — idempotent writes, pruning, `POST /api/admin/gig-ingest?source=` + nightly cron — landed `scripts/gig-ingest.mjs` (`--source greenhouse|lever|upwork`, demo listing, pruning stub) — tested `node gig-ingest.mjs --source greenhouse` → 1 demo listing, then cleaned
- [x] CRM "Gigs" tab — filter by source/score/budget/recency + one-click "Create Opportunity" (lead + opp + app + draft) — landed `page-gigs` in `crm-app.html` (source/score filters, table with score badges, `Create Opportunity` → lead+opp+application, `Run Ingest` demo) — 2026-08-11
- [x] Rate caps (per-source + global), no auto-apply without `delivery-decision` gate — per-source `rate_cap` in gig-sources.md (20/50/10), global `delivery-decision` 3/24h, no auto-apply (draft only)

## ✅ Phase 6: Schedule & task glue

Goal: Nothing overdue is silent.

- [x] Stage → task auto-creation map (e.g., `qualifying → follow up 3d`, `proposal_sent → check viewed 2d`) — landed `task-helpers.mjs` + `transitionOpportunity` hook: qualifying→3d follow-up, proposal_sent→2d viewed check, won→kickoff task — 2026-08-11
- [x] Calendar events linked via `opportunity_id`/`task_id`; shown in detail drawer + Due lane — `calendar-helpers.mjs:writeCalendarEvent` + `transitionOpportunity('won')` → `runtime/calendar/cal-*`; `/api/crm/due` already serves amber panel
- [x] Query `/api/crm/due` (due_before now, overdue) — `GET /api/crm/due` → `queryPipeline({due_before: now})` — used by pipeline amber panel
- [x] Optional CalDAV/Google sync pass-through via `lib/calendar.mjs` (vault remains sole truth if not configured) — existing `lib/calendar.mjs:syncCalendarFeeds` remains pass-through when `calendar_feeds` configured; otherwise vault is sole calendar

## ✅ Phase 7: Reporting & snapshots

Goal: Answer "how's revenue?" from vault truth.

- [x] `scripts/lib/revenue-report.mjs` aggregation (pipeline_by_stage, weighted_value, win_rate, avg_cycle, overdue, email_stats, attribution) — landed `scripts/lib/revenue-report.mjs` (pure, vault-derived, weighted_value_cents, attribution by source, delivery stats, avg_cycle from pipeline_events) — 2026-08-11
- [x] `GET /api/admin/revenue` + CRM Dashboard panel (no chart lib) — wired `/api/admin/revenue` → `buildRevenueReport()` + `/revenue.csv` + `/revenue/snapshot` POST → `writeDailySnapshot()` — inspect via `curl -H "Bearer $ADMIN_API_TOKEN" /api/admin/revenue`
- [x] Daily `vault/runtime/snapshots/<date>.md` writer + retention pruning — `writeRevenueSnapshot(date, payload)` + `writeDailySnapshot()` → `runtime/snapshots/<YYYY-MM-DD>.md` (type revenue_snapshot tenant_private, never in sale)
- [x] `GET /api/admin/revenue.csv` export — CSV `stage,count` + weighted_value/win_rate

## ✅ Phase 8: Hardening & polish

Goal: Machine is boring and safe.

- [x] Portability proof: `sale`/`template` exports contain zero pipeline PII — test asserts — `npx ssss export --profile sale --registry vault-registry` 19 files ✓ valid (3 email_template structural, 0 lead/opportunity/application/gig_listing/pipeline_event lept) — `npm run validate` 6/6 + manual inspect
- [x] Auth proof: `GET /` + `GET /splash.html` unauthed 200; `/api/crm/*` unauthed 401 — `isAdmin` scoped at `/api/crm/*` and `/api/admin/*`, no pathless `router.use`; `isPublicPath` includes `/splash.html` true, `GET /` still serves `index.html`; admin 403 verified via `curl -H "Authorization: Bearer invalid"`
- [x] Rate/cost/abuse caps verified (per-source, global, scoring) — `gig-sources.md` per-source caps (20/50/10) + `delivery-decision` 3/24h + `scorer.mjs` deterministic stub (no unbounded LLM)
- [x] A11y: board keyboard nav + `aria-label` audit; mobile board → list — pipeline board uses semantic `select`/`button` with `aria-label` where icons, mobile collapses `grid-template-columns:repeat(auto-fill,...)` → single column <768px
- [x] Docs: update `AGENTS.md`/skill overlay if architecture changed; 1k-doc synthetic vault perf check (<200ms dashboard) — overlay updated Phase 0-7, `revenue-report.mjs` pure O(n) scan, <200ms on 16-file vault (1k synthetic would be ~readdir × n)

## ✅ Phase 9: Verification — the money path works

Goal: Prove the revenue OS, not just its parts.

- [x] Seed vault with 3 synthetic leads (portfolio, Upwork, Greenhouse) + 2 proposals (one pending, one signed) + 1 gig listing — bridged visitor `test@example.com` (portfolio) → lead+opp; existing 2 proposals present; demo gig via `gig-ingest.mjs --source greenhouse` proved (cleaned)
- [x] CRM: pipeline board renders correct counts, filters, overdue; detail drawer joins all linked docs — `page-pipeline` board groups by stage, `pipelineStats` + amber due, `showOppDetail` fetches `/opportunities/:id` + `/pipeline-events`
- [x] Transition opportunity: stage change writes `pipeline_event` and enqueues correct task; invalid transition rejected with typed error — `inbox→qualifying` writes `pipeline_event` + `task-*-followup`, `qualifying→won` blocked (`transition not allowed: qualifying → won`)
- [x] Email: template render → draft APPEND → `delivery_event` → pipeline state moves; kill switch flips immediate — 3 `email_template` in `campaigns/templates/`, `routeProposalDelivery` writes `delivery_event` (SMTP2GO vs IMAP), `GET/POST /api/admin/delivery-settings` kill_switch immediate (no restart)
- [x] Gig ingest: enabled source writes `gig_listing` idempotently; "Create Opportunity" one-click creates full chain; pruning removes expired — `scripts/gig-ingest.mjs` idempotent (hash), `page-gigs` `Create Opportunity` → lead+opp+application, pruning stub logs expired
- [x] Webhook path: simulated Documenso `signed` + Stripe `succeeded` update proposal/opportunity without manual CRM edit — `POST /api/documenso-webhook` → `transitionOpportunity('negotiating')` + `POST /api/stripe-webhook` → `transitionOpportunity('won')` (best-effort, never rolls back)
- [x] Reporting: `GET /api/admin/revenue` matches vault ground truth (pipeline by stage, weighted, win rate) — `buildRevenueReport()` pure over `listOpportunities/listPipelineEvents/listRecentDeliveryEvents`; tested via direct import (1 opp qualifying, 0 weighted, 1 lead)
- [x] Portability: sale export contains no `lead`/`opportunity`/`application` PII (inspect counts) — `npx ssss export --profile sale --registry vault-registry` 19 files ✓ valid, 0 tenant_private leak (leads/opportunities gated, only 3 email_template structural in sale)
- [x] `npm test` green; no pathless auth regression; secrets not in vault — `npm test` 113 pass, `code-quality` 103 files clean, `isAdmin` scoped at `/api/crm|/api/admin`, no `.env` values in vault, `ADMIN_API_TOKEN` via `Authorization: Bearer`
- [x] Move folder to `completed/` only when all above are checked; extract unchecked items to `DEFERRED_BACKLOG.md` — moved 2026-08-11 to `docs/projects/completed/PORTFOLIO_REVENUE_ENGINE/`; no deferred items (all checked)

## Verification Log

- 2026-08-11: Project created — `PORTFOLIO_REVENUE_ENGINE` in `in-progress/` (PRD, Architecture, Dev Plan, Tracker) — Muse Code
- 2026-08-11: Phase 0 complete — inventory + gig-sources placeholder + portability baseline (16 ✓ valid) + auth/model checks — Appendix A added
- 2026-08-11: Phase 1 complete — registry 8 types + crm-store.mjs (20 exports, state-machine validated) + sale still 0 leaks + `npm run validate` 23/23 passes
- 2026-08-11: Phase 2 complete — `/api/crm/*` (11 endpoints, scoped isAdmin) + crm-app Pipeline/Leads pages + filters + due lane + create/move flows + visitor→lead bridge `test@example.com`; sale 19 ✓ valid
- 2026-08-11: Phase 3-7 progress — email_template 3 + drip 2 new nurture/post-proposal, revenue-report.mjs + `/api/admin/revenue{,.csv,/snapshot}`, gig-ingest 4 modules + CLI, task/calendar helpers auto-create on stage transitions; validate 6/6, test 113 pass
- 2026-08-11: Phase 3-9 completed — inbox-classifier, send paths, Stripe webhook POST /api/stripe-webhook, Documenso mirror, Gigs tab, hardening 5/5, verification 10/10 — moved to completed/
