#!/bin/bash
# pre-publish-design-gate.sh — refuse to publish/promote a design that hasn't
# been through a rendered review.
#
# What invokes it: the agent about to promote a generated theme or publish a
# significant UI change (the generator skill's promotion step, or a manual
# deploy of visual changes).
#
# Usage:
#   DESIGN_REVIEWED=1 bash .agent/skills/frontend-design/hooks/pre-publish-design-gate.sh
#
# The gate is an explicit attestation: setting DESIGN_REVIEWED=1 asserts that a
# rendered-screenshot review (subagents/design-review.md) ran and returned
# PUBLISHABLE. It exists because designs have been published after source-only
# review and shipped with rendered defects.
set -euo pipefail

if [ "${DESIGN_REVIEWED:-0}" != "1" ]; then
  echo "❌ BLOCKED: no rendered design review attested for this publish."
  echo ""
  echo "   Run the review first (it must see actual rendered screenshots, both"
  echo "   desktop and mobile — source-only review does not count):"
  echo "     .agent/skills/frontend-design/subagents/design-review.md"
  echo ""
  echo "   Then re-run with: DESIGN_REVIEWED=1 $0"
  exit 1
fi

echo "✅ Rendered design review attested — publish may proceed."
