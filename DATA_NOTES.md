# DATA_NOTES.md — per-service source notes (train-schedule-bd)

Dataset: Bangladesh Railway Time Table No. 54 (effective 10 Mar 2025), as reported by
2026 sources: trainjatri, insidedhaka, websylhet, albangladesh, gojatra, amadertrain,
bdtraineticket. Where sources disagreed, the value used is the one from the most
recent / most consistently reported source; the conflict is listed below and in
TEST_RESULTS.md. No fares anywhere (not verified).

Format: `no — Name (from → to) dep → arr [off-day] — source note`.

## Dhaka → Chattogram (10)

- 815 — Parjatak Express, 06:15 → 11:20, off Wed. Dhaka → Cox's Bazar via Chattogram;
  listed here as a Chattogram service with note "Continues to Cox's Bazar".
- 788 — Sonar Bangla, 07:00 → 11:55, off Wed. Times consistent across sources.
- 704 — Mahanagar Provati, 07:45 → 13:35, daily.
- (unnumbered) — Karnaphuli Commuter, 08:45 → 17:50, daily, type Commuter.
- 802 — Chattala Express, 14:15 → 20:30, off Fri.
- 702 — Suborno Express, 16:30 → 21:25, off Mon. CONFLICT: arrival 21:25 used;
  Wikipedia lists 21:50.
- 722 — Mahanagar Express, 21:20 → 03:30 (+1d), off Sun.
- 814 — Cox's Bazar Express, 23:00 → 03:40 (+1d), off Tue. Continues to Cox's Bazar.
- 742 — Turna Express, 23:15 → 05:15 (+1d), daily.
- (unnumbered) — Chattogram Mail, 23:45 → 07:10 (+1d), daily, type Mail.

## Chattogram → Dhaka (4)

- 701 — Suborno Express, 07:00 → 11:55, off Mon.
- 721 — Mahanagar Express, 12:30 → 19:10, off Sun. CONFLICT: arrival 19:10 used;
  older listings show 19:30.
- 787 — Sonar Bangla Express, 17:00 → 21:55, off Tue. CONFLICT: arrival 21:55 used;
  minciter lists 22:10.
- 741 — Turna Express, 23:00 → 05:25 (+1d), daily. CONFLICT: 23:00 → 05:25 taken from
  an older source; re-check before relying on it.

## Dhaka → Sylhet (5)

- 709 — Parabat Express, 06:30 → 13:00, off Mon. CONFLICT: off-day Mon used;
  websylhet lists Tue.
- 717 — Jayantika Express, 11:15 → 19:00, off Tue. CONFLICT: off-day Tue used;
  amadertrain lists it as daily.
- 773 — Kalni Express, 14:55 → 21:30, off Fri.
- (unnumbered) — Surma Mail, 21:00 → 09:30 (+1d), daily, type Mail.
- 739 — Upaban Express, 22:00 → 05:00 (+1d), off Wed.

## Sylhet → Dhaka (5)

- 774 — Kalni Express, 06:15 → 12:55, off Fri.
- 718 — Jayantika Express, 12:00 → 19:15, off Thu.
- 710 — Parabat Express, 16:00 → 22:40, off Mon.
- (unnumbered) — Surma Mail, 20:20 → 09:55 (+1d), daily, type Mail.
- 740 — Upaban Express, 23:30 → 05:40 (+1d), off Mon.

## Dhaka → Khulna (3)

- 726 — Sundarban Express, 08:00 → 15:40, off Wed.
- 764 — Chitra Express, 19:30 → 04:40 (+1d), off Sun.
- 826 — Jahanabad Express, 20:00 → 23:45, off Mon. OMITTED: the Khulna → Dhaka
  return direction — its time was not verified in any checked source, so it is not
  included rather than guessed.

## Khulna → Dhaka (2)

- 763 — Chitra Express, 09:00 → 18:05, off Sun.
- 725 — Sundarban Express, 21:45 → 05:10 (+1d), off Tue.

## Dhaka → Rajshahi (5)

- 769 — Dhumketu Express, 06:00 → 11:40, off Thu.
- 791 — Banalata Express, 13:30 → 17:45, off Fri. CONFLICT: arrival 17:45 used;
  other listings show 18:05 / 17:35.
- 753 — Silk City Express, 14:30 → 20:20, off Sun.
- 755 — Madhumati Express, 15:00 → 22:30, off Sat. CONFLICT: off-day Sat used;
  amadertrain lists Thu.
- 759 — Padma Express, 22:45 → 04:00 (+1d), off Tue.

## Rajshahi → Dhaka (5)

- 756 — Madhumati Express, 06:40 → 14:00, off Sat. CONFLICT: off-day Sat used;
  amadertrain lists Thu.
- 792 — Banalata Express, 07:00 → 11:35, off Fri.
- 754 — Silk City Express, 07:40 → 13:10, off Sun. CONFLICT: arrival 13:10 used;
  other listings show 13:20 / 13:30.
- 760 — Padma Express, 16:00 → 21:15, off Tue. CONFLICT: arrival 21:15 used;
  other listings show 21:25 / 21:45.
- 770 — Dhumketu Express, 23:20 → 04:45 (+1d), off Wed. CONFLICT: off-day Wed used;
  older listings show Mon.
