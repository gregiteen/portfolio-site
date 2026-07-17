# Drip campaign system — how it actually works

Verified against `scripts/lib/drip.mjs`, `scripts/serve.mjs`, and
`vault/campaigns/` 2026-07-17.

## Campaign definitions

Live in `vault/campaigns/*.md` (currently `default-nurture.md`,
`post-proposal-nurture.md`). Each doc:

- frontmatter: `type: drip_campaign`, `slug`, `name`, `title`, `description`
- body: a `## Sequence JSON` section containing one ```json fence:

```json
{
  "steps": [
    { "delay_hours": 24, "subject": "...", "body_template": "Hi {{FIRST_NAME}}, ... {{UNSUBSCRIBE_URL}}" }
  ]
}
```

### Template tokens

`{{FIRST_NAME}}`, `{{SITE_URL}}`, `{{UNSUBSCRIBE_URL}}` — rendered by
`renderDripTemplate(template, variables)` in `scripts/lib/drip.mjs`. A typo'd
token survives rendering verbatim and reaches the lead; every body must contain
`{{UNSUBSCRIBE_URL}}`. `scripts/check-drip-templates.mjs` (this skill) lints all
of this — run it after any campaign edit (`hooks/pre-send-drip-check.sh`).

## Engine (`scripts/lib/drip.mjs`, unit-tested in `test/drip-and-proposal.test.mjs`)

- `enrollInCampaign(campaign, now)` → initial per-visitor drip state
- `advanceDripState(campaign, current, sentAt)` → next step / completion
- `delayMs(step)` — `delay_hours` to ms
- `createUnsubscribeToken(email, secret, {expiresAt})` / `verifyUnsubscribeToken`
  — HMAC-style tokens, default 180-day expiry

## Scheduler wiring (`scripts/serve.mjs`)

- Requires `DRIP_UNSUBSCRIBE_SECRET` (falls back to `ADMIN_API_TOKEN`); if
  neither is set the scheduler logs an error and **pauses** — silent-looking
  "drip stopped" symptoms start there.
- Enrollment state rides the runtime store (`pendingDripVisitors()` in
  `scripts/runtime-store.mjs`) — production state is droplet-only.
- Admin can enroll visitors via `POST /api/admin/visitors/drip` (isAdmin-gated).

## Rules

- Never enroll real visitors or trigger sends while testing — drip writes
  runtime state and emails real people. Test template rendering with the lint
  script, which uses sample variables and touches nothing.
- Campaign copy voice: read both existing campaigns first; they are the voice
  reference (plain, direct, no hype).
