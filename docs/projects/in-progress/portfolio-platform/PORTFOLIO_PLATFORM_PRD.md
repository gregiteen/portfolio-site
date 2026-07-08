# Portfolio Platform — Product Requirements Document

> **Combined project (2026-07-07).** This project merges the former
> `portfolio-platform` (P0–P5 feature build) and `sovereign-sync` (droplet
> hygiene, durable runtime data, Total Recall bridge) projects into ONE.
> Nothing from either project was dropped — see the Tracker for the full
> preserved history (discrepancy log, baseline records, phase status).
>
> **Cross-repo.** Work spans `portfolio-site` (this repo), `total-recall`
> (`~/Github/total-recall`), and ops on the DigitalOcean droplet
> (`138.197.199.217`). This folder is the single source of truth.

## Part I — The Product

### What This Is

An AI-powered interactive portfolio and lead-generation engine for Greg Iteen.
Visitors arrive at a splash page, choose a design style, verify their email,
and the site generates a bespoke visual skin of Greg's portfolio on the fly.
The generated design is a full standalone build — not a CSS toggle — and the
flipper lets visitors swap between generated designs by loading entirely
different HTML builds of the same page via View Transitions.

The design-generation gimmick is the hook. It captures visitor emails,
demonstrates technical capability, and funnels prospects toward an AI-powered
client needs assessment (CNA) that generates proposals. Runtime business data
(visitors, proposals, generation runs) is durable SSSS and syncs into Total
Recall, Greg's sovereign data cockpit.

### The Visitor Journey

#### 1. Splash Page (`static/splash.html`)
- Visitor enters a design style prompt (freeform text or preset chips)
- Visitor enters their email address
- Opt-in checkbox for the drip campaign (captured today as `optIn` on the
  visitor profile; **no drip engine exists yet — see FR-F**)
- Hits "Generate & Enter"
- **Generation starts IMMEDIATELY on submit** — the verification process is
  the mandatory delay that buys time for generation to complete
- Server sends a 6-digit verification code to their email
- Visitor info is enriched via cookies, browser data, and any other available
  signals — more context to include when emailing Greg

#### 2. Email Verification (`static/verify.html`)
- Visitor enters the verification code
- On success: `gi_auth` cookie is set (30-day TTL)
- By this time, generation should be complete (or nearly complete)
- **Home page loads in their bespoke generated design**

#### 3. Email Notification to Greg
- **If visitor does NOT proceed to CNA:** Greg is emailed with enriched
  visitor info when the visitor leaves (sendBeacon + 30-min fallback)
- **If visitor DOES proceed to CNA:** email is held until CNA is complete and
  a proposal is generated, so Greg receives the full picture (visitor info +
  needs analysis + proposal) — one email total

#### 4. Portfolio Experience
- The site renders Greg's real portfolio content (projects, about, contact,
  designs) in the visitor's generated visual skin
- **Flipper bar** at the top: visitor flips through all available generated
  designs; each flip loads a completely different standalone HTML build via
  `fetch()` + `document.startViewTransition()`
- **CNA banners** on all pages: persistent CTA driving prospects to the needs
  assessment
- **NO generator form anywhere in the portfolio** — generation ONLY happens
  via the splash page

#### 5. AI-Powered CNA (`static/consult.html`)
- Interactive AI-driven conversation conducting a client needs analysis
- Analyzes the prospect's needs against Greg's services, pricing ranges,
  timelines, and budget
- On completion: AI generates a proposal (client enrichment via email-domain
  analysis feeds it)
- Proposal is sent to Greg for approval (not auto-sent)
- **Feedback loop via email:** Greg reviews, replies with feedback, the AI
  iterates the proposal until finalized; "send it" triggers delivery to the
  client (CC Greg)
- **Also approvable from Total Recall** (Inbox → decision endpoint, see FR-C/E)
- Target end state: proposal rendered as a **PDF** and deliverable via an
  open-source DocuSign alternative (**not built yet — see FR-G**)

#### 6. Backend / Nurturing
- Cookie-based session persistence; returning users auto-redirect past splash
- Visitor profiles, proposals, and generation runs tracked as durable SSSS
  documents in `vault/runtime/` (tenant_private)
- Enriched visitor data (screen, timezone, language, referrer, platform,
  touch, company inference)
- **Email drip campaigns for lead nurturing (FR-F — to build)**

### Design Generation Pipeline

#### Critical Timing: Generation Starts on Submit, Not Verification
The verification process IS the generation buffer. When the visitor hits
"Generate & Enter":
1. Server kicks off theme generation immediately
2. Server sends verification code to visitor's email
3. Visitor retrieves the code — this takes 30–90 seconds
4. By the time verification completes, generation should be done (or home
   should be ready via lazy loading)

