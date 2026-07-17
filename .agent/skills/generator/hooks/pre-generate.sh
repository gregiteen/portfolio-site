#!/bin/bash
# pre-generate.sh — fail fast before an expensive theme-generation run.
#
# What invokes it: any agent about to run `node scripts/compile-theme.mjs` (the
# generation pipeline costs real Gemini API calls and minutes of wall clock —
# catching a missing env var or stale staging dir first is much cheaper).
#
# 1. Env preflight (GOOGLE_API_KEY etc.) via the skill's own checker script.
# 2. Stale .theme-staging/ from a crashed run makes the next promotion ambiguous —
#    refuse until it's inspected/removed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

node .agent/skills/generator/scripts/check-generator-env.mjs

if [ -d .theme-staging ] && [ -n "$(ls -A .theme-staging 2>/dev/null)" ]; then
  echo "❌ .theme-staging/ is not empty — a previous generation run didn't finish."
  echo "   Inspect it (was it a crash mid-promotion?) and remove it before generating:"
  echo "   ls -la .theme-staging/ && rm -rf .theme-staging"
  exit 1
fi

echo "✅ Generator preflight clean — safe to run compile-theme.mjs."
