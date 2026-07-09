# Architecture overview

This repository is a portfolio site, but the technical shape is closer to a small SSSS-native application: Markdown vault content is parsed, rendered, merged with theme templates, and shipped as static HTML. The runtime server also handles visitor auth, generation jobs, CNA/proposal workflows, admin APIs, and persistent SSSS runtime records.

## High-level data flow
1. Content lives in `vault/pages/*.md` and `vault/pages/designs/*.md`.
2. `scripts/build-site.mjs` parses frontmatter with `@ssss/cli`, renders Markdown, and writes `dist/site/`.
3. Theme skins are generated through `scripts/compile-theme.mjs`, validated in `scripts/lib/theme.mjs`, and stored as `vault/pages/skins/*.md` plus per-skin build output under `designs/`.
4. `scripts/serve.mjs` serves the built site, watches the vault for changes, runs generation jobs, and exposes the app’s interactive endpoints.

## Main building blocks

### Static site builder
`/scripts/build-site.mjs` is the main compiler for the public portfolio.
- Reads from `vault/pages/` using the SSSS frontmatter parser.
- Uses a built-in Markdown renderer for headings, lists, links, bold/emphasis, code, and images.
- Categorizes pages by `x_kind` so the build can distinguish sections, projects, real design work, and theme skins.
- Injects generated layouts and theme CSS when a design layer is active.
- Produces `dist/site/` as the deployable static output.

### Theme generator and shared theme machinery
`/scripts/compile-theme.mjs` and `/scripts/lib/theme.mjs` define the skin pipeline.
- The generator asks an LLM or CLI agent for a theme plan, layouts, and images.
- `LAYOUT_SPECS` defines the placeholder contract for shell, home, index, detail, and item templates.
- `fillTemplate()` injects vault content into `{{PLACEHOLDER}}` slots.
- `validateThemePayload()` rejects malformed or incomplete generated payloads.
- `scopeCss()` scopes custom CSS so it only applies when the custom theme is active.

The important invariant is that **the model provides structure, not site copy**. All user-facing content is injected from the vault at build time.

### Runtime server
`/scripts/serve.mjs` is the operational core.
- Watches `vault/` and rebuilds when Markdown changes.
- Maintains 2FA auth, visitor sessions, and rate limits.
- Starts and tracks generation jobs for new skins.
- Runs the CNA and proposal endpoints.
- Exposes admin routes for exports, approvals, stats, settings, and logs.
- Hydrates and persists runtime state using SSSS-backed documents and a small token store.

## Important architecture boundaries
- **Vault content vs generated structure**: content is in `vault/`; generated theme structure lives in `designs/` and `vault/pages/skins/`.
- **Portfolio pages vs runtime artifacts**: portfolio pages are human-facing content; runtime docs are visitor/proposal/generation records.
- **Static build vs dynamic server**: the builder creates the deployable site, but the server owns visitor flows and admin operations.
- **Real designs vs theme skins**: real design pages are portfolio work; theme skins are runtime-generated visual variants and should not be treated as portfolio items.

## Source references
- `scripts/build-site.mjs`
- `scripts/serve.mjs`
- `scripts/compile-theme.mjs`
- `scripts/lib/theme.mjs`
- `docs/projects/in-progress/portfolio-platform/PORTFOLIO_PLATFORM_ARCHITECTURE.md`
