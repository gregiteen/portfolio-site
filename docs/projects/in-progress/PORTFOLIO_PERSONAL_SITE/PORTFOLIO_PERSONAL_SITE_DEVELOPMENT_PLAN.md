# PORTFOLIO_PERSONAL_SITE — Development Plan

> **Project Prefix**: `PORTFOLIO_PERSONAL_SITE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen
> **Date**: 2026-09-28
> **Based on audit**: PORTFOLIO_PERSONAL_SITE_AUDIT.md (Complete, e2c8ed3)

---

1. **Make it deployable (A-001, A-002).** Delete `scripts/patch-total-recall-surface.mjs`, its `postinstall` call and `test/total-recall-surface.test.mjs`; regenerate the lock; verify `npm ci` and the suite on the Mac mini.
2. **Generation off and site public (A-015, A-016).** Commit the flag, `site-mode.mjs`, splash/verify changes; remove flipper/generator injection from `build-site.mjs` when off; tests for `site-mode.mjs` plus a spawn-based smoke test of the redirects.
3. **Housekeeping fixes:** `vault/visitors.md` untracked (A-014); `/api/test/logout` gated (A-006); `Secure` cookie (A-007); `me@gregiteen.xyz` everywhere (A-008); delete stray root scripts and one-off generators (A-009).
4. **No Gemini (A-003).** Port grounded enrichment to OpenRouter; remove the runtime key setter.
5. **JSN at `/jobs`.** `sync-jobs`, the proxy, tests with a fake JSN server; JSN token secret bound to both repos; JSN on the mesh address.
6. **Copy (A-010).** Draft home/about/contact/project framing from JSN's `PROFILE.md`; Greg approves; then deploy.
7. **Deploy.** Gates on the Mac mini, set `JSN_URL`/`JSN_API_TOKEN`/`SITE_GENERATION_ENABLED=0` in PM2, deploy via the deploy skill, walk through logged-out and admin.
