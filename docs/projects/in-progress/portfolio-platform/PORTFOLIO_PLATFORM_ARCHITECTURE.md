# Portfolio Platform — System Architecture

> Combined architecture (2026-07-07): merges the former portfolio-platform
> architecture and the sovereign-sync architecture. File:line references were
> verified 2026-07-07 against `portfolio-site@bfc0216` and the local
> `total-recall` working tree — **if a referenced line has drifted, search
> for the quoted symbol instead of trusting the number.**

## 1. Full-System Overview

```
┌─────────────────────────── DigitalOcean droplet 138.197.199.217 ──────────────────────────┐
│                                                                                            │
│  VISITOR FLOW                                                                              │
│  splash.html → /api/send-code ──► GENERATION STARTS ──► verify.html → /api/verify-code     │
│       │           (style prompt + email + optIn)              │ gi_auth cookie (30d)       │
│       ▼                                                       ▼                            │
│  ┌──────────────────────────────────────────────┐   home in bespoke generated design       │
│  │ GENERATION PIPELINE (compile-theme.mjs)      │        │                                 │
│  │ Plan → Plan-review → Images (parallel) ──┐   │        ▼                                 │
│  │        CSS+Home ──► SERVE HOME IMMEDIATELY   │   FLIPPER (View Transitions):            │
│  │        Layouts (parallel) ──► BUILD REST     │   fetch() new design build →             │
│  │        Holistic review ──► FINALIZE          │   startViewTransition() full swap        │
│  └──────────────────────────────────────────────┘        │                                 │
│                                                          ▼                                 │
│  CNA (consult.html → /api/cna, Gemini) → enrichment → proposal → Greg approval             │
│    approval paths: email reply loop ("send it")  OR  Total Recall Inbox → decision API     │
│    end state: proposal PDF + e-sign link (FR-G)                                            │
│                                                                                            │
│  BACKGROUND: daily improve-theme cron (3 AM, all designs, model rotation)                  │
│              deferred visitor notification (sendBeacon + 30-min fallback)                  │
│              drip campaign scheduler (FR-F — to build)                                     │
│                                                                                            │
│  nginx  →  /var/www/gregiteen.xyz/          (static, rsync --delete from dist/site/)       │
│  pm2    →  /opt/portfolio-site/scripts/serve.mjs   ("portfolio" process, port 4173)        │
│                                                                                            │
│  /opt/portfolio-site/                                                                      │
│    vault/                      ← SSSS vault (structural content + runtime/ section)        │
│      pages/…                     structural (portfolio content)                            │
│      pages/skins/*.md            runtime-generated skins (rsync-excluded)                  │
│      runtime/visitors/*.md       tenant_private  visitor_profile (incl. drip state)        │
│      runtime/proposals/*.md      tenant_private  proposal                                  │
│      runtime/runs/*.md           tenant_private  generation_run                            │
│    vault-registry/               registry dir (core copy + extensions/portfolio.json)      │
│    designs/<slug>/…              runtime-generated theme builds + images (rsync-excluded)  │
│    .data/sessions.json           tokens (rsync-excluded, never synced)                     │
│                                                                                            │
│  Admin API (cookie OR Bearer ADMIN_API_TOKEN):                                             │
│    GET  /api/admin/export-bundle         → .ucw.json  (ssss export --profile backup)       │
│    GET  /api/admin/export-assets         → tar.gz     (designs/ + skins/)                  │
│    POST /api/admin/proposals/:id/decision                                                  │
│    + stats/visitors/themes/proposals/settings/improve/logs                                 │
└───────────────▲────────────────────────────────────────────┬───────────────────────────────┘
                │ pull (HTTPS, Bearer token)                 │ decisions (HTTPS, Bearer token)
                │                                            ▼
┌─────────────── Greg's machine — Total Recall server (never publicly exposed) ──────────────┐
│  scheduler job "portfolio-sync" (every 30 min):                                            │
│    1. GET export-bundle → validate (@ssss/cli) → ssss import → ~/.agent/tenants/           │
│       portfolio-site/vault/   (idempotent replay)                                          │
│    2. GET export-assets → ~/.agent/tenants/portfolio-site/assets/<date>.tar.gz (keep 7)    │
│    3. write sync-status JSON (last run, node counts, errors)                               │
│  REST additions:   /api/docs/*  (SSSS document manager)  ·  /api/views/* (saved views)     │
│                    /api/sync/portfolio/* (status, trigger, proposal decision proxy)        │
│  Dashboard:        VaultPage (faceted SSSS docs) · InboxPage (proposals) · existing pages  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Direction of trust:** Total Recall is always the HTTP client. The droplet
holds no Total Recall address or credential. The only droplet-side machine
secret is `ADMIN_API_TOKEN` in `/opt/portfolio-site/.env`.

## 2. Data Flow: Vault → Build → Dist

```
vault/pages/*.md                          (Source of truth)
    │
    ├─ parseDocument() via @ssss/cli      (Frontmatter + body extraction)
    ├─ renderMarkdown(body) → HTML        (Built-in minimal renderer)
    ├─ Categorize by x_kind:
    │   ├─ "section"    → nav pages (home, about, contact)
    │   ├─ "project"    → project details
    │   ├─ "design"     → real portfolio design work ONLY (positive allowlist)
    │   ├─ "theme-skin" → flipper skins (never on Designs index)
    │   └─ "theme"      → FOSSIL: console.warn + ignore (guard in build-site.mjs)
    │
    ├─ If design layer active:
    │   designs/<slug>/DESIGN.md
    │   → extractSections()               (CSS + layouts from fenced blocks)
    │   → fillTemplate(layout, {VARS})    (Inject vault data into {{PLACEHOLDER}} slots)
    │
    └─ writeFile → dist/site/
```

Base `:root` color tokens (`--ink/--bone/--accent/--line`) live in the
`build-site.mjs` STYLE constant (moved there when the `theme-warm.md` fossil
was removed — see Discrepancy Log in the tracker).

## 3. Portfolio Components

### 3.1 Splash + Auth (`static/splash.html`, `static/verify.html`, `serve.mjs`)
- Splash collects style prompt + email + `optIn` checkbox
- Server sends 6-digit verification code via SMTP; generation starts on submit
- On verification: `gi_auth` cookie set, visitor profile upserted
- Rate limiting: IP-based (10/hr) + 3-generations-max per email
- Returning authenticated users auto-redirect splash → `/`

### 3.2 Theme Generator (`scripts/compile-theme.mjs`)
- Multi-pass pipeline (Gemini; fallback Antigravity → Claude → Codex CLI):
  Pass 1 plan → Pass 1b plan-review gate (score, improve if <8/10) →
  Pass 2 CSS+home (serve immediately) → Passes 2b/3/4 parallel layouts
  (`Promise.all`) → Pass 5 holistic review (scoring, placeholder compliance,
  hardcoded-text check)
- Validation via `validateThemePayload()` with one repair round
- Outputs: `vault/pages/skins/<slug>.md` (`x_kind: theme-skin`) +
  `designs/<slug>/` build + images (logo, favicon, hero, portrait)

### 3.3 Theme Validator (`scripts/lib/theme.mjs`)
- `LAYOUT_SPECS` — placeholder contract (see §8)
- `validateThemePayload()` / `fillTemplate()` / `extractSections()`
- `scopeCss()` — prefixes selectors with `html[data-theme="custom"]`

### 3.4 Build Script (`scripts/build-site.mjs`)
- Reads vault, optional design layer, fills templates, writes static HTML
- Dual-layer: `.tl-default` / `.tl-custom` divs with CSS visibility toggle
- Standalone design build (`--design <slug>`): un-scoped CSS, rewritten links
- Auto-builds all design layers after main build; injects flipper, CNA
  banners, logout link

### 3.5 Dev/Prod Server (`scripts/serve.mjs`)
- `fs.watch()` vault rebuilds (150 ms debounce); live reload `/dev-status`
- 2FA auth, sessions, rate limiting, visitor logging
- Generation queue (`genJob`/`genQueue`) spawning compile-theme.mjs
- CNA (`/api/cna`), proposal generation + revision loop
  (`/api/proposal-reply` webhook, `sendProposalToClient()`,
  `reviseProposal()`), decision endpoint
- Deferred notifications (`pendingVisitEmails` + sendBeacon `/api/leaving` +
  30-min fallback), re-armed from persisted state at boot
- Admin API + dashboard; daily improvement cron; drip scheduler (FR-F)
- Runtime stores (§4)

### 3.6 Flipper (injected by `build-site.mjs`)
- Fixed bar; prev/next across design builds
- `fetch()` + `DOMParser` + `document.startViewTransition()` full page swap
- Preserves current sub-path across design switches
- Skins served at `/designs/<slug>/index.html` (explicit `/index.html` —
  serve.mjs links them that way; bare dir URLs handled by the trailing-slash
  → index.html fix in serve.mjs static handler)

### 3.7 Continuous Improvement (`scripts/improve-theme.mjs`, `promote-theme.mjs`)
- Daily 3 AM cron in serve.mjs runs improve-theme on ALL skins; swap-if-better;
  deterministic model rotation (flash/pro)
- `promote-theme.mjs` promotes a mature skin to the portfolio Designs index
- Admin dashboard has a manual improvement trigger

## 4. Runtime Data (SSSS)

### 4.1 Stores in `scripts/serve.mjs`

| Store | Persistence | Notes |
|---|---|---|
| `pendingCodes` | memory-only **by design** | ephemeral 2FA codes |
| `ipRateLimit` | memory-only **by design** | abuse control |
| `authTokens` | `.data/sessions.json` (debounced 250 ms, atomic tmp+rename) | secrets — never synced |
| `visitorProfiles` | `vault/runtime/visitors/*.md` via runtime-store; Map is a boot-hydrated cache | includes enrichment, optIn, generation_count, pending_notification, drip state (FR-F) |
| `proposalThreads` | `vault/runtime/proposals/*.md` via runtime-store | full revision history in body |
| `pendingVisitEmails` | payload persisted on visitor doc (`pending_notification`); timers re-armed at boot | 30-min fallback semantics preserved |
| generation queue | queue in memory; each run appends `vault/runtime/runs/<id>.md` | append-only audit |

### 4.2 Extension registry (`vault-registry/`)

`vault-registry/core.json` is a verbatim copy of
`node_modules/@ssss/cli/registry/core.json`, refreshed by
`scripts/sync-registry.mjs` (wired to `postinstall` + `sync-registry` npm
scripts — never hand-edit). `vault-registry/extensions/portfolio.json`
(`extends: "core"`, modeled on the festech.json precedent; extensions MUST
NOT redefine core types):

```jsonc
{
  "$schema": "https://ssss.dev/registry/v1",
  "registry": "portfolio",
  "extends": "core",
  "spec_version": "0.3",
  "description": "gregiteen.xyz runtime data primitives.",
  "document_primitives": {
    "visitor_profile": { "family": "crm", "canonical_path": "runtime/visitors/<email-slug>.md",
      "append_only": false, "portability": "tenant_private",
      "required_fields": ["type", "email", "first_seen", "last_seen", "visits"] },
    "proposal":        { "family": "crm", "canonical_path": "runtime/proposals/<id>.md",
      "append_only": false, "portability": "tenant_private",
      "required_fields": ["type", "proposal_id", "client_email", "status", "created_at"] },
    "generation_run":  { "family": "ops", "canonical_path": "runtime/runs/<id>.md",
      "append_only": true, "portability": "tenant_private",
      "required_fields": ["type", "run_id", "prompt", "status", "started_at"] }
  }
}
```

### 4.3 Document shapes (frontmatter contracts)

`visitor_profile` (`vault/runtime/visitors/<email-slug>.md`; slug = email
lowercased, `@`/`.` → `-`):

```markdown
---
type: visitor_profile
email: "jane@acme.com"
first_seen: 2026-07-07T18:00:00Z
last_seen: 2026-07-08T02:11:00Z
visits: 3
style_prompt: "super mario"
generation_count: 1
opt_in: true
enrichment:            # screen, timezone, language, referrer, platform, touch, company inference
  timezone: "America/Chicago"
pending_notification:  # payload for deferred email; null once sent
  held_since: 2026-07-08T02:11:00Z
drip:                  # FR-F — null until enrolled
  campaign: "default-nurture"
  step: 2
  next_send_at: 2026-07-10T15:00:00Z
  status: active       # active | paused | completed | unsubscribed
---
Free-text notes / CNA summary excerpts (no secrets, no tokens).
```

`proposal` (`vault/runtime/proposals/<id>.md`; `<id>` = existing hex proposalId):

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

**Serialization rule:** all writes go through `@ssss/cli` frontmatter tooling
(or runtime-store's minimal serializer for these flat/2-level shapes only).

### 4.4 `scripts/runtime-store.mjs` surface (keep exactly this)

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

Writes: debounced 250 ms per-document, atomic tmp+rename (mirrors
`saveSessions()`). serve.mjs Maps are read caches; every mutation site calls
the store.

## 5. Sync Bridge & Total Recall

### 5.1 Portfolio admin API machine auth (`serve.mjs`)
`isAdmin(req)`: before the cookie check, accept
`Authorization: Bearer <token>` iff `process.env.ADMIN_API_TOKEN` is set,
non-empty, and matches via `crypto.timingSafeEqual` (length-guarded).

### 5.2 Export + decision endpoints (`serve.mjs`)
- `GET /api/admin/export-bundle` — spawns
  `npx ssss export vault --profile backup --registry vault-registry`,
  streams stdout as `application/json`; non-zero exit → 500 + stderr tail.
- `GET /api/admin/export-assets` — `tar czf -` of `designs/` +
  `vault/pages/skins/` (spawn, stream, `application/gzip`).
- `POST /api/admin/proposals/:id/decision` `{action: approve|revise|reject, notes?}`
  — approve → `sendProposalToClient(thread)` (same path as email "send it"),
  status `sent`, `decided_at`; revise → `reviseProposal(thread, notes)`,
  status `revising`; reject → status `rejected`, no client email.
  404 unknown id; 400 bad action; idempotent re-approve → 200 `{noop:true}`;
  always persist via runtime-store.

### 5.3 Total Recall sync job (`total-recall: src/core/portfolio-sync.mjs`)

```
config: portfolioSync { enabled, baseUrl: "https://gregiteen.xyz",
        tokenRef: "PORTFOLIO_ADMIN_TOKEN" (env NAME, not value),
        intervalMinutes: 30,
        vaultDir:  "~/.agent/tenants/portfolio-site/vault",
        assetsDir: "~/.agent/tenants/portfolio-site/assets", keepAssets: 7 }

runSync():  (never throws — catch, log, record in status)
  1. GET export-bundle (Bearer)
  2. tmp write → ssss validate
  3. ssss import <bundle> --vault <vaultDir>   (idempotent replay)
  4. GET export-assets → assetsDir/<ISO-date>.tar.gz; prune to keepAssets
  5. write sync-status.json { lastRunAt, ok, nodeCounts, error }
```

Registered with `src/core/scheduler.mjs` per the existing job pattern. Brain
registered so the tenant vault appears in `/api/brains` with node counts.
Status surfaced at `GET /api/sync/portfolio/status`.

### 5.4 Total Recall SSSS document manager (`src/server/routes/docs.mjs`)

```
GET    /api/docs?brain=<id>&type=&portability=&status=&tag=&xKind=&q=&limit=&offset=
GET    /api/docs/read?brain=<id>&path=<rel>        → { path, raw, frontmatter, body }
POST   /api/docs      { brain, path, content }     → create (409 if exists)
PUT    /api/docs      { brain, path, content }     → update (404 if missing)
DELETE /api/docs?brain=<id>&path=<rel>
GET/POST/DELETE /api/views                          → saved views
```

Rules: brain resolves through the same resolution `/api/brains` uses; `path`
is vault-relative — reject absolute paths, `..`, symlink escapes (resolve +
prefix check). Frontmatter via `@ssss/cli`; portability resolved per-type
from registry (core + extensions; unknown types fall back to
`tenant_private` with `portability_source:"fallback"`). Writes route through
the validated-write path. Scopes: `ssss:read` / `ssss:write`. Saved views:
JSON at `~/.agent/config/saved-views.json` (UI preferences, not SSSS nodes).

### 5.5 Total Recall UI
- `frontend/src/pages/VaultPage.tsx` — brain selector, facet groups (type /
  portability / status / tags) with counts, saved views, toolbar, table,
  right-drawer viewer/editor, type-aware New Document.
- `frontend/src/pages/InboxPage.tsx` — proposals inbox (`pending_approval`
  first): assessment + latest text + revision history; Approve / Request
  changes / Reject → server proxy
  `POST /api/sync/portfolio/proposals/:id/decision` (token stays
  server-side); optimistic update + post-decision `runSync()`.
- Shared components extracted: `DocumentTable`, `DocumentEditorModal`.

## 6. Drip Campaign Engine (FR-F — to build)

- **Campaign definitions:** structural SSSS docs (e.g.
  `vault/campaigns/<slug>.md`, type added to the portfolio extension
  registry as `drip_campaign`, portability `structural` — sequences are
  Greg's IP-safe marketing content, contain no customer data). Each step:
  `{ delay_hours, subject, body_template }`.
- **Per-visitor state:** `drip` block on `visitor_profile` (§4.3) —
  tenant_private by construction.
- **Scheduler:** interval tick in serve.mjs (same pattern as the improvement
  cron); on each tick, `pendingDripSends()` (visitors where
  `drip.status === 'active' && next_send_at <= now`) → send via existing
  SMTP path → advance step / complete. State persisted before send attempt;
  restart-safe because next_send_at is absolute.
- **Enrollment:** on verify with `opt_in: true` → `default-nurture`;
  CNA-completed visitors switch to (or pause for) the proposal sequence.
- **Unsubscribe:** signed token link `/api/unsubscribe?token=…` → sets
  `drip.status = 'unsubscribed'`; all sends check status at send time.
- **Admin:** visitors view shows drip column; pause/resume/unenroll actions.

## 7. Proposal PDF + E-sign (FR-G — to build)

- PDF render server-side at "send it"/approve time; attach to client email.
- Library choice: lightest acceptable (evaluate at build time; no heavy
  browser dependency on the droplet if avoidable).
- E-sign: evaluate open-source options (Documenso, Docuseal); decision +
  hosting call is Greg's; integrate signing-link into the send path; signed
  webhook (if available) updates proposal doc status.

## 8. Placeholder Contract

| Template | Required | Optional |
|----------|----------|----------|
| `shell` | `{{CONTENT}}` | `{{NAV_LINKS}}`, `{{THEME_PILLS}}`, `{{SOURCE_PATH}}` |
| `home` | `{{FEATURED_PROJECTS}}` | `{{HEADLINE}}`, `{{TAGLINE}}`, `{{INTRO}}`, `{{FEATURED_COUNT}}`, `{{GENERATOR_FORM}}` |
| `projects_index` | `{{PROJECT_LIST}}` | `{{PROJECT_COUNT}}` |
| `designs_index` | `{{DESIGN_CARDS}}` | `{{DESIGN_COUNT}}` |
| `project_detail` | `{{NAME}}`, `{{CONTENT}}` | `{{DESCRIPTION}}`, `{{ROLE}}`, `{{YEAR}}`, `{{TECH_BADGES}}`, `{{REPO_LINK}}`, `{{PROJECT_LINK}}`, `{{LOGO}}`, `{{SOURCE_PATH}}`, `{{BACKLINK}}` |
| `design_detail` | `{{NAME}}`, `{{CONTENT}}` | `{{DESCRIPTION}}`, `{{CLIENT}}`, `{{ROLE}}`, `{{YEAR}}`, `{{TAG_BADGES}}`, `{{PREVIEW}}`, `{{LINK_URL}}`, `{{SOURCE_PATH}}`, `{{BACKLINK}}` |
| `page` | `{{NAME}}`, `{{CONTENT}}` | `{{SOURCE_PATH}}` |
| `project_item` | `{{NAME}}`, `{{URL}}` | `{{DESCRIPTION}}`, `{{YEAR}}`, `{{TECH_BADGES}}`, `{{LOGO}}`, `{{INDEX}}`, `{{REPO_URL}}` |
| `design_item` | `{{NAME}}`, `{{URL}}` | `{{DESCRIPTION}}`, `{{YEAR}}`, `{{CLIENT}}`, `{{TAG_BADGES}}`, `{{PREVIEW}}` |
| `nav_item` | `{{NAV_URL}}`, `{{NAV_NAME}}` | `{{NAV_ACTIVE_CLASS}}` |

Note: `{{GENERATOR_FORM}}` was removed from `designs_index` (generation is
splash-only); it remains a legal optional slot on `home` for the default
layout only.

## 9. Deploy & Data-Safety Rules

### 9.1 The exclude list (deploy skill Step 2 — the load-bearing change)

```
rsync -avz --delete \
  --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude '.agent' \
  --exclude '.data/' \
  --exclude '/designs/' \
  --exclude 'vault/pages/skins/' \
  --exclude 'vault/runtime/' \
  --exclude 'vault/visitors.md' \
  --exclude '/dist/' \
  ./ root@138.197.199.217:/opt/portfolio-site/
```

`--delete` makes repo deletions propagate (kills the fossil bug class);
each exclude is a runtime-data root the repo does not own. **The leading
slash on `/designs/` and `/dist/` is load-bearing** — rsync patterns are
unanchored unless they contain a non-trailing slash; a bare `designs/` also
excludes `vault/pages/designs/` and shields fossils from `--delete` (this
bit us once — see Discrepancy Log). The deploy skill carries the full
exclude→reason table; removing an exclude is a data-loss event requiring the
pre-deploy backup first.

### 9.2 Droplet cleanup procedure (one-time, done 2026-07-07; keep for reference)

1. `ssh root@138.197.199.217 "tar czf /root/pre-deploy-backup-$(date +%F).tar.gz /opt/portfolio-site /var/www/gregiteen.xyz"`
2. Remove fossils (everything in `vault/pages/designs/` except nostalgia +
   HSFD; `designs/` dirs not matching `vault/pages/skins/*.md` slugs; all of
   `dist/`)
3. Rebuild on droplet, redeploy static (Step 1 rsync), `pm2 restart portfolio`
4. Smoke-verify (Testing phase T1)

## 10. Security Model

| Secret | Lives | Never |
|---|---|---|
| `ADMIN_API_TOKEN` | droplet `.env` + Greg's TR env (`PORTFOLIO_ADMIN_TOKEN`) | in vault, bundles, git, logs |
| TR PATs | `keys.jsonl` (hashed) | in frontend bundles |
| SMTP / Gemini / DO keys | droplet `.env` | in vault or bundles |
| `gi_auth` session tokens | `.data/sessions.json` | in vault; `.data/` excluded from rsync *and* vault |
| Drip unsubscribe tokens | derived/signed, verified server-side | reusable as auth for anything else |

Bundle content is `tenant_private` but still *customer PII* — HTTPS
transport only; at rest inside `~/.agent/tenants/` (already the trust
boundary for all TR data). Designs are proprietary IP: no design-spec
download endpoints, no DESIGN.md exposure.

## 11. Failure Modes & Handling

| Failure | Behavior |
|---|---|
| Droplet unreachable during sync | job logs, writes `ok:false` status, retries next tick; daemon unaffected |
| Bundle fails `ssss validate` | import skipped; bundle kept at `…/assets/failed-<date>.ucw.json` for forensics |
| Decision POST fails | UI shows error, node untouched; safe to retry (droplet endpoint idempotent) |
| Concurrent syncs | scheduler must not overlap the job (in-flight flag if needed) |
| runtime-store write fails mid-flight | atomic tmp+rename → last good doc survives; error logged; cache authoritative until retry |
| pm2 restart mid-negotiation | proposals hydrate from `vault/runtime/proposals/` at boot; deferred-notification timers re-armed |
| pm2 restart mid-drip-sequence | drip state persisted with absolute `next_send_at`; scheduler resumes on boot (FR-F acceptance) |
| SMTP failure during drip send | step NOT advanced; retried next tick; error logged |
| Generation failure | `generation_run` doc finalized with `status: failed` + error; visitor sees fallback |
