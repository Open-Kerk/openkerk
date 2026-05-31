from flask import Flask, render_template, session, redirect, request, url_for, jsonify, abort
import hashlib
import hmac
import os
import sqlite3
import yaml

BRAND_DIR = os.path.join(os.path.dirname(__file__), 'templates')

app = Flask(
    __name__,
    template_folder=BRAND_DIR,
    static_folder=os.path.join(BRAND_DIR, 'assets'),
    static_url_path='/assets',
)

app.secret_key = os.environ.get('SECRET_KEY', 'openkerk-dev-key')

# ── Supported languages ───────────────────────────────────────────────
LANGUAGES = {
    'nl': 'Nederlands',
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
}

# ── Live stream embed ──────────────────────────────────────────────────
# Set this to the church's live embed URL (YouTube or Vimeo). Leave empty
# ('' / None) to show the "geen uitzending" offline state.
# Examples:
#   Vimeo event (live):     'https://vimeo.com/event/EVENT_ID/embed'
#   Vimeo video:            'https://player.vimeo.com/video/VIDEO_ID'
#   YouTube live (channel): 'https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID'
#   YouTube video:          'https://www.youtube.com/embed/VIDEO_ID'
LIVE_EMBED_URL = os.environ.get(
    'LIVE_EMBED_URL',
    'https://vimeo.com/event/2735362/embed/d688c6c379',
)

# ── Camp sign-up Google Forms ──────────────────────────────────────────
# Paste each camp's Google Form URL here (the normal /viewform link is fine;
# "?embedded=true" is added automatically). Leave empty to show a fallback.
CAMP_FORMS = {
    'kinder':  os.environ.get('FORM_KINDERKAMP',
        'https://docs.google.com/forms/d/e/1FAIpQLSdsrVcPQTdZwrs2X7sExaoAcCsT2FNLf1e7U8rhVwmMGEyBBA/viewform'),
    'jong':    os.environ.get('FORM_SUMMERCAMP',
        'https://docs.google.com/forms/d/e/1FAIpQLScATuq1qEADTHWtQ6pF2Z9n0_b4ai2tkuoginJVKa0wSj2gow/viewform'),
    'realmen': os.environ.get('FORM_REALMENCAMP',
        'https://docs.google.com/forms/d/e/1FAIpQLSfrTxjBmDxytgrLQwQqK2OOKub-0JLP69L4i4gLxj0NMb1jcg/viewform'),
}

# ── Translations (YAML, one file per language) ─────────────────────────
TRANS_DIR = os.path.join(os.path.dirname(__file__), 'translations')


# Use libyaml's C loader when available — it parses many times faster than
# the pure-Python loader.
try:
    from yaml import CSafeLoader as _YamlLoader
except ImportError:
    from yaml import SafeLoader as _YamlLoader


def load_translations():
    data = {}
    for code in LANGUAGES:
        path = os.path.join(TRANS_DIR, f'{code}.yaml')
        if os.path.isfile(path):
            with open(path, encoding='utf-8') as f:
                data[code] = yaml.load(f, Loader=_YamlLoader) or {}
    return data


def _yaml_mtime():
    """Newest modification time across all translation files."""
    latest = 0.0
    for code in LANGUAGES:
        path = os.path.join(TRANS_DIR, f'{code}.yaml')
        try:
            latest = max(latest, os.path.getmtime(path))
        except OSError:
            pass
    return latest


TRANSLATIONS = load_translations()
_TRANS_CACHE = {'data': TRANSLATIONS, 'mtime': _yaml_mtime()}


def get_translations():
    """Return parsed translations.

    Production: the dict loaded once at import — no disk I/O per request.
    Debug: reload only when a YAML file actually changed on disk, so editing
    a translation still hot-reloads without re-parsing on every t() call.
    """
    if not app.debug:
        return TRANSLATIONS
    mtime = _yaml_mtime()
    if mtime != _TRANS_CACHE['mtime']:
        _TRANS_CACHE['data'] = load_translations()
        _TRANS_CACHE['mtime'] = mtime
    return _TRANS_CACHE['data']


