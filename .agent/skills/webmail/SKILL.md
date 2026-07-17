---
name: webmail
description: "Use this skill when working on the custom mail.gregiteen.xyz webmail CRM (IMAP/SMTP inbox UI, login/compose/send, the /crm admin panel), or the Mailcow mailbox password sync. Distinct from the email skill (SMTP2GO transactional sending + Mailcow domain admin) — this skill covers direct Dovecot/Postfix IMAP access. MANDATORY: read the full SKILL.md before executing."
---

# Webmail CRM

**This is not the `email` skill.** `.agent/skills/email/SKILL.md` covers SMTP2GO (transactional verification/drip email) and the Mailcow *admin* API (domain/mailbox management). This skill covers the separate, custom webmail app: a real inbox UI that talks directly to Dovecot/Postfix on `mail.gregiteen.xyz` over IMAP/SMTP. Read both if a task touches "email" generally — they don't overlap in code, but they do share the same underlying mailboxes.

## Two independent IMAP stacks — know which one you're touching

| | `scripts/lib/imap.mjs` (legacy) | `scripts/lib/webmail.mjs` + `webmail-ui.mjs` (current app) |
|---|---|---|
| Connection model | One persistent shared connection, one mailbox (`sales@gregiteen.xyz`) | Fresh `ImapFlow` connection per request, per-user session creds |
| Drives | OOO auto-responder poller; old `/api/admin/webmail/inbox`+`/send` routes surfaced in `crm-app.html`'s "Webmail" tab | The standalone `mail.gregiteen.xyz` login/inbox/compose UI |
| Env vars | `IMAP_HOST`/`IMAP_PORT`/`IMAP_USER`(or `MAIL_USER`)/`IMAP_PASS`(or `MAIL_PASS`) | `WEBMAIL_IMAP_HOST`/`WEBMAIL_IMAP_PORT`/`WEBMAIL_SMTP_HOST`/`WEBMAIL_SMTP_PORT` (default to `127.0.0.1`, correct in production since they run on the same droplet as Dovecot/Postfix) |

Run `node .agent/skills/webmail/scripts/check-webmail-env.mjs` to see what's configured for each. **These are a maintenance trap** — it's easy to edit one stack and assume it affects the other. If a report says "webmail is broken," first determine which of the two UIs/routes it's actually about.

## File map

| File | Purpose |
|---|---|
| `scripts/lib/imap.mjs` | Legacy single-mailbox client — see table above |
| `scripts/lib/webmail.mjs` | Pure IMAP/SMTP functions for the standalone app: `verifyLogin`, `listMessages`, `getMessage`, `sendMessage` |
| `scripts/lib/webmail-ui.mjs` (322 lines) | The actual server: in-memory session map, cookie auth, hand-rolled router (`handleWebmail`), inline HTML/CSS templates (login, inbox, message, compose) |
| `static/crm-app.html` | Dark-themed admin SPA. **Not directly reachable** — `GET /crm-app.html` 404s on the main site; it's only served (with an injected nav bar) at `/crm` inside the authenticated webmail app |
| `scripts/lib/mailcow-password.mjs` | Shell-out helpers to change a Dovecot/Mailcow mailbox password (`doveadm pw` hash + `mysql UPDATE` in the Mailcow docker-compose stack) and persist it into this app's `.env` |
| `test/mailcow-password.test.mjs` | Covers parsing/validation/retry helpers only — no live Docker/DB calls |

## End-to-end flow (standalone CRM)

1. Request with `Host: mail.gregiteen.xyz` → `serve.mjs` routes anything not under `/api/` to `handleWebmail`.
2. `POST /login` → `verifyLogin(email, password)` opens+closes an `ImapFlow` connection to prove the creds work.
3. On success: random token, `{email, password, createdAt}` stored in the in-memory `webmailSessions` Map (never written to disk), `gi_webmail` cookie (HttpOnly, Secure, SameSite=Lax, 12h TTL).
4. `GET /` → fresh IMAP connection, last 50 UIDs, `inboxPage`.
5. `GET /message/:uid` → downloads+parses via `mailparser`, marks `\Seen`.
6. `POST /compose` → SMTP transport (port 587, STARTTLS), same session creds, sends via Postfix.
7. `GET /crm` → serves `crm-app.html` with an injected nav bar. Its client-side JS calls `/api/admin/*` on the *main* router (excluded from the webmail router by the `/api/` prefix), gated by `isAdmin()` — accepts the `gi_webmail` cookie if the session email is the mail owner/admin/`sales@gregiteen.xyz`.
8. From `/crm`, "Open signing workspace" hits the Documenso SSO flow — see the `documenso` skill for that handoff.

## Mailcow password sync

Two systems hold the same mailbox password independently: Dovecot/Mailcow's own DB row, and this app's `.env` (`IMAP_PASS`) plus any live in-memory `webmailSessions`. `POST /api/reset-password` is the single writer that keeps all of it consistent, in this order:
1. `setMailcowMailboxPassword` — shells into the Mailcow docker-compose stack, hashes via `doveadm pw -s <scheme>`, `UPDATE`s the `mailbox` table over `docker compose exec mysql-mailcow`.
2. `persistAppMailboxPassword` — atomically rewrites `IMAP_PASS` in `.env` (temp file + rename, mode 0600).
3. `refreshImapPassword` (from `imap.mjs`) — drops the cached shared client so it reconnects with the new password.
4. `updateWebmailSessionPasswords` — patches any already-logged-in `webmailSessions` in place so active users aren't kicked out.

Skip step 1 and the old password still works over IMAP after a "reset." Skip steps 2-4 and the admin-dashboard poller (`imap.mjs`) starts failing auth after any reset. `mailcow-password.mjs` itself is pure/testable — the SQL is built from a regex-validated email (`MAILBOX_RE` disallows quotes), still raw interpolation but constrained.

## Testing

`npm test` covers `mailcow-password.mjs` fully (mocked, no real Docker/mysql). **There are no tests at all** for `webmail.mjs`, `webmail-ui.mjs`, or `imap.mjs` — changes to login, inbox rendering, send, or the OOO poller have no automated regression net. Say so explicitly; don't imply coverage that doesn't exist.

## Gotchas

- IMAP/SMTP passwords are never logged (`logger: false` on `ImapFlow` in both stacks); sessions live only in-memory, lost on restart by design (every deploy restarts PM2 — see the `deploy` skill).
- `crm-app.html` has no auth of its own — protected only by (a) 404-ing on the main site and (b) `webmail-ui.mjs` gating `/crm` behind a valid session. Its embedded fetch calls separately rely on `isAdmin()`.
- `webmail.mjs` and `webmail-ui.mjs` both set `tls: { rejectUnauthorized: false }` for the loopback connection — **intentional** (cert CN mismatch on `127.0.0.1`), not a bug to "fix" by removing.
- Archived docs (`docs/projects/archived/webmail-crm-integration/WEBMAIL_CRM_TRACKER.md`) reference `static/admin.html` — the live file is `static/crm-app.html`. That doc has drifted; don't trust it for current routes/filenames.
- Naive `\\n`→`\n` replace for OOO/send text appears in both `imap.mjs` and the legacy send handler in `serve.mjs` — if you fix one, check the other.

## Local preview

`npm run dev` starts the whole server, but Dovecot/Postfix aren't running locally — to exercise the webmail vhost, send `Host: mail.gregiteen.xyz` (e.g. `curl -H "Host: mail.gregiteen.xyz" ...` or an `/etc/hosts` entry) and point `WEBMAIL_IMAP_HOST`/`WEBMAIL_SMTP_HOST` at the droplet's public IP.
