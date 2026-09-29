---
type: page
slug: "idea-files"
title: "The document is the database"
description: "Application state is a set of typed Markdown documents, and every write passes a thirteen-stage operation pipeline."
timestamp: 2026-09-28T20:00:00Z
name: "The document is the database"
sandbox_entry: "index.html"
x_kind: "idea"
x_diagram: "files"
x_project: "ssss"
x_order: 1
---

State is a folder of Markdown files whose YAML frontmatter is validated against a type registry. Agents never write those files directly. They submit an envelope, and the kernel checks identity, replays duplicate idempotency keys, validates content, authorizes the principal, verifies any lease and commits with a compare-and-swap. A mutation exists only once its event is durably appended; before that point a failure leaves no trace. Relational tables survive as projections, rebuilt from the documents rather than trusted in their place.
