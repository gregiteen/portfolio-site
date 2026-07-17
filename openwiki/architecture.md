# Architecture overview

The repository has two coupled layers:

1. a static portfolio site built from Markdown in `vault/pages/`, and
2. a runtime/ops layer in `scripts/serve.mjs` that handles auth, visitor tracking, proposal workflows, generation jobs, and admin endpoints.

`vault/` is the source of truth. The code builds HTML from vault documents, then serves or deploys that output. Runtime state that must survive restarts is written back into vault-backed documents under `vault/runtime/`.

## Main execution paths

### Static build

`scripts/build-site.mjs` is the core site generator. It:

- reads Markdown pages from `vault/pages/`
- parses frontmatter with `@ssss/cli/frontmatter`
- renders Markdown into HTML with a minimal internal renderer
- classifies pages by `x_kind` to decide whether they are section pages, projects, designs, or theme-related artifacts
- injects theme/template sections from `scripts/lib/theme.mjs`
- writes output to `dist/site/`

The build script also supports standalone design builds through `--design <slug>` and has explicit handling for theme skins and legacy theme types.

### Runtime server

`scripts/serve.mjs` is the long-lived process. It:

- watches `vault/` and rebuilds the site on changes
- provides email verification and cookie-based auth
- manages generation jobs for theme creation
- persists sessions locally under `.data/sessions.json`
- hydrates runtime visitor/proposal state from `vault/runtime/`
- sends emails via Nodemailer
- exposes admin and workflow APIs used by the interactive portfolio experience

### Runtime persistence

`scripts/runtime-store.mjs` is the vault-backed storage layer. It serializes runtime records into Markdown files under:

- `vault/runtime/visitors/`
- `vault/runtime/proposals/`
- `vault/runtime/runs/`

This is the repo’s main durability mechanism. The server keeps in-memory caches for request handling, but the canonical records live in Markdown.

### Registry and contracts

`package.json` wires `postinstall` to `scripts/sync-registry.mjs`, which copies the canonical SSSS registry into `vault-registry/core.json`. Tests in `test/ssss-conformance.test.mjs` depend on that registry being current.

`scripts/lib/theme.mjs` is the contract layer for generated theme docs. It contains the template and CSS-scoping logic that the build and runtime generator both rely on.

## Data flow

The simplest path is:

`vault/pages/*.md` → `build-site.mjs` → `dist/site/`

The richer visitor flow is:

1. a visitor submits a style prompt and email
2. the server starts generation immediately
3. verification code email is sent
4. once verified, the visitor lands in the generated portfolio experience
5. runtime profiles/proposals/runs are persisted into vault-backed Markdown docs
6. approval and notification workflows continue through the server and admin endpoints

## Source references

- `scripts/build-site.mjs`
- `scripts/serve.mjs`
- `scripts/runtime-store.mjs`
- `scripts/sync-registry.mjs`
- `scripts/lib/theme.mjs`
- `vault-registry/core.json`
- `vault/pages/home.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_ARCHITECTURE.md`
