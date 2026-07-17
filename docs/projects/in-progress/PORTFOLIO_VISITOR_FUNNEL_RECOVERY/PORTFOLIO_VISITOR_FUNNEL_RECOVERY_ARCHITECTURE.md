# PORTFOLIO_VISITOR_FUNNEL_RECOVERY — Architecture

> **Project Prefix**: `PORTFOLIO_VISITOR_FUNNEL_RECOVERY`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen / Codex
> **Date**: 2026-07-16

---

## 1. System flow

```text
splash / verify
  └─ one style prompt
       └─ generation waiting page
            ├─ real build/review/retry status
            ├─ vault-authored Meet Greg dossier
            └─ optional first-project selection
                 └─ approved generated portfolio
                      ├─ permanent CNA navigation
                      ├─ A/B offer after engagement
                      └─ test-only return-to-portal control
                           └─ consult.html
                                ├─ structured intake
                                ├─ durable conversation draft
                                └─ idempotent proposal request
                                     └─ Greg review/approval
                                          └─ Signed, gi. PDF
                                               └─ Documenso signature
                                                    └─ SSSS + CRM terminal state
```

## 2. Page responsibilities

| Surface | Owns | Must not own |
| --- | --- | --- |
| `splash.html` / `verify.html` | visitor entry, verification, initial style | CNA, proposal submission |
| `generate.html` | generation status, editorial waiting experience, first-stop preference | CNA chat, duplicate style prompt, offer banner |
| generated/default portfolio pages | work presentation, navigation, CNA discovery, A/B offers | password reset, proposal generation |
| `consult.html` | intake, CNA conversation, summary, proposal request | theme generation |
| custom webmail CRM | owner review, proposal decisions, Signed, gi. operations | visitor authentication UX |
| `reset.html` | administrator mailbox recovery only | visitor account recovery |

## 3. Content ownership

- Waiting editorial copy is a structural SSSS page document under `vault/pages/`.
- Existing `home.md` and `about.md` are source material, not permission to invent missing personal facts.
- `build-site.mjs` reads the waiting document and produces the waiting-page payload or HTML fragment.
- Project choices are derived from canonical project page metadata so removed/renamed projects cannot leave dead routes.

## 4. Runtime state

| State | Canonical location | Notes |
| --- | --- | --- |
| Visitor and CNA draft | `vault/runtime/visitors/*.md` | tenant-private; cached in `visitorProfiles` |
| Proposal lifecycle | `vault/runtime/proposals/*.md` | tenant-private; includes request ID, generation state, signing fields |
| Generation attempts | `vault/runtime/runs/*.md` | append-only attempt events under a stable run ID |
| A/B offer configuration | `vault/runtime/config/banner-offers.md` | structural offer variants |
| A/B events | `vault/runtime/events/banner-events.md` | append-only impression/click envelopes |
| Session token | `.data/sessions.json` | existing sanctioned token store; no business record |

Every persistent mutation flows through `scripts/runtime-store.mjs` and the `@ssss/cli/engine` Operation Contract.

## 5. Generation reliability

```text
requestGeneration
  -> stable run ID
  -> compile-theme child
       -> unique staging directory
       -> structural review
       -> asset audit
       -> render screenshots
       -> rendered review
       -> rejected: clean staging + backoff + retry whole attempt
       -> approved: atomic promotion
  -> child crash/non-zero exit: server backoff + restart same run
  -> done: rebuild + notification + queue drain
```

The UI sees `running/retrying/done`; a review rejection is not a terminal visitor-facing error.

## 6. Navigation and test controls

- Permanent CNA navigation is mechanically injected, so generated layouts cannot omit it.
- A/B banner is a separate secondary component and retains its sticky variant cookie.
- The return-to-portal control is injected only after a server-confirmed tester/admin identity check.
- A query parameter alone can never enable test controls.
- The tester-only return control confirms then uses `POST /api/test/logout`, followed by an explicit redirect to `splash.html`.
- Test controls occupy a dedicated region and never overlay flipper/CNA hit targets.

## 7. CNA and proposal durability

### CNA state

- `GET /api/cna-state` returns only the authenticated visitor's draft.
- `POST /api/cna` normalizes bounded history, obtains a model response, and upserts the resulting history/assessment.
- Local browser persistence is a resilience cache, never the sole source of truth.

### Proposal acceptance

