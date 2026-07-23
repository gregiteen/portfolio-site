# PORTFOLIO_VISITOR_FUNNEL_RECOVERY — Project Tracker

> **Project Prefix**: `PORTFOLIO_VISITOR_FUNNEL_RECOVERY`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen / Codex
> **Date**: 2026-07-16

---

## ⏳ Phase 0: Approval and baseline

Goal: agree on the funnel and preserve a trustworthy incident baseline before implementation resumes.

- [x] Create the four canonical project documents
- [ ] Approve permanent CNA label
- [ ] Approve waiting dossier format and personal-information boundary
- [ ] Decide whether first-project selection ships in v1
- [ ] Confirm tester/admin identity policy for limit exceptions and return-to-portal control
- [ ] Inventory and reconcile all partial local incident-response edits
- [ ] Capture current production baseline without exposing secrets
- [x] Merge active portfolio plans and move this project to `docs/projects/in-progress/`

## ⏳ Phase 1: Vault-authored waiting experience

Goal: give visitors worthwhile editorial content while generation runs, without starting the sales funnel.

- [x] Draft Background copy from approved vault facts
- [x] Draft Design Approach copy from approved vault facts
- [x] Draft Development Depth copy from approved vault facts
- [x] Keep the personal-perspective card within existing approved vault facts
- [x] Project the waiting dossier from existing structural SSSS page documents
- [x] Replace waiting-page CNA chat with dossier
- [x] Hide the single style form after submission
- [ ] Implement approved first-project selection or explicitly remove it from v1
- [ ] Verify no waiting-page CNA, proposal action, A/B offer, or duplicate style field

## ⏳ Phase 2: Portfolio navigation, offers, and test controls

Goal: make CNA discovery reliable while keeping test controls isolated from real visitors.

- [ ] Add permanent CNA navigation to every default/generated portfolio page
- [x] Preserve SSSS-backed sticky A/B offer assignment
- [x] Reveal A/B banner after eight seconds or 30% scroll
- [x] Add server-authorized test-control discovery
- [x] Add confirmed `POST /api/test/logout` return-to-portal control for testers only
- [x] Remove ambiguous floating logout overlays
- [x] Handle skipped view-transition promises and BFCache restoration
- [ ] Verify mobile hit targets and non-overlap among flipper, CNA, banner, and test controls

## ⏳ Phase 3: Fail-closed generation

Goal: publish only designs that pass the complete rendered release gate.

- [x] Remove all fail-open “shipping anyway” paths
- [x] Require structural approval
- [x] Require asset audit approval
- [x] Require rendered screenshot approval
- [x] Retry rejected staged attempts with bounded backoff
- [x] Retry child-process failures under the same run ID
- [x] Keep visitor status running/retrying until approval
- [ ] Prove rejected artifacts never reach `designs/` or `vault/pages/skins/`

## ⏳ Phase 4: CNA, proposal, and admin reset durability

Goal: preserve the real consultation and make every accepted proposal request durable.

- [x] Persist `/consult.html` draft to the authenticated visitor SSSS document
- [x] Restore consultation after refresh/navigation
- [x] Enforce cross-visitor CNA isolation
- [x] Make proposal submission idempotent
- [x] Write proposal before returning HTTP 202 acceptance
- [x] Persist proposal generation retry state and truthful status
- [x] Label reset flow administrator-only
- [x] Remove shell interpolation and hard-coded Mailcow database credential
- [x] Eliminate false HTTP 500 after successful mailbox mutation
- [x] Refresh administrator IMAP/webmail sessions without PM2 reload

## ⏳ Phase 5: Signed, gi. / Documenso contract workflow

Goal: prove the actual proposal-to-signature lifecycle and its durable terminal state.

