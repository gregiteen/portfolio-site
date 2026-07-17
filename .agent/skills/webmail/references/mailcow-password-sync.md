# Mailcow password sync — why 4 steps, in this order

Source: `scripts/lib/mailcow-password.mjs`, the `POST /api/reset-password` handler in `scripts/serve.mjs`, `scripts/lib/imap.mjs`.

There is no single system of record for a mailbox password here — it's replicated across three independent places, and a "reset password" action has to update all three or the app enters an inconsistent state:

1. **Dovecot/Mailcow's own database** — the actual IMAP/SMTP auth backend. Changed via `doveadm pw -s <scheme>` (hash) + a raw `mysql UPDATE mailbox SET password=... WHERE username=...` executed through `docker compose exec mysql-mailcow` on the droplet. This is the only step that changes what password *actually* authenticates over IMAP/SMTP.
2. **This app's `.env` (`IMAP_PASS`)** — read by `imap.mjs`'s legacy single-connection client at boot. Rewritten atomically (temp file + `rename()`, mode `0600`) so a crash mid-write can't corrupt `.env`.
3. **`imap.mjs`'s cached connection** — `refreshImapPassword()` drops the cached client so the next use reconnects with the new password instead of failing auth silently.
4. **Any live `webmailSessions`** (in-memory, from `webmail-ui.mjs`) — `updateWebmailSessionPasswords()` patches sessions that are already logged in, so an admin mid-session doesn't get logged out by their own password reset.

## Failure modes if a step is skipped

- Skip step 1: the "reset" is cosmetic — the *old* password still authenticates over real IMAP/SMTP, so anyone with the old credentials still has access. This is the highest-severity failure mode; treat it as a security bug, not a UX bug.
- Skip step 2: the app's own config drifts from the real password — the *legacy* admin poller (`imap.mjs`) will start failing auth on its next reconnect, degrading the OOO auto-responder silently.
- Skip step 3: same failure as above but sooner — the cached connection keeps using the stale password until something forces a reconnect.
- Skip step 4: any admin already logged into the standalone webmail app gets booted on their next IMAP call, mid-session, with no warning.

## Security note on the SQL

`mailcow-password.mjs` builds the `UPDATE` statement by interpolating the mailbox email directly into a SQL string (not a prepared statement), constrained by `MAILBOX_RE`, a regex that disallows quotes and other SQL-meaningful characters. This is a real injection surface narrowed by input validation, not eliminated by parameterization — if you ever touch `MAILBOX_RE`, treat any loosening of it as a security-sensitive change requiring the same care as touching `verifyWebhookSecret` in the `documenso` skill.
