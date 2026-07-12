---
name: portfolio-project-management
description: "portfolio-site-specific project management overlay. Use alongside the global project-management skill when managing portfolio-site GitHub issues, pull requests, or project tracker checklists. Defines the SSSS vault architecture reminders and repo context. Do NOT use for code implementation. MANDATORY: You MUST read the full SKILL.md file before executing."
---

# portfolio-site — Project Management Overlay

> This is a **repo-specific overlay**, not a standalone system. It assumes the global `project-management` skill's universal 4-file Kanban mechanics (folder layout, naming, tracker convention, operating modes) — read that skill first. This file only carries the delta: what portfolio-site actually is and its architecture reminders.

## What portfolio-site is

An SSSS-native project: a Markdown **vault** is the source of truth, validated and packaged by the dependency-free `@ssss/cli`. It is not a plain static portfolio page — it exports tradeable/sellable bundles (`npx ssss export vault --profile sale`) and includes email tooling and PDF rate-card generation, so treat vault conformance and export portability as first-class concerns, not afterthoughts.

## Architecture Reminders (for PR Review Mode)

- Source of truth: `vault/` — SSSS documents (structural + `tenant_private` primitives).
- Toolchain: `@ssss/cli` (github:gregiteen/ssss), dependency-free by design.
- Build: `npm run build` → `scripts/build-site.mjs`; dev server via `npm run dev` (`build-site.mjs` + `serve.mjs`).
- Tests: `npm test` runs `node --test` — conformance tests replay canonical fixtures and round-trip the vault. Run `npm run validate` (`ssss conformance --engine`) before any vault schema change.
- Export: `npm run export` produces a tradeable `.ucw.json` bundle — verify `npx ssss inspect dist/bundle.ucw.json --files` and `npx ssss help portability` before treating an export as shippable.
- Email tooling (`imapflow`, `mailparser`, `nodemailer`) and PDF generation (`pdfkit`, `rate-card:pdf`) are real product surfaces, not scratch scripts.
- `playwright` is present — likely used for screenshot/visual or end-to-end checks; confirm before assuming it's unused.

## Active project

Resolve the active work per the global skill's rule — check `docs/projects/in-progress/` before assuming. As of the last edit of this overlay, `docs/projects/in-progress/` contained `email-crm-suite` and `portfolio-platform` (with `PORTFOLIO_PLATFORM_PRD.md`, `_ARCHITECTURE.md`, `_DEV_PLAN.md`, `_TRACKER.md`) — verify current state rather than trusting this note.

## Definition of done (default — refine per project)

Until this repo defines a sharper readiness bar, use the global skill's default: a change is done when its tracker's testing phase is checked off, `npm run validate` passes, and (for anything touching `vault/` or export) a fresh `npm run export` + `npx ssss inspect` round-trip succeeds without errors.
