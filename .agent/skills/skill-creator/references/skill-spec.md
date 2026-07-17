# Skill format — canonical spec

The single source of truth for how skills in `.agent/skills/` are structured.

## Required layout

```text
<name>/
├── SKILL.md      # entrypoint
├── scripts/      # runnable automation
├── references/   # verified domain knowledge
├── subagents/    # delegation prompts
├── hooks/        # lifecycle scripts
└── evals/        # evals.json (≥3 assertions)
```

`node .agent/skills/skill-creator/scripts/validate-skills.mjs` enforces all of this
and exits non-zero on violations.

## SKILL.md frontmatter

```yaml
---
name: my-skill            # lowercase kebab-case, exactly the folder name
description: "Use this skill when <trigger>. MANDATORY: read the full SKILL.md before executing."
---
```

Only these two fields. The description is what the IDE matches against to decide
when to surface the skill — write it as a trigger, not a summary. Under 1024 chars.

**Anti-pattern** (memory-node contamination — the skill will never be discovered):

```yaml
type: skill        # ✗
slug: my-skill     # ✗
category: infra    # ✗
importance: 4      # ✗
```

## SKILL.md body

The master prompt for the domain. Structure that has worked in this repo:

1. **Run it** — the one command that does the main thing, first.
2. **Context** — what problem this solves, what the moving parts are.
3. **Hard rules** — invariants with the *reason* attached (a rule without its
   why gets "optimized away" by a future agent).
4. **Pitfalls** — only ones actually observed, with enough detail to recognize
   a recurrence.
5. **Pointers** — `references/` for depth, `scripts/` for actions.

## Per-directory contract

| Directory | Contains | Bar for "real content" |
|:---|:---|:---|
| `scripts/` | `.mjs`/`.sh` the agent runs | Passes `node --check`/`bash -n`; was executed once for real; errors go to stderr with non-zero exit |
| `references/` | `.md` knowledge files | Facts verified against the live repo/system at write time; source URL at top when extracted from the web; one topic per file |
| `subagents/` | prompt `.md` files, named as verbs | Self-contained: role, steps, constraints, expected output — usable with zero surrounding conversation |
| `hooks/` | lifecycle `.sh`/`.mjs` | Header comment states what invokes it and how to install it; runs green when invoked |
| `evals/` | `evals.json` | ≥3 entries of `{name, assertion, severity}`; each assertion falsifiable by a fresh agent |

## evals.json shape

```json
[
  {
    "name": "kebab-case-check-id",
    "assertion": "A statement a fresh agent can verify true/false against the repo",
    "severity": "error"
  }
]
```

`severity`: `error` (skill is broken/lying if this fails) or `warning`
(claim may drift; re-verify before trusting).

## Repo wiring (both are mandatory, both have bitten us)

1. `.gitignore` allowlist: this repo ignores `.agent/skills/*` and re-includes
   skills one by one. Without `!.agent/skills/<name>/` the skill silently never
   reaches git.
2. `.claude/skills/<name>` symlink → `.agent/skills/<name>` for IDE discovery.

`create-skill.mjs` does both automatically.
