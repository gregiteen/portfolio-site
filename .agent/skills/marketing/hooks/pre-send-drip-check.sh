#!/bin/bash
# pre-send-drip-check.sh — lint all drip campaign templates before anything sends.
#
# What invokes it: any agent editing vault/campaigns/*.md or the drip scheduler
# config, before committing/deploying; also sensible in a git pre-commit hook
# when campaign docs are staged.
#
# A typo'd {{TOKEN}} or a missing unsubscribe link ships verbatim to real leads —
# this is the cheap gate that prevents that.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
node .agent/skills/marketing/scripts/check-drip-templates.mjs
