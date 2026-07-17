# OpenWiki quickstart

This repository is a file-native portfolio platform built on **SSSS** (Structured Semantic Syntax System). The Markdown vault under `/vault` is the source of truth for site content, while the runtime scripts build static pages, generate bespoke visual skins, and serve a lead-generation workflow with visitor auth, CNA/proposal flows, and admin tooling.

Start here if you need to understand the repo quickly:
- [Architecture overview](architecture/overview.md)
- [Content and business domains](content-and-domains.md)
- [Operations and runtime behavior](operations.md)
- [Integrations and external systems](integrations.md)
- [Testing and verification](testing.md)

## What this repo does
- Builds a public portfolio site from Markdown in `vault/pages/`.
- Generates and serves AI-designed visual skins from a prompt-driven theme pipeline.
- Captures visitor emails, verifies access, and stores durable runtime state in SSSS documents.
- Runs a client-needs-assessment flow that produces proposals and routes approvals.
- Syncs runtime data into Total Recall and supports admin operations from the server.

## Primary source areas
- `vault/pages/` — canonical portfolio content, projects, designs, and page copy.
- `vault/runtime/` — durable runtime documents for visitors, proposals, and generation runs.
- `vault/pages/skins/` — generated theme-skin documents used by the flipper/theme pipeline.
- `scripts/` — build, serve, theme generation, registry sync, promotion, and improvement jobs.
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/` — consolidated product, architecture, implementation, and verification plan for the visitor-to-client platform.
- `.agent/skills/` — operational skills that govern deploys, quality checks, security, and project management.

## Core concepts to keep straight
- **Content is vault-owned.** Site text comes from Markdown in `vault/`; generated themes only provide structure and styling.
- **Skins are not portfolio work.** Theme-skin docs under `vault/pages/skins/` and generated builds under `designs/` are runtime artifacts.
- **Runtime data is durable.** Visitor profiles, proposals, and generation runs are stored as SSSS documents, not ad hoc JSON blobs.
- **Deploys are strict.** The deploy skill uses rsync with `--delete` and explicit excludes; do not treat deploys as commits.
- **Testing matters.** The repository’s own docs say features were historically over-claimed; check the verification docs before changing major flows.

## Useful entrypoints
- `README.md` — concise repo summary and common commands.
- `package.json` — canonical scripts.
- `scripts/build-site.mjs` — static-site assembly and theme injection.
- `scripts/serve.mjs` — dev/prod server, auth, runtime state, CNA, admin APIs.
- `scripts/compile-theme.mjs` and `scripts/lib/theme.mjs` — skin generation contract.

## Where to go next
If you are changing:
- the content model or what shows up on the site, read [content and business domains](content-and-domains.md).
- page generation, theming, or layout injection, read [architecture overview](architecture/overview.md).
- auth, visitor data, proposal flow, or admin endpoints, read [operations and runtime behavior](operations.md).
- external integrations or sync paths, read [integrations and external systems](integrations.md).
- tests or validation, read [testing and verification](testing.md).
