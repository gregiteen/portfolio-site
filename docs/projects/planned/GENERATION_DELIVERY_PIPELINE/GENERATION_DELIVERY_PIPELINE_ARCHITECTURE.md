# GENERATION_DELIVERY_PIPELINE — Architecture

> **Project Prefix**: `GENERATION_DELIVERY_PIPELINE`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

## Design principle

**Delivery is a detached consumer of promotion, never a step inside it.**

`compile-theme.mjs` ends in an atomic rename-based promotion with rollback on any failure, and deletes the staging root on both success and failure. That guarantee is the most valuable property in the pipeline and this project must not weaken it. So delivery does not run *inside* the generation transaction — it observes the promotion event afterwards. A dead SMTP host produces an undelivered digest, never a rolled-back design (PRD G5).

## Where this sits

```
compile-theme.mjs
  … gates … ──▶ atomic promotion ──▶ generation_run: promoted
                                            │
                                            │  (detached; failures isolated)
                                            ▼
                                   delivery-pipeline
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ▼                       ▼                       ▼
             digest email            proposal draft          auto-propose
             (SMTP → Greg)        (IMAP APPEND → Drafts)   (SMTP → visitor)
```

## Existing surface being reused

| Surface | File | Reused for |
|---|---|---|
| `notifyOwner()` + `emailShell()` | `serve.mjs` | Enrichment fields and email chrome — the digest matches the established visual language rather than inventing one |
| Render-audit screenshots | `render-audit.mjs` | Desktop 1440px + mobile 390px, already captured every run |
| `design_evidence` | `GENERATIVE_DESIGN_STUDIO` Phase 0 | Canonical source for screenshots; digest links to the library entry |
| Proposal thread | `serve.mjs`, `proposal-output.mjs` | `proposal_text`, `client_email_draft`, `price_cents` |
| `PROPOSAL_STATUSES` | `proposal-lifecycle.mjs` | Extended with the draft/auto states |
| SMTP transport | `serve.mjs` | Sending; note it is already wrapped (`originalSendMail`) — extend that wrapper, don't bypass it |
| IMAP client | `imap.mjs` | Connection; **APPEND is new** |
| Visitor profile | `runtime-store.mjs` | Enrichment + qualification |

> **Hard dependency:** R1 depends on `GENERATIVE_DESIGN_STUDIO` Phase 0. Today's screenshots are overwritten per pass and purged from `/tmp` at 10 days — there is no durable artifact to attach. Phase 0 must land first; the alternative is re-screenshotting, which doubles Playwright cost for images we already took.

## Component 1 — Digest email (R1)

New module `scripts/lib/delivery.mjs`.

**Trigger.** The `generation_run` transition to `promoted`. `serve.mjs` already parses `compile-theme`'s stdout for the `→ designs/<slug>` line and owns the serialized rebuild, so it is the natural observer — no new IPC.

**Assembly.**
- Screenshots: pull the **final** pass from `design_evidence`; downscale for email, link the library for full size
- `DESIGN.md`: attach verbatim; surface `name`, `accent`, `archetype` inline
- Visitor: reuse `notifyOwner()`'s field set — extract its row-rendering into a shared helper rather than copying markup, so the two emails cannot drift
- Links: live route + library entry

**Failure posture.** Wrapped so no throw escapes into the generation path. Failures log loudly and mark `digest_status: failed` on the run doc — silent failure is the specific defect this project is correcting elsewhere (`.catch(() => {})` in `render-audit.mjs`), so it must not be reintroduced here.

## Component 2 — IMAP draft (R2)

`imap.mjs` gains `appendDraft({ to, subject, html, text })`.

**Folder resolution.** Resolve Drafts via the SPECIAL-USE `\Drafts` attribute, never a hardcoded name — the literal string varies across servers and clients. Fall back to a configured name, then fail loudly.

**Message construction.** Build a proper MIME message and `APPEND` with the `\Draft` flag set. `nodemailer` can compose the MIME without sending, which avoids hand-rolling MIME.

