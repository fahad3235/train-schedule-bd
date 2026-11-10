// train-schedule-bd -- pure logic (node + browser).
// Dataset: Bangladesh Railway Time Table No. 54 (effective 10 Mar 2025),
// as reported by 2026 sources (trainjatri, insidedhaka, websylhet,
// albangladesh, gojatra, amadertrain, bdtraineticket). See DATA_NOTES.md.
// No fares anywhere: fares were not verified. No live running status.
(function (root) {
  'use strict';

  var STATIONS = [
    { id: 'dhaka', name_en: 'Dhaka', name_bn: '\u09a2\u09be\u0995\u09be' },
    { id: 'chattogram', name_en: 'Chattogram', name_bn: '\u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae' },
    { id: 'sylhet', name_en: 'Sylhet', name_bn: '\u09b8\u09bf\u09b2\u09c7\u099f' },
    { id: 'khulna', name_en: 'Khulna', name_bn: '\u0996\u09c1\u09b2\u09a8\u09be' },
    { id: 'rajshahi', name_en: 'Rajshahi', name_bn: '\u09b0\u09be\u099c\u09b6\u09be\u09b9\u09c0' },
  ];

  // offDay: 0=Sun .. 6=Sat, null = daily. nextDay: arrival is next calendar day.
  var SERVICES = [
    // ---- Dhaka -> Chattogram (10) ----
    { id: '815', no: '815', name_en: 'Parjatak Express', name_bn: '\u09aa\u09be\u09b0\u099c\u09be\u09a4\u0995 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '06:15', arr: '11:20', nextDay: false, offDay: 3, type: 'InterCity', note_en: "Continues to Cox's Bazar", note_bn: '\u0995\u0995\u09cd\u09b8\u09ac\u09be\u099c\u09be\u09b0 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09af\u09be\u09af\u09bc' },
    { id: '788', no: '788', name_en: 'Sonar Bangla', name_bn: '\u09b8\u09cb\u09a8\u09be\u09b0 \u09ac\u09be\u0982\u09b2\u09be', from: 'dhaka', to: 'chattogram', dep: '07:00', arr: '11:55', nextDay: false, offDay: 3, type: 'InterCity' },
    { id: '704', no: '704', name_en: 'Mahanagar Provati', name_bn: '\u09ae\u09b9\u09be\u09a8\u0997\u09b0 \u09aa\u09cd\u09b0\u09ad\u09be\u09a4\u09c0', from: 'dhaka', to: 'chattogram', dep: '07:45', arr: '13:35', nextDay: false, offDay: null, type: 'InterCity' },
    { id: 'karnaphuli-commuter', no: null, name_en: 'Karnaphuli Commuter', name_bn: '\u0995\u09b0\u09cd\u09a3\u09ab\u09c1\u09b2\u09c0 \u0995\u09ae\u09bf\u0989\u099f\u09be\u09b0', from: 'dhaka', to: 'chattogram', dep: '08:45', arr: '17:50', nextDay: false, offDay: null, type: 'Commuter' },
    { id: '802', no: '802', name_en: 'Chattala Express', name_bn: '\u099a\u099f\u09cd\u099f\u09b2\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '14:15', arr: '20:30', nextDay: false, offDay: 5, type: 'InterCity' },
    { id: '702', no: '702', name_en: 'Suborno Express', name_bn: '\u09b8\u09c1\u09ac\u09b0\u09cd\u09a3 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '16:30', arr: '21:25', nextDay: false, offDay: 1, type: 'InterCity' },
    { id: '722', no: '722', name_en: 'Mahanagar Express', name_bn: '\u09ae\u09b9\u09be\u09a8\u0997\u09b0 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '21:20', arr: '03:30', nextDay: true, offDay: 0, type: 'InterCity' },
    { id: '814', no: '814', name_en: "Cox's Bazar Express", name_bn: '\u0995\u0995\u09cd\u09b8\u09ac\u09be\u099c\u09be\u09b0 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '23:00', arr: '03:40', nextDay: true, offDay: 2, type: 'InterCity', note_en: "Continues to Cox's Bazar", note_bn: '\u0995\u0995\u09cd\u09b8\u09ac\u09be\u099c\u09be\u09b0 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09af\u09be\u09af\u09bc' },
    { id: '742', no: '742', name_en: 'Turna Express', name_bn: '\u09a4\u09c2\u09b0\u09cd\u09a3\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'chattogram', dep: '23:15', arr: '05:15', nextDay: true, offDay: null, type: 'InterCity' },
    { id: 'chattogram-mail', no: null, name_en: 'Chattogram Mail', name_bn: '\u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae \u09ae\u09c7\u0987\u09b2', from: 'dhaka', to: 'chattogram', dep: '23:45', arr: '07:10', nextDay: true, offDay: null, type: 'Mail' },
    // ---- Chattogram -> Dhaka (4) ----
    { id: '701', no: '701', name_en: 'Suborno Express', name_bn: '\u09b8\u09c1\u09ac\u09b0\u09cd\u09a3 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'chattogram', to: 'dhaka', dep: '07:00', arr: '11:55', nextDay: false, offDay: 1, type: 'InterCity' },
    { id: '721', no: '721', name_en: 'Mahanagar Express', name_bn: '\u09ae\u09b9\u09be\u09a8\u0997\u09b0 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'chattogram', to: 'dhaka', dep: '12:30', arr: '19:10', nextDay: false, offDay: 0, type: 'InterCity' },
    { id: '787', no: '787', name_en: 'Sonar Bangla Express', name_bn: '\u09b8\u09cb\u09a8\u09be\u09b0 \u09ac\u09be\u0982\u09b2\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'chattogram', to: 'dhaka', dep: '17:00', arr: '21:55', nextDay: false, offDay: 2, type: 'InterCity' },
    { id: '741', no: '741', name_en: 'Turna Express', name_bn: '\u09a4\u09c2\u09b0\u09cd\u09a3\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'chattogram', to: 'dhaka', dep: '23:00', arr: '05:25', nextDay: true, offDay: null, type: 'InterCity' },
    // ---- Dhaka -> Sylhet (5) ----
    { id: '709', no: '709', name_en: 'Parabat Express', name_bn: '\u09aa\u09be\u09b0\u09be\u09ac\u09a4 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'sylhet', dep: '06:30', arr: '13:00', nextDay: false, offDay: 1, type: 'InterCity' },
    { id: '717', no: '717', name_en: 'Jayantika Express', name_bn: '\u099c\u09af\u09bc\u09a8\u09cd\u09a4\u09bf\u0995\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'sylhet', dep: '11:15', arr: '19:00', nextDay: false, offDay: 2, type: 'InterCity' },
    { id: '773', no: '773', name_en: 'Kalni Express', name_bn: '\u0995\u09be\u09b2\u09a8\u09c0 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'sylhet', dep: '14:55', arr: '21:30', nextDay: false, offDay: 5, type: 'InterCity' },
    { id: 'surma-mail-dhaka', no: null, name_en: 'Surma Mail', name_bn: '\u09b8\u09c1\u09b0\u09ae\u09be \u09ae\u09c7\u0987\u09b2', from: 'dhaka', to: 'sylhet', dep: '21:00', arr: '09:30', nextDay: true, offDay: null, type: 'Mail' },
    { id: '739', no: '739', name_en: 'Upaban Express', name_bn: '\u0989\u09aa\u09ac\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'sylhet', dep: '22:00', arr: '05:00', nextDay: true, offDay: 3, type: 'InterCity' },
    // ---- Sylhet -> Dhaka (5) ----
    { id: '774', no: '774', name_en: 'Kalni Express', name_bn: '\u0995\u09be\u09b2\u09a8\u09c0 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'sylhet', to: 'dhaka', dep: '06:15', arr: '12:55', nextDay: false, offDay: 5, type: 'InterCity' },
    { id: '718', no: '718', name_en: 'Jayantika Express', name_bn: '\u099c\u09af\u09bc\u09a8\u09cd\u09a4\u09bf\u0995\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'sylhet', to: 'dhaka', dep: '12:00', arr: '19:15', nextDay: false, offDay: 4, type: 'InterCity' },
    { id: '710', no: '710', name_en: 'Parabat Express', name_bn: '\u09aa\u09be\u09b0\u09be\u09ac\u09a4 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'sylhet', to: 'dhaka', dep: '16:00', arr: '22:40', nextDay: false, offDay: 1, type: 'InterCity' },
    { id: 'surma-mail-sylhet', no: null, name_en: 'Surma Mail', name_bn: '\u09b8\u09c1\u09b0\u09ae\u09be \u09ae\u09c7\u0987\u09b2', from: 'sylhet', to: 'dhaka', dep: '20:20', arr: '09:55', nextDay: true, offDay: null, type: 'Mail' },
    { id: '740', no: '740', name_en: 'Upaban Express', name_bn: '\u0989\u09aa\u09ac\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'sylhet', to: 'dhaka', dep: '23:30', arr: '05:40', nextDay: true, offDay: 1, type: 'InterCity' },
    // ---- Dhaka -> Khulna (3) ----
    { id: '726', no: '726', name_en: 'Sundarban Express', name_bn: '\u09b8\u09c1\u09a8\u09cd\u09a6\u09b0\u09ac\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'khulna', dep: '08:00', arr: '15:40', nextDay: false, offDay: 3, type: 'InterCity' },
    { id: '764', no: '764', name_en: 'Chitra Express', name_bn: '\u099a\u09bf\u09a4\u09cd\u09b0\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'khulna', dep: '19:30', arr: '04:40', nextDay: true, offDay: 0, type: 'InterCity' },
    { id: '826', no: '826', name_en: 'Jahanabad Express', name_bn: '\u099c\u09be\u09b9\u09be\u09a8\u09be\u09ac\u09be\u09a6 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'khulna', dep: '20:00', arr: '23:45', nextDay: false, offDay: 1, type: 'InterCity' },
    // ---- Khulna -> Dhaka (2) ----
    { id: '763', no: '763', name_en: 'Chitra Express', name_bn: '\u099a\u09bf\u09a4\u09cd\u09b0\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'khulna', to: 'dhaka', dep: '09:00', arr: '18:05', nextDay: false, offDay: 0, type: 'InterCity' },
    { id: '725', no: '725', name_en: 'Sundarban Express', name_bn: '\u09b8\u09c1\u09a8\u09cd\u09a6\u09b0\u09ac\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'khulna', to: 'dhaka', dep: '21:45', arr: '05:10', nextDay: true, offDay: 2, type: 'InterCity' },
    // ---- Dhaka -> Rajshahi (5) ----
    { id: '769', no: '769', name_en: 'Dhumketu Express', name_bn: '\u09a7\u09c2\u09ae\u0995\u09c7\u09a4\u09c1 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'rajshahi', dep: '06:00', arr: '11:40', nextDay: false, offDay: 4, type: 'InterCity' },
    { id: '791', no: '791', name_en: 'Banalata Express', name_bn: '\u09ac\u09a8\u09b2\u09a4\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'rajshahi', dep: '13:30', arr: '17:45', nextDay: false, offDay: 5, type: 'InterCity' },
    { id: '753', no: '753', name_en: 'Silk City Express', name_bn: '\u09b8\u09bf\u09b2\u09cd\u0995\u09b8\u09bf\u099f\u09bf \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'rajshahi', dep: '14:30', arr: '20:20', nextDay: false, offDay: 0, type: 'InterCity' },
    { id: '755', no: '755', name_en: 'Madhumati Express', name_bn: '\u09ae\u09a7\u09c1\u09ae\u09a4\u09bf \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'rajshahi', dep: '15:00', arr: '22:30', nextDay: false, offDay: 6, type: 'InterCity' },
    { id: '759', no: '759', name_en: 'Padma Express', name_bn: '\u09aa\u09a6\u09cd\u09ae\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'dhaka', to: 'rajshahi', dep: '22:45', arr: '04:00', nextDay: true, offDay: 2, type: 'InterCity' },
    // ---- Rajshahi -> Dhaka (5) ----
    { id: '756', no: '756', name_en: 'Madhumati Express', name_bn: '\u09ae\u09a7\u09c1\u09ae\u09a4\u09bf \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'rajshahi', to: 'dhaka', dep: '06:40', arr: '14:00', nextDay: false, offDay: 6, type: 'InterCity' },
    { id: '792', no: '792', name_en: 'Banalata Express', name_bn: '\u09ac\u09a8\u09b2\u09a4\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'rajshahi', to: 'dhaka', dep: '07:00', arr: '11:35', nextDay: false, offDay: 5, type: 'InterCity' },
    { id: '754', no: '754', name_en: 'Silk City Express', name_bn: '\u09b8\u09bf\u09b2\u09cd\u0995\u09b8\u09bf\u099f\u09bf \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'rajshahi', to: 'dhaka', dep: '07:40', arr: '13:10', nextDay: false, offDay: 0, type: 'InterCity' },
    { id: '760', no: '760', name_en: 'Padma Express', name_bn: '\u09aa\u09a6\u09cd\u09ae\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'rajshahi', to: 'dhaka', dep: '16:00', arr: '21:15', nextDay: false, offDay: 2, type: 'InterCity' },
    { id: '770', no: '770', name_en: 'Dhumketu Express', name_bn: '\u09a7\u09c2\u09ae\u0995\u09c7\u09a4\u09c1 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b8', from: 'rajshahi', to: 'dhaka', dep: '23:20', arr: '04:45', nextDay: true, offDay: 3, type: 'InterCity' },
  ];

  var SEAT_CLASSES = ['Shovon Chair', 'Shovon', 'AC Seat', 'AC Berth', 'First Seat'];
  var APP_ID = 'train-schedule-bd';
  var EXPORT_VERSION = 1;

  function parseMinutes(hhmm) {
    if (typeof hhmm !== 'string') return NaN;
    var m = /^(\d{2}):(\d{2})$/.exec(hhmm);
    if (!m) return NaN;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return NaN;
    return h * 60 + mi;
  }

  function durationMinutes(svc) {
    var d = parseMinutes(svc.dep), a = parseMinutes(svc.arr);
    if (isNaN(d) || isNaN(a)) return NaN;
    return a - d + (svc.nextDay ? 1440 : 0);
  }

  function formatDuration(min) {
    if (isNaN(min) || min < 0) return '';
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h ' + m + 'm';
  }

  function isIsoDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var parts = s.split('-').map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return d.getUTCFullYear() === parts[0] && d.getUTCMonth() === parts[1] - 1 && d.getUTCDate() === parts[2];
  }

  // Weekday of an ISO date, computed in UTC so the result never depends on
  // the viewer's timezone. 0=Sun .. 6=Sat.
  function weekdayOf(dateStr) {
    var parts = dateStr.split('-').map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay();
  }

  function runsOn(svc, dateStr) {
    if (!isIsoDate(dateStr)) return false;
    if (svc.offDay === null || svc.offDay === undefined) return true;
    return weekdayOf(dateStr) !== svc.offDay;
  }

  function serviceById(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }

  function stationById(id) {
    for (var i = 0; i < STATIONS.length; i++) if (STATIONS[i].id === id) return STATIONS[i];
    return null;
  }

  function byDep(a, b) { return parseMinutes(a.dep) - parseMinutes(b.dep); }

  function findServices(from, to, dateStr) {
    if (!from || !to || from === to) return [];
    return SERVICES.filter(function (s) { return s.from === from && s.to === to; }).sort(byDep);
  }

  function nextDepartures(from, dateStr, nowMinutes) {
    if (!from || typeof nowMinutes !== 'number') return [];
    return SERVICES.filter(function (s) {
      return s.from === from && runsOn(s, dateStr) && parseMinutes(s.dep) > nowMinutes;
    }).sort(byDep);
  }

  // Departure instant (ms) of a saved trip, in the viewer's local timezone.
  function tripDepartureMs(trip) {
    var svc = serviceById(trip.serviceId);
    if (!svc) return NaN;
    var parts = trip.date.split('-').map(Number);
    var hm = svc.dep.split(':').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], hm[0], hm[1], 0, 0).getTime();
  }

  function countdownParts(tripDateTimeMs, nowMs) {
    var diff = tripDateTimeMs - nowMs;
    if (isNaN(diff) || diff <= 0) return { d: 0, h: 0, m: 0, s: 0, departed: true };
    var total = Math.floor(diff / 1000);
    return {
      d: Math.floor(total / 86400),
      h: Math.floor((total % 86400) / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
      departed: false,
    };
  }

  // Validate a trip object. todayStr (ISO) is the reference "today"; trips in
  // the past are rejected unless opts.allowPast is set (import path).
  function validateTrip(trip, todayStr, opts) {
    var errors = [];
    var allowPast = opts && opts.allowPast;
    if (!trip || typeof trip !== 'object' || Array.isArray(trip)) return { ok: false, errors: ['Trip must be an object.'] };
    if (typeof trip.serviceId !== 'string' || !serviceById(trip.serviceId)) errors.push('Unknown service.');
    if (!isIsoDate(trip.date)) errors.push('Travel date must be YYYY-MM-DD.');
    else if (!allowPast && todayStr && isIsoDate(todayStr) && trip.date < todayStr) errors.push('Travel date is in the past.');
    if (SEAT_CLASSES.indexOf(trip.seatClass) === -1) errors.push('Seat class is not recognised.');
    if (trip.pnr !== undefined && trip.pnr !== null && trip.pnr !== '') {
      if (typeof trip.pnr !== 'string' || trip.pnr.length > 20) errors.push('PNR must be at most 20 characters.');
    }
    if (trip.note !== undefined && trip.note !== null && trip.note !== '') {
      if (typeof trip.note !== 'string' || trip.note.length > 200) errors.push('Note must be at most 200 characters.');
    }
    if (trip.id !== undefined && typeof trip.id !== 'string') errors.push('Trip id must be a string.');
    return { ok: errors.length === 0, errors: errors };
  }

  // Strict import validation. Returns { ok, errors, trips }.
  // Data is never mutated on failure: the caller keeps its own copy.
  function validateImport(data) {
    var errors = [];
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: ['Import must be a JSON object.'], trips: null };
    if (data.app !== APP_ID) return { ok: false, errors: ['Not a train-schedule-bd file (app mismatch).'], trips: null };
    if (data.version !== EXPORT_VERSION) return { ok: false, errors: ['Unsupported version (expected 1).'], trips: null };
    if (!Array.isArray(data.trips)) return { ok: false, errors: ['"trips" must be an array.'], trips: null };
    var trips = [];
    for (var i = 0; i < data.trips.length; i++) {
      var t = data.trips[i];
      var v = validateTrip(t, null, { allowPast: true });
      if (!v.ok) { errors.push('Trip ' + (i + 1) + ': ' + v.errors.join(' ')); continue; }
      trips.push({
        id: typeof t.id === 'string' ? t.id : ('imported-' + i + '-' + Date.now()),
        serviceId: t.serviceId,
        date: t.date,
        seatClass: t.seatClass,
        pnr: typeof t.pnr === 'string' ? t.pnr : '',
        note: typeof t.note === 'string' ? t.note : '',
      });
    }
    if (errors.length) return { ok: false, errors: errors, trips: null };
    return { ok: true, errors: [], trips: trips };
  }

  var api = {
    STATIONS: STATIONS,
    SERVICES: SERVICES,
    SEAT_CLASSES: SEAT_CLASSES,
    APP_ID: APP_ID,
    EXPORT_VERSION: EXPORT_VERSION,
    parseMinutes: parseMinutes,
    durationMinutes: durationMinutes,
    formatDuration: formatDuration,
    isIsoDate: isIsoDate,
    weekdayOf: weekdayOf,
    runsOn: runsOn,
    serviceById: serviceById,
    stationById: stationById,
    findServices: findServices,
    nextDepartures: nextDepartures,
    tripDepartureMs: tripDepartureMs,
    countdownParts: countdownParts,
    validateTrip: validateTrip,
    validateImport: validateImport,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrainLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
