---
type: page
slug: "about"
title: "About Greg Iteen"
description: "Greg Iteen is a systems engineer who designs memory, state and mutation infrastructure for AI agents and the platforms built on them."
timestamp: 2026-09-28T20:00:00Z
name: "About"
sandbox_entry: "about.html"
x_kind: "section"
x_nav_order: 2
x_linkedin: "https://www.linkedin.com/in/gregiteen"
x_github: "https://github.com/gregiteen"
---

## Practice

I am a systems engineer working at the boundary between AI agents and the software they are permitted to change. My work begins from one conviction: an autonomous system is only as trustworthy as the state it reads and the discipline with which it writes. I build that state as typed, human-readable documents, admit every change through a validated contract, and make the result portable enough to survive a change of vendor, of environment or of owner.

That conviction has produced an open specification (SSSS), a memory system for coding agents (Total Recall) with a plugin architecture around it, and two multi-tenant platforms that run on both: festech.live for artist collectives and UltraChat for AI-operated businesses.

## Principles

- **Documents before databases.** Canonical state is a vault of Markdown with typed frontmatter. Relational tables are projections, rebuilt from the documents rather than trusted in their place.
- **Contracts before convenience.** Agents submit envelopes; a kernel validates, authorizes, leases and commits them, and a change exists only when its event is recorded.
- **Instructions are compiled.** What an agent has been taught is written into the files it reads before it acts, not left to retrieval and chance.
- **Fail closed.** A check that examined nothing did not pass. A command that can spend money or revoke a credential states its plan before acting.
- **Publish the standard.** A system worth depending on deserves a specification and a conformance suite that others can implement without my involvement.

## Method

Every engagement begins with an audit of the existing code and a baseline run of its tests. Requirements, architecture, a development plan and a tracker follow before implementation, and quality gates run on dedicated hardware before anything reaches production. Claims about a system are verified against its code before they are written down, including on this site.

## Toolbox

TypeScript and Node.js, Python, React, Next.js, Expo, Express, tRPC, PostgreSQL and Supabase, SQLite vector search, Ollama and hosted model APIs, Asterisk and carrier telephony, Headscale meshes, Vercel and DigitalOcean.
