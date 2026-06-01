"""Process one queued video end-to-end:

    Vimeo audio -> Whisper (NL segments)
                -> translate segments to en/fr/es
                -> write 4 VTT files
                -> chunk + embed Dutch transcript
                -> persist segments, translations, chunks, vectors
                -> mark video processed, dequeue.

Usage:
    python -m scripts.process_video                # process up to --max queued
    python -m scripts.process_video --id 1234567   # process one specific id
    python -m scripts.process_video --max 1        # one job per run (CI cron)
    python -m scripts.process_video --reprocess    # ignore processed_at

Failures bump `queue.attempts` and stash the error text so the next run can
retry. Three failures -> we leave it in the queue and emit a non-zero exit
so the GitHub Action surfaces the problem.
"""

from __future__ import annotations

import argparse
import datetime
import struct
import sys
import traceback
from typing import Iterable

from . import db, vimeo_client, whisper_client, translate_client, embed_client, vtt_writer
from .chunker import SourceSeg, chunk_segments

TARGET_LANGS = ('en', 'fr', 'es')
MAX_ATTEMPTS = 3
WHISPER_PROMPT = (
    'Dit is een Nederlandse preek van Open Kerk. Gebruikte termen: '
    'genade, verbond, evangelie, Heilige Geest, koninkrijk, gemeente.'
)


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')


def _pack_vec(vec: list[float]) -> bytes:
    return struct.pack(f'{len(vec)}f', *vec)


def _queued_ids(conn, *, only: str | None, max_n: int) -> list[str]:
    if only:
        return [only]
    rows = conn.execute(
        'SELECT vimeo_id FROM queue WHERE attempts < ? ORDER BY enqueued_at LIMIT ?',
        (MAX_ATTEMPTS, max_n),
    ).fetchall()
    return [r['vimeo_id'] for r in rows]


def _record_failure(conn, vimeo_id: str, err: str) -> None:
    conn.execute(
        'UPDATE queue SET attempts = attempts + 1, last_error = ? WHERE vimeo_id = ?',
        (err[:2000], vimeo_id),
    )
    conn.execute(
        "UPDATE videos SET transcript_status = 'failed' WHERE vimeo_id = ?",
        (vimeo_id,),
    )


