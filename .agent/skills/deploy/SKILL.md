---
name: deploy
description: "Use this skill to deploy the site to the DigitalOcean droplet using the environment API keys and rsync."
---

# Deploy Site

Execute the following sequence when the `/deploy` command is invoked.

1. **Rebuild:** Run `npm run build` to compile all static assets.
2. **Commit:** `git add . && git commit -m "Auto deploy via /deploy skill"`
3. **Push to Main:** `git push origin main`
4. **Deploy to Droplet:**
   - The Droplet IP is `138.197.199.217` (stored in `.env` as `DROPLET_IP`).
   - Step 1: Sync the static bundle to Nginx: `rsync -avz --delete dist/site/ root@138.197.199.217:/var/www/gregiteen.xyz/`
   - Step 2: Sync the backend server code to the PM2 directory: `rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude '.agent' ./ root@138.197.199.217:/opt/portfolio-site/`
   - Step 3: Hard-restart the PM2 backend router to flush stale file caches: `ssh -o StrictHostKeyChecking=no root@138.197.199.217 "pm2 restart portfolio"`
   - If SSH access requires key provisioning or doctl setup, use the `DIGITALOCEAN_API_TOKEN` found in the `.env` file to authenticate via the `doctl` CLI and fetch SSH keys.

Do not use GitHub actions. 
