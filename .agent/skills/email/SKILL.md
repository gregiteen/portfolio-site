---
repo_scoped: true
name: email
description: "Use this skill to manage email infrastructure, check the mail server status, and configure SMTP2GO or Mailcow environments."
---

# Email Infrastructure

This skill provides all the information needed to manage the email stack for the portfolio.

## Mail Server Configuration

The email infrastructure leverages a hybrid stack: **Mailcow** for inbound/outbound domain control and **SMTP2GO** for high-deliverability transactional relays.

All required credentials have been injected into `.env`. **Do not expose these secrets.** Read them dynamically using `process.env`.

### 1. SMTP2GO (High-deliverability Transactional Relay)
Used by `serve.mjs` for sending Auth Verification Codes and the Automated Drip Campaign.

* **Host:** `mail.smtp2go.com`
* **Port:** `2525`
* **API Key:** Extracted to `.env` as `SMTP2GO_API_KEY`
* **SMTP User:** `portfolio.gregiteen.xyz` (in `.env` as `SMTP_USER`)
* **SMTP Pass:** Extracted to `.env` as `SMTP_PASS`

### 2. Mailcow (Domain Control & Admin Mailboxes)
Located on the `ultrachat.app` domain, used for receiving emails and managing domain mailboxes.

* **API URL:** `https://mail.ultrachat.app` (in `.env` as `MAILCOW_API_URL`)
* **API Key:** Extracted to `.env` as `MAILCOW_API_KEY`
* **Domain:** `ultrachat.app` (in `.env` as `MAILCOW_DOMAIN`)
* **Admin Access:** Password extracted to `.env` as `MAILCOW_ADMIN_PASSWORD`

## Usage Instructions

When asked to check, configure, or diagnose email issues (such as fixing Drip Campaigns or Verification codes):

1. **Do not hardcode secrets.** Always read from the local `.env` file using `process.env`.
2. **Use SMTP2GO for sending.** All automated transactional emails MUST be routed through the SMTP2GO credentials.
3. **Use Mailcow for inbound.** Any domain or mailbox modifications must hit the Mailcow API.
