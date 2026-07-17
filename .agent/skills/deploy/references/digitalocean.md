# Droplet layout (DigitalOcean)

- **IP:** `138.197.199.217` (also in `.env` as `DROPLET_IP`; `scripts/deploy.sh` hardcodes it directly rather than reading the env var — if the droplet ever moves, update both `scripts/deploy.sh` and `.env`).
- **SSH:** `root@138.197.199.217`, key-based (no password prompt in the deploy scripts — if SSH ever hangs waiting for a password, the droplet's `authorized_keys` or the local agent's key has drifted; don't paper over it with a password flag).
- **App code:** `/opt/portfolio-site/` — mirrors this repo's working tree (minus the excludes in `scripts/deploy.sh`), synced with `rsync --delete`.
- **Static assets served by nginx:** `/var/www/gregiteen.xyz/` — mirrors `dist/site/` (the build output), synced separately from the app code sync, also with `--delete`.
- **Process manager:** PM2, process name **`portfolio`**, running `scripts/serve.mjs` on port 4173. `pm2 restart portfolio` is how every deploy picks up new backend code — a plain rsync alone does nothing until this restart happens (`serve.mjs` doesn't hot-reload).
- **Reverse proxy / TLS:** nginx in front of the PM2 process, HTTPS via certbot with auto-redirect from HTTP. `www` CNAME is also configured.
- **Health check endpoint:** `https://gregiteen.xyz/splash.html` — `scripts/deploy.sh` treats `200`, `400`, and `429` as healthy (400/429 are expected under the visitor-gate/rate-limit logic, not failures) and anything else as a broken deploy.

## Known fragility

- PM2's `restart_time` on this droplet has been observed to reset app state (in-memory session maps, webmail sessions, SSO handoffs — see the `webmail`/`documenso` skills) because those are process-local, not persisted. Every deploy that restarts PM2 logs everyone with an active in-memory session out. This is expected, not a bug to "fix" reflexively — but mention it if a deploy coincides with an active demo or admin session.
- `vault/runtime/`, `vault/pages/skins/`, `/designs/`, and `.data/` are excluded from the rsync specifically because they're regenerated or hold live runtime/business data on the droplet that the repo itself has none of locally — see `SKILL.md`'s exclude table for the full rationale and the leading-slash gotcha.

## Source references
- `scripts/deploy.sh`
- `.env` (`DROPLET_IP`; never print its value, only confirm the key is set)
- `vault/tasks/relaunch-tracker.md` (original droplet provisioning notes: nginx + certbot + PM2 setup)
