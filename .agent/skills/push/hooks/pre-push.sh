#!/bin/bash
# pre-push.sh — run the full push preflight (syntax → SSSS conformance → tests → build)
# before anything leaves this machine.
#
# What invokes it: git's pre-push hook, or any agent following the /push skill.
#
# Install:
#   HOOK=.git/hooks/pre-push
#   touch "$HOOK" && chmod +x "$HOOK"
#   grep -q push-preflight "$HOOK" || \
#     echo 'bash .agent/skills/push/hooks/pre-push.sh || exit 1' >> "$HOOK"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
node .agent/skills/push/scripts/push-preflight.mjs
