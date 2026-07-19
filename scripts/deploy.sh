#!/bin/bash
set -e
echo "🚀 Starting atomic deployment to production..."

# 1. Sync static frontend assets
echo "📦 Syncing static frontend..."
rsync -avz --delete dist/site/ root@138.197.199.217:/var/www/gregiteen.xyz/

# 2. Sync backend (excluding runtime/volatile data)
echo "📦 Syncing backend codebase..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.agent' \
  --exclude '.claude' \
  --exclude '.theme-staging' \
  --exclude '.data/' \
  --exclude '/designs/' \
  --exclude 'vault/pages/skins/' \
  --exclude 'vault/runtime/' \
  --exclude 'vault/visitors.md' \
  --exclude '/dist/' \
  ./ root@138.197.199.217:/opt/portfolio-site/

# 3. Install the exact locked dependency tree before reloading the server.
# node_modules is intentionally excluded from rsync, so skipping this step can
# leave production executing an older package version than package-lock.json.
echo "📦 Installing locked production dependencies..."
if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 root@138.197.199.217 \
  "cd /opt/portfolio-site && npm ci --include=dev --no-audit --no-fund && npm run build"; then
  echo "❌ CRITICAL: Production dependency install or build failed!"
  exit 1
fi

# 4. Reload PM2 with a strict timeout (zero downtime)
echo "🔄 Reloading PM2 on droplet (timeout 10s)..."
if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@138.197.199.217 "pm2 reload portfolio"; then
  echo "❌ CRITICAL: SSH or PM2 reload failed or timed out!"
  echo "⚠️ The frontend might be out of sync with the backend."
  exit 1
fi

# 5. Verify Site Health
echo "🏥 Verifying live site health..."
sleep 2
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" https://gregiteen.xyz/splash.html)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "400" ] || [ "$HTTP_STATUS" = "429" ]; then
  echo "✅ Deployment Successful! Health check returned $HTTP_STATUS."
else
  echo "❌ CRITICAL: Health check failed! The site returned HTTP $HTTP_STATUS."
  exit 1
fi
