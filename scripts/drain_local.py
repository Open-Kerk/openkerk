"""Parallel queue drain — designed for a one-shot backfill on a DO droplet
(or local Mac in Docker, anywhere we own the box).

Why this exists: GitHub Actions cron is unreliable under load, and even
manual triggers serialise behind a concurrency lock at a 180-min job cap.
For a 200-video one-time backfill, owning a machine for a few hours is
faster (~5h with 4-way parallelism) and predictable.

Architecture:
  - N worker processes (default 4). Each one has its own SQLite
    connection and its own Whisper / translate / embed pipeline state.
  - Each worker atomically claims one queued vimeo_id via
    `BEGIN IMMEDIATE; UPDATE queue SET claimed_by = pid WHERE ...`
    so two workers never grab the same video.
  - Worker runs the existing process_video.process(vid) end-to-end.
  - On success: process_video deletes the queue row itself.
  - On failure: worker releases the claim and bumps queue.attempts.
  - After every video, a single-process FileLock serialises the
    `git add / commit / rebase / push` so partial progress is durable
    and other workers don't race on origin/main.

Idempotent and safe to interrupt — re-run with `--reset-claims` if a
prior run died mid-flight and left stale `claimed_by` rows.
"""

from __future__ import annotations

import argparse
import multiprocessing as mp
import os
import sqlite3
import subprocess
import sys
import time
import traceback
from pathlib import Path

from filelock import FileLock, Timeout

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / 'data' / 'sermons.db'
GIT_LOCK_PATH = '/tmp/openkerk-git.lock'
MAX_ATTEMPTS = 3


def _ensure_claim_column(conn: sqlite3.Connection) -> None:
    cols = {row[1] for row in conn.execute('PRAGMA table_info(queue)')}
    if 'claimed_by' not in cols:
        conn.execute('ALTER TABLE queue ADD COLUMN claimed_by TEXT')
    if 'claimed_at' not in cols:
        conn.execute('ALTER TABLE queue ADD COLUMN claimed_at TEXT')
    conn.commit()


def _claim_next(conn: sqlite3.Connection) -> str | None:
    """Atomically claim the next un-claimed queued vimeo_id. None when empty."""
    conn.execute('BEGIN IMMEDIATE')
    row = conn.execute(
        'SELECT vimeo_id FROM queue WHERE claimed_by IS NULL '
        'AND attempts < ? ORDER BY enqueued_at LIMIT 1',
        (MAX_ATTEMPTS,),
    ).fetchone()
    if not row:
        conn.execute('COMMIT')
        return None
    vid = row[0]
    conn.execute(
        "UPDATE queue SET claimed_by = ?, claimed_at = CURRENT_TIMESTAMP "
        "WHERE vimeo_id = ?",
        (str(os.getpid()), vid),
    )
    conn.execute('COMMIT')
    return vid


def _release_claim(conn: sqlite3.Connection, vid: str, error_msg: str) -> None:
    """Release a claim and record the failure so the queue knows to retry."""
    conn.execute(
        'UPDATE queue SET claimed_by = NULL, attempts = attempts + 1, '
        'last_error = ? WHERE vimeo_id = ?',
        (error_msg[:500], vid),
    )
    conn.commit()


def _git_commit_push(vid: str) -> bool:
    """Stage, commit, rebase, push. Serialised across workers via FileLock.

    Returns True on a successful push, False on no-op or failure.
    """
    with FileLock(GIT_LOCK_PATH, timeout=120):
        for path in ('data/sermons.db', 'templates/assets/subtitles/'):
            if os.path.exists(ROOT / path):
                subprocess.run(['git', 'add', path], cwd=ROOT, check=True)
        if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=ROOT).returncode == 0:
            return False
        subprocess.run(
            ['git', 'commit', '-m', f'auto: processed {vid}'],
            cwd=ROOT, check=True,
        )
        for attempt in range(1, 4):
            subprocess.run(['git', 'fetch', 'origin', 'main'], cwd=ROOT, check=True)
            rebase = subprocess.run(['git', 'rebase', 'origin/main'], cwd=ROOT)
            if rebase.returncode != 0:
                subprocess.run(['git', 'rebase', '--abort'], cwd=ROOT)
                time.sleep(attempt * 5)
                continue
            push = subprocess.run(['git', 'push', 'origin', 'main'], cwd=ROOT)
            if push.returncode == 0:
                print(f'  [git] pushed {vid} (attempt {attempt})')
                return True
            time.sleep(attempt * 5)
        print(f'  [git] push FAILED for {vid} after 3 attempts')
        return False


def _open_db() -> sqlite3.Connection:
    """Open the local SQLite DB with WAL + busy timeout so multiple workers
    can read/write concurrently without "database is locked" errors."""
    conn = sqlite3.connect(str(DB_PATH), timeout=60.0, isolation_level=None)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('PRAGMA busy_timeout=60000')
    return conn


def worker(worker_id: int) -> None:
    print(f'[w{worker_id} pid={os.getpid()}] starting')
    # Import here so each worker process loads its own PyTorch / silero-vad
    # state (the model is process-local and not pickle-safe).
    from scripts import process_video

    conn = _open_db()
    try:
        while True:
            vid = _claim_next(conn)
            if vid is None:
                print(f'[w{worker_id}] queue empty')
                return
            print(f'[w{worker_id}] -> {vid}')
            try:
                process_video.process(vid)
            except Exception as exc:
                traceback.print_exc()
                _release_claim(conn, vid, f'{type(exc).__name__}: {exc}')
                continue
            try:
                _git_commit_push(vid)
            except Timeout:
                print(f'[w{worker_id}] git lock timeout on {vid}; data committed locally but push deferred')
            except Exception as exc:
                print(f'[w{worker_id}] git push failed for {vid}: {exc}')
    finally:
        conn.close()


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument('--workers', type=int, default=4,
                   help='parallel worker count (default 4; set 1 for sequential)')
    p.add_argument('--reset-claims', action='store_true',
                   help='clear any stale claimed_by from a prior crashed run before starting')
    args = p.parse_args()

    if not DB_PATH.exists():
        print(f'sermons.db not found at {DB_PATH}', file=sys.stderr)
        return 1

    # Pre-flight: ensure the queue has the claim columns, optionally reset.
    with _open_db() as conn:
        _ensure_claim_column(conn)
        if args.reset_claims:
            n = conn.execute(
                'UPDATE queue SET claimed_by = NULL WHERE claimed_by IS NOT NULL'
            ).rowcount
            print(f'cleared {n} stale claims')
        pending = conn.execute(
            'SELECT COUNT(*) FROM queue WHERE attempts < ?', (MAX_ATTEMPTS,),
        ).fetchone()[0]
        print(f'pending in queue: {pending}')
        if pending == 0:
            print('nothing to drain')
            return 0

    procs = []
    for i in range(args.workers):
        proc = mp.Process(target=worker, args=(i,))
        proc.start()
        procs.append(proc)
        # Tiny stagger so all N workers don't hit `claim_next` simultaneously
        # and queue up on the SQLite write lock at startup.
        time.sleep(1)

    for proc in procs:
        proc.join()
    print('drain complete')
    return 0


if __name__ == '__main__':
    # 'spawn' avoids fork-related issues with PyTorch / threadpools on Linux.
    mp.set_start_method('spawn', force=True)
    sys.exit(main())
