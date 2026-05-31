"""Thin Vimeo REST API client.

Only the calls we need: list videos in the user's library, fetch one video's
metadata, and resolve a direct download URL for the audio (or smallest video
file we can hand to Whisper).
"""

from __future__ import annotations

import os
import re
from typing import Iterator
from urllib.parse import parse_qs, urlparse

import requests

VIMEO_TOKEN = os.environ.get('VIMEO_TOKEN')
VIMEO_USER_ID = os.environ.get('VIMEO_USER_ID', 'me')  # 'me' uses the token's owner
BASE = 'https://api.vimeo.com'


def _headers() -> dict:
    if not VIMEO_TOKEN:
        raise RuntimeError('VIMEO_TOKEN env var not set')
    return {
        'Authorization': f'Bearer {VIMEO_TOKEN}',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
    }


def list_videos(per_page: int = 50) -> Iterator[dict]:
    """Yield each video in the authenticated user's library.

    Vimeo paginates with `paging.next`; we follow it until exhausted.
    """
    url = f'{BASE}/users/{VIMEO_USER_ID}/videos'
    params = {
        'per_page': per_page,
        'fields': (
            'uri,name,description,duration,created_time,release_time,'
            'pictures.sizes,download,files,user.name,player_embed_url,privacy.view'
        ),
        'sort': 'date',
        'direction': 'desc',
    }
    while url:
        r = requests.get(url, headers=_headers(), params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        for video in data.get('data', []):
            yield video
        next_path = data.get('paging', {}).get('next')
        url = f'{BASE}{next_path}' if next_path else None
        params = None  # Vimeo's next link already includes pagination params


def get_video(vimeo_id: str) -> dict:
    r = requests.get(
        f'{BASE}/videos/{vimeo_id}',
        headers=_headers(),
        params={'fields': 'uri,name,description,duration,created_time,release_time,'
                          'pictures.sizes,download,files,user.name'},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def parse_video_id(uri_or_id: str) -> str:
    """Normalize '/videos/12345' or '12345' to '12345'."""
    return str(uri_or_id).rsplit('/', 1)[-1]


def best_audio_url(video: dict) -> str | None:
    """Return the smallest media URL we can feed to Whisper.

    Prefer Vimeo's `download` entries (originals when enabled). Fall back to
    the smallest `files` entry, which is a transcoded MP4 — Whisper handles
    MP4 audio extraction fine.
    """
    candidates: list[tuple[int, str]] = []
    for entry in video.get('download') or []:
        if entry.get('link') and entry.get('size'):
            candidates.append((int(entry['size']), entry['link']))
    for entry in video.get('files') or []:
        if entry.get('link') and entry.get('size'):
            candidates.append((int(entry['size']), entry['link']))
    if not candidates:
        return None
    candidates.sort()
    return candidates[0][1]


def unlisted_hash(video: dict) -> str | None:
    """Return the unlisted-video hash if this video requires one.

    Vimeo's player URL contains the hash as ?h=<10-hex-chars>. Public
    videos have no hash. Without it, our iframe shows "Sorry, we're
    having a little trouble".
    """
    url = video.get('player_embed_url') or ''
    if not url:
        return None
    h = parse_qs(urlparse(url).query).get('h', [None])[0]
    return h or None


def best_thumbnail(video: dict) -> str | None:
    sizes = (video.get('pictures') or {}).get('sizes') or []
    if not sizes:
        return None
    # Pick the largest <= 800px wide, else the largest available.
    fitting = [s for s in sizes if s.get('width', 0) <= 800]
    pool = fitting or sizes
    pool.sort(key=lambda s: s.get('width', 0), reverse=True)
    return pool[0].get('link')
