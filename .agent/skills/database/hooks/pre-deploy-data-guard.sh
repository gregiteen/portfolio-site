#!/bin/bash
# pre-deploy-data-guard.sh — refuse to deploy if the data-loss-critical rsync
# excludes have been removed from scripts/deploy.sh.
#
# What invokes it: the agent running the /deploy skill, BEFORE scripts/deploy.sh.
#
# Why this exists: deploy.sh rsyncs with --delete. The excludes below are the only
# thing standing between a deploy and wiping production runtime data (.data/,
# vault/runtime/, visitor records) or the generated designs. If any of them is
# missing — a refactor, an overzealous cleanup — deploying destroys data that
# exists nowhere else. The leading slash on /designs/ and /dist/ is load-bearing
# (it anchors the exclude to the repo root), so the check matches it exactly.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

REQUIRED_EXCLUDES=(
  ".env"
  ".data/"
  "/designs/"
  "vault/pages/skins/"
  "vault/runtime/"
  "vault/visitors.md"
)

fail=0
for ex in "${REQUIRED_EXCLUDES[@]}"; do
  if ! grep -qF -- "--exclude '$ex'" scripts/deploy.sh; then
    echo "❌ scripts/deploy.sh is MISSING data-loss-critical exclude: --exclude '$ex'"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "DO NOT DEPLOY. Restore the exclude(s) above first — rsync --delete without them destroys production data."
  exit 1
fi
echo "✅ All data-loss-critical rsync excludes present in scripts/deploy.sh."
