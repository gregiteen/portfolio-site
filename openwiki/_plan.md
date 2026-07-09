# OpenWiki init plan

## Pages to create
1. `openwiki/quickstart.md`
   - Purpose: entrypoint, repo overview, navigation hub
   - Evidence: `README.md`, `package.json`, `scripts/build-site.mjs`, `scripts/serve.mjs`, `scripts/runtime-store.mjs`, `test/*.mjs`, `vault/pages/*.md`, `docs/projects/**/*.md`, `AGENTS.md`, `CLAUDE.md`, recent git history

2. `openwiki/architecture.md`
   - Purpose: explain the site pipeline, runtime services, and source-of-truth model
   - Evidence: `scripts/build-site.mjs`, `scripts/serve.mjs`, `scripts/runtime-store.mjs`, `scripts/sync-registry.mjs`, `scripts/lib/theme.mjs`, `vault-registry/core.json`

3. `openwiki/domains/content-and-site.md`
   - Purpose: explain the site/content model, vault pages, designs, projects, and operational docs
   - Evidence: `vault/pages/*.md`, `designs/`, `docs/projects/**/*.md`, `README.md`

4. `openwiki/operations-and-testing.md`
   - Purpose: how to run, validate, and change the repo safely
   - Evidence: `package.json`, `test/ssss-conformance.test.mjs`, `test/theme-utils.test.mjs`, `scripts/*.mjs`, `AGENTS.md`, `CLAUDE.md`, `INSTRUCTIONS.md`

## Remaining questions
- Whether `openwiki/` already contains any useful prior docs that should be preserved or merged
- Whether a separate integrations page is warranted after reviewing the runtime/data flow in more detail
