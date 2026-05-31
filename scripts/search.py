"""Semantic search over sermon chunks. Used by the Flask /teachings/search endpoint."""

from __future__ import annotations

import struct
from dataclasses import dataclass

from . import db, embed_client


@dataclass
class Hit:
    vimeo_id: str
    title: str
    thumbnail_url: str | None
    published_at: str | None
    speaker: str | None
    start_sec: float
    end_sec: float
    snippet: str          # NL text excerpt (we display the user-language version client-side)
    score: float          # distance (lower = closer)


def _pack(vec: list[float]) -> bytes:
    return struct.pack(f'{len(vec)}f', *vec)


def search(query: str, *, k: int = 12) -> list[Hit]:
    if not query.strip():
        return []
    vec = embed_client.embed_one(query)
    with db.connect(readonly=True) as conn:
        # sqlite-vec KNN: rows from chunk_vec joined back to chunks + videos.
        rows = conn.execute(
            '''SELECT c.vimeo_id, c.start_sec, c.end_sec, c.text,
                      v.title, v.thumbnail_url, v.published_at, v.speaker,
                      cv.distance
               FROM chunk_vec cv
               JOIN chunks c ON c.id = cv.rowid
               JOIN videos v ON v.vimeo_id = c.vimeo_id
               WHERE cv.embedding MATCH ? AND k = ?
               ORDER BY cv.distance''',
            (_pack(vec), k),
        ).fetchall()
    return [
        Hit(
            vimeo_id=r['vimeo_id'],
            title=r['title'],
            thumbnail_url=r['thumbnail_url'],
            published_at=r['published_at'],
            speaker=r['speaker'],
            start_sec=r['start_sec'],
            end_sec=r['end_sec'],
            snippet=r['text'],
            score=r['distance'],
        )
        for r in rows
    ]