#### Required Pipeline

**Phase 1: Planning (automated, no manual review)**
1. LLM receives the style prompt + `baseContext` (includes frontend-design SKILL.md)
2. LLM produces a design plan: palette, typography, layout strategy, interactions
3. **Review gate:** LLM analyzes and improves its own plan before proceeding
4. LLM produces image-generation prompts

**Phase 2: Generation (maximum parallelization)**
1. **Immediately parallel:** image generation (logo, favicon, hero, portrait)
2. **First priority:** CSS + shell + home layout → **build and serve home immediately** (lazy load)
3. **Parallel batch:** remaining layout templates generated concurrently
4. **Review gate:** LLM reviews CSS + layouts for consistency with the plan

**Phase 3: Holistic Review (automated)**
1. All layouts assembled → LLM reviews the full design holistically
2. Scores quality, checks for inconsistencies, fixes issues
3. Final build of all remaining pages

#### Continuous Improvement (Cron)
- Daily job runs on **ALL** existing generated designs (3 AM)
- LLM analyzes, scores, generates an improved version of each
- If the improved version scores higher, swap it in; stop at quality plateau
- Model rotation (Gemini flash/pro, etc.) for fresh aesthetic perspectives
- Visitors can return to see their design evolve

#### Portfolio Promotion
- After a design reaches its optimal state, Greg can promote it to the
  portfolio (appears on the Designs index alongside real client work) via
  `promote-theme.mjs` / admin dashboard

### Content Architecture

#### Real Portfolio Content (Vault)

| Page | Vault Source | Output |
|------|-------------|--------|
| Home | `vault/pages/home.md` | `index.html` |
| About | `vault/pages/about.md` | `about.html` |
| Contact | `vault/pages/contact.md` | `contact.html` |
| Projects Index | *(derived)* | `projects.html` |
| Designs Index | *(derived)* | `designs.html` |
| Project Detail | `vault/pages/projects/*.md` | `projects/{slug}.html` |
| Design Detail | `vault/pages/designs/*.md` | `designs/{slug}.html` |

#### Projects

| Project | Featured | Tech |
|---------|----------|------|
| SSSS | Yes | Node.js, Open spec, Zero-dep |
| Total Recall | Yes | Node.js, Local embeddings, REST API, ssss |
| UltraChat | Yes | TypeScript, Express, Supabase, ssss |
| festech.live | Yes | Python, Flask, Automation |

#### Portfolio Designs (Real Client Work — `vault/pages/designs/`)

| Project | Client | Year |
|---------|--------|------|
| Nostalgia | Nostalgia Festival | 2026 |
| High Stakes Field Day | Sessions by Slim | 2026 |

#### Theme Skins (AI-Generated — NOT Portfolio)
AI-generated visual skins live in `vault/pages/skins/` (`x_kind: theme-skin`)
with builds under top-level `designs/<slug>/`. They must NEVER appear on the
Designs index; they are reachable via the flipper and standalone URLs only.

### The Core Contract

> The AI generates **structure** (CSS + HTML templates with `{{PLACEHOLDER}}`
> slots). The build script injects **content** (from the vault). These
> concerns must never cross.

---

## Part II — Sovereign Runtime & Sync

### Problem Statement (diagnosed 2026-07-07)

1. **Stale runtime state on the droplet ("clown-car fossils").** The P0–P5
   clean slate happened only in git. Runtime theme builds on the droplet were
   untracked, and the old backend deploy (rsync **without** `--delete`) never
   removed them. Result: deleted themes resurrected, mixed-theme pages,
   duplicate `view-transition-name` errors, 404s. **[Fixed in Phase 1 —
   verified live 404s + hardened deploy skill.]**
2. **Runtime data was fragile.** `proposalThreads`, `pendingVisitEmails`, and
   `pendingCodes` were in-memory Maps — an active client proposal negotiation
   died on every `pm2 restart`, which every deploy triggers. **[Fixed in
   Phase 2 — SSSS runtime store; pending final restart-durability scenario
   test.]**
3. **No visibility or control surface.** Greg couldn't view visitors,
   proposals, or generation history except on the live admin page, and could
   approve proposals only by email reply. Total Recall had no view into it.
   **[Built in Phases 3–4 — sync bridge + TR Vault/Inbox pages; pending
   end-to-end verification.]**
4. **Claimed-done ≠ verified.** The former master tracker marked P0–P5 all ✅
   with zero testing phase; sovereign-sync was moved to `completed/` without
   passing its testing gate. **This combined project exists to close that
   gap: every feature below is either verified or has an explicit build/test
   task.**

