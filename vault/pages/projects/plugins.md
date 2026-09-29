---
type: page
slug: "project-plugins"
title: "Plugins and the Composable CLI"
description: "How Total Recall stays small: capabilities ship as white-label plugins, and agents extend the command line with verbs of their own."
timestamp: 2026-09-28T20:00:00Z
name: "Plugins and the Composable CLI"
sandbox_entry: "projects/plugins.html"
x_kind: "project"
x_year: 2026
x_role: "Designer and author"
x_tech:
  - "Node.js"
  - "Plugin manifests"
  - "SSSS"
  - "node:test"
x_link: "https://github.com/gregiteen/tr-plugin-code-quality"
x_repo: "https://github.com/gregiteen/tr-plugin-code-quality"
x_featured: true
---

## A deliberately small core

Total Recall's core is limited to three things: SSSS documents, the vector index derived from them, and files. Every other capability is a plugin with a manifest, its own repository, its own SSSS vault and its own test suite that replays the conformance fixtures. The roster includes domains (search, purchase, DNS and certificates through provider APIs), telephony (numbers, routing, voicemail and carrier compliance), messaging (SMS and MMS with signed webhooks and opt-out handling), document signing, design synthesis from DESIGN.md tokens, typed decisions, code quality and the composable CLI itself. Each is white-label: an application that installs one supplies its own name and branding, and nothing in the plugin refers to a particular product.

## Installing a capability

A plugin can be installed into a brain or deployed into an application. Deployment computes a read-only plan first: every file the capability would create or modify, conflicts with existing files, the access grants and resources it requires, and a SHA-256 hash of the plan itself, so that what is approved is exactly what is applied. Lockfiles, environment files and other protected files are never written. After application, verification checks file digests and SSSS conformance, and an upgrade follows the same plan-then-apply path.

## Code quality that fails closed

The code-quality plugin, the first to be published, runs each repository's own gate list once as a background job and writes a report. Gates may be commands with a parser for their tool's output, or forbidden-pattern checks that turn a written invariant into a failing test. The runner is strict about false confidence: a gate that scans zero files, or a tool that exits without parseable output, is never reported as clean, and every report records the git revision and the freshness of the sources it examined. A machine-wide lock ensures that only one check runs per host, and heavy tiers can be routed to a designated machine.

## The composable command line

Agents repeat procedures. The composable CLI turns a proven procedure into a verb that any later agent can call as `total-recall <name>`. A command may be written inline or generated from a plugin manifest; generation validates the manifest, confines the handler to a regular file inside the plugin and supports detached background execution with private report files. Commands are scoped to a project, a group of projects or the whole machine, and creation warns when a new name would shadow an existing one.

Two properties make the mechanism trustworthy. First, the instruction files are themselves composable: every compile regenerates the list of available verbs by parsing the command files statically, without executing them, so the agent's instructions list exactly the commands that exist, once each. Second, every command declares a risk class. The plugin under development extends this into a complete contract: uniform help, a JSON envelope and fixed exit codes; composition of one verb from others through their JSON output rather than scraped text; version history with rollback; tests run on dedicated hardware; and a confirmation requirement for any command that spends money, alters DNS or certificates, deploys to production or revokes a credential.

## Decisions as a distinct primitive

Many features need a decision rather than prose: classify this message, route this lead, approve this action. The decision plugin issues typed decisions (a choice among options, yes or no, a score on an ordered scale) with confidence thresholds and defined fallbacks, and records each one as an SSSS document, so an automated judgment can be audited like any other write.
