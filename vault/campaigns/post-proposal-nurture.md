---
type: drip_campaign
slug: post-proposal-nurture
name: "Post Proposal Follow-up"
title: "Post Proposal Follow-up Campaign"
description: "A respectful follow-up sequence after an opted-in prospect receives a proposal."
timestamp: 2026-07-09T20:20:00.000Z
---

# Post Proposal Follow-up Campaign

## Sequence JSON

```json
{
  "steps": [
    {
      "delay_hours": 168,
      "subject": "Any questions on the proposal?",
      "body_template": "Hi {{FIRST_NAME}},\n\nI wanted to make space for any questions that came up while reviewing the proposal. A short reply with what feels unclear is enough—I will meet you there.\n\n— Greg\n\nUnsubscribe: {{UNSUBSCRIBE_URL}}"
    },
    {
      "delay_hours": 336,
      "subject": "Closing the loop",
      "body_template": "Hi {{FIRST_NAME}},\n\nI am closing the loop on the proposal for now. If the timing changes, reply here and we can pick it up without starting from scratch.\n\n— Greg\n\nUnsubscribe: {{UNSUBSCRIBE_URL}}"
    }
  ]
}
```
