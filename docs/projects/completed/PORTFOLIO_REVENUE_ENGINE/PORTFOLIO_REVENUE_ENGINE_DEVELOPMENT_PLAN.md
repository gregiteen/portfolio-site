# PORTFOLIO_REVENUE_ENGINE — Development Plan

> **Project Prefix**: `PORTFOLIO_REVENUE_ENGINE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Muse Code
> **Date**: 2026-08-11

---

## Execution strategy

Ship the revenue ledger before the revenue robots. **Phase 1 (pipeline + CRM) is independently shippable and valuable** — Gig Search (Phase 3) and deep reporting (Phase 5) can slip without blocking revenue capture. Each phase is behind a vault-config flag so a half-built source can't spam or mutate pipeline state.

Order is dependency-driven, not excitement-driven: types → store → API → CRM → email wiring → gig ingest → schedule glue → reporting → hardening.

## Phase 0 — Prep & guardrails

Goal: Baseline the repo so the rest of the build is safe.

- Inventory existing vault docs and runtime-store helpers; document current `proposal`, `visitor_profile`, `delivery_event`, `calendar_event`, `task` shapes in this plan's appendix.
- Add `vault/runtime/config/gig-sources.md` placeholder (all sources `enabled: false`) so scaffolding has a config to read.
- Verify current portability: `npx ssss export vault --profile sale --out /tmp/pre-sale.ucw.json && npx ssss inspect` — capture expected counts so regressions are detectable.
- Verify auth scoping: confirm no pathless `router.use(requireAuth)` gates `/` or `/splash.html` (the catch-22 correction from past sprints).
- Resolve model defaults: `CNA_MODEL`/`PROPOSAL_MODEL` remain Opus 5 unless env overrides; document in `scripts/serve.mjs` header.

## Phase 1 — Pipeline types & store (G1)

Goal: Vault can represent the whole funnel without code that renders it yet.

- Register SSSS types in `vault-registry.json`: `lead`, `opportunity`, `application`, `gig_listing`, `pipeline_event`, `inbox_message`, `revenue_snapshot`. Extend `delivery_event` if fields are missing (confidence/threshold/body).
- Implement `scripts/lib/crm-store.mjs` (or extend `scripts/runtime-store.mjs`): `upsertLead`, `getLead`, `listLeads`, `upsertOpportunity`, `transitionOpportunity` (validates state machine + appends `pipeline_event`), `upsertApplication`, `transitionApplication`, `upsertGigListing`, `listGigListings`, `queryPipeline`, `listPipelineEvents`, `writeRevenueSnapshot`.
- Frontmatter schemas (minimal, validated):
  - `lead`: `lead_id`, `display_name`, `company`, `email`, `source`, `enrichment`, `consent`, `created_at`, `updated_at`
  - `opportunity`: `opportunity_id`, `lead_id`, `title`, `stage`, `value_cents`, `probability`, `next_action_at`, `source`, `proposal_id?`, `application_id?`
  - `application`: `application_id`, `gig_listing_id?`, `opportunity_id?`, `lead_id?`, `status`, `applied_at`, `external_url`
  - `gig_listing`: `gig_listing_id`, `source`, `external_id`, `url`, `title`, `budget_min?`, `budget_max?`, `posted_at`, `score?`, `score_reasons?`, `expires_at?`
  - `pipeline_event`: `event_id`, `entity_type`, `entity_id`, `from_stage`, `to_stage`, `actor`, `reason`, `created_at`
- Conformance test: new docs round-trip through `@ssss/cli validate`; sale export still drops all `tenant_private`.

## Phase 2 — CRM API & UI (G1, G2)

Goal: Greg can run the pipeline from the browser.

- `scripts/serve.mjs`: add `/api/crm/leads`, `/api/crm/opportunities`, `/api/crm/applications`, `/api/crm/pipeline`, `/api/crm/events` — CRUD via Operation Contract, stage transitions via `transition*` helpers, auth scoped to `/api/crm/*`.
- `static/crm-app.html`: pipeline board (columns = stages), detail drawer (lead + opportunity + proposal + application + events + tasks), filters (`stage`, `source`, `due_before`, `search`), overdue/due-today lanes, search over title/company/email.
- Wire existing visitor/proposal lists into the same board (an inbound visitor creates `lead` + `opportunity` in `qualifying`; existing proposals link by `proposal_id`).
- Manual "Create lead / Create opportunity" flows; "Convert listing → opportunity" button stub (wired in Phase 3).
- Defer polish: no drag-and-drop in v1 — click "Move to …" to avoid a11y/race bugs; add dnd later.

## Phase 3 — Email & automation wiring (G3)

Goal: Every outreach is templated, tracked, and auditable.

- Templates: `vault/campaigns/templates/*.md` with `{{lead_name}}`, `{{company}}`, `{{proposal_link}}`, `{{rate_card_band}}` variables; rendered by `lib/drip.mjs` helpers.
- Sequences: `vault/campaigns/sequences/*.md` (e.g., `nurture-qualifying` 3-step, `post-proposal-follow-up` 2-step) with `enrollInCampaign` / `advanceDripState` triggers on stage entry.
- Send paths reuse `emailTextToHtml` + `appendDraft` / SMTP2GO `createTransport`; both write `delivery_event` and `pipeline_event`.
- IMAP poller extension: classify inbound as `reply → opportunity` vs. `reply → application` (by `References`/`In-Reply-To` and recipient matching); append `inbox_message` and `pipeline_event` (`awaiting_reply → interview` etc. is manual, but reply detection auto-logs the signal).
- Admin controls: `GET/PUT /api/admin/delivery-settings` already exists — extend with `propose_mode` + `sequence_enabled` flags; kill switch is `delivery_settings.propose_mode = draft` which takes effect on next send without restart.

## Phase 4 — Proposal → Close → Kickoff (G4)

Goal: `sent → viewed → signed → paid` updates itself.

- Wire `lib/documenso.mjs` poller + webhook handler to update `proposal.signingStatus` and append `pipeline_event` (e.g., `proposal_sent → negotiating` on `viewed`, `negotiating → won:pending_payment` on `signed`).
- Wire Stripe webhook/poller (`stripe` package already in `package.json`) to handle `payment_intent.succeeded` → `opportunity.stage = won` + `pipeline_event`.
- On `won`: auto-create `calendar_event` (kickoff) + starter `task`s (SOW handoff, access, milestones) via `lib/calendar.mjs`.
- CRM reflects live signing/payment state inline (badge on proposal card, not a separate page).

## Phase 5 — Gig & job ingestion (G5)

Goal: Daily feed of scored, actionable gigs.

- Config: `vault/runtime/config/gig-sources.md` with per-source `enabled`, `keywords`, `exclusions`, `min_budget`, `rate_cap`, `retention_days`. All off by default.
- Ingesters: `scripts/lib/gig-ingest/<source>.mjs` — one per source, shared `fetch` + parse + normalize layer. Each validates its ToS path via WebSearch before being enabled (record WebSearch citation in code comment — active rule requires it).
- Scoring: `scoreForFit(listing, { rateCard, keywords })` via Opus 5; returns `{ score, reasons, suggested_band }`. Low token budget, cached per listing hash.
- CLI + cron: `scripts/gig-ingest.mjs` runs all enabled sources, writes `gig_listing` docs idempotently, prunes expired; callable manually and via `POST /api/admin/gig-ingest?source=...` (auth-gated) + nightly timer in `serve.mjs`.
- CRM tab: "Gigs" — filterable by source/score/budget/recency + "Create Opportunity" (creates `lead` + `opportunity` + `application` in one operation with pre-filled outreach draft).
- Safety: per-source rate cap, global daily cap, no auto-apply — draft creation only; auto-send only via the existing `delivery-decision` gate.

## Phase 6 — Schedule & task glue (G6)

Goal: Nothing overdue is silent.

- Pipeline transitions auto-create tasks where specified (map: stage → task template). Tasks carry `due_at`, `opportunity_id`, `snoozed_until`.
- Calendar events linked to opportunities via `opportunity_id` + `task_id`; displayed in CRM detail drawer and in a "Due today" lane.
- CalDAV/Google sync is optional pass-through via `lib/calendar.mjs` — if not configured, vault remains sole calendar.
- Reminder helper: `scripts/lib/schedule.mjs` query for `due_before: now` + `overdue: true`, exposed as `/api/crm/due`.

## Phase 7 — Reporting & snapshots (G7)

Goal: Answer "how's revenue?" from vault truth.

- `scripts/lib/revenue-report.mjs`: aggregate `opportunities` + `applications` + `delivery_events` into `{ pipeline_by_stage, weighted_value, win_rate, avg_cycle_days, overdue_count, email_stats, attribution }`.
- `GET /api/admin/revenue` + CRM Dashboard panel (cards + simple SVG bars; no chart lib dependency).
- Daily snapshot writer: `writeRevenueSnapshot()` appends `vault/runtime/snapshots/<date>.md` so history is durable without full scans. Prune snapshots older than `snapshot_retention_days`.
- Export: `GET /api/admin/revenue.csv` for sheets/BI (derived, not stored).

## Phase 8 — Hardening & polish

Goal: Make the machine boring and safe.

- Portability proof: `sale` and `template` exports contain zero pipeline/PII; test asserts counts.
- Auth scoping proof: unauthenticated `GET /` and `GET /splash.html` still 200; unauthenticated `/api/crm/*` still 401.
- Rate, cost, and abuse limits: per-source caps, global send cap, tournament/cost cap for scoring LLM, hard failure modes logged not thrown.
- Accessibility: pipeline board keyboard nav + `aria-label` audit; mobile board collapses to list.
- Docs: update `DESIGN.md` / `AGENTS.md` overlay if architecture changed; update `vault-registry.json` comments with portability tags.
- Load note: vault scans are `readdir + readFile` — no new external infra; verify on 1k-doc synthetic vault that dashboard stays <200ms.

## Rollout & flags

| Flag / config | Default | Effect |
|---------------|---------|--------|
| `gig-sources.<source>.enabled` | `false` | Source not ingested until explicitly enabled |
| `delivery_settings.propose_mode` | `draft` | No auto-send until human opts in |
| `delivery_settings.sequence_enabled` | `false` | Sequences off until toggled |
| `THEME_TOURNAMENT_N` etc. | unchanged | Unrelated, but don't regress generation flags |
| `snapshot_retention_days` | `90` | Snapshot pruning window |
| `gig_ingest_cron` env | `0 6 * * *` (6am daily) | Configurable; manual trigger always available |

All flags are vault docs or env — no code change to flip.

## Risks addressed in plan

- Auth catch-22: scoped auth, not `router.use(requireAuth)` at root.
- Vault bloat: bounded retention + pruning SSSS op for listings/snapshots.
- Scrape/API volatility: per-source module, WebSearch validation, flag-gated enable, rate caps.
- Pricing hallucination: rate card as sole price authority, artifact gate before send.
- Missed webhooks: poller fallback + manual re-sync endpoint.

## Appendix A — Inventory baseline (Phase 0, 2026-08-11)

Captured before any Revenue OS types were added. See `vault-registry/extensions/portfolio.json` for canonical definitions.

**Existing vault primitives (13, tenant_private unless noted):**

- `visitor_profile` → `runtime/visitors/<email-slug>.md` — required: `type, email, first_seen, last_seen, visits`; sample: `test@example.com` (1 visit, retro style, 2026-07-08)
- `proposal` → `runtime/proposals/<id>.md` — required: `type, proposal_id, client_email, status, created_at`; sample: `388f269c59c9f8a8` (pending_approval, E-commerce Platform $50k)
- `generation_run` → `runtime/runs/<id>.md` — append_only, required: `type, run_id, prompt, status, started_at`
- `rate_card` → `runtime/config/rate-card.md` — tenant_private, source of pricing (hourly $75, retainer $3k–5k, 11 bands); proposal generator must not invent numbers
- `banner_offer` → `runtime/config/banner-offers.md` — **structural** (in sale), A/B variants for CNA banner
- `drip_campaign` → `campaigns/<slug>.md` — structural, drip marketing (2 campaigns today)
- `banner_event_log` → `runtime/events/banner-events.md` — append_only tenant_private, dwell events
- `calendar_event` → `runtime/calendar/<id>.md` — required: `type, event_id, summary, dtstart` (currently empty folder)
- `webmail_settings` → `runtime/config/webmail-settings.md` — tenant_private, signature + OOO
- `design_evidence` → `runtime/evidence/<slug>/<run_id>-<pass>.md` — required: `type, slug, run_id, pass, outcome, created` (9 rescued evidence docs, 2026-07-30)
- `design_critique` → `runtime/critiques/...` — tenant_private (no samples yet)
- `delivery_settings` → `runtime/config/delivery-settings.md` — required: `type, propose_mode` (`draft`|`auto`, threshold 0.85, rate cap 3/24h)
- `delivery_event` → `runtime/events/delivery/<id>.md` — required: `type, delivery_id, kind, outcome, created`
- `gig_sources` → `runtime/config/gig-sources.md` — **new 2026-08-11**, tenant_private placeholder with 6 sources all `enabled:false` (upwork, greenhouse, lever, linkedin, contra, toptal)

**Core task primitive** (from `vault-registry/core.json`): `task` → `vault/tasks/*.md` — required: `type, priority, category, status` (pending/in_progress/done/failed); 3 samples (`first-task`, `relaunch-tracker`, `relaunch-plan`)

**Runtime-store helpers (`scripts/runtime-store.mjs`):** `initRuntimeStore, getRateCard, ensureRateCardSeeded, getBannerOffers, ensureBannerOffersSeeded, getDripCampaign, pendingDripVisitors, appendBannerEvent, getDeliverySettings, updateDeliverySettings, recordDeliveryEvent, countRecentAutoSends, listRecentDeliveryEvents, getVisitor, upsertVisitor, listVisitors, getProposal, upsertProposal, listProposals, appendRun, listRuns, pendingNotifications, getWebmailSettings, updateWebmailSettings, deleteProposal, flushRuntimeStore, getAllDripCampaigns` — all via `scheduleWrite` (250ms debounced Operation Contract helper `serializeRuntimeDocument`+`yamlLines`)

**Portability baseline (2026-08-11, before Revenue OS):**

```bash
npx ssss export vault --profile sale --registry vault-registry --out /tmp/re-sale-fixed.ucw.json
```

- Sale export: **16 files, ✓ valid** — `banner_offer`+2 `drip_campaign`+9 `page`+1 `rule`+1 `assistant`+2 `workflow` — correctly drops all `tenant_private` (proposals, visitors, evidence, runs, delivery_settings, rate_card, gig_sources absent). Without `--registry` the same vault exported 33 files (leaked tenant_private) and failed with 20 unknown-type errors — proving registry is load-bearing for portability filtering.

**Auth baseline:**

- No pathless `router.use(requireAuth)` in `serve.mjs` — only scoped `if (urlPath.startsWith('/api/admin/'))` at line 2830 and equivalent for future `/api/crm/*`. Verified 2026-08-11 — catch-22 not reintroduced.

**Model baseline:**

- `CNA_MODEL` and `PROPOSAL_MODEL` both default to `anthropic/claude-opus-5` in `scripts/serve.mjs:186-187` (env-overridable). No Gemini 3.5 remnants.

## Open questions (resolve in Phase 0/1, not later)

- CRM URL: keep `/crm-app.html` or move to `/admin/revenue`? Preference: keep `/crm-app.html` as the entry, add `/admin/revenue` JSON endpoint and embed dashboard in CRM tab.
- Lead deduplication: email-normalized exact match in v1; fuzzy company-name later.
- Calendar provider for Greg's real calendar: CalDAV URL vs. Google OAuth — confirm with Greg before writing sync code.
