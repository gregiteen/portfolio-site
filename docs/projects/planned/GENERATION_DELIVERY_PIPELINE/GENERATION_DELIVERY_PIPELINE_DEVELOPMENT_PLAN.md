# GENERATION_DELIVERY_PIPELINE — Development Plan

> **Project Prefix**: `GENERATION_DELIVERY_PIPELINE`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Sequencing rationale

Phase 1 (digest) before Phase 2 (drafts) before Phase 3 (auto-propose), in strict order of blast radius:

- **Digest** emails Greg about something that already happened. Worst case: a bad email in his own inbox.
- **Draft** writes to Greg's mailbox. Worst case: clutter in Drafts. Nothing leaves the building.
- **Auto-propose** emails strangers unattended. Worst case: a bad proposal goes out under Greg's name.

Earning confidence in that order means the risky capability ships on top of two proven layers rather than alongside them. Auto-propose is also the only phase with unresolved design questions (architecture open questions 1 and 2), and those must close before it starts.

**Hard prerequisite:** `GENERATIVE_DESIGN_STUDIO` Phase 0 must land first. Screenshots are currently overwritten per pass and purged from `/tmp` at 10 days — there is no durable artifact for the digest to attach. Starting Phase 1 before that means either re-screenshotting (double Playwright cost for images already captured) or attaching files that may not exist.

---

## Phase 1 — Generation-complete digest

**Goal:** one email per promoted design, carrying what was built and for whom.

1. Extract `notifyOwner()`'s enrichment-row rendering into `scripts/lib/email-rows.mjs`. Refactor `notifyOwner()` to use it and confirm the arrival email is byte-identical — this is the regression anchor.
2. `scripts/lib/delivery.mjs`: assemble the digest — final-pass screenshots (desktop + mobile) from `design_evidence`, `DESIGN.md` attached, name/accent/archetype inline, enrichment rows, links to the live route and library entry.
3. Downscale screenshots for email; link the library for full resolution.
4. Wire the promotion observer in `serve.mjs` (it already parses the `→ designs/<slug>` line and owns the serialized rebuild).
5. **Isolate failures**: no throw may escape into the generation path; failures log loudly and set `digest_status: failed` on the run doc. No silent `.catch(() => {})` — that is the exact defect being fixed in the sibling project.
6. Verify against a real generation on the droplet.

**Exit:** a promoted design produces one email with both viewports and `DESIGN.md`. Killing SMTP fails the digest and leaves the design promoted and live.

---

## Phase 2 — Proposal drafts in Drafts

**Goal:** an editable, sendable draft in Greg's real mail client.

1. `imap.mjs` → `appendDraft()`. Resolve the Drafts folder by SPECIAL-USE `\Drafts`, fall back to a configured name, then fail loudly. Never assume a literal folder name.
2. Compose MIME via `nodemailer` without sending; `APPEND` with the `\Draft` flag.
3. Idempotency on `(visitorEmail, generationRunId)` — record the append on the proposal thread and check before writing, so a re-run cannot stack duplicates.
4. Populate from the existing proposal thread (`proposal_text`, `client_email_draft`, `price_cents`); addressed to the visitor.
5. Extend `PROPOSAL_STATUSES` for the drafted state.
6. Resolve open question 1 (who qualifies — everyone, or CNA-complete only) and record the decision in the architecture doc.
7. Verify in the live Mailcow mailbox: the draft appears in Drafts, opens correctly in a real client, and sends without editing.

**Exit:** a qualified visitor produces exactly one draft, in the right folder, sendable as-is.

---

## Phase 3 — Auto-propose mode

**Goal:** unattended sending, safely, off by default.

> Do not start this phase until architecture open questions 1 **and** 2 are closed. Gating an auto-send on a `confidence` value that nothing currently emits is the worst version of this feature.

1. Define `delivery_settings` + `delivery_event` SSSS types (`tenant_private`); confirm both are absent from a `sale` bundle.
2. Define where `confidence` comes from (proposal self-scoring vs. derived from CNA completeness) — open question 2.
3. Implement the decision path. **Every failure mode degrades to `draft`**: unreadable settings, unparseable threshold, missing confidence, exceeded rate cap, kill switch set.
4. Rate cap enforced independently of the threshold.
5. Kill switch effective immediately, no restart.
6. Every auto-send writes a `delivery_event` with mode, confidence, threshold, rationale, recipient, and full sent body.
7. Admin endpoints for mode/threshold/cap/kill behind existing admin auth.
8. Notify Greg after each auto-send with exactly what went out.

**Exit:** default `draft` behaves exactly as Phase 2. In `auto`, an above-threshold proposal sends and is recorded; below-threshold drafts. The kill switch stops sending immediately.

---

## Phase 4 — Testing & verification

See the tracker. Every item is binary and evidenced in the Verification Log.

Key gates:
- `npm test` green; `npm run validate` green
- `node scripts/serve.mjs` boots natively before any deploy
- Export round-trip: `delivery_settings` + `delivery_event` **absent** from a `sale` bundle
- Failure isolation proven: SMTP down → design still promotes; IMAP down → digest still sends
- Auto-propose safety proven: threshold, rate cap, and kill switch each independently verified
- `/push` → `/deploy` protocol; update the `email`, `webmail`, and `documenso` skills to match shipped reality

---

## Rollout & flags

| Flag | Default | Phase |
|---|---|---|
| `DELIVERY_DIGEST` | `0` | 1 |
| `DELIVERY_DRAFTS` | `0` | 2 |
| `propose_mode` (SSSS setting, not env) | `draft` | 3 |

Auto-propose is deliberately **not** an env flag — the PRD requires switching modes without a deploy, and routing it through SSSS makes each change auditable.

## Dependencies

- **Blocks on:** `GENERATIVE_DESIGN_STUDIO` Phase 0 (durable evidence).
- **Shares `serve.mjs`** with `GENERATIVE_DESIGN_STUDIO` — coordinate if both run concurrently.
- **Live infrastructure**: SMTP2GO (sending) and Mailcow/Dovecot IMAP (drafts) are both production surfaces. Test against the real mailbox; a draft that only works in theory is not done.
