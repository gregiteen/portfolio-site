# Operations and runtime behavior

This page focuses on how the repository runs in practice: local development, deploys, runtime data, and the server-side workflows that matter when making changes.

## Local development
The canonical npm scripts are in `package.json`:
- `npm run build` → build static site output with `scripts/build-site.mjs`
- `npm run dev` → build, then start `scripts/serve.mjs`
- `npm test` → run the Node test suite
- `npm run export` → export a bundle from the vault via `ssss`
- `npm run validate` → run SSSS conformance checks
- `npm run sync-registry` → refresh the local registry copy used by exports

## Server behavior
`scripts/serve.mjs` is more than a static server.
- Watches the vault and triggers rebuilds.
- Serves the built `dist/site/` tree.
- Handles email verification, session cookies, and rate limiting.
- Starts generation jobs for bespoke themes.
- Provides CNA/proposal endpoints and admin routes.
- Hydrates visitor/proposal state from SSSS-backed runtime documents.

## Runtime data model
Operational state is split between a few places:
- `.data/sessions.json` stores auth tokens and is intentionally gitignored.
- `vault/runtime/` stores the durable business records.
- `vault/pages/skins/` stores generated skin docs.
- `designs/` stores generated build artifacts and images.

A key rule from the deploy skill and product docs: runtime data must not be overwritten by blind deploys. Excludes in deploy commands are load-bearing.

## Deploy discipline
The deploy skill in `.agent/skills/deploy/SKILL.md` is a primary operational source.
- Do not auto-commit as part of deployment.
- Use rsync with `--delete` to keep the droplet aligned with the repo.
- Preserve runtime roots such as `.data/`, `vault/runtime/`, `vault/pages/skins/`, and `designs/`.
- Keep the leading-slash rsync excludes for `/designs/` and `/dist/`; the docs call out that those slashes are significant.

## Important cautions for future changes
- If you touch auth or proposal flows, verify the runtime persistence logic in `serve.mjs` and the relevant tracker tasks.
- If you touch deploy behavior, read the deploy skill and the architecture/tracker docs first.
- If you touch skin generation or promotion, keep the distinction between portfolio designs and runtime-generated skins intact.
- If you touch visitor data, remember that the repo treats it as durable business data, not ephemeral cache.

## Source references
- `package.json`
- `scripts/serve.mjs`
- `scripts/build-site.mjs`
- `.agent/skills/deploy/SKILL.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_DEVELOPMENT_PLAN.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_PROJECT_TRACKER.md`

## Custom Webmail CRM Dashboard
The central admin dashboard, CRM (prospects, stages, deals, funnels), and drip campaigns are ALL managed through the custom webmail app at mail.gregiteen.xyz. There is NO standalone admin page; everything is integrated into the webmail client.
