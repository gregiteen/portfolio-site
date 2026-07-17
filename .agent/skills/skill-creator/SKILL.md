---
name: skill-creator
description: "Use this skill when creating a new agent skill, auditing or validating existing skills in .agent/skills/, or bringing a skill up to the required format (SKILL.md + scripts/ + references/ + subagents/ + hooks/ + evals/). MANDATORY: read the full SKILL.md before executing."
---

# Skill Creator

Skills in this repo are **executable expertise**, not documentation. A skill earns its place by making the next agent measurably better at a real task in this repository: runnable scripts instead of prose, verified facts instead of guesses, and evals that catch drift.

## The format — six required items

Every skill in `.agent/skills/<name>/` MUST contain:

```text
<name>/
├── SKILL.md      # entrypoint: name + description frontmatter, then the master instructions
├── scripts/      # runnable automation (node/bash) — deterministic operations, never LLM guesses
├── references/   # verified domain knowledge the agent needs to READ
├── subagents/    # self-contained delegation prompts for parallelizable subtasks
├── hooks/        # lifecycle scripts (pre-commit, pre-push, post-deploy) wired to real events
└── evals/        # evals.json with ≥3 assertions that verify the skill was used correctly
```

All five directories are required so you are forced to *deliberate* about each one. A thin-but-real file beats an empty folder; a `.gitkeep` beats nothing; but the goal is content another agent would actually be glad to find.

### Frontmatter rules

- `name`: lowercase kebab-case, exactly matching the folder name.
- `description`: trigger-optimized — state WHAT it does and WHEN to use it, under 1024 chars, ending with `MANDATORY: read the full SKILL.md before executing.` Vague descriptions mean the skill never activates.
- **Nothing else.** No `type`/`slug`/`category`/`importance` — those are memory-node fields, and a skill with them won't be discovered.

## Creating a new skill

```bash
node .agent/skills/skill-creator/scripts/create-skill.mjs <name> "<description>"
```

The scaffolder creates the six items, appends the `!.agent/skills/<name>/` **allowlist entry to `.gitignore`** (this repo git-ignores `.agent/skills/*` by default — a skill without its allowlist line is silently untracked and will never be committed), and symlinks the skill into `.claude/skills/` so the IDE can discover it.

Then populate every folder. Ask yourself, per folder:

| Folder | Deliberation question |
|:---|:---|
| `scripts/` | What in this domain should be deterministic code instead of an LLM guess? |
| `references/` | What did I have to look up or verify against the live system to write this skill? Write that down. |
| `subagents/` | What subtask could a focused worker do in parallel with only this file as its brief? |
| `hooks/` | What real lifecycle event (commit, push, deploy) should trigger a check from this domain? |
| `evals/` | How would I know this skill was used correctly? What has actually gone wrong before? |

Finally validate:

```bash
node .agent/skills/skill-creator/scripts/validate-skills.mjs [name]
```

Zero errors before you consider the skill done. Placeholder `TODO` content left by the scaffolder is flagged as an error, deliberately — the scaffold is a contract to fill, not a deliverable.

## Hard rules

1. **No fake content.** Every file path, script name, env var, and command referenced in a skill must exist and work at the moment you write it. Verify against the live repo/system, not memory. (This skill exists because a prior "skill spec" skill shipped hooks calling a script that was never written, and a code-quality skill pointed at a `frontend/` directory that didn't exist — every "0 errors" it ever reported was a crash.)
2. **Scripts must run.** `node --check` for `.mjs`/`.js`, `bash -n` for `.sh` — the validator enforces this. Test each script once for real before shipping.
3. **Evals must be falsifiable.** "Skill is high quality" is not an assertion; "coverage-gaps.mjs output matches an independent audit of test imports" is.
4. **Hooks wire to real events.** A hook is a script another process can actually call (git pre-commit/pre-push, the deploy flow). Document in the hook's header comment exactly what should invoke it and how to install it. A hook nothing invokes is decoration.
5. **Never edit compiled memory surfaces** (`CLAUDE.md`/`AGENTS.md` injected-rules sections) to describe a skill — those are rebuilt by total-recall. The skill's own files are the source of truth.

## Auditing the ecosystem

- Quick pass: `node .agent/skills/skill-creator/scripts/validate-skills.mjs` (all skills, structural).
- Deep pass: dispatch `subagents/audit-all-skills.md` — it verifies SKILL.md *claims* against the codebase, which the structural validator cannot.
- Skills that are external symlinks (e.g. `total-recall` → a home-directory install) are reported but not validated; they have their own lifecycle.

## Pitfalls seen in this repo

- **Allowlist miss:** new skill committed "successfully" but absent from git — `.gitignore` allowlist line was missing. The scaffolder now handles it; if you create a skill by hand, add the line yourself.
- **Stale claims:** SKILL.md said a daemon wrote fresh reports; the daemon had been crashing for months and the report file was stale. If your skill asserts a live system behaves some way, add an eval telling the reader how to re-verify (timestamps, exit codes), not just what to expect.
- **Frontmatter drift:** skills copied from memory-node templates carried `type:`/`slug:` fields and were never discovered by the IDE.
- **Hooks calling ghosts:** an `on-skill-add.sh` hook invoked `update-skill-index.mjs`, which did not exist anywhere. Run every hook once before shipping it.
