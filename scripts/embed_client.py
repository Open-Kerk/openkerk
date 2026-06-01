"""OpenAI embeddings for semantic search over Dutch sermon transcripts."""

from __future__ import annotations

import os
from typing import Sequence

from openai import OpenAI

MODEL = os.environ.get('OPENKERK_EMBED_MODEL', 'text-embedding-3-small')
BATCH = 96  # OpenAI accepts up to 2048 inputs; 96 keeps payload sizes sane.


def _client() -> OpenAI:
    if not os.environ.get('OPENAI_API_KEY'):
        raise RuntimeError('OPENAI_API_KEY env var not set')
    return OpenAI(max_retries=5)


def embed(texts: Sequence[str]) -> list[list[float]]:
    if not texts:
        return []
    client = _client()
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH):
        batch = list(texts[i:i + BATCH])
        resp = client.embeddings.create(model=MODEL, input=batch)
        out.extend(d.embedding for d in resp.data)
    return out


def embed_one(text: str) -> list[float]:
    return embed([text])[0]
