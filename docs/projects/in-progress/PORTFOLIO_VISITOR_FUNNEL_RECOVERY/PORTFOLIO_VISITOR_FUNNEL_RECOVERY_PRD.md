# PORTFOLIO_VISITOR_FUNNEL_RECOVERY — Product Requirements Document

> **Project Prefix**: `PORTFOLIO_VISITOR_FUNNEL_RECOVERY`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen / Codex
> **Date**: 2026-07-16

---

## 1. Outcome

Restore the portfolio's intended visitor journey as a reliable, testable funnel:

`one style choice → engaging generation wait → view Greg's work → discover CNA → consultation → durable proposal → Signed, gi. contract → terminal CRM state`

The portfolio is the product demonstration. The waiting experience may build interest, but it must not conduct the CNA or send visitors into the proposal workflow before they have viewed the work.

## 2. Incident and product problems

The 2026-07-16 production rehearsal exposed connected failures:

- A rejected Tron design was published despite failing structural, asset, and rendered review.
- The generated design contained a fixed logout overlay that caused an unintended `/api/logout` request.
- The generation waiting page ran a CNA-like chat even though it was intended only as an engagement device.
- That waiting-page chat was ephemeral and did not become a proposal request.
- The actual CNA page existed at `/consult.html`, but its only portfolio banner waited 25 seconds and had no scroll trigger, making the page effectively undiscoverable for many visitors.
- The proposal endpoint acknowledged success before creating a durable proposal record.
- The administrator-only webmail password reset returned HTTP 500 after partially changing the mailbox password.
- The Signed, gi./Documenso code path exists, but current automated tests do not prove the complete proposal-to-signature lifecycle.
- `runtime-store.mjs` currently rejects `signed` and `client_rejected`, although the Documenso webhook and poller attempt to persist those statuses. Terminal signature events therefore cannot be considered durably working.

## 3. Product principles

1. **Portfolio first.** Visitors view real work before entering the consultation/proposal funnel.
2. **One style decision.** The design style is entered exactly once.
3. **Waiting is editorial, not sales intake.** No CNA chat, proposal action, or duplicate style field appears while generation runs.
4. **Discoverable, not coercive.** The CNA always has a clear portfolio navigation entry; A/B offers are secondary conversion prompts.
5. **No false success.** A proposal request is accepted only after its SSSS record exists.
6. **No fail-open publishing.** A rejected design remains in staging and retries; it never becomes public.
7. **Test controls are not visitor controls.** Test-only logout and limit exceptions are visible only to configured tester/admin identities.
8. **SSSS owns durable state.** Visitor, proposal, generation, banner, and signature lifecycle state is persisted through the SSSS Operation Contract.

## 4. Visitor journey

### 4.1 Portal and style selection

- Visitor enters through the existing portal and email verification flow.
- Visitor provides one design-style prompt.
- Generation starts.
- After submission, the style form disappears and cannot be mistaken for a second prompt.

### 4.2 Waiting experience

- Show real generation phase, elapsed time, review/retry state, and completion expectation.
- Show a vault-authored “Meet Greg” editorial dossier:
  - Background
  - Design approach
  - Development depth
  - Personal perspective
- Show an optional “Choose your first stop” control using actual portfolio projects.
- Do not show CNA chat, proposal actions, project-intake fields, or an A/B offer banner.
- If generation retries, the page remains active and explains that the review gate requested another attempt.

### 4.3 Portfolio reveal and browsing

- Reveal the approved generated edition.
- Open either the portfolio home or the visitor's selected first project.
- Preserve normal navigation among all real project pages.
- Show a permanent, non-overlapping CNA navigation item. Final copy is an approval decision; candidates are “Work with Greg,” “Start a project,” and “Get a proposal.”

### 4.4 A/B offer banner

- Keep the existing SSSS-backed offer variants and sticky assignment.
- Reveal after meaningful portfolio engagement: eight seconds or 30% scroll, whichever happens first.
- Preserve assignment across portfolio page transitions.
- Record impression and click events through the existing append-only banner event contract.
- Do not make the offer banner the only route to the CNA.

### 4.5 CNA and proposal

- `/consult.html` remains a separate, deliberate page.
- Structured intake precedes the consultative conversation.
- Consultation state survives refresh and navigation for the authenticated visitor.
- Proposal submission is idempotent.
- The server writes a `proposal` document with `draft/generating` state before returning acceptance.
- The visitor receives a proposal reference and truthful status.
- Generation failures remain durable and retryable; they do not erase the request.

### 4.6 Signed, gi. contract workflow

The release-gated workflow is:

1. Greg reviews and approves the proposal.
2. The system renders the final Signed, gi. letterhead PDF.
3. The system creates a Documenso document, uploads the PDF, positions the signature field, and sends it.
4. The client receives the branded proposal page and `/sign/<proposalId>` handoff.
5. Documenso webhook and poller reconcile signing status.
6. The SSSS proposal transitions to a valid terminal state.
7. CRM/visitor state and owner notifications reflect the same terminal result.

Plain-PDF fallback must be explicit to Greg; it must never be presented as a completed signature workflow.

## 5. Functional requirements

### FR-1 — Waiting-page editorial content

- Content is structural vault content, not hard-coded promotional copy in `static/generate.html`.
- Content must be approved before release.
- The waiting page must remain usable on mobile and at 200% zoom.

### FR-2 — Portfolio tour selection

- Choices correspond to real project routes.
- Selection affects only the first revealed page, not the generated style.
- A missing project route falls back to the portfolio home.

