# PORTFOLIO_PERSONAL_SITE — Audit

> **Project Prefix**: `PORTFOLIO_PERSONAL_SITE`
> **Kanban State**: 🏗️ In Progress
> **Author**: Greg Iteen (audit by Claude)
> **Date**: 2026-09-28
> **Audit Status**: Complete
> **Audited commit**: e2c8ed3

---

## Process note

This audit was written **after** a PRD, architecture, plan and tracker had been drafted and after edits to `scripts/serve.mjs`, `static/splash.html`, `static/verify.html`, `scripts/lib/site-mode.mjs`, `scripts/sync-jobs.mjs` and `package.json` (all uncommitted at the time of the audit). Greg pointed out that the audit must come first. The unaudited drafts were rewritten from this audit (each now cites it) and the uncommitted code is re-checked against the findings below before it is committed. The audit itself changed no code. The only repo changes made during the audit were housekeeping commits that were already pending in the working tree (agent-skill sync, `.env.bak*` ignore).

## 1. Scope and method

- **Request:** (a) build the Job Search Navigator (JSN) dashboard frontend in this repo, hosted at gregiteen.xyz; (b) disable site generation and make the site a plain site about Greg; (c) `me@gregiteen.xyz` is the email address for the job search.
- **In scope:** this repository (`portfolio-site`, HEAD `e2c8ed3`), its deploy script, and the boundary with the `job-search-navigator` repo (API only).
- **Out of scope:** the droplet's nginx/PM2/mail server configuration (not readable from here), other repos, the visual redesign of the site.
- **Method:** read `scripts/serve.mjs` routing, auth and admin sections in full; searched all other scripts by pattern; read the vault pages, `deploy.sh`, `.gitignore`, `package.json`; enumerated env vars, routes, tracked files and sizes with shell commands; ran the full test suite from a clean `git archive HEAD` export on the Mac mini (`npm ci` then `node --test --test-concurrency=1 test/*.test.mjs`, Node 25.9.0).
- **Not verified:** production behaviour on the droplet, nginx rules, whether `SITE_GENERATION_ENABLED` is set there, DNS/SMTP for `me@gregiteen.xyz` in this repo's mail stack.

## 2. Inventory

| Area | Path | Size | Authored / generated | Tracked |
|---|---|---|---|---|
| Server | `scripts/serve.mjs` | 3,765 lines | authored | yes |
| Static builder | `scripts/build-site.mjs` | 1,736 lines | authored | yes |
| Theme generator | `scripts/compile-theme.mjs`, `lib/theme.mjs`, `improve-theme.mjs`, `promote-theme.mjs`, `lib/theme-release.mjs` | ~3,000 lines | authored | yes |
| Runtime store | `scripts/runtime-store.mjs`, `lib/crm-store.mjs`, `lib/evidence-store.mjs` | ~1,500 lines | authored | yes |
| Mail/webmail | `lib/imap.mjs`, `lib/webmail*.mjs`, `lib/mailcow-password.mjs` | ~800 lines | authored | yes |
| Brand-asset one-offs | 18 `scripts/gen-*.mjs`, `crop-logos`, `regenerate-brand-marks`, `make-transparent` | ~2,000 lines | authored, single-use | yes |
| Static pages | `static/` (19 files: splash, verify, generate, consult, crm-app, ...) | small | authored | yes |
| Content | `vault/pages` (home, about, contact, 4 projects, 2 designs; 923 words total), `vault/campaigns`, `vault/tasks`, `vault/workflows`, `vault/rules`, `vault/assistants` | 240 KB | authored | yes |
| Runtime state | `vault/runtime/**`, `vault/.events`, `vault/pages/skins`, `designs/` (14 MB), `dist/` (423 MB) | large | generated | ignored |
| Assets | `assets/` (47 MB, 88 files), `evidence-library/` (5.6 MB, 45 files) | | authored/generated | yes |
| Agent tooling | `.agent/skills` (129 files), `.agents/`, `.claude/` (584 MB, incl. `.claude/worktrees/sleepy-payne-4f1970`) | | tooling | skills yes, `.claude` ignored |
| Tests | `test/*.test.mjs` (15 files, 120 tests) | | authored | yes |

