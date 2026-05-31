"""Segment-level translation via GPT-4o-mini with a theological glossary.

Why segment-by-segment with a sliding context window:
  - Whisper hands us timestamped Dutch segments. To keep subtitle timing we
    must produce one translation per source segment. Translating each
    segment in isolation produces stilted, context-free output (pronouns,
    Bible-reference continuations, etc.).
  - Solution: translate in *batches* of N segments. The model sees the
    surrounding segments as context but is told to output exactly one
    translation per input segment.

The glossary terms are inlined into the prompt as authoritative mappings.
"""

from __future__ import annotations

import json
import os
import re
from typing import Sequence

from openai import OpenAI

MODEL = os.environ.get('OPENKERK_TRANSLATE_MODEL', 'gpt-4o-mini')
BATCH_SIZE = 20  # 20 source segments per call


LANG_NAMES = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
}


def _client() -> OpenAI:
    if not os.environ.get('OPENAI_API_KEY'):
        raise RuntimeError('OPENAI_API_KEY env var not set')
    return OpenAI()


def _glossary_for(lang: str) -> dict[str, str]:
    path = os.path.join(os.path.dirname(__file__), 'glossary.json')
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    out: dict[str, str] = {}
    for nl, mappings in data.get('terms', {}).items():
        target = mappings.get(lang)
        if target:
            out[nl] = target
    return out


def _filter_glossary(source_texts: Sequence[str], glossary: dict[str, str]) -> dict[str, str]:
    """Only include glossary entries whose source actually appears in the
    batch. Keeps the prompt short and the model focused."""
    blob = ' '.join(source_texts).lower()
    return {nl: tgt for nl, tgt in glossary.items() if nl.lower() in blob}


SYSTEM_TMPL = (
    "You are translating Dutch Christian sermon transcripts into {lang_name}. "
    "You will receive a JSON array of Dutch segments. Translate each segment "
    "faithfully, preserving tone and theological meaning, and return a JSON "
    "array of {lang_name} translations of the EXACT same length and order. "
    "Do not merge or split segments. Output only valid JSON — no prose, no markdown.\n\n"
    "Glossary (authoritative — prefer these renderings):\n{glossary}\n"
)


def _format_glossary(g: dict[str, str]) -> str:
    if not g:
        return '  (none for this batch)'
    return '\n'.join(f'  {nl} -> {tgt}' for nl, tgt in g.items())


def translate_batch(texts: Sequence[str], lang: str) -> list[str]:
    if not texts:
        return []
    if lang not in LANG_NAMES:
        raise ValueError(f'unsupported lang: {lang}')

    full_glossary = _glossary_for(lang)
    relevant = _filter_glossary(texts, full_glossary)
    system = SYSTEM_TMPL.format(
        lang_name=LANG_NAMES[lang],
        glossary=_format_glossary(relevant),
    )
    user = json.dumps(list(texts), ensure_ascii=False)

    client = _client()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ],
        response_format={'type': 'json_object'},
        temperature=0.2,
    )
    raw = resp.choices[0].message.content or ''
    parsed = _parse_array(raw, expected=len(texts))
    return parsed


def _parse_array(raw: str, *, expected: int) -> list[str]:
    """The model is instructed to return a JSON array. response_format
    json_object means it'll wrap it ({"translations": [...]}); accept either."""
    data = json.loads(raw)
    if isinstance(data, list):
        arr = data
    elif isinstance(data, dict):
        # Find the first list value.
        arr = next((v for v in data.values() if isinstance(v, list)), None)
        if arr is None:
            raise ValueError(f'no array found in response: {raw[:200]}')
    else:
        raise ValueError(f'unexpected response shape: {type(data)}')
    arr = [str(x) for x in arr]
    if len(arr) != expected:
        # Pad or truncate — better to keep timing aligned than to fail.
        if len(arr) < expected:
            arr = arr + [''] * (expected - len(arr))
        else:
            arr = arr[:expected]
    return arr


def translate_segments(texts: Sequence[str], lang: str) -> list[str]:
    """Translate a long list by batching into BATCH_SIZE chunks."""
    out: list[str] = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = list(texts[i:i + BATCH_SIZE])
        out.extend(translate_batch(batch, lang))
    return out
