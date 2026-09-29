---
type: page
slug: "project-ultrachat"
title: "UltraChat — AI Workspace Platform"
description: "A multi-tenant AI workspace in which assistants operate email, telephony, CRM and scheduling, and each workspace is a portable set of SSSS documents."
timestamp: 2026-09-28T20:00:00Z
name: "UltraChat"
sandbox_entry: "projects/ultrachat.html"
x_kind: "project"
x_year: 2026
x_role: "Founder and lead engineer"
x_tech:
  - "TypeScript"
  - "React"
  - "Express"
  - "Supabase"
  - "Asterisk"
  - "SSSS"
x_link: "https://ultrachat.app"
x_logo: "assets/logos/ultrachat.png"
x_featured: true
---

## Thesis

Most AI products stop at conversation. UltraChat is built on the premise that an assistant becomes valuable when it can act within the systems a business already runs, and that a business built this way should be something its owner can copy, sell or move. It is a multi-tenant workspace in which assistants read and send email, answer and place calls, maintain the CRM, schedule meetings and execute workflows, under the same permissions and audit as the people beside them.

## Workspaces generated from a specification

The primary workflow is provisioning. From a structured description of a business, an orchestrator creates the workspace and fans out into parallel steps: assistants and their identifiers, workflows and automations, branding and a design manifest, a knowledge base, marketing assets, tasks, domains and a generated website. Ordering is enforced where it matters, and workflow documents are rewritten to reference the identifiers of the assistants actually created, so a generated workspace is internally consistent from its first minute.

## Communications and action

A unified inbox brings email, SMS and voice into one timeline. Telephony runs on Asterisk with a dedicated voice gateway and synthesized speech, mailboxes synchronize with Google and Microsoft accounts, and contacts are enriched as they arrive. Assistants act through a workflow execution engine, a skill system that can generate and install new skills, a code mode for sandboxed execution, and Model Context Protocol integrations. Spend caps, credit accounting, two-factor authentication and fraud detection bound what any tenant or assistant can do.

## State that can change hands

Each workspace is a virtual filesystem of SSSS documents, and the relational store is a projection of it. That choice makes a marketplace possible. A backup export preserves everything; a template or sale export is produced by the SSSS reference engine against the platform's composed registry, which removes tenant-private documents such as customers and transcripts, converts resource-bound fields such as telephone numbers and mailboxes into requirements the buyer must satisfy, and fails outright on any non-conformant document. On installation, the buyer's workspace keeps its own identity, ownership and membership and adopts only the structural model of the template. A working business process thus becomes an asset that can be listed, previewed, purchased and provisioned.

## Custom models

Tenants can run UltraChat custom models: dedicated model deployments that UltraChat operates on its own infrastructure and bills against the tenant's credit balance at actual cost plus a fixed margin, in place of a bring-your-own-key arrangement.
