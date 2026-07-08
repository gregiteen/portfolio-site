# Sovereign Sync — Development Plan

Execution order is strict: **Phase 0 → 1 → 2 → 3 → 4 → 5**. Do not start a
phase while the previous phase has unchecked tracker items. Each task names
its repo: `[portfolio]` = `~/Github/portfolio-site`, `[total-recall]` =
`~/Github/total-recall`, `[droplet]` = ssh ops on `138.197.199.217`.

Ground rules for the implementing agent:

- Read `SOVEREIGN_SYNC_PRD.md` and `SOVEREIGN_SYNC_ARCHITECTURE.md` first.
  Architecture §3 contains the component specs — this plan tells you *when*,
  the architecture tells you *what*.
- Every task has **Verify** steps. A task is not done until they pass. Check
  the tracker box only after Verify passes.
- If reality contradicts a task's stated assumption, STOP that task, write
  the discrepancy in the tracker under "Discrepancy log", and resolve the
  assumption before coding around it.
- Never run `tsc` or `npm run typecheck` directly in total-recall — use
  `node .agent/skills/code-quality/scripts/start-here-ts.mjs` and
  `…/start-here-lint.mjs` (per repo rules).
- Droplet credentials: IP is `DROPLET_IP` in portfolio `.env`; ssh as root.
  Never print `.env` contents into logs or docs.
- Commit per phase (small commits within phases are fine). Portfolio deploys
  only via the deploy skill. No GitHub Actions.

---

## Phase 0 — Baseline verification (no code changes)

Purpose: prove the ground the plan stands on and capture "before" evidence.

**0.1 [portfolio] Repo test baseline.** Run `npm test`. Record pass/fail in
tracker. Verify: exit 0.

**0.2 [total-recall] Repo test baseline.** Run `npx vitest run` (targeted:
`npx vitest run src/server src/core` if the full suite is slow). Record
result. Verify: no *new* failures vs current main (record any pre-existing
red tests by name — they are not yours to fix, only not to worsen).

**0.3 [portfolio] SSSS CLI reality check.** Run and paste key output into the
tracker discrepancy log if it differs from Architecture §3.1/§3.4 assumptions:
`npx ssss export --help`, `npx ssss import --help`, `npx ssss help
portability`, `npx ssss help bundle`. Specifically confirm: `--profile
backup|template|sale`, `--registry <dir>`, `--ext <name>`, `--show-dropped`,
stdout default for `--out`. Verify: flags exist as documented.