- **Entry points:** `npm run dev` (`build-site.mjs` then `serve.mjs`), `npm run build`, `scripts/deploy.sh`.
- **Stray root files tracked:** `center_logos.py`, `crop_aggressive.py`, `crop_perfect.py`, `debug_crop.py`, `fix_logos.py`, `perfect_extract.py`, `slice_logos.py`, `smart_crop.py`, `get_msgs.py`, `msgs.txt`, `patch_proposal.js`, `test-imap.mjs`, `test-proposal.mjs`, `test-pw.mjs`, `test.pdf`, `set-mailcow-pass.sh`.
- **Tracked but should not be:** `vault/visitors.md` (visitor emails, IPs, user agents; deploy excludes it but git tracks it). An untracked `.env.bak-mailcow-20260927-183712` was present in the working tree (secrets); it is now covered by `.env.bak*` in `.gitignore`.

## 3. Runtime surface

### Routes (all in `scripts/serve.mjs`; line numbers at HEAD plus the uncommitted edits noted in section 1)

| Route | Method | Who can call it | Notes |
|---|---|---|---|
| `/splash.html`, `/verify.html`, `/consult.html`, `/forgot.html`, `/reset.html` | GET | public | visitor email-verification funnel |
| `/api/send-code`, `/api/verify-code`, `/api/forgot-password`, `/api/reset-password`, `/api/session`, `/api/logout` | POST/GET | public (rate-limited) | email 2FA login for **any** email; issues `gi_auth` |
| `/api/test/logout` | any | public | test hook shipped to production |
| `/dev-status`, `/generate-status`, `/generate-theme`, `/generating-asset/*` | GET/POST | public | AI theme generation job and progress |
| `/api/intake`, `/api/visitor-exit`, `/api/banner-offers`, `/api/banner-event`, `/api/track/pixel`, `/api/track/link` | GET/POST | public | lead-gen intake, banner offers, email tracking |
| `/api/cna-state`, `/api/cna`, `/api/cna-proposal`, `/api/proposal-reply`, `/proposal/*`, `/sign/*` | GET/POST | public (unguessable ids) | client-needs-assessment and proposal flow |
| `/api/calendar/availability`, `/api/calendar/book` | GET/POST | public | booking |
| `/api/create-checkout-session`, `/api/stripe-webhook`, `/api/documenso-webhook`, `/api/documenso/sso/consume` | POST | public / signed | payments and e-sign |
| `/api/unsubscribe`, `/api/health` | GET | public | |
| `/api/crm/*` (leads, opportunities, applications, gig-listings, pipeline, due, inbox, snapshots) | GET/POST | `isAdmin` | Revenue OS |
| `/crm-app.html` | GET | authenticated | CRM UI |
| `/api/admin/*` (delivery, evidence, documenso, revenue, stats, visitors, campaigns, drip, research, themes, export-bundle, export-assets, proposals, settings, deploy, webmail, calendar, improve, logs) | GET/POST | `isAdmin` | `POST /api/admin/deploy` runs `git reset --hard`, `npm ci`, `npm run build`, `pm2 reload` |
| mail.gregiteen.xyz (host header) | any | own auth | standalone webmail |
| everything else | GET | **authenticated visitor** (`isPublicPath` returns false) | static site from `dist/site` |

### Scheduled jobs and background processes

Boot-time recovery and requeue of interrupted theme generations (`serve.mjs` ~560); generation queue (`requestGeneration`); legacy daily theme improver (off unless `ENABLE_LEGACY_THEME_IMPROVER=1`); drip email scheduler every `DRIP_TICK_MS`; vault file watcher that rebuilds on change; Total Recall sync.

### Environment variables

