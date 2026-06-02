"""Re-title sermons whose `display_title_nl` is the generic placeholder.

About 34 sermons came out of the initial backfill with `display_title_nl =
"Open Kerk online dienst"` — the title generator sampled the first 3000
chars of the transcript, which on a typical Sunday recording is mostly
worship/announcements before the preacher gets to the actual theme. By
the time the sermon point lands, our snippet window has already closed
and the model falls back to the original Vimeo filename.

This script fixes them. For each generic-titled video it:
  1. Rebuilds a transcript snippet from the MIDDLE 60% of the segments
     (skips the first 20% of intro/worship and the last 20% of altar
     call / dismissal), capped at ~6000 chars.
  2. Asks gpt-4o (heavier than the gpt-4o-mini used at backfill time)
     for a clean Dutch title with a sharpened prompt explicitly
     forbidding the generic placeholder.
  3. Translates the new title into en/fr/es via the existing batched
     translator (so the church glossary still applies).
  4. Writes the four new display_title_* columns back to the DB.

Cost: ~$0.005 per video (gpt-4o input/output for ~6k tokens + 3 small
translation calls) → roughly $0.17 for all 34. Trivial.

Idempotent: only acts on rows whose current display_title_nl matches
one of the GENERIC titles below. After this script runs, those rows
have specific titles and the next run is a no-op.
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Sequence

from openai import OpenAI

from . import db, translate_client

# Titles we consider "didn't extract a theme — needs another pass".
GENERIC_TITLES = (
    'Open Kerk online dienst',
    'Open Kerk online dienst.',
    'Open Kerk',
    'Open Kerk dienst',
)

# Sample bounds: skip the first 20% of segments (worship + announcements)
# and the last 10% (altar call / dismissal). 6000 chars is ~10-15 min of
# preaching, enough for the model to identify the central point.
SNIPPET_SKIP_HEAD_FRAC = 0.20
SNIPPET_SKIP_TAIL_FRAC = 0.10
SNIPPET_CHAR_BUDGET    = 6000

# Heavier model for relabel — better at picking a non-generic theme.
RELABEL_MODEL = os.environ.get('OPENKERK_RELABEL_MODEL', 'gpt-4o')

RELABEL_SYSTEM = (
    "You generate clean, concise sermon titles for a Christian church's "
    "website. Rules:\n"
    "1. Max 70 characters.\n"
    "2. Write in Dutch.\n"
    "3. Identify the central preaching point — the scripture passage being "
    "   exposited, the main theme, or a memorable phrase the preacher "
    "   repeats. Be SPECIFIC.\n"
    "4. NEVER return the generic placeholder 'Open Kerk online dienst' "
    "   on its own. If you genuinely cannot identify a specific theme "
    "   from the excerpt, pick a key scripture reference or distinctive "
    "   phrase from the text and use that as the title.\n"
    "5. Output ONLY the title — no quotes, no markdown, no explanation."
)


def _client() -> OpenAI:
    if not os.environ.get('OPENAI_API_KEY'):
        raise RuntimeError('OPENAI_API_KEY env var not set')
    return OpenAI(max_retries=5)


def _middle_snippet(conn, vimeo_id: str) -> str:
    """Concat segment texts from the middle of the transcript."""
    rows = conn.execute(
        'SELECT text FROM segments WHERE vimeo_id = ? ORDER BY start_sec',
        (vimeo_id,),
    ).fetchall()
    if not rows:
        return ''
    n = len(rows)
    lo = int(n * SNIPPET_SKIP_HEAD_FRAC)
    hi = int(n * (1.0 - SNIPPET_SKIP_TAIL_FRAC))
    middle = rows[lo:hi] if hi > lo else rows
    out: list[str] = []
    total = 0
    for r in middle:
        text = (r['text'] or '').strip()
        if not text:
            continue
        out.append(text)
        total += len(text) + 1
        if total >= SNIPPET_CHAR_BUDGET:
            break
    return ' '.join(out)


def _regenerate(snippet: str, original_title: str) -> str:
    client = _client()
    resp = client.chat.completions.create(
        model=RELABEL_MODEL,
        messages=[
            {'role': 'system', 'content': RELABEL_SYSTEM},
            {'role': 'user', 'content':
                f'Original filename: {original_title}\n\n'
                f'Mid-sermon transcript excerpt:\n{snippet}'},
        ],
        temperature=0.3,
        max_tokens=120,
    )
    title = (resp.choices[0].message.content or '').strip()
    title = title.strip('"').strip("'").strip('*').strip()
    if title.endswith('.') and not title.endswith('...'):
        title = title[:-1]
    return title[:120]


def _is_still_generic(title: str) -> bool:
    return title.strip().rstrip('.').lower() in {g.rstrip('.').lower() for g in GENERIC_TITLES}


def _find_targets(conn, only: str | None) -> list[dict]:
    if only:
        rows = conn.execute(
            "SELECT vimeo_id, title FROM videos WHERE vimeo_id = ?", (only,),
        ).fetchall()
    else:
        placeholders = ','.join('?' for _ in GENERIC_TITLES)
        rows = conn.execute(
            f"SELECT vimeo_id, title FROM videos "
            f"WHERE transcript_status = 'done' "
            f"AND TRIM(display_title_nl) IN ({placeholders}) "
            f"ORDER BY published_at",
            GENERIC_TITLES,
        ).fetchall()
    return [dict(r) for r in rows]


def run(only: str | None, dry_run: bool, limit: int | None) -> int:
    with db.connect() as conn:
        targets = _find_targets(conn, only)

    if limit is not None:
        targets = targets[:limit]
    if not targets:
        print('relabel_generic: nothing to do')
        return 0
    print(f'relabel_generic: {len(targets)} videos (model={RELABEL_MODEL}, dry_run={dry_run})')

    failures = 0
    for i, t in enumerate(targets, 1):
        vid = t['vimeo_id']
        raw = t['title'] or ''
        with db.connect(readonly=True) as conn:
            snippet = _middle_snippet(conn, vid)
        if not snippet:
            print(f'  [{i:2d}/{len(targets)}] {vid}: no segments, skipping')
            continue
        try:
            new_nl = _regenerate(snippet, raw)
            if _is_still_generic(new_nl):
                print(f'  [{i:2d}/{len(targets)}] {vid}: still generic ({new_nl!r}), leaving alone')
                continue
            translations = {
                'en': translate_client.translate_title(new_nl, 'en'),
                'fr': translate_client.translate_title(new_nl, 'fr'),
                'es': translate_client.translate_title(new_nl, 'es'),
            }
        except Exception as exc:
            failures += 1
            print(f'  [{i:2d}/{len(targets)}] {vid}: FAILED {type(exc).__name__}: {exc}',
                  file=sys.stderr)
            continue

        print(f'  [{i:2d}/{len(targets)}] {vid}: "{new_nl}"')
        print(f'        en: "{translations["en"]}"')

        if dry_run:
            continue

        with db.connect() as conn:
            conn.execute(
                'UPDATE videos SET display_title_nl = ?, display_title_en = ?, '
                'display_title_fr = ?, display_title_es = ? WHERE vimeo_id = ?',
                (new_nl, translations['en'], translations['fr'],
                 translations['es'], vid),
            )

    print(f'relabel_generic: done ({failures} failed)')
    return 1 if failures else 0


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--id', help='retitle one specific vimeo id')
    p.add_argument('--limit', type=int, help='cap how many to process this run')
    p.add_argument('--dry-run', action='store_true',
                   help='print proposed titles without updating the DB')
    args = p.parse_args()
    sys.exit(run(args.id, args.dry_run, args.limit))
