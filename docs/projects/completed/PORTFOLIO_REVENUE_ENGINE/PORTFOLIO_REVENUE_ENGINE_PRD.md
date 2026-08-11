# PORTFOLIO_REVENUE_ENGINE — PRD

> **Project Prefix**: `PORTFOLIO_REVENUE_ENGINE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Muse Code
> **Date**: 2026-08-11

---

## Problem

The portfolio-site is a beautiful front door with a thin backend. It can generate bespoke designs, capture a visitor, send a proposal, and show a CRM page — but those pieces don't form a **revenue system**. Today:

1. **No unified pipeline.** Visitors, proposals, gig opportunities, job applications, and calendar events live in disconnected files (`vault/runtime/visitors/`, `vault/runtime/proposals/`, `vault/runtime/calendar/`, `vault/tasks/`). There is no single `lead → opportunity → proposal → negotiation → won/lost` flow with status, value, and next action.

2. **CRM is a viewer, not an engine.** `static/crm-app.html` renders existing vault docs but doesn't drive work: no follow-up automation, no drip timing, no task creation, no revenue reporting. Sales activity is invisible unless Greg remembers to check.

3. **Email is one-way and fragile.** `scripts/serve.mjs` can send via SMTP2GO and append drafts via IMAP, and a drip system exists (`vault/campaigns/`, `lib/drip.mjs`), but there's no unified inbox, no outbound tracking (opens/replies/bounces), no templated outreach, and no link between "email sent" and "proposal status changed."

4. **Proposals don't close the loop.** Proposal threads (`vault/runtime/proposals/*.md`) support a revision loop and Documenso e-signing, but there is no payment (Stripe intent is wired but not tied to a proposal lifecycle), no schedule to kick off work, and no post-signature handoff.

5. **Job & gig search is manual.** Gig boards (Upwork, Contra, Toptal, LinkedIn jobs, Greenhouse/Lever postings) are visited by hand. No ingestion, no scoring, no auto-tailored outreach, no application tracker, and no connection to the same CRM that tracks direct inbound leads — so inbound and outbound are two separate brains.

6. **Nothing is measured.** No dashboard answers: How many leads this week? Pipeline value? Win rate? Avg. time to close? Follow-ups overdue? Revenue booked? Without that, automation has no feedback loop.

Portfolio-site should be Greg's **Revenue OS** — the portfolio, CRM, outreach engine, proposal factory, scheduling layer, and reporting surface in one SSSS-native system.

## Goals

- **G1 — One Revenue Pipeline.** Every dollar-traced item is a record in a single pipeline with stages, value, probability, next action, and owner. Portfolio inbound, outbound gigs, and job applications all flow through the same state machine.
- **G2 — CRM that drives action.** CRM becomes the work surface: create/update leads and opportunities, log contact, enqueue next touch, trigger email/drip, create tasks, and see overdue at a glance. Search and filter across everything.
- **G3 — Email + Automation.** First-class outbound: templates, sequences (drips), scheduled sends, reply/inbound detection via IMAP poller, unsubscribe compliance, and delivery events that mutate pipeline state. Nothing sent without a `delivery_event` audit.
- **G4 — Proposal → Close → Kickoff.** Proposal lifecycle fully tracked: draft → awaiting approval → sent → viewed → revision → approved → signing → signed → paid → kicked off. Stripe + Documenso state joined to the pipeline automatically via webhooks/pollers.
- **G5 — Job & Gig Search Engine.** Ingest gig/job listings from configured sources (APIs where available, RSS/scrape where not), score for fit, surface top candidates, one-click "create opportunity + tailor proposal," and track application status end-to-end. Rate-limited, auditable.
- **G6 — Schedule & Task Tracking.** Every opportunity/proposal/application has linked tasks and calendar events (`vault/runtime/calendar/` + `vault/tasks/`), with due dates, reminders, and a "what's due today" view. No silent overdue.
- **G7 — Reporting & Accountability.** Revenue dashboard: pipeline by stage, weighted pipeline, win/loss, cycle time, follow-up SLAs, email performance, and source attribution. All derived from vault primitives — no side DB.

## Non-Goals

- **Not a replacement for ATS or Upwork.** We ingest and track; we don't reimplement their platforms. External systems remain the system of record for the external posting — we own our copy and our workflow.
- **Not an autonomous spammer.** Outreach is template-assisted and human-approved by default. Auto-send only behind the existing `delivery-decision` confidence/threshold/rate-cap gate, with an immediate kill switch.
- **Not a general-purpose email client.** Full webmail already exists (`lib/webmail-ui.mjs`, `webmail-settings.md`). This extends it with pipeline-linked composition, not a Gmail clone.
- **Not a new persistence layer.** SSSS VFS documents remain the only source of truth. No Postgres, no SQLite for app state (ephemeral search caches ok, but not authoritative).
- **Not a rewrite of the design generator.** `GENERATIVE_DESIGN_STUDIO` and `GENERATION_DELIVERY_PIPELINE` stay on their own tracks; this project consumes their outputs (designs/evidence/visitors) but doesn't change generation.

## Users & Use Cases

| User | Use case |
|------|----------|
| Greg (founder/IC) | Opens CRM, sees 3 overdue follow-ups, sends 2 templated check-ins, watches pipeline update and tasks reschedule |
| Greg (inbound) | Visitor requests a style → portfolio captures lead → proposal draft auto-created in Drafts → Greg edits & sends → pipeline advances → Documenso + Stripe track close |
| Greg (outbound) | Gig ingester surfaces 5 high-fit Upwork/Greenhouse leads → one-click create opportunity → tailored proposal draft generated from rate card + CNA → tracked as application |
| Visitor / Client | Receives on-brand proposal, signs via Documenso, pays via Stripe, gets kickoff calendar invite — all triggered by one pipeline transition |
| Greg (reporting) | Opens /admin/revenue (or CRM dashboard) — pipeline value, stage counts, win rate, revenue booked this quarter, overdue SLAs |

## Success Metrics

| # | Metric | Baseline (2026-08-11) | Target |
|---|--------|----------------------|--------|
| M1 | Leads → opportunities → proposals tracked in one pipeline doc type | 0 (scattered) | 100% new items |
| M2 | CRM overdue/follow-up visibility | none | "Due today / Overdue" surfaces correct per vault |
| M3 | Outbound email → delivery_event → pipeline state (audit trail) | partial (proposal delivery only) | every send creates delivery_event |
| M4 | Proposal close rate instrumentation (sent→signed→paid) | manual | auto-joined from Documenso/Stripe webhooks |
| M5 | Gig/job sources ingested and scored | 0 sources | ≥3 sources, daily, with scoring |
| M6 | Applications tracked end-to-end (found → applied → response → interview → offer → won/lost) | 0 | full lifecycle |
| M7 | Dashboard answers pipeline/value/win-rate without external tools | no | yes, derived from vault |

## Constraints

- **SSSS-first (absolute).** Leads, opportunities, applications, pipeline events, email templates, drip state, job listings, tasks, and report snapshots are SSSS VFS documents via the Operation Contract. No ad-hoc JSON stores for authoritative state. See Architecture for type table.
- **Portability (§5.5).** Pipeline, proposals, visitors are runtime/tenant-private data that must **never** appear in `sale`/`template` bundles. Design-system docs are structural. Enforce via `vault-registry` portability tags and prove with `npx ssss export`.
- **Secrets hygiene.** All tokens (SMTP2GO, Mailcow/IMAP, Stripe, Upwork/LinkedIn scrapers, Greenhouse API keys, Documenso) live in `secrets.enc` / env, never in vault docs. Rotate where prior commits leaked.
- **Cost.** LLM calls (tailored outreach, scoring, CNA/proposal gen) are Opus 5 by default (`CNA_MODEL`, `PROPOSAL_MODEL`) — env-overridable, budget-capped, and prompt-injection hardened.
- **No new runtime provider without WebSearch.** Per active rules: WebSearch pricing/availability/feature-gating before integrating any external API (Upwork, Greenhouse, Lever, Stripe, Documenso already vetted; new ones must be checked live).
- **Email compliance.** Unsubscribe token (`createUnsubscribeToken`/`verifyUnsubscribeToken`) on every bulk/sequence send; `MAIL_FROM` is `sales@gregiteen.xyz`; SPF/DKIM/DMARC already live on Vercel.
- **Failure isolation.** Delivery/indexing/scoring failures never roll back a design promotion or delete a pipeline record. Every path writes an auditable event and degrades gracefully.

## Risks

| Risk | Mitigation |
|------|-----------|
| IMAP/SMTP outage breaks CRM feel | Async pollers with backoff; delivery never blocks writes; queue + retry + event log |
| Scraping ToS / API volatility for gig boards | Prefer official APIs/RSS; scrape only where ToS permits; gate per-source with flag + rate cap; WebSearch validation per source |
| AI outreach hallucinates pricing/scope | Rate card is sole price source (from `vault/runtime/config/rate-card.md`); proposal generator never invents numbers; post-generation artifact gate before send |
| Vault bloat from ingested listings | Bounded retention policy + SSSS pruning operation; listings are transient snapshots, not forever |
| Pipeline state drift (webhook missed) | Pollers as fallback (Documenso, Stripe, IMAP) + manual "re-sync" admin action |
| Scope creep across 7 goals | Phased plan with hard gates; G1+G2 land first and are shippable alone; each later goal is independently flaggable |
