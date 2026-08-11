---
title: "post-proposal-checkin"
type: "email_template"
template_id: "post-proposal-checkin"
subject: "Proposal check-in — {{company}} / {{title}}"
description: "Post proposal_sent check-in, links signing and next action."
timestamp: "2026-08-11T00:00:00.000Z"
variables: ["lead_name","company","title","signing_url","next_action","unsubscribe_url"]
---

# Post-Proposal Check-in

Hi {{lead_name}},

Your proposal for {{title}} ({{company}}) is awaiting review.

View & sign when ready: {{signing_url}}
Next action on our side: {{next_action}}

— Greg · {{unsubscribe_url}}
