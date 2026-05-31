"""Generate WebVTT subtitle files from (start, end, text) cues.

Output path convention:
  templates/assets/subtitles/{vimeo_id}.{lang}.vtt
served at /assets/subtitles/... by Flask's static handler.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


SUBTITLES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    'templates', 'assets', 'subtitles',
)


@dataclass
class Cue:
    start: float
    end: float
    text: str


def _ts(sec: float) -> str:
    if sec < 0:
        sec = 0
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec - h * 3600 - m * 60
    return f'{h:02d}:{m:02d}:{s:06.3f}'


def render(cues: list[Cue]) -> str:
    lines = ['WEBVTT', '']
    for i, c in enumerate(cues, 1):
        lines.append(str(i))
        lines.append(f'{_ts(c.start)} --> {_ts(c.end)}')
        lines.append(c.text.replace('\n', ' ').strip())
        lines.append('')
    return '\n'.join(lines)


def write(vimeo_id: str, lang: str, cues: list[Cue]) -> str:
    os.makedirs(SUBTITLES_DIR, exist_ok=True)
    path = os.path.join(SUBTITLES_DIR, f'{vimeo_id}.{lang}.vtt')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(render(cues))
    return path
