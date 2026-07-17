# Why this repo has no TypeScript or ESLint

`package.json` dependencies (checked 2026-07-16): `@ssss/cli`, `imapflow`, `mailparser`, `nodemailer`, `pdfkit`, `playwright`, `sharp`, `stripe`. devDependencies: `@types/node`, `better-sqlite3`, `total-recall-brain`. No `typescript`, no `eslint`. No `tsconfig.json` or eslint config file exists anywhere in the repo. Every script under `scripts/` and `scripts/lib/` is `.mjs` — plain ES modules run directly by Node, no build/transpile step.

`@types/node` being present does not imply TypeScript compilation happens anywhere — it's just ambient Node global types for editor IntelliSense; nothing in this repo runs `tsc` against it.

## What replaces each usual gate

| Usual JS/TS project gate | This repo's equivalent |
|---|---|
| `tsc --noEmit` (type checking) | Nothing directly equivalent — the repo leans on `npm run validate` (SSSS conformance) to catch structural/shape errors in the data the code operates on (vault documents, registry entries), and on `node --check` to catch parse errors. There's no static type system over the JS itself. |
| `eslint` (lint rules) | Nothing directly equivalent. No lint config exists. `node --check` only catches syntax errors, not style/correctness lint rules (unused vars, etc). If the user ever wants real lint coverage, that's a deliberate decision to add `eslint` + a config — raise it explicitly, don't silently add it as part of routine skill maintenance. |
| `npm run build` as a smoke test | `npm run build` (`scripts/build-site.mjs`) is a real, meaningful smoke test here — it renders the whole vault to `dist/site`. The `push`/`deploy` skills already run it. |
| Unit tests | `npm test` — `node --test`, 7 files, 43 tests, ~1.5s. See the `test` skill. |

## History: how the code-quality skill got broken

The skill previously present in this repo (`continuous-checker-ts.mjs`, `continuous-checker-lint.mjs`, `start-here-ts.mjs`, `start-here-lint.mjs`, etc.) was templated from a different, TypeScript/React project — its subagent prompt (`subagents/code-quality-auditor.md`) referenced `src/components/Button.tsx` as an example fixable file, and both checker daemons hardcoded `cwd: path.join(ROOT, 'frontend')` with `project: 'tsconfig.json'`. Neither `frontend/` nor any `tsconfig.json` has ever existed in this repo. Every invocation of the checker daemon crashed near-instantly (Node's `child_process` emits an unhandled `'error'` event on a spawn-ENOENT into a nonexistent `cwd`, which crashes the process), before it ever wrote a PID file or a real report — so `typescript-fullrepo-errors.txt`/`lint-status.txt` stayed permanently in their `INITIALIZING...` seed state, and `start-here-*.mjs` reported a misleading "0 errors" / "SLEPT" status forever, with `VERIFIED: Invalid Date`. Several of those scratch files had also been accidentally `git add`-ed at some point and were tracked in the repo.

Lesson for future skill maintenance in any repo: a checker that always reports "0 errors" with an invalid/stale timestamp is not passing — it's not running. Verify a checker actually executed (live daemon status, a real recent timestamp) before trusting a clean result.
