# Time Traveler

Explore any year in history. Time Traveler pulls structured content from Wikipedia to show notable Events, Births, and Deaths for a selected year with a clean, fast UI.

[![App Image](https://hc-cdn.hel1.your-objectstorage.com/s/v3/4145627141f6395d6a844c93eead3d0dd366823f_screenshot_2025-08-10_194102.png)]

##Link


## Features

- Year exploration with Wikipedia summary (title, blurb, thumbnail when available)
- Sections: Events • Births • Deaths
- Per‑section search filters with live counts and highlight
- Show more/less per section, Expand/Collapse All, and per‑section collapse
- Sticky sub‑navigation with section counts and active section tracking
- Keyboard shortcuts: ←/→ previous/next year • E expand all • C collapse all • / focus search • T back to top
- Command palette (Ctrl+K) for quick actions
- Favorites (localStorage) with a simple modal
- Compare two years side‑by‑side: `/compare/<y1>/<y2>`
- Random year: `/random`
- Export JSON/CSV: `/export/<year>.json` and `/export/<year>.csv`
- Simple JSON API: `/api/year/<year>`
- Responsive layout, dark/light theme toggle, compact mode, loading overlay, and scroll progress

## Project structure

```
app.py
requirements.txt
static/
  css/
    style.css
  js/
    app.js
templates/
  base.html
  index.html
  results.html
```

## Getting started

Prerequisites:
- Python 3.8+
- pip

Install dependencies:

- Windows PowerShell
  - python -m venv .venv
  - .\.venv\Scripts\Activate.ps1
  - pip install -r requirements.txt

Run the app:
- python app.py
- Open http://127.0.0.1:5000

Notes:
- The app sets a friendly User‑Agent per Wikimedia policy.
- Optional HTTP caching via `requests-cache` (24h) if available.
- The development server is configured with `use_reloader=False` to avoid a Windows issue where the parent process exits immediately.

## Endpoints

- GET `/` — Home
- POST `/` — Submit year form
- GET `/year/<int:year>` — Year details
- GET `/api/year/<int:year>` — JSON for the year (summary + sections)
- GET `/compare/<int:y1>/<int:y2>` — Compare two years
- GET `/random` — Redirect to a random year
- GET `/export/<int:year>.json` — Download JSON
- GET `/export/<int:year>.csv` — Download CSV (columns: section,item)

## Data and caching

- Data is fetched from Wikipedia using the MediaWiki API and the REST summary API.
- In‑memory caching via `functools.lru_cache` reduces repeat lookups.
- If `requests-cache` is installed, outbound HTTP calls are cached on disk for 24 hours.

## Keyboard shortcuts

- ← / → — Previous / Next year
- E — Expand all lists
- C — Collapse all lists
- / — Focus first filter
- T — Back to top
- Ctrl+K — Open command palette

## Troubleshooting

- Blank page or no items: verify internet access and try another year (some pages may have sparse sections). Check console/network for Wikipedia errors.
- Stuck loading overlay: refresh; the overlay automatically hides on load and via a safety timeout.
- Windows: if the terminal shows the server starting but nothing stays running, ensure you are using `python app.py` (reloader is disabled in code).

