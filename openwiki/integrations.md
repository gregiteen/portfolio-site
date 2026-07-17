# Integrations and external systems

This repository depends on a small but important set of external systems and internal integration points.

## SSSS / @ssss/cli
SSSS is the underlying document system for the repo.
- `package.json` depends on `@ssss/cli`.
- `scripts/build-site.mjs` uses the SSSS frontmatter parser.
- `scripts/compile-theme.mjs` emits theme-skin documents that conform to SSSS page structure.
- `vault-registry/` mirrors the registry required for exports and validation.

## Total Recall
The repo is tightly connected to Greg’s Total Recall environment.
- The docs and tracker describe syncing runtime data into a Total Recall brain.
- `package.json` includes `total-recall-brain` as a dev dependency.
- The product docs and architecture docs reference Total Recall as the approval/sync cockpit for visitors, proposals, and runtime state.
- The top-level `AGENTS.md` and `CLAUDE.md` files explicitly point agents to OpenWiki and the memory surface.

## AI / model generation
The theme pipeline can use multiple model or CLI routes.
- `scripts/compile-theme.mjs` falls back across CLI agents and can also call the Gemini API directly.
- `scripts/lib/theme.mjs` contains the payload validation and CSS scoping rules that keep generated output safe and usable.
- The architecture and tracker docs note that model output is expected to be imperfect and therefore must be validated and sometimes repaired.

## Email and notification infrastructure
`scripts/serve.mjs` imports `nodemailer` and the product docs describe SMTP-based verification and notification flows.
- Visitor verification codes are delivered by email.
- Proposal/notification emails are part of the CNA and lead-gen workflow.
- Runtime email timing matters: notifications can be held during CNA and released afterward.

## Hosting and operations
The repo’s current deployment model is documented as:
- Static assets shipped to a DigitalOcean droplet.
- A Node server process managed by PM2.
- Reverse proxy/static serving via nginx.
- Sync/export workflows that pull runtime data into Total Recall.

The deploy skill includes the concrete rsync commands and the rationale for each excluded directory.

## What future agents should remember
- Do not assume a single integration is “just implementation detail.” In this repo, external systems are part of the product surface.
- Always check the current docs before editing the generation pipeline, export registry, or runtime persistence.
- Be careful not to document live secrets or environment values; only describe the existence of config and the non-sensitive setup path.

## Source references
- `package.json`
- `scripts/compile-theme.mjs`
- `scripts/lib/theme.mjs`
- `scripts/serve.mjs`
- `vault-registry/core.json`
- `vault-registry/extensions/portfolio.json`
- `.agent/skills/deploy/SKILL.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_PRD.md`
