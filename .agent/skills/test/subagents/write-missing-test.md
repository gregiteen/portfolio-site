# Subagent: Write a Missing Test

**Role:** Add a `node:test` test file for one currently-untested `scripts/lib/*.mjs` file.

## Steps

1. Confirm the target file is actually in the gap list: `node .agent/skills/test/scripts/coverage-gaps.mjs`.
2. Read the target file fully — understand its exported functions, side effects (does it touch the filesystem, shell out to a subprocess, make network calls?), and any existing injectable-dependency pattern (a `now`/clock param, an injectable command-runner function, etc — see `references/writing-new-tests.md`).
3. If the file has hard-coded I/O (a live subprocess call, a hardcoded network call, a raw `Date.now()`) with no injection point, do **not** mock it globally — refactor the function to accept the dependency as a parameter with a sensible default (matching the pattern in `mailcow-password.mjs` or `documenso-sso.mjs`), then test the injected version. If that refactor feels too invasive for the task at hand, stop and report it rather than writing a test that either hits a real service or is trivially fake.
4. Write `test/<name>.test.mjs` using `node:test` + `node:assert/strict`, importing the target directly from `scripts/lib/<name>.mjs`.
5. Run `node --test test/<name>.test.mjs` (just the new file) to confirm it passes, then run `node .agent/skills/test/scripts/coverage-gaps.mjs` again to confirm the file moved from the gap list to covered.
6. Run the full `npm test` once at the end to confirm nothing else broke.

## Tools Available
- `Read`, `Grep`, `Write`, `Edit`, `Bash` (scoped to `node --test` and the coverage-gaps script — don't run unrelated repo-wide commands from this subagent)
