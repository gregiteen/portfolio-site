# Vault architecture — the filesystem IS the database

Verified against the repo 2026-07-17.

## Layout

```text
vault/
├── assistants/   # assistant definitions (structural)
├── campaigns/    # drip_campaign docs (see the marketing skill)
├── pages/        # site pages incl. designs/ + skins/ subtrees
├── rules/        # rule documents
├── runtime/      # RUNTIME STATE — droplet-only in production, rsync-excluded
├── tasks/        # tenant_private task docs
├── workflows/    # workflow definitions
└── visitors.md   # visitor records — tenant_private, rsync-excluded
```

Every document is Markdown with YAML frontmatter declaring a `type` registered
in the `@ssss/cli` core registry. `node .agent/skills/database/scripts/vault-stats.mjs`
prints the live per-area and per-type counts.

## Mutation rules

- Mutate through the standard, not by hand-writing files in bulk: `npx ssss`
  tooling or the `@ssss/cli/engine` Operation Contract in code.
- `npm run validate` replays the package's conformance fixtures; the repo's own
  round-trip lives in `test/ssss-conformance.test.mjs`. Run both after touching
  vault structure (they check different things — see the test skill).

## Portability (§5.5) — the rule that matters commercially

- `structural` documents (rules, workflows, pages, assistants) are the sellable
  model and ARE included in `template`/`sale` exports.
- `tenant_private` documents (tasks, visitors, customer data) are **never**
  shipped in an export. Run `npx ssss help portability` before adding a new
  document type.

## Runtime state — two stores, both production-only

- `vault/runtime/` — runtime vault docs.
- `.data/` — JSON runtime store managed by `scripts/runtime-store.mjs`
  (visitors, proposals, drip state, rate card, sessions).

Locally both are sparse or absent — that's normal. The production copies exist
ONLY on the droplet and are protected solely by deploy.sh's rsync excludes.
`hooks/pre-deploy-data-guard.sh` verifies those excludes before every deploy;
run it, because a deploy without them destroys data that exists nowhere else.

## No SQL, ever

Do not introduce Postgres/MySQL/SQLite/Mongo for application state. (The
Documenso and Mailcow docker stacks on the droplet have their own internal
databases — those belong to those products, not to this app.)
