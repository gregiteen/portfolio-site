---
type: task
title: Portfolio Relaunch — Master Plan
description: B&W agency splash redesign, sales@gregiteen.xyz email stack, secrets hygiene, visitor workflows, returning-visitor auto-login, 3D design transitions, and dual analyze-improve gates.
timestamp: 2026-07-06T19:00:00Z
priority: high
category: relaunch
status: pending
---

# Portfolio Relaunch — Master Plan

Companion tracker: `relaunch-tracker.md` (same folder). Both are `tenant_private` (§5.5) — never exported in `template`/`sale` bundles.

## Current state (verified 2026-07-06)

- **Domain** `gregiteen.xyz`: registered & ACTIVE, DNS hosted on **Vercel**, but **zero records exist** (no A, MX, SPF, DKIM). Fresh domain — nothing propagated yet.
- **Mailcow** droplet `138.197.199.217` (`mail.ultrachat.app`): SSH root access confirmed, mailcow.conf at `/opt/mailcow-dockerized`. `gregiteen.xyz` is **not** yet a Mailcow domain; `sales@gregiteen.xyz` does not exist.
- **SMTP2GO**: working account (`ultrachat.app` sender), API keys available in `~/Github/ultrachat-ai-powered/.env*`. `gregiteen.xyz` not yet a verified sender domain.
- **Secrets**: SMTP password is **hardcoded in `scripts/serve.mjs` and committed to git** — must be rotated and moved to env. No `.env` exists in this repo.
- **Splash**: navy/violet glassmorphism — being replaced with B&W agency design.
- **Emails**: 2FA email exists (navy/violet, sent from `greg@ultrachat.app`); no visitor confirmation/marketing email exists; owner notify exists.
- **Sessions**: auth tokens in-memory only — all sessions die on server restart; no returning-visitor recognition.
- **OpenWiki**: mentioned by Greg; integration scope not yet defined — open question in tracker.

## Design direction (the brief)

Big, loud, clear, simple, intelligent, tasteful, high-end **agency black & white**. Abstract B&W photography as the visual backbone. Massive typography, extreme contrast, generous whitespace, no gradients/neon/glass. Splash, verify page, confirmation page, and **all emails share this one design system** — the 2FA email must look like the UI it came from.

## Phases

- **P0 — Email + domain infrastructure**: Mailcow domain + `sales@` mailbox, Vercel DNS (MX/SPF/DKIM/DMARC + SMTP2GO sender verification), secrets → env, rotate leaked SMTP password.
- **P1 — B&W splash + verify redesign**: new `static/splash.html` + `static/verify.html`, B&W abstract photography assets, matching favicon/logo treatment.
- **P2 — Email suite**: 2FA email restyled to match UI; new personal marketing confirmation email from `sales@gregiteen.xyz` with Greg's picture (style-customized per visitor's chosen design), project marketing (SSSS, Total Recall, UltraChat, Festech).
- **P3 — Visitor memory + workflows**: persist sessions/visitor profiles to vault, auto-login returning visitors, welcome-back state reusing their generated theme, on-visit workflow document.
- **P4 — 3D design transitions**: perspective/3D cross-fade between generated designs (View Transition API + preserve-3d layer), page-level motion.
- **P5 — Analyze & improve gates**: Gate A before first "done" (tests + build + code/design review); Gate B after deploy (silent refresh, console/network/render audit, fix, re-audit — minimum 2 passes).

## Decisions

1. Receiving: Mailcow (`mail.ultrachat.app` MX). Sending: SMTP2GO with `gregiteen.xyz` as verified sender domain — matches the proven festech.live/ultrachat pattern.
2. All secrets via `process.env` (loaded from server-side `.env`, gitignored). The committed SMTP2GO password gets rotated — it is burned.
3. Tracker lives in this vault as SSSS `task` docs; decisions and infra facts mirrored to Total Recall.
