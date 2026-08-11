# PORTFOLIO_REVENUE_ENGINE — Architecture

> **Project Prefix**: `PORTFOLIO_REVENUE_ENGINE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Muse Code
> **Date**: 2026-08-11

---

## Design principle

**The vault is the revenue ledger; the code is the worker.**

Today authority is split: visitors in one folder, proposals in another, drip state in memory, calendar ad-hoc. Every new revenue concept needs a new store. This project unifies authority: **one SSSS vault with typed documents as the only source of truth**, one runtime store that threads them, one CRM that renders them, and background pollers/workers that only *derive* state (never invent it). Code owns execution and presentation; the vault owns truth and portability.

Fail-closed and audit-by-default are inherited from the existing stack (`GENERATION_DELIVERY_PIPELINE` delivery events, `static/crm-app.html` read path, IMAP draft path). Every send, transition, and external sync writes an append-only event.

## SSSS document model — new and extended types

All types are validated by `@ssss/cli` via `vault-registry.json`. Mutations go through the Operation Contract (`POST /api/v1/ssss` in dev, `scripts/runtime-store.mjs` helpers in production), never raw `fs.writeFile`.

| Type | Portability | Vault path | Purpose |
|------|-------------|------------|---------|
| `lead` | `tenant_private` | `vault/runtime/leads/<id>.md` | Person/company that could buy. Source attribution (portfolio, outbound, referral), enrichment, consent. |
| `opportunity` | `tenant_private` | `vault/runtime/opportunities/<id>.md` | Dollar-weighted deal. Links to `lead`, stage, value, probability, next_action_at, source. |
| `application` | `tenant_private` | `vault/runtime/applications/<id>.md` | One job/gig application attempt. Links to ingested `gig_listing`, `lead`/`opportunity`, status machine. |
| `gig_listing` | `tenant_private` | `vault/runtime/gig-listings/<source>/<id>.md` | Raw ingested posting snapshot (source, url, title, budget, posted_at, score, expires_at). Prunable. |
| `email_template` | `structural` | `vault/campaigns/templates/<id>.md` | Reusable outreach/proposal/follow-up template with variables and rate-card bindings. Ships only in private export. Marked structural so it can be versioned, but never in `sale` bundle (treat as `tenant_private` for export — enforce via profile filter). |
| `sequence` | `structural` | `vault/campaigns/sequences/<id>.md` | Drip/sequence definition (steps, delays, branch on reply). Backed by existing `lib/drip.mjs`. |
| `delivery_event` | `tenant_private` | `vault/runtime/delivery-events/<id>.md` | Append-only audit of every outbound attempt (send/draft/auto, outcome, confidence, body snapshot). Existing `delivery_events` store extended. |
| `pipeline_event` | `tenant_private` | `vault/runtime/pipeline-events/<id>.md` | Append-only stage transition log for an opportunity/application/proposal (from→to, actor, reason). |
| `task` | `tenant_private` | `vault/tasks/<id>.md` | Action item linked to opportunity/lead/application. Due date, status, snooze. Extends existing `vault/tasks/`. |
| `calendar_event` | `tenant_private` | `vault/runtime/calendar/<id>.md` | Meeting/call/deadline linked to opportunity/task. Source of truth for `lib/calendar.mjs`. |
| `inbox_message` | `tenant_private` | `vault/runtime/inbox/<id>.md` | Cached IMAP message linked to lead/opportunity (threading). Never authoritative over mailbox. |
| `revenue_snapshot` | `tenant_private` | `vault/runtime/snapshots/<YYYY-MM-DD>.md` | Daily rollup for reporting (pipeline by stage, weighted value, win/loss). Computed, not hand-edited. |

Existing types reused unchanged: `visitor_profile` (`vault/runtime/visitors/`), `proposal` (`vault/runtime/proposals/`), `generation_run` (`vault/runtime/runs/`), `design_evidence`, `banner_event`, `rate-card.md`, `webmail-settings.md`, `delivery_settings` (via `runtime-store.mjs`).

> **Portability check.** All `tenant_private` types must be absent from `npx ssss export vault --profile sale --out dist/bundle.ucw.json` and from `template`. Verify with `npx ssss inspect` before closing Phase 1. `email_template`/`sequence` are operator-owned but sensitive — gate them out of sale the same way.

**Canonical ID & linking:** every doc carries a stable `id` (opportunity `opp_<ulid>`, lead `lead_<ulid>`, application `app_<ulid>`, listing `gl_<source>_<hash>`). Cross-links are `lead_id`, `opportunity_id`, `proposal_id`, `application_id`, `gig_listing_id` frontmatter fields — never filename parsing.

## Pipeline state machines

### Opportunity stages (G1)

```
inbox → qualifying → proposal_draft → proposal_sent → negotiating → won | lost → dormant
          ↑                ↑                ↑              ↑           │
          └────── nurture ─┘          revision ──────────┘      reactivated → qualifying
