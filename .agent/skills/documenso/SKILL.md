---
name: documenso
description: "Use this skill when working on the e-signature flow (proposal signing, the \"Signed, gi.\" / SignedGI branded sign pages, Documenso webhooks, the admin SSO handoff into the Documenso workspace, or the rate-card PDF). Covers scripts/lib/documenso.mjs, documenso-sso.mjs, letterhead.mjs, and the related routes in scripts/serve.mjs. MANDATORY: read the full SKILL.md before executing."
---

# Documenso / "Signed, gi." E-Sign

This repo integrates a **self-hosted Documenso** instance (branded client-facing as "Signed, gi.") for proposal e-signatures. Self-hosted Documenso requires S3-compatible storage — this deployment runs its own MinIO on the droplet's private VPC IP (not publicly exposed). DocuSeal was evaluated and rejected because its self-hosted API is paywalled (see `docs/projects/archived/portfolio-platform/PORTFOLIO_PLATFORM_ARCHITECTURE.md:388`).

## File map

| File | Purpose |
|---|---|
| `scripts/lib/documenso.mjs` | Documenso REST API client: creates signing requests, checks doc status, verifies webhook secret (`timingSafeEqual`), runs a 5-min status poller as a safety net for missed webhooks |
| `scripts/lib/documenso-sso.mjs` | In-memory, single-use, 60s-TTL SSO handoff code store (create/consume/prune) — pure logic, no Documenso API calls |
| `scripts/lib/proposal-lifecycle.mjs` | `applyDocumensoLifecycle()` maps a Documenso signing event to a proposal thread status transition (idempotent — repeated webhook deliveries are a no-op) |
| `scripts/lib/letterhead.mjs` | Renders the branded PDF (pdfkit); exports `SIGNATURE_FIELD` (fixed x/y/w/h) — **coordinate-coupled** to where the signature line is drawn, see Gotchas |
| `scripts/generate-rate-card-pdf.mjs` | `npm run rate-card:pdf` — parses `vault/runtime/config/rate-card.md` (sole source of truth for figures) into `static/rate-card.pdf`, reusing the letterhead header |
| `scripts/serve.mjs` | Wires everything: send path, `/sign/<id>` page, webhook route, SSO routes, admin CRM route |
| `static/crm-app.html` | Admin "Signed, gi. Operations" panel — "Open signing workspace" button + documents table |
| `test/documenso-sso.test.mjs` | Covers `documenso-sso.mjs` in-memory logic only (see Testing below) |

## Env vars

Run `node .agent/skills/documenso/scripts/check-documenso-env.mjs` to see what's actually configured (values withheld). As of the last check, **none of these are set** in this repo's `.env` — the app runs in plain-PDF-attachment fallback, not real e-signing, until they are:

- `DOCUMENSO_BASE_URL` — self-hosted instance URL (e.g. `https://sign.gregiteen.xyz`)
- `DOCUMENSO_API_KEY` — Bearer token
- `DOCUMENSO_WEBHOOK_SECRET` — shared secret, compared against Documenso's `X-Documenso-Secret` header
- `DOCUMENSO_SSO_SECRET` — Bearer auth for the SSO consume endpoint
- `DOCUMENSO_SSO_EMAIL` — SSO target identity (falls back to `IMAP_USER` if unset)

## Flows

