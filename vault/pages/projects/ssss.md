---
type: page
slug: "project-ssss"
title: "SSSS — Structured Semantic Syntax System"
description: "An open specification and dependency-free reference engine in which a vault of typed Markdown documents is the complete state of an application."
timestamp: 2026-09-28T20:00:00Z
name: "SSSS"
sandbox_entry: "projects/ssss.html"
x_kind: "project"
x_year: 2026
x_role: "Author of the specification and reference engine"
x_tech:
  - "Open specification"
  - "Node.js"
  - "Zero runtime dependencies"
  - "Conformance suite"
x_link: "https://github.com/gregiteen/ssss"
x_repo: "https://github.com/gregiteen/ssss"
x_logo: "assets/logos/ssss.png"
x_featured: true
---

## Premise

When an AI agent is permitted to change a system, the system's state must satisfy three requirements that conventional databases meet poorly: it must be legible to the agent and to a human reviewer, every change must be validated and attributable, and the whole must be movable between environments without losing its meaning. SSSS, the Structured Semantic Syntax System, is a vendor-neutral standard that satisfies all three by making typed Markdown documents the canonical state and treating every other store as derived.

## Primitives and the registry

An SSSS document is a Markdown file whose YAML frontmatter declares its type: a workflow, rule, page, assistant, skill, task, run, conversation, role and more. Types are defined in a machine-readable registry rather than in application code, and applications extend the registry through namespaced extensions whose collisions are detected at composition. Because the registry is data, a new host can validate a vault it has never seen, and the reference engine needs neither a YAML library nor a schema library to do so.

## The Operation Contract

Agents do not write files. They submit envelopes of four kinds (operation, patch, event, delete), and the specification fixes a thirteen-stage pipeline that every host must run in order. Identity is established before anything is read, so an anonymous caller learns nothing about the vault; the principal is supplied by the host and never trusted from inside the envelope. Idempotency keys make retries safe, content is validated against the registry, capabilities are checked, leases arbitrate concurrent writers, and external resources such as domains or telephone numbers are reserved before commit. The commit point is defined precisely: a change exists when its event is durably appended, and any earlier failure leaves nothing behind. Projections into relational tables follow the event and may fail without rolling it back, which keeps the documents authoritative and the tables disposable.

## Runtime, semantics and events

Workflows own their triggers. Schedules, webhooks and daemons derive idempotent event, task and run envelopes from the vault, so two daemons that fire at once produce one run rather than two. A semantic layer supplies deterministic lexical evidence and pluggable multilingual embeddings while holding symbolic controls fixed across languages. An append-only event log records every mutation, which makes audit and replay a property of the format rather than a feature added afterward.

## Portability and the .ucw bundle

Each type is classified as structural, resource-bound or tenant-private. A template or sale export must omit every tenant-private document, carries resource-bound documents as parameters to be bound at installation, and ships the structural model intact. The result is a single .ucw bundle with a manifest, provenance and integrity data that can be inspected and validated before use. Provisioning resolves parameters and link integrity into an envelope plan, and import replays that plan through the same contract, so installing a bundle twice is harmless.

## Conformance

No host may claim conformance without passing the canonical suite, which replays fixture envelopes through the engine and round-trips a reference bundle. The published package, @gregiteen/ssss-cli, provides the engine, the CLI and scaffolding for new projects. Total Recall, festech.live, UltraChat and this website are all conformant hosts.