### Goals

- **G1 — Clean droplet, safe deploys.** No fossil artifacts; deploy skill
  idempotent (`--delete` with documented runtime-data excludes).
- **G2 — Durable runtime data as SSSS.** Visitor profiles, proposals, and
  generation runs are typed SSSS documents (`tenant_private`), surviving
  restarts by construction and auto-excluded from `template`/`sale` exports
  (IP + privacy protection).
- **G3 — Droplet ⇄ Total Recall sync bridge.** TR periodically pulls a
  `backup`-profile `.ucw` bundle of the droplet's runtime vault and imports
  it as a registered brain. Approval decisions flow back down.
- **G4 — Total Recall as the SSSS data cockpit.** SSSS document manager
  (faceted browse/filter/CRUD/saved views) + proposals approval inbox.
- **G5 — Verified, not claimed.** Every phase ends with executable checks;
  the project ends with an end-to-end scenario test (visitor → proposal →
  sync → approve in Total Recall → client email fires) AND verification of
  every formerly rubber-stamped P0–P5 feature.
- **G6 — Complete the funnel.** Build the genuinely missing pieces: drip
  campaign engine (FR-F), proposal PDF + e-sign delivery (FR-G).
- **G7 — Total Recall updates published.** All total-recall repo changes from
  this project are committed, pushed, and its suite is green.

### Non-Goals

- **No new hosting/CI.** Deploys remain rsync-over-ssh per the deploy skill
  ("Do not use GitHub actions").
- **No public exposure of Total Recall.** The bridge is strictly *pull* from
  TR's side; the droplet never learns Greg's machine address.
- **No relocation of the generation pipeline.** Theme generation stays on the
  droplet; generated designs/skins stay at current paths (protected by rsync
  excludes + synced backups). (`RUNTIME_DATA_DIR` relocation considered and
  rejected: touches compile-theme/build-site/serve simultaneously; revisit
  only if excludes prove insufficient.)
- **No SSSS spec changes.** Everything uses `@ssss/cli` v0.7.0 as pinned in
  both repos. Custom types via the extension-registry mechanism only.
- **Embedded Total Recall skills (`.agent/skills/total-recall/skills/`) are
  out of scope** — explicitly parked by Greg for a separate discussion.

> **Scope change vs old sovereign-sync PRD:** drip campaigns and the
> PDF/e-sign delivery were previously "out of scope, belongs to the portfolio
> backlog." The projects are now combined, so they are **in scope** (FR-F,
> FR-G) per Greg's directive (2026-07-07: "drip campaigns tested, the whole
> proposal creation stuff set up").

### Users & Stories

| As… | I want… | So that… |
|---|---|---|
| Greg (owner) | deploys that never resurrect deleted themes or destroy live data | I can ship without fear |
| Greg (owner) | proposals and visitor history to survive restarts | an active negotiation never dies mid-thread |
| Greg (owner) | to browse/filter/edit all portfolio SSSS docs inside Total Recall | one sovereign cockpit for all my data |
| Greg (owner) | to approve/revise/reject a proposal from Total Recall | I'm not limited to the email-reply loop |
| Greg (owner) | opted-in leads to receive a nurturing drip sequence | cold leads warm up without manual effort |
| Greg (owner) | finalized proposals as signable PDFs | clients can sign without friction |
| Visitor | my generated design and session to still exist when I return | "come back and see it evolve" holds |
| Prospect | a smooth CNA conversation that produces a real proposal | I know what working with Greg looks like |
| Implementing agent | unambiguous file-level tasks with acceptance criteria | I can execute without re-deriving context |

### Functional Requirements

#### FR-A — Droplet hygiene & deploy safety (G1) — *implemented, verified in Phase 1*
- A1. All pre-clean-slate artifacts removed from the droplet. Only
  Nostalgia + HSFD remain as portfolio designs; only legitimately generated
  skins (e.g. midnight-teal-art-deco-jazz-lounge) remain as flipper themes.
- A2. Deploy skill Step 2 uses `--delete` with an explicit, documented
  exclude list covering every runtime-data path (Architecture §4.1), with the
  anchored-pattern warning (leading `/` is load-bearing).
- A3. `build-site.mjs` hardening: design-detail pages built **only** for
  `x_kind: "design"` docs; fossil guard warns + ignores stray `x_kind: theme`.
- A4. Live-site smoke check passes (re-run in final Testing phase, T1).

#### FR-B — Runtime data as SSSS (G2) — *implemented, needs final durability test*
- B1. `vault-registry/extensions/portfolio.json` defines `visitor_profile`,
  `proposal`, `generation_run` — all `tenant_private`.
