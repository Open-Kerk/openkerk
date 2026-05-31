"""Group Whisper segments into ~400-token chunks for semantic search.

We want chunks long enough to carry meaning but short enough that a hit
points to a specific moment in the sermon. ~400 tokens (~300 words, ~2 min
of speech) is a sweet spot. We add ~50-token overlap so a query that
straddles a boundary still matches.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SourceSeg:
    start: float
    end: float
    text: str


@dataclass
class Chunk:
    start: float
    end: float
    text: str


# Rough: 1 token ≈ 0.75 words for Dutch on cl100k_base. We work in *words*
# below to avoid a tiktoken dependency in this hot path; ~300 words ≈ 400 tk.
TARGET_WORDS = 300
OVERLAP_WORDS = 50


def chunk_segments(segs: list[SourceSeg]) -> list[Chunk]:
    if not segs:
        return []

    chunks: list[Chunk] = []
    buf: list[SourceSeg] = []
    buf_words = 0

    def flush(tail_overlap: bool) -> list[SourceSeg]:
        """Emit buf as a Chunk; if tail_overlap, return the tail segs to seed
        the next chunk so it overlaps with this one."""
        if not buf:
            return []
        chunks.append(Chunk(
            start=buf[0].start,
            end=buf[-1].end,
            text=' '.join(s.text for s in buf).strip(),
        ))
        if not tail_overlap:
            return []
        # Walk back from the end until we've gathered ~OVERLAP_WORDS.
        overlap: list[SourceSeg] = []
        words = 0
        for s in reversed(buf):
            overlap.insert(0, s)
            words += len(s.text.split())
            if words >= OVERLAP_WORDS:
                break
        return overlap

    for s in segs:
        buf.append(s)
        buf_words += len(s.text.split())
        if buf_words >= TARGET_WORDS:
            tail = flush(tail_overlap=True)
            buf = list(tail)
            buf_words = sum(len(x.text.split()) for x in buf)

    if buf:
        flush(tail_overlap=False)

    return chunks
