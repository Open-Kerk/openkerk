"""Whisper transcription via OpenAI API.

Downloads a remote media URL to /tmp, sends it to whisper-1 with
verbose_json + segment timestamps, returns the parsed result.

Whisper-1's per-call file limit is 25 MB. For long sermons (45-90 min) the
audio extracted from a low-bitrate MP4 typically lands well under that, but
we'll split with ffmpeg if needed.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass

import requests
from openai import OpenAI

MAX_BYTES = 24 * 1024 * 1024  # leave headroom under the 25 MB hard limit
LANGUAGE = 'nl'  # source language: Dutch


@dataclass
class Segment:
    start: float
    end: float
    text: str


@dataclass
class Transcript:
    language: str
    text: str
    segments: list[Segment]


def _client() -> OpenAI:
    if not os.environ.get('OPENAI_API_KEY'):
        raise RuntimeError('OPENAI_API_KEY env var not set')
    # Whisper transcribe is a long upload; transient TLS/connection drops
    # have been observed in CI. Bump retries from the default 2 to 5 so a
    # short network blip doesn't burn a per-video attempt.
    return OpenAI(max_retries=5, timeout=600.0)


def _download(url: str, dest: str) -> None:
    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        with open(dest, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)


def _extract_audio(src: str, dest: str) -> None:
    """Extract a mono 16 kHz Opus track — small, lossless-enough for Whisper."""
    if not shutil.which('ffmpeg'):
        raise RuntimeError('ffmpeg not found on PATH (apt install ffmpeg)')
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', src,
         '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libopus', '-b:a', '24k', dest],
        check=True,
    )


def _split(src: str, parts_dir: str, seconds: int = 600) -> list[str]:
    """Slice src into <seconds>-second chunks. Returns ordered paths."""
    pattern = os.path.join(parts_dir, 'part-%03d.ogg')
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', src,
         '-f', 'segment', '-segment_time', str(seconds),
         '-c', 'copy', pattern],
        check=True,
    )
    parts = sorted(
        os.path.join(parts_dir, n) for n in os.listdir(parts_dir)
        if n.startswith('part-') and n.endswith('.ogg')
    )
    return parts


def _trim(audio_in: str, audio_out: str, start_sec: float) -> None:
    """Cut everything before start_sec. Re-encodes so timestamps are
    accurate (-c copy on opus can land off the requested frame)."""
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error',
         '-ss', f'{start_sec:.3f}', '-i', audio_in,
         '-vn', '-ac', '1', '-ar', '16000',
         '-c:a', 'libopus', '-b:a', '24k', audio_out],
        check=True,
    )


def _transcribe_audio(audio_path: str, *, prompt: str = '',
                       offset_sec: float = 0.0) -> Transcript:
    """Send a local audio file to Whisper. Splits into 10-min parts if
    needed to stay under the 25 MB upload cap. Returned segment
    timestamps are shifted by offset_sec, so the caller passing a
    trimmed file with the trim point as offset_sec gets back cues that
    line up with the ORIGINAL video timeline."""
    client = _client()
    with tempfile.TemporaryDirectory() as tmp:
        size = os.path.getsize(audio_path)
        if size <= MAX_BYTES:
            parts = [audio_path]
            part_offsets = [0.0]
        else:
            parts_dir = os.path.join(tmp, 'parts')
            os.makedirs(parts_dir)
            parts = _split(audio_path, parts_dir, seconds=600)
            part_offsets = [i * 600.0 for i in range(len(parts))]

        all_segments: list[Segment] = []
        all_text: list[str] = []
        for path, part_off in zip(parts, part_offsets):
            with open(path, 'rb') as f:
                resp = client.audio.transcriptions.create(
                    model='whisper-1',
                    file=f,
                    language=LANGUAGE,
                    response_format='verbose_json',
                    timestamp_granularities=['segment'],
                    prompt=prompt or '',
                )
            data = resp.model_dump() if hasattr(resp, 'model_dump') else resp
            all_text.append((data.get('text') or '').strip())
            for s in data.get('segments') or []:
                all_segments.append(Segment(
                    start=float(s['start']) + part_off + offset_sec,
                    end=float(s['end']) + part_off + offset_sec,
                    text=s['text'].strip(),
                ))

        return Transcript(
            language=LANGUAGE,
            text='\n'.join(t for t in all_text if t),
            segments=all_segments,
        )


def transcribe(media_url: str, *, prompt: str | None = None) -> Transcript:
    """Download `media_url`, extract audio, send the full thing to Whisper."""
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'src.mp4')
        audio = os.path.join(tmp, 'audio.ogg')
        _download(media_url, src)
        _extract_audio(src, audio)
        return _transcribe_audio(audio, prompt=prompt or '')


def transcribe_with_vad(media_url: str, *, prompt: str | None = None,
                         min_sermon_duration_sec: float = 600.0
                         ) -> tuple[Transcript, float]:
    """Same as transcribe(), but first runs VAD on the downloaded audio
    to find the sermon start. Skips everything before it (typically
    45-60 min of worship music on a Sunday service).

    Returns (transcript, sermon_start_sec). sermon_start_sec is 0.0
    when no music skip happened — useful for logging.
    """
    from .vad import find_sermon_start
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'src.mp4')
        audio = os.path.join(tmp, 'audio.ogg')
        _download(media_url, src)
        _extract_audio(src, audio)

        sermon_start = find_sermon_start(
            audio, min_sermon_duration_sec=min_sermon_duration_sec,
        )
        if sermon_start > 0.0:
            trimmed = os.path.join(tmp, 'sermon.ogg')
            _trim(audio, trimmed, sermon_start)
            transcript = _transcribe_audio(
                trimmed, prompt=prompt or '', offset_sec=sermon_start,
            )
        else:
            transcript = _transcribe_audio(audio, prompt=prompt or '')

        return transcript, sermon_start
