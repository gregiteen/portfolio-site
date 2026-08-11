# GENERATION_DELIVERY_PIPELINE — Project Tracker

> **Project Prefix**: `GENERATION_DELIVERY_PIPELINE`
> **Kanban State**: 📋 Planned
> **Author**: Greg Iteen + Claude
> **Date**: 2026-07-30

---

> **Unblocked 2026-07-31.** `GENERATIVE_DESIGN_STUDIO` Phase 0's core plumbing landed — `design_evidence` docs + `evidence-library/<slug>/<runId>/` now persist every pass's screenshots durably. The library-view UI and admin exposure are still open in that tracker, but they aren't required for Phase 1 here: `scripts/lib/evidence-store.mjs`'s `listEvidenceForSlug()` is enough to pull the final pass programmatically for the digest.

## ⏳ Phase 0: Frontier model migration for CNA + proposal (prerequisite)

Goal: the two documents that convert a stranger into money stop running on the cheapest available model — on a provider that is out of budget.

**Finding (2026-07-30).** `geminiCall()` in `serve.mjs` hardcodes `gemini-3.5-flash` via `generativelanguage.googleapis.com` with `GOOGLE_API_KEY`, and it powers all three revenue-path calls: the **CNA consultation** (L2283), **proposal generation + repair** (L885/889), and **visitor enrichment** (L2500/2960). This violates the standing rule to avoid the Google Generative Language API while that budget is exhausted. The theme pipeline already migrated to OpenRouter (`scripts/lib/openrouter.mjs`); `serve.mjs` never did.

- [x] **WebSearch confirmed (2026-07-30)** — both candidates live on OpenRouter. `anthropic/claude-opus-5`: $5/M in, **$25/M out**, 1M ctx, 128K max out (released 2026-07-24). `openai/gpt-5.6-sol`: $5/M in, **$30/M out**, 1.05M ctx, 128K max out (released 2026-07-09). Note: the in-repo model list was stale and named neither — training data is not a source for provider facts.
- [x] **Selected: `anthropic/claude-opus-5`** for proposal + CNA. Rationale: (1) proposals are output-heavy — full HTML proposal + client email + price — and Opus 5 undercuts Sol by $5/M on exactly that axis; (2) its low/medium/high effort toggle maps directly onto the `reasoningEffort` param `buildOpenRouterBody()` already sends, so we can run proposals at high and cheaper calls at low without new plumbing; (3) it is documented as the most aligned Opus and least susceptible to misuse, which matters specifically because auto-propose sends unattended mail to strangers under Greg's name; (4) Sol's headline strengths are coding/agentic/cybersecurity, not persuasive business writing. Revisit if proposal quality disappoints — `openai/gpt-5.6-sol` is the fallback.
- [x] Route proposal generation + repair through `callOpenRouter` at `reasoningEffort: 'high'` — `generateDelimitedProposal()` in `serve.mjs` rewritten; drops the `GOOGLE_API_KEY` param entirely, resolves the OpenRouter key internally
- [x] Route the CNA consultation through the same path — confidence derives from it, so its quality gates auto-propose. `/api/cna` rebuilt from a raw `https.request` against `generativelanguage.googleapis.com` to `callOpenRouter` with OpenAI-shaped `messages` (system + user/assistant turns) at `reasoningEffort: 'medium'`
- [x] Make the model configurable per call site (`PROPOSAL_MODEL`, `CNA_MODEL`) rather than one global `DEFAULT_MODEL` — both default to `anthropic/claude-opus-5`, both env-overridable
- [x] **Decide the enrichment path** — **kept on Gemini as a deliberate exception.** It uses Gemini's native `googleSearch` grounding, which OpenRouter does not replicate, and this project's mandate was to fix the revenue-path *decision-making* calls (CNA, proposal), not to solve grounding parity. Documented inline at the enrichment call sites in `serve.mjs`. Enrichment failure (including a missing `GOOGLE_API_KEY`) now degrades to a minimal `{ company_name, industry }` object instead of blocking proposal generation — previously a missing key failed the *entire* generation, proposal included.
- [ ] Verify OpenRouter key resolution works on the droplet (Total Recall secrets store — already proven for `FAL_KEY`)
- [x] Preserve the delimiter-contract repair path (`parseProposalOutput`, `requireChanges`) across the migration — unchanged; only the call underneath swapped from `geminiCall` to `callOpenRouter`
- [ ] Verify: a real CNA → proposal round-trip produces materially better output than the Flash baseline; keep both for comparison
- [x] Verify: no remaining `generativelanguage.googleapis.com` call on the CNA/proposal revenue path — confirmed via grep; the only two remaining `geminiCall()` sites are the two enrichment calls, which are the documented exception above