- [x] Add `signed` and `client_rejected` to the valid persisted proposal lifecycle
- [x] Share one idempotent transition function between webhook and poller
- [ ] Test create-document API request
- [ ] Test presigned PDF upload
- [ ] Test signature-field placement request
- [ ] Test send-document request and signing URL persistence
- [ ] Test every Documenso boundary failure
- [ ] Test webhook authentication and repeat delivery
- [ ] Test poller recovery after a missed webhook
- [ ] Test Signed, gi. one-time SSO expiration and replay rejection
- [ ] Verify production Signed, gi. branding and operational status surface
- [ ] Run disposable live proposal → approval → PDF → signing → terminal SSSS/CRM rehearsal
- [ ] Remove all disposable records and signing documents from the rehearsal

## ⏳ Phase 6: Consolidated platform operations

Goal: replace contradictory historical checkmarks with current evidence for every inherited system.

- [ ] Reconcile old portfolio-platform and email-CRM claims against current code/runtime
- [ ] Verify live-site smoke, fossil 404s, flipper, root gate, and exact Designs index
- [ ] Verify deploy/restart preserves sessions, visitors, proposals, notifications, drip, and generation state
- [ ] Verify sale export drops tenant-private runtime data and backup export preserves the expected inventory
- [ ] Verify Total Recall API health, PAT scopes, sync round-trip, idempotent second run, and bad-token status
- [ ] Verify Total Recall proposal approve/revise/reject convergence with the portfolio proposal document
- [ ] Verify zero secrets in vault documents, bundles, and intended diff; verify traversal and wrong-token rejection
- [ ] Verify CRM enrichment, open/click tracking, lifecycle, and timeline records
- [ ] Verify drip delivery order, failure semantics, unsubscribe, controls, and restart survival
- [ ] Verify webmail CRM context and active proposal visibility
- [ ] Verify branded signature and out-of-office loop protection
- [ ] Verify calendar sync, availability, client booking, confirmations, and timeline update
- [ ] Verify proposal delimiter parser against malformed model output
- [ ] Create and publish the real Total Recall pointer document if absent

## ⏳ Phase 7: Testing, release, and live verification

Goal: release only after the complete real visitor and contract workflows pass.

- [ ] Focused regression tests pass
- [ ] Sanctioned TypeScript checker reports exactly zero errors
- [ ] Sanctioned lint checker reports exactly zero errors
- [ ] `npm test` passes
- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] Desktop browser walkthrough passes
- [ ] Mobile browser walkthrough passes
- [ ] Clean visitor walkthrough passes: portal → wait → portfolio → CNA → durable proposal
- [ ] Tester walkthrough passes: tester-only return to portal and generation-limit exception
- [ ] Signed, gi. walkthrough passes through terminal CRM state
- [ ] Security/UX impact report updated
- [ ] OpenWiki and architecture documentation updated
- [ ] Deploy protocol completed from an approved clean scope
- [ ] Production smoke checks and log monitoring pass

## Verification Log

- 2026-07-16: Source trace confirmed Documenso create/upload/field/send client, Signed, gi. PDF/handoff, webhook/poller, and SSO code are present.
- 2026-07-16: Source trace found a release blocker: webhook/poller attempt `signed` and `client_rejected`, while `runtime-store.mjs` rejects those proposal statuses.
- 2026-07-16: Existing automated coverage proves webhook secret/status mapping and one-time SSO behavior, but not the complete API or terminal SSSS lifecycle.
- 2026-07-16: Tracker evidence records a historical live Documenso signing-page rehearsal on 2026-07-09; current full proposal-to-CRM rehearsal remains pending.
- 2026-07-16: Focused regression suite passed (14 tests): proposal lifecycle, Documenso webhook/SSO, CNA proposal parsing, waiting-profile projection, and Mailcow reset helpers.
- 2026-07-16: Implementation changed the generation worker to retain a running/retrying state across child failures using the same durable run ID; production restart recovery and rendered release proof remain pending.
- 2026-07-16: Waiting-page copy is a projection of the existing Home and About structural vault pages; no unapproved personal biography was added.
- 2026-07-16: Read-only production check: `sign.gregiteen.xyz` completed with HTTP 200; Documenso database, application, and object storage containers were running; portfolio PM2 was online. Production logs also contain repeated ignored lifecycle events for unknown Documenso document IDs, so the live contract workflow is operational but not yet proven end-to-end.