def process(vimeo_id: str, *, reprocess: bool = False) -> None:
    """Process a single video. Caller wraps with try/except for queue bookkeeping."""
    with db.connect() as conn:
        row = conn.execute(
            'SELECT title, processed_at FROM videos WHERE vimeo_id = ?', (vimeo_id,),
        ).fetchone()
        if row is None:
            # Not synced yet — pull metadata now.
            video = vimeo_client.get_video(vimeo_id)
            conn.execute(
                '''INSERT INTO videos (vimeo_id, title, description, duration_sec,
                   thumbnail_url, published_at, speaker)
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (
                    vimeo_id,
                    video.get('name') or 'Untitled',
                    video.get('description') or '',
                    int(video.get('duration') or 0),
                    vimeo_client.best_thumbnail(video) or '',
                    video.get('release_time') or video.get('created_time') or '',
                    ((video.get('user') or {}).get('name')) or '',
                ),
            )
        else:
            video = vimeo_client.get_video(vimeo_id)
            if row['processed_at'] and not reprocess:
                conn.execute('DELETE FROM queue WHERE vimeo_id = ?', (vimeo_id,))
                print(f'  skip {vimeo_id}: already processed')
                return

        media_url = vimeo_client.best_audio_url(video)
        if not media_url:
            raise RuntimeError(
                f'no downloadable media for {vimeo_id} — enable `can_download` on the '
                f'Vimeo video or grant the API token `videos.download` scope.'
            )

    print(f'  transcribing {vimeo_id} ({video.get("name")})...')
    transcript, sermon_start = whisper_client.transcribe_with_vad(
        media_url, prompt=WHISPER_PROMPT,
    )
    if sermon_start > 0:
        print(f'  skipped {sermon_start/60:.1f} min of worship music '
              f'(sermon starts at {sermon_start:.0f}s)')

    nl_texts = [s.text for s in transcript.segments]
    if not nl_texts:
        raise RuntimeError('Whisper returned zero segments')

    print(f'  generating clean title...')
    clean_title_nl = translate_client.generate_clean_title(
        transcript_text=transcript.text,
        original_title=video.get('name') or 'Untitled',
    )
    print(f'    nl: "{clean_title_nl}"')
    display_titles = {'nl': clean_title_nl}
    for lang in TARGET_LANGS:
        display_titles[lang] = translate_client.translate_title(clean_title_nl, lang)
        print(f'    {lang}: "{display_titles[lang]}"')

    print(f'  translating {len(nl_texts)} segments x {len(TARGET_LANGS)} languages...')
    translations = {
        lang: translate_client.translate_segments(nl_texts, lang)
        for lang in TARGET_LANGS
    }

    print(f'  writing VTT files...')
    nl_cues = [vtt_writer.Cue(s.start, s.end, s.text) for s in transcript.segments]
    vtt_writer.write(vimeo_id, 'nl', nl_cues)
    for lang in TARGET_LANGS:
        cues = [
            vtt_writer.Cue(s.start, s.end, t)
            for s, t in zip(transcript.segments, translations[lang])
        ]
        vtt_writer.write(vimeo_id, lang, cues)

    print(f'  chunking + embedding...')
    chunks = chunk_segments([
        SourceSeg(start=s.start, end=s.end, text=s.text)
        for s in transcript.segments
    ])
    embeddings = embed_client.embed([c.text for c in chunks]) if chunks else []

    with db.connect() as conn:
        # Wipe previous run (cascades to translations, chunks, chunk_vec).
        conn.execute('DELETE FROM segments WHERE vimeo_id = ?', (vimeo_id,))
        conn.execute('DELETE FROM chunks WHERE vimeo_id = ?', (vimeo_id,))

        # Insert segments + collect new IDs to attach translations.
        seg_ids: list[int] = []
        for idx, s in enumerate(transcript.segments):
            cur = conn.execute(
                'INSERT INTO segments (vimeo_id, idx, start_sec, end_sec, text) '
                'VALUES (?, ?, ?, ?, ?)',
                (vimeo_id, idx, s.start, s.end, s.text),
            )
            seg_ids.append(cur.lastrowid)

        for lang, texts in translations.items():
            conn.executemany(
                'INSERT INTO translations (segment_id, lang, text) VALUES (?, ?, ?)',
                [(sid, lang, t) for sid, t in zip(seg_ids, texts)],
            )

        for c, vec in zip(chunks, embeddings):
            cur = conn.execute(
                'INSERT INTO chunks (vimeo_id, start_sec, end_sec, text) VALUES (?, ?, ?, ?)',
                (vimeo_id, c.start, c.end, c.text),
            )
            conn.execute(
                'INSERT INTO chunk_vec (rowid, embedding) VALUES (?, ?)',
                (cur.lastrowid, _pack_vec(vec)),
            )

        conn.execute(
            "UPDATE videos SET processed_at = ?, transcript_status = 'done', "
            "sermon_start_sec = ?, display_title_nl = ?, display_title_en = ?, "
            "display_title_fr = ?, display_title_es = ? WHERE vimeo_id = ?",
            (_now(), sermon_start if sermon_start > 0 else None,
             display_titles['nl'], display_titles['en'],
             display_titles['fr'], display_titles['es'], vimeo_id),
        )
        conn.execute('DELETE FROM queue WHERE vimeo_id = ?', (vimeo_id,))

    print(f'  done {vimeo_id}: {len(transcript.segments)} segs, {len(chunks)} chunks')


def run(ids: Iterable[str] | None, *, max_n: int, reprocess: bool) -> int:
    with db.connect() as conn:
        targets = list(ids) if ids else _queued_ids(conn, only=None, max_n=max_n)

    if not targets:
        print('process_video: nothing queued')
        return 0

    failures = 0
    successes = 0
    for vid in targets:
        print(f'process_video: {vid}')
        try:
            process(vid, reprocess=reprocess)
            successes += 1
        except Exception as e:
            failures += 1
            traceback.print_exc()
            with db.connect() as conn:
                _record_failure(conn, vid, f'{type(e).__name__}: {e}')

    # Always exit 0 as long as at least one video succeeded (or there were
    # no targets). A transient per-video failure (e.g. OpenAI connection
    # error) used to bubble up as exit 1 and the workflow would skip the
    # commit step, throwing away the other successful videos' transcripts.
    # Failures are still visible via the queue table (attempts, last_error).
    print(f'process_video: {successes} ok, {failures} failed')
    if successes == 0 and failures > 0:
        return 1
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--id', help='process a single Vimeo id (skips queue order)')
    parser.add_argument('--max', type=int, default=5,
                        help='max queued videos to process this run')
    parser.add_argument('--reprocess', action='store_true',
                        help='ignore processed_at, force re-run')
    args = parser.parse_args()
    sys.exit(run(
        [args.id] if args.id else None,
        max_n=args.max,
        reprocess=args.reprocess,
    ))