- B2. `scripts/runtime-store.mjs` owns the runtime vault (`vault/runtime/…`);
  serve.mjs Maps are caches hydrated at boot.
- B3. `pendingCodes` and `ipRateLimit` stay memory-only by design;
  `pendingVisitEmails` timers re-armed from persisted state at boot.
- B4. `npm test` green; `sale`-profile export contains **zero**
  `vault/runtime/` documents (portability proof, re-run in T3).

#### FR-C — Sync bridge (G3) — *implemented, needs end-to-end verification*
- C1. Machine auth: `Authorization: Bearer $ADMIN_API_TOKEN` (timing-safe)
  accepted wherever the admin cookie is.
- C2. `GET /api/admin/export-bundle` (backup-profile `.ucw.json`) and
  `GET /api/admin/export-assets` (tar.gz of `designs/` + skins).
- C3. Total Recall pulls both on a schedule (default 30 min), validates,
  imports idempotently, registers the brain (`/api/brains`).
- C4. `POST /api/admin/proposals/:id/decision` `{action, notes?}`:
  approve → same send-to-client path as "send it"; revise → AI iteration;
  reject → close. Idempotent re-approve.
- C5. Sync observable: `GET /api/sync/portfolio/status`; failures never crash
  the daemon.

#### FR-D — Total Recall SSSS document manager (G4) — *implemented, needs walkthrough re-verification*
- D1. Server: `/api/docs` list/filter (type, portability, status, tags,
  x_kind, free text) /read/create/update/delete with path-traversal
  protection, validated writes, PAT scopes.
- D2. UI: VaultPage — faceted sidebar, sortable table, viewer (rendered
  Markdown + frontmatter panel), edit/save, create (type-aware template),
  delete with confirm.
- D3. Saved views: named filter+sort+columns presets, persisted server-side.
- D4. Existing read-only Storage/Skills/Scripts tabs keep working.

#### FR-E — Approvals in Total Recall (G4+G3) — *implemented, needs E2E test (T5)*
- E1. Proposals surface lists synced `proposal` docs with status, client,
  company, revision count (`pending_approval` first).
- E2. Approve / Request changes / Reject call the droplet decision endpoint
  via a server-side proxy (browser never holds the droplet token);
  optimistic update; next sync reconciles.

#### FR-F — Drip campaign engine (G6) — **NOT BUILT**
- F1. A `drip_campaign` definition (sequence of emails: delay, subject,
  template) lives as SSSS structural content; per-visitor drip **state**
  (enrolled campaign, step, next_send_at, completed/unsubscribed) lives on
  the `visitor_profile` doc (tenant_private).
- F2. Enrollment: verified visitors with `optIn: true` are enrolled in the
  default nurture campaign; visitors who complete a CNA are moved to a
  post-proposal sequence (or paused while a proposal is active).
- F3. Scheduler in serve.mjs (same pattern as the 3 AM improvement cron)
  sends due drip emails via the existing SMTP path; sends survive restarts
  (state persisted, timers derived from `next_send_at`, not in-memory).
- F4. Every drip email contains a working one-click unsubscribe link
  (`/api/unsubscribe?token=…`); unsubscribes are honored immediately and
  persisted.
- F5. Admin dashboard shows drip status per visitor and allows
  pause/resume/unenroll.
- F6. Tested: a compressed-schedule test campaign (minutes, not days) runs
  end-to-end against a real inbox, including restart-survival mid-sequence
  and unsubscribe.

#### FR-G — Proposal PDF + e-sign delivery (G6) — **NOT BUILT**
- G1. Finalized proposals render to a professional PDF (server-side; pick the
  lightest dependency that produces acceptable output).
- G2. "Send it" / TR-approve attaches the PDF to the client email (current
  inline-text email becomes the cover).
- G3. E-sign via an open-source DocuSign alternative (e.g. Documenso /
  Docuseal — evaluate, pick one, self-host or defer hosting decision to
  Greg). Client receives a signing link; signed status lands back on the
  proposal doc.
- G4. May ship in two steps: PDF first (G1–G2), e-sign second (G3) — PDF is
  the gate for calling proposals "set up."

#### FR-H — Publication & verification of Total Recall work (G7)
- H1. All total-recall changes from Phases 3–4 committed and pushed to
  `gregiteen/total-recall` `main`; `npx vitest run` shows no new failures.
- H2. A real pointer doc exists in the total-recall repo
  (`docs/projects/…/PORTFOLIO_PLATFORM_POINTER.md`) linking here and listing
  every total-recall file this project added/changed. (The previously claimed
  pointer doc was fabricated — an 81-byte stub in the wrong repo, since
  deleted.)