## ✅ Phase 1: Generation-complete digest

Goal: one email per promoted design, carrying what was built and for whom.

- [x] Extract `notifyOwner()` enrichment rows into `scripts/lib/email-rows.mjs`; confirm the arrival email stays byte-identical — `parseUserAgent`/`enrichmentRow`/`renderVisitorEnrichmentHtml` extracted verbatim; `notifyOwner()` now calls the shared helper; spot-checked output length/content, `npm test` unaffected
- [x] `scripts/lib/delivery.mjs` — assemble digest from `design_evidence` final pass — `assembleDigest()` picks the highest `approved` pass (falls back to highest pass overall for a pass-cap promotion), pulls its screenshots via `evidence-store.mjs`
- [x] Attach `DESIGN.md`; surface name / accent / archetype inline — read from `designs/<slug>/DESIGN.md` frontmatter; `archetype` defaults to `default-editorial` since GDS Phase 1 archetypes don't exist yet
- [x] Attach desktop 1440px + mobile 390px screenshots, downscaled for email — via `sharp`, inlined by `cid` (640px/320px width, quality 72)
- [ ] Link the live design route and the asset-library entry — live route linked; library entry link is `null` until the GDS library-view page exists (tracked there)
- [x] Wire promotion observer in `serve.mjs` (reuse the existing `→ designs/<slug>` stdout parse) — same `child.on('close')` success branch that already captures `genSlug`
- [x] Isolate failures — no throw escapes into the generation path; log loudly and set `digest_status` on the run doc — `sendGenerationDigest()` try/catches around the whole assemble+send, writes `digest_status: sent|sent_no_evidence|failed` (+ `digest_error`) via an extended `appendRun()` that preserves the field across later status writes
- [x] Confirm no silent `.catch(() => {})` was introduced anywhere in the delivery path — `evidence-store.mjs` warns on write failure instead of swallowing it (same fix applied to `render-audit.mjs`'s old tmpdir write)
- [ ] Verify: real droplet generation produces one digest with both viewports + `DESIGN.md` — proven with a synthetic fixture locally (real screenshot bytes, real `DESIGN.md`, real SSSS write/read round-trip via `recordEvidence`/`assembleDigest`); a live droplet generation is still needed to confirm against a real render-audit pass and real SMTP2GO delivery
- [ ] Verify: SMTP down → digest fails, design still promotes and stays live — logically true (digest fires strictly after promotion, in its own try/catch) but not exercised against a real SMTP outage
- [x] Shipped behind `DELIVERY_DIGEST` env flag, default off, per the dev plan's rollout table — set `DELIVERY_DIGEST=1` to enable

## ⏳ Phase 2: Proposal drafts in Drafts

Goal: an editable, sendable draft in Greg's real mail client.

- [x] `imap.mjs` → `appendDraft({ to, subject, html, text })` — composes via `nodemailer`'s `MailComposer` (never sends), then `client.append(draftsPath, mime, ['\\Draft'])`
- [x] Resolve Drafts by SPECIAL-USE `\Drafts`; configured fallback; fail loudly — never assume a folder name — `resolveDraftsMailbox()`: `client.list()` → find `specialUse === '\\Drafts'` → fall back to `IMAP_DRAFTS_FOLDER`/`'Drafts'` by path or name → throws a specific error naming both attempts if neither exists
- [x] Compose MIME via `nodemailer` without sending; `APPEND` with the `\Draft` flag — verified standalone: `MailComposer.compile().build()` produces valid RFC822 MIME (headers, boundary, multipart/alternative) with no network call
- [x] Idempotency on `(visitorEmail, generationRunId)` — no duplicate drafts on re-run — implemented as `proposal.draftAppended`/`draftAppendedAt` on the proposal thread itself (the proposal *is* keyed to one visitor's one CNA-derived request, so the proposal id already is the idempotency key); `draftProposalToClientMailbox()` no-ops if already set
- [x] Populate from the existing proposal thread (`proposal_text`, `client_email_draft`, `price_cents`) — draft body reuses `client_email_draft` + the live `/proposal/<id>` link, same pattern as `sendProposalToClient()`'s client email; `proposal_text`/`price_cents` stay in the interactive web proposal, not duplicated into the draft body
- [x] Extend `PROPOSAL_STATUSES` in `proposal-lifecycle.mjs` for the drafted state — added `'drafted'`, positioned before `'sent'`; distinct from `'sent'` (this app's own SMTP already delivered it) since a draft hasn't left the building until Greg opens his mail client and hits send
- [x] **Resolve open question 1** — who qualifies (all visitors vs. CNA-complete only); record the decision in the architecture doc — moot in practice: the `/api/proposal` handler that creates every proposal thread *requires* a completed CNA `assessment` object to reach this code path at all, so "CNA-complete only" was already true structurally before this phase existed. Recorded here rather than in the architecture doc since there was no decision to make, only an observation to confirm.
- [ ] Verify in the live Mailcow mailbox: appears in Drafts, opens correctly in a real client, sends without editing — **not verified**; needs real `IMAP_USER`/`IMAP_PASS` against `mail.gregiteen.xyz`, which this machine doesn't have. Locally confirmed: (1) `appendDraft()` fails loudly and specifically with no credentials — not a silent no-op — and (2) `MailComposer` alone produces valid MIME.
- [ ] Verify: IMAP down → draft fails, digest and generation both unaffected — logically true (`draftProposalToClientMailbox()` is wrapped in its own try/catch in the `/api/proposal` handler and never blocks the existing reply-to-approve email below it), not exercised against a real outage
- [x] Shipped behind `DELIVERY_DRAFTS` env flag, default off, per the dev plan's rollout table

## ⏳ Phase 3: Auto-propose mode

Goal: unattended sending, safely, off by default.

> Do not start until architecture open questions 1 **and** 2 are both closed.

- [x] **Open question 2 resolved (Greg, 2026-07-30): confidence derives from the CNA**, not proposal self-scoring. No CNA ⇒ always `draft`. This also resolves open question 1 — CNA-complete visitors are the ones who get a draft.
- [x] Define the CNA → confidence scoring function (which assessment fields, what weighting, what threshold shape) — **shipped as an explicit placeholder**, not a validated formula: `confidenceFromAssessment()` in `scripts/lib/delivery-decision.mjs` scores the fraction of the 9 CNA fields (`project_type`…`target_audience`) that look substantively filled (length ≥ 4, not a stopword like "unknown"/"TBD"). Documented inline as needing real scrutiny before anyone raises the threshold or flips `propose_mode` to `auto` in production — it's safe to ship now only because `propose_mode` defaults to `'draft'`, which never reads confidence at all.
- [x] Gate on Phase 0 — a confidence score derived from a Flash-quality CNA is not trustworthy enough to auto-send on — satisfied: Phase 0 (this tracker's own) already moved the CNA to `anthropic/claude-opus-5` before this phase started
- [x] Define `delivery_settings` + `delivery_event` SSSS types (`tenant_private`) — added alongside `design_evidence`/`design_critique` in the same registry edit
- [x] Implement the decision path; **every failure mode degrades to `draft`** — `decideProposalDelivery()` in `delivery-decision.mjs`, unit-verified standalone against all 5 branches (kill switch, draft mode, below threshold, rate cap, above threshold) plus malformed input (`null` settings, missing confidence) — every case resolved to `draft` except the one valid `auto` case
- [x] Rate cap enforced independently of the confidence threshold — `countRecentAutoSends()` counts `delivery_event` docs with `kind: auto_propose, outcome: sent` inside `rate_cap_window_ms`, checked as its own branch regardless of confidence
- [x] Kill switch effective immediately, no restart — `delivery_settings` is read fresh from the vault on every `routeProposalDelivery()` call, no cached/in-memory copy to go stale
- [x] Every auto-send writes a `delivery_event` with mode, confidence, threshold, rationale, recipient, full sent body — `recordDeliveryEvent()` called on all three outcomes (`auto_propose sent`, `auto_propose failed`→falls back to draft, `draft drafted`)
- [x] Admin endpoints for mode / threshold / cap / kill behind existing admin auth — `GET/POST /api/admin/delivery-settings`, `GET /api/admin/delivery-events`, both under the existing `isAdmin(req)` gate; **live-verified against a running `serve.mjs`**: GET returns defaults, POST persists a patch and the change is immediately visible on re-GET, unauthenticated request gets 403
- [ ] Notify Greg after each auto-send with exactly what went out — not built; `recordDeliveryEvent` captures the full body for audit, but no email-to-Greg fires on an auto-send yet
- [x] Verify: default `draft` mode behaves identically to Phase 2 — `decideProposalDelivery` with default settings always returns `{action:'draft', reason:'mode_draft'}`, so `routeProposalDelivery()` always falls through to the same `draftProposalToClientMailbox()` Phase 2 built
- [x] Verify: below-threshold proposal drafts instead of sending — unit-verified (see decision-path bullet above)
- [x] Verify: rate cap blocks an above-threshold send once exceeded — unit-verified (see decision-path bullet above)
- [ ] Verify: kill switch stops sending immediately, mid-run — verified as a pure decision-path branch (kill switch checked first, unconditionally); not exercised as a live "flip it while a send is in flight" race
- [x] Shipped inert-by-default: `propose_mode: 'auto'` requires an explicit admin POST; nothing in this session's work enables auto-sending on its own

## ⏳ Phase 4: Testing & verification

Goal: prove it, don't assert it. Every box needs a Verification Log entry.

- [x] `npm test` green — 113/113, `node --test`
- [x] `npm run validate` (`ssss conformance --engine`) green — 23/23 fixtures, 8/8 runtime checks, 6/6 bundle/provisioning checks
- [x] Code-quality skill flow clean (no tsc/eslint in this repo) — this repo's `code-quality` skill IS the syntax scan + SSSS conformance + test suite (no separate tsc/eslint step exists here); covered by the two items above
- [x] Export round-trip: `delivery_settings` + `delivery_event` **absent** from a `sale` bundle — verified live: committed one real instance of all four new `tenant_private` types (`design_evidence`, `design_critique`, `delivery_settings`, `delivery_event`) via `engine.processOperation`, ran `npm run export` (profile `sale`), inspected with `npx ssss inspect --files` — none of the four appear in the 16-file bundle (only `assistant`/`banner_offer`/`drip_campaign`/`page`/`rule`/`workflow` structural primitives do); fixture docs and the bundle were deleted afterward, vault left clean
- [x] `node scripts/serve.mjs` boots natively without crashing — **before** any deploy — booted, all daemons started (Watcher, Sessions, Runtime, Calendar, Documenso poller, Cron, Drip scheduler), no exceptions, clean shutdown
- [ ] Failure isolation: SMTP down → design promotes; IMAP down → digest still sends — true by code structure (both delivery calls fire strictly after promotion, each in its own try/catch that only logs) but not exercised against a real outage from this machine
- [ ] Auto-propose safety: threshold, rate cap, kill switch each independently verified — threshold and rate cap are unit-verified (Phase 3); the kill-switch **mid-flight race** (flipping it while a send is in progress) is not exercised live
- [ ] End-to-end on the droplet: visitor generates → digest arrives → draft in Drafts → send works — needs the droplet; no `IMAP_USER`/`IMAP_PASS` or live generation environment on this machine
- [ ] Deploy via `/push` → `/deploy` protocol — not run this session; deploying is a separate, explicit action from finishing the code
- [x] Update `email`, `webmail`, and `documenso` skills to match shipped reality — see Verification Log; `webmail` skill's `imap.mjs` export list and Drafts-folder note updated, `email`/`documenso` skills reviewed and left as-is (neither describes generation-digest or auto-propose surfaces, so nothing there was stale)
- [ ] Strip verified phase flags; file the rest as tracked cleanup — premature: `DELIVERY_DIGEST`/`DELIVERY_DRAFTS` are rollout flags meant to stay off until the droplet items above are proven live, not until local tests pass
- [ ] Archive to `completed/`, extracting unchecked items to `DEFERRED_BACKLOG.md` — **cannot honestly do yet**: per the project-management skill's own archival rule, a project can't move to `completed/` while its testing phase has unchecked boxes, and five boxes above genuinely require droplet/Mailcow access this machine doesn't have

---

## Verification Log

- 2026-07-30: Surface audit — `notifyOwner()` already assembles enrichment (email, style, IP, browser, OS, screen, timezone, language, referrer, platform, touch, CNA assessment). Fires on **visitor arrival**, not generation completion.
- 2026-07-30: `imap.mjs` exports confirmed — `getImapClient`, `refreshImapPassword`, `fetchInbox`, `startImapPoller`. **No APPEND**; draft creation is genuinely new work.
- 2026-07-30: Proposal thread confirmed to carry `proposal_text`, `client_email_draft`, `price_cents`, revision loop, and a reply-"send it" release step — i.e. a manual propose mode already exists; auto-propose is a toggle on this machine, not a new system.
- 2026-07-30: `render-audit.mjs` already captures desktop 1440px + mobile 390px across 5 pages every run — the responsive assets exist and are currently discarded.
- 2026-07-31: Phase 0 code landed — `serve.mjs` CNA endpoint and `generateDelimitedProposal()` both migrated to `callOpenRouter`/`anthropic/claude-opus-5`; enrichment left on Gemini deliberately. `node scripts/serve.mjs` boots clean (verified natively per standing rule, not via deploy.sh). `npm test` 113/113 green. Remaining: droplet-side OpenRouter key resolution check and a real CNA→proposal round-trip comparison against the Flash baseline — both need the live droplet, not local.
- 2026-07-31: Phase 4 verification pass — full suite green together after all of Phase 0-3's changes: `npm test` 113/113, `npm run validate` (23/23 conformance fixtures, 8/8 runtime checks, 6/6 bundle/provisioning checks). Export round-trip specifically re-run against this repo's own new types (not just the reference fixtures): committed one real `design_evidence`, `design_critique`, `delivery_settings`, and `delivery_event` document via `engine.processOperation`, exported a `sale` bundle, confirmed via `npx ssss inspect --files` that none of the four appear in the 16-file output (only `assistant`/`banner_offer`/`drip_campaign`/`page`/`rule`/`workflow` did) — fixtures and bundle deleted afterward. `node scripts/serve.mjs` re-booted natively, clean start of all daemons, clean shutdown. Updated the `webmail` skill's file map to reflect `imap.mjs`'s new `appendDraft`/`resolveDraftsMailbox` responsibility (no longer purely legacy). Pre-existing, unrelated finding surfaced by the export inspect: `campaigns/*.md` declare `type: drip_campaign`, which the registry doesn't recognize (2 integrity errors) — not introduced by this project, flagged for separate follow-up, not fixed here to keep this session's diff scoped.
- 2026-07-31: Five checklist items remain genuinely open and require infrastructure this machine doesn't have: live SMTP/IMAP outage isolation, a live kill-switch mid-send race, droplet OpenRouter key resolution + real CNA/proposal quality comparison, live Mailcow Drafts verification, and a full end-to-end droplet run. Per the project-management skill's archival rule, the project stays in `planned/` rather than being force-moved to `completed/` — the gap is infrastructure access, not unfinished code.

---

## Out of scope (do not drift into these)

- Rewriting the proposal generator or its revision loop.
- Replacing the visitor-arrival email — arrival and completion are different events; both stay.
- Standing up new mail infrastructure. SMTP2GO + Mailcow are already production.
- Sending anything to a visitor without Greg's action, except explicitly in auto-propose mode.
