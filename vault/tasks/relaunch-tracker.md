---
type: task
title: Portfolio Relaunch — Detailed Tracker
description: Live checklist for the relaunch plan. Update statuses in place as work lands.
timestamp: 2026-07-06T19:00:00Z
priority: high
category: relaunch
status: pending
---

# Relaunch Tracker

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked/needs Greg

## P0 — Email + domain infrastructure

- [x] P0.0 Registered `gregiteen.xyz` via Vercel registrar API ($1.99/yr, auto-renew, order completed 2026-07-06) — Greg approved
- [x] P0.1 `gregiteen.xyz` already a Mailcow domain (verified via API 2026-07-06)
- [x] P0.2 Mailbox `sales@gregiteen.xyz` already exists, active (password unknown — reset if IMAP access needed)
- [x] P0.3 Mailcow DKIM key fetched (selector `dkim`, rsa-2048)
- [x] P0.4 Vercel DNS: MX → mail.ultrachat.app (10) created
- [x] P0.5 Vercel DNS: SPF TXT created (`v=spf1 mx a include:spf.smtp2go.com -all`)
- [x] P0.6 Vercel DNS: DMARC `p=none` created (tighten to quarantine/reject later)
- [x] P0.7 Vercel DNS: Mailcow DKIM TXT created (+ autoconfig/autodiscover CNAMEs)
- [x] P0.8 SMTP2GO sender domain VERIFIED (dkim + return-path true, 2026-07-06)
- [x] P0.9 Created dedicated SMTP2GO user `portfolio.gregiteen.xyz` (burned `ultrachat.app` cred no longer used here — flag: rotate it separately, ultrachat/festech may depend on it)
- [x] P0.10 serve.mjs env-only secrets (SMTP_*, MAIL_FROM, MAIL_OWNER, SITE_URL); fails loud if missing; fixed MAIL_FROM quoting bug
- [x] P0.11 .env.example committed; local + droplet .env installed (chmod 600)
- [x] P0.12 Live E2E verified: 2FA, confirmation, and owner-alert all `delivered` to gregiteen@gmail.com from sales@gregiteen.xyz (SMTP2GO activity log); inbound MX test received in sales@ INBOX via Mailcow
- [x] P0.13 Deployed to ultrachat droplet: /opt/portfolio-site, pm2 `portfolio`, nginx reverse proxy, HTTPS live (certbot, auto-redirect), www CNAME added
- [x] P0.14 OpenWiki — Greg says skip for now

## P1 — B&W agency splash + verify

- [x] P1.1 B&W treatment: grayscale/contrast filter over gen-hero.jpg + SVG film-grain overlay
- [x] P1.2 splash.html rebuilt — Archivo Black display, outline type, full-bleed B&W photo, verified in preview
- [x] P1.3 verify.html rebuilt in same system, verified in preview
- [ ] P1.4 Monochrome logo/favicon treatment
- [x] P1.5 Cookie bar + error states restyled (mono, black/white)
- [ ] P1.6 Mobile pass (375px) + desktop pass (1280px+)

## P2 — Email suite (matches UI exactly)

- [x] P2.1 emailShell() shared B&W template in serve.mjs
- [x] P2.2 2FA email restyled, sent from sales@gregiteen.xyz — delivered
- [x] P2.3 Confirmation email live (personal voice, projects, reply CTA) — first-visit-only trigger; delivered
- [x] P2.4 Per-style portrait generation live (image-to-image, likeness-guarded hybrid prompt); contact page shows /assets/gen-portrait.jpg, email uses noir default
- [x] P2.5 Portrait live at https://gregiteen.xyz/assets/greg-portrait.jpg + gen-portrait.jpg (200 OK)
- [x] P2.6 Owner-notification restyled on emailShell — delivered
- [ ] P2.7 Deliverability check: Gmail + one other client, light/dark, SPF/DKIM/DMARC aligned

## P3 — Visitor memory + workflows

- [x] P3.1 .data/sessions.json (atomic writes, gitignored); visitors.md stays the human log
- [x] P3.2 30-day tokens persisted + restored on boot — auto-login survives restarts
- [~] P3.3 Visitor profiles track style/visits; confirmation email is first-visit-only. Richer welcome-back UI still open
- [x] P3.4 vault/workflows/on-visitor.md created (SSSS-conformant, tests green)
- [ ] P3.5 Wire serve.mjs steps to the workflow doc so the vault describes what the server does

## P4 — 3D design transitions

- [x] P4.1 @view-transition cross-page fade w/ perspective + reduced-motion fallback (all built pages)
- [x] P4.2 Theme-pill switches wrapped in startViewTransition with 3D rotateX/blur morph
- [ ] P4.3 Designs gallery: animated switching between generated designs
- [ ] P4.4 Performance check: 60fps on mid hardware, no CLS on load

## P5 — Analyze & improve gates

- [ ] P5.A Gate A (pre-submit): `npm test` green, full build clean, code review pass, design review vs. brief, fix all findings
- [ ] P5.B Gate B (post-deploy): silent refresh via headless preview; console/network/render audit; fix; re-audit until clean (≥2 passes)
- [ ] P5.C Final sweep: broken links, email links, favicon, meta/OG tags, 404s

### New items discovered during execution

- [x] N1 Portrait pipeline live: source saved (greg-portrait-source.png), noir-styled default for email/contact, per-theme restyle via Nano Banana 2 Lite image-to-image (prompt A/B-tested 6 ways, hybrid won), regenerates on every generation, verified in prod
- [x] N2 RESOLVED: generator uses Gemini API directly (CLI only as fallback) — full theme generation verified working in prod (38s E2E, 'Chrome Sovereign' test)
- [ ] N3 Rotate the burned `ultrachat.app` SMTP2GO password (committed to this repo's git history) — check ultrachat/festech prod usage first
- [ ] N4 Tighten DMARC p=none → quarantine/reject after a week of clean reports
- [ ] N5 Generation queue is FIFO global — per-visitor status tracking would let concurrent visitors see their own progress

## Done log

- [x] 2026-07-06 Domain checked: registered/ACTIVE on Vercel DNS, zero records present
- [x] 2026-07-06 SSH to Mailcow droplet verified; SMTP2GO + Vercel API creds located
- [x] 2026-07-06 Found hardcoded SMTP creds in serve.mjs (rotation required — P0.9)
- [x] 2026-07-06 Plan + tracker created as SSSS task docs
