#!/usr/bin/env bash
# Pull the latest main from GitHub and, if it changed, rebuild and restart
# the site (see deploy/README.md). Meant to run from cron, e.g.:
#
#   */5 * * * * /opt/openkerk/deploy/update.sh >> /var/log/openkerk-update.log 2>&1
#
# Silent when there's nothing new. If the new version fails to build or
# doesn't pass its health check, it rolls back to the running version and
# skips that commit until a newer one lands.
#
# Usage: update.sh [--force]   # --force: redeploy even without new commits
set -euo pipefail

export PATH="$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/sbin"  # cron's PATH is minimal
BRANCH=main
HEALTH_TIMEOUT=90  # seconds the new version gets to report healthy

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_DIR/deploy/.env"
FAILED_FILE="$REPO_DIR/deploy/.failed-commit"
export COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/deploy/docker-compose.yml}"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

# One run at a time: cron may fire again while a build is still going.
exec 9>"${TMPDIR:-/tmp}/openkerk-update.lock"
flock -n 9 || { log "another update is running; skipping"; exit 0; }

[[ -f "$ENV_FILE" ]] || { log "missing deploy/.env (copy deploy/.env.example)"; exit 1; }
# First run: generate the Flask SECRET_KEY so .env only needs DOMAIN and
# ACME_EMAIL. It must stay stable, so it's written once and kept.
if ! grep -q '^SECRET_KEY=.' "$ENV_FILE"; then
  key=$(od -An -tx1 -N32 /dev/urandom | tr -d ' \n')
  { grep -v '^SECRET_KEY=' "$ENV_FILE" || true; echo "SECRET_KEY=$key"; } > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE" && chmod 600 "$ENV_FILE"
  log "generated SECRET_KEY in deploy/.env"
fi

cd "$REPO_DIR"
git fetch --quiet origin "$BRANCH" || { log "git fetch failed"; exit 1; }
current=$(git rev-parse HEAD)
latest=$(git rev-parse "origin/$BRANCH")

if [[ "${1:-}" != "--force" ]]; then
  [[ "$current" == "$latest" ]] && exit 0
  [[ -f "$FAILED_FILE" && "$(cat "$FAILED_FILE")" == "$latest" ]] && exit 0
fi

deploy() {
  git reset --hard --quiet "$1" &&
    docker compose build --pull web &&
    docker compose pull --quiet --ignore-pull-failures caddy &&
    docker compose up -d --remove-orphans --wait --wait-timeout "$HEALTH_TIMEOUT"
}

log "deploying ${latest:0:7} (running: ${current:0:7})"
if deploy "$latest"; then
  rm -f "$FAILED_FILE"
  docker image prune -f >/dev/null
  log "live: ${latest:0:7} $(git log -1 --format=%s)"
else
  log "${latest:0:7} failed to build or start; rolling back to ${current:0:7}"
  echo "$latest" > "$FAILED_FILE"
  deploy "$current" || log "rollback failed too; check: docker compose -f $COMPOSE_FILE logs"
  exit 1
fi
