# Testing and verification

The repository’s own documentation strongly emphasizes verification because earlier phases were historically marked done without adequate test coverage. Future agents should treat the checks below as the minimum starting point for major changes.

## Canonical checks
From `package.json`:
- `npm test` — Node test suite.
- `npm run validate` — SSSS conformance.
- `npm run build` — static site build.
- `npm run dev` — build + local server for manual verification.
- `npm run sync-registry` — registry refresh when SSSS types change.

## When to run what
- **Content changes**: run `npm run build` and inspect the generated pages.
- **Runtime/server changes**: run `npm test` and exercise the affected flows manually via `npm run dev`.
- **Theme-generation changes**: run `npm test`, then a real generation path if the change affects the pipeline contract.
- **Registry or portability changes**: run `npm run validate` and any export-related checks.
- **Deploy changes**: verify the rsync command set and check the deploy skill’s guardrails.

## High-signal repo checks mentioned in the docs
The platform PRD and tracker call out these kinds of end-to-end checks:
- splash → email verify → generated home page
- visitor enrichment and deferred notification behavior
- CNA conversation and proposal creation
- proposal revision and approval flow
- admin dashboard access and permissions
- live-site fossil/theme separation checks
- portability/export validation

## Why this matters here
This repo combines static site generation, runtime business data, AI-driven generation, and deployment to a live host. A change can be syntactically correct but still break the visitor funnel, the runtime records, or the deploy mirror. The docs therefore treat verification as part of the feature, not an optional follow-up.

## Source references
- `package.json`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_DEVELOPMENT_PLAN.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_PROJECT_TRACKER.md`
- `docs/projects/in-progress/PORTFOLIO_VISITOR_FUNNEL_RECOVERY/PORTFOLIO_VISITOR_FUNNEL_RECOVERY_PRD.md`
- `README.md`
