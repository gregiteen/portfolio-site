---
name: portfolio-project-management
description: "portfolio-site-specific project management overlay. Use alongside the global project-management skill when managing portfolio-site GitHub issues, pull requests, or project tracker checklists. Defines the SSSS vault architecture reminders and repo context. Do NOT use for code implementation. MANDATORY: You MUST read the full SKILL.md file before executing."
---

# portfolio-site — Project Management Overlay

> This is a **repo-specific overlay**, not a standalone system. It assumes the global `project-management` skill's universal 4-file Kanban mechanics (folder layout, naming, tracker convention, operating modes) — read that skill first. This file only carries the delta: what portfolio-site actually is and its architecture reminders.

## What portfolio-site is

An SSSS-native project: a Markdown **vault** is the source of truth, validated and packaged by the dependency-free `@ssss/cli`. It is not a plain static portfolio page — it exports tradeable/sellable bundles (`npx ssss export vault --profile sale`) and includes email tooling and PDF rate-card generation, so treat vault conformance and export portability as first-class concerns, not afterthoughts.

## Architecture Reminders (for PR Review Mode)

- Source of truth: `vault/` — SSSS documents (structural + `tenant_private` primitives). See `vault-registry/` for the canonical list. Today: core 14 types + portfolio extension (`visitor_profile`, `proposal`, `generation_run`, `rate_card`, `delivery_settings`, `delivery_event`, `design_evidence`, `calendar_event`, etc.). New Revenue OS types land in `PORTFOLIO_REVENUE_ENGINE` (lead/opportunity/application/gig_listing/pipeline_event/inbox_message/revenue_snapshot) — all `tenant_private` and must never leak into `sale` export.
- Toolchain: `@ssss/cli` (github:gregiteen/ssss#v0.7.0), dependency-free by design. Mutations only via Operation Contract (`scripts/runtime-store.mjs` helpers or `POST /api/v1/ssss`) — never raw `fs.writeFile` for vault state.
- Build: `npm run build` → `scripts/build-site.mjs`; dev server via `npm run dev` (`build-site.mjs` + `serve.mjs`). `scripts/serve.mjs` is the live server (static + vault watcher + 2FA auth + theme generation jobs + CRM/proposal/calendar/webmail/Documenso/Stripe routes). Single owner of `dist/site` builds — theme children must set `THEME_DEFER_BUILD=1`.
- Auth (critical): scoped auth only — `if (urlPath.startsWith('/api/admin/'))` / `/api/crm/` checks inside `serve.mjs`. Never add a pathless `router.use(requireAuth)` — it 401-gates `/`, `/splash.html`, and the login page itself (past catch-22). Verify unauthed `GET /` still 200 before merging any auth change.
- Tests: `npm test` runs `node --test --test-concurrency=1 test/*.test.mjs` (43 tests, 7 files, ~1.5s, pure/in-memory or `os.tmpdir()` isolated — no live external calls). `npm run validate` (`ssss conformance --engine`) is the real type-safety layer — 23 fixtures + 8 runtime + 6 bundle/provisioning checks.
- Export: `npm run export` (`ssss export vault --profile sale`) produces a tradeable `.ucw.json` bundle — verify `npx ssss inspect dist/bundle.ucw.json --files` + `npx ssss help portability` + `isTenantPrivate` filtering before treating an export as shippable. `tenant_private` (leads/proposals/applications/visitors/tasks) must be absent from sale.
- Email/revenue surfaces: `imapflow`+`mailparser`+`nodemailer` (SMTP2GO send, Mailcow/Dovecot IMAP append/poll), `lib/drip.mjs` sequences, `lib/delivery-decision.mjs` confidence/threshold/rate-cap gate, `lib/documenso.mjs` e-signing + poller, `stripe` payments, `pdfkit` rate-card PDF — all real product surfaces, not scratch scripts.
- CRM: `static/crm-app.html` (1153 lines) is the Revenue OS work surface; `scripts/runtime-store.mjs` + future `scripts/lib/crm-store.mjs` own vault joins; `vault/runtime/` holds visitors/proposals/runs/evidence/delivery-events/calendar.
- Playwright present for `render-audit.mjs` (desktop 1440px + mobile 390px screenshots across 5 pages per run) and visual checks — don't assume unused.
- Stack invariants: vault owns truth/portability; code owns execution/presentation; every send/transition/sync writes an append-only event; delivery failures never roll back a design promotion.

## GitHub & Branch Strategy

- Repo: `gregiteen/portfolio-site`, remote `origin`, default branch `main` — **trunk-based**, short-lived `feat/`/`bugfix/`/`chore/` branches merged quickly. No `production`/`main` split.
- No `.github/pull_request_template.md` exists; issues use `type` labels (bug/feature/tech-debt) per `references/github_issue_mapping.md`. Milestones map to semver releases.
- Protect: no deploy auto-commit (`scripts/deploy.sh` rsyncs working tree to `138.197.199.217:/opt/portfolio-site` — dirty working tree is expected; deploy script takes pre-deploy backup before `--delete` rsync; committing is a separate intentional act).

## Definition of Done

A change is done when **all** are true:

1. Its tracker's testing/verification phase is fully checked off (standard `- [x]` checkboxes, final phase renamed `✅`).
2. `node .agent/skills/code-quality/scripts/check-syntax.mjs` passes (plain `.mjs`/`.js` repo — no `tsc`/`eslint`; those don't exist here).
3. `npm run validate` passes (23/23 + 8/8 + 6/6 SSSS conformance).
4. `npm test` passes (43+ tests across 7+ files).
5. For any vault/registry/export touch: fresh `npx ssss export vault --profile sale --out /tmp/check.ucw.json && npx ssss inspect` round-trip succeeds with zero `tenant_private` leak (visitors/tasks/leads/proposals absent from sale).
6. For any auth/serve touch: unauthed `GET /` and `GET /splash.html` still 200; unauthed `/api/crm/*` and `/api/admin/*` still 401.
7. Docs: the repo's own memory (`AGENTS.md`, this overlay, `docs/projects/DEFERRED_BACKLOG.md` extraction on move to `completed/`) reflects the change.

## Severity / Blocker Test

> Would this prevent a real user from completing the core revenue loop, risk data/portability, or break deploy?

Core revenue loop (readiness walkthrough): **visitor arrives → style prompt → bespoke design generated → proposal draft in Drafts (or auto-proposed over threshold) → client views/signs (Documenso) → payment (Stripe) → kickoff task/calendar → pipeline moves to `won` → dashboard/report reflects it.**

- `P0-critical` — blocks that loop, leaks `tenant_private` into sale, corrupts vault, breaks auth catch-22, or breaks deploy/health. Fix now.
- `P1-high` — seriously damages loop (e.g., CRM overdue invisible, delivery_event not written, IMAP draft fails silently) but has workaround.
- `P2-medium` — annoying/incomplete but loop continues (copy, burnt-in rate card, single-source gig ingest down).
- `P3-low` — polish/visual/a11y cleanup.

## Prioritization (repo-specific — overlay overrides default)

1. Data safety & `tenant_private` portability (never leak PII to sale).
2. Core revenue loop reliability (pipeline → proposal → signing → payment).
3. Vault/state integrity & SSSS conformance.
4. Usability of the CRM/board/overdue surfaces.
5. Cost/rate-cap & abuse reporting loops.
6. Polish.
7. New ingest sources / new features.

## Deployment & Testing Notes

- Pre-push gates (in order): syntax scan → `npm run validate` → `npm test` — all one-shot inline, not daemon polled. See `code-quality/SKILL.md` for why `tsc`/`eslint` must NOT be run here.
- Deploy mechanics: `npm run build` then `bash scripts/deploy.sh` (rsync to `138.197.199.217:/opt/portfolio-site`, pm2 `portfolio`, nginx+HTTPS). The droplet layout is documented in `deploy/references/digitalocean.md`. Do `node .agent/skills/deploy/scripts/deploy.mjs` for the pre-flight scope report + safety backup.
- External APIs: WebSearch pricing/availability/gating before integrating any new source (Upwork, Greenhouse, Lever, LinkedIn). Existing validated: SMTP2GO, Mailcow IMAP, Documenso, Stripe.

## Active Work Resolution

Resolve dynamically every session — never trust a stale note in this file:

1. User's latest explicit instruction.
2. `docs/projects/in-progress/*/*_PROJECT_TRACKER.md` (today: `PORTFOLIO_REVENUE_ENGINE` is active; `planned/` holds `GENERATIVE_DESIGN_STUDIO` + `GENERATION_DELIVERY_PIPELINE`; `completed/` holds `PORTFOLIO_RELEASE`; `archived/` holds `PORTFOLIO_VISITOR_FUNNEL_RECOVERY` etc.).
3. GitHub issues by milestone — only after local trackers.
4. `docs/projects/DEFERRED_BACKLOG.md` — parking lot only.

If sources disagree, prefer the user's instruction, then update the stale source so the next agent doesn't repeat the mistake.
