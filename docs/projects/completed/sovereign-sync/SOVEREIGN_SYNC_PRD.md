# Sovereign Sync — Product Requirements Document

> **Cross-repo project.** Work spans `portfolio-site` (this repo), `total-recall`
> (`~/Github/total-recall`), and operational work on the DigitalOcean droplet
> (`138.197.199.217`). This folder is the single source of truth for the plan;
> the total-recall repo gets a pointer doc only.

## 1. Problem Statement

Three verified failures motivated this project (diagnosed 2026-07-07):

1. **Stale runtime state on the droplet ("clown-car fossils").** The P0-P5
   clean slate happened only in git. Theme builds generated at runtime on the
   droplet are untracked, and the backend deploy (`rsync` **without**
   `--delete` per `.agent/skills/deploy/SKILL.md` Step 2) never removes them.
   Result: deleted themes resurrect, mixed-theme pages, duplicate
   `view-transition-name` errors, 404s.
2. **Runtime data is fragile.** `proposalThreads`, `pendingVisitEmails`, and
   `pendingCodes` are in-memory `Map()`s (`scripts/serve.mjs:131-146`) — an
   active client proposal negotiation dies on every `pm2 restart`, which every
   deploy triggers. Sessions and visitor profiles persist only to
   `.data/sessions.json` *inside the deploy tree*; generated designs, images,
   and `vault/visitors.md` also live inside the rsync target. A naive deploy
   fix (`--delete` without excludes) would destroy all of it.
3. **No visibility or control surface.** Greg cannot view visitors, proposals,
   or generated-design history anywhere except the live admin page (which dies
   with the process), and cannot approve proposals except by email reply.
   Total Recall — the sovereign memory system designed to hold exactly this
   kind of data — has no view into it, and its Files page is a read-only
   name/size/date table with no SSSS awareness, no filtering, no CRUD, no
   saved views.

## 2. Goals

- **G1 — Clean droplet, safe deploys.** Remove all fossil artifacts from the
  droplet; make the deploy skill idempotent (`--delete` with explicit
  runtime-data excludes) so repo deletions propagate and runtime data survives.
- **G2 — Durable runtime data as SSSS.** Every piece of runtime business data
  (visitor profiles, proposals, generation runs) becomes a typed SSSS document
  with the correct §5.5 portability class (`tenant_private`), so it survives
  restarts by construction and is *automatically excluded* from
  `template`/`sale` exports (IP + privacy protection).
- **G3 — Droplet ⇄ Total Recall sync bridge.** Total Recall periodically pulls
  a `backup`-profile `.ucw` bundle of the droplet's runtime vault and imports
  it as a registered brain. Approval decisions flow back down.
- **G4 — Total Recall as the SSSS data cockpit.** Upgrade Total Recall's file
  surface into a real SSSS document manager: frontmatter-aware listing,
  filtering by type/portability/tags/status, full file CRUD on the server,
  markdown document viewer, saved views, and a proposals approval inbox.
- **G5 — Verified, not claimed.** Every phase ends with executable checks;
  the project ends with an end-to-end scenario test (visitor → proposal →
  sync → approve in Total Recall → client email fires).

## 3. Non-Goals

- **No new hosting/CI.** Deploys remain rsync-over-ssh per the deploy skill
  ("Do not use GitHub actions").
- **No public exposure of Total Recall.** The bridge is strictly *pull* from
  Total Recall's side; the droplet never initiates connections to Greg's
  machine and never learns its address.
- **No relocation of the generation pipeline.** Theme generation stays on the
  droplet; generated designs/skins stay at their current paths (protected by
  rsync excludes + synced backups), not moved to a new data root. (Considered
  and rejected for this project: a `RUNTIME_DATA_DIR` relocation touches
  compile-theme/build-site/serve simultaneously and multiplies risk for the
  implementing agent. Revisit only if excludes prove insufficient.)
- **No SSSS spec changes.** Everything uses `@ssss/cli` v0.7.0 as pinned in
  both repos (`github:gregiteen/ssss#v0.7.0`). Custom types are added via an
  *extension registry* (the supported mechanism — see festech.json precedent),
  never by editing core.json.
- **No drip-campaign / DocuSign work.** Out of scope; belongs to the existing
  portfolio backlog.