### Success Criteria (project-level)

1. No fossil URLs anywhere on the live site
   (`curl …/designs/clown-car/index.html` → 404); flipper works; designs
   index shows exactly Nostalgia + HSFD. *(verified once; re-verified in T1)*
2. Deploy → `pm2 restart` → active proposal thread, visitor profiles,
   sessions, **and pending drip sends** all intact (T2).
3. `npx ssss export vault --profile sale --show-dropped` drops every
   `vault/runtime/` doc; `--profile backup` includes them (T3).
4. In Total Recall: portfolio runtime docs browsable, filterable, editable;
   a saved view persists (T4/walkthrough).
5. A proposal approved in Total Recall results in the client receiving the
   proposal email (with PDF once FR-G lands) from the droplet, no email-reply
   step involved (T5).
6. A test drip campaign completes end-to-end against a real inbox, surviving
   a restart mid-sequence; unsubscribe works (T-drip).
7. The full CNA path works on production: conversation → enrichment →
   proposal → Greg email → revise → send → client email (T-cna).
8. Both repos green: `npm test` (portfolio), `npx vitest run` (total-recall),
   `npx ssss conformance --engine`; total-recall work pushed (FR-H).

### Constraints & Ground Rules

- **IP protection is load-bearing:** `tenant_private` classification keeps
  customer data and Greg's private pipeline data out of sellable exports.
  Never ship runtime docs as `structural`. Designs are proprietary — no
  design-spec download endpoints.
- **Secrets never enter the vault or bundles:** no SMTP creds, API keys,
  auth tokens, or verification codes in any SSSS document. Session tokens
  stay in `.data/sessions.json` (excluded from sync and rsync).
- **CLI-first for Total Recall memory ops**; the document-manager API is for
  *vault file* management and routes writes through the validated-write path.
- **Idempotency everywhere:** bundle import safely re-runnable; sync job
  tolerates overlap/failure; decision endpoints idempotent.
- **Never auto-commit.** Committing is a separate, intentional act Greg
  requests explicitly — never a side effect of deploying or finishing a task.
- **Never run tsc/typecheck directly** — use the code-quality skill scripts.
- **The implementing agent is less capable:** every task names exact files,
  functions, and verification commands. Divergences go in the Discrepancy
  Log, never silently improvised around.

### Verified Baseline (what exists — do not rebuild)

| Capability | Where | Status |
|---|---|---|
| Bundle lifecycle (`export/validate/inspect/provision/import`, profiles) | `@ssss/cli` v0.7.0 (both repos) | ✅ exists |
| Extension registry (`vault-registry/` + `scripts/sync-registry.mjs`) | portfolio | ✅ built (Phase 2) |
| Runtime store (visitors/proposals/runs, debounced atomic writes) | portfolio `scripts/runtime-store.mjs` | ✅ built (Phase 2) |
| Bearer machine auth + export/decision endpoints | portfolio `scripts/serve.mjs` | ✅ built (Phase 3) |
| Sync job + status | total-recall `src/core/portfolio-sync.mjs` | ✅ built (Phase 3) — **committed + pushed** to `origin/main` (audit 0.5, 2026-07-08) |
| Docs API + saved views + VaultPage + InboxPage | total-recall | ✅ built (Phase 4) — **committed + pushed** to `origin/main` (audit 0.5; files are `.tsx`) |
| Hardened deploy skill (`--delete` + anchored excludes) | `~/.agent/skills/deploy/SKILL.md` (canonical, symlinked) | ✅ rewritten + verified |
| Memory-node CRUD REST API w/ scoped PAT auth | total-recall `src/server/routes/memory.mjs` | ✅ pre-existing |
| Session/profile persistence (atomic, debounced) | portfolio `serve.mjs` → `.data/sessions.json` | ✅ pre-existing |
| Admin dashboard + `/api/admin/*` | portfolio `static/admin.html` + serve.mjs | ✅ built (P4) — **verified live** (1.8, 2026-07-08) |
| CNA chat + proposal generation + email loop | portfolio `static/consult.html` + serve.mjs | ✅ built (P3) — **verified live** (1.6/1.7, 2026-07-08; 3 JSON-parse bugs fixed) |
| Visitor enrichment + deferred notification | portfolio serve.mjs | ✅ built (P3) — **verified live** (1.5, 2026-07-08) |
| Drip campaign engine | — | ❌ **does not exist** (FR-F) |
| Proposal PDF / e-sign delivery | — | ❌ **does not exist** (FR-G) |
| Total-recall pointer doc | — | ❌ fabricated previously; must be created (FR-H2) |