def translate(key, lang=None):
    """Look up a dotted key (e.g. 'nav.activiteiten').

    Falls back to the default language ('nl') when a key is missing,
    and returns the key itself if it's defined nowhere — so missing
    translations are visible rather than breaking the page.
    """
    lang = lang or get_locale()
    data = get_translations()

    def lookup(tree):
        node = tree
        for part in key.split('.'):
            if isinstance(node, dict) and part in node:
                node = node[part]
            else:
                return None
        return node if isinstance(node, str) else None

    val = lookup(data.get(lang, {}))
    if val is None and lang != 'nl':
        val = lookup(data.get('nl', {}))
    return val if val is not None else key


def get_locale():
    """Resolve the active language.

    Priority:
      1. Explicit choice stored in the session (user clicked the switcher).
      2. Browser's Accept-Language header (first visit, auto-detect).
      3. Default 'nl'.
    """
    if 'lang' in session:
        return session['lang']
    browser_lang = request.accept_languages.best_match(LANGUAGES.keys())
    return browser_lang or 'nl'


# ── Inject language context into every template ───────────────────────
@app.context_processor
def inject_lang():
    return {
        'current_lang': get_locale(),
        'languages': LANGUAGES,
        't': translate,
    }


# ── Language switcher route ───────────────────────────────────────────
@app.route('/set-lang/<lang>')
def set_language(lang):
    if lang in LANGUAGES:
        session['lang'] = lang
    next_url = request.args.get('next') or url_for('index')
    return redirect(next_url)


# ── Pages ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/activiteiten')
def activiteiten():
    return render_template('activiteiten.html')


SERMON_DB_PATH = os.environ.get(
    'SERMON_DB_PATH',
    os.path.join(os.path.dirname(__file__), 'data', 'sermons.db'),
)
TEACHINGS_PER_PAGE = 20

# Lazy-imported so the app still starts when sqlite-vec is unavailable
# (e.g. on macOS Python without extension loading). Search will degrade
# to a SQL LIKE fallback if _semantic_search() raises.
def _semantic_search(query, k):
    from scripts.search import search  # noqa: WPS433
    return search(query, k=k)


