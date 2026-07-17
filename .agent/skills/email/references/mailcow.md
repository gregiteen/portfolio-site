# Mailcow on the droplet — verified topology

Facts below verified live via `docker ps` on the droplet (138.197.199.217),
2026-07-17. Mailcow serves `mail.gregiteen.xyz`.

## Container stack (mailcowdockerized-*)

| Container | Image (verified) | Role |
|:---|:---|:---|
| dovecot | ghcr.io/mailcow/dovecot:2.35 | IMAP/POP — ports 110/143/993/995, sieve 4190 |
| postfix | ghcr.io/mailcow/postfix:1.81 | SMTP — ports 25/465/587 |
| nginx | ghcr.io/mailcow/nginx:1.05 | Mailcow UI/API — 127.0.0.1:8080 + :8443 (proxied by host nginx) |
| mysql | mariadb:10.11 | Mailcow DB — 127.0.0.1:13306 |
| redis | redis:7.4.6-alpine | 127.0.0.1:7654 |
| rspamd / clamd / olefy | — | spam + AV pipeline |
| sogo | ghcr.io/mailcow/sogo | stock groupware UI (NOT used — the custom webmail at mail.gregiteen.xyz is ours, see the webmail skill) |
| acme / watchdog / ofelia / unbound / dockerapi / netfilter / memcached / postfix-tlspol | — | infra plumbing |

## API

- `MAILCOW_API_URL` + `MAILCOW_API_KEY` (droplet .env; names only — never print
  values). Used for mailbox admin from this repo's scripts.
- Mailbox password changes are NOT api-only: the working sync path is the
  4-step doveadm/mysql/.env/session dance documented in the **webmail** skill's
  `references/mailcow-password-sync.md`. Read that before touching passwords.

## Two sending stacks — don't conflate them

1. **SMTP2GO / SMTP_*** env — transactional sends from `scripts/serve.mjs`
   (proposals, drip, notifications).
2. **Mailcow (Postfix)** — the actual mailbox domain (`MAILCOW_DOMAIN`),
   receiving + IMAP for the webmail CRM.

"Email is broken" triage starts with `scripts/check-email-env.mjs` locally, then
the same check against the droplet .env (names only), then
`webmail/hooks/post-deploy-health.sh` for port reachability.
