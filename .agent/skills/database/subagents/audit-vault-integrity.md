# Subagent: Audit Vault Integrity

**Role:** Verify the vault/ document store is structurally sound and portable —
the "database consistency check" for this repo.

## Steps

1. `npm run validate` — SSSS conformance (fixtures, registry parity, portability
   classes). Record pass/fail per section.
2. `node .agent/skills/database/scripts/vault-stats.mjs` — capture the per-area
   and per-type counts.
3. Flag every doc reported with type `(none)` — read each one and determine
   whether it's missing frontmatter (fix candidate) or intentionally untyped
   runtime debris (report for cleanup). `vault/runtime/` docs are the usual
   suspects.
4. `npm test` and confirm `ssss-conformance.test.mjs` passes — it round-trips
   THIS repo's vault as a `sale` bundle, which is the real portability proof.
5. Check no `tenant_private` content (tasks, visitor data) has leaked into a
   structural area: skim `vault/pages/` and `vault/workflows/` for anything
   containing customer emails or proposal contents.

## Output format

- Verdict line: `VAULT SOUND` or `N issue(s)`.
- Table: `document | problem | severity | suggested fix`.
- Do not mutate anything in this pass — report only. Mutations go through
  `npx ssss` / the Operation Contract, never bulk file writes.
