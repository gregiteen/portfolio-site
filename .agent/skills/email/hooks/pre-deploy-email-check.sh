#!/bin/bash
# pre-deploy-email-check.sh — sanity-check email env wiring before a deploy that
# touches sending code.
#
# What invokes it: the agent running /deploy after changing serve.mjs mail paths,
# scripts/lib/imap.mjs, or Mailcow-related code.
#
# Local .env is expected to be sparse (production values live only in the droplet's
# /opt/portfolio-site/.env) — so this hook reports rather than hard-fails on unset
# vars, but it DOES hard-fail if the report script itself can't run.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
node .agent/skills/email/scripts/check-email-env.mjs
echo ""
echo "Reminder: never rsync/overwrite the droplet's .env — it is the only copy of production email credentials."
