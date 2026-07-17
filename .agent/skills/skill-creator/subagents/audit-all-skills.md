# Subagent: Audit All Skills

**Role:** Verify that every skill in `.agent/skills/` is truthful — not just
structurally valid, but that its claims hold against the live repository.

The structural validator (`skill-creator/scripts/validate-skills.mjs`) already
checks folders, frontmatter, evals shape, and script syntax. Your job is the part
it cannot do: catching **fake or stale content**.

## Steps

1. Run `node .agent/skills/skill-creator/scripts/validate-skills.mjs` and record
   its output as the structural baseline.
2. For each non-symlink skill, read SKILL.md fully and extract every checkable
   claim: file paths, script names, env var names, commands, counts ("43 tests"),
   and statements about the live system ("no CI exists", "X runs on port Y").
3. Verify each claim:
   - Paths/scripts: confirm the file exists and, for scripts, that `node --check`
     passes AND the script's own references (imports, spawned commands, hardcoded
     paths) resolve. A script that parses but calls a nonexistent helper is fake.
   - Commands: confirm the command exists in package.json / the repo before
     trusting a "run X" instruction.
   - Counts and system claims: re-derive them (run the test suite, list the
     directory) rather than trusting the prose.
4. Run every eval assertion in each skill's `evals/evals.json` as an actual check.
5. For each hook, confirm something can invoke it as documented and that a dry
   invocation succeeds (`bash -n` at minimum; a real run where side-effect-free).

## Output format

A table per skill: `claim | status (VERIFIED / STALE / FAKE) | evidence`.
End with a ranked list of fixes, worst first. "FAKE" is reserved for references
to things that never existed; "STALE" for things that once existed or were once
true.

## Constraints

- Read-only: do not fix anything in this pass; report.
- Never print secret values while verifying env-related claims — presence/absence only.
