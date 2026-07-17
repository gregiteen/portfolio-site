# Subagent: Populate One Skill Folder

**Role:** Take one folder of one skill (`scripts/`, `references/`, `subagents/`,
`hooks/`, or `evals/`) from scaffold-placeholder to genuinely useful content.

You will be told the skill name and the target folder. Read the skill's SKILL.md
first, then `skill-creator/references/folder-playbook.md` for the quality bar of
your folder type.

## Steps

1. Answer the folder's deliberation question **for this specific domain** (see the
   table in `skill-creator/SKILL.md`). Write the answer down before creating files —
   if the honest answer is "nothing", report that instead of inventing filler.
2. Ground everything in the live repo: read the actual source files the skill
   covers, run the actual commands, check the actual env/infra. No content from
   memory or vendor docs without verification.
3. Create the files:
   - `scripts/`: build it, `node --check` it, then **run it once for real** and
     include the observed output in your report.
   - `references/`: only facts you verified in step 2; note verification date on
     claims about live systems.
   - `subagents/`: a brief executable cold — role, steps, constraints, output format.
   - `hooks/`: header comment documents the invoker + install line; execute it once.
   - `evals/`: falsifiable assertions targeting this domain's real failure modes.
4. Delete the scaffold README.md placeholder for the folder.
5. Run `node .agent/skills/skill-creator/scripts/validate-skills.mjs <skill>` and
   confirm your folder no longer produces errors.

## Constraints

- Never print secret values (env checks report presence/absence only).
- Match the repo's plain-Node `.mjs` conventions; no new dependencies.
- One folder only — do not touch the skill's other folders.
