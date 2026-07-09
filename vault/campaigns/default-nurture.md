---
type: drip_campaign
slug: default-nurture
name: "Default Nurture"
title: "Default Nurture Campaign"
description: "A three-part follow-up for opted-in portfolio visitors."
timestamp: 2026-07-09T20:20:00.000Z
---

# Default Nurture Campaign

## Sequence JSON

```json
{
  "steps": [
    {
      "delay_hours": 24,
      "subject": "A closer look at the system behind your edition",
      "body_template": "Hi {{FIRST_NAME}},\n\nYesterday the portfolio generated an edition around your prompt. The useful part is not the visual trick—it is the system underneath: source-owned content, durable runtime state, and a review gate before generated work is published.\n\nSee the work: {{SITE_URL}}\n\n— Greg\n\nUnsubscribe: {{UNSUBSCRIBE_URL}}"
    },
    {
      "delay_hours": 72,
      "subject": "What would remove the most friction from your work?",
      "body_template": "Hi {{FIRST_NAME}},\n\nThe projects I take on usually begin with one practical question: what is slowing the team down right now? If you have a workflow, customer experience, or internal system worth improving, reply with the messy version.\n\nStart a conversation: {{SITE_URL}}/consult.html\n\n— Greg\n\nUnsubscribe: {{UNSUBSCRIBE_URL}}"
    },
    {
      "delay_hours": 168,
      "subject": "A direct line if the timing is right",
      "body_template": "Hi {{FIRST_NAME}},\n\nIf a project is taking shape, you can reply directly to this email or use the consultation flow when it is useful. I read every serious inquiry myself.\n\n— Greg\n\nUnsubscribe: {{UNSUBSCRIBE_URL}}"
    }
  ]
}
```
