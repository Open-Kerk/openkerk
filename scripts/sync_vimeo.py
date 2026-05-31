"""Sync Vimeo library -> sermons.db.

Inserts new videos into `videos` (status='pending') and enqueues them in
`queue`. Existing rows are updated for title/description/thumbnail/duration
in case they were edited on Vimeo.

Run:
    python -m scripts.sync_vimeo
"""

from __future__ import annotations

import sys

from . import db, vimeo_client


def run() -> int:
    new_count = 0
    updated = 0
    with db.connect() as conn:
        for video in vimeo_client.list_videos():
            vid = vimeo_client.parse_video_id(video.get('uri') or '')
            if not vid:
                continue

            row = conn.execute(
                'SELECT vimeo_id, transcript_status FROM videos WHERE vimeo_id = ?',
                (vid,),
            ).fetchone()

            data = {
                'vimeo_id':      vid,
                'title':         video.get('name') or 'Untitled',
                'description':   video.get('description') or '',
                'duration_sec':  int(video.get('duration') or 0),
                'thumbnail_url': vimeo_client.best_thumbnail(video) or '',
                'published_at':  video.get('release_time') or video.get('created_time') or '',
                'speaker':       ((video.get('user') or {}).get('name')) or '',
            }

            if row is None:
                conn.execute(
                    '''INSERT INTO videos (vimeo_id, title, description, duration_sec,
                       thumbnail_url, published_at, speaker)
                       VALUES (:vimeo_id, :title, :description, :duration_sec,
                       :thumbnail_url, :published_at, :speaker)''',
                    data,
                )
                conn.execute(
                    'INSERT OR IGNORE INTO queue (vimeo_id) VALUES (?)',
                    (vid,),
                )
                new_count += 1
            else:
                conn.execute(
                    '''UPDATE videos SET title = :title, description = :description,
                       duration_sec = :duration_sec, thumbnail_url = :thumbnail_url,
                       published_at = :published_at, speaker = :speaker
                       WHERE vimeo_id = :vimeo_id''',
                    data,
                )
                updated += 1
    print(f'sync_vimeo: {new_count} new, {updated} updated')
    return 0


if __name__ == '__main__':
    sys.exit(run())
