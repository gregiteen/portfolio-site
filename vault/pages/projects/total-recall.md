---
type: page
slug: "project-total-recall"
title: "Total Recall — Portable Memory for AI Agents"
description: "A database-free memory system that turns corrections into validated documents and compiles them into the instructions every coding agent reads."
timestamp: 2026-09-28T20:00:00Z
name: "Total Recall"
sandbox_entry: "projects/total-recall.html"
x_kind: "project"
x_year: 2026
x_role: "Creator and maintainer"
x_tech:
  - "Node.js"
  - "SSSS"
  - "SQLite vector index"
  - "Ollama"
  - "Headscale mesh"
x_link: "https://github.com/gregiteen/total-recall"
x_repo: "https://github.com/gregiteen/total-recall"
x_logo: "assets/logos/total-recall.png"
x_featured: true
---

## The problem

A coding agent begins each session without the context its operator spent the previous session establishing. The usual remedies are a hand-maintained instruction file, which drifts, or a vector store queried at run time, which returns what is similar rather than what is binding. Neither can guarantee that a correction given once is honored thereafter, and neither is portable between the several agents a working engineer now uses.

## The model

Total Recall treats memory as source code. Every rule, preference, correction and fact is a Markdown document with typed frontmatter: a category, a modality (must, should, must not), a priority, provenance and decay fields. Documents live in a vault on the local filesystem and are written only through the CLI, which validates them against the SSSS schema, detects conflicts with existing nodes and recompiles on every write. There is no database to administer and nothing that cannot be read, diffed or versioned.

Memory is layered. A global brain in the home directory holds identity and preferences that apply everywhere; a project brain inside each repository holds that codebase's decisions and facts. When both define the same node, the project layer prevails, so a repository can override a general habit without editing it.

## Compilation into instructions

The central mechanism is a compiler. It selects the binding nodes and writes them into the instruction file of each connected agent: CLAUDE.md, AGENTS.md, GEMINI.md and the equivalents for Codex, Aider and Obsidian. It writes only between its own markers and never alters text outside them. Each section carries a character budget, so rules are condensed rather than dropped, and the compiler checks its own source hash before writing, which prevents a long-running process holding an outdated build from overwriting fresher output. The effect is that an agent receives its operator's standing orders before it produces a single token.

## Retrieval, consolidation and deferred work

Everything outside the binding set remains searchable. A derived vector index in SQLite is built from the vault and can be discarded and rebuilt at will; embeddings come first from a local Ollama model, with hosted providers used only as fallbacks, and vector width is enforced so that a provider change cannot corrupt search silently. A consolidation cycle, modeled on sleep, merges duplicates, resolves conflicts, decays unused nodes and recompiles. An optional daemon executes queued tasks under a capability policy, and can dispatch headless runs of Claude Code, Codex, Gemini CLI or a local model to any machine on a private Headscale mesh.

## Secrets as a separate discipline

Credentials never enter the vault. They are held in a dedicated store encrypted with AES-256-GCM under a scrypt-derived key, tagged with a random project identifier rather than a repository name, and bound explicitly to the repositories permitted to use them. A surface check fails the build if a secret value appears in any compiled instruction file. Deployment of an environment file to a remote host is planned as a dry run first, and proceeds only when it preserves every key already present and adds only those bound to that repository.

## Plugins and composable commands

The core is deliberately small; capabilities arrive as plugins declared by a manifest. Installing a capability into a host application produces a deterministic plan with a SHA-256 hash, refuses to touch protected files such as lockfiles and environment files, and verifies file digests and SSSS conformance after application. From a plugin's HTTP API the system can generate a typed command-line client, and from a DESIGN.md token file it can generate web components or React elements, so a capability arrives with its interface as well as its logic. The composable-command layer, described in its own write-up, lets agents add verbs of their own.
