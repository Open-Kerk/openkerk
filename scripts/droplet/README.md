# One-shot droplet backfill

Drain the entire sermon queue (~200 videos) on a temporary DigitalOcean droplet in ~4-6 hours and ~$0.50 of compute. The droplet is created, runs the parallel drainer, and you destroy it when the queue is empty.

## What it does

`scripts/drain_local.py` runs N worker processes that each atomically claim one queued `vimeo_id`, run it end-to-end through the existing `process_video.process()` (VAD → Whisper → translate × 3 → titles → embed) and then push the DB + new VTT files back to GitHub. The DO App Platform deployment auto-redeploys on every push, so new sermons start appearing on the live site while the drain is still running.

## Prerequisites on your Mac

```bash
# A GitHub fine-grained PAT for the droplet's git push:
# https://github.com/settings/personal-access-tokens
# Repository: Open-Kerk/openkerk
# Permissions: Contents Read+Write
# Save it locally as ~/.openkerk-pat (just the token, no newline)

# Confirm doctl is logged in:
doctl auth list
```

## 1. Create the droplet (one command)

```bash
doctl compute droplet create openkerk-backfill \
  --region ams3 \
  --size s-2vcpu-4gb \
  --image ubuntu-24-04-x64 \
  --ssh-keys "$(doctl compute ssh-key list --format ID --no-header | head -1)" \
  --wait
```

Costs $0.036/hour ($0.86/day) — destroyed after backfill.

## 2. Bootstrap it (one command)

Grab the droplet's IP:

```bash
DROPLET_IP=$(doctl compute droplet get openkerk-backfill --format PublicIPv4 --no-header)
echo "droplet: $DROPLET_IP"
```

SSH in and run the setup script:

```bash
ssh root@$DROPLET_IP 'curl -fsSL https://raw.githubusercontent.com/Open-Kerk/openkerk/main/scripts/droplet/setup.sh | bash'
```

## 3. Start the drain (interactive, ~5 min of typing)

```bash
ssh root@$DROPLET_IP
```

Then on the droplet:

```bash
cd /root/openkerk
source .venv/bin/activate

# Paste your secrets:
export OPENAI_API_KEY=sk-...
export VIMEO_TOKEN=...
export VIMEO_USER_ID=31957317

# Wire the git remote to push as your PAT:
read -s PAT
# (paste the PAT, press enter — it stays out of shell history)
git remote set-url origin "https://x-access-token:$PAT@github.com/Open-Kerk/openkerk.git"
unset PAT

# Start the drain inside tmux so you can disconnect:
tmux new -s drain
python -m scripts.drain_local --workers 4
```

Detach: `Ctrl-b` then `d`. The drain keeps running. SSH back and `tmux attach -t drain` whenever you want to check.

## 4. Monitor

While SSH'd in:

```bash
# How many videos are left in the queue?
sqlite3 /root/openkerk/data/sermons.db 'select count(*) from queue where attempts < 3'

# How many failed?
sqlite3 /root/openkerk/data/sermons.db 'select vimeo_id, attempts, substr(last_error,1,80) from queue where attempts > 0'

# Live tail the drain process:
tmux attach -t drain
```

## 5. When the queue is empty — destroy the droplet

```bash
# Back on your Mac:
doctl compute droplet delete openkerk-backfill -f
```

That's it. No DNS, no firewall, no persistent state on the droplet — all the produced data has already been committed to GitHub and deployed to DO App Platform.

## Tuning

- `--workers 4` is a good default on `s-2vcpu-4gb`. Bump higher if CPU/RAM are underutilised; back off if Whisper or GPT-4o-mini start returning 429s.
- `--reset-claims` on re-run clears any stale `claimed_by` from workers that crashed without releasing their claim. Safe to use any time.
- If you're seeing `database is locked` errors, lower `--workers`. SQLite's WAL mode handles concurrent writes well but isn't unlimited.

## Cost summary

| Item | Cost |
|---|---|
| Droplet (s-2vcpu-4gb × ~6h) | ~$0.22 |
| Whisper API (~6,000 min of sermon audio, music skipped) | ~$36 |
| GPT-4o-mini translate + titles (~200 videos) | ~$5 |
| Embeddings | <$1 |
| **Total** | **~$42** |

(vs. ~$150 if we didn't skip the music intros via silero-vad — a 70% saving.)
