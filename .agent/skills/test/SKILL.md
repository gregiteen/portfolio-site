---
name: test
description: "Use this skill when running or reasoning about this repo's test suite (npm test), understanding what a given test file actually covers, checking npm run validate vs npm test, or identifying untested scripts/lib files. MANDATORY: read the full SKILL.md before executing."
---

# Test Suite

## Run it

```bash
npm test
```

Runs `node --test --test-concurrency=1 test/*.test.mjs` — Node's built-in test runner, **not** vitest/jest. As of the last verified run: **43 tests across 7 files, ~1.5 seconds total, all passing.** This is fast and safe to run locally and often — there's no reason to avoid it or treat it as a "heavy" process.

## `npm run validate` vs `npm test` — not duplicates

`npm run validate` runs `ssss conformance --engine` (`node_modules/@ssss/cli/scripts/conformance.mjs`). It does more than any single test file: structural fixture validation, registry portability-class validation, a registry/engine parity audit, skill-primitive conformance, and (with `--engine`) replays the **`@ssss/cli` package's own** `conformance/fixtures.json` and round-trips the package's **own** `conformance/reference-bundle.ucw.json` — not this repo's vault.

`test/ssss-conformance.test.mjs` overlaps only partially: it calls the same `createEngine()`/`processOperation` and the same `fixtures.json`, but exercises **this repo's own** `vault/` + `vault-registry` (export → validate → provision → import round-trip as a `sale` bundle). Run both — they check different things.

## Per-file coverage map

| File | Tests | What it covers | I/O |
|---|---|---|---|
| `documenso-sso.test.mjs` | 2 | SSO handoff create/consume/expiry/prune (in-memory `Map`) | None |
| `drip-and-proposal.test.mjs` | 4 | `drip.mjs` enrollment/templates/tokens, `proposal-output.mjs` parsing, `documenso.mjs` webhook secret + lifecycle mapping | None |
| `mailcow-password.test.mjs` | 4 | env parsing/rewriting, password validation, retry wrapper (no real Docker/mysql) | None |
| `proposal-lifecycle.test.mjs` | 3 | proposal status enum + Documenso lifecycle state machine, idempotent replay | None |
| `ssss-conformance.test.mjs` | 2 | Operation Contract fixtures + this repo's vault export/round-trip | `os.tmpdir()` mkdtemp, self-cleaning in `finally` |
| `theme-utils.test.mjs` | 26 | `theme.mjs` — CSS hoisting/scoping, nested-map parsing, doc serialize/extract, payload validation, JSON extraction | None |
| `waiting-profile.test.mjs` | 2 | `waiting-profile.mjs` copy-section building | None |

No test hits a real external service (no live Documenso, Mailcow/Docker, or IMAP calls). Nothing leaves repo-local side effects — the only filesystem activity is `ssss-conformance.test.mjs`'s `os.tmpdir()` usage, which cleans up after itself.

**New vs. battle-tested:** `documenso-sso`, `mailcow-password`, `proposal-lifecycle`, and `waiting-profile` are freshly written (untracked in git as of this writing) — each has only 2-4 test blocks. `drip-and-proposal`, `ssss-conformance`, and `theme-utils` are pre-existing; `theme-utils` is by far the most extensive (26 blocks). Weight confidence accordingly — a pass on a 2-block file is weaker evidence than a pass on `theme-utils`.

## Coverage gaps

```bash
node .agent/skills/test/scripts/coverage-gaps.mjs
```

Parses actual `import` statements in `test/*.test.mjs` against `scripts/lib/*.mjs` — not a hardcoded list, so it won't go stale. As of the last run, 9 of 17 lib files have no test importing them: `calendar.mjs`, `cna-state.mjs`, `design-exemplars.mjs`, `imap.mjs`, `letterhead.mjs`, `orchestrator-brain.mjs`, `theme-release.mjs`, `webmail-ui.mjs`, `webmail.mjs`. A gap doesn't automatically mean "write a test now" — several of these are thin glue or prompt-data files (see the `webmail` and `generator` skills for which of these are genuinely risky to leave untested vs. low-stakes).

## No CI

There is no GitHub Actions workflow in this repo (`.github/workflows/` doesn't exist) — `.github/copilot-instructions.md` is a synced instruction file, not a workflow. This is intentional (see the `push`/`deploy` skills: manual build + git sync + rsync, explicitly not CI/CD-driven). `npm test` only runs when a human or an agent runs it — there's no safety net catching an untested push automatically.

## When to run what

- **Content changes**: `npm run build`, inspect generated pages.
- **Runtime/server changes**: `npm test`, then exercise the flow manually via `npm run dev`.
- **Theme-generation changes**: `npm test`, then a real generation run if the change affects the pipeline contract (see the `generator` skill).
- **Registry/portability changes**: `npm run validate`.
- **Any push**: all of the above — see the `push` skill's preflight script, which chains syntax scan → validate → test → build.