## 4. Users & Stories

| As… | I want… | So that… |
|---|---|---|
| Greg (owner) | deploys that never resurrect deleted themes or destroy live data | I can ship without fear |
| Greg (owner) | proposals and visitor history to survive restarts | an active negotiation never dies mid-thread |
| Greg (owner) | to browse/filter/edit all portfolio SSSS docs inside Total Recall | one sovereign cockpit for all my data |
| Greg (owner) | to approve/revise/reject a proposal from Total Recall | I'm not limited to the email-reply loop |
| Visitor | my generated design and session to still exist when I return | the product promise ("come back and see it evolve") holds |
| Implementing agent | unambiguous file-level tasks with acceptance criteria | I can execute without re-deriving context |

## 5. Functional Requirements

### FR-A — Droplet hygiene & deploy safety (G1)
- A1. All pre-clean-slate artifacts removed from the droplet: stale entries in
  `/opt/portfolio-site/vault/pages/designs/`, `/opt/portfolio-site/designs/`,
  `/opt/portfolio-site/dist/site/`, and `/var/www/gregiteen.xyz/designs/`.
  Only Nostalgia + High Stakes Field Day remain as portfolio designs; only
  legitimately generated skins (e.g. super-mario) remain as flipper themes.
- A2. Deploy skill Step 2 uses `--delete` with an explicit, documented exclude
  list covering every runtime-data path (see Architecture §4.1).
- A3. `build-site.mjs` hardening: design-detail pages are built **only** for
  vault docs that are explicitly portfolio designs (allowlist on `x_kind`),
  so a stray runtime file can never again appear as portfolio content.
- A4. Live-site smoke check passes after cleanup (see Testing phase).

### FR-B — Runtime data as SSSS (G2)
- B1. A `portfolio` SSSS extension registry defines `visitor_profile`,
  `proposal`, and `generation_run` document primitives, all `tenant_private`.
- B2. `serve.mjs` writes/reads these as SSSS Markdown documents in a runtime
  vault section (`vault/runtime/…`) via a new `scripts/runtime-store.mjs`
  module; in-memory Maps become caches hydrated from disk at boot.
- B3. `pendingCodes` and `ipRateLimit` stay memory-only by design (ephemeral,
  security-sensitive); `pendingVisitEmails` timers are re-armed from persisted
  state at boot so a restart cannot swallow a deferred notification.
- B4. `npm test` still passes; a `sale`-profile export of the vault contains
  **zero** `vault/runtime/` documents (portability proof).

### FR-C — Sync bridge (G3)
- C1. Machine-auth path for the portfolio admin API: `Authorization: Bearer
  $ADMIN_API_TOKEN` (env, timing-safe compare) accepted wherever the admin
  cookie is, so Total Recall can call it headlessly.
- C2. `GET /api/admin/export-bundle` → `backup`-profile `.ucw.json` of the
  vault (runtime docs included). `GET /api/admin/export-assets` → tar.gz of
  generated `designs/` + `vault/pages/skins/` for binary/asset backup.
- C3. Total Recall pulls both on a schedule (default: every 30 min), validates
  the bundle, imports it idempotently into a dedicated local vault, and
  registers it so it appears in `/api/brains` and the dashboard.
- C4. `POST /api/admin/proposals/:id/decision` `{action: approve|revise|reject,
  notes?}` on the droplet applies Greg's decision: `approve` triggers the same
  send-to-client path as the email "send it" trigger; `revise` feeds notes to
  the existing AI iteration loop; `reject` closes the thread.
- C5. Sync is observable: last-sync timestamp, node counts, and failures are
  visible in Total Recall (log + API), and sync failures never crash the daemon.

### FR-D — Total Recall SSSS document manager (G4)
- D1. Server: SSSS-aware document API — list documents across a chosen brain
  with parsed frontmatter; filter by `type`, portability class, `status`,
  `tags`, `x_kind`, and free-text; read one document (raw + parsed); create,
  update, delete documents with path-traversal protection and schema
  validation on write; all behind existing PAT scopes.
- D2. UI: the Files page (or a new "Vault" page) becomes an SSSS browser:
  faceted filter sidebar (type / portability / status / tags), sortable
  document table showing frontmatter columns, click-to-open document viewer
  (rendered Markdown + frontmatter panel), edit mode with save, create-new
  (type-aware template), delete with confirm.
