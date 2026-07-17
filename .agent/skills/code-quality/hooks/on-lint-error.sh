#!/bin/bash
# on-lint-error.sh — run the real quality gates and report failures plainly.
# This repo has no ESLint; "lint" here means the three gates in SKILL.md.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "🔎 Running code-quality gates..."

node .agent/skills/code-quality/scripts/check-syntax.mjs || { echo "❌ Syntax scan failed."; exit 1; }
npm run validate || { echo "❌ npm run validate (SSSS conformance) failed."; exit 1; }
npm test || { echo "❌ npm test failed."; exit 1; }

echo "✅ All code-quality gates passed."
