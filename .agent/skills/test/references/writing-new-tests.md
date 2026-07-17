# Conventions for adding a new test file here

Based on the 7 existing files in `test/` — follow the pattern already established rather than introducing a new one.

## Structure

- One file per module or closely related module cluster, named `<subject>.test.mjs`, in `test/`, picked up automatically by `npm test`'s glob (`test/*.test.mjs`).
- Use Node's built-in `node:test` (`import { test } from 'node:test'` and `import assert from 'node:assert/strict'`) — not a third-party framework. This repo has no `vitest`/`jest`/`mocha` dependency and shouldn't gain one just for a new test file.
- Import the module under test directly from `scripts/lib/<name>.mjs` with a real `import` statement (not a dynamic `require` or a mock) — `.agent/skills/test/scripts/coverage-gaps.mjs` detects coverage by parsing exactly this import pattern, so a test that doesn't import its subject this way won't be picked up as coverage.

## What to mock vs. what to hit for real

Every existing test in this repo is either pure-function/in-memory, or scoped to `os.tmpdir()` with cleanup in a `finally` block. None hit a real external service. Follow this pattern:
- Docker/mysql/Mailcow calls (`mailcow-password.mjs` pattern): inject the executor function as a parameter so the test can substitute a fake one, rather than mocking `child_process` globally.
- Time-dependent logic (`documenso-sso.mjs` pattern): accept a `now` parameter or clock function rather than calling `Date.now()` directly inside the module, so tests can control expiry without real waiting.
- Filesystem: only `os.tmpdir()` mkdtemp dirs, always removed in a `finally`, never a fixed path under the repo.

## Before adding a test for a currently-untested file

Run `node .agent/skills/test/scripts/coverage-gaps.mjs` first to confirm the file is actually still uncovered (the list can change as other work adds tests). Then check whether the module is pure/testable as-is, or needs the injectable-dependency treatment above before it can be tested without hitting a real external service.
