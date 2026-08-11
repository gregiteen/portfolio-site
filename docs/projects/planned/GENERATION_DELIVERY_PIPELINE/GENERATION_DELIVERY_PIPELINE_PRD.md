# GENERATION_DELIVERY_PIPELINE — PRD

> **Project Prefix**: `GENERATION_DELIVERY_PIPELINE`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Problem

When a visitor generates a site, Greg finds out through a **visitor-arrival** email, not a **generation-complete** one, and the two are not the same event. `notifyOwner()` in `serve.mjs` fires when someone submits the form. It carries genuinely good enrichment already — email, style prompt, IP, browser, OS, screen, timezone, language, referrer, platform, touch, and the CNA assessment when one exists.

What it does not carry is anything about the site that was actually built:

1. **No artifacts.** No screenshots, no `DESIGN.md`, no palette, no archetype. To see what a visitor got, Greg has to open the live URL and compare by memory.
2. **No responsive proof.** `render-audit.mjs` already screenshots desktop 1440px and mobile 390px across five pages every run — and then discards them to `/tmp` (see `GENERATIVE_DESIGN_STUDIO` Phase 0). The exact assets that would answer "does this look right on a phone?" are captured, then thrown away rather than delivered.
3. **Nothing actionable in the inbox.** The proposal flow exists and works — `thread.proposal` carries `proposal_text`, `client_email_draft`, `price_cents`, and a revision loop where Greg replies with edits or replies "send it" to release it to the client. But that thread starts from a CNA consultation, not from a generation, and it lives in a bespoke reply-parsing flow rather than as a real draft in Greg's mail client.
4. **No draft in Drafts.** `scripts/lib/imap.mjs` exposes `getImapClient()`, `fetchInbox()` and `startImapPoller()` — there is **no APPEND**, so nothing can place a real draft in the Drafts folder. Everything owner-facing is a sent email that Greg must reply to.
5. **Review is all-or-nothing per message.** The current model requires Greg to reply "send it" for every proposal. There is no mode where a high-confidence proposal goes out on its own.

Net effect: the highest-signal moment in the funnel — a stranger just described their taste in their own words and got a bespoke site — produces an email that says a visit happened, and no artifact Greg can act on.

## Goals

- **G1 — One generation-complete digest per site.** A single email, sent when a generation promotes, carrying responsive screenshots (desktop + mobile), the `DESIGN.md`, and the enriched visitor profile in one place.
- **G2 — One proposal draft per qualified visitor.** A real draft in Greg's Drafts folder — proposal plus the client-facing message — editable in his normal mail client, sendable with no tooling.
- **G3 — Auto-propose mode.** A toggle: `draft` (default, human sends) or `auto` (send on its own above a confidence threshold). Switching modes must not require a deploy.
- **G4 — Reuse, don't rebuild.** Screenshots come from the existing render audit; enrichment from the existing visitor profile; proposal text from the existing proposal system. This project wires and delivers; it does not reimplement.
- **G5 — Delivery failure never breaks generation.** A dead SMTP or IMAP endpoint must not fail or roll back a design that otherwise passed its gates.

## Non-Goals

- **Not a new proposal generator.** `proposal-output.mjs` and the revision loop stay as they are.
- **Not a replacement for the visitor-arrival email.** `notifyOwner()` keeps firing on arrival; this adds a second, later, artifact-carrying email. Arrival and completion are different events and both are useful.
- **Not a new mail server.** SMTP2GO for sending, Mailcow/Dovecot IMAP for drafts — both already in production.
- **Not client-facing.** Every email in this project goes to Greg. Nothing here sends to a visitor without Greg's action, except explicitly in auto-propose mode.

## Users & Use Cases

| User | Use case |
|---|---|
| Greg (triage) | Opens one email, sees what was built, on both viewports, for whom — without leaving the inbox |
| Greg (sales) | Opens Drafts, edits a proposal already written for a specific visitor, hits send |
| Greg (scale) | Flips auto-propose on for a week, reviews what went out afterwards rather than gating each one |

## Requirements

### R1 — Generation-complete digest (G1)

Sent on **promotion**, not on generation start, and not on failure. One email per promoted design containing:

- Responsive screenshots: desktop 1440px + mobile 390px, from the render audit that already ran
- `DESIGN.md` attached, plus name / accent / archetype inline
- Enriched visitor info — the same fields `notifyOwner()` already assembles
- Link to the live design route and to its entry in the asset library

### R2 — Proposal draft (G2)

An IMAP `APPEND` to the Drafts folder — a real draft, not a sent email, containing the proposal and the client-facing message, addressed to the visitor, ready to edit and send.

### R3 — Auto-propose mode (G3)

A persisted `propose_mode` setting (`draft` | `auto`) with a confidence threshold. In `auto`, a proposal above threshold sends directly to the visitor and Greg receives a notification of what went out. Below threshold always falls back to `draft`, in either mode.

**Safety requirements**, given this sends unattended mail to strangers on Greg's behalf:
- Mode and threshold are runtime settings, not deploy-time constants
- Rate cap per period, enforced independently of the threshold
- Every auto-send is recorded with its rationale and full sent body
- A kill switch that takes effect immediately, without a restart

## Success Metrics

| # | Metric | Baseline | Target |
|---|---|---|---|
| M1 | Promoted designs producing a digest email | 0% | 100% |
| M2 | Digests carrying both viewports + `DESIGN.md` | 0% | 100% |
| M3 | Qualified visitors with a ready draft in Drafts | 0% | 100% |
| M4 | Generation runs failed by a delivery error | n/a | 0 |
| M5 | Auto-sends without a recorded rationale + body | n/a | 0 |

## Risks

| Risk | Mitigation |
|---|---|
| Auto-propose emails a stranger with a bad proposal | Off by default; confidence threshold; rate cap; immediate kill switch; every send recorded |
| Delivery failure rolls back a good design | Delivery runs strictly **after** atomic promotion, in a detached path that cannot fail the run (G5) |
| Attachments make emails huge | Screenshots are already JPEG q70; downscale for email and link to the library for full size |
| IMAP APPEND lands in the wrong folder across clients | Resolve the Drafts folder via SPECIAL-USE rather than assuming a name; verify against the live Mailcow mailbox |
| Visitor PII spread further across systems | Digest goes only to `mailOwner`; nothing new is exposed publicly; enrichment fields are those already collected |
