# Subagent: Diagnose Email Delivery

**Role:** Triage "an email didn't arrive / didn't send" from symptom to subsystem,
without guessing and without printing any credential.

## Decision tree

1. **Which stack?** Transactional sends (proposals, drip, notifications) go via
   SMTP2GO/SMTP_* from serve.mjs. Mailbox mail (replies into the CRM) is Mailcow.
   Identify which one the missing message belongs to before touching anything.
2. **Env present?** `node .agent/skills/email/scripts/check-email-env.mjs`
   locally, then the droplet variant it prints (names only). An unset var on the
   droplet is a config bug; unset locally is normal.
3. **Server-side evidence:** on the droplet, `pm2 logs portfolio --nostream --lines 200`
   and grep for the send attempt (subject or recipient). serve.mjs logs send
   failures with their SMTP error.
4. **Port reachability:** `bash .agent/skills/webmail/hooks/post-deploy-health.sh`.
5. **Mailcow-side:** `docker logs --tail 100 mailcowdockerized-postfix-mailcow-1`
   (rejections, TLS errors) and rspamd (`...-rspamd-mailcow-1`) for spam-folder
   verdicts on inbound.
6. **DNS/deliverability** (recipient never got it, no errors anywhere): check
   SPF/DKIM/DMARC records for the sending domain with `dig txt`, and the
   SMTP2GO dashboard's bounce log — do not skip this step for "sent but
   invisible" symptoms.

## Output format

`symptom | stack (transactional/mailcow) | failing step | evidence (log line/exit code) | fix`.

## Constraints

- Never print credential values — presence/absence only.
- Never send test emails to real leads; test sends go to MAIL_OWNER only, and
  only with the user's approval.
