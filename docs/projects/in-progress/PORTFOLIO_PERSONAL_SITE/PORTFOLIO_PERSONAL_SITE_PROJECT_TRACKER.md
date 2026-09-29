# PORTFOLIO_PERSONAL_SITE — Project Tracker

> **Project Prefix**: `PORTFOLIO_PERSONAL_SITE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen
> **Date**: 2026-09-28
> **Based on audit**: PORTFOLIO_PERSONAL_SITE_AUDIT.md (Complete, e2c8ed3)

---

## ✅ Phase 0: Audit

- [x] [Audit](PORTFOLIO_PERSONAL_SITE_AUDIT.md) complete at `e2c8ed3`, baseline run on the Mac mini (119/120)
- [x] PRD, architecture, plan and this tracker rewritten from the audit

## ⏳ Phase 1: Fix P0/P1 audit findings

- [x] A-001 remove the obsolete Total Recall surface patch, its postinstall call and test; `npm ci` exits 0 on the mini (verified 2026-09-28)
- [x] A-002 suite green on the mini from a clean checkout: 126/126 (2026-09-28)
- [x] A-015 site public when generation is off (flag, `site-mode.mjs`)
- [x] A-016 generation fully off: routes, redirects, splash/verify, build-time injection (flipper, lead-gen banner, start-a-project links, cookie notice, visitor beacon)
- [x] A-019 all six `engine.processOperation()` calls awaited; regression test `test/ssss-async-engine.test.mjs`; server boots on a clean checkout (verify on the mini)
- [x] A-003 Gemini removed from active code (proposal enrichment no longer grounded, visitor research returns 501, runtime key setter and `geminiCall` removed, 18 `gen-*.mjs` deleted, `improve-theme.mjs` refuses to start until ported); web-grounded research on OpenRouter is deferred
- [x] Tests: `test/personal-site.test.mjs` (unit tests plus a spawn smoke test with dummy SMTP env)

## ⏳ Phase 2: Fix P2/P3 findings that touch this change

- [x] A-014 `vault/visitors.md` untracked and ignored
- [x] A-006 `/api/test/logout` gated behind `ENABLE_TEST_LOGOUT=1`
- [x] A-007 `Secure` cookie when served over https
- [x] A-008 `sales@gregiteen.xyz` literals replaced by `me@gregiteen.xyz`; admin identity is `ADMIN_EMAIL`/`MAIL_OWNER` only (deploy must set both, and the mailbox must exist)
- [x] A-009 stray root scripts deleted

## ⏳ Phase 3: JSN at /jobs

- [x] `/api/jsn/*` proxy (admin only, token server side) with tests against a fake JSN
- [x] `/jobs` page from `npm run sync-jobs`
- [x] `JSN_API_TOKEN` secret stored, bound to both repos
- [ ] JSN listening on the mesh address with the token (`JSN_HOST`, `JSN_API_TOKEN`) and `JSN_URL`/`JSN_API_TOKEN` set in the site's PM2 environment (needs Greg: D-4)

## ⏳ Phase 4: Copy and deploy

- [ ] A-020 personal-site renderer (`scripts/build-personal.mjs`) wired into personal mode
- [ ] A-021 vault kinds `deployed-site` and `open-source` with documents for the verified entries
- [ ] Redesign: hero with motion graphics, innovation story, deployed sites, open-source projects, project pages, About with LinkedIn, contact
- [ ] A-022 every fact dated and verified; no unverified licence or metric
- [ ] A-023 reduced-motion fallback and performance checked in the browser pane
- [ ] Greg reviews the redesign in the browser pane
- [ ] Gates on the Mac mini; PM2 env set; deploy via the deploy skill

## ⏳ Phase 5: Testing and verification

- [ ] Logged-out walkthrough on gregiteen.xyz (public pages, `/generate.html`, `/jobs` redirect)
- [ ] Admin walkthrough (`/jobs` dashboard against live JSN)
- [ ] Every audit finding has a final disposition (`node .agent/skills/project-management/scripts/check-audit.mjs`)

## Deferred (from the audit)

- A-004 deploy hardening, A-005 web deploy hook, A-011 credentials to the secret store, A-012 split `serve.mjs`, A-017 stale worktree, A-018 Mailcow decision (D-3)

## Verification Log

- 2026-09-28: clean checkout on the Mac mini after A-019 — `npm ci` exit 0; tests 126 pass / 0 fail
- 2026-09-28: after fixes, clean checkout on the Mac mini — `npm ci` exit 0; tests 124 pass / 1 fail (smoke test needed dummy SMTP env; fixed)
- 2026-09-28: baseline on the Mac mini, `e2c8ed3` — `npm ci` failed at postinstall; tests 119 pass / 1 fail
