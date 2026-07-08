# Sovereign Sync — Architecture

Companion to `SOVEREIGN_SYNC_PRD.md`. All file:line references verified on
2026-07-07 against `portfolio-site@bfc0216` and the local `total-recall`
working tree. **If a referenced line has drifted, search for the quoted symbol
instead of trusting the number.**

## 1. System Overview

```
┌─────────────────────────── DigitalOcean droplet 138.197.199.217 ──────────────────────────┐
│                                                                                            │
│  nginx  →  /var/www/gregiteen.xyz/          (static, rsync --delete from dist/site/)       │
│  pm2    →  /opt/portfolio-site/scripts/serve.mjs   ("portfolio" process)                   │
│                                                                                            │
│  /opt/portfolio-site/                                                                      │
│    vault/                      ← SSSS vault (structural content + NEW runtime/ section)    │
│      pages/…                     structural (portfolio content)                            │
│      runtime/visitors/*.md      NEW  tenant_private  visitor_profile                       │
│      runtime/proposals/*.md     NEW  tenant_private  proposal                              │
│      runtime/runs/*.md          NEW  tenant_private  generation_run                        │
│    vault-registry/              NEW  registry dir (core copy + extensions/portfolio.json)  │
│    designs/<slug>/…             runtime-generated theme builds + images (rsync-excluded)   │
│    vault/pages/skins/*.md       runtime-generated skins (rsync-excluded)                   │
│    .data/sessions.json          tokens+profile cache (rsync-excluded, never synced)        │
│                                                                                            │
│  Admin API (cookie OR Bearer ADMIN_API_TOKEN):                                             │
│    GET  /api/admin/export-bundle        → .ucw.json  (ssss export --profile backup)        │
│    GET  /api/admin/export-assets        → tar.gz     (designs/ + skins/)                   │
│    POST /api/admin/proposals/:id/decision                                                  │
└───────────────▲────────────────────────────────────────────┬───────────────────────────────┘
                │ pull (HTTPS, Bearer token)                 │ decisions (HTTPS, Bearer token)
                │                                            ▼
┌─────────────── Greg's machine — Total Recall server (never publicly exposed) ──────────────┐
│                                                                                            │
│  scheduler job "portfolio-sync" (every 30 min):                                            │
│    1. GET export-bundle → validate (@ssss/cli) → ssss import → ~/.agent/tenants/           │
│       portfolio-site/vault/   (idempotent replay)                                          │
│    2. GET export-assets → ~/.agent/tenants/portfolio-site/assets/<date>.tar.gz (keep 7)    │
│    3. write sync-status JSON (last run, node counts, errors)                               │
│                                                                                            │
│  REST additions:   /api/docs/*  (SSSS document manager: list/filter/read/write/delete)     │
│                    /api/views/* (saved views)                                              │
│                    /api/sync/portfolio/* (status, trigger, proposal decision proxy)        │
│  Dashboard:        Vault browser (faceted SSSS docs) · Proposals inbox · existing pages    │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Direction of trust:** Total Recall is always the HTTP client. The droplet
holds no Total Recall address or credential. The only new droplet secret is
`ADMIN_API_TOKEN` in `/opt/portfolio-site/.env`.

## 2. Current State (verified)

### 2.1 portfolio-site runtime state (`scripts/serve.mjs`)

| Store | Line | Persistence today | Target |
|---|---|---|---|
| `pendingCodes` | 131 | none | stays memory-only (ephemeral 2FA codes) |
| `pendingVisitEmails` | 134 | none — **timers + payload lost on restart** | persist payload in visitor_profile doc; re-arm timers at boot |
| `proposalThreads` | 137 | none — **proposals lost on restart** | `proposal` SSSS docs, Map becomes cache |
| `authTokens` | 140 | `.data/sessions.json` (debounced 250 ms, atomic tmp+rename, `loadSessions()` at 153) | unchanged (secrets — never synced) |
| `visitorProfiles` | 143 | `.data/sessions.json` | `visitor_profile` SSSS docs, Map becomes cache; sessions.json keeps only tokens |
| `ipRateLimit` | 146 | none | stays memory-only |
| generation job/queue (`genJob`, `genQueue`) | ~1274 region | none | `generation_run` docs (append-only audit; queue itself stays in memory) |

### 2.2 Admin API (`scripts/serve.mjs:1193-1370`)

Existing: `GET /stats`, `GET /visitors`, `GET /themes`,
`POST /themes/:slug/promote`, `DELETE /themes/:slug`, `GET /proposals`,
`DELETE /proposals/:id`, `GET|POST /settings`, `POST /improve`, `GET /logs`.
Auth: `isAdmin(req)` (`serve.mjs:488`) — session cookie whose email is
`MAIL_OWNER` or `ADMIN_EMAIL`. **No machine path.**

### 2.3 Deploy skill (`.agent/skills/deploy/SKILL.md`)

- Step 1: `rsync -avz --delete dist/site/ root@…:/var/www/gregiteen.xyz/` ✅ safe.
- Step 2: `rsync -avz --exclude node_modules --exclude .git --exclude .env
  --exclude .agent ./ root@…:/opt/portfolio-site/` ❌ **no `--delete`** →
  fossil accumulation (root cause of the clown-car incident).
- Step 3: `pm2 restart portfolio` → wipes all memory-only state.

### 2.4 SSSS core registry portability (from `@ssss/cli` `registry/core.json`)

`structural`: memory, skill, rule, security_role, assistant, workflow, model,
page, migration, release. `tenant_private`: **task, conversation, run,
conflict**. Export profiles: `backup` = everything; `template`/`sale` = drop
`tenant_private`, strip `resource_bound` values.

### 2.5 Total Recall server & UI

- `src/server/routes/memory.mjs`: GET list (brainId/category/status filters),
  GET one, POST, PUT, PATCH, DELETE — all `requireAuth` + scoped
  (`memory:read` / `memory:write`).
- `src/server/rest.mjs`: `/api/files` (read-only listing of `~/.agent/files/`,
  line ~1033), `/api/brains` (~1720), `/api/brain/export` (tar.gz, ~840),
  `/api/vault/*`, `/api/graph`, research routes.
- Auth: dashboard session + PATs (`total-recall generate-pat`, hashes in
  `keys.jsonl`, per-route scopes via `requireScope`).
- `frontend/src/pages/FilesPage.tsx` (384 lines): tabs Storage / Skills /
  Scripts. Storage+Skills are **read-only tables**; Scripts tab has a working
  editor+runner precedent (list/read/save/run API in `frontend/src/api.ts`).
- `frontend/src/pages/MemoryPage.tsx` (1192 lines): full node CRUD UI —
  reuse its patterns (debounced search, category sidebar, edit panel).
- Scheduler: `src/core/scheduler.mjs` (existing job infrastructure —
  implementer must read it and register the sync job the same way existing
  jobs are registered).

## 3. New Components

### 3.1 `portfolio` SSSS extension registry

New file in **portfolio-site**: `vault-registry/extensions/portfolio.json`,
modeled directly on `node_modules/@ssss/cli/registry/extensions/festech.json`
(same `$schema`, `"extends": "core"`; an extension MUST NOT redefine a core
type). `vault-registry/` must also make the core registry resolvable — check
how `--registry <dir>` resolves core vs extensions (see `ssss export --help`
and the festech layout); if the CLI expects `core.json` alongside
`extensions/`, copy it from `node_modules/@ssss/cli/registry/core.json` via a
small `scripts/sync-registry.mjs` (never hand-edit the copy).

```jsonc
{
  "$schema": "https://ssss.dev/registry/v1",
  "registry": "portfolio",
  "extends": "core",
  "spec_version": "0.3",
  "description": "gregiteen.xyz runtime data primitives.",
  "document_primitives": {
    "visitor_profile": {
      "family": "crm",
      "canonical_path": "runtime/visitors/<email-slug>.md",
      "append_only": false,
      "portability": "tenant_private",
      "required_fields": ["type", "email", "first_seen", "last_seen", "visits"]
    },
    "proposal": {
      "family": "crm",
      "canonical_path": "runtime/proposals/<id>.md",
      "append_only": false,
      "portability": "tenant_private",
      "required_fields": ["type", "proposal_id", "client_email", "status", "created_at"]
    },
    "generation_run": {
      "family": "ops",
      "canonical_path": "runtime/runs/<id>.md",
      "append_only": true,
      "portability": "tenant_private",
      "required_fields": ["type", "run_id", "prompt", "status", "started_at"]
    }
  }
}
```

### 3.2 Document shapes (frontmatter contracts)

`visitor_profile` (`vault/runtime/visitors/<email-slug>.md`; slug =
email lowercased, `@`/`.` → `-`):

```markdown
---
type: visitor_profile
email: "jane@acme.com"
first_seen: 2026-07-07T18:00:00Z
last_seen: 2026-07-08T02:11:00Z
visits: 3
style_prompt: "super mario"
generation_count: 1
enrichment:            # screen, timezone, language, referrer, platform, touch, company inference
  timezone: "America/Chicago"
pending_notification:  # payload for deferred email; null once sent
  held_since: 2026-07-08T02:11:00Z
---
Free-text notes / CNA summary excerpts (no secrets, no tokens).
```

`proposal` (`vault/runtime/proposals/<id>.md`; `<id>` = existing hex
proposalId):

```markdown
---
type: proposal
proposal_id: "a3f9c2"
client_email: "jane@acme.com"
company: "Acme"
project_type: "AI integration"
status: pending_approval    # draft | pending_approval | revising | approved | sent | rejected
revisions: 2
created_at: 2026-07-07T19:00:00Z
decided_at: null
decision_notes: null
---
## Assessment
(CNA assessment JSON/markdown)
## Current proposal
(full latest proposal text)
## Revision history
(appended per revision)
```

`generation_run` (`vault/runtime/runs/<id>.md`): run_id, prompt, email,
status (`queued|running|done|failed`), started_at/finished_at, error, scores.

**Serialization rule:** all writes go through `@ssss/cli` frontmatter
tooling (`parseDocument` from `@ssss/cli/frontmatter` is already imported by
`build-site.mjs:10`; check the same module for a serialize/stringify
counterpart before hand-rolling YAML).

### 3.3 `scripts/runtime-store.mjs` (portfolio)

Single module owning the runtime vault. Exported surface (keep exactly this,
so serve.mjs diffs stay small):

```js
export async function initRuntimeStore()            // mkdir dirs, hydrate caches from disk
export function getVisitor(email)                   // from cache
export async function upsertVisitor(email, patch)   // merge → write doc → update cache
export function listVisitors()
export function getProposal(id)
export async function upsertProposal(id, patch)     // status transitions validated here
export function listProposals(filter?)
export async function appendRun(run)                // append-only
export function pendingNotifications()              // visitors with pending_notification set
```

Writes: debounced 250 ms per-document, atomic tmp+rename (mirror the proven
`saveSessions()` pattern at `serve.mjs:164-178`). serve.mjs keeps its Maps but
they become read caches fed by this module; every mutation site calls the
store instead of `Map.set` directly.

### 3.4 Portfolio admin API additions (`scripts/serve.mjs`)

- **Auth:** extend `isAdmin(req)` — before the cookie check, accept
  `Authorization: Bearer <token>` iff `process.env.ADMIN_API_TOKEN` is set,
  non-empty, and matches via `crypto.timingSafeEqual` (length-guarded).
- `GET /api/admin/export-bundle` — spawn
  `npx ssss export vault --profile backup --registry vault-registry --out -`
  …but **verify flag reality first**: `--out` default is stdout; confirm
  `--registry` + extension loading with `ssss export --help` and a dry run.
  Stream stdout as `application/json`; on non-zero exit → 500 with stderr tail.
- `GET /api/admin/export-assets` — `tar czf -` of `designs/` and
  `vault/pages/skins/` (spawn, stream, `application/gzip`).
- `POST /api/admin/proposals/:id/decision` — body
  `{action: "approve"|"revise"|"reject", notes?}`:
  - `approve` → invoke the **same code path** as the email "send it" trigger
    (find it in the `/api/proposal-reply` webhook handler in serve.mjs — the
    branch that formats and sends the proposal to the client and CCs Greg);
    set status `sent`, `decided_at`.
  - `revise` → feed `notes` into the existing AI-iteration branch of the same
    webhook; set status `revising`.
  - `reject` → status `rejected`; no client email.
  - 404 unknown id; 400 bad action; always persist via runtime-store.

### 3.5 Total Recall sync job (`total-recall` repo)

New `src/core/portfolio-sync.mjs`:

```
config (via existing config mechanism — find how config.mjs exposes settings):
  portfolioSync: { enabled, baseUrl: "https://gregiteen.xyz",
                   tokenRef: "PORTFOLIO_ADMIN_TOKEN" (env name, not the value),
                   intervalMinutes: 30,
                   vaultDir: "~/.agent/tenants/portfolio-site/vault",
                   assetsDir: "~/.agent/tenants/portfolio-site/assets", keepAssets: 7 }

runSync():
  1. fetch ${baseUrl}/api/admin/export-bundle  (Bearer)
  2. write to tmp; `ssss validate` it (spawn npx ssss, or use @ssss/cli engine API)
  3. `ssss import <bundle> --vault <vaultDir>`   (idempotent replay)
  4. fetch export-assets → assetsDir/<ISO-date>.tar.gz; prune to keepAssets
  5. write ~/.agent/tenants/portfolio-site/sync-status.json
     { lastRunAt, ok, nodeCounts (from bundle primitive_inventory), error }
  never throw out of runSync — catch, log via core logger, record in status
```

Registered with `src/core/scheduler.mjs` following the existing job pattern.
Brain visibility: after first successful import, ensure the tenant vault shows
up in `/api/brains` — check whether `total-recall brain register
~/.agent/tenants/portfolio-site` suffices (CLI `brain register <path>`); if
`/api/brains` only scans fixed locations, extend it to include registered
tenant paths. **This is a verify-then-implement task, not an assumption.**

### 3.6 Total Recall SSSS document manager

Server — new `src/server/routes/docs.mjs` (mount like the other route files;
copy auth/scoping style from `routes/memory.mjs`):

```
GET    /api/docs?brain=<id>&type=&portability=&status=&tag=&xKind=&q=&limit=&offset=
         → { total, docs: [{ path, type, portability, title|name, status,
             tags, updatedAt, size, frontmatter }] }
GET    /api/docs/read?brain=<id>&path=<rel>        → { path, raw, frontmatter, body }
POST   /api/docs      { brain, path, content }     → create (409 if exists)
PUT    /api/docs      { brain, path, content }     → update (404 if missing)
DELETE /api/docs?brain=<id>&path=<rel>             → delete
GET    /api/views     · POST /api/views · DELETE /api/views/:id
```

Rules: `brain` resolves through the same brain-dir resolution `/api/brains`
uses (global brain, project brains, portfolio tenant). `path` is
vault-relative; reject absolute paths, `..`, and symlink escapes
(resolve + prefix check — same guard style as serve.mjs static handler).
Frontmatter parsed with the `@ssss/cli` frontmatter module; portability is
resolved per-type from the registry (core + extensions), not guessed. Writes
route through the server's existing validated-write path
(`src/core/validated-write.mjs` — read it first) so schema validation and
index recompilation happen exactly as they do for memory nodes. Scopes:
reads `ssss:read`, writes `ssss:write` (add the scope if it doesn't exist,
following how existing scopes are declared).

Saved views: JSON at `~/.agent/config/saved-views.json`
`[{ id, name, brain, filters, sort, columns, createdAt }]` — small and
server-owned; not SSSS nodes (they're UI preferences, not knowledge).

UI — new `frontend/src/pages/VaultPage.tsx` + nav entry (route registration:
mirror how FilesPage is wired in `App.tsx`):

- Left rail: brain selector (reuse `components/BrainSelector.tsx`), facet
  groups (type, portability, status, tags) with counts, saved-views list
  (apply on click, save-current-view button).
- Main: toolbar (search box, active filter chips, New Document, Refresh),
  table (Name, Type, Portability badge, Status, Tags, Updated), pagination.
- Right drawer on row click: rendered Markdown (reuse
  `components/MarkdownUtils.tsx`) + frontmatter key/value panel + Edit
  (textarea like Scripts editor) / Save / Delete.
- New Document: pick type from registry → prefill frontmatter template with
  `required_fields`.

### 3.7 Total Recall proposals inbox

New `frontend/src/pages/ProposalsPage.tsx` (or a tab on VaultPage — decide by
whichever needs less routing plumbing; a separate page is cleaner for nav):
lists docs where `type=proposal`, ordered `pending_approval` first. Detail
view: assessment + latest proposal text + revision history. Buttons wire to
new server proxy `POST /api/sync/portfolio/proposals/:id/decision` (server →
droplet with the token; the browser never holds the droplet token). After a
decision: optimistic status update + trigger `runSync()` for reconciliation.

## 4. Deploy & Data-Safety Rules

### 4.1 The exclude list (deploy skill Step 2 — the load-bearing change)

```
rsync -avz --delete \
  --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude '.agent' \
  --exclude '.data/' \
  --exclude 'designs/' \
  --exclude 'vault/pages/skins/' \
  --exclude 'vault/runtime/' \
  --exclude 'vault/visitors.md' \
  --exclude 'dist/' \
  ./ root@138.197.199.217:/opt/portfolio-site/
```

Rationale: `--delete` makes repo deletions propagate (kills the fossil class
of bug forever); each exclude is a runtime-data root that the repo does not
own. `dist/` is excluded because the droplet rebuilds it (`build-site.mjs`
runs there); nginx content is Step 1's job. The skill doc must carry this
table of exclude→reason so future edits don't drop one.

### 4.2 Droplet cleanup (one-time, ordered, with safety net)

1. `ssh root@138.197.199.217 "tar czf /root/pre-sovereign-sync-backup-$(date +%F).tar.gz /opt/portfolio-site /var/www/gregiteen.xyz"` (full safety net first).
2. Remove fossils in `/opt/portfolio-site/vault/pages/designs/` (everything
   except `nostalgia.md`, `high-stakes-field-day.md`), stale dirs in
   `/opt/portfolio-site/designs/` (keep only skins that exist in
   `vault/pages/skins/`), all of `/opt/portfolio-site/dist/`.
3. Rebuild on droplet (`node scripts/build-site.mjs`), redeploy static
   (Step 1 rsync), `pm2 restart portfolio`.
4. Smoke-verify (Testing phase T1).

## 5. Security Model

| Secret | Lives | Never |
|---|---|---|
| `ADMIN_API_TOKEN` | droplet `.env` + Greg's TR env (`PORTFOLIO_ADMIN_TOKEN`) | in vault, bundles, git, logs |
| TR PATs | `keys.jsonl` (hashed) | in frontend bundles |
| SMTP / Gemini / DO keys | droplet `.env` | in vault or bundles |
| `gi_auth` session tokens | `.data/sessions.json` | in vault; `.data/` excluded from rsync *and* from `vault/` so bundles can't contain it |

Bundle content is `tenant_private`-classified but still *customer PII* —
transport is HTTPS only; at rest it lands inside `~/.agent/tenants/` on
Greg's machine (already the trust boundary for all TR data).

## 6. Failure Modes & Handling

| Failure | Behavior |
|---|---|
| Droplet unreachable during sync | job logs, writes `ok:false` status, retries next tick; daemon unaffected |
| Bundle fails `ssss validate` | import skipped, bundle kept at `…/assets/failed-<date>.ucw.json` for forensics |
| Decision POST fails | UI shows error, node untouched; safe to retry (droplet endpoint idempotent: re-approving a `sent` proposal → 200 no-op) |
| Concurrent syncs | scheduler must not overlap the job (verify scheduler semantics; add a simple in-flight flag if needed) |
| runtime-store write fails mid-flight | atomic tmp+rename → last good doc survives; error logged, cache still authoritative until retry |
| pm2 restart mid-negotiation | proposals hydrate from `vault/runtime/proposals/` at boot; deferred-notification timers re-armed from `pending_notification` fields |