```text
POST /api/cna-proposal
  -> validate authenticated/intake email
  -> normalize history and assessment
  -> derive deterministic proposal ID from request ID + email
  -> existing ID: return existing status
  -> write draft/generating proposal through Operation Contract
  -> return 202 + proposal reference
  -> enrich + generate in background
  -> pending_approval or retry_pending
```

The server must never return `success: true` before the durable write.

## 8. Signed, gi. / Documenso boundary

### Outbound

1. `sendProposalToClient()` renders the final letterhead PDF.
2. `createSigningRequest()` creates the Documenso document and recipient.
3. The PDF uploads to the presigned S3/MinIO location.
4. The signature field is placed using `SIGNATURE_FIELD` coordinates.
5. The document is sent and `signingUrl`/`signingDocumentId` persist on the proposal.
6. Client receives the interactive proposal URL and Signed, gi. handoff URL.

### Inbound lifecycle

- Primary signal: authenticated Documenso webhook.
- Recovery signal: periodic status poller.
- Both map external status into one internal transition function.
- Allowed internal states must include `sent`, `partially_signed`, `signed`, and `client_rejected` or explicitly keep partial status in `signingStatus` while proposal `status` uses a documented lifecycle enum.
- Terminal mutations persist through `upsertProposal()` before notifications fire.
- Repeated webhook/poller observations are idempotent.

### Signed, gi. SSO

- Webmail session is the user identity boundary.
- Server issues a short-lived, one-time handoff code.
- Documenso consumes it server-to-server using a shared secret.
- Browser never receives a Documenso password or long-lived API credential.

## 9. Administrator password recovery

- Route and UI are explicitly branded as administrator webmail recovery.
- Password validation occurs before any external mutation.
- Mailcow config is read from the installed service configuration.
- `execFile` argument arrays invoke Docker Compose, Dovecot, and MySQL without shell interpolation.
- The Mailcow update is the commit boundary; local IMAP/session refresh failures become repairable warnings rather than a false reset failure.

## 10. Error and recovery policy

| Failure | Required behavior |
| --- | --- |
| Theme review rejection | Retry whole staged attempt; never publish |
| Generator child crash | Retry same run ID; preserve queue order |
| Browser refresh during wait | Resume job and waiting preferences |
| CNA model error | Preserve prior draft; allow retry |
| Proposal generation error | Keep durable proposal in `retry_pending` |
| Documenso create/send error | Mark signing unavailable/error; notify Greg; never claim e-sign delivery |
| Webhook loss | Poller converges state |
| Poller loss | Webhook remains primary; restart resumes hydrated pending proposals |
| SSSS terminal-state rejection | Release blocker; do not notify success |

## 11. Security boundaries

- Visitor identity comes from `gi_auth`; arbitrary email input cannot read another visitor's CNA state.
- Admin/test identity comes from server configuration, never client flags.
- Admin password reset, webhook, SSO consumption, and CRM routes remain separate trust boundaries.
- Webhook/SSO secrets are compared or authenticated server-side and never returned.
- Proposal/signing IDs are unguessable and contain no client PII.

## 12. Verification topology

1. Pure unit tests for normalization, idempotency, retry timing, status mapping, and SSO expiry.
2. Runtime-store tests proving every proposal status round-trips through SSSS.
3. Route tests proving access control and no false success.
4. Browser tests for page sequencing, control visibility, A/B reveal, BFCache, and responsive hit targets.
5. Production-safe rehearsal using disposable visitor/proposal/signature records.

## 13. Consolidated operational subsystems

### CRM and marketing

- `visitor_profile` carries lifecycle, timeline, enrichment, drip, pending
  notification, and CNA draft state.
- Structural campaigns live under `vault/campaigns/`; per-visitor delivery
  state remains tenant-private.
- Tracking and unsubscribe mutations append or upsert through the runtime
  store and must survive process restart without duplicate delivery.

### Webmail operations

- The custom webmail CRM is the owner cockpit for correspondence, visitor
  context, proposals, signing operations, signature settings, out-of-office,
  and calendar visibility.
- IMAP is an external projection; SSSS documents remain the canonical CRM,
  settings, proposal, and calendar records.
- Booking creates a tenant-private calendar event and updates the visitor
  timeline before confirmations are considered complete.

### Total Recall bridge

- Portfolio is the authority for live visitor/proposal runtime records.
- Total Recall pulls validated backup bundles and sends proposal decisions
  through the authenticated portfolio admin API.
- Sale exports must retain structural campaigns/content and drop all
  tenant-private visitor, proposal, calendar, and event records.
- Sync is idempotent and must preserve correct success and bad-token status.
