# Content and business domains

The repository has three main content domains that future agents should keep separate:

## 1. Portfolio content
These are the human-facing pages built from the vault:
- `vault/pages/home.md`
- `vault/pages/about.md`
- `vault/pages/contact.md`
- `vault/pages/projects/*.md`
- `vault/pages/designs/*.md`

They describe Greg Iteen, his projects, and selected real design work. The project pages currently include SSSS, Total Recall, UltraChat, and festech.live. The design pages include live portfolio/client work such as Nostalgia and High Stakes Field Day.

## 2. Runtime and lead-gen data
These are the durable records that power the interactive funnel:
- `vault/runtime/visitors/*.md`
- `vault/runtime/proposals/*.md`
- `vault/runtime/runs/*.md`

The runtime docs are treated as SSSS documents and are meant to survive restarts. They store visitor profiles, proposal threads, and generation runs. The product docs describe this as tenant-private business data.

## 3. Theme skins and generated visual variants
These are not portfolio work.
- `vault/pages/skins/*.md` stores generated skin documents.
- `designs/<slug>/` stores the built assets for each generated skin.

These skins power the flipper and bespoke design experience. The docs are explicit that skins should not appear in the Designs index as real client work.

## Business workflows tied to the content

### Visitor acquisition and authentication
The splash page collects a style prompt, email, and opt-in choice. The server starts generation immediately, sends a verification code, and then finishes the auth flow once the code is confirmed.

### Client-needs assessment and proposal flow
The consultation page gathers requirements and uses AI-assisted analysis to produce a proposal. Proposal drafts, revisions, and approval decisions are persisted in runtime docs and surfaced through admin or sync flows.

### Promotion and portfolio curation
Generated skins can be improved and promoted, but only real portfolio designs belong in the public designs index. The product docs and tracker repeatedly call out this boundary because earlier fossil skins were accidentally mixed into the live site.

## What to watch out for
- Do not confuse `vault/pages/designs/` real design pages with `vault/pages/skins/` generated skins.
- Do not put runtime customer data in portfolio pages.
- Do not treat `designs/` build artifacts as source content.
- Do not introduce new `x_kind` values casually; `build-site.mjs` uses them for classification.

## Source references
- `vault/pages/projects/ssss.md`
- `vault/pages/projects/total-recall.md`
- `vault/pages/projects/festech.md`
- `vault/pages/designs/nostalgia.md`
- `docs/projects/in-progress/portfolio-platform/PORTFOLIO_PLATFORM_PRD.md`
- `docs/projects/in-progress/portfolio-platform/PORTFOLIO_PLATFORM_TRACKER.md`
