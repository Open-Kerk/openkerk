#!/bin/bash
# Bootstrap a fresh DigitalOcean droplet for one-shot sermon backfill.
# Run this AS ROOT on the droplet (or via `curl ... | sudo bash`).
#
# Idempotent: re-running just updates the repo and keeps the venv.

set -euo pipefail

REPO_URL="https://github.com/Open-Kerk/openkerk.git"
WORKDIR="/root/openkerk"

echo "== installing system deps =="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git ffmpeg python3-pip python3-venv tmux htop sqlite3

if [ -d "$WORKDIR/.git" ]; then
  echo "== updating existing repo =="
  cd "$WORKDIR"
  git fetch origin main
  git reset --hard origin/main
else
  echo "== cloning repo =="
  git clone "$REPO_URL" "$WORKDIR"
  cd "$WORKDIR"
fi

git config --global user.name  "openkerk-bot"
git config --global user.email "openkerk-bot@users.noreply.github.com"
git config --global pull.rebase true

echo "== setting up venv =="
if [ ! -d "$WORKDIR/.venv" ]; then
  python3 -m venv "$WORKDIR/.venv"
fi
source "$WORKDIR/.venv/bin/activate"
pip install --quiet --upgrade pip
pip install --quiet -r "$WORKDIR/requirements.txt"

echo
echo "== READY =="
echo "Now set your secrets and start the drain:"
echo
echo "  cd $WORKDIR"
echo "  source .venv/bin/activate"
echo "  export OPENAI_API_KEY=sk-..."
echo "  export VIMEO_TOKEN=..."
echo "  export VIMEO_USER_ID=31957317"
echo "  # Authenticate git so commits push to origin (PAT recommended):"
echo "  git remote set-url origin https://<USER>:<PAT>@github.com/Open-Kerk/openkerk.git"
echo
echo "  # Run inside tmux so you can disconnect:"
echo "  tmux new -s drain"
echo "  python -m scripts.drain_local --workers 4"
echo
echo "Detach with Ctrl-b d. Re-attach with: tmux attach -t drain"
echo "Tail progress with: sqlite3 data/sermons.db 'select count(*) from queue;'"
