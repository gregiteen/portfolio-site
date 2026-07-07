# Portfolio Site — Task Tracker

## P0: Fix Existing Bugs + Clean Slate ✅

- [x] Delete all AI-generated design files from `vault/pages/designs/`
- [x] Delete all AI-generated design directories from `designs/`
- [x] Create separate folder for generated theme skins (`vault/pages/skins/`)
- [x] Update `compile-theme.mjs` to write to `vault/pages/skins/` with `x_kind: 'theme-skin'`
- [x] Update `build-site.mjs` to exclude `x_kind: 'theme-skin'` from Designs index
- [x] Remove fake marketing block from `compile-theme.mjs`
- [x] Remove `{{GENERATOR_FORM}}` from designs_index layout
- [x] Skip `theme-skin` pages in build-site.mjs page compilation loop
- [x] Rebuild — 12 pages, Designs index shows only Nostalgia + HSFD ✓

## P1: Improve Generation Pipeline ✅

- [x] Generation on splash form submit (already implemented in `/api/send-code`)
- [x] Planning review gate — Pass 1b scores the plan, improves if below 8/10
- [x] Parallelize layout generation — Passes 2b/3/4 run via `Promise.all`
- [x] Strengthen Pass 5 holistic review — scoring, placeholder compliance, hardcoded text check

## P2: Continuous Improvement + Promotion ✅

- [x] Create `improve-theme.mjs` — scores, improves, validates, writes if better
- [x] Model rotation — cycles through flash/pro models deterministically
- [x] Daily cron in `serve.mjs` — runs on ALL designs at 3 AM, rebuilds if any improved
- [x] Create `promote-theme.mjs` — promotes mature skin to portfolio Designs index

## P3: CNA + Proposals + Visitor Enrichment ✅

- [x] Build CNA page (`static/consult.html`) — AI chat interface for needs assessment
- [x] `/api/cna` endpoint — Gemini-powered conversational assessment
- [x] Client enrichment — Gemini analyzes email domain, infers company/industry/size
- [x] Proposal generation — AI drafts full proposal (scope, timeline, pricing)
- [x] Email thread workflow — Greg gets proposal email, replies to iterate with AI
- [x] "Send it" trigger — formats and sends proposal to client, CC's Greg
- [x] `/api/proposal-reply` webhook — processes Greg's inbound replies
- [x] Visitor enrichment — screen size, timezone, language, referrer, platform, touch
- [x] Deferred notification — email held until visitor leaves (sendBeacon + 30min fallback)
- [x] CNA banners on all portfolio pages
- [x] Email timing logic — CNA data attached to deferred notification, one email total

## P4: User Experience + Admin ✅

- [x] Logout button — `/api/logout` clears cookie, fires deferred notification, redirects to splash
- [x] Logout link in nav bar (subtle monospace "↗ out")
- [x] Admin dashboard (`static/admin.html`)
  - [x] Dashboard view — stats, generator status, recent visitors
  - [x] Visitors view — full table with all enrichment data
  - [x] Themes view — list with scores, preview/promote/delete actions
  - [x] Proposals view — active proposals with client info, revisions, actions
  - [x] Settings view — API key, model selection, email config, cron hour
  - [x] Logs view — generator status, queue length, session counts
  - [x] Manual improvement trigger button
- [x] Admin auth — only MAIL_OWNER or ADMIN_EMAIL can access
- [x] Admin API — `/api/admin/*` endpoints for all data/actions
- [x] Exit beacon — `navigator.sendBeacon` on visibilitychange/pagehide

## P5: Session Memory + Intellectual Property ✅

- [x] Returning users auto-redirect — splash.html → / if already authenticated
- [x] Generation rate limit — 3 generations max per email, returns descriptive error
- [x] Generation count tracked in visitor profiles (persisted)
- [x] Removed `/api/design-spec` download endpoint — designs are proprietary
- [x] Removed floating design.md download button from all pages
- [x] Removed inline download link from design detail pages

## Scripts Reference

| Script | Purpose |
|---|---|
| `serve.mjs` | Dev server, auth, generation queue, CNA, proposals, admin API, cron |
| `build-site.mjs` | Vault → HTML build, theme layering, CNA banners, logout link |
| `compile-theme.mjs` | AI theme generation (5-pass pipeline with planning review) |
| `improve-theme.mjs` | Daily improvement cycle with model rotation |
| `promote-theme.mjs` | Promote mature skin to portfolio |
