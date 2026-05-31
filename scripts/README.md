# Sermon pipeline

How sermons get from Vimeo to a searchable, subtitled page on the site.

```
Vimeo upload ──► webhook /vimeo-webhook ──► sermons.db.queue
                                              │
GitHub Action (*/15 min)                      │
   sync_vimeo.py     ── reconciles videos table
   process_video.py  ── pops queue:
       Whisper (NL)
       ├─ writes templates/assets/subtitles/<id>.nl.vtt
       ├─ GPT-4o-mini  ──► en/fr/es translations + 3 more .vtt files
       └─ chunks + embeds Dutch text into sqlite-vec
   git commit data/sermons.db + new VTTs ──► auto-deploys to DO
```

## Files

| Path                                  | Role                                                 |
|---------------------------------------|------------------------------------------------------|
| `scripts/db.py`                       | SQLite schema, connection helper (loads sqlite-vec). |
| `scripts/glossary.json`               | NL → EN/FR/ES theological term mappings.             |
| `scripts/vimeo_client.py`             | Thin Vimeo REST client (list videos, resolve URL).   |
| `scripts/whisper_client.py`           | Audio download + Whisper transcription.              |
| `scripts/translate_client.py`         | GPT-4o-mini batched segment translation w/ glossary. |
| `scripts/embed_client.py`             | OpenAI text-embedding-3-small.                       |
| `scripts/chunker.py`                  | ~300-word chunks with 50-word overlap.               |
| `scripts/vtt_writer.py`               | Emits WebVTT files for the player overlay.           |
| `scripts/sync_vimeo.py`               | Reconcile Vimeo library into the DB.                 |
| `scripts/process_video.py`            | Process one or more queued videos end-to-end.        |
| `scripts/search.py`                   | Used by Flask `/teachings/search` — k-NN over chunks.|
| `data/sermons.db`                     | The DB (committed to git).                           |
| `templates/assets/subtitles/*.vtt`    | Generated subtitle files (committed to git).         |
| `.github/workflows/process-sermons.yml` | Every 15 min: sync + process + commit.             |

## Required env / GitHub secrets

| Name                    | Where        | Notes                                                                |
|-------------------------|--------------|----------------------------------------------------------------------|
| `OPENAI_API_KEY`        | GH secrets   | Used by Whisper, translation, embeddings.                            |
| `VIMEO_TOKEN`           | GH secrets   | Personal access token. Scopes: `public private video_files`. **Must include `videos.download` or have `can_download:true` set on each video.** |
| `VIMEO_USER_ID`         | GH secrets   | Numeric Vimeo user id, e.g. `123456`. Defaults to `me` if omitted.   |
| `VIMEO_WEBHOOK_SECRET`  | DO env var   | Shared secret you set on the Vimeo webhook; verified in Flask.       |
| `SERMON_DB_PATH`        | optional     | Override DB location (default `data/sermons.db`).                    |

The webhook URL to register on Vimeo: `https://openkerk.com/vimeo-webhook` with the `video.upload.complete` event.

## Local dev gotcha (macOS)

macOS's system Python is built without sqlite extension loading, so the `/teachings/search` endpoint cannot work locally with that interpreter. Either:

  - `brew install python@3.12` and use that (Homebrew Python has extension loading enabled), or
  - test search in Docker: `docker build -t openkerk . && docker run -p 8080:8080 openkerk`

The `/teachings` grid + `/teachings/<id>` player still work locally — only `/teachings/search` needs sqlite-vec.

## One-video smoke test (do this first)

Before running the full backfill, verify the pipeline end-to-end on a single short sermon:

```bash
# 1. Init the DB
python -m scripts.db
# 2. Sync the library so we know which ids exist
OPENAI_API_KEY=sk-...  VIMEO_TOKEN=...  VIMEO_USER_ID=12345  python -m scripts.sync_vimeo
# 3. Process one specific video (pick the shortest you have):
OPENAI_API_KEY=...  VIMEO_TOKEN=...  python -m scripts.process_video --id <vimeo_id>
# 4. Inspect what was written:
ls -la templates/assets/subtitles/
sqlite3 data/sermons.db "select count(*) from segments; select count(*) from chunks;"
```

Then start the app, open `/teachings/<vimeo_id>`, toggle the subtitle language, and try `/teachings/search?q=<something from the sermon>`.

## Backfilling the archive

Once the smoke test works, set the workflow's `max_videos` input higher and let it chew through the queue 5 at a time:

```bash
gh workflow run process-sermons.yml -f max_videos=5
```

Whisper bills $0.006/min, so ~100 sermons × 45 min ≈ $27 + a few dollars for translation + cents for embeddings.

## Editing the glossary

`scripts/glossary.json` carries the term mappings GPT-4o-mini uses for sermon-specific vocabulary. To re-translate everything with an updated glossary, trigger the workflow with `reprocess=true` — translations table is wiped per-video before being rewritten.

## Troubleshooting

- **`no downloadable media for <id>`** — open the video on Vimeo, settings → distribution → enable Download. Or grant the API token the `videos.download` scope.
- **`enable_load_extension` AttributeError locally on macOS** — see the dev gotcha above.
- **`queue.attempts >= 3`** — `sqlite3 data/sermons.db "select * from queue;"` to see `last_error`. Fix the root cause and `update queue set attempts = 0 where vimeo_id = ?;` to retry.
