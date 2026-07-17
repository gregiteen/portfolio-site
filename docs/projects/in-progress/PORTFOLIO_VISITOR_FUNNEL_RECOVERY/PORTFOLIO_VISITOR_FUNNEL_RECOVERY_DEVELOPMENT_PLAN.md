# PORTFOLIO_VISITOR_FUNNEL_RECOVERY — Development Plan

> **Project Prefix**: `PORTFOLIO_VISITOR_FUNNEL_RECOVERY`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen / Codex
> **Date**: 2026-07-16

---

## Phase 0 — Reconcile the incident and working tree

1. Inventory all partial local changes from the 2026-07-16 incident response.
2. Preserve unrelated Documenso/webmail work.
3. Revert or reshape any partial funnel work that conflicts with the approved PRD.
4. Capture a production baseline: routes, PM2 logs, current theme status, CNA/banner reachability, Documenso health, and current config presence without exposing secrets.
5. Keep implementation paused at approval gates even though the incident and plan consolidation place the project in `in-progress/`.

## Phase 1 — Approve the experience and copy

1. Approve the funnel wireflow page by page.
2. Choose the permanent CNA label.
3. Draft the four waiting dossier sections from `vault/pages/home.md` and `vault/pages/about.md`.
4. Have Greg approve every personal claim and decide the personal-information boundary.
5. Store approved waiting copy as a structural SSSS page document.
6. Decide whether the first-project selector ships in v1.

Verification: content build proves the waiting copy originates in the vault, and no duplicate design-style or CNA field appears.

## Phase 2 — Build the editorial waiting experience

1. Replace the waiting CNA chat with the approved dossier.
2. Hide the initial style form after submission.
3. Keep real generation phase, review/retry narration, elapsed time, and long-run notification copy.
4. If approved, derive first-stop choices from canonical project metadata and validate the selected route before reveal.
5. Restore waiting state after refresh without restarting or duplicating generation.

Verification: desktop/mobile/200%-zoom browser walkthrough, refresh during generation, and missing-project fallback.

## Phase 3 — Repair portfolio navigation and conversion surfaces

1. Mechanically inject permanent CNA navigation into default and generated portfolio shells.
2. Preserve the SSSS-backed A/B offer variants.
3. Reveal the offer after eight seconds or 30% scroll and keep the sticky variant across transitions.
4. Add server-authorized test controls using the existing tester/admin policy.
5. Implement confirmed `POST /api/test/logout` and remove ambiguous floating logout overlays.
6. Fix view-transition lifecycle rejection handling and BFCache restoration.

Verification: normal visitor sees CNA but no test control; tester sees and successfully uses return-to-portal; A/B impression/click events append once per expected interaction.

## Phase 4 — Make generation fail closed and retry

1. Remove every “shipping anyway” path from `compile-theme.mjs`.
2. Require structural, asset, and rendered approval before promotion.
3. Retry the complete staged attempt with bounded exponential backoff.
4. Add server-level retry for child-process errors/non-zero exits under the same run ID.
5. Keep the visitor job `running/retrying` instead of terminal `error` for review rejection.
6. Clean rejected staging artifacts and atomically promote only approved output.

Verification: inject structural, asset, rendered, and process failures; prove no public files or skin docs appear until an approved attempt completes.

## Phase 5 — Harden CNA, proposal, and admin reset boundaries

1. Persist only the real `/consult.html` CNA conversation to the authenticated visitor profile.
2. Restore the consult draft on refresh/navigation.
3. Normalize and bound histories server-side.
4. Make proposal acceptance durable and idempotent before returning HTTP 202.
5. Persist proposal retry state and expose truthful visitor status.
6. Separate and label administrator-only password recovery.
7. Replace shell commands/hard-coded Mailcow credentials with argument-array service calls and safe configuration reads.
8. Refresh IMAP/webmail sessions without broad process reload or visitor logout.

Verification: lost-response/repeat-submit test, restart durability, cross-visitor isolation, expired reset token, shell metacharacter password test, and successful current-session refresh.

## Phase 6 — Prove Signed, gi. / Documenso end to end

1. Fix the proposal status model so webhook/poller terminal states are valid and round-trip through `runtime-store.mjs`.
2. Consolidate webhook and poller mapping into one idempotent transition function.
3. Add mocked API tests for create → upload → field → send, including failures at each boundary.
4. Add PDF/signature-coordinate regression coverage.
5. Retain webhook-secret and one-time SSO tests.
6. Confirm production containers, HTTPS endpoints, object storage, API credentials, webhook, poller, branding, and SSO health without printing secrets.
7. Run one disposable live proposal workflow:
   - create CNA/proposal record;
   - approve through the real owner surface;
   - receive Signed, gi. proposal/PDF/signing handoff;
   - sign in Documenso;
   - observe webhook or poller convergence;
   - verify proposal and CRM terminal state;
   - remove disposable test records and artifacts.

Verification: terminal SSSS proposal document, CRM state, owner notification, and live signing UI constitute the release evidence. Historical 2026-07-09 evidence alone is insufficient.

## Phase 7 — Reconcile consolidated platform operations

1. Compare old `portfolio-platform` and `email-crm-suite` completion claims
   against current code and production; current evidence wins.
2. Re-run SSSS sale/backup portability and restart-durability scenarios.
3. Re-run Total Recall health, sync round-trip, bad-token drill, document
   visibility, and proposal decision paths.
4. Rehearse CRM enrichment, open/click tracking, timelines, drip enrollment,
   unsubscribe, SMTP step advancement, and restart survival.
5. Rehearse webmail CRM context, signature insertion, out-of-office loop
   safety, calendar sync, availability, and client booking.
6. Create the real Total Recall pointer document if it is still absent.
7. Record discrepancies in the consolidated tracker and fix release blockers;
   do not reopen already-working features for cosmetic rewrites.

Verification: every inherited operational claim has current executable or live
evidence, and all cross-repo state converges without leaking tenant-private
records.

## Phase 8 — Release gate and deployment

1. Run focused Node tests.
2. Run the sanctioned TypeScript and lint start-here scripts; require exactly zero errors.
3. Run `npm test`, `npm run validate`, and `npm run build` on the approved non-laptop execution environment.
4. Perform a clean-account browser walkthrough of the complete funnel.
5. Review screenshots at desktop and mobile widths.
6. Update architecture, tracker, security/UX report, and OpenWiki notes.
7. Follow the repository deploy skill; do not deploy the unrelated dirty working tree.
8. Smoke production routes and monitor logs through the completed signature lifecycle.

## Release-blocking scenarios

- A rejected design becomes public.
- A normal visitor cannot discover the CNA.
- The waiting page shows CNA/proposal intake.
- A visitor sees a test-only logout control.
- A proposal response claims acceptance without a durable record.
- Admin reset reports failure after changing the password.
- Documenso signing succeeds externally but terminal state fails to persist.
- The A/B offer is configured but cannot be observed during the normal portfolio journey.
