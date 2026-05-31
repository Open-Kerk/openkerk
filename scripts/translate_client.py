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
    "object of the form {{\"translations\": [...]}} where the array has "
    "EXACTLY the same length and order as the input. Even if multiple "
    "segments contain identical Dutch text (e.g. repeated [muziek] markers), "
    "include one translation entry per input position — do not deduplicate "
    "into a dict. Do not merge or split segments. Output only valid JSON, "
    "no prose, no markdown.\n\n"
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
    parsed = _parse_array(raw, source_texts=list(texts))
    return parsed


def _parse_array(raw: str, *, source_texts: list[str]) -> list[str]:
    """Normalize the model's response to a list of len(source_texts).

    The system prompt asks for a JSON array, but gpt-4o-mini will sometimes:
      - wrap it in a JSON object: {"translations": [...]}
      - collapse duplicate inputs into a source->translation dict:
        {"RUSTIGE MUZIEK": "MÚSICA TRANQUILA"} (when all segs are the same
        Whisper artifact). JSON objects can't have duplicate keys, so we'd
        otherwise lose alignment.

    Strategy:
      1. If it's a list, use it directly.
      2. If it's a dict containing a list value, use that list.
      3. Otherwise treat the dict as a source-text -> translation map and
         look up each source text in order (preserves alignment + handles
         the duplicate-input case correctly).
    """
    expected = len(source_texts)
    data = json.loads(raw)
    if isinstance(data, list):
        arr = data
    elif isinstance(data, dict):
        # Prefer a wrapped list if present.
        arr = next((v for v in data.values() if isinstance(v, list)), None)
        if arr is None:
            # Treat dict as {source_text: translation}; remap to input order.
            # Unknown sources fall through to '' so timing stays aligned.
            arr = [data.get(s, '') for s in source_texts]
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
