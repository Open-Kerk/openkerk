"""Whitelist a video's embed setting on Vimeo so it can play on our site.

Vimeo's embed privacy model:
    privacy.embed = "public"     -> embeddable anywhere
                    "whitelist"  -> embeddable only on listed domains
                    "private"    -> not embeddable

We use "whitelist" with the openkerk domains. Without this, an unlisted
video on /teachings/<id> shows "Sorry — because of its privacy settings,
this video cannot be played here".

Incremental behaviour
---------------------
The script only acts on videos whose `videos.privacy_whitelist_at` is
NULL — i.e. those that have never been whitelisted by this script. The
initial migration backfilled every existing row at the time we did the
one-shot bulk run, so this cron-step only fires for videos that
sync_vimeo has just discovered (e.g. last Sunday's upload). Per success,
we stamp the column with CURRENT_TIMESTAMP and never revisit.

Override knobs:
  WHITELIST_DOMAINS  env var, comma-separated; default = the three
                     openkerk.com / DO domains.
  --all              re-run against every video regardless of timestamp
                     (use when domains change or you want to force).
"""

from __future__ import annotations

import argparse
import os
import sys
import time

import requests

from . import db

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
    """Set this video to whitelist mode and ensure the given domains are
    allowed. PUT on /privacy/domains/{d} is idempotent (200 if already
    there, 204 if newly added), so re-running is harmless."""
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
        if rr.status_code not in (200, 204):
            return False, (
                f'PUT domain {domain} on {vimeo_id}: '
                f'HTTP {rr.status_code} {rr.text[:200]}'
            )

    return True, 'ok'


def _pending_ids(*, all_videos: bool) -> list[str]:
    with db.connect(readonly=True) as conn:
        if all_videos:
            rows = conn.execute(
                'SELECT vimeo_id FROM videos ORDER BY published_at DESC'
            ).fetchall()
        else:
            rows = conn.execute(
                'SELECT vimeo_id FROM videos '
                'WHERE privacy_whitelist_at IS NULL '
                'ORDER BY published_at DESC'
            ).fetchall()
    return [r['vimeo_id'] for r in rows]


def _mark_done(vimeo_id: str) -> None:
    with db.connect() as conn:
        conn.execute(
            'UPDATE videos SET privacy_whitelist_at = CURRENT_TIMESTAMP '
            'WHERE vimeo_id = ?',
            (vimeo_id,),
        )


def run(*, all_videos: bool) -> int:
    ids = _pending_ids(all_videos=all_videos)
    if not ids:
        print('set_privacy: no pending videos to whitelist')
        return 0

    print(f'Whitelisting {len(ids)} video(s) with domains: {", ".join(DOMAINS)}')
    ok = 0
    fail = 0
    for i, vid in enumerate(ids, 1):
        success, msg = set_whitelist(vid, DOMAINS)
        if success:
            _mark_done(vid)
            ok += 1
            print(f'  [{i:3d}/{len(ids)}] {vid}: ok')
        else:
            fail += 1
            print(f'  [{i:3d}/{len(ids)}] {vid}: FAIL {msg}', file=sys.stderr)
        # Pace Vimeo's write-endpoint rate limit (~100 req / 60 s).
        time.sleep(0.3)
    print(f'\nDone: {ok} ok, {fail} failed.')
    return 1 if fail else 0


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument(
        '--all', action='store_true',
        help='Re-run against every video (use after a domain change). '
             'Default: only videos with no privacy_whitelist_at timestamp.',
    )
    args = p.parse_args()
    sys.exit(run(all_videos=args.all))