About 75 distinct variables read from `process.env` (full list from `grep -ohE "process\.env\.[A-Z0-9_]+"`). Groups: mail (`MAIL_*`, `SMTP_*`, `IMAP_*`, `WEBMAIL_*`, `MAILCOW_ROOT`), admin (`ADMIN_EMAIL`, `ADMIN_API_TOKEN`), payments/e-sign (`STRIPE_*`, `DOCUMENSO_*`), models (`GOOGLE_API_KEY` 23 reads, `OPENROUTER_API_KEY`, `CNA_MODEL`, `PROPOSAL_MODEL`, `THEME_*`, `DEFAULT_MODEL`, `FAL_KEY`), gig feeds (`UPWORK_FEED_URL`, `GREENHOUSE_BOARD_TOKENS`, `LEVER_SITES`), `GITHUB_TOKEN`, drip (`DRIP_*`), generation delivery (`DELIVERY_*`). New in this project: `SITE_GENERATION_ENABLED`, `JSN_URL`, `JSN_API_TOKEN`, `JSN_REPO` (sync script only).

## 4. Data and state

| State | Location | Format | Writer | Personal data? | Deployed / synced? |
|---|---|---|---|---|---|
| Portfolio content | `vault/pages/**` | SSSS Markdown | Greg / agents | no | deployed |
| Visitor profiles, proposals, generation runs, leads, opportunities | `vault/runtime/**` | SSSS docs | server | **yes** | excluded from deploy, ignored by git |
| Auth sessions | `.data/` and in-memory `authTokens` | JSON | server | emails | excluded |
| Visitor log | `vault/visitors.md` | Markdown table | server | **yes** (email, IP, UA) | **tracked in git**, excluded from deploy |
| Generated skins | `vault/pages/skins/`, `designs/` | Markdown + HTML | generator | no | excluded; droplet-owned |
| Campaign templates | `vault/campaigns/**` | Markdown | Greg | no | deployed |
| JSN job-search data | **not in this repo** (JSN `vault/`) | SSSS | JSN | **yes** | must never enter this repo or a deploy |

## 5. Integrations

| Service | Credential | Source | Used at |
|---|---|---|---|
| Google Gemini (generativelanguage API) | `GOOGLE_API_KEY` | env; also settable at runtime via `POST /api/admin/settings` (`serve.mjs` 3549) | grounded enrichment (2675, 3371), `geminiCall`, `improve-theme.mjs`, 18 `gen-*.mjs` |
| OpenRouter | `OPENROUTER_API_KEY` | env | CNA and proposal text models, theme pipeline (`lib/openrouter.mjs`) |
| Mail: Mailcow (SMTP/IMAP), webmail | `MAIL_*`, `SMTP_*`, `IMAP_*`, `PORTFOLIO_WEBMAIL_*` | env | login codes, drip, proposals, webmail |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | env | checkout |
| Documenso | `DOCUMENSO_*` | env | e-sign |
| GitHub | `GITHUB_TOKEN` | env | deploy hook clone |
| fal.ai | `FAL_KEY` | env | images |
| Total Recall | local CLI | | memory sync, `scripts/patch-total-recall-surface.mjs` |
| Droplet `138.197.199.217` | ssh as root | operator's key | `deploy.sh` |

None of the credentials are in the repo (`.env` ignored; the stray `.env.bak-mailcow-*` was untracked). Keys are not in the Total Recall secret store: they are droplet env vars.

## 6. Security and privacy

- **Authentication.** `isAuthenticated` = valid `gi_auth` cookie; anyone who completes an email code becomes "authenticated". `isAdmin` = session email equals `mailOwner` or `ADMIN_EMAIL`, or a webmail session for the owner or the hardcoded `sales@gregiteen.xyz`, or `Authorization: Bearer ADMIN_API_TOKEN` (constant-time compare, length pre-check). Reasonable, because the code is sent to the address. The hardcoded address must change to `me@gregiteen.xyz` (A-008).
- **Cookie.** `gi_auth` is `HttpOnly; SameSite=Lax` but not `Secure` (`serve.mjs` 2068) (A-007).
- **Deploy hook.** `POST /api/admin/deploy` lets a bearer token trigger `git reset --hard origin/main`, `npm ci`, build, and PM2 reload as the server user (A-005). The comment records a past incident where an earlier version wiped untracked runtime directories.
- **`deploy.sh`** uses `root@` with `StrictHostKeyChecking=no` and a hardcoded IP (A-004).
- **`/api/test/logout`** is unauthenticated and only clears the caller's own session; harmless but should not ship (A-006).
- **New surface added by this project** (`/api/jsn/*` proxy): admin only, path allowlist, no cookie forwarding, token added server side, body cap, timeout. JSN itself refuses non-loopback binds without `JSN_API_TOKEN`. Residual risk: the proxy exposes the whole JSN API to an admin session; acceptable because that is the same person and the same data.
- **Injection/traversal.** Static serving normalizes and prefix-checks (`serve.mjs` ~3700). `/generating-asset/` validates the filename. Not exhaustively fuzzed.
- **PII in git.** `vault/visitors.md` (A-014). Runtime PII directories are ignored.

