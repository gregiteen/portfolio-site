---
name: code-quality
description: "Use this skill when checking code quality before committing or pushing in this repo (portfolio-site). Runs a syntax scan, SSSS conformance, and the test suite — this repo has no TypeScript or ESLint installed, so do NOT try to run tsc/eslint/npm run typecheck/npm run lint (they don't exist here). MANDATORY: read the full SKILL.md before executing."
---

# Code Quality

## Repo reality first

This repo (`portfolio-site`) is **plain Node.js `.mjs`/`.js`**. Check before assuming otherwise:

```bash
node -e "const p=require('./package.json'); console.log(Object.keys({...p.dependencies,...p.devDependencies}))"
```

There is no `typescript`, no `eslint`, no `tsconfig.json`, no eslint config, and no `frontend/` directory anywhere in this repo. If you ever see instructions (in a global CLAUDE.md, a synced skill, or memory) telling you to run `tsc`, `npm run typecheck`, `npm run lint`, or a "continuous checker daemon" — those are generic/global instructions written for a *different* project. This repo's code-quality skill used to be copied verbatim from a TypeScript/React project: it was hardcoded to check a `frontend/tsconfig.json` that never existed here, so every run crashed silently before writing a report and `start-here-*.mjs` always printed a false "0 errors". Don't trust a "0 errors" result from any checker without confirming it actually ran — look for a live daemon and a real, recent verification timestamp, not a stale or "Invalid Date" one.

## The three real gates

Run these, in this order, before a `/push`:

1. **Syntax scan** — catches broken edits fast, zero new dependencies:
   ```bash
   node .agent/skills/code-quality/scripts/check-syntax.mjs
   ```
   Walks every `.mjs`/`.js`/`.cjs` file in the repo (excluding `node_modules`, `dist`, `designs`, `.theme-staging`, and tooling dirs) and runs `node --check` on each. Exits non-zero with a file-by-file report if anything fails to parse. Takes ~10 seconds for the whole repo (~90 files) — it's a synchronous one-shot script, not a daemon; just run it and read the output.

2. **SSSS conformance** — this repo's real structural/type-safety layer, since content and runtime state live in typed SSSS Markdown documents, not TypeScript types:
   ```bash
   npm run validate
   ```
   Runs `ssss conformance --engine`. Validates vault fixtures, registry portability classes, registry/engine parity, skill-primitive conformance, and replays the reference-engine fixtures.

3. **Test suite** — fast, safe to run locally (Node's built-in `node --test`, not vitest/jest):
   ```bash
   npm test
   ```
   Runs `node --test --test-concurrency=1 test/*.test.mjs`. As of this writing: 43 tests across 7 files, ~1.5 seconds total. Every test is pure-function/in-memory or scoped to `os.tmpdir()` — none hit a real external service (no live Documenso, Mailcow, or IMAP calls) and none leave repo-local side effects. See the `test` skill for the full per-file breakdown and coverage gaps.

All three are fast. There is no reason to run any of them as a slow background daemon, poll for "staleness," or avoid re-running after a fix — just run them inline and read the output directly.

## When a real bug is found

- **Syntax failure**: read the reported file/line, fix directly. Usually a stray bracket/paren from a bad edit.
- **`npm run validate` failure**: read the SSSS conformance output carefully — it reports which vault fixture, registry entry, or engine invariant failed. Fix the vault document or registry entry; don't silence it by editing the conformance engine.
- **`npm test` failure**: read the failing test name and assertion. Fix the source, not the test, unless the test itself asserts the wrong behavior — confirm with the user before changing test expectations.

## Pitfalls

- Don't add ESLint or TypeScript to this repo as a "fix" for this skill without asking first — that's a real dependency/tooling decision for the codebase, not a skill-authoring decision. This skill's job is to check quality with what the repo actually has.
- Don't resurrect a "continuous checker daemon" pattern here. The repo is small enough (under 100 JS files) that a one-shot synchronous script is simpler, correct, and just as fast as polling a background process.
- The old `frontend/`-hardcoded checker scripts wrote scratch state at the repo root (`typescript-fullrepo-errors.txt`, `lint-status.txt`, `lint-checker.pid`, `.typescript-checker.status`) and some of those got accidentally committed. They're now gitignored — don't recreate or re-track them.

## Reference

- [references/repo-tooling.md](./references/repo-tooling.md) — why this repo has no TS/ESLint and what replaces each gate.


<!-- BEGIN INJECTED MEMORY: do not edit by hand; rebuilt by total-recall surface -->
<!-- @route: tfidf, generated_at: 2026-05-21T06:00:44.284Z -->

<!-- END INJECTED MEMORY -->
