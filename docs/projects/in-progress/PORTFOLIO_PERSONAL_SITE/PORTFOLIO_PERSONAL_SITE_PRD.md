# PORTFOLIO_PERSONAL_SITE — PRD

> **Project Prefix**: `PORTFOLIO_PERSONAL_SITE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen
> **Date**: 2026-09-28
> **Based on audit**: PORTFOLIO_PERSONAL_SITE_AUDIT.md (Complete, e2c8ed3)

---

## Decisions from Greg (2026-09-28)
gregiteen.xyz becomes a plain site about Greg; AI site/theme generation is disabled. The Job Search Navigator (JSN) dashboard frontend is built in this repo and served at `/jobs`, admin only. JSN's API, vault, CLI and workflows stay in the `job-search-navigator` repo. The job-search email address is `me@gregiteen.xyz`.

## Goals
1. **Deployable again** (A-001, A-002): a clean `npm ci`, green tests.
2. **Public personal site** (A-015, A-016): visitors reach the portfolio directly. No email wall, no generated skins, no generation waiting page. `SITE_GENERATION_ENABLED` (default off) gates every generation route, redirect and injected script, so it is reversible (D-2).
3. **A completely redesigned site about Greg's software projects** (D-5, A-020..A-023): high end, not templated, strong motion graphics, focused on his innovation; a section for **deployed sites** and one for **open-source projects**, both from verified vault documents; his LinkedIn linked on the About page. Greg reviews the result in the browser pane before it deploys.
4. **JSN at `/jobs`** behind admin login, using `/api/jsn/*`, a server-side proxy with a token; nothing from JSN's vault enters this repo or a deploy.
5. **Rules respected:** no Gemini in active code (A-003); one admin/mail identity, `me@gregiteen.xyz` (A-008); no PII in git (A-014).

## Non-goals
- Removing CNA, proposals, CRM, e-sign, drip or webmail code (D-1, D-3). Public entry points to them are removed or unlinked; they stay reachable to admin.
- Splitting `serve.mjs` (A-012), deploy hardening (A-004, A-005), moving env credentials into the secret store (A-011). Deferred.

## Acceptance
- Clean checkout: `npm ci` exits 0; `npm test` is green on the Mac mini.
- Logged out: `/` and `/about.html` return 200 with the portfolio; `/generate.html` redirects to `/`; `POST /generate-theme` is 410; `/generate-status` reports `disabled`; no page contains the flipper or generator script.
- Home shows the innovation story, the deployed sites and the open-source projects; About links `https://www.linkedin.com/in/gregiteen`; every listed site returned HTTP 200 when verified and every listed repo is public and Greg's own; motion is disabled under `prefers-reduced-motion`.
- Logged out: `/jobs` redirects to sign-in with `next=/jobs`; `/api/jsn/*` returns 403.
- Admin: `/jobs` renders the dashboard and its calls succeed against a running JSN; the proxy adds the token server side and forwards no cookies.
- `grep` finds no `GOOGLE_API_KEY` in active (non-archived) code paths; no `sales@gregiteen.xyz` literal remains.
