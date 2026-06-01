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
    return OpenAI(max_retries=5)


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


# ─── Title generation ────────────────────────────────────────────────

TITLE_SYSTEM = (
    "You generate clean, concise sermon titles for a Christian church's "
    "website. Rules:\n"
    "1. Max 70 characters.\n"
    "2. Write in Dutch.\n"
    "3. Capture the main theme, scripture passage, or core message.\n"
    "4. If the original filename contains series markers (e.g. 'Bidden & "
    "   Vasten - Dag 5', 'Vision Sunday 2025'), preserve them as a prefix.\n"
    "5. Strip file extensions (.mp4, .mov), random IDs, video player text, "
    "   and generic placeholders like 'Open Kerk online dienst'.\n"
    "6. Return ONLY the title text — no surrounding quotes, no markdown, "
    "   no explanation.\n"
    "7. If the transcript is too short / empty, do your best with the "
    "   original title; clean it up and return that."
)


def generate_clean_title(transcript_text: str, original_title: str) -> str:
    """Ask GPT-4o-mini to produce a clean Dutch title from the transcript.

    Returns the new title, or a cleaned-up original_title if the model
    returns nothing usable.
    """
    snippet = (transcript_text or '').strip()[:3000]
    user = (
        f'Original filename: {original_title}\n\n'
        f'Sermon transcript (first part):\n{snippet}'
    )
    client = _client()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': TITLE_SYSTEM},
            {'role': 'user', 'content': user},
        ],
        temperature=0.3,
        max_tokens=120,
    )
    title = (resp.choices[0].message.content or '').strip()
    # Strip stray wrapping quotes/markdown if the model added them.
    title = title.strip('"').strip("'").strip('*').strip()
    # Drop a trailing period if any (model artifact).
    if title.endswith('.') and not title.endswith('...'):
        title = title[:-1]
    if not title:
        # Last-resort fallback: strip the .mp4 etc. from the original.
        title = re.sub(r'\.(mp4|mov|avi|m4v)$', '', original_title or '', flags=re.I).strip()
    return title[:120] or 'Untitled'


def translate_title(title: str, lang: str) -> str:
    """Translate a single sermon title into `lang`. Uses the same batched
    translator (treated as a single-item batch), so the glossary still
    applies."""
    if not title or lang == 'nl':
        return title
    out = translate_batch([title], lang)
    return out[0].strip() if out else title
