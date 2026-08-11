# Readiness Walkthrough — Core Revenue Loop

Use this for the Definition of Done and for Triage blocker tests. Never declare stable/ready on code progress alone — prove it with this walkthrough.

## Environment

- Date:
- Branch/commit:
- Account/env used (stripe test key, mail sandbox, etc.):

## Steps — the core revenue loop

- [ ] Visitor arrives on gregiteen.xyz, submits style prompt → design generated and promoted
- [ ] Generation-complete digest received (carries desktop + mobile screenshots + DESIGN.md + enriched visitor profile) OR visitor-arrival email still fires separately (not conflated)
- [ ] Lead + opportunity created in vault (`lead` + `opportunity` in `qualifying`) and visible in CRM board
- [ ] Proposal draft generated from rate card band (no invented pricing) — appears as real draft in Drafts via IMAP APPEND, or auto-proposed if `propose_mode=auto` and confidence over threshold (respecting rate cap)
- [ ] Delivery audit: `delivery_event` written with kind/outcome/body + `pipeline_event` for the stage transition
- [ ] Client views/signs via Documenso link — poller/webhook updates proposal `signingStatus` and advances pipeline (`proposal_sent` → `negotiating` on viewed, `negotiating` → `won:pending_payment` on signed)
- [ ] Payment via Stripe `payment_intent.succeeded` → `opportunity.stage = won`
- [ ] Kickoff: `won` auto-creates calendar event + starter tasks; CRM detail drawer shows linked tasks
- [ ] Reporting: `/api/admin/revenue` reflects pipeline by stage, weighted value, win rate, overdue — derived from vault truth; daily snapshot file written
- [ ] Portability: `npx ssss export vault --profile sale` contains zero `tenant_private` (inspect counts); sale round-trips via provision/import
- [ ] Auth scoping: unauthed `GET /` and `/splash.html` still 200; unauthed `/api/crm/*` and `/api/admin/*` still 401
- [ ] Gig ingestion (when enabled): single source ingests idempotently, `gig_listing` written with score/reasons, "Create Opportunity" one-click creates lead+opp+app+draft, pruning respects retention

## Final call

- [ ] Ready
- [ ] Not ready; blockers listed below

## Blocker list

- P0:
- P1:
