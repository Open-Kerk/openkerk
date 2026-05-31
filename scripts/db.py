"""SQLite + sqlite-vec store for sermon archive.

Schema overview
---------------
videos          One row per Vimeo video. Source-of-truth metadata.
segments        Whisper segments (start/end seconds + Dutch text).
translations    Translated full transcripts per language (for VTT generation
                and full-text fallback search).
chunks          ~400-token windows of the Dutch transcript with timestamp
                range, used as the unit of semantic search.
chunk_vec       sqlite-vec virtual table holding the embedding for each chunk
                (foreign key by rowid == chunks.id).
queue           Pending Vimeo IDs to process (populated by webhook and the
                Vimeo sync cron).
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from typing import Iterator

DB_PATH = os.environ.get(
    'SERMON_DB_PATH',
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sermons.db'),
)

# Embedding dimension for OpenAI text-embedding-3-small.
EMBED_DIM = 1536


def _load_vec(conn: sqlite3.Connection) -> None:
    """Attach sqlite-vec to the connection.

    sqlite-vec ships a loadable extension; the python package's `load`
    helper resolves the right shared object for the platform.
    """
    import sqlite_vec
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)


@contextmanager
def connect(path: str = DB_PATH, *, readonly: bool = False) -> Iterator[sqlite3.Connection]:
    if readonly:
        uri = f'file:{path}?mode=ro'
        conn = sqlite3.connect(uri, uri=True)
    else:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        conn = sqlite3.connect(path)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA foreign_keys = ON')
        _load_vec(conn)
        # Self-bootstrap on write connections so scripts run idempotently
        # even on a fresh repo clone without a committed sermons.db. Then
        # apply any column-add migrations on existing DBs.
        if not readonly:
            conn.executescript(SCHEMA)
            _migrate(conn)
        yield conn
        if not readonly:
            conn.commit()
    finally:
        conn.close()


SCHEMA = f"""
CREATE TABLE IF NOT EXISTS videos (
    vimeo_id        TEXT PRIMARY KEY,
    title           TEXT NOT NULL,         -- raw Vimeo title (kept for cross-ref / fallback)
    description     TEXT,
    duration_sec    INTEGER,
    thumbnail_url   TEXT,
    published_at    TEXT,                  -- ISO8601 UTC
    speaker         TEXT,
    series          TEXT,
    audio_lang      TEXT DEFAULT 'nl',
    unlisted_hash   TEXT,                  -- required in iframe src for unlisted videos
    sermon_start_sec REAL,                 -- offset where sermon begins (VAD-detected); NULL = transcribed from 0
    display_title_nl TEXT,                 -- LLM-cleaned title in Dutch
    display_title_en TEXT,                 -- translated from display_title_nl
    display_title_fr TEXT,
    display_title_es TEXT,
    processed_at    TEXT,                  -- ISO8601; NULL = not yet processed
    transcript_status TEXT DEFAULT 'pending'  -- pending|done|failed
);

CREATE TABLE IF NOT EXISTS segments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vimeo_id    TEXT NOT NULL REFERENCES videos(vimeo_id) ON DELETE CASCADE,
    idx         INTEGER NOT NULL,        -- order within video
    start_sec   REAL NOT NULL,
    end_sec     REAL NOT NULL,
    text        TEXT NOT NULL,           -- Dutch (source)
    UNIQUE(vimeo_id, idx)
);
CREATE INDEX IF NOT EXISTS idx_segments_vimeo ON segments(vimeo_id);

CREATE TABLE IF NOT EXISTS translations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    segment_id  INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    lang        TEXT NOT NULL,           -- 'en' | 'fr' | 'es' (nl lives in segments)
    text        TEXT NOT NULL,
    edited      INTEGER NOT NULL DEFAULT 0,  -- 1 if a human edited this row
    UNIQUE(segment_id, lang)
);
CREATE INDEX IF NOT EXISTS idx_translations_seg ON translations(segment_id);

CREATE TABLE IF NOT EXISTS chunks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vimeo_id    TEXT NOT NULL REFERENCES videos(vimeo_id) ON DELETE CASCADE,
    start_sec   REAL NOT NULL,
    end_sec     REAL NOT NULL,
    text        TEXT NOT NULL            -- Dutch chunk text (~400 tokens)
);
CREATE INDEX IF NOT EXISTS idx_chunks_vimeo ON chunks(vimeo_id);

-- sqlite-vec virtual table; rowid == chunks.id
CREATE VIRTUAL TABLE IF NOT EXISTS chunk_vec USING vec0(
    embedding float[{EMBED_DIM}]
);

CREATE TABLE IF NOT EXISTS queue (
    vimeo_id    TEXT PRIMARY KEY,
    enqueued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attempts    INTEGER NOT NULL DEFAULT 0,
    last_error  TEXT
);
"""


def _migrate(conn: sqlite3.Connection) -> None:
    """Idempotently bring an existing DB up to the current schema.

    Each migration must be guarded by a feature-check, so re-running on an
    up-to-date DB is a no-op.
    """
    cols = {row['name'] for row in conn.execute('PRAGMA table_info(videos)')}
    if 'unlisted_hash' not in cols:
        conn.execute('ALTER TABLE videos ADD COLUMN unlisted_hash TEXT')
    if 'sermon_start_sec' not in cols:
        conn.execute('ALTER TABLE videos ADD COLUMN sermon_start_sec REAL')
    for lang in ('nl', 'en', 'fr', 'es'):
        col = f'display_title_{lang}'
        if col not in cols:
            conn.execute(f'ALTER TABLE videos ADD COLUMN {col} TEXT')


def init_db(path: str = DB_PATH) -> None:
    with connect(path) as conn:
        conn.executescript(SCHEMA)


if __name__ == '__main__':
    init_db()
    print(f'Initialized {DB_PATH}')