def _sermon_db():
    """Open a read-only handle to the sermon DB. Returns None if missing."""
    if not os.path.isfile(SERMON_DB_PATH):
        return None
    conn = sqlite3.connect(f'file:{SERMON_DB_PATH}?mode=ro', uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def _seg_text(sec):
    sec = max(0, int(sec))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def _resolve_title(row, lang):
    """Pick the cleanest title we have, preferring the user's language.

    Order: display_title_<lang> -> display_title_nl -> raw Vimeo title.
    Accepts either a sqlite3.Row or a dict; missing keys fall through.
    """
    def _get(key):
        try:
            v = row[key]
        except (KeyError, IndexError):
            return None
        return v if (v and str(v).strip()) else None
    return _get(f'display_title_{lang}') or _get('display_title_nl') or row['title']


def _translated_snippet(conn, vimeo_id, lang, start_sec, end_sec):
    """Return the matching transcript text in the user's language. Falls back
    to Dutch if no translation exists yet for this segment range."""
    if lang == 'nl':
        rows = conn.execute(
            'SELECT text FROM segments WHERE vimeo_id = ? AND start_sec < ? AND end_sec > ? '
            'ORDER BY start_sec',
            (vimeo_id, end_sec, start_sec),
        ).fetchall()
    else:
        rows = conn.execute(
            '''SELECT t.text FROM translations t
               JOIN segments s ON s.id = t.segment_id
               WHERE s.vimeo_id = ? AND t.lang = ?
                 AND s.start_sec < ? AND s.end_sec > ?
               ORDER BY s.start_sec''',
            (vimeo_id, lang, end_sec, start_sec),
        ).fetchall()
    return ' '.join(r['text'] for r in rows).strip()


@app.route('/teachings')
def teachings():
    conn = _sermon_db()
    if conn is None:
        return render_template('teachings.html', videos=[], total=0,
                               page=1, pages=1, q='', results=None)
    try:
        page = max(1, int(request.args.get('page', 1)))
        offset = (page - 1) * TEACHINGS_PER_PAGE
        total = conn.execute(
            "SELECT COUNT(*) FROM videos WHERE transcript_status = 'done'"
        ).fetchone()[0]
        rows = conn.execute(
            '''SELECT vimeo_id, title, thumbnail_url, published_at, speaker, duration_sec,
                      display_title_nl, display_title_en, display_title_fr, display_title_es
               FROM videos
               WHERE transcript_status = 'done'
               ORDER BY published_at DESC
               LIMIT ? OFFSET ?''',
            (TEACHINGS_PER_PAGE, offset),
        ).fetchall()
        lang = get_locale()
        videos = []
        for r in rows:
            v = dict(r)
            v['display_title'] = _resolve_title(r, lang)
            v['duration_label'] = _seg_text(v['duration_sec'] or 0)
            videos.append(v)
        pages = max(1, (total + TEACHINGS_PER_PAGE - 1) // TEACHINGS_PER_PAGE)
        return render_template('teachings.html',
                               videos=videos, total=total, page=page, pages=pages,
                               q='', results=None)
    finally:
        conn.close()


@app.route('/teachings/<vimeo_id>')
def teaching(vimeo_id):
    conn = _sermon_db()
    if conn is None:
        abort(404)
    try:
        row = conn.execute(
            '''SELECT vimeo_id, title, description, thumbnail_url, published_at,
                      speaker, duration_sec, unlisted_hash,
                      display_title_nl, display_title_en, display_title_fr, display_title_es
               FROM videos WHERE vimeo_id = ? AND transcript_status = 'done' ''',
            (vimeo_id,),
        ).fetchone()
        if not row:
            abort(404)
        video = dict(row)
        video['display_title'] = _resolve_title(row, get_locale())
        video['duration_label'] = _seg_text(video['duration_sec'] or 0)
        try:
            start = max(0, int(request.args.get('t', 0)))
        except ValueError:
            start = 0

        # Fetch a signed MP4 URL for native HTML5 playback. If Vimeo is
        # unavailable or the video has no progressive file (rare on Pro
        # accounts), fall back to the iframe embed so the page still works.
        play_url = None
        if os.environ.get('VIMEO_TOKEN'):
            try:
                from scripts.vimeo_client import get_play_url  # noqa: WPS433
                play_url = get_play_url(vimeo_id)
            except Exception as exc:
                app.logger.warning('vimeo play url fetch failed for %s: %s', vimeo_id, exc)

        # Languages we actually generated subtitles for; the template renders
        # a <track> for each existing VTT file.
        sub_dir = os.path.join(BRAND_DIR, 'assets', 'subtitles')
        subtitle_langs = [
            code for code in LANGUAGES
            if os.path.isfile(os.path.join(sub_dir, f'{vimeo_id}.{code}.vtt'))
        ]

        return render_template(
            'teaching.html',
            video=video,
            start_t=start,
            play_url=play_url,
            subtitle_langs=subtitle_langs,
        )
    finally:
        conn.close()


@app.route('/teachings/search')
def teachings_search():
    q = (request.args.get('q') or '').strip()
    lang = get_locale()
    if not q:
        return jsonify({'query': '', 'lang': lang, 'hits': []})

    if not os.path.isfile(SERMON_DB_PATH):
        return jsonify({'query': q, 'lang': lang, 'hits': []})

    hits_out = []
    used_semantic = False
    try:
        if not os.environ.get('OPENAI_API_KEY'):
            raise RuntimeError('OPENAI_API_KEY not set; using keyword fallback')
        sem_hits = _semantic_search(q, 12)
        used_semantic = True
        conn = sqlite3.connect(f'file:{SERMON_DB_PATH}?mode=ro', uri=True)
        conn.row_factory = sqlite3.Row
        try:
            for h in sem_hits:
                snippet = _translated_snippet(
                    conn, h.vimeo_id, lang, h.start_sec, h.end_sec,
                ) or h.snippet
                title_row = conn.execute(
                    '''SELECT title, display_title_nl, display_title_en,
                              display_title_fr, display_title_es
                       FROM videos WHERE vimeo_id = ?''',
                    (h.vimeo_id,),
                ).fetchone()
                display_title = _resolve_title(title_row, lang) if title_row else h.title
                hits_out.append({
                    'vimeo_id':      h.vimeo_id,
                    'title':         display_title,
                    'thumbnail_url': h.thumbnail_url,
                    'speaker':       h.speaker,
                    'published_at':  h.published_at,
                    'start_sec':     int(h.start_sec),
                    'start_label':   _seg_text(h.start_sec),
                    'snippet':       snippet[:400],
                    'url':           url_for('teaching', vimeo_id=h.vimeo_id, t=int(h.start_sec)),
                })
        finally:
            conn.close()
    except Exception as exc:
        # Fallback: title + description LIKE search. Loses meaning-matching
        # but keeps the page usable when sqlite-vec is unavailable or the
        # embedding call fails (no API key, network error, etc.).
        app.logger.warning('teachings_search: semantic path failed (%s); '
                           'falling back to keyword', exc)
        conn = sqlite3.connect(f'file:{SERMON_DB_PATH}?mode=ro', uri=True)
        conn.row_factory = sqlite3.Row
        try:
            like = f'%{q}%'
            rows = conn.execute(
                '''SELECT vimeo_id, title, description, thumbnail_url, speaker, published_at,
                          display_title_nl, display_title_en, display_title_fr, display_title_es
                   FROM videos
                   WHERE transcript_status = 'done'
                     AND (title LIKE ? OR description LIKE ?
                          OR display_title_nl LIKE ? OR display_title_en LIKE ?
                          OR display_title_fr LIKE ? OR display_title_es LIKE ?)
                   ORDER BY published_at DESC LIMIT 12''',
                (like, like, like, like, like, like),
            ).fetchall()
            for r in rows:
                hits_out.append({
                    'vimeo_id':      r['vimeo_id'],
                    'title':         _resolve_title(r, lang),
                    'thumbnail_url': r['thumbnail_url'],
                    'speaker':       r['speaker'],
                    'published_at':  r['published_at'],
                    'start_sec':     0,
                    'start_label':   '',
                    'snippet':       (r['description'] or '')[:400],
                    'url':           url_for('teaching', vimeo_id=r['vimeo_id']),
                })
        finally:
            conn.close()

    return jsonify({'query': q, 'lang': lang,
                    'mode': 'semantic' if used_semantic else 'keyword',
                    'hits': hits_out})


@app.route('/vimeo-webhook', methods=['POST'])
def vimeo_webhook():
    """Vimeo posts here when a new video is uploaded. We verify the HMAC
    signature, then enqueue the video id for the next cron run to pick up.

    Vimeo sends X-Vimeo-Signature: sha256=<hex>, signed with the secret set
    when the webhook was created. See https://developer.vimeo.com/api/webhooks.
    """
    secret = os.environ.get('VIMEO_WEBHOOK_SECRET')
    if not secret:
        abort(500, 'VIMEO_WEBHOOK_SECRET not configured')

    signature = request.headers.get('X-Vimeo-Signature', '')
    expected = 'sha256=' + hmac.new(
        secret.encode(), request.get_data(), hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        abort(401, 'bad signature')

    payload = request.get_json(silent=True) or {}
    # Vimeo's video.upload event payload puts the URI on data.video.uri.
    video = (payload.get('data') or {}).get('video') or {}
    uri = video.get('uri') or ''
    vimeo_id = uri.rsplit('/', 1)[-1] if uri else None
    if not vimeo_id:
        return jsonify({'ok': False, 'reason': 'no video id in payload'}), 400

    # Use the same DB the cron job will read.
    conn = sqlite3.connect(SERMON_DB_PATH)
    try:
        conn.execute(
            '''CREATE TABLE IF NOT EXISTS queue (
                 vimeo_id TEXT PRIMARY KEY,
                 enqueued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 attempts INTEGER NOT NULL DEFAULT 0,
                 last_error TEXT)'''
        )
        conn.execute(
            'INSERT OR IGNORE INTO queue (vimeo_id) VALUES (?)', (vimeo_id,),
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({'ok': True, 'queued': vimeo_id})


@app.route('/live')
def live():
    return render_template('live.html', live_embed_url=LIVE_EMBED_URL)


@app.route('/kampen')
def kampen():
    active = request.args.get('camp', 'kinder')
    if active not in ('kinder', 'jong', 'realmen'):
        active = 'kinder'
    return render_template('kampen.html', camp_forms=CAMP_FORMS, active_camp=active)


@app.route('/nieuwbouw')
def nieuwbouw():
    return render_template('nieuwbouw.html')


@app.route('/geven')
def geven():
    return render_template('geven.html')


@app.route('/anbi')
def anbi():
    return render_template('anbi.html')


@app.route('/contact')
def contact():
    return render_template('contact.html')


# ── Dev server ────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
