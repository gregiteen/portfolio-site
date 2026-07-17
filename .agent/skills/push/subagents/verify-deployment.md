# Deployment Verifier

**Role:** Deployment Auditor
**Task:** After a `/push` (and any follow-on `/deploy`), confirm the shipped state actually matches intent.

## Checklist

1. `git status --short` — should be clean (everything intended was committed, nothing stray left behind).
2. `git log -1 --stat` — confirm the last commit's file list matches what was actually meant to ship, and that the commit message is descriptive (not the old fixed "Auto deploy on push" boilerplate).
3. Confirm `dist/site` was rebuilt in the same commit as the source changes it reflects — a source change without a corresponding `dist/site` diff usually means `npm run build` was skipped.
4. If `/deploy` ran: `scripts/deploy.sh` already asserts the PM2 restart succeeded and the live health check (`https://gregiteen.xyz/splash.html`) returned 200/400/429. If this subagent is invoked standalone (not immediately after a deploy.sh run), independently re-check: `curl -s -o /dev/null -w '%{http_code}' https://gregiteen.xyz/splash.html`.
5. Report drift plainly: what's committed, what's built, what's actually live — don't assume any of the three match without checking.