## 7. Standing-rule conflicts

| Rule (source) | Conflict | Evidence | Finding |
|---|---|---|---|
| Avoid the Gemini/Google Generative Language API; prefer OpenRouter (user preference, Total Recall) | Active code calls Gemini | `serve.mjs` 2639-2675, 3364-3371, 3535-3549 (10 refs); `improve-theme.mjs` (5); 18 `gen-*.mjs` scripts; `geminiCall` | A-003 |
| Secrets only through the Total Recall secret store | Credentials are droplet env vars | section 5 | A-011 (P3, noted, not in scope) |
| Total Recall must be generic/open-source: no user-specific hardcoding | N/A to this private site, but `sales@gregiteen.xyz` is hardcoded in five places while Greg now uses `me@gregiteen.xyz` | `serve.mjs` isAdmin, `webmail-ui.mjs` 140/186, `mailcow-password.mjs` 96, `letterhead.mjs` 11, `crm-app.html` 401 | A-008 |
| "Fix errors immediately" | Clean install and deploy are broken | section 8 | A-001 |
| Project docs: every project starts with an audit | Drafts were written first | process note | A-013 |

## 8. Quality baseline

- **Host and command:** Mac mini, clean export of `e2c8ed3`; `npm ci` then `node --test --test-concurrency=1 test/*.test.mjs`.
- **`npm ci` fails.** `postinstall` runs `node scripts/sync-registry.mjs && node scripts/patch-total-recall-surface.mjs`. The second script throws `Total Recall 3.32.0 no longer matches the expected surface compiler. Refusing to apply a partial compatibility patch.` (`patch-total-recall-surface.mjs:99`). The lock file resolved 3.32.0 (the working tree's `package.json` asks for `^3.32.4`, the lock was not regenerated).
- **Tests:** 120 run, 119 pass, 1 fail. The failure is `test/total-recall-surface.test.mjs`, which imports `loadSurfaceNodes` from `total-recall-brain/src/core/surface.mjs`; that export does not exist in the installed 3.32.0 or in current Total Recall, so the file crashes at import. Cause: the same obsolete compatibility patch.
- **Why the patch is obsolete:** it rewrites `node_modules/total-recall-brain/src/core/surface.mjs` so project surfaces inherit global directives, break ties toward project directives, and avoid whitespace-only lines. Current Total Recall does this natively (`mergeGlobalRuleNodes`, `surface.mjs:765`).
- **Consequence:** `deploy.sh` step 3 runs `npm ci --include=dev` on the droplet and aborts with "CRITICAL: Production dependency install or build failed" (A-001). The web deploy hook runs the same `npm ci` and would also fail.
- **Coverage gaps:** no test imports `serve.mjs` (it has import-time side effects), so routes, auth gating, `isPublicPath` and every redirect are untested. Lint/type: no linter configured beyond `.agent/skills/code-quality`, not run here.

## 9. Debt and dead code

- `serve.mjs` is a 3,765-line monolith with import-time side effects (A-012).
- 18 single-use `gen-*.mjs` scripts and 8 Python/JS logo-cropping scripts at the root (A-009).
- Half-built or over-claimed features noted in the repo's own docs ("features were historically over-claimed").
- The generation pipeline (compile/improve/promote/theme-release, waiting page, flipper injected by `build-site.mjs`, `/generate.html`) is large and now disabled by design.
- 584 MB `.claude/worktrees/sleepy-payne-4f1970` copy inside the repo (ignored).

## 10. Deploy and operations

- `scripts/deploy.sh`: `rsync --delete dist/site/` to `/var/www/gregiteen.xyz/`, then `rsync --delete` the repo to `/opt/portfolio-site/` with excludes for `node_modules`, `.git`, `.env`, agent dirs, `designs`, skins, `vault/runtime`, `vault/.events`, `vault/visitors.md`, `dist`, and a protect filter for `vault/pages/designs/**`; then `npm ci` and `npm run build` on the droplet; waits up to 900 s for a running generation; `pm2 reload portfolio`.
- **What a deploy can destroy:** anything on the droplet under `/opt/portfolio-site` not excluded. `static/jobs.*` and `scripts/lib/site-mode.mjs` deploy normally. **JSN data can never deploy** because JSN's vault is in another repo.
- **Rollback:** none scripted; git history plus manual rsync.
- Env changes (`SITE_GENERATION_ENABLED`, `JSN_URL`, `JSN_API_TOKEN`) must be set in PM2's environment on the droplet; not checked here.

## 11. Content and product fit

- `home.md`: "Greg Iteen — Builder of Local Software", "I build AI systems that own their own memory". `about.md`: software engineer, toolbox list (TypeScript, Python, Postgres, ...). The four project pages (festech, ssss, total-recall, ultrachat) and two design pages are engineering/design showcase pieces.
- Greg's active goal is a job search for Account Executive, Inside/Outside Sales, Automation Specialist, AI Solutions and GTM AI roles in Denver/remote. The site does not mention sales, quotas, results or those roles (A-010).
- Lead-gen copy is baked into the visitor experience: drip campaigns, the waiting-page intake, proposals, a rate card (`static/rate-card.pdf`), and the email copy "every visitor gets their own edition" (`serve.mjs` ~732).
- `contact.md` needs `me@gregiteen.xyz`.

## 12. Findings register

| ID | Severity | Finding | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|---|
| A-001 | P0-critical | Clean `npm ci` fails and production deploy aborts | `patch-total-recall-surface.mjs:99`; mini `npm ci` exit 1 | cannot deploy any change | remove the obsolete patch script, its `postinstall` call, and its test; bump/lock Total Recall | fix in this project (Phase 1) |
| A-002 | P1-high | Test suite is red (119/120) because of A-001 | `test/total-recall-surface.test.mjs` import error | false alarm masks real regressions | resolved by A-001 fix | fix in this project |
| A-003 | P1-high | Gemini API used in active code and scripts | section 7 | breaks the no-Gemini rule; budget exhausted so enrichment silently degrades | port enrichment and `improve-theme` to OpenRouter (`lib/openrouter.mjs`), delete the 18 one-off `gen-*.mjs`, remove the runtime `apiKey` setter | fix in this project (enrichment and admin setter); improve-theme is disabled with generation |
| A-004 | P2-medium | `deploy.sh` hardcodes IP and root, disables host-key checking | `deploy.sh:7,41,47,60,73` | MITM window, not portable | move host to env/config, use known_hosts | defer (own project) |
| A-005 | P2-medium | Web deploy hook does destructive git/npm actions from a bearer token | `serve.mjs` ~3559 | token theft equals code execution | keep, require admin session plus token, log; or remove now that deploys use ssh | defer |
| A-006 | P3-low | `/api/test/logout` ships to production | `serve.mjs` 1643 | none material | gate behind `NODE_ENV=test` | fix in this project |
| A-007 | P2-medium | Auth cookie lacks `Secure` | `serve.mjs` 2068 | cookie could travel over http if mis-routed | add `Secure` when `X-Forwarded-Proto=https` or `SITE_URL` is https | fix in this project |
| A-008 | P2-medium | `sales@gregiteen.xyz` hardcoded; Greg uses `me@gregiteen.xyz` | section 7 | admin login and outgoing mail identity wrong | one `ADMIN_EMAIL`/`MAIL_FROM` source; default `me@gregiteen.xyz`; remove literals | fix in this project |
| A-009 | P3-low | Stray root scripts and 18 one-off generators tracked | section 2 | noise, Gemini keys in scripts | delete | fix in this project |
| A-010 | P1-high | Site copy does not match the current purpose | section 11 | the site does not support the job search | rewrite home/about/contact around sales/AE/automation/AI roles using facts from JSN's `PROFILE.md`; Greg approves the copy | fix in this project (needs Greg's approval of copy) |
| A-011 | P3-low | Credentials are droplet env vars, not in the Total Recall secret store | section 5 | drift, no audit trail | later | defer |
| A-012 | P2-medium | `serve.mjs` cannot be imported by tests | 3,765 lines, import-time side effects | routing/auth changes untestable | new logic in `scripts/lib/site-mode.mjs` (done); add a spawn-based smoke test; split later | fix new code in this project; split deferred |
| A-013 | P3-low | Docs and code were written before this audit | process note | rework risk | rewritten from this audit | done |
| A-014 | P2-medium | `vault/visitors.md` (PII) is tracked | `git ls-files` | PII in history | `git rm --cached`, add to `.gitignore` | fix in this project |
| A-015 | P1-high | Whole site is behind an email-verification wall | `isPublicPath` (`serve.mjs` 1270) | visitors cannot see the portfolio; a site about Greg must be public | public mode when generation is off (done, uncommitted) | fix in this project |
| A-016 | P1-high | Generation is woven through the visitor flow (splash → verify → generate, flipper and generator scripts injected by `build-site.mjs`, skin redirects) | `serve.mjs` 1360-1430, `verify.html`, `build-site.mjs` ~780-840 | disabling only the endpoints leaves broken redirects and dead UI | flag-gate server (done, uncommitted), verify/splash (done), and remove flipper/generator injection when off | fix in this project |
| A-017 | P3-low | 584 MB worktree and 423 MB `dist/` in the working tree | `du` | disk only | clean the stale worktree | defer |
| A-018 | P2-medium | Mailcow-based webmail and mail stack is production infrastructure | `lib/webmail*`, `set-mailcow-pass.sh` | Greg has said he does not want Mailcow for JSN; unclear for the site | see decision D-3 | decision |

