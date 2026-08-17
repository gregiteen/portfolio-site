---
name: code-quality
description: "Use this skill when checking code quality before committing or pushing in portfolio-site. This repo has NO TypeScript and NO ESLint installed, so do NOT run tsc, eslint, npm run typecheck, or npm run lint (they do not exist here). Its real gate is SSSS conformance against vault-registry, plus a syntax sweep and the node:test suite. Run checks as BACKGROUND jobs via scripts/check.mjs. MANDATORY: read the full SKILL.md before executing."
---

# Code Quality — portfolio-site

**Stack:** Node ESM (`"type": "module"`), no TypeScript, no ESLint, `node:test`,
`@ssss/cli` v0.9 with a real vault at `vault/` and `vault-registry/`.

> **No tsc, no eslint here.** Neither is declared. The primary quality gate in
> this repo is **SSSS conformance** — the vault is the product.

## The loop

```bash
node .agent/skills/code-quality/scripts/check.mjs
```

Launch as a **background job**, then read:

```bash
node .agent/skills/code-quality/scripts/report.mjs
```

Everything except the bundle export is tier `fast` here — this repo is small
enough that the default run is the full picture.

## This repo's gates

| id | tier | what it is |
|:---|:---|:---|
| `ssss-conformance` | fast | `npm run validate` → `ssss conformance --engine` |
| `syntax` | fast | `node --check` over every tracked `.mjs` (stands in for a linter) |
| `test` | fast | `npm test` → `node --test --test-concurrency=1 test/*.test.mjs` |
| `bundle-export` | full | `npm run export` → `.ucw` bundle must still package (SSSS §16) |

## Repo invariants

**The vault is the source of truth.** `vault/` plus `vault-registry/`
(`core.json`, `extensions/`) define the site. Conformance failures are contract
violations, not style — never resolve one by loosening the registry or skipping
a fixture.

**`.ucw` is the SSSS bundle format** produced by `@ssss/cli`'s `export`. Do not
invent a custom implementation of it.

**Runtime config lives in the vault, not in code.** Source registries and
campaign definitions are vault documents; keep them there.

## Pitfalls

- `npm run validate` (SSSS conformance) and `npm test` (node:test) are
  **different gates** and neither implies the other. `check.mjs` runs both.
- `scripts/check-syntax.mjs` is this repo's older standalone syntax helper. It
  is preserved, but the `syntax` gate in `config.json` is what the checker runs.
- One check at a time, machine-wide (`check.mjs` holds a global lock).
- The v2 skill deployed TypeScript daemons here despite there being no
  TypeScript. That is gone; see [references/architecture.md](./references/architecture.md).

## Reference

- [references/architecture.md](./references/architecture.md) — why one-shot, the v2 incident
- [references/patterns.md](./references/patterns.md) — fix recipes, incl. SSSS contract rules
