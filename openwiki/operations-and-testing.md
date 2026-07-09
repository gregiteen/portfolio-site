# Operations and testing

## Day-to-day commands

From `package.json`:

- `npm install` — install dependencies and run the registry sync via `postinstall`
- `npm run build` — build the static site
- `npm run dev` — build once, then start the server
- `npm test` — run the Node test suite
- `npm run export` — export the vault as a sale bundle
- `npm run validate` — run bundle conformance validation
- `npm run sync-registry` — refresh `vault-registry/core.json`

## Runtime behavior to watch

`scripts/serve.mjs` is the most operationally dense file in the repo. It combines:

- vault watching and rebuild debouncing
- auth token/session handling
- visitor code generation and verification
- email delivery
- generation queueing and job persistence
- runtime-store hydration
- admin and proposal endpoints

Because of that, changes here should be approached carefully and tested end-to-end rather than by inspection alone.

## Verification strategy

The existing tests give you two important safety nets:

- `test/ssss-conformance.test.mjs` checks the repo against canonical SSSS operations and bundle round-tripping.
- `test/theme-utils.test.mjs` checks the theme/template helpers used by generation and build logic.

The repository’s own docs and recent commit history show that deploys and runtime state have broken before. For future work, prefer verifying the relevant workflow path instead of assuming a code path is correct because a unit test passes.

## Operational boundaries

A few repo rules matter when making changes:

- `vault/` is the canonical document store.
- `vault-registry/core.json` should be synced, not hand-edited.
- `.data/sessions.json` is local session state and should stay out of source control.
- `.env` is required for server operation but is not documented here; use `.env.example` as the non-sensitive setup reference.
- Top-level agent guidance should continue to point people to the OpenWiki quickstart.

## When editing major areas

- If you change content generation, inspect `scripts/build-site.mjs` and `scripts/lib/theme.mjs` together.
- If you change auth, notifications, or proposals, inspect `scripts/serve.mjs` and `scripts/runtime-store.mjs` together.
- If you change registry-driven behavior, inspect `scripts/sync-registry.mjs` and the tests that rely on `vault-registry/core.json`.
- If you change deploy or runtime persistence, confirm the current product docs in `docs/projects/in-progress/portfolio-platform/` still match the code.

## Source references

- `package.json`
- `scripts/build-site.mjs`
- `scripts/serve.mjs`
- `scripts/runtime-store.mjs`
- `scripts/sync-registry.mjs`
- `test/ssss-conformance.test.mjs`
- `test/theme-utils.test.mjs`
- `AGENTS.md`
- `CLAUDE.md`
