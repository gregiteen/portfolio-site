# Project Tracker: Branded Webmail, Email Marketing, & CRM Suite

> **Archived 2026-07-16:** Superseded and merged into
> `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/`. Completed
> checkmarks remain historical evidence; the unverified production rehearsal
> and cross-repo checks are carried into the consolidated tracker.

> **Project Name:** email-crm-suite
> **Cross-Repo:** `[portfolio]` = portfolio-site, `[total-recall]` = `~/Github/total-recall`, `[droplet]` = production VPS.

---

## Feature Build Status (as of 2026-07-09)

| Feature | Code | Verified | Covered by |
|---|---|---|---|
| **CRM Timeline & Lead Pipeline** | ❌ | ❌ | Phase 1 |
| **Search-Grounded Gemini Enrichment** | ❌ | ❌ | Phase 1 |
| **Email Open & Click Tracking** | ❌ | ❌ | Phase 2 |
| **Drip Campaign Engine Integration** | ✅ partial | ❌ | Phase 3 |
| **Webmail: Settings Screen** | ❌ | ❌ | Phase 4 |
| **Webmail: Branded Signature** | ❌ | ❌ | Phase 4 |
| **Webmail: Out of Office Auto-Reply** | ❌ | ❌ | Phase 4 |
| **Webmail: Calendar Sync (.ics)** | ❌ | ❌ | Phase 5 |
| **Client-Facing Booking Flow** | ❌ | ❌ | Phase 5 |
| **Documenso Status Polling/Sync** | ❌ | ❌ | Phase 6 |
| **Delimited Proposal Parsing** | ❌ | ❌ | Phase 6 |

---

## ✅ Phase 0: Baseline & Schema Extensions

- [x] 0.1 [portfolio] SSSS Registry updates (`calendar_event`, `webmail_settings`)
- [x] 0.2 [portfolio] Seed initial webmail settings SSSS file in `vault/runtime/config/`
- [x] 0.3 [portfolio] Confirm basic local server boot with updated registry

## ✅ Phase 1: CRM & Web Search Enrichment

- [x] 1.1 [portfolio] Modify `geminiCall` inside `serve.mjs` to configure Google Search Grounding tools
- [x] 1.2 [portfolio] Expand `visitor_profile` model with lifecycle status, chronological timelines, and enriched search fields
- [x] 1.3 [portfolio] Redesign the CRM section in `static/admin.html` to show lead pipelines, timeline details, and research buttons
- [x] 1.4 [portfolio] CNA Intake Form UI (structured business info form preceding chat in `static/consult.html`)
- [x] 1.5 [portfolio] CNA Backend Seeding (wire intake payload to initial Gemini context in `/api/cna`)
- [x] 1.6 [portfolio] AI Sales Persona System Prompt (consultative sales prompt, budget qualification, scope trade-offs, rate card alignment, process expectations)
- [x] 1.7 [portfolio] Verify Search research, CNA intake form, sales persona chat behavior, and budget negotiation

## ✅ Phase 2: Email Open & Click Tracking

- [x] 2.1 [portfolio] Create `GET /api/pixel/:email` endpoint in `serve.mjs` (return 1x1 transparent GIF and update visitor timeline)
- [x] 2.2 [portfolio] Add pixel injection to all outgoing SMTP emails
- [x] 2.3 [portfolio] Create `GET /api/link/:email` endpoint (redirect to target URL and update CRM timeline)
- [x] 2.4 [portfolio] Add link wrapping utility for all outgoing emails
- [x] 2.5 [portfolio] Verify tracking pixel fires on email open and tracked link redirects correctly to visitor activity timeline

## ✅ Phase 3: Drip Campaign Engine Integration (FR-F)

- [x] 3.1 [portfolio] Implement `/api/unsubscribe/:email` endpoint in `serve.mjs`
- [x] 3.2 [portfolio] Build the unsubscribe frontend page `static/unsubscribe.html`
- [x] 3.3 [portfolio] When unsubscribed, mark the CRM status `Unsubscribed` and stop all drip steps
- [x] 3.4 [portfolio] Add the "Unsubscribe" footer link automatically to all drip campaign outgoing emails
- [x] 3.5 [portfolio] Verify unsubscribe link click successfully halts drip scheduling and updates UI(open, click, and unsubscribe rates)
- [x] 3.6 [portfolio] Test compressed campaign sequences and confirm restart-survival

## ✅ Phase 4: Webmail Signature & Out of Office (OOO)

- [x] 4.1 [portfolio] Create settings screen inside `mail.gregiteen.xyz` (built into CRM Settings) for signature and OOO rules
- [x] 4.2 [portfolio] Add automatic signature insertion into compose and reply text views (built into new Webmail CRM tab)
- [x] 4.3 [portfolio] Build IMAP poller daemon to handle automatic OOO auto-replies on new incoming messages with loop safety
- [x] 4.4 [portfolio] Test auto-replies locally and prevent infinite loop mail storms

## ✅ Phase 5: Webmail Calendar Synchronization & Meeting Booking

- [x] 5.1 [portfolio] Build background calendar sync poller to download configured `.ics` feeds
- [x] 5.2 [portfolio] Implement lightweight regex-based line folding parser and SSSS writer for `calendar_event` files
- [x] 5.3 [portfolio] Add visual weekly calendar schedule panel to the webmail UI
- [x] 5.4 [portfolio] Steer CNA consulting flows by feeding calendar event slots into AI scoping discussions
- [x] 5.5 [portfolio] Proposal Meeting Request integration ("Request Meeting" CTA button on sign page)
- [x] 5.6 [portfolio] Backend Booking API (`/api/calendar/availability` and `/api/calendar/book` in `serve.mjs`)
- [x] 5.7 [portfolio] Client booking page and flow (`static/book-meeting.html` fetching availability and submitting bookings)
- [x] 5.8 [portfolio] Verify Google Calendar ICS sync, client booking flow, and CRM timeline logging

## ✅ Phase 6: Documenso Tracking & Proposal Hardening (FR-G)

- [x] 6.1 [portfolio] Implement background polling for Documenso document status
- [x] 6.2 [portfolio] Map signed/completed status triggers to VFS proposal states and lead progression stages
- [x] 6.3 [portfolio] Refactor Gemini proposal generation to use block delimiters, eliminating JSON-escape crashes
- [x] 6.4 [portfolio] Verify Documenso signed events auto-transition proposals and sync with Total Recall

## ⏳ Phase 7: End-to-End Rehearsal & Verification

- [ ] 7.1 [both] Confirm all CRM, tracking, and calendar SSSS files sync to Total Recall and show in the TR manager
- [ ] 7.2 [droplet] Deploy the complete suite to production droplet using rsync
- [ ] 7.3 [live] Run a complete E2E live funnel test: visitor opt-in -> search enrichment -> open/click -> CNA -> proposal -> sign -> CRM update
- [ ] 7.4 [both] Run test suites (`npm test`, `npx vitest run`, `npx ssss conformance`) and ensure all checks are fully green

---

## Discrepancy Log

*Record all assumptions-vs-reality gaps here as they occur during execution.*

| Date | Task | Expected | Found | Resolution |
|---|---|---|---|---|
| | | | | |
