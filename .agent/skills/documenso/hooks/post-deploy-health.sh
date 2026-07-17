#!/bin/bash
# post-deploy-health.sh — end-to-end plumbing probe for the Signed, gi. e-sign stack.
#
# What invokes it: the agent running the /deploy skill after a deploy that touches
# scripts/serve.mjs or scripts/lib/documenso*.mjs, or anyone triaging a signing issue.
#
# Probes three things WITHOUT any secret (safe to run from anywhere):
#   1. Documenso fork is up          → GET  /            expects 200 or 302-to-/signin
#   2. SSO endpoint exists on fork   → GET  /api/auth/signedgi-sso?code=garbage
#                                      expects 400 INVALID_BODY (404 = fork missing the endpoint)
#   3. Webhook route enforces secret → POST gregiteen.xyz/api/documenso-webhook with a
#                                      wrong secret expects 401/403 (200 would mean auth is broken)
set -uo pipefail

SIGN_BASE="${DOCUMENSO_BASE_URL:-https://sign.gregiteen.xyz}"
SITE_BASE="${SITE_URL:-https://gregiteen.xyz}"
fail=0

code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 "$SIGN_BASE/")
if [ "$code" = "200" ] || [ "$code" = "302" ]; then
  echo "✅ Documenso up ($SIGN_BASE) — HTTP $code"
else
  echo "❌ Documenso down ($SIGN_BASE) — HTTP $code. Check: docker ps | grep documenso"
  fail=1
fi

body=$(curl -sk --max-time 10 "$SIGN_BASE/api/auth/signedgi-sso?code=health-probe-invalid")
code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 "$SIGN_BASE/api/auth/signedgi-sso?code=health-probe-invalid")
if [ "$code" = "400" ]; then
  echo "✅ SSO endpoint alive — HTTP 400 on garbage code (correct rejection)"
elif [ "$code" = "404" ]; then
  echo "❌ SSO endpoint MISSING (HTTP 404) — the signedgi/documenso:custom fork isn't running, or was replaced by a stock image"
  fail=1
else
  echo "⚠️  SSO endpoint returned HTTP $code — body: ${body:0:120}"
fi

code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 -X POST \
  -H 'X-Documenso-Secret: wrong-secret-health-probe' \
  -H 'Content-Type: application/json' -d '{}' \
  "$SITE_BASE/api/documenso-webhook")
if [ "$code" = "401" ] || [ "$code" = "403" ]; then
  echo "✅ Webhook route enforcing secret — HTTP $code on wrong secret"
elif [ "$code" = "200" ]; then
  echo "❌ Webhook accepted a WRONG secret (HTTP 200) — DOCUMENSO_WEBHOOK_SECRET unset on the server?"
  fail=1
else
  echo "⚠️  Webhook route returned HTTP $code (expected 401/403)"
fi

[ "$fail" -eq 0 ] && echo "Signed, gi. plumbing healthy." || echo "Signed, gi. plumbing has FAILURES — see documenso/subagents/triage-signing-issue.md"
exit $fail
