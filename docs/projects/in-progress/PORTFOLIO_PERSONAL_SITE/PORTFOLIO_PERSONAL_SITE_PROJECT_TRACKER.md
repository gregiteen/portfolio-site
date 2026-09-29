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

- [ ] A-001 remove the obsolete Total Recall surface patch, its postinstall call and test; `npm ci` exits 0 on the mini
- [ ] A-002 suite green on the mini
- [ ] A-015 site public when generation is off (flag, `site-mode.mjs`)
- [ ] A-016 generation fully off: routes, redirects, splash/verify, build-time injection
- [ ] A-003 Gemini removed from active code (enrichment on OpenRouter, runtime key setter removed, `gen-*.mjs` deleted)
- [ ] Tests: `site-mode.mjs` unit tests and a spawn smoke test

## ⏳ Phase 2: Fix P2/P3 findings that touch this change

- [ ] A-014 `vault/visitors.md` untracked and ignored
- [ ] A-006 `/api/test/logout` gated
- [ ] A-007 `Secure` cookie
- [ ] A-008 `me@gregiteen.xyz` single source; literals removed
- [ ] A-009 stray root scripts deleted

## ⏳ Phase 3: JSN at /jobs

- [ ] `/api/jsn/*` proxy (admin only, token server side) with tests against a fake JSN
- [ ] `/jobs` page from `npm run sync-jobs`
- [ ] JSN token secret bound to both repos; JSN listening on the mesh address with the token

## ⏳ Phase 4: Copy and deploy

- [ ] A-010 home/about/contact/project copy drafted and approved by Greg
- [ ] Gates on the Mac mini; PM2 env set; deploy via the deploy skill

## ⏳ Phase 5: Testing and verification

- [ ] Logged-out walkthrough on gregiteen.xyz (public pages, `/generate.html`, `/jobs` redirect)
- [ ] Admin walkthrough (`/jobs` dashboard against live JSN)
- [ ] Every audit finding has a final disposition (`node .agent/skills/project-management/scripts/check-audit.mjs`)

## Deferred (from the audit)

- A-004 deploy hardening, A-005 web deploy hook, A-011 credentials to the secret store, A-012 split `serve.mjs`, A-017 stale worktree, A-018 Mailcow decision (D-3)

## Verification Log

- 2026-09-28: baseline on the Mac mini, `e2c8ed3` — `npm ci` failed at postinstall; tests 119 pass / 1 fail
