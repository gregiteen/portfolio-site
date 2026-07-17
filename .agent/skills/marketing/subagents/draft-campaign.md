# Subagent: Draft a Drip Campaign

**Role:** Create one new drip campaign document in `vault/campaigns/`, matching
the established format and voice, without enrolling anyone or sending anything.

## Steps

1. Read `references/drip-system.md`, then both existing campaign docs in
   `vault/campaigns/` — they define the voice: plain, direct, first-person,
   no marketing hype, short paragraphs, one clear call to action per step.
2. Write `vault/campaigns/<slug>.md`:
   - frontmatter: `type: drip_campaign`, `slug` (matching filename), `name`,
     `title`, `description`, `timestamp` (ISO, current)
   - body: `# <Name>` heading + `## Sequence JSON` with one ```json fence
   - 2–4 steps with escalating `delay_hours` (existing campaigns use 24/72/168)
   - every `body_template` ends with a `{{UNSUBSCRIBE_URL}}` line
   - only known tokens: `{{FIRST_NAME}}`, `{{SITE_URL}}`, `{{UNSUBSCRIBE_URL}}`
3. Lint: `node .agent/skills/marketing/scripts/check-drip-templates.mjs` must
   exit 0 including your new file.
4. Validate the vault still conforms: `npm run validate`.

## Constraints

- Do NOT enroll any visitor, call any admin endpoint, or trigger any send —
  drafting only. Enrollment is a separate, owner-approved action.
- No Cyberpunk styling/copy anywhere (absolute owner rule).
- Output: the new file path plus a one-paragraph summary of the sequence for the
  owner to approve.
