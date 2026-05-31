"""Voice activity detection to skip the music intro before the sermon.

Open Kerk's Sunday services begin with roughly 45-60 minutes of worship
music before the actual preaching starts. Transcribing the music with
Whisper costs money, produces garbage transcripts ("[Muziek] [Muziek]
..."), and trips the translator. This module finds where the sermon
starts so we can skip everything before it.

Heuristic: the sermon is by far the longest sustained-speech region in
the recording. silero-vad gives us speech regions; pick the longest
and use its start as the offset.

Why this works for our content:
  - Worship songs are 3-6 min each, separated by 5-15 sec of silence /
    talking — with a 30-sec silence threshold, each song becomes its
    own region.
  - The sermon is a 30-90 min continuous monologue with only brief
    rhetorical pauses (well under 30 sec) — one big merged region.
  - For short videos with no music intro (devotionals, clips), no
    region clears the min-sermon-duration floor, so we return 0 and
    transcribe the whole file unchanged.
"""

from __future__ import annotations

import subprocess
from dataclasses import dataclass

SR = 16000  # silero-vad's native sample rate


@dataclass
class SpeechRegion:
    start_sec: float
    end_sec: float

    @property
    def duration_sec(self) -> float:
        return self.end_sec - self.start_sec


def _read_audio_pcm(audio_path: str) -> "numpy.ndarray":  # type: ignore[name-defined]
    """Read an audio file as 16kHz mono float32 PCM via ffmpeg.

    We don't trust soundfile to handle every codec our pipeline produces
    (we use opus), so we always re-route through ffmpeg into stdout PCM.
    """
    import numpy as np
    proc = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', audio_path,
         '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
        capture_output=True, check=True,
    )
    return np.frombuffer(proc.stdout, dtype=np.int16).astype(np.float32) / 32768.0


def detect_speech_regions(audio_path: str, *,
                          min_silence_sec: float = 30.0,
                          min_speech_sec: float = 30.0) -> list[SpeechRegion]:
    """Run silero-vad and return the speech regions, sorted by start time."""
    from silero_vad import load_silero_vad, get_speech_timestamps

    audio = _read_audio_pcm(audio_path)
    model = load_silero_vad()
    raw = get_speech_timestamps(
        audio, model,
        sampling_rate=SR,
        min_silence_duration_ms=int(min_silence_sec * 1000),
        min_speech_duration_ms=int(min_speech_sec * 1000),
    )
    return [
        SpeechRegion(start_sec=r['start'] / SR, end_sec=r['end'] / SR)
        for r in raw
    ]


def find_sermon_start(audio_path: str, *,
                      min_sermon_duration_sec: float = 600.0) -> float:
    """Return the timestamp (seconds) where the sermon starts.

    If no speech region is long enough to plausibly be a sermon
    (default: ≥ 10 min), return 0.0 — caller should transcribe the
    whole file. This keeps short devotionals and clips intact.
    """
    regions = detect_speech_regions(audio_path)
    if not regions:
        return 0.0
    longest = max(regions, key=lambda r: r.duration_sec)
    if longest.duration_sec < min_sermon_duration_sec:
        return 0.0
    return longest.start_sec
