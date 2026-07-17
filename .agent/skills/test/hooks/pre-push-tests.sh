#!/bin/bash
# pre-push-tests.sh — run the full test suite (~1.5s) before a push.
#
# What invokes it: git's pre-push hook, or any agent about to push. The push
# skill's preflight already includes `npm test`; this hook is the standalone
# version for workflows that bypass the full preflight (docs-only pushes, etc.).
#
# Install:
#   HOOK=.git/hooks/pre-push
#   touch "$HOOK" && chmod +x "$HOOK"
#   grep -q 'test/hooks/pre-push-tests' "$HOOK" || \
#     echo 'bash .agent/skills/test/hooks/pre-push-tests.sh || exit 1' >> "$HOOK"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
npm test
