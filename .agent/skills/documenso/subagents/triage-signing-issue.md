# Subagent: Documenso Signing Issue Triage

**Role:** Triage a reported problem with proposal signing, the "Signed, gi." pages, webhooks, or the admin SSO handoff.

## Steps

1. Run `node .agent/skills/documenso/scripts/check-documenso-env.mjs` first — a large fraction of "signing is broken" reports are actually an unset env var causing silent fallback (plain PDF attachment instead of a real signing link), not a code bug.
2. Identify which flow the report is about (see SKILL.md): (A) proposal send/signing, (B) admin SSO into the workspace, or (C) the rate-card PDF. They share some code (`verifyWebhookSecret`) but are otherwise independent — don't assume a fix to one affects another.
3. For flow A: check whether the failure is at document creation, upload, field placement, send, or the webhook callback — `createSigningRequest`'s 4-call sequence has no retry, so a partial failure can leave an orphaned unsent document on the Documenso side (check the Documenso admin UI directly, this repo has no visibility into that state).
4. For flow B: remember step 3 of the SSO flow calls out to `${DOCUMENSO_BASE_URL}/api/auth/signedgi-sso`, a custom endpoint on the Documenso fork that this repo cannot inspect. If the redirect happens but the callback (`POST /api/documenso/sso/consume`) never arrives, the problem is very likely on the Documenso side, not here — say so plainly instead of guessing at a fix in this repo's code.
5. Remember all SSO handoff state and the webhook-secret verification are in-memory / stateless-per-restart — if the report coincides with a recent deploy (PM2 restart), that's a strong candidate root cause before looking for a code bug.
6. Report: which flow, what's actually broken (env config vs. this repo's code vs. unverifiable external dependency), and what you'd need (e.g. Documenso admin access, server logs) to go further if you can't fully resolve it from this repo alone.
