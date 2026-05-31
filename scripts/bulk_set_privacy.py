"""Bulk-update Vimeo videos to allow embedding only on the openkerk domains.

Vimeo's embed privacy model:
    privacy.embed = "public"     -> embeddable anywhere
                    "whitelist"  -> embeddable only on listed domains
                    "private"    -> not embeddable

This script sets every video in the authenticated user's library to
"whitelist" and adds:
    - openkerk.com
    - www.openkerk.com
    - openkerk-rqtu6.ondigitalocean.app  (DO preview)

You can override the whitelist via the WHITELIST_DOMAINS env var
(comma-separated).

Run:
    OPENAI_API_KEY=... VIMEO_TOKEN=... python -m scripts.bulk_set_privacy

The token needs the `edit` scope. The default personal token in the GitHub
secrets may need to be regenerated with `edit` added.
"""

from __future__ import annotations

import os
import sys
import time

import requests

from . import vimeo_client

DEFAULT_DOMAINS = (
    'openkerk.com',
    'www.openkerk.com',
    'openkerk-rqtu6.ondigitalocean.app',
)

DOMAINS = tuple(
    d.strip() for d in os.environ.get(
        'WHITELIST_DOMAINS', ','.join(DEFAULT_DOMAINS),
    ).split(',') if d.strip()
)

BASE = 'https://api.vimeo.com'


def _headers():
    token = os.environ.get('VIMEO_TOKEN')
    if not token:
        raise RuntimeError('VIMEO_TOKEN env var not set')
    return {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/json',
    }


def set_whitelist(vimeo_id: str, domains: tuple[str, ...]) -> tuple[bool, str]:
    """Set this video to whitelist mode and add the given domains.

    Returns (ok, message).
    """
    r = requests.patch(
        f'{BASE}/videos/{vimeo_id}',
        headers=_headers(),
        json={'privacy': {'embed': 'whitelist'}},
        timeout=30,
    )
    if r.status_code >= 400:
        return False, f'PATCH {vimeo_id}: HTTP {r.status_code} {r.text[:200]}'

    for domain in domains:
        rr = requests.put(
            f'{BASE}/videos/{vimeo_id}/privacy/domains/{domain}',
            headers=_headers(),
            timeout=30,
        )
        # 204 = added, 200 = already there. Anything else is a problem.
        if rr.status_code not in (200, 204):
            return False, (
                f'PUT domain {domain} on {vimeo_id}: '
                f'HTTP {rr.status_code} {rr.text[:200]}'
            )

    return True, 'ok'


def run() -> int:
    print(f'Whitelisting {len(DOMAINS)} domain(s): {", ".join(DOMAINS)}')
    ok = 0
    fail = 0
    for i, video in enumerate(vimeo_client.list_videos(), 1):
        vid = vimeo_client.parse_video_id(video.get('uri') or '')
        if not vid:
            continue
        success, msg = set_whitelist(vid, DOMAINS)
        if success:
            ok += 1
            print(f'  [{i:3d}] {vid} {video.get("name", "")[:60]}: ok')
        else:
            fail += 1
            print(f'  [{i:3d}] {vid}: FAIL {msg}', file=sys.stderr)
        # Vimeo throttles around 100 requests / 60s for write endpoints.
        # We make 1 + len(DOMAINS) = 4 calls per video; pace gently.
        time.sleep(0.3)
    print(f'\nDone: {ok} ok, {fail} failed.')
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(run())
