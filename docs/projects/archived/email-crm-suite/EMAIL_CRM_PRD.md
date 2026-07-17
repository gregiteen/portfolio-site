# Project Requirements Document: Branded Webmail, Email Marketing, & CRM Suite

> **Archived 2026-07-16:** Superseded and merged into
> `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/`.

> **Project Name:** email-crm-suite
> **Status:** Planned / Pending Approval (2026-07-09)
> **Replaces/Subsumes:** Incomplete Phase 3 (Drip Campaign) & Phase 4.4 (Proposal Hardening) from the `portfolio-platform` project.
> **Cross-Repo:** Work spans `portfolio-site` (this repo) and updates to `total-recall` (`~/Github/total-recall`).

---

## 1. Executive Summary & Vision

To grow the boutique digital services business, Greg Iteen needs a unified lead-nurturing and client-management cockpit. Instead of stitching together external proprietary platforms (HubSpot, Mailchimp, Calendly) which leak customer data and add operational costs, this project consolidates all lead capture, email marketing, client relationship management (CRM), branded webmail, Documenso tracking, and calendar synchronization into a unified, VFS-native suite running completely on Greg's DigitalOcean droplet.

This suite is built on **SSSS** (Structured Semantic Syntax System), ensuring all business records (visitor logs, client timelines, calendar events, email tracking metrics, proposals, out-of-office rules) exist as plain-text, typed Markdown documents under `vault/runtime/` (`tenant_private`). These records sync autonomously to Greg's local cockpit, Total Recall, giving him complete control of his business memory.

---

## 2. Core User Journey

1. **Discovery & Opt-In:** A visitor arrives at the portfolio site, prompt-generates a custom visual skin, and enters their email. If they check "Opt-In," they are entered into the **CRM** as a `Lead` and enrolled in the **Default Nurture Drip Campaign**.
2. **Search Grounding & Enrichment:** The moment the email is captured, the server triggers a background task that researches the company name and industry using Gemini 3.5 Flash with **Google Search Grounding**. This enriches their CRM profile with company context, public descriptions, news, and estimated scale.
3. **Email Marketing (Drip) & Tracking:** Greg's droplet sends marketing emails to the lead. Every email has an embedded **open-tracking pixel** and **click-tracking redirects**. If they click a link or open an email, the CRM logs the activity in their visual **Activity Timeline**.
4. **CNA & Proposal:** The lead is steered via persistent banners to start the **Client Needs Assessment (CNA)**. The page first presents a structured business intake form (Company, Industry, Scale, Timeline, Budget, Goals). On submission, the interface transitions to an interactive chat discussion with the AI, which is seeded with the form data to skip introductory boilerplate. Once completed, a tailored proposal is drafted. The lead's CRM status shifts to `CNA` then `Proposal`. The marketing campaigns pause automatically.
5. **E-Sign & Status Tracking:** Greg reviews the proposal, revisions occur via email or Total Recall, and he hits "Send." The client receives the proposal cover note with a branded **Documenso signature link** and attached PDF.
6. **Auto-Accept on Sign:** A background poller checks Documenso's API. Once signed, the proposal status automatically transitions to `signed`. The CRM shifts the contact to `Customer` (enrolling them in a post-purchase checklist or workflow), sends a confirmation email to Greg and the client, and restarts the sync loop.
7. **Business Management (Webmail + Calendar + CRM):** Greg logs into his branded webmail client at `mail.gregiteen.xyz` to manage everyday correspondence. The webmail interface is enhanced with:
   - **Branded Signature:** Editable HTML/Text signature appended automatically.
   - **Out of Office (OOO):** Auto-replies sent during active ranges when new emails hit his IMAP box.
   - **Calendar Feed Sync:** Displays Greg's current schedule (parsed from external `.ics` feeds like Google Calendar) and checks availability inside the AI CNA.

---

## 3. Functional Requirements

### FR-1: Email Marketing (Drip) Engine & Management
*   **F1.1: Campaign Schema:** `drip_campaign` definition lives as structural content under `vault/campaigns/`.
*   **F1.2: Lead Enrollment & State:** Each visitor's active drip status (campaign, current step, next send time, pause status) lives inside their private SSSS `visitor_profile` document.
*   **F1.3: Drip Scheduler & SMTP:** A 1-minute interval background cron checks for due drip emails, compiles templates, appends unsubscribe links, and fires them via SMTP2GO.
*   **F1.4: One-Click Unsubscribe:** A signed token endpoint (`/api/unsubscribe?token=...`) that immediately halts campaigns and marks the lead `unsubscribed`.
*   **F1.5: Marketing Admin View:** Visual dashboard showing drip status per lead, campaign metrics (total enrolled, completed, unsubscribed), and controls to manually enroll/pause/resume contacts.

### FR-2: Basic CRM with Web Search Enrichment & Tracking
*   **F2.1: Enriched Client Profiles:** Expand the visitor profile to store company details, industry, funding/scale estimates, and a summary of public search results.
*   **F2.2: Gemini Google Search Grounding:** Inject `tools: [{ googleSearch: {} }]` into the Gemini API call when research is triggered. Use the email domain (e.g., `stripe.com`) and CNA inputs to scrape public data.
*   **F2.3: Email Open Tracking:** Append a 1x1 transparent tracking pixel (`/api/track/open?id=<token>`) to drip and proposal emails.
*   **F2.4: Email Click Tracking:** Rewrite links to route through `/api/track/click?id=<token>&url=<target>`.
*   **F2.5: Lead Timeline & Pipeline:** Create a visual timeline showing all lead events (captured, enriched, drip sent, email opened, link clicked, CNA, proposal sent, proposal signed). Group contacts into stages: `Lead`, `Nurturing`, `CNA`, `Proposal`, `Customer`, `Unsubscribed`.
*   **F2.6: Structured CNA Intake Form:** The client-needs-assessment flow (`/consult.html`) starts with a form gathering Company Name, Industry, business size, approximate timeline, budget target, and primary project objectives. Upon submission:
    *   The page transitions to the interactive chat interface.
    *   The form data is submitted to `/api/cna` to initialize the conversation history.
    *   The backend seeds the LLM with this structured context, enabling the AI to skip introductory questions and immediately ask deep follow-up or scoping questions.