### FR-3 — CNA discovery

- Every generated and default portfolio page has a visible CNA navigation entry.
- The entry never overlaps flipper controls, test controls, or page content.
- A/B offers continue to load from `vault/runtime/config/banner-offers.md`.

### FR-4 — Test-only return to portal

- Test control uses the same configured tester/admin identity policy as the generation-limit exception.
- Its interactive control element is absent from ordinary visitor DOM and accessibility trees.
- It is clearly labeled “Return to portal — test control.”
- It requires confirmation and performs a state-changing `POST /api/test/logout`.

### FR-5 — Generation release gate

- Structural, asset, and rendered review failures prevent publication.
- Whole-generation retries use bounded exponential backoff but do not stop after an arbitrary attempt count.
- Process crashes are retried by the server in addition to model-level review retries.
- Staging is cleaned between attempts.
- Only an approved staged build is atomically promoted.

### FR-6 — Proposal durability

- Request ID produces an idempotent proposal ID for a client email.
- Repeat network submissions return the original proposal reference.
- Accepted response requires a successful SSSS write.
- Proposal generation and email failures persist a retry state and error summary.

### FR-7 — Admin-only webmail reset

- Password reset is explicitly an administrator webmail operation, never part of visitor authentication.
- Mailcow commands use argument arrays and configured credentials; no shell interpolation or hard-coded database password.
- A mailbox password change cannot return false failure after the remote update succeeds.
- Current IMAP/webmail sessions refresh without a broad PM2 reload.

### FR-8 — Documenso/Signed, gi. conformance

- `proposal` status validation includes the terminal states used by webhook and poller code.
- Webhook secret validation remains mandatory and constant-time.
- Webhook and poller updates are idempotent and converge on the same SSSS record.
- Letterhead PDF signature coordinates are regression-tested.
- SSO handoffs remain one-time, expiring, and server-to-server authenticated.
- The full live flow is rehearsed with a disposable proposal and signer address before release.

## 6. Non-functional requirements

- No visitor or proposal data is written outside the SSSS runtime documents and sanctioned token/session store.
- No secrets, reset tokens, signing tokens, or passwords appear in logs or test fixtures.
- Page controls meet keyboard, focus, contrast, and mobile hit-target requirements.
- BFCache restoration and skipped view transitions produce no unhandled promise rejection.
- Live runtime checks must not send a real customer proposal or mutate a real customer record.

## 7. Current Documenso evidence classification

| Capability | Current evidence | Classification |
| --- | --- | --- |
| Create/upload/field/send client | Reachable implementation in `scripts/lib/documenso.mjs` | Implemented |
| Signed, gi. letterhead PDF | `scripts/lib/letterhead.mjs` and shared send path | Implemented |
| Branded signing handoff | `/sign/<proposalId>` route in `scripts/serve.mjs` | Implemented |
| Webhook secret and event mapping | Focused automated test in `test/drip-and-proposal.test.mjs` | Partially tested |
| One-time Signed, gi. SSO | Focused tests in `test/documenso-sso.test.mjs` | Implemented locally; current production verification pending |
| Poller/webhook terminal persistence | Code attempts `signed/client_rejected`, but runtime status allowlist rejects them | Broken until fixed |
| Historical live signing rehearsal | Tracker records a real API/signing-page test on 2026-07-09 | Historical evidence; must be rerun |
| Full current proposal → sign → CRM terminal state | No current terminal-state proof | Not yet verified |

## 8. Success criteria

- A clean visitor completes the journey without a hidden route, duplicate prompt, accidental logout, or lost consultation.
- No rejected theme is publicly reachable.
- A/B offer impressions are observable during a normal portfolio visit.
- A tester can deliberately return to the portal; an ordinary visitor cannot see that control.
- A proposal request survives refresh and server restart.
- A disposable live proposal is approved, sent through Signed, gi., signed in Documenso, and observed as the correct terminal SSSS/CRM state.

## 9. Out of scope

- Replacing Documenso with another signing provider.
- Redesigning the entire CRM or webmail application.
- Changing the rate card or proposal pricing rules.
- Inventing new personal biography facts not approved by Greg.
- Publishing any current partial implementation before this plan's release gate passes.

## 10. Approval decisions required

- [ ] Final permanent CNA label.
- [ ] Final waiting dossier copy and personal-information boundary.
- [ ] Whether “Choose your first stop” ships with the first release or follows the editorial dossier.
- [ ] Exact tester/admin identity configuration shared by generation-limit and logout controls.

## 11. Consolidated scope and source projects

This project is the single active plan for the visitor-to-client lifecycle. It
supersedes and preserves the verified history from:

- `portfolio-platform`
- `email-crm-suite`
- `webmail-crm-integration`

The consolidated release also re-verifies these already-built or partially
built operational capabilities instead of assuming old tracker checkmarks are
current:

- SSSS visitor/proposal/generation durability and sale/backup portability.
- Total Recall export, sync, document visibility, and proposal decisions.
- CRM lifecycle, enrichment, open/click tracking, and timeline events.
- Drip enrollment, SMTP scheduling, unsubscribe, and restart survival.
- Webmail CRM context, branded signatures, out-of-office safety, calendar
  synchronization, availability, and client meeting booking.
- Proposal delimiter parsing, PDF delivery, Documenso/Signed, gi. lifecycle,
  and CRM terminal-state convergence.

Completed historical work is not automatically reopened for redesign. It is
treated as a baseline that must pass the consolidated live rehearsal. Any
contradiction between old trackers is resolved by current code and runtime
evidence.
