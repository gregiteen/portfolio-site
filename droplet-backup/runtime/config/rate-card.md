---
type: "rate_card"
title: "Rate Card"
description: "Source-of-truth pricing bands for AI-generated client proposals."
timestamp: "2026-07-09T01:15:53.287Z"
---
This is the ONLY source of pricing for automated proposals. The CNA proposal
generator (`scripts/serve.mjs`, `/api/cna-proposal`) reads this file and MUST
quote within these bands — it never invents numbers. Edit the figures below
any time; changes take effect on the next proposal generated, no redeploy
needed.

Positioning: aggressive, not cheap. These rates should read as a specialist,
not a commodity freelancer — priced to filter for serious engagements while
still winning good-fit smaller work.

## Baseline

- **Hourly rate:** $75/hr (ad-hoc, scoping, small revisions)
- **Retainer:** $3,000–$5,000/mo (ongoing maintenance + feature work, priority response)

## Price bands by service category

| Category | Range | Notes |
|---|---|---|
| Marketing / brochure site | $1,250 – $3,000 | Portfolio-style site, templated AI-generated design, few pages |
| Multi-page site / web app | $3,000 – $9,000 | CMS-backed, custom interactivity, more than ~6 pages |
| E-commerce | $5,000 – $15,000 | Storefront, payments, inventory, order management |
| Automation / integration tooling | $3,000 – $7,500 | Scheduling, browser automation, deploy tooling, API glue |
| AI integration | $6,000 – $20,000 | LLM features added to an existing product — chat, RAG, agents |
| AI calling & SMS | $7,500 – $22,500 | Voice/SMS AI agents, telephony integration, compliance, latency-sensitive |
| Authentication | $2,500 – $7,500 | SSO/OAuth, MFA, session infrastructure, standalone hardening |
| AI model hosting & fine-tuning | $10,000 – $30,000 | Custom model deployment, fine-tuning pipelines, inference infra |
| Mobile apps | $10,000 – $30,000 | Native or cross-platform |
| Cloud platform / infra build | $7,500 – $25,000 | Multi-service architecture, IaC, scaling |
| Full product build | $20,000 – $60,000+ | Multi-month, full-stack + AI + infra (UltraChat-scale) |

## Rules for the proposal generator

1. Match the CNA assessment's `project_type` (and conversation context) to the
   closest category above. If a project spans multiple categories, sum the
   relevant bands and note the composite in the proposal.
2. Position within the band using `complexity` from the assessment: Low → low
   end, Medium → middle, High → high end (or above, called out explicitly, if
   scope clearly exceeds the band).
3. Never quote below the low end of the matched band. Never quote a bare
   number — always a range, with the rationale for where in the range it
   lands.
4. If nothing matches well, fall back to the hourly rate and estimate hours,
   rather than fabricating a project-type band.
