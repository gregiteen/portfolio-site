---
type: "drip_campaign"
slug: "post-proposal-followup"
name: "Post-Proposal Follow-up"
title: "Post-Proposal Follow-up (post-proposal-followup)"
description: "2-step check-in triggered on proposal_sent; stops on signing viewed/signed or reply."
timestamp: "2026-08-11T00:00:00.000Z"
trigger: "opportunity.stage == proposal_sent"
branch_on: "reply_or_signing_viewed"
---

# Post-Proposal Follow-up

Triggered when `opportunity.stage` becomes `proposal_sent`. Stops on `negotiating`/`won` or an `inbox_message` reply classified to the opportunity/proposal.

## Sequence JSON

```json
{
  "steps": [
    {
      "delay_hours": 48,
      "template_id": "post-proposal-checkin",
      "subject": "Checking in — {{title}} / {{company}}",
      "body_template": "Hi {{lead_name}},\n\nYour proposal for {{title}} ({{company}}) is awaiting review. View & sign when ready: {{signing_url}} — next on our side: {{next_action}}\n\n— Greg\n\n{{unsubscribe_url}}"
    },
    {
      "delay_hours": 120,
      "template_id": "post-proposal-checkin",
      "subject": "Quick follow-up — {{title}}",
      "body_template": "Hi {{lead_name}},\n\nIf scope or timing shifted, reply with the delta and I’ll revise the draft — no need to start over.\n\n— Greg\n\n{{unsubscribe_url}}"
    }
  ]
}
```
