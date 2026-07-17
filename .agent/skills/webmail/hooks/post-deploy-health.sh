#!/bin/bash
# post-deploy-health.sh — verify webmail came back after a deploy or Mailcow change.
#
# What invokes it: the agent running /deploy after touching scripts/lib/webmail*.mjs
# or serve.mjs, or after a Mailcow password sync (see references/mailcow-password-sync.md —
# a half-completed sync is exactly what this catches).
#
# Uses curl for the port probes (NOT bash /dev/tcp — sandboxed agent shells kill
# raw /dev/tcp sockets while allowing curl, which produced false "port down"
# alarms in the first version of this hook). curl exit codes: 0 = full protocol
# handshake, 8/67 = server reachable but rejected the anonymous probe (fine for
# a health check), 7/28 = connection refused/timeout (actually down).
set -uo pipefail

MAIL_HOST="${WEBMAIL_HOST:-mail.gregiteen.xyz}"
fail=0

code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 "https://$MAIL_HOST/")
if [ "$code" = "200" ] || [ "$code" = "302" ]; then
  echo "✅ Webmail UI (https://$MAIL_HOST) — HTTP $code"
else
  echo "❌ Webmail UI — HTTP $code. Check 'pm2 logs portfolio' on the droplet."
  fail=1
fi

probe_port() {
  local label="$1" url="$2"
  curl -sk -o /dev/null --connect-timeout 8 "$url"
  local rc=$?
  case "$rc" in
    0|8|21|67) echo "✅ $label reachable (curl exit $rc)" ;;
    7|28)   echo "❌ $label DOWN (curl exit $rc) — Dovecot/Postfix container down? (docker ps | grep mailcow)"; fail=1 ;;
    *)      echo "⚠️  $label — unexpected curl exit $rc (server likely up; investigate if repeated)" ;;
  esac
}

probe_port "IMAP  $MAIL_HOST:993" "imaps://$MAIL_HOST:993/"
probe_port "SMTPS $MAIL_HOST:465" "smtps://$MAIL_HOST:465/"
probe_port "SMTP  $MAIL_HOST:587" "smtp://$MAIL_HOST:587/"

exit $fail
