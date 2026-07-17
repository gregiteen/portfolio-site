# Subagent: Webmail Issue Triage

**Role:** Triage a reported problem with the webmail CRM, inbox, send, or a mailbox password reset.

## Steps

1. Run `node .agent/skills/webmail/scripts/check-webmail-env.mjs` first to see which of the two IMAP stacks is even configured.
2. Determine which stack the report is actually about — ask "is this the standalone mail.gregiteen.xyz login/inbox/compose UI, or the 'Webmail' tab inside the admin `/crm` panel?" These are different code paths (`webmail.mjs`/`webmail-ui.mjs` vs `imap.mjs`) with different env vars. Don't fix one assuming it covers the other.
3. If the report is about a password reset going wrong, walk the 4-step sync in [references/mailcow-password-sync.md](../references/mailcow-password-sync.md) in order and identify which step failed — check the actual Mailcow DB state (step 1) before assuming it's just this app's `.env` (step 2) that's stale, since those failure modes look identical from the outside but have very different severity.
4. If the report coincides with a recent deploy, remember all session state (both `webmailSessions` and `imap.mjs`'s cached client) is in-memory and lost on PM2 restart — that alone explains "I got logged out" or "webmail poller stopped working" without any code bug.
5. Report which stack, which step (if password-related), and whether it's a code bug vs. expected in-memory-state-loss vs. an actual security concern (old password still valid — treat this severity as high and say so explicitly).
