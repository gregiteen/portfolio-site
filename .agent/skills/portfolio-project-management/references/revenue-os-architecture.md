# Revenue OS Architecture — Quick Reference

Source: `docs/projects/in-progress/PORTFOLIO_REVENUE_ENGINE/PORTFOLIO_REVENUE_ENGINE_ARCHITECTURE.md` + vault registry.

## SSSS types (current + Revenue OS)

- **Existing (vault-registry/extensions/portfolio.json):** `visitor_profile` (tenant_private, runtime/visitors/), `proposal` (tenant_private), `generation_run` (tenant_private, append_only), `rate_card`, `banner_offer` (structural), `drip_campaign` (structural), `delivery_event`, `design_evidence`, `calendar_event`, `webmail_settings`
- **New (PORTFOLIO_REVENUE_ENGINE):** `lead`, `opportunity`, `application`, `gig_listing`, `pipeline_event`, `inbox_message`, `revenue_snapshot` — all `tenant_private`, never in `sale` bundle. `email_template`/`sequence` are versioned but gated out of sale.

## Portability invariant

Every `tenant_private` file must pass `npx ssss export vault --profile sale` filtering. Test in `test/ssss-conformance.test.mjs` asserts no `tasks/` in sale and no `tenant_private` after import. New types must pass the same gate before Phase 1 closes.

## Pipeline stage machines

Opportunity: `inbox → qualifying → proposal_draft → proposal_sent → negotiating → won|lost→dormant` (nurture is a sequence, not a stage; `won` needs Stripe succeeded or manual mark).

Application: `found → scored → opportunity_created → applied → awaiting_reply → interview → offer → won|lost` (dismissed/withdrawn branches; IMAP poller only logs reply signal, human advances interview/offer).

## Key files by area

- Vault + registry: `vault/`, `vault-registry/core.json`, `vault-registry/extensions/portfolio.json`, `scripts/sync-registry.mjs`
- Runtime store: `scripts/runtime-store.mjs` (+ future `scripts/lib/crm-store.mjs`)
- Server: `scripts/serve.mjs` (scoped auth at `/api/admin/*` and future `/api/crm/*`)
- CRM UI: `static/crm-app.html`
- Email: `scripts/lib/drip.mjs`, `lib/imap.mjs`, `lib/delivery.mjs`, `lib/delivery-decision.mjs`
- Signing/pay: `lib/documenso.mjs`, `stripe`
- Visual audit: `scripts/render-audit.mjs`
- Quality: `code-quality` skill — syntax scan + `npm run validate` (23+8+6) + `npm test`
- Deploy: `scripts/deploy.sh` → `138.197.199.217:/opt/portfolio-site` (pm2 `portfolio`); pre-flight `node .agent/skills/deploy/scripts/deploy.mjs`

## Auth invariant (P0)

Never `router.use(requireAuth)` pathless. Scope to `/api/admin/*` and `/api/crm/*`. Unauthed `GET /` must stay 200. See past catch-22 fix.

## Cost

Model defaults: `CNA_MODEL`/`PROPOSAL_MODEL` → `anthropic/claude-opus-5` unless env overrides. Outreach scoring uses same cheap path; cap tournament/scoring calls via env.
