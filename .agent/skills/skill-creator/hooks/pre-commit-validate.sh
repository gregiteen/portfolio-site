#!/bin/bash
# pre-commit-validate.sh — block commits that leave .agent/skills/ in an invalid state.
#
# What invokes it: git's pre-commit hook (or any agent, manually, before committing
# skill changes).
#
# Install (appends to an existing pre-commit hook, creates one if absent):
#   HOOK=.git/hooks/pre-commit
#   touch "$HOOK" && chmod +x "$HOOK"
#   grep -q pre-commit-validate.sh "$HOOK" || \
#     echo 'bash .agent/skills/skill-creator/hooks/pre-commit-validate.sh || exit 1' >> "$HOOK"
#
# Behavior: only runs the validator when the commit actually stages files under
# .agent/skills/, so unrelated commits stay fast. Exit 1 blocks the commit.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

cd "$ROOT"

# Nothing skill-related staged? Nothing to validate.
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  AGAINST=HEAD
else
  AGAINST=$(git hash-object -t tree /dev/null)
fi

if ! git diff --cached --name-only "$AGAINST" | grep -q '^\.agent/skills/'; then
  exit 0
fi

echo "skill files staged — running skill validator..."
node .agent/skills/skill-creator/scripts/validate-skills.mjs
