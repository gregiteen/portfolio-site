---
type: page
slug: "idea-verbs"
title: "The command line grows its own verbs"
description: "A procedure an agent performs twice becomes a named, risk-classified command that every later agent can discover and call."
timestamp: 2026-09-28T20:00:00Z
name: "The command line grows its own verbs"
sandbox_entry: "index.html"
x_kind: "idea"
x_diagram: "verbs"
x_project: "plugins"
x_order: 3
---

Agents repeat multi-step procedures and rediscover them in every session. In Total Recall, a proven procedure is promoted to a verb: `total-recall <name>`, with a uniform contract for help, JSON output and exit codes. Each command declares a risk class that is published beside it; the composable-CLI plugin now in development enforces those classes, so a command that spends money, changes DNS or revokes a secret will print its plan and halt until it is explicitly confirmed. Every compile regenerates the list of available verbs from the command files themselves, which means the instructions can never describe a command that does not exist.