**0.4 [portfolio] Extension-registry dry run.** Create a **throwaway** dir in
the session scratchpad mimicking `vault-registry/` (core.json copied from
`node_modules/@ssss/cli/registry/`, plus `extensions/portfolio.json` from
Architecture §3.1). Run `npx ssss export vault --profile backup --registry
<scratch-registry> --out <scratch>/test.ucw.json` then `npx ssss validate
<scratch>/test.ucw.json`. Verify: export+validate succeed; note in tracker
exactly how core+extension resolution worked (this defines task 2.1's layout).

**0.5 [droplet] Live-state snapshot.** Capture (into the tracker, not loose
files): `curl -s -o /dev/null -w '%{http_code}' https://gregiteen.xyz/designs/clown-car/index.html`
(expect 200 now — the bug), `ssh root@$DROPLET_IP "ls /opt/portfolio-site/vault/pages/designs/
/opt/portfolio-site/designs/ /var/www/gregiteen.xyz/designs/"`. Verify:
snapshot recorded; fossil list enumerated.

**0.6 [total-recall] API smoke.** With the server running locally
(`npm run dev` or existing daemon): `GET /api/health`-equivalent, `GET
/api/memory?limit=1`, `GET /api/brains` using a PAT or dashboard session.
Verify: 200s; auth mechanism confirmed working. (Generate a PAT via
`node bin/total-recall.mjs generate-pat` if none exists — record the scopes
it offers in the tracker for task 4.1.)

---

## Phase 1 — Droplet hygiene & deploy safety

**1.1 [droplet] Full safety backup.** Architecture §4.2 step 1. Verify: tar
exists on droplet, non-trivial size (`ls -lh /root/pre-sovereign-sync-*`).

**1.2 [droplet] Fossil removal.** Architecture §4.2 step 2. Enumerate before
deleting; keep only `nostalgia.md` + `high-stakes-field-day.md` in
`vault/pages/designs/`, keep only dirs matching `vault/pages/skins/*.md`
slugs in `designs/`, remove `/opt/portfolio-site/dist/` entirely. Verify:
`ls` of each dir matches the keep-list exactly.

**1.3 [droplet] Rebuild + redeploy static + restart.**
`cd /opt/portfolio-site && node scripts/build-site.mjs`, then from local repo
run deploy-skill Step 1 rsync only, then `pm2 restart portfolio`. Verify:
`pm2 logs portfolio --lines 20` shows clean boot; site loads.

**1.4 [portfolio] Deploy skill rewrite.** Edit
`.agent/skills/deploy/SKILL.md`: Step 2 becomes the Architecture §4.1 command
(with `--delete` + full exclude list) **plus** the exclude→reason table, and a
warning that removing an exclude is a data-loss event requiring the 1.1
backup procedure first. Verify: doc renders correctly; exclude list matches
Architecture §4.1 verbatim.

**1.5 [portfolio] build-site.mjs allowlist.** In `scripts/build-site.mjs`,
find where design-detail pages are compiled from `vault/pages/designs/*.md`.
Change: only docs whose `x_kind` is absent-and-legacy (the two real designs)
or explicitly `"portfolio-design"` are built; anything with `x_kind:
"theme-skin"` or unknown `x_kind` values is skipped **with a console.warn
naming the skipped file**. Prefer tightening to a positive allowlist: add
`x_kind: "portfolio-design"` to `nostalgia.md` and
`high-stakes-field-day.md` and require it. Verify: `npm test` green; local
build output `dist/site/designs/` contains exactly
`nostalgia.html`, `high-stakes-field-day.html` (+ index).

**1.6 [droplet] First hardened deploy.** Run the full updated deploy skill
end-to-end. Verify (this is success criterion #1): clown-car returns 404
(`curl -s -o /dev/null -w '%{http_code}' https://gregiteen.xyz/designs/clown-car/index.html`);
super-mario flipper theme still loads with all four assets 200; runtime data
(`.data/sessions.json`, `vault/pages/skins/`, `designs/<live-skins>`)
untouched on droplet (compare mtimes before/after).

---

## Phase 2 — Runtime data as SSSS (portfolio)

**2.1 [portfolio] Registry.** Create `vault-registry/` per the layout proven
in 0.4: `extensions/portfolio.json` (Architecture §3.1 content) + core
resolution + `scripts/sync-registry.mjs` (copies core.json from
node_modules; add `"sync-registry"` npm script; run it in build/postinstall
so the copy never goes stale). Verify: 0.4's export command now works from
repo paths (not scratch).

**2.2 [portfolio] runtime-store module.** Create `scripts/runtime-store.mjs`
with exactly the Architecture §3.3 surface. Frontmatter serialization via
`@ssss/cli/frontmatter` (check its exports for a stringify counterpart of
`parseDocument`; if none exists, write one local `serializeDocument()` in
runtime-store — YAML via a minimal hand-rolled emitter is acceptable **only**
for the flat/2-level shapes in Architecture §3.2). Debounced atomic writes
mirroring `saveSessions()` (`serve.mjs:164-178`). Verify: a standalone smoke
script (put in scratchpad, not the repo) can upsert a visitor + proposal,
re-`initRuntimeStore()`, and read identical data back.

**2.3 [portfolio] Wire serve.mjs — visitors.** Every `visitorProfiles.set(…)`
site calls `upsertVisitor()`; boot calls `initRuntimeStore()` before
`loadSessions()`; `loadSessions()` stops reading/writing `profiles` (tokens
only — keep backward-compat read of old `sessions.json` shape for one
release: if `raw.profiles` exists, migrate them into the store once).
Verify: boot logs show migrated/loaded visitor count; `npm test` green.

**2.4 [portfolio] Wire serve.mjs — proposals.** Every `proposalThreads`
mutation (creation in the CNA flow, revisions in `/api/proposal-reply`,
deletion in admin DELETE) goes through `upsertProposal()` with the §3.2
status vocabulary; boot hydrates the Map from the store. Verify: create a
proposal via local CNA flow (or a scratch driver calling the same functions),
kill + restart serve.mjs, `GET /api/admin/proposals` still lists it.

**2.5 [portfolio] Deferred notifications survive restarts.** On hold: write
`pending_notification` into the visitor doc; on send: null it. At boot:
re-arm a timer for every visitor with non-null `pending_notification`
(30-min fallback semantics preserved). Verify: hold a notification, restart,
observe the email still fires (use a scratch SMTP log or MAIL_OWNER inbox).

**2.6 [portfolio] Generation runs.** In the generation queue code
(`genJob`/`genQueue` region, and `compile-theme.mjs` spawn sites), append a
`generation_run` doc at start and finalize it (status/finished_at/error) at
completion. Verify: run one local generation; doc appears in
`vault/runtime/runs/` with correct lifecycle fields.

**2.7 [portfolio] Portability proof.** `npx ssss export vault --profile sale
--registry vault-registry --show-dropped --out /dev/null` → every
`vault/runtime/**` file listed as dropped; `--profile backup` export
validates and its `primitive_inventory` counts visitor_profile/proposal/
generation_run. Verify: both behaviors observed (success criterion #3).
Also: `.gitignore` gains `vault/runtime/` (runtime data never enters git).

**2.8 [portfolio] Deploy Phase 2.** Deploy via skill; confirm boot on droplet
hydrates cleanly (pm2 logs), and `vault/runtime/` starts populating from real
traffic. Verify: restart durability spot-check on droplet (`pm2 restart
portfolio` → proposals/visitors intact).

---

## Phase 3 — Sync bridge

**3.1 [portfolio] Bearer admin auth.** Extend `isAdmin()` (`serve.mjs:488`)
per Architecture §3.4 (timing-safe, length-guarded, only when
`ADMIN_API_TOKEN` set). Generate a strong token (`openssl rand -hex 32`),
add to droplet `/opt/portfolio-site/.env` and local `.env.example` (name
only, no value). Verify: `curl -H "Authorization: Bearer $T"
https://gregiteen.xyz/api/admin/stats` → 200; wrong token → 403; no cookie +
no token → 403.

**3.2 [portfolio] Export endpoints.** Implement `GET /api/admin/export-bundle`
and `GET /api/admin/export-assets` per Architecture §3.4 (spawned child
processes, streamed responses, 500+stderr-tail on failure). Verify: `curl
-H … export-bundle | npx ssss validate /dev/stdin` (or save then validate)
passes; export-assets untars locally and contains `designs/` + skins.

**3.3 [portfolio] Decision endpoint.** Implement
`POST /api/admin/proposals/:id/decision` per Architecture §3.4. **First**
locate the "send it" branch and the AI-iteration branch inside the
`/api/proposal-reply` webhook handler; extract each into a named function
(`sendProposalToClient(thread)`, `reviseProposal(thread, notes)`) so both the
webhook and the new endpoint call the same code. Idempotency: approving an
already-`sent` proposal → 200 `{noop:true}`. Verify: local drive of all three
actions against a seeded proposal; email paths observed; doc status
transitions correct; re-approve is a no-op.

**3.4 [total-recall] Sync module.** Create `src/core/portfolio-sync.mjs` per
Architecture §3.5. Read `src/core/scheduler.mjs` first and register the job
exactly like an existing job; read `src/core/config.mjs` for how settings are
declared/exposed. `runSync()` never throws. Verify: unit spec
`portfolio-sync.spec.mjs` (mock fetch + spawned ssss) covering success,
unreachable droplet, invalid bundle; `npx vitest run src/core/portfolio-sync.spec.mjs` green.

**3.5 [total-recall] First real sync + brain registration.** Set
`PORTFOLIO_ADMIN_TOKEN` in TR's environment, enable the job (or trigger
manually via a small `POST /api/sync/portfolio/run` route added in the same
commit — mount pattern from `routes/research.mjs`). After a run: bundle
imported into `~/.agent/tenants/portfolio-site/vault/`, status JSON written.
Then make the tenant visible: try `node bin/total-recall.mjs brain register
~/.agent/tenants/portfolio-site`; if `/api/brains` doesn't pick it up, extend
that route (rest.mjs ~1720) to include registered tenant paths. Verify:
`GET /api/brains` lists the portfolio brain with a node count > 0;
re-running sync is a no-op diff (idempotent).

**3.6 [total-recall] Sync status surface.** `GET /api/sync/portfolio/status`
returns the status JSON; failures from 3.4's error paths appear there.
Verify: unplug (bad token) → status shows `ok:false` + error; restore → ok.

---

## Phase 4 — Total Recall SSSS document manager + approvals

**4.1 [total-recall] Docs API.** New `src/server/routes/docs.mjs` per
Architecture §3.6: list/filter (type, portability, status, tag, xKind, q,
pagination), read, create/update/delete with path-safety and validated-write
(read `src/core/validated-write.mjs` first and route writes through it or its
underlying validator). Scopes `ssss:read`/`ssss:write` (add `ssss:write`
following the existing scope-declaration pattern if absent). Portability
resolved from registry (core + any extension registries present in the brain
dir — the portfolio tenant vault ships types the core doesn't know; resolve
from `vault-registry` files if the bundle carried them, else fall back to
`tenant_private` for unknown types and flag `portability_source:"fallback"`).
Verify: `docs.spec.mjs` covering list-with-filters, read, create, update,
delete, traversal rejection (`../`, absolute), unknown-brain 404;
suite green.

**4.2 [total-recall] Saved-views API.** `GET/POST/DELETE /api/views` backed by
`~/.agent/config/saved-views.json` (atomic write). Verify: spec covers CRUD +
persistence across a re-read.

**4.3 [total-recall] VaultPage UI.** New `frontend/src/pages/VaultPage.tsx`
per Architecture §3.6 UI spec + `frontend/src/api.ts` client functions +
route/nav registration (mirror FilesPage wiring in `App.tsx`). Reuse
`BrainSelector`, `MarkdownUtils`; borrow interaction patterns from
`MemoryPage.tsx` (debounced search) and the Scripts editor (save flow).
Verify: code-quality scripts pass (`node .agent/skills/code-quality/scripts/start-here-ts.mjs`,
`…/start-here-lint.mjs`); manual walkthrough against the live local server:
filter by type=proposal, open a doc, edit+save, create+delete a scratch doc,
save a view, reload, apply it (success criterion #4).

**4.4 [total-recall] Proposals inbox.** `frontend/src/pages/ProposalsPage.tsx`
+ server proxy `POST /api/sync/portfolio/proposals/:id/decision` (server-side
fetch to droplet using `PORTFOLIO_ADMIN_TOKEN`; browser never sees the token)
+ optimistic update + post-decision `runSync()`. Verify: spec for the proxy
route (mocked droplet); UI walkthrough with a seeded synced proposal.

**4.5 [total-recall] Pointer doc.** Create
`docs/projects/in-progress/SOVEREIGN_SYNC_POINTER.md` in the total-recall
repo: one page linking to this folder in portfolio-site, listing which
total-recall files this project added/changed. Verify: file exists, accurate.

---

## Phase 5 — Testing & Verification (mandatory — see tracker)

The tracker's Phase 5 checklist is the authoritative list (T1–T8). Highlights:

- **T1 Live-site smoke** (fossils gone, themes intact, flipper works).
- **T2 Restart durability** — the headline scenario: seed proposal → deploy
  (full skill, including pm2 restart) → proposal + visitors + sessions
  intact → deferred notification still fires.
- **T3 Portability proof** (sale drops runtime docs; backup carries them).
- **T4 Sync round-trip** (droplet → TR import → brains listing; idempotent).
- **T5 Approval end-to-end** (approve in TR UI → client email from droplet →
  status `sent` everywhere after next sync). Success criterion #5.
- **T6 Security checks** (no token/secret in any vault doc, bundle, or git
  diff; traversal attempts rejected; wrong bearer 403).
- **T7 Both suites + conformance** (`npm test`, `npx vitest run`,
  `npx ssss conformance --engine`).
- **T8 Docs sync** — update `.docs/PORTFOLIO_PROJECT_ARCHITECTURE.md` and the
  deploy skill to reflect end state; archive this project per the
  project-management lifecycle (move to `completed/`, extract deferred items
  to `docs/projects/DEFERRED_BACKLOG.md`).

## Deferred (explicitly out of this project — seed for DEFERRED_BACKLOG.md)

- `RUNTIME_DATA_DIR` relocation of generated designs out of the deploy tree.
- Two-way generic sync (TR-edited docs pushed back to droplet beyond
  proposal decisions).
- Drip campaigns, DocuSign-alternative signing flow.
- Visitor-profile analytics/reporting inside Total Recall.
- Binary assets inside `.ucw` bundles (spec question for `ssss` repo).
