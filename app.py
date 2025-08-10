from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import requests, re
from bs4 import BeautifulSoup
from dateutil.relativedelta import relativedelta
from datetime import datetime
from functools import lru_cache
from random import randint

app = Flask(__name__)
app.secret_key = "dev-key"  # replace in prod

# Optional: cache outbound HTTP calls to Wikipedia for 24h (if requests-cache is available)
try:
    import requests_cache  # type: ignore
    requests_cache.install_cache("wiki_cache", expire_after=60*60*24)
except Exception:
    requests_cache = None

# Friendly User-Agent per Wikimedia policy
HTTP_HEADERS = {
    "User-Agent": "TimeTraveler/1.0 (+https://github.com/Aral-167/time_traveler)"
}

WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKI_REST_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"

@lru_cache(maxsize=512)
def cached_year_data(year):
    return {
        "summary": get_year_summary(year),
        "sections": get_year_section_items(year)
    }

def get_year_page_title(year: int) -> str:
    # Most years are just "1999" etc.
    return str(year)

def _wiki_parse_sections(title: str):
    try:
        r = requests.get(WIKI_API, params={
            "action": "parse",
            "page": title,
            "prop": "sections",
            "format": "json"
        }, headers=HTTP_HEADERS, timeout=15)
        r.raise_for_status()
        data = r.json()
        return data.get("parse", {}).get("sections", [])
    except Exception:
        return []

def _wiki_parse_section_html(title: str, index: int) -> str:
    try:
        r = requests.get(WIKI_API, params={
            "action": "parse",
            "page": title,
            "prop": "text",
            "section": index,
            "format": "json"
        }, headers=HTTP_HEADERS, timeout=15)
        r.raise_for_status()
        data = r.json()
        html = data.get("parse", {}).get("text", {}).get("*", "")
        return html
    except Exception:
        return ""

def _extract_list_items(html: str, limit=15):
    soup = BeautifulSoup(html, "html.parser")
    items = []
    for ul in soup.select("ul"):
        for li in ul.find_all("li", recursive=False):  # Only direct children
            # Strip references like [1], [2]
            txt = re.sub(r"\s*\[\d+\]\s*", "", li.get_text(" ", strip=True))
            if len(txt) > 0:
                items.append(txt)
            if len(items) >= limit:
                return items
    return items

def get_year_section_items(year: int, section_names=("Events", "Births", "Deaths")):
    title = get_year_page_title(year)
    sections = _wiki_parse_sections(title)
    # Map desired section names to their index on the page
    found = {}
    for name in section_names:
        found[name] = None
    for s in sections:
        s_name = s.get("line", "")
        for wanted in section_names:
            # Some pages have subsections like "January–March" under Events; we grab top section.
            if s_name.lower() == wanted.lower() and s.get("toclevel", 0) == 1:
                found[wanted] = int(s["index"])
    results = {}
    for k, idx in found.items():
        if idx is None:
            results[k] = []
            continue
        html = _wiki_parse_section_html(title, idx)
        items = _extract_list_items(html, limit=20)
        results[k] = items
    return results

def get_year_summary(year: int):
    # Quick blurb for hero section
    title = get_year_page_title(year)
    try:
        r = requests.get(WIKI_REST_SUMMARY.format(title), headers=HTTP_HEADERS, timeout=15)
        if r.status_code != 200:
            return None
        j = r.json()
        return {
            "title": j.get("title"),
            "description": j.get("extract"),
            "thumbnail": (j.get("thumbnail") or {}).get("source")
        }
    except Exception:
        return None

def clamp_year(y: int):
    # Wikipedia years generally 1..present; keep it sensible
    now = datetime.utcnow().year
    return max(1, min(y, now))

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            year = int(request.form.get("year", "").strip())
        except ValueError:
            flash("Please enter a valid year (e.g., 1991).")
            return redirect(url_for("index"))
        year = clamp_year(year)
        return redirect(url_for("results", year=year))
    # Some fun presets: random-ish suggestions
    presets = [1969, 1989, 1991, 2001, 2016]
    return render_template("index.html", presets=presets)

@app.route("/year/<int:year>")
def results(year):
    year = clamp_year(year)
    summary = get_year_summary(year)
    sections = get_year_section_items(year)
    # Provide friendly fallbacks
    for k in ("Events", "Births", "Deaths"):
        sections.setdefault(k, [])
    return render_template("results.html", year=year, summary=summary, sections=sections)

@app.route("/api/year/<int:year>")
def api_year(year):
    year = clamp_year(year)
    data = cached_year_data(year)
    return jsonify({
        "year": year,
        "summary": data.get("summary"),
        "sections": data.get("sections", {})
    })

@app.route("/compare/<int:y1>/<int:y2>")
def compare(y1, y2):
    y1 = clamp_year(y1)
    y2 = clamp_year(y2)
    d1 = cached_year_data(y1)
    d2 = cached_year_data(y2)
    s1 = (d1.get("sections") or {}).copy()
    s2 = (d2.get("sections") or {}).copy()
    for k in ("Events", "Births", "Deaths"):
        s1.setdefault(k, [])
        s2.setdefault(k, [])
    return render_template(
        "compare.html",
        y1=y1,
        y2=y2,
        sum1=d1.get("summary"),
        sum2=d2.get("summary"),
        s1=s1,
        s2=s2,
    )

@app.route("/random")
def random_year():
    y = randint(1, datetime.utcnow().year)
    return redirect(url_for('results', year=y))

if __name__ == "__main__":
    app.run(debug=True)
