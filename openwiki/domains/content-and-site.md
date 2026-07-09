# Content and business domains

This repository is both a portfolio and a lead-generation system. The public-facing content is simple, but the surrounding documents and workflows encode a much richer product model.

## Site content

The public site is built from `vault/pages/`.

Key page groups:

- `vault/pages/home.md` and `vault/pages/about.md` — top-level navigation and positioning
- `vault/pages/contact.md` — contact surface
- `vault/pages/projects/*.md` — featured project case studies
- `vault/pages/designs/*.md` — client design case studies
- `vault/pages/skins/*.md` — runtime-generated theme skins, not portfolio work

The site content itself is Markdown with YAML frontmatter. The build script reads the frontmatter to determine page type, metadata, and presentation behavior.

## Product domains

### Portfolio presentation

The portfolio presents Greg Iteen’s work across a few consistent categories:

- SSSS / file-native system design
- Total Recall / local memory OS work
- UltraChat / AI workspace platform work
- festech / live event tech work
- client design case studies such as Nostalgia and High Stakes Field Day

### Visitor experience

The product doc set in `docs/projects/in-progress/portfolio-platform/` describes a more elaborate visitor funnel than the static content alone suggests:

- visitor style prompt collection
- email verification
- generated visual skins
- authenticated return flow
- CNA / proposal workflow
- deferred notifications and lead capture

That product framing is important for future changes because much of the runtime code exists to support that funnel, not just a static portfolio.

### Runtime business records

Runtime business data is treated as first-class content and persisted under `vault/runtime/`:

- visitor profiles
- proposal threads
- generation runs

The server keeps in-memory state for request handling, but the vault documents are the durable source of truth.

## Important distinctions

- **Design case studies** in `vault/pages/designs/` are portfolio entries.
- **Theme skins** in `vault/pages/skins/` are generated artifacts used by the live design system and should not be confused with client work.
- **Generated builds** in `designs/` are runtime outputs, not authored content.
- **Project docs** in `docs/projects/in-progress/portfolio-platform/` describe product behavior and acceptance criteria; they are not site content.

## Source references

- `vault/pages/home.md`
- `vault/pages/about.md`
- `vault/pages/projects/ssss.md`
- `vault/pages/projects/total-recall.md`
- `vault/pages/projects/ultrachat.md`
- `vault/pages/projects/festech.md`
- `vault/pages/designs/nostalgia.md`
- `vault/pages/designs/high-stakes-field-day.md`
- `docs/projects/in-progress/portfolio-platform/PORTFOLIO_PLATFORM_PRD.md`
- `docs/projects/in-progress/portfolio-platform/PORTFOLIO_PLATFORM_ARCHITECTURE.md`
