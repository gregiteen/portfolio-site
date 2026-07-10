#!/usr/bin/env bash
# Back up everything a droplet loss would destroy: generated designs, the
# skin registry, and runtime config (rate card, banner offers, sessions).
# Two layers:
#   1. Local tarball rotation under /var/backups/portfolio (last 30)
#   2. Offsite: committed to the `droplet-backups` branch of the site repo
#      via the deploy key, so a dead droplet loses at most one interval.
# Cron: every 6 hours (see crontab on the droplet).
set -euo pipefail

SITE=/opt/portfolio-site
BACKUP_DIR=/var/backups/portfolio
REPO_DIR=/opt/portfolio-backups-repo
REMOTE=git@github.com:gregiteen/portfolio-site.git
BRANCH=droplet-backups
export GIT_SSH_COMMAND="ssh -i /root/.ssh/portfolio_backup -o StrictHostKeyChecking=no"

STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

# ── Layer 1: local tarball ──
tar -czf "$BACKUP_DIR/portfolio-$STAMP.tar.gz" \
  -C "$SITE" \
  $( [ -d "$SITE/designs" ] && echo designs ) \
  $( [ -d "$SITE/vault/pages/skins" ] && echo vault/pages/skins ) \
  $( [ -d "$SITE/vault/runtime" ] && echo vault/runtime ) \
  2>/dev/null || true
ls -1t "$BACKUP_DIR"/portfolio-*.tar.gz 2>/dev/null | tail -n +31 | xargs -r rm -f

# ── Layer 2: offsite git branch ──
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone --depth 1 "$REMOTE" "$REPO_DIR"
  cd "$REPO_DIR"
  git checkout -B "$BRANCH"
else
  cd "$REPO_DIR"
  git fetch origin "$BRANCH" 2>/dev/null || true
  git checkout -B "$BRANCH" "origin/$BRANCH" 2>/dev/null || git checkout -B "$BRANCH"
fi

rm -rf "$REPO_DIR/droplet-backup"
mkdir -p "$REPO_DIR/droplet-backup"
[ -d "$SITE/designs" ] && cp -r "$SITE/designs" "$REPO_DIR/droplet-backup/designs"
[ -d "$SITE/vault/pages/skins" ] && cp -r "$SITE/vault/pages/skins" "$REPO_DIR/droplet-backup/skins"
[ -d "$SITE/vault/runtime" ] && cp -r "$SITE/vault/runtime" "$REPO_DIR/droplet-backup/runtime"

cd "$REPO_DIR"
git add -A droplet-backup
if ! git diff --cached --quiet; then
  git -c user.name="droplet-backup" -c user.email="backup@gregiteen.xyz" \
    commit -m "Droplet backup $STAMP"
  git push origin "$BRANCH"
  echo "[backup] pushed $STAMP to $BRANCH"
else
  echo "[backup] no changes since last backup"
fi
