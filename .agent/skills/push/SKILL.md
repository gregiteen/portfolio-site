---
name: push
description: Use this skill when the user triggers the /push command to run the pre-push quality gates, build, commit, and sync main — then hand off to /deploy for the droplet.
---

# Auto Deploy on Push

## Deploy model — read before pushing

> [!CAUTION]
> **Deployment is triggered by pushing the `production` branch.** A cron
> watcher on the droplet (`/root/auto-deploy.sh`) picks it up within ~60s.
> GitHub Actions is **not** the deploy mechanism anywhere in this workflow —
> if a repo has workflow files they belong to an upstream project's own CI
> (lint, CodeQL, release), not to our deploy path. Never reason about deploy
> risk from the presence or absence of `.github/workflows`.

| action | deploys? |
|:---|:---|
| `git push origin production` | **YES** — droplet watcher builds and swaps |
| `git push origin HEAD:production` (from a feature branch) | **YES** |
| `git push origin main` / `master` / any other branch | no — backup only |

**After every production push, sync main so it mirrors production:**

```bash
git push origin production:main
git fetch origin main && git branch -f main origin/main
```

**If a repo has no `production` branch it has no deploy path.** Pushing its
default branch is a backup, not a release. Confirm before assuming:

```bash
git branch -r | grep -w production || echo "no production branch — push is backup only"
```

When the user triggers the `/push` command, do **not** set up or suggest GitHub Actions or any CI/CD pipeline — this repo's deployment strategy is a deliberate manual build + git sync + rsync-to-droplet flow (see [references/git-sync-strategy.md](./references/git-sync-strategy.md) for why).

Execute this sequence:

1. **Look before you stage.** Run `git status --short`. If there are changes you don't recognize from this session (files neither you nor the user touched, unexpected deletions, or diffs to `.env`/`.env.example`), read them before staging — `git diff` the suspicious ones. This repo's own `code-quality` skill was previously broken for months because nobody checked that a "0 errors" result was real; the same discipline applies here — don't blind-stage what you haven't looked at. This is a lighter check than `/deploy`'s hard stop-and-ask gate (push is explicitly how accumulated work gets packaged and shipped, so staging broadly is expected) — but skim it.

2. **Run the pre-push gates and build in one shot:**
   ```bash
   node .agent/skills/push/scripts/push-preflight.mjs
   ```
   This runs, in order: the `code-quality` syntax scan, `npm run validate` (SSSS conformance), `npm test`, then `npm run build`. It stops at the first failure. Fix whatever it reports before continuing — see the `code-quality` skill for how to resolve each gate's failures. Do not run `tsc`, `eslint`, or any raw equivalent directly; they don't exist in this repo (see `code-quality`).

3. **Commit the complete tree.** Stage every modification, deletion, and new file, then commit with a real, descriptive message (not a fixed generic string) that summarizes what's actually in the diff — follow the same commit-message discipline as any other commit in this repo (why, not just what; 1-2 sentences). Example:
   ```bash
   git add -A
   git commit -m "$(cat <<'EOF'
   <one-line summary of what this push actually contains>

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Sync main:** `git push origin main`.

5. **Copy to Droplet:** Do not hand-roll the rsync here — invoke the `deploy` skill (`.agent/skills/deploy/SKILL.md`), which runs `scripts/deploy.sh` (rsync with the correct excludes, PM2 restart, and a live health check against `https://gregiteen.xyz/splash.html`). Preferred transport is Headscale tailnet `portfolio-site 100.64.0.1` (`https://headscale.ultrachat.app`); public `138.197.199.217` via `http_proxy` `CONNECT` + JS `ssh2` is the sandbox fallback, and `POST /api/admin/deploy` (`ADMIN_API_TOKEN`, async `200 {started:true}`) is the no-ssh fallback. `HEADSCALE_API_KEY` is in `secrets.enc`/`.env`.

## Pitfalls

- Don't skip step 1 because step 2's build passed — a clean build doesn't mean the diff is what you think it is.
- Don't reuse a boilerplate commit message across pushes; it makes `git log` useless for figuring out what shipped when.
- `push-preflight.mjs` already runs `npm run build` — don't run it again separately before committing.
