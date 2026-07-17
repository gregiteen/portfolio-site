# Folder playbook — what "radically useful" looks like

Concrete examples from this repo's own skills. Use these as the quality bar when
populating a new skill's folders.

## scripts/ — replace judgment calls with exit codes

- `push/scripts/push-preflight.mjs` — chains syntax scan → SSSS conformance →
  tests → build, stops at first failure. An agent no longer decides *whether*
  the tree is pushable; it runs one command.
- `test/scripts/coverage-gaps.mjs` — parses actual `import` statements in
  `test/*.test.mjs` instead of maintaining a hardcoded list, so it cannot go
  stale. Prefer derived facts over asserted facts in any script you write.
- `documenso/scripts/check-documenso-env.mjs` — reports which env vars are
  set **without printing values**. Secrets stay secret even in agent logs.
- `deploy/scripts/deploy.mjs` — refuses a dirty tree and takes a droplet
  backup before syncing. Scripts are where you encode "never again" incidents.

Bad version of this folder: a script that shells out to a tool that isn't
installed, or one that was never run before being committed.

## references/ — write down what you had to verify

- `code-quality/references/repo-tooling.md` — explains *why* this repo has no
  TypeScript/ESLint (plain `.mjs`, no tsconfig anywhere) so no future agent
  re-installs the broken daemon setup.
- `documenso/references/api-sequence.md` — the exact 4-call create→upload→
  field→send sequence with the failure mode of each call. Written from a live
  trace, not from vendor docs.
- `webmail/references/mailcow-password-sync.md` — the 4-step password sync
  with per-step failure modes. This is knowledge that existed only in one
  debugging session until it was written down.

Bad version: paraphrased vendor marketing, or "documentation" restating what
the code already says.

## subagents/ — briefs a worker can execute cold

- `test/subagents/write-missing-test.md` — names the gap-list command, the
  injectable-dependency refactor pattern to follow, the exact verification
  loop, and the tool constraints. A subagent needs zero extra context.
- `documenso/subagents/triage-signing-issue.md` — a decision tree from symptom
  to subsystem (env → API → webhook → SSO).

Bad version: "Review the code and report issues." That's a wish, not a brief.

## hooks/ — wire domain checks to lifecycle events

- `skill-creator/hooks/pre-commit-validate.sh` — blocks a commit that touches
  `.agent/skills/` unless the validator passes. Install instructions live in
  the header comment; a hook you can't install is decoration.
- The lesson that created this rule: a prior skill shipped `on-skill-add.sh`
  which called `update-skill-index.mjs` — a script that never existed. Every
  hook must be executed once, for real, before it ships.

## evals/ — assertions that catch drift

- `test/evals/evals.json` includes "coverage-gaps.mjs's reported gap list …
  matches an independent audit" — falsifiable, and it directly targets the
  script's failure mode (silent staleness).
- Include at least one eval that re-verifies a SKILL.md claim against the live
  repo ("there is no .github/workflows/ — verify before trusting"), because
  claims rot faster than scripts.

Bad version: "skill works correctly" ×3.