**A. Proposal send + signing:**
1. `sendProposalToClient()` (`serve.mjs`) renders the proposal via `buildLetterheadPdf`.
2. `createSigningRequest()` makes 4 sequential, **unretried** Documenso API calls: create document (+ presigned upload URL) → `PUT` the PDF bytes → place the signature field at `SIGNATURE_FIELD` coords → send. If `DOCUMENSO_BASE_URL`/`DOCUMENSO_API_KEY` are unset, this returns `null` and the send falls back to a plain PDF attachment — errors here never block the email send.
3. The client-facing link is `/sign/<id>` on gregiteen.xyz, not the raw Documenso URL — Documenso's self-hosted CSP (`frame-ancestors 'self'`) blocks iframe embedding, so the branded page top-level-navigates out to the real `signingUrl`.
4. Documenso fires `POST /api/documenso-webhook` on status changes, authenticated via `X-Documenso-Secret` (constant-time compared). Event→status mapping: `DOCUMENT_COMPLETED`→`signed`, `DOCUMENT_REJECTED`→`client_rejected`, `DOCUMENT_SIGNED`/`DOCUMENT_RECIPIENT_COMPLETED`→`partially_signed`. Matched to a proposal thread by `thread.signingDocumentId`.
5. `startDocumensoPoller()` polls every 5 min as a safety net in case a webhook is missed, applying the same lifecycle function.

**B. Admin "Open signing workspace" SSO** (server-to-server, no password crosses the browser):
1. Admin clicks the button in `crm-app.html` → `GET /api/admin/documenso/sso`, gated by `isAdmin(req)`.
2. Handler mints a 32-byte base64url single-use code (60s TTL) via `createDocumensoSsoHandoff`, stored in a module-level in-memory `Map` — **lost on server restart, won't work if ever horizontally scaled**.
3. `303` redirect to `${DOCUMENSO_BASE_URL}/api/auth/signedgi-sso?code=<code>` — **that endpoint lives on the Documenso side, not in this repo** (a custom fork/plugin; zero other references to `signedgi-sso` exist in this codebase, so its behavior is unverifiable from here).
4. Documenso is expected to call back `POST /api/documenso/sso/consume` with `Authorization: Bearer <DOCUMENSO_SSO_SECRET>` and `{code}`. The handler deletes the entry **before** validating (so a malformed/expired code stays single-use), returns `{email}` or `410`.
5. What Documenso does with that email afterward is outside this repo — cannot be verified here.

**C. Rate-card PDF:** `npm run rate-card:pdf` regenerates `static/rate-card.pdf` from `vault/runtime/config/rate-card.md`. Served with `Content-Type: application/pdf` (explicitly public — it's linked from outbound proposal emails).

## Testing

`test/documenso-sso.test.mjs` only covers the in-memory handoff store (normalization, single-use, expiry, pruning). **Not covered by any test in this repo:** the HTTP routes, the real Documenso API client calls, webhook signature verification end-to-end, or the Documenso-side SSO handshake. If you change `documenso.mjs`'s request sequence or the webhook route, there's no regression net beyond manual verification — say so explicitly rather than implying test coverage that doesn't exist.

## Gotchas

- `DOCUMENSO_SSO_EMAIL` silently aliases to `IMAP_USER` if unset — two unrelated-sounding env vars conditionally linked. Don't assume unsetting one has no effect on the other flow.
- SSO handoffs and the API client's implicit state are all in-memory — a server restart (every deploy restarts PM2) invalidates any in-flight handoff code. This is expected, not a bug, but worth knowing when debugging a "handoff failed" report that coincides with a deploy.
- `createSigningRequest`'s 4-call sequence has no retry and no cleanup — a failure between "document created" and "sent" can leave an orphaned, unsent Documenso document. There's no automated reconciliation for this; if you're debugging a "duplicate document" or "stuck in draft" report, check for orphans manually via the Documenso API/UI.
- `SIGNATURE_FIELD` in `letterhead.mjs` is hardcoded coordinates. If you change the letterhead PDF layout, you must update `SIGNATURE_FIELD` to match, or the signature box will land off the signature line — there's no automated check tying these together.
- The Documenso-side `/api/auth/signedgi-sso` endpoint is a hard external dependency this repo cannot verify. If SSO breaks, first confirm whether the problem is on this side (check webhook/SSO env vars, check `serve.mjs` logs) before assuming the Documenso fork changed behavior.

## Reference

- [references/api-sequence.md](./references/api-sequence.md) — the exact Documenso REST call sequence and webhook event table.
