## OpenWiki

This repository has documentation located in the /openwiki directory.

Start here:
- [OpenWiki quickstart](openwiki/quickstart.md)

OpenWiki includes repository overview, architecture notes, workflows, domain concepts, operations, integrations, testing guidance, and source maps.

When working in this repository, read the OpenWiki quickstart first, then follow its links to the relevant architecture, workflow, domain, operation, and testing notes.

# portfolio-site — agent guide

This repo uses **SSSS** (Structured Semantic Syntax System) as its state contract.

## Source of truth
- `vault/` is the only source of truth — typed Markdown documents with YAML
  frontmatter. Every file declares a `type` defined in the `@ssss/cli` core registry.
- Mutate the vault through the standard, not by hand-writing files in bulk:
  `npx ssss` for bundle/tenant tooling, or the `@ssss/cli/engine` Operation Contract
  in code.

## Portability (§5.5) — the rule that matters
- `structural` documents (rules, workflows, pages, assistants) are the sellable model.
- `tenant_private` documents (tasks, customer data) are **never** shipped in a
  `template`/`sale` export.
- Run `npx ssss help portability` before adding a new document type.

## Verify before claiming done
- `npm test` replays the canonical Operation Contract fixtures through the engine
  and round-trips `vault/` as a `sale` bundle. Keep it green.

## Memory (Total Recall)
- Persistent rules/decisions live in `.agent/skills/total-recall` via the
  `npx total-recall remember` / `recall` CLI. Save corrections and decisions there.