```

- `nurture` is not a stage — it's a sequence running while in `qualifying`/`dormant`.
- `proposal_sent` advances from Documenso `viewed`/`signed` and IMAP reply detection, not just local state.
- `won` requires Stripe `payment_intent.succeeded` or manual `mark_paid`.

### Application stages (G5/G6)

```
found → scored → opportunity_created → applied → awaiting_reply → interview → offer → won | lost
          │                │               │              │            │
          └── dismissed ───┘          withdrawn     no_response → dormant
```

`found` is an ingested listing; `opportunity_created` auto-links an opportunity for tracking value; stages after `applied` are updated by IMAP reply poller + manual CRM action.

Each transition appends a `pipeline_event` and may enqueue tasks/calendar events.

## Component 1 — Unified Pipeline & CRM Core (G1, G2)

**Current:** `listVisitors()`, `listProposals()`, `listRuns()` each scan one folder; CRM fetches several endpoints and joins in the browser.

**Target:**

```
vault/runtime/{leads,opportunities,applications,proposals,visitors}
        │
        └─ runtime-store.mjs ── listLeads/listOpportunities/listApplications/getPipeline + join helpers
                │
                ├─ serve.mjs REST: /api/crm/* (CRUD via Operation Contract)
                └─ static/crm-app.html (single pipeline view + filters, overdue, search)
```

- New store modules: `scripts/lib/crm-store.mjs` (or extensions to `scripts/runtime-store.mjs`) with `upsertLead`, `upsertOpportunity`, `transitionOpportunity`, `upsertApplication`, `listGigListings`, `queryPipeline({stage, due_before, source})`.
- CRM API is authorized (existing `requireAuth`-style gate scoped to `/api/crm/*` and `/api/admin/*` — **not** `router.use(requireAuth)` at the root, per the auth catch-22 correction).
- Search: server-side filter over frontmatter first; later back by SSSS semantic search (`@ssss/cli` embeddings) if needed — no new search infra in Phase 1.

## Component 2 — Email & Automation (G3)

```
template/sequence (vault/campaigns) ──▶ renderDripTemplate / renderProposalEmail
                                              │
                                              ├── SMTP2GO (send) ──▶ delivery_event
                                              ├── IMAP APPEND (draft) ──▶ delivery_event
                                              └── IMAP poller (fetchInbox) ──▶ inbox_message + pipeline_event (reply detected)
```

- Extends `lib/drip.mjs`, `lib/imap.mjs`, `lib/delivery.mjs`, `lib/delivery-decision.mjs`. Reuses `emailTextToHtml` and `createUnsubscribeToken`.
- Every send/draft path records a `delivery_event` (existing `recordDeliveryEvent`) and a `pipeline_event` naming the transition it caused.
- Unsubscribe is enforced on every sequence step; transactional one-offs (proposal view, payment receipt) skip it but log why.
- Poller: `startImapPoller` already exists — extend to classify replies (proposal thread vs. gig application) by `In-Reply-To`/`References` + recipient matching.

## Component 3 — Proposal → Close → Kickoff (G4)

```
opportunity ──▶ proposal (generated from rate-card + CNA assessment) ──▶ draft (IMAP) ─┬─▶ sent ─▶ viewed ─▶ signed (Documenso)
        │                    │                                              │                └─▶ Stripe payment ─▶ won
        │                    └─ artifact-gate + ensureRateCardSeeded        └─▶ revision loop ─┘
        └─ Stripe + Documenso pollers ──▶ proposal doc update ─▶ pipeline_event + task ("kickoff scheduled")
```

- No new signing or payments code. `lib/documenso.mjs` (`createSigningRequest`, `startDocumensoPoller`, `signingStatusForEvent`) and `stripe` webhook/poller already exist — wire lifecycle updates into `upsertProposal` + `transitionOpportunity`.
- Kickoff: transitioning to `won` auto-creates a `calendar_event` (kickoff call) and `task`s (SOW, access, milestones) via `lib/calendar.mjs`. All SSSS docs.

## Component 4 — Job & Gig Search Engine (G5)

```
sources.yaml (vault/runtime/config/gig-sources.md) ──▶ ingesters (one module per source)
        │                                                      │
        │                                              scoreForFit() (LLM, Opus 5, rate-card aware)
        │                                                      │
        └──────── daily cron (scripts/gig-ingest.mjs) ────────┴──▶ gig_listing docs (+ expires_at)
                                                                      │
                                                                      └─▶ CRM "Gigs" tab: filter by score, one-click "Create Opportunity"
```

**Sources (phase 2, flag-gated per source):**

| Source | Access | Notes |
|--------|--------|-------|
| Upwork RSS/API | API key or RSS where ToS permits | Highest volume; requires WebSearch before enabling |
| Greenhouse boards | Public JSON (`boards-api.greenhouse.io`) | Company-specific boards Greg follows |
| Lever postings | Public API | Similar to Greenhouse |
| LinkedIn Jobs | Scrape-limited / official API | Only via permitted API; otherwise manual capture |
| Contra / Toptal | RSS/API | Lower volume, high fit |

- Each source has `enabled`, `rate_cap`, `keywords`, `min_budget`, `exclusions` in `gig-sources.md`.
- Ingest is idempotent on `gig_listing_id = hash(source + external_id)`.
- Scoring prompt includes rate card bands and Greg's positioning; score `0-100` with reasons; threshold for CRM highlight is configurable.
- "Create Opportunity" clones listing → `lead` (company) + `opportunity` (deal, value = listing budget mid) + `application` (status `opportunity_created`) and pre-fills a tailored outreach draft (never auto-sends without gate).
- Retention: listings older than `retention_days` (default 30) or `expires_at` are pruned by an SSSS operation, not by filesystem delete.

## Component 5 — Schedule & Tasks (G6)

- `vault/tasks/` and `vault/runtime/calendar/` remain the sources of truth.
- Pipeline transitions auto-create tasks: `qualifying → follow up in 3d`, `proposal_sent → check viewed in 2d`, `interview → send thank-you`.
- `lib/calendar.mjs` poller syncs CalDAV/Google Calendar if configured; otherwise vault is sole calendar.
- CRM surfaces: "Due today", "Overdue", "Up next" derived queries; snooze writes `snoozed_until` on the task doc (no delete).

## Component 6 — Reporting (G7)

Computed from vault docs, no new store:

```
listOpportunities + listApplications + delivery_events + revenue_snapshots
        │
        └─ scripts/lib/revenue-report.mjs ──▶ /api/admin/revenue (JSON) ──▶ CRM Dashboard + static report page
```

- Daily `revenue_snapshot` doc captures pipeline by stage, weighted pipeline (`value * probability`), win/loss, median cycle time, overdue count, email send/reply rates — so history doesn't require scanning all time.
- Attribution: `opportunity.source` (`portfolio_direct`, `gig_upwork`, `job_greenhouse`, `referral`, `manual`) powers "where does revenue come from" chart.

## Security & compliance

- Auth: CRM and admin routes behind session auth (existing 2FA flow). No pathless `router.use(requireAuth)` — scope to `/api/crm/*`, `/api/admin/*`, `/api/proposal*` write paths.
- Secrets: `SMTP_*`, `MAIL_OWNER`, `IMAP_*`, `STRIPE_SECRET_KEY`, `DOCUMENSO_*`, `GIG_SOURCE_*` via `secrets.enc` / `process.loadEnvFile`. Never vault frontmatter.
- CSP: existing artifact CSP remains; no new external script hosts for gig ingest (server-side only).
- Unsubscribe: every sequence email carries `List-Unsubscribe` + tokenized link (`verifyUnsubscribeToken`); transactional proposal emails are exempt with reason logged.
- PII: `tenant_private` export filtering guarantees leads/PII never ship in `sale` bundle; verify in tests.

## Files touched

| File | Change |
|------|--------|
| `vault-registry.json` | Register `lead`, `opportunity`, `application`, `gig_listing`, `pipeline_event`, `delivery_event` (extend), `calendar_event`, `inbox_message`, `revenue_snapshot` |
| `scripts/runtime-store.mjs` + `scripts/lib/crm-store.mjs` (new) | CRUD + queries for new types; join helpers; snapshot writer |
| `scripts/lib/gig-ingest/` (new dir) | Per-source ingesters, `scoreForFit`, `pruneListings`, CLI `scripts/gig-ingest.mjs` |
| `scripts/lib/revenue-report.mjs` (new) | Snapshot compute + aggregation for reporting |
| `scripts/serve.mjs` | `/api/crm/*`, `/api/admin/revenue`, `/api/admin/gig-sources`, scoped auth, webhook handlers (Stripe/Documenso), IMAP reply classifier |
| `scripts/lib/imap.mjs` | Reply classification helpers, `appendDraft` reuse |
| `scripts/lib/drip.mjs` + `vault/campaigns/` | Sequence wiring to pipeline triggers |
| `static/crm-app.html` | Pipeline board, gigs tab, dashboard, due/overdue, search |
| `vault/runtime/config/gig-sources.md` (new) | Source registry (enabled flags, keywords, rate caps) |
| `vault/runtime/config/rate-card.md` | Unchanged shape, referenced as price authority |
| `test/*.test.mjs` | Conformance: portability, lifecycle, scoring determinism, auth scoping |

## Alternatives considered

- **External CRM (HubSpot/Attio):** rejected — vault is already the CRM; syncing adds cost and PII surface. Export feed later if needed.
- **Postgres for pipeline:** rejected — SSSS VFS is the project invariant; ephemeral SQLite cache for listing dedupe is ok but not authoritative.
- **Single `deal` type for everything:** rejected — `opportunity` (revenue-weighted) vs. `application` (hiring-process) have different lifecycles and reporting; conflating them loses semantics.
