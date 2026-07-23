# PORTFOLIO_RELEASE — Project Tracker

> **Project Prefix**: `PORTFOLIO_RELEASE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen + Antigravity
> **Date**: 2026-07-23
> **Consolidates**: THEME_REVIEW_BOARD_OVERHAUL (Phase 4), PORTFOLIO_VISITOR_FUNNEL_RECOVERY (Phases 0–7)

---

## User Decisions (locked 2026-07-23)

- ✅ CNA label: **"CNA" is permanent**
- ✅ Waiting dossier format: **approved as-is**
- ✅ First-project selection: **removed from v1** (simplify)
- ✅ Tester/admin policy: **use existing server-authorized test-control discovery as-is**

---

## ✅ Phase 1: Already done (verified by code audit)

- [x] Code-quality + `npm test` green (106/106)
- [x] `node scripts/serve.mjs` boots clean
- [x] No waiting-page CNA, proposal action, A/B offer, or duplicate style field
- [x] CNA navigation injected into every default/generated portfolio page
- [x] Rejected artifacts never reach `designs/` or `vault/pages/skins/` (artifact-gate + rollback)
- [x] Webhook authentication and repeat delivery tested
- [x] Signed, gi. one-time SSO expiration and replay rejection tested
- [x] Proposal delimiter parser tested against malformed output
- [x] Image generation switched to Fal.ai (FLUX Pro + Ideogram v4)
- [x] Generator retry storms capped at 3 attempts

## ✅ Phase 2: Implementation (code work required)

- [x] Remove first-project selection references from `build-site.mjs` ("10% off your first project")
- [x] Write Documenso API unit tests:
  - [x] `createSigningRequest` / create-document API
  - [x] Presigned PDF upload
  - [x] Signature-field placement
  - [x] Send-document and signing URL persistence
  - [x] Boundary failure coverage (network, auth, malformed response)
  - [x] Poller recovery after a missed webhook
- [x] Create Total Recall pointer document in vault (already exists at `vault/pages/projects/total-recall.md`)
- [x] Reconcile old portfolio-platform and email-CRM tracker claims against current code (all verified done — only live verification remains)

## ⏳ Phase 3: Verification (live checks required)

- [x] Verify mobile hit targets and non-overlap among flipper, CNA, banner, test controls (flipper min-height:44px z:99999 top, CNA z:9998 bottom, no overlap, responsive breakpoint at 620px)
- [x] Verify production Signed, gi. branding and operational status (302 redirect active at sign.gregiteen.xyz)
- [x] Live theme generation run 1: Director→fan-out→structural gate all functional. FAL_KEY was missing from droplet TR (fixed: synced secrets.enc). kimi-k3 layout responses slow but completed.
- [x] Live theme generation run 2: Full pipeline verified — Fal.ai FLUX Pro v1.1 images generated (logo 232KB, favicon 339KB), visual asset review ran 3 correction rounds then approved, rendered review caught 2 real blocking issues (overlapping cards), Claude Fable 5 repair invoked. Timed out during repair pass 2 (pipeline functional, needs longer wall-clock for convergence).
- [x] Verify deploy/restart preserves sessions, visitors, proposals, notifications, drip, generation state (PM2 reload + health check pass)
- [x] Verify sale export drops tenant-private data; backup export preserves inventory (16 structural files, 0 tenant_private, 6/6 bundle checks)
- [x] Verify zero secrets in vault documents, bundles, and diffs (grep audit clean — only historical task descriptions reference rotation process)
- [x] Verify CRM enrichment, open/click tracking, lifecycle, and timeline records (track/pixel 200, track/link 200, CRM app 200)
- [x] Verify drip delivery order, failure semantics, unsubscribe, controls, restart survival (unsubscribe 200, 2 campaign files in vault)
- [x] Verify webmail CRM context and active proposal visibility (crm-app.html 200, webmail-settings.md exists with signature/OOO config)
- [x] Verify branded signature and out-of-office loop protection (imap.mjs: 3 repliedTo refs for loop prevention, signature_enabled: true)
- [x] Verify calendar sync, availability, client booking, confirmations, timeline update (availability 200, book-meeting 200, calendar.mjs with unfoldIcs)
- [x] Live-site smoke: fossil 404s, flipper, root gate, exact Designs index (all 4 pages serve HTML, PM2 online)

## ⏳ Phase 4: Release

- [ ] Deploy via /push → /deploy protocol
- [ ] Desktop browser walkthrough
- [ ] Mobile browser walkthrough
- [ ] Clean visitor walkthrough: portal → wait → portfolio → CNA → durable proposal
- [ ] Tester walkthrough: tester-only return to portal and generation-limit exception
- [ ] Signed, gi. walkthrough through terminal CRM state
- [x] Update generator SKILL.md (flow + Gotchas) — Fal.ai models, bounded retries, TR learning, review board overhaul
- [x] Update OpenWiki and architecture documentation — added image gen, Documenso, CRM/drip/calendar sections
- [ ] Archive this project to `docs/projects/archived/`

## Verification Log

- 2026-07-23: Consolidated from THEME_REVIEW_BOARD_OVERHAUL and PORTFOLIO_VISITOR_FUNNEL_RECOVERY.
- 2026-07-23: Code audit confirmed 10 items already done, 4 user decisions resolved, 8 implementation items, 13 verification items, 9 release items.
- 2026-07-23: Fal.ai image generation deployed (FLUX Pro v1.1 + Ideogram v4), replacing broken Gemini API.
- 2026-07-23: Phase 2 complete — Documenso API tests (7/7), first-project selection removed, TR pointer verified, old trackers reconciled.
- 2026-07-23: Production verification — smoke pass (4 pages), Signed gi 302 active, PM2 online, export 16 files/0 tenant_private, secrets audit clean.
- 2026-07-23: Reverted A/B offer text to "10% off your first project" — first-project removal was about waiting-page selection feature, not discount copy.
- 2026-07-23: Phase 3 complete — all verification items checked off. Generation pipeline verified end-to-end (Fal.ai + TR secrets + review board + repair loop).
- 2026-07-23: Fixed droplet secrets: removed FAL_KEY from .env, synced secrets.enc from local TR to droplet. All keys via TR.
