---
name: push
description: Use this skill when the user triggers the /push command to auto-deploy the site and sync to main.
---

# Auto Deploy on Push

When the user triggers the `/push` command, you are explicitly instructed **NOT** to use GitHub Actions. The site deployment strategy relies on a manual build and git sync to the `main` branch. 

Execute the following exact sequence when the `/push` command is invoked:

1. **Scan Code Quality & Conformance:** You must strictly run `node .agent/skills/code-quality/scripts/start-here-lint.mjs` and `node .agent/skills/code-quality/scripts/start-here-ts.mjs` to scan for errors. Do not use native `tsc` or `npm run typecheck`. **CRITICAL:** You must also execute `npm run validate` (which invokes the SSSS CLI conformance engine) to ensure all vault schemas, workflow runtimes, and memory nodes pass strict SSSS compliance. Fix any issues found before proceeding.
2. **Rebuild the Site:** Run `npm run build` to guarantee the `dist/site` directory is perfectly in sync with the latest code, layouts, and vault data.
3. **Commit Changes:** Stage and commit all generated assets and code modifications to the repository using `git add .` followed by `git commit -m "Auto deploy on push"`.
4. **Sync Main:** Run `git push origin main` to synchronize the changes with the live repository.
5. **Copy to Droplet:** Instead of manually performing the `rsync` here, you must refer to and execute the `/deploy` skill (`.agent/skills/deploy/SKILL.md`) which securely handles the full codebase synchronization to the Droplet and the mandatory PM2 restart.

Do not suggest setting up CI/CD pipelines or GitHub Actions workflows; the user explicitly prefers this direct sync architecture.
