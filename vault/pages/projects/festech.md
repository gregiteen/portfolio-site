---
type: page
slug: "project-festech"
title: "festech.live — Operating System for Artist Collectives"
description: "A multi-tenant platform that consolidates the CRM, events, ticketing, commerce, telephony and messaging of artist collectives on SSSS state."
timestamp: 2026-09-28T20:00:00Z
name: "festech.live"
sandbox_entry: "projects/festech.html"
x_kind: "project"
x_year: 2026
x_role: "Architect and lead engineer"
x_tech:
  - "TypeScript"
  - "Next.js"
  - "Expo"
  - "tRPC"
  - "PostgreSQL"
  - "Asterisk"
  - "SSSS"
x_link: "https://festech.live"
x_logo: "assets/logos/festech.png"
x_logo_style: "cover"
x_featured: true
---

## The problem

Artist collectives and the organizations that produce live events operate across a dozen disconnected tools: spreadsheets for budgets, one service for email, another for ticketing, payment applications for splits and group chats for show-day coordination. The consequences are lost revenue, duplicated records and administrative work that competes with the art itself. No existing product models what these organizations actually are: shared governance, fluid membership, project-based budgets and revenue divided among many parties.

## The platform

festech.live is a multi-tenant platform that gives each collective a single environment for its operations. It covers member and talent management, event planning and a live operations view for show day, ticketing with QR check-in, inventory, pricing and refunds, merchandise storefronts, accounting and event billing, sponsorships, domains with event-scoped email, document signing and a public website generated for each collective. The codebase is a Turborepo monorepo: a Next.js web application with a tRPC API, an Expo mobile application, a communications stack built around Asterisk, and shared packages for authentication, the database, validation, the UI and the messaging engine.

## Messaging that degrades gracefully

The communications engine normalizes every outbound message and routes it by the recipient's stated preference, then falls back through a defined cascade of push, Telegram, Discord, WhatsApp, RCS, SMS and email. Each channel is guarded by its own circuit breaker and rate limiter, failed deliveries are held in a dead-letter queue, events are expressed as CloudEvents, and topic-level opt-outs are enforced before any channel is attempted. A message is therefore delivered by the least expensive channel that works, and never to a recipient who declined it.

## Documents as the source of truth

Every write that matters passes through the SSSS kernel. The vault is canonical and PostgreSQL is a projection: after a document commits, the kernel projects it into the tables that the registry declares for its type. Where a primitive fans out into several normalized tables (an event with its tasks, budget, guests and ticket tiers; an order with its tickets), a dedicated projector encodes the business rules. For the remainder, a conservative generic projector maps frontmatter to columns and declines to write when a required value is missing, rather than failing deep inside a commit. Drift between documents and tables is detectable and repairable, because the tables can always be rebuilt from the vault.

## Engineering discipline

The repository serves as the reference application for reusable Total Recall and SSSS capabilities, so features are designed to be extracted into white-label plugins rather than welded into one product. Work is planned through an audit, requirements, architecture, a development plan and a tracker before code is written, and quality gates for types, lint, internationalization and SSSS conformance run on dedicated hardware before any deployment.
