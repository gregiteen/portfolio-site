#!/bin/bash
# pre-commit-secrets.sh — block commits that stage secret-looking content.
#
# What invokes it: git's pre-commit hook, or any agent before `git add`/commit
# (the /push skill's look-before-stage step).
#
# Install (appends to an existing pre-commit hook, creates one if absent):
#   HOOK=.git/hooks/pre-commit
#   touch "$HOOK" && chmod +x "$HOOK"
#   grep -q pre-commit-secrets "$HOOK" || \
#     echo 'bash .agent/skills/security/hooks/pre-commit-secrets.sh || exit 1' >> "$HOOK"
#
# Delegates to the skill's real scanner in --staged-only mode.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
node .agent/skills/security/scripts/pre-commit-check.mjs --staged-only
