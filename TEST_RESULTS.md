# TEST_RESULTS.md — train-schedule-bd (run #291, 11:00 slot, 2026-11-10)

## Suites run (real, not invented)

| Suite | Command | Result |
|---|---|---|
| Node logic tests | `node --test tests/logic.test.js` | **9/9 pass** |
| Headless-Chrome smoke | `node tests/smoke.js` (raw CDP, headless_shell) | **63/63 checks pass** |
| ASCII-source check | `grep -rP '[^\x00-\x7F]' --include='*.js' --include='*.css' --include='*.html' .` | **0 matches** (exit 1 = no matches) |

## Hand-verified values

- 2026-11-10 is a Tuesday and 2026-11-11 is a Wednesday (verified with `date -d`).
- Durations: 702 Suborno 16:30 → 21:25 = 295 min = 4h 55m; 722 Mahanagar Express
  21:20 → 03:30 (+1d) = 370 min = 6h 10m; 742 Turna 23:15 → 05:15 (+1d) = 360 min = 6h 0m;
  Surma Mail Sylhet → Dhaka 20:20 → 09:55 (+1d) = 815 min = 13h 35m.
- Route counts: Dhaka → Chattogram 10, Chattogram → Dhaka 4, Dhaka → Sylhet 5,
  Sylhet → Dhaka 5, Dhaka → Khulna 3, Khulna → Dhaka 2, Dhaka → Rajshahi 5,
  Rajshahi → Dhaka 5; total 39. Same-station and Sylhet → Khulna both return 0.
- Off-day logic on Tue 2026-11-10: 702 runs (off Mon), 788 runs (off Wed), 814 is off
  (off Tue), 717 is off (off Tue), 759 is off (off Tue). On Wed 2026-11-11: 788 and 815
  are off, 702 runs. All confirmed in the browser smoke run.
- Smoke: Find Dhaka → Chattogram on 2026-11-10 shows exactly 10 cards; search
  "suborno" in All Trains yields 2 rows; Dhaka–Sylhet corridor chip yields 10 rows;
  countdown for 702 on 2026-11-10 from pinned 08:00 reads ~8h 30m; trip persists
  across reload; delete works; past-date trip rejected; export → erase → import
  round-trip restores the trip; wrong-app and unknown-service imports rejected with
  data intact; BN toggle renders Bengali digits and persists; 390px has zero
  horizontal overflow on all four tabs; zero non-file network requests; zero
  console/page errors.

## Repairs made

1. **Logic test — `nextDepartures` expectation (my test, not app code):** I first
   asserted Dhaka after 12:00 returns only the 5 Chattogram-bound services, but
   `nextDepartures` is correctly from-station across all routes. Fixed the
   expectation to the full 13-service list; 759 Padma and 814 Cox's Bazar are
   correctly excluded (both off Tuesdays).
2. **Logic test — empty-result boundary:** asserted no Sylhet departures after
   23:20, but 740 Upaban departs 23:30 and runs on Tuesdays. Moved the boundary
   to 23:50; expectation now correct.
3. **Logic test — `formatDuration` arithmetic:** I wrote 295 min = "5h 25m"; it is
   4h 55m. Fixed the test (the app was right).
4. **Smoke test — pretty-printed JSON:** `exportPayload()` pretty-prints, so
   `"app":"train-schedule-bd"` and `"trips":[]` never appear (spaces after colons).
   Fixed the three assertions to match the pretty format. App code unchanged.
5. **Smoke test — countdown timing:** pinned "now" advances with real elapsed time,
   so the 702 countdown reads 8h 29m by check time, not 8h 30m. Loosened that one
   assertion to accept 29 or 30 minutes.

No app-code bugs were found; all five repairs were wrong expectations in my own
tests. No repair cycle was needed for the application itself.

## Flagged data conflicts (sources disagree — values used are in DATA_NOTES.md)

- Parabat 709 off-day: Mon used vs websylhet Tue.
- Jayantika 717 off-day: Tue used vs amadertrain daily.
- Banalata 791 arrival: 17:45 used vs 18:05 / 17:35 elsewhere.
- Madhumati 755/756 off-day: Sat used vs amadertrain Thu.
- Silk City 754 arrival: 13:10 used vs 13:20 / 13:30 elsewhere.
- Padma 760 arrival: 21:15 used vs 21:25 / 21:45 elsewhere.
- Dhumketu 770 off-day: Wed used vs older Mon.
- Mahanagar Express 721 arrival: 19:10 used vs older 19:30.
- Turna 741 23:00 → 05:25 taken from an older source; needs re-check.
- Suborno 702 arrival: 21:25 used vs Wikipedia 21:50.
- Sonar Bangla 787 arrival: 21:55 used vs minciter 22:10.
- Jahanabad Express Khulna → Dhaka return direction: not verified in any checked
  source, so omitted entirely rather than guessed.

## Notes

- Sources in `.js` / `.css` / `.html` are pure ASCII; all Bengali text is stored as
  `\uXXXX` escapes (Bengali was authored inline, then escaped programmatically).
  The `.md` docs are ASCII too (train names in Latin transliteration); the only
  Bengali script in the build lives as escapes inside `logic.js` / `i18n.js`.
- `?asof=YYYY-MM-DD` pins today (and now at 08:00 local) for deterministic tests.
- No fares, no live running status, no booking — by design (see README).
