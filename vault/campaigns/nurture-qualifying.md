---
type: "drip_campaign"
slug: "nurture-qualifying"
name: "Nurture — Qualifying"
title: "Nurture — Qualifying (nurture-qualifying)"
description: "3-step nurture triggered on opportunity entering qualifying; branches on reply (inbox_message)."
timestamp: "2026-08-11T00:00:00.000Z"
trigger: "opportunity.stage == qualifying"
branch_on: "reply"
---

# Nurture — Qualifying

Triggered when `opportunity.stage` becomes `qualifying`. Each step is an `email_template` render queued via `lib/drip.mjs`; a reply (IMAP `inbox_message` classified to this opportunity) pauses the sequence.

## Sequence JSON

```json
{
  "steps": [
    {
      "delay_hours": 24,
      "template_id": "qualifying-followup",
      "subject": "Quick nudge — {{company}} × Greg Iteen",
      "body_template": "Hi {{lead_name}},\n\nYou’re in qualifying for {{company}}. If scope is close, I can turn a proposal draft around in a day — band {{rate_card_band}} per rate-card. Proposal link when ready: {{proposal_link}}\n\n— Greg\n\n{{unsubscribe_url}}"
    },
    {
      "delay_hours": 72,
      "template_id": "qualifying-followup",
      "subject": "One question before a draft — {{company}}",
      "body_template": "Hi {{lead_name}},\n\nWhat’s the single outcome that would make {{title}} a win for {{company}}? Reply with the messy version and I’ll tailor the draft.\n\n— Greg\n\n{{unsubscribe_url}}"
    },
    {
      "delay_hours": 168,
      "template_id": "qualifying-followup",
      "subject": "Still worth a look — {{company}}",
      "body_template": "Hi {{lead_name}},\n\nIf timing slipped, reply ‘later’ and I’ll park this until you’re ready — no follow-ups until you re-activate.\n\n— Greg\n\n{{unsubscribe_url}}"
    }
  ]
}
```