*   **F2.7: AI Sales Persona & Budget Qualification:**
    *   **Consultative Sales Persona:** The AI must conduct the conversation as Greg's expert salesperson. It must use proven consultative sales methodologies (e.g., SPIN selling, BANT framework) to identify pain points, ROI, value drivers, and set clear process expectations.
    *   **Active Budget Discussion:** The AI must NOT skip the budget. Even though budget is pre-filled, the AI must actively validate and align the client's scope with the budget, reference Greg's pricing bounds (from the rate card config), discuss budget trade-offs, and set clear financial expectations.
    *   **Expectation Management:** The AI must outline Greg's engagement stages (intake $\rightarrow$ proposal review $\rightarrow$ e-sign $\rightarrow$ kickoff) to ensure the client understands the next steps before they generate the proposal.

### FR-3: Branded Webmail Suite Improvements
*   **F3.1: Branded Signatures:** A setting inside the webmail UI to configure a signature (supports HTML/Text). Auto-inject signature into `/compose` and reply textareas.
*   **F3.2: Out of Office (OOO) Auto-Reply:**
    *   Settings fields: `enabled` (boolean), `subject`, `body`, `start_date` (ISO), `end_date` (ISO).
    *   Background IMAP listener that checks for unseen incoming mail since the last tick, issues a single OOO reply to sender, and marks it as processed in a local key-value store to prevent loop storms.
*   **F3.3: Calendar Feed Sync:**
    *   Settings field: `calendar_feeds` (array of `.ics` URLs).
    *   A poller that fetches feeds, parses events, and writes them as SSSS documents under `vault/runtime/calendar/`.
    *   Visual calendar panel in the webmail interface displaying Greg's upcoming schedule.
    *   Steer CNA bookings: Let the AI query Greg's calendar events to suggest open meeting times.

### FR-4: Documenso Lifecycle Tracking
*   **F4.1: Documenso API Poller:** Periodically query `GET /api/v1/documents/${documentId}` for proposals in `sent` status.
*   **F4.2: Terminal State Sync:** When status is `SIGNED` or `COMPLETED`, automatically update proposal status to `accepted` / `signed`, mark the decided date, and notify Greg via email and Total Recall.
*   **F4.3: Robust Delimiters:** Harden Gemini proposal outputs by using out-of-band text block delimiter parsers (closing the JSON escape fragility tail).

### FR-5: Meeting Scheduler & Proposal Integration
*   **F5.1: Proposal "Request Meeting" Button:** On the branded proposal signing handoff landing page (`renderSignPage` in `serve.mjs`), add a prominent "Questions? Request a Meeting to Discuss" CTA button.
*   **F5.2: Booking Page:** The button redirects the customer to a booking interface (e.g. `/book-meeting.html?proposal=<id>`) displaying Greg's availability.
*   **F5.3: Availability Checker:** The booking interface queries the synced calendar SSSS documents (`vault/runtime/calendar/*.md`) to cross-reference Greg's current busy events and displays only Greg's free slots (within default business hours).
*   **F5.4: Booking Confirmation:** On booking, the client selects a slot. The server:
    *   Creates a new booked slot SSSS doc under `vault/runtime/calendar/` (flagged as client-booked).
    *   Fires SMTP confirmation emails to both Greg and the client containing calendar invite attachments (.ics).
    *   Appends a "Meeting scheduled for <timestamp>" event to the visitor's CRM timeline and updates their status to `Meeting Scheduled`.

---

## 4. Technical Constraints & Design Principles
1.  **VFS/SSSS as Source of Truth:** All CRM data, calendar events, OOO settings, and campaign states must exist as valid Markdown documents with SSSS headers.
2.  **Zero-Leak Security:** No API keys, credentials, or session cookies are written to SSSS documents. They remain in `.env` or memory-only caches.
3.  **Performance & Light Dependencies:** Limit third-party library bloat. Parse `.ics` files using a simple regex-based parser or a light, secure parser. Generate PDFs using the existing `pdfkit` module.
4.  **No-Code Sandboxing:** During local verification, mock IMAP/SMTP connections where necessary, and run tests locally before droplet deployment.

---

## 5. Success Criteria
*   CRM pipeline lists leads correctly, showing web search enrichment context and timelines.
*   Sending a drip email generates an open/click event in the CRM when the tracker image is fetched or links are clicked.
*   Incoming emails receive OOO replies when OOO is enabled and the dates are active.
*   Webmail client loads signatures on compose/reply and shows upcoming synced calendar slots.
*   A proposal signed on Documenso automatically transitions to `signed` status in the database and updates Total Recall.
*   Clicking "Request a Meeting" on a proposal landing page displays Greg's actual free slots (calculated dynamically from synced calendar records), and booking a slot generates emails, updates CRM, and logs the calendar event.