## 13. Impact on the requested change

| Requested change | Blocked / shaped / affected by | Findings |
|---|---|---|
| Deploy anything to gregiteen.xyz | **Blocked** until `npm ci` works | A-001, A-002 |
| Disable generation | Shaped: must cover routes, redirects, build injection and the email wall | A-015, A-016 |
| Site about Greg | Shaped: copy rewrite; visitor lead-gen material is left behind an admin-only or removed surface | A-010, A-015 |
| JSN frontend at `/jobs` | Affected by admin definition and auth cookie | A-007, A-008, A-012 |
| `me@gregiteen.xyz` | Affected by hardcoded addresses | A-008 |
| No Gemini | Affected: enrichment and scripts | A-003 |

## 14. Decisions

| Question (owner only) | Recommended default | Answer |
|---|---|---|
| D-1. Keep the CNA, proposals, CRM, e-sign and drip features in the code, unlinked from the public site? | Yes: keep the code, remove public entry points; they remain reachable to admin | pending |
| D-2. Delete the generation pipeline code or keep it behind the flag? | Keep behind `SITE_GENERATION_ENABLED` (reversible); revisit later | pending |
| D-3. Keep Mailcow webmail for the site, or move mail elsewhere? | Keep for now (it is live infrastructure); out of scope for this project | pending |
| D-4. Where does JSN run so the site can reach it? | Greg's laptop over the mesh with a token; the proxy shows "not connected" when it is off | pending |
| D-5. Positioning of the personal site (roles, tone, which projects to feature) | Sales/AE/automation/AI-solutions leading, engineering projects as proof; Greg approves the copy before it deploys | pending |

## Completion checklist

- [x] Sections 1–14 filled
- [x] Baseline tests run before any change (Mac mini, clean export of `e2c8ed3`)
- [x] Every finding has a severity and a disposition
- [x] `Audit Status` set to Complete and the audited commit recorded
