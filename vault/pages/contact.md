---
type: page
slug: "contact"
title: "Start a Project with Greg Iteen"
description: "Describe the system you intend to build. The brief takes about two minutes, and every enquiry receives a personal reply."
timestamp: 2026-09-28T20:00:00Z
name: "Contact"
sandbox_entry: "contact.html"
x_kind: "section"
x_nav_order: 3
x_form_title: "Start a brief"
x_form_lede: "Seven short questions, one at a time. Your answers reach me directly and are stored as a single private record; they are never shared or added to a mailing list."
x_form_done_title: "Brief received."
x_form_done: "Thank you. I read every brief personally and will reply within two working days, usually with a few clarifying questions and a proposed next step."
x_form_error: "The brief could not be sent. Please try again, or email me@gregiteen.xyz directly."
x_form_submit: "Send brief"
x_brief:
  - id: "engagement"
    kind: "choice"
    prompt: "What would you like to build?"
    help: "Choose the closest description; you can qualify it on the next screen."
    options:
      - value: "agent-memory"
        label: "Agent memory and instruction infrastructure"
      - value: "ssss"
        label: "File-native architecture or SSSS adoption"
      - value: "platform"
        label: "A multi-tenant AI platform or workspace"
      - value: "communications"
        label: "Communications, telephony or messaging integration"
      - value: "review"
        label: "An architecture review of an existing system"
      - value: "other"
        label: "Something else"
  - id: "brief"
    kind: "long"
    prompt: "Describe the system and the outcome you need."
    help: "What exists today, what should exist afterward, and any constraints that matter. Press Shift and Enter for a new line."
    placeholder: "We run three coding agents across twelve repositories and want them to share one set of binding rules..."
    min: 20
    max: 2000
  - id: "organization"
    kind: "choice"
    prompt: "Which best describes your organization?"
    options:
      - value: "independent"
        label: "Independent or founder-led"
      - value: "startup"
        label: "Venture-backed startup"
      - value: "company"
        label: "Established company"
      - value: "nonprofit"
        label: "Nonprofit, collective or public body"
  - id: "timeline"
    kind: "choice"
    prompt: "When should work begin?"
    options:
      - value: "now"
        label: "Immediately"
      - value: "month"
        label: "Within a month"
      - value: "quarter"
        label: "Within a quarter"
      - value: "exploring"
        label: "Exploratory; no fixed date"
  - id: "budget"
    kind: "choice"
    prompt: "What budget has been allocated?"
    help: "A range is sufficient. It determines scope, not whether I reply."
    options:
      - value: "under-10k"
        label: "Under $10,000"
      - value: "10k-25k"
        label: "$10,000 to $25,000"
      - value: "25k-75k"
        label: "$25,000 to $75,000"
      - value: "over-75k"
        label: "Above $75,000"
      - value: "undefined"
        label: "Not yet defined"
  - id: "identity"
    kind: "fields"
    prompt: "Who is writing?"
    fields:
      - name: "name"
        label: "Your name"
        type: "text"
        autocomplete: "name"
        required: true
        max: 120
      - name: "company"
        label: "Organization or website (optional)"
        type: "text"
        autocomplete: "organization"
        required: false
        max: 160
  - id: "reply"
    kind: "fields"
    prompt: "Where should I send my reply?"
    fields:
      - name: "email"
        label: "Email address"
        type: "email"
        autocomplete: "email"
        required: true
        max: 200
      - name: "consent"
        label: "I agree to be contacted about this enquiry."
        type: "checkbox"
        required: true
---

I take on a limited number of engagements: agent memory and instruction infrastructure, file-native application architecture and SSSS adoption, multi-tenant AI platforms, communications and telephony integration, and technical review of systems that are already running.

If you would rather write directly, email [me@gregiteen.xyz](mailto:me@gregiteen.xyz) or find the source at [github.com/gregiteen](https://github.com/gregiteen).
