# Development Plan: Branded Webmail, Email Marketing, & CRM Suite

> **Archived 2026-07-16:** Superseded and merged into
> `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/`.

> **Project Name:** email-crm-suite
> **Execution Order:** Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 (Phase 3 & 4 can run in parallel if needed).
> **Tags:** `[portfolio]` = `~/Github/portfolio-site`, `[total-recall]` = `~/Github/total-recall`, `[droplet]` = production VPS.

---

## Technical Baseline & Verified Code Structures
1.  **Server Engine (`scripts/serve.mjs`):** Uses an in-memory cache map `visitorProfiles` (hydrated at boot) and `proposalThreads` (hydrated at boot). All mutations to profiles or proposals must update these maps in memory and trigger disk writes via `upsertVisitor(email, profile)` or `upsertProposal(id, proposal)` exported from `scripts/runtime-store.mjs`.
2.  **SMTP configuration:** Exists as `smtpTransport` (nodemailer transport using `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, etc.) in `serve.mjs`.
3.  **Static Copy Pipeline:** `build-site.mjs` automatically copies all files from `/static/` into the build target folder (`dist/site/` or individual designs outputs). Booking pages must be placed in `static/book-meeting.html` to be picked up.
4.  **Documenso document records:** `signingDocumentId`, `signingStatus` (starts as `pending_signature`), and `signingUrl` are already serialized on proposal threads in `runtime-store.mjs`.

---

## Phase 0: Baseline & Schema Extensions
Configure the data schema to support CRM and webmail settings.

*   **0.1 [portfolio] Registry Update:** Add `calendar_event` (tenant_private) and `webmail_settings` (tenant_private) types to `vault-registry/extensions/portfolio.json`.
*   **0.2 [portfolio] Seed Webmail Configuration:** Create the source-of-truth document at `vault/runtime/config/webmail-settings.md` containing settings for signatures (HTML/Text), OOO (status, text, range), and calendar ICS feeds.
*   **Verify:** Run `npx ssss validate` on the registry. Verify `npm test` is green.

---

## Phase 1: Basic CRM & Web Search Enrichment
Expand the lead data model, add automated Google Search Research, and implement the structured CNA intake form with the consultative AI Sales Persona.

*   **1.1 [portfolio] Enrichment Grounding:** Modify `geminiCall` in `serve.mjs` to support an optional `tools` parameter. When research is triggered on email capture, pass `tools: [{ googleSearch: {} }]` so the model performs web searches on the lead's domain.
*   **1.2 [portfolio] CRM Profile Expansion:** Add fields to `visitor_profile`: `status` (`Lead`, `Nurturing`, `CNA`, `Proposal`, `Customer`, `Unsubscribed`), `timeline` (chronological event array), and `enrichment` (company, size, industry, search notes).
*   **1.3 [portfolio] CRM Admin Dashboard:** Redesign `static/admin.html` (the CRM section) to display leads categorized by stage, detail view with customer timeline, and trigger buttons for manually executing search research.
*   **1.4 [portfolio] CNA Intake Form UI:** Add a structured business information form to `static/consult.html` (Company, Industry, Size, Timeline, Budget, Description) that precedes the chat container. Transition to the chat UI upon submission.
*   **1.5 [portfolio] CNA Backend Seeding:** Update `/api/cna` in `serve.mjs` to process the initial form data payload on the first request and seed the Gemini conversation context so the AI starts with scoping and skips introductory questions.
*   **1.6 [portfolio] AI Sales Persona System Prompt:** Redraft the system prompt for the `/api/cna` chat in `serve.mjs`. Configure a high-end consultative sales representative persona. Instruct the AI to explicitly discuss and qualify the pre-filled budget, align scope to Greg's actual rate card configuration, use SPIN/BANT sales tactics, and set onboarding process expectations before closing the assessment.
*   **Verify:** Mock a lead capture with domain `stripe.com`. Verify the search-grounded Gemini research completes. Submit the CNA intake form; verify the chat interface loads and the AI adopts a structured sales representative tone, actively qualifies and discusses the budget, and details Greg's work expectations.

---

## Phase 2: Email Open & Click Tracking
Build tracking servers and logging logic to capture customer interaction.

*   **2.1 [portfolio] Open Tracking Endpoint:** Add `GET /api/track/open` returning a transparent 1x1 GIF. Logs email ID and visitor email, appending an `open` event to the CRM timeline.
*   **2.2 [portfolio] Click Tracking Endpoint:** Add `GET /api/track/click` which logs the click, appends a `click` event (link URL, timestamp) to the CRM timeline, and returns a `302` redirect to the destination URL.
*   **2.3 [portfolio] Email Link Rewriting:** Add helpers in `serve.mjs` and `drip.mjs` to rewrite outgoing emails: inject the open pixel image tag and wrap links in the click tracking redirect URL.
*   **Verify:** Send a test email containing links to a local mailbox. Fetch the pixel and click the links; verify the CRM timeline records both actions.

---

## Phase 3: Drip Campaign Engine Integration
Build the core email marketing automation suite (migrated from `portfolio-platform`).

*   **3.1 [portfolio] Drip Scheduler Tick:** Wire the drip campaign engine scheduler inside `serve.mjs` to run on a background loop (default: every minute).
*   **3.2 [portfolio] State Management:** Ensure visitors with `optIn: true` auto-enroll in `default-nurture`. When CNA starts or a proposal is generated, automatically pause marketing campaign emails.
*   **3.3 [portfolio] Unsubscribe Endpoint:** Integrate the `/api/unsubscribe` route. Decode the signed token, mark the lead `unsubscribed`, and stop all drip steps.
*   **3.4 [portfolio] Marketing Analytics Panel:** Add campaign performance metrics to the Admin UI: unsubscribe rates, step-by-step funnel drop-offs, and open rates.
*   **Verify:** Run a compressed campaign (minutes) locally. Verify it survives server restarts, sends emails in order, and honors unsubscribe requests immediately.

---

## Phase 4: Webmail Branded Signatures & Out of Office Auto-Reply
Improve the webmail client to match enterprise feature suites.

*   **4.1 [portfolio] Settings Screen:** Add a "Webmail Settings" tab to the interface at `mail.gregiteen.xyz`. Provide inputs for signature text, OOO toggle, OOO reply text, and OOO start/end dates.
*   **4.2 [portfolio] Signature Injection:** Automatically append the saved signature to compose and reply text areas inside `webmail-ui.mjs`.
*   **4.3 [portfolio] Out of Office Poller:** Build an IMAP daemon in `serve.mjs` that polls the Inbox. If OOO is enabled and current time falls inside the configured date range:
    *   Find new, unseen messages since last check using IMAP connection.
    *   Send OOO email via SMTP to the sender.
    *   Store sender + message ID in a local file-backed or in-memory map to prevent infinite loop auto-replies.
*   **Verify:** Enable OOO and send an email to Greg's test inbox. Verify an auto-reply is delivered immediately, and no email loops occur.

---

## Phase 5: Webmail Calendar Synchronization & Meeting Booking
Integrate calendar slot visibility, smart CNA bookings, and client-facing meeting requests.

*   **5.1 [portfolio] ICS Calendar Sync Poller:** Create a background worker that fetches `.ics` URLs defined in settings.
*   **5.2 [portfolio] iCal Parser & SSSS Writer:** Build a lightweight, regex-based line folding parser for `.ics` format. Parse upcoming event titles, start/end dates, and description details. Save them as SSSS `calendar_event` documents.
*   **5.3 [portfolio] Calendar View:** Render a compact weekly calendar view inside `mail.gregiteen.xyz` showing Greg's busy slots.
*   **5.4 [portfolio] CNA Availability Steering:** Teach the CNA AI to look at Greg's local `calendar_event` SSSS documents to check his availability and suggest free times to consulting leads.
*   **5.5 [portfolio] Proposal Meeting Request integration:** Add a "Request Meeting" button to `renderSignPage` in `serve.mjs`.
*   **5.6 [portfolio] Backend Booking API:** Create `GET /api/calendar/availability` (to read synced SSSS calendar files, filter availability, and return open slots) and `POST /api/calendar/book` (to save the booked meeting into `vault/runtime/calendar/`, send SMTP confirmations, and update the CRM visitor timeline/status to `Meeting Scheduled`) in `serve.mjs`.
*   **5.7 [portfolio] Client Booking Flow:** Create the `static/book-meeting.html` page (automatically copied by build-site) that fetches availability from `/api/calendar/availability` and submits selections to `/api/calendar/book`.
*   **Verify:** Parse a Google Calendar `.ics` file; verify the events save as VFS files. Click the proposal sign page "Request Meeting" link; verify the booking page opens, shows free slots, lets you book, and successfully records the booked event and updates the CRM timeline.

---

## Phase 6: Documenso Lifecycle Tracking & Robust Proposals
Harden proposal document states and track Documenso signatures automatically.

*   **6.1 [portfolio] Documenso Poller:** Build a background poller inside `serve.mjs` that queries the Documenso REST API for document IDs stored in pending proposals where `signingDocumentId` is present and `signingStatus === 'pending_signature'`.
*   **6.2 [portfolio] Signature State Change:** When Documenso returns `SIGNED` or `COMPLETED`, automatically:
    *   Update proposal status in the VFS to `accepted` / `signed`.
    *   Advance the visitor stage in the CRM to `Customer`.
    *   Send an email notification to Greg.
*   **6.3 [portfolio] Proposal Parser Hardening:** Implement raw block parsing (using delimiters) instead of requesting JSON-inside-markdown from Gemini, preventing JSON parse crashes.
*   **Verify:** Mock a Documenso signed status response. Verify the proposal document transitions status automatically and CRM state shifts.

---

## Phase 7: End-to-End Rehearsal & Verification
Mandatory testing gate before shipping the CRM & Webmail suite.

*   **7.1 [portfolio + total-recall] Integration Sync:** Confirm all SSSS files (visitor, proposal, calendar, logs) sync cleanly to Total Recall and display in the TR Document Manager.
*   **7.2 [droplet] Live Deploy & Run:** Run the deployment skill to sync all changes to the droplet. Restart the services.
*   **7.3 [live] Production Rehearsal:** Run a full customer funnel rehearsal: splash capture -> web search enrichment -> open/click metrics -> CNA proposal -> TR approval -> Documenso signature -> CRM auto-accept.
*   **Verify:** Confirm every success metric defined in `EMAIL_CRM_PRD.md`. Verify test suites (`npm test`, `npx vitest run`, `npx ssss conformance`) are fully green.
