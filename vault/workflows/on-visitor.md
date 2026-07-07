---
type: workflow
title: On Visitor
description: What the server does when a visitor verifies their email — the vault-native description of the runtime pipeline in scripts/serve.mjs.
timestamp: 2026-07-06T20:00:00Z
name: On Visitor
---

# On Visitor

Runs when a visitor completes 2FA verification (`POST /api/verify-code`).

1. Issue a 30-day auth token (HttpOnly cookie) and persist the session to `.data/sessions.json` — returning visitors are auto-logged-in and skip the splash.
2. Upsert the visitor profile (style, first/last seen, visit count).
3. Append the visit to the visitors run log (`vault/visitors.md` — tenant_private, never exported).
4. Notify the owner by email (B&W visitor-alert template, from `sales@gregiteen.xyz`).
5. **First visit only:** send the personal welcome/marketing email (portrait, project highlights, reply-to-connect CTA).
6. Theme generation for the visitor's chosen style was already started (or queued — never dropped) at `POST /api/send-code` time; the verify page polls `/generate-status` until their edition is ready.