- D3. Saved views: a named filter+sort+columns preset can be saved, listed,
  applied, and deleted; persisted server-side so views survive reloads.
- D4. Existing read-only Storage/Skills/Scripts tabs keep working.

### FR-E — Approvals in Total Recall (G4+G3)
- E1. A "Proposals" surface lists synced `proposal` documents with status
  (`pending_approval`, `sent`, `rejected`, `revising`), client, company,
  revision count.
- E2. Approve / Request changes / Reject actions call the droplet decision
  endpoint (C4) and optimistically update the local node; the next sync pull
  reconciles authoritative state.

## 6. Success Criteria (project-level)

1. `curl https://gregiteen.xyz/designs/clown-car/index.html` → **404**, and no
   fossil URLs appear anywhere on the live site.
2. Deploy → `pm2 restart` → active proposal thread, visitor profiles, and
   sessions are all intact (scenario test in tracker Phase 5).
3. `npx ssss export vault --profile sale --show-dropped` drops every
   `vault/runtime/` doc; `--profile backup` includes them.
4. In Total Recall's dashboard: portfolio runtime docs are browsable,
   filterable by type/portability, editable, and a saved view persists.
5. A proposal approved in Total Recall results in the client receiving the
   proposal email from the droplet, with no email-reply step involved.
6. Both repos' test suites green: `npm test` (portfolio), `npx vitest run`
   (total-recall), plus `npx ssss conformance --engine` passes.

## 7. Constraints & Ground Rules

- **IP protection is load-bearing**: `tenant_private` classification is the
  mechanism that keeps customer data and Greg's private pipeline data out of
  sellable exports. Never ship runtime docs as `structural`.
- **Secrets never enter the vault or bundles**: no SMTP creds, API keys,
  auth tokens, or verification codes in any SSSS document. Session tokens
  stay in `.data/sessions.json` (excluded from sync).
- **CLI-first for Total Recall memory ops** (per Total Recall protocol); the
  new document-manager API is for *vault file* management and must route
  writes through the same validated-write path the server already uses.
- **Idempotency everywhere**: bundle import must be safely re-runnable
  (`ssss import` already is); the sync job must tolerate overlap/failure.
- **The implementing agent is less capable**: every task in the dev plan names
  exact files, functions, and verification commands. If reality diverges from
  a task's assumption, the task says what to check — divergences must be
  logged in the tracker, not silently improvised around.

## 8. Verified Baseline (what already exists — do not rebuild)

| Capability | Where | Status |
|---|---|---|
| Bundle lifecycle: `export/validate/inspect/provision/import`, profiles `backup/template/sale` | `@ssss/cli` v0.7.0 (both repos) | ✅ exists |
| Extension registry mechanism (custom types w/ portability) | `@ssss/cli` `registry/extensions/festech.json` precedent | ✅ exists |
| Memory-node CRUD REST API w/ scoped PAT auth | total-recall `src/server/routes/memory.mjs` | ✅ exists |
| Brains listing / project-brain registration | total-recall `/api/brains`, `total-recall brain register` | ✅ exists |
| Whole-brain tar.gz export | total-recall `/api/brain/export` | ✅ exists |
| Research queue REST API | total-recall `src/core/research-queue.mjs` + routes | ✅ exists |
| Session/profile persistence (atomic, debounced) | portfolio `scripts/serve.mjs:148-179` → `.data/sessions.json` | ✅ exists |
| Admin dashboard + `/api/admin/*` (cookie auth) | portfolio `scripts/serve.mjs:1193+`, `static/admin.html` | ✅ exists |
| SSSS-aware file browsing/filtering/CRUD in TR dashboard | total-recall `frontend/src/pages/FilesPage.tsx` | ❌ **gap** (read-only table) |
| Proposal persistence | portfolio `proposalThreads` Map | ❌ **gap** (memory-only) |
| Machine auth for portfolio admin API | portfolio `isAdmin()` `scripts/serve.mjs:488` | ❌ **gap** (cookie-only) |
| Droplet ⇄ TR sync | — | ❌ **gap** (does not exist) |
