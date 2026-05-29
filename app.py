from flask import Flask, render_template, session, redirect, request, url_for
import os
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


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/activiteiten')
def activiteiten():
    return render_template('activiteiten.html')


@app.route('/teachings')
def teachings():
    return render_template('teachings.html')


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
