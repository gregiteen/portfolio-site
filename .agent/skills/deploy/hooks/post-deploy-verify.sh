#!/bin/bash
# post-deploy-verify.sh — verify the live site actually came back after a deploy.
#
# What invokes it: the agent running the /deploy skill, immediately after
# scripts/deploy.sh completes (or manually any time you want a health snapshot).
#
# Checks the three public surfaces. The splash page intentionally returns
# 200/400/429 depending on auth/rate-limit state — all three mean "server up"
# (this matches the health-check logic in scripts/deploy.sh).
set -uo pipefail

check() {
  local label="$1" url="$2" ok_codes="$3"
  local code
  code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 "$url")
  if echo "$ok_codes" | grep -qw "$code"; then
    echo "✅ $label — HTTP $code"
    return 0
  fi
  echo "❌ $label — HTTP $code (expected one of: $ok_codes)"
  return 1
}

fail=0
# The root URL 302s to /splash.html by design (auth interceptor) — probe the
# splash page itself, exactly like scripts/deploy.sh's own health check does.
check "portfolio (gregiteen.xyz/splash.html)" "https://gregiteen.xyz/splash.html" "200 400 429" || fail=1
check "webmail (mail.gregiteen.xyz)"   "https://mail.gregiteen.xyz/"     "200 302"     || fail=1
check "SignedGI (sign.gregiteen.xyz)"  "https://sign.gregiteen.xyz/"     "200 302"     || fail=1

if [ "$fail" -ne 0 ]; then
  echo "Post-deploy verification FAILED — check 'pm2 logs portfolio' and nginx on the droplet."
  exit 1
fi
echo "All public surfaces healthy."
