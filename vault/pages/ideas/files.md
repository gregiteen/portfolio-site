---
type: page
slug: "idea-files"
title: "The file is the database"
description: "State lives in Markdown documents with typed frontmatter. Writes are validated operations."
timestamp: 2026-09-28T00:00:00Z
name: "The file is the database"
sandbox_entry: "index.html"
x_kind: "idea"
x_diagram: "files"
x_project: "ssss"
x_order: 1
---

An application's state is a folder of documents you can read, diff and version. Each write is an operation envelope: schema checked, idempotent, authorized, then committed with an audit line. No hidden store, no migration, no export step.
