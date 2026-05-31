"""Backfill display_title_{nl,en,fr,es} for already-processed videos.

The title-generation step was added after a few videos had already been
transcribed, so those rows have NULL display titles and fall back to the
raw Vimeo filename on the website. This script reconstructs each
transcript from the segments table and asks GPT-4o-mini for a clean
title plus en/fr/es translations.

Usage:
    python -m scripts.backfill_titles                 # all videos with NULL title_nl
    python -m scripts.backfill_titles --id 781916324  # one specific video
    python -m scripts.backfill_titles --reprocess     # regenerate for every done video

Idempotent: re-running on a video just overwrites its display_title_*.
Cost: ~$0.001 per video.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import sys

from . import translate_client

DB_PATH = os.environ.get(
    'SERMON_DB_PATH',
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sermons.db'),
)

TARGET_LANGS = ('en', 'fr', 'es')


def _targets(conn: sqlite3.Connection, *, only: str | None,
             reprocess: bool) -> list[sqlite3.Row]:
    if only:
        return conn.execute(
            'SELECT vimeo_id, title FROM videos WHERE vimeo_id = ?', (only,),
        ).fetchall()
    if reprocess:
        return conn.execute(
            "SELECT vimeo_id, title FROM videos WHERE transcript_status = 'done'"
        ).fetchall()
    return conn.execute(
        '''SELECT vimeo_id, title FROM videos
           WHERE transcript_status = 'done'
             AND (display_title_nl IS NULL OR display_title_nl = '')'''
    ).fetchall()


def _build_transcript_text(conn: sqlite3.Connection, vimeo_id: str,
                            char_budget: int = 3000) -> str:
    """Concatenate enough early segments to give the title model context."""
    rows = conn.execute(
        'SELECT text FROM segments WHERE vimeo_id = ? ORDER BY start_sec',
        (vimeo_id,),
    )
    parts: list[str] = []
    total = 0
    for r in rows:
        s = (r['text'] or '').strip()
        if not s:
            continue
        parts.append(s)
        total += len(s) + 1
        if total >= char_budget:
            break
    return ' '.join(parts)


def run(only: str | None, *, reprocess: bool) -> int:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        targets = _targets(conn, only=only, reprocess=reprocess)
        if not targets:
            print('backfill_titles: nothing to do')
            return 0
        print(f'backfill_titles: {len(targets)} video(s)')

        failures = 0
        for row in targets:
            vid = row['vimeo_id']
            raw = row['title'] or ''
            transcript_text = _build_transcript_text(conn, vid)
            if not transcript_text:
                print(f'  skip {vid} ({raw}): no segments, cannot summarize')
                continue
            try:
                nl = translate_client.generate_clean_title(
                    transcript_text=transcript_text, original_title=raw,
                )
                titles = {'nl': nl}
                for lang in TARGET_LANGS:
                    titles[lang] = translate_client.translate_title(nl, lang)
            except Exception as exc:
                failures += 1
                print(f'  FAIL {vid}: {type(exc).__name__}: {exc}', file=sys.stderr)
                continue

            conn.execute(
                '''UPDATE videos SET display_title_nl = ?, display_title_en = ?,
                   display_title_fr = ?, display_title_es = ?
                   WHERE vimeo_id = ?''',
                (titles['nl'], titles['en'], titles['fr'], titles['es'], vid),
            )
            conn.commit()
            print(f'  {vid}: "{titles["nl"]}"  /  en="{titles["en"]}"')

        return 1 if failures else 0
    finally:
        conn.close()


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--id', help='backfill one specific vimeo id')
    p.add_argument('--reprocess', action='store_true',
                   help='regenerate titles for every processed video, not just NULL')
    args = p.parse_args()
    sys.exit(run(args.id, reprocess=args.reprocess))
