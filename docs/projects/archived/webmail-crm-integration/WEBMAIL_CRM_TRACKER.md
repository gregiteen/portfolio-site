# Webmail CRM Integration

> **Archived 2026-07-16:** Completed implementation history merged into
> `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/`.

## Goal
Integrate CRM features (prospects, stages, deals, funnels, drip campaigns) directly into the custom Webmail interface within `admin.html`.

## Tasks
- [x] Parse email sender's address in `loadWebmail` within `static/admin.html`
- [x] Fetch visitor CRM profile for the sender
- [x] Inject a CRM card/actions directly alongside the email preview
  - Show Funnel Stage / Lead Status
  - Show Drip Campaign Status with Pause/Resume controls
  - Show Active Proposals / Deals
- [x] Deploy changes to the live server