**Idempotency.** One draft per `(visitorEmail, generationRunId)`. A re-run must not stack duplicate drafts in the folder — record the append on the proposal thread and check before writing.

## Component 3 — Auto-propose mode (R3)

**Setting as SSSS state, not an env var.** `propose_mode` (`draft` | `auto`), `confidence_threshold`, `rate_cap`, and `kill_switch` live in a `delivery_settings` SSSS document (`tenant_private`), read per decision. The PRD requires changing modes without a deploy, and it makes every change auditable through the Operation Contract.

**Decision path.**

```
proposal ready
   │
   ├─ kill_switch set? ────────────────▶ draft
   ├─ mode == 'draft'? ────────────────▶ draft
   ├─ confidence < threshold? ─────────▶ draft
   ├─ rate cap exceeded? ──────────────▶ draft
   └─ else ────────────────────────────▶ auto-send + notify Greg
```

Every branch except the last produces a draft. **Default is `draft` and every failure mode degrades to `draft`** — an unreadable settings doc, an unparseable threshold, or a missing confidence value all fall back to human review rather than to sending.

**Audit.** Each auto-send writes a `delivery_event` (`tenant_private`) with mode, confidence, threshold, rationale, recipient, and the full sent body. The PRD makes an unrecorded auto-send a metric failure (M5).

> This is the one part of this project that sends unattended mail to a third party on Greg's behalf. It is off by default, capped, killable, and fully recorded — and none of those are optional.

## New SSSS document types

| Type | Portability | Purpose |
|---|---|---|
| `delivery_settings` | `tenant_private` | `propose_mode`, threshold, rate cap, kill switch |
| `delivery_event` | `tenant_private` | One delivery: digest / draft / auto-send, with outcome and (for auto-sends) rationale + body |

Both are operational tenant data and must be **absent** from a `sale` bundle. Extends `PROPOSAL_STATUSES` in `proposal-lifecycle.mjs` rather than introducing a parallel status enum.

## Files touched

| File | Change |
|---|---|
| `scripts/lib/delivery.mjs` *(new)* | Digest assembly, draft creation, auto-propose decision |
| `scripts/lib/imap.mjs` | `appendDraft()` + SPECIAL-USE folder resolution |
| `scripts/lib/email-rows.mjs` *(new)* | Shared enrichment-row rendering, extracted from `notifyOwner()` |
| `scripts/serve.mjs` | Promotion observer → delivery; settings endpoints behind admin auth |
| `scripts/lib/proposal-lifecycle.mjs` | New statuses for drafted / auto-sent |
| `scripts/runtime-store.mjs` | `delivery_settings`, `delivery_event` |

## Open questions

1. **What qualifies a visitor for a proposal draft?** Everyone who generates, or only those who complete a CNA? Generating a site is a weaker intent signal than completing a consultation. *Leaning: CNA-complete only, since the proposal system is already CNA-driven and a draft per casual visitor is inbox noise.*
2. ~~**Where does `confidence` come from?**~~ **Resolved 2026-07-30 (Greg): confidence derives from the CNA.** A completed consultation is the qualification signal — depth and completeness of the CNA assessment produce the score, not proposal self-scoring (a model grading its own output is the weaker signal, and it would auto-send on its own optimism). Corollary: **no CNA ⇒ no confidence ⇒ always `draft`**, which also settles open question 1 — CNA-complete visitors are the ones who get a proposal draft at all.

   *Dependency this creates:* confidence is only as good as the CNA that produced it, and the CNA currently runs on `gemini-3.5-flash` (see Phase 0 in the dev plan). Migrating the CNA and proposal to a frontier model is therefore a **prerequisite** for auto-propose, not an enhancement alongside it.
3. **Digest batching.** One email per promotion is right at current volume. If generation volume rises, a daily rollup may be better. Not built now; noted so the trigger stays swappable.
