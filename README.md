# Train Schedule BD

Offline, bilingual (English / বাংলা) Bangladesh Railway intercity train schedule explorer and trip planner. Pure static site — no server, no network requests, no account.

## Problem

Bangladesh Railway timetables are scattered across booking portals and fan sites, often in English only, and checking "does this train run today?" means cross-referencing a weekly off-day against the calendar by hand. Train Schedule BD puts the 39 intercity / mail / commuter services between Dhaka, Chattogram, Sylhet, Khulna and Rajshahi in one offline page, with a per-date "Runs today / Off today" badge, a live departure countdown for saved trips, and JSON backup / restore.

## Features

- **Find Trains** — From/To selects (5 stations), travel date, swap button. Results sorted by departure with train number + bilingual name, dep → arr times, duration, type badge, off-day, and a "Runs today" (green) / "Off today" (red) badge computed from the date's weekday. "Save trip" adds the service to My Trips. Inline errors for same-station picks and empty routes.
- **All Trains** — search by name or number (English and Bengali), corridor filter chips (All / Dhaka–Chattogram / Dhaka–Sylhet / Dhaka–Khulna / Dhaka–Rajshahi), full list of 39 services with a live count.
- **My Trips** — add a trip (service grouped by route, date, seat class, optional PNR + note) with validation (date required, not in the past). Saved trips show a live countdown to departure, updating every second ("Departed" after the time passes), and can be deleted. Persists in `localStorage`.
- **Data** — JSON export (download), import (file picker or pasted text) with strict validation (wrong app, version, unknown service or bad shape rejected, existing data left intact), typed-DELETE erase-all, and a Sources & accuracy box.
- **Bilingual** — EN / বাংলা toggle, persisted; Bengali digits throughout in BN mode.
- **Deterministic testing** — `?asof=YYYY-MM-DD` pins "today" (and "now" at 08:00) so every date-dependent behaviour is reproducible.
- **Offline** — zero network requests at runtime; works from `file://` or any static host.

## Dataset & sources

39 services from Bangladesh Railway **Time Table No. 54 (effective 10 Mar 2025)**, cross-checked in November 2026 against trainjatri, insidedhaka, websylhet, albangladesh, gojatra, amadertrain and bdtraineticket. Where those sources disagree, the value used and the conflict are recorded in [DATA_NOTES.md](DATA_NOTES.md) and summarised in [TEST_RESULTS.md](TEST_RESULTS.md).

Per-route counts: Dhaka ↔ Chattogram 10 + 4, Dhaka ↔ Sylhet 5 + 5, Dhaka ↔ Khulna 3 + 2, Dhaka ↔ Rajshahi 5 + 5 = 39.

**No fares are shown anywhere** — fares were not verified. No live running status is shown either; times are the published timetable.

## Stack

- Vanilla HTML + CSS + JavaScript, no dependencies, no build step.
- `logic.js` — pure, node-testable functions (durations, off-day logic, search, trip/import validation, countdown math) plus the dataset.
- `i18n.js` — EN / BN strings, Bengali digit conversion.
- `app.js` — UI wiring, `localStorage` persistence, countdown timer.
- Sources are pure ASCII: all Bengali text is stored as `\uXXXX` escapes (`grep -P '[^\x00-\x7F]'` returns zero matches in `.js` / `.css` / `.html`).

## Install / dev

No install step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Testing

```sh
node --test tests/logic.test.js   # 9 node tests (durations, off-days, route counts, validation, countdown)
node tests/smoke.js              # 63 headless-Chrome (raw CDP) checks incl. UI flows, i18n, 390px, offline
```

Both suites pass. Real counts and hand-verified values are in [TEST_RESULTS.md](TEST_RESULTS.md).

## Deployment

GitHub Pages: push the repo and enable Pages on the default branch (or drop the folder on any static host). No build step, no environment variables.

## Limitations

- Timetable accuracy: times are from Time Table No. 54 as reported by third-party sites in Nov 2026; several services have conflicting times/off-days across sources (listed in TEST_RESULTS.md). **Confirm on eticket.railway.gov.bd before travelling.**
- No live running status, delays, platform or seat-availability data.
- No fares and no booking — this app never sells tickets.
- Only the five major stations and the 39 listed services; the Jahanabad Express Khulna → Dhaka return direction is omitted because its time was not verified.
- Countdowns use the device clock; the app is not affiliated with Bangladesh Railway.

## Status

Complete MVP. All 9 node tests and 63 smoke checks pass; dataset integrity verified (39 services, unique ids, valid times).
