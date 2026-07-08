---
name: marketing
description: "Use this skill for marketing workflows, drip campaigns, emails, lead generation, and messaging."
---

# Marketing & Drip Campaigns

- **Tone & Voice:** Highly professional agency tone. No emojis. No trite marketing language ("unleash", "dive into"). Focus on structural architecture, bespoke automation, and strict design specifications.
- **Drip Strategy:** 
  1. Welcome Email (Immediate upon `optIn`).
  2. Drip 1: Deep dive into the stateless markup pipeline architecture.
  3. Drip 2: Generating design systems without templated UI components.
  4. Offer: Free initial 20% discount on architectural audits (as included in the `DESIGN.md` specs).
- **Lead Generation:** Leads are primarily captured via the `/api/send-code` pipeline where users submit their email to get a 2FA code and trigger background site generation. If `optIn` is true, their profile is marked for the drip sequence.
- **Infrastructure:** All automated emails sent by marketing workflows MUST utilize the configuration defined in the [`/email` skill](file:///Users/greg/Github/portfolio-site/.agent/skills/email/SKILL.md) (e.g. SMTP2GO for relays, Mailcow for domains).
