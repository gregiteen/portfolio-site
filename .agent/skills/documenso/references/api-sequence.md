# Documenso API call sequence and webhook event table

Source: `scripts/lib/documenso.mjs`, `scripts/lib/proposal-lifecycle.mjs`. Read these files directly for exact request/response shapes before making changes — this is a summary, not a substitute.

## `createSigningRequest()` — 4 sequential, unretried calls

1. `POST /api/v1/documents` — create the document, get back a presigned `uploadUrl`.
2. `PUT <uploadUrl>` — raw PDF bytes (the letterhead-rendered proposal from `buildLetterheadPdf`).
3. `POST /api/v1/documents/<id>/fields` — place the signature field using `SIGNATURE_FIELD` coordinates from `letterhead.mjs`.
4. `POST /api/v1/documents/<id>/send` — actually send it to the recipient.

If any of these 4 fail after step 1 has succeeded, the document exists on Documenso in an unsent/orphaned state. There's no automated cleanup — check the Documenso admin UI/API directly if you suspect this happened.

## Webhook event → proposal status mapping

`signingStatusForEvent()`:

| Documenso event | Proposal thread status |
|---|---|
| `DOCUMENT_COMPLETED` | `signed` |
| `DOCUMENT_REJECTED` | `client_rejected` |
| `DOCUMENT_SIGNED` | `partially_signed` |
| `DOCUMENT_RECIPIENT_COMPLETED` | `partially_signed` |

`applyDocumensoLifecycle()` applies this against `thread.signingDocumentId` and is idempotent — a repeated delivery of the same event is a no-op (checked via a `changed` flag), which matters because both the webhook route and the 5-minute poller (`startDocumensoPoller`) call the same function, so a webhook + a poller tick landing close together must not double-fire the terminal owner-notification email.

## Webhook auth

`verifyWebhookSecret()` does a `timingSafeEqual` constant-time comparison of the `X-Documenso-Secret` header against `DOCUMENSO_WEBHOOK_SECRET`. The same `verifyWebhookSecret` function is reused for the SSO consume endpoint's `Authorization: Bearer <DOCUMENSO_SSO_SECRET>` check — one constant-time-compare helper, two different secrets, two different call sites. If you're auditing auth on either endpoint, check both call sites use it correctly rather than assuming a fix to one covers the other.
