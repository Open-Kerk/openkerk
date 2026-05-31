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
    return OpenAI()


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


def transcribe(media_url: str, *, prompt: str | None = None) -> Transcript:
    """Transcribe the audio at `media_url`.

    `prompt` is a short hint (max 224 tokens) — we feed Whisper our church
    name and a few high-frequency theological terms so it stops hearing them
    as homophones.
    """
    client = _client()
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'src.mp4')
        audio = os.path.join(tmp, 'audio.ogg')
        _download(media_url, src)
        _extract_audio(src, audio)

        size = os.path.getsize(audio)
        if size <= MAX_BYTES:
            parts = [audio]
            offsets = [0.0]
        else:
            parts_dir = os.path.join(tmp, 'parts')
            os.makedirs(parts_dir)
            parts = _split(audio, parts_dir, seconds=600)
            # Offset each part by its index * 600 s. Because we used -c copy
            # the actual durations match what ffmpeg's segmenter cut at.
            offsets = [i * 600.0 for i in range(len(parts))]

        all_segments: list[Segment] = []
        all_text: list[str] = []
        for path, offset in zip(parts, offsets):
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
                    start=float(s['start']) + offset,
                    end=float(s['end']) + offset,
                    text=s['text'].strip(),
                ))

        return Transcript(
            language=LANGUAGE,
            text='\n'.join(t for t in all_text if t),
            segments=all_segments,
        )
