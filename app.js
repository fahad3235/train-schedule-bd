// train-schedule-bd -- UI wiring. Pure static, zero network requests.
// ?asof=YYYY-MM-DD pins "today" (and "now" at 08:00 local) for tests.
(function () {
  'use strict';
  var L = window.TrainLogic;
  var I = window.TrainI18n;
  var $ = function (id) { return document.getElementById(id); };

  var params = new URLSearchParams(window.location.search);
  var asof = params.get('asof');
  var pinned = asof && L.isIsoDate(asof) ? asof : null;
  var pageLoadReal = Date.now();
  var pinnedBase = null;
  if (pinned) {
    var p = pinned.split('-').map(Number);
    pinnedBase = new Date(p[0], p[1] - 1, p[2], 8, 0, 0, 0).getTime();
  }

  function todayStr() {
    if (pinned) return pinned;
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function nowMs() {
    if (pinnedBase !== null) return pinnedBase + (Date.now() - pageLoadReal);
    return Date.now();
  }

  var LANG_KEY = 'tsbd.lang';
  var TRIPS_KEY = 'tsbd.trips';
  var state = {
    lang: 'en',
    corridor: 'all',
    search: '',
    trips: [],
    findDone: false,
  };
  try {
    var savedLang = window.localStorage.getItem(LANG_KEY);
    if (savedLang === 'bn' || savedLang === 'en') state.lang = savedLang;
  } catch (e) { /* storage unavailable */ }
  try {
    var raw = window.localStorage.getItem(TRIPS_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) state.trips = parsed.filter(function (t) { return L.validateTrip(t, null, { allowPast: true }).ok; });
    }
  } catch (e) { state.trips = []; }

  function saveTrips() {
    try { window.localStorage.setItem(TRIPS_KEY, JSON.stringify(state.trips)); } catch (e) { /* ignore */ }
  }
  function saveLang() {
    try { window.localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* ignore */ }
  }

  function t(key) { return I.t(state.lang, key); }
  function loc(s) { return I.loc(state.lang, s); }
  function stationName(id) {
    var st = L.stationById(id);
    if (!st) return id;
    return state.lang === 'bn' ? st.name_bn : st.name_en;
  }
  function serviceName(svc) {
    return state.lang === 'bn' ? svc.name_bn : svc.name_en;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- static i18n ----------
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    $('langBtn').textContent = t('langBtn');
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    populateStationSelects();
    populateTripServiceSelect();
    populateClassSelect();
    renderChips();
    if (state.findDone) renderFind();
    renderAll();
    renderTrips();
  }

  // ---------- selects ----------
  function populateStationSelects() {
    [['fromSelect', 'dhaka'], ['toSelect', 'chattogram']].forEach(function (pair) {
      var sel = $(pair[0]);
      var cur = sel.value || pair[1];
      sel.innerHTML = '';
      L.STATIONS.forEach(function (st) {
        var o = document.createElement('option');
        o.value = st.id;
        o.textContent = state.lang === 'bn' ? st.name_bn : st.name_en;
        sel.appendChild(o);
      });
      sel.value = cur;
    });
  }
  function populateClassSelect() {
    var sel = $('tripClass');
    var cur = sel.value || 'Shovon Chair';
    sel.innerHTML = '';
    L.SEAT_CLASSES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c;
      o.textContent = I.seatClassName(state.lang, c);
      sel.appendChild(o);
    });
    sel.value = cur;
  }
  function populateTripServiceSelect() {
    var sel = $('tripService');
    var cur = sel.value;
    sel.innerHTML = '';
    var routes = {};
    L.SERVICES.forEach(function (svc) {
      var key = svc.from + '>' + svc.to;
      (routes[key] = routes[key] || []).push(svc);
    });
    Object.keys(routes).forEach(function (key) {
      var parts = key.split('>');
      var group = document.createElement('optgroup');
      group.label = stationName(parts[0]) + ' \u2192 ' + stationName(parts[1]);
      routes[key].slice().sort(function (a, b) { return L.parseMinutes(a.dep) - L.parseMinutes(b.dep); }).forEach(function (svc) {
        var o = document.createElement('option');
        o.value = svc.id;
        o.textContent = (svc.no ? svc.no + ' ' : '') + serviceName(svc) + ' \u2014 ' + loc(svc.dep) + ' \u2192 ' + loc(svc.arr);
        group.appendChild(o);
      });
      sel.appendChild(group);
    });
    if (cur) sel.value = cur;
  }

  // ---------- train card ----------
  function trainCard(svc, dateStr, showSave) {
    var dur = L.durationMinutes(svc);
    var runs = dateStr ? L.runsOn(svc, dateStr) : true;
    var card = document.createElement('div');
    card.className = 'train-card' + (dateStr && !runs ? ' off' : '');
    card.setAttribute('data-service-id', svc.id);
    var head = document.createElement('div');
    head.className = 'train-head';
    var name = document.createElement('span');
    name.className = 'train-name';
    name.textContent = (svc.no ? loc(svc.no) + ' ' : '') + serviceName(svc);
    head.appendChild(name);
    var route = document.createElement('span');
    route.className = 'train-no';
    route.textContent = stationName(svc.from) + ' \u2192 ' + stationName(svc.to);
    head.appendChild(route);
    card.appendChild(head);

    var times = document.createElement('div');
    times.className = 'train-times';
    var dep = document.createElement('span');
    dep.textContent = loc(svc.dep);
    var arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '\u2192';
    var arr = document.createElement('span');
    arr.textContent = loc(svc.arr);
    times.appendChild(dep);
    times.appendChild(arrow);
    times.appendChild(arr);
    if (svc.nextDay) {
      var nd = document.createElement('span');
      nd.className = 'next-day';
      nd.textContent = t('nextDay');
      times.appendChild(nd);
    }
    card.appendChild(times);

    var meta = document.createElement('div');
    meta.className = 'train-meta';
    var typeBadge = document.createElement('span');
    typeBadge.className = 'badge type-' + svc.type.toLowerCase();
    typeBadge.textContent = t('type' + svc.type);
    meta.appendChild(typeBadge);
    var durBadge = document.createElement('span');
    durBadge.className = 'badge';
    durBadge.textContent = t('duration') + ': ' + I.formatDurationLoc(state.lang, dur);
    meta.appendChild(durBadge);
    var offBadge = document.createElement('span');
    offBadge.className = 'badge offday';
    offBadge.textContent = svc.offDay === null
      ? t('daily')
      : t('offDay') + ': ' + I.weekdayName(state.lang, svc.offDay);
    meta.appendChild(offBadge);
    if (dateStr) {
      var runBadge = document.createElement('span');
      runBadge.className = 'badge ' + (runs ? 'runs' : 'off');
      runBadge.textContent = runs ? t('runsToday') : t('offToday');
      meta.appendChild(runBadge);
    }
    card.appendChild(meta);

    if (svc.note_en) {
      var note = document.createElement('p');
      note.className = 'train-note';
      note.textContent = state.lang === 'bn' ? svc.note_bn : svc.note_en;
      card.appendChild(note);
    }
    if (showSave && dateStr) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'save-btn';
      btn.textContent = t('saveTrip');
      btn.addEventListener('click', function () { saveTripFromFind(svc, dateStr); });
      card.appendChild(btn);
    }
    return card;
  }

  // ---------- Find Trains ----------
  function renderFind() {
    var from = $('fromSelect').value, to = $('toSelect').value, date = $('dateInput').value;
    var err = $('findError'), summary = $('findSummary'), results = $('findResults'), empty = $('findEmpty');
    err.hidden = true; summary.hidden = true; empty.hidden = true;
    results.innerHTML = '';
    if (!date || !L.isIsoDate(date)) { err.textContent = t('dateRequired'); err.hidden = false; return; }
    if (from === to) { err.textContent = t('sameStation'); err.hidden = false; return; }
    var list = L.findServices(from, to, date);
    if (!list.length) { empty.hidden = false; return; }
    summary.textContent = t('resultsFor') + ' ' + loc(date) + ' \u2014 ' + stationName(from) + ' \u2192 ' + stationName(to) +
      ' (' + loc(String(list.length)) + ' ' + t('servicesCount') + ')';
    summary.hidden = false;
    list.forEach(function (svc) { results.appendChild(trainCard(svc, date, true)); });
  }

  function saveTripFromFind(svc, date) {
    var trip = {
      id: 'trip-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      serviceId: svc.id,
      date: date,
      seatClass: 'Shovon Chair',
      pnr: '',
      note: '',
    };
    var v = L.validateTrip(trip, todayStr());
    if (!v.ok) {
      var err = $('findError');
      err.textContent = v.errors.join(' ');
      err.hidden = false;
      return;
    }
    state.trips.push(trip);
    saveTrips();
    renderTrips();
    var msg = $('tripMsg');
    msg.textContent = t('savedTrip');
    msg.hidden = false;
    setTimeout(function () { msg.hidden = true; }, 4000);
  }

  // ---------- All Trains ----------
  var CORRIDORS = [
    { id: 'all', a: null, b: null },
    { id: 'dhaka-chattogram', a: 'dhaka', b: 'chattogram' },
    { id: 'dhaka-sylhet', a: 'dhaka', b: 'sylhet' },
    { id: 'dhaka-khulna', a: 'dhaka', b: 'khulna' },
    { id: 'dhaka-rajshahi', a: 'dhaka', b: 'rajshahi' },
  ];
  function renderChips() {
    var wrap = $('corridorChips');
    wrap.innerHTML = '';
    CORRIDORS.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (state.corridor === c.id ? ' active' : '');
      btn.textContent = c.id === 'all' ? t('corridorAll') : stationName(c.a) + ' \u2013 ' + stationName(c.b);
      btn.addEventListener('click', function () { state.corridor = c.id; renderChips(); renderAll(); });
      wrap.appendChild(btn);
    });
  }
  function renderAll() {
    var q = state.search.trim().toLowerCase();
    var list = L.SERVICES.filter(function (svc) {
      if (state.corridor !== 'all') {
        var c = CORRIDORS.filter(function (x) { return x.id === state.corridor; })[0];
        var pair = (svc.from === c.a && svc.to === c.b) || (svc.from === c.b && svc.to === c.a);
        if (!pair) return false;
      }
      if (q) {
        var hay = (svc.name_en + ' ' + svc.name_bn + ' ' + (svc.no || '') + ' ' + svc.id).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    $('allCount').textContent = loc(String(list.length)) + ' / ' + loc(String(L.SERVICES.length)) + ' ' + t('allTrainsCount');
    var wrap = $('allList');
    wrap.innerHTML = '';
    list.forEach(function (svc) { wrap.appendChild(trainCard(svc, null, false)); });
  }

  // ---------- My Trips ----------
  function countdownText(trip) {
    var depMs = L.tripDepartureMs(trip);
    var parts = L.countdownParts(depMs, nowMs());
    if (parts.departed) return t('departed');
    return loc(String(parts.d)) + 'd ' + loc(String(parts.h)) + 'h ' + loc(String(parts.m)) + 'm ' +
      loc(String(parts.s).padStart(2, '0')) + 's';
  }
  function renderTrips() {
    var wrap = $('tripList');
    wrap.innerHTML = '';
    $('tripsEmpty').hidden = state.trips.length > 0;
    var sorted = state.trips.slice().sort(function (a, b) { return L.tripDepartureMs(a) - L.tripDepartureMs(b); });
    sorted.forEach(function (trip) {
      var svc = L.serviceById(trip.serviceId);
      if (!svc) return;
      var card = document.createElement('div');
      card.className = 'trip-card';
      card.setAttribute('data-trip-id', trip.id);
      var head = document.createElement('div');
      head.className = 'train-head';
      var name = document.createElement('span');
      name.className = 'train-name';
      name.textContent = (svc.no ? loc(svc.no) + ' ' : '') + serviceName(svc);
      head.appendChild(name);
      var route = document.createElement('span');
      route.className = 'train-no';
      route.textContent = stationName(svc.from) + ' \u2192 ' + stationName(svc.to);
      head.appendChild(route);
      card.appendChild(head);
      var det = document.createElement('p');
      det.className = 'trip-detail';
      det.textContent = loc(trip.date) + ' \u00b7 ' + loc(svc.dep) + ' \u2192 ' + loc(svc.arr) +
        (svc.nextDay ? ' ' + t('nextDay') : '') + ' \u00b7 ' + t('classLabel') + ': ' + I.seatClassName(state.lang, trip.seatClass);
      card.appendChild(det);
      if (trip.pnr) {
        var p = document.createElement('p');
        p.className = 'trip-detail';
        p.textContent = t('pnrLabel') + ': ' + trip.pnr;
        card.appendChild(p);
      }
      if (trip.note) {
        var n = document.createElement('p');
        n.className = 'trip-detail';
        n.textContent = t('noteLabel') + ': ' + trip.note;
        card.appendChild(n);
      }
      var cd = document.createElement('p');
      cd.className = 'countdown';
      cd.setAttribute('data-countdown-for', trip.id);
      cd.textContent = t('departsIn') + ': ' + countdownText(trip);
      card.appendChild(cd);
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete-btn';
      del.textContent = t('deleteTrip');
      del.addEventListener('click', function () {
        state.trips = state.trips.filter(function (x) { return x.id !== trip.id; });
        saveTrips();
        renderTrips();
      });
      card.appendChild(del);
      wrap.appendChild(card);
    });
  }
  function tickCountdowns() {
    document.querySelectorAll('[data-countdown-for]').forEach(function (el) {
      var trip = state.trips.filter(function (x) { return x.id === el.getAttribute('data-countdown-for'); })[0];
      if (!trip) return;
      var parts = L.countdownParts(L.tripDepartureMs(trip), nowMs());
      if (parts.departed) {
        el.textContent = t('departed');
        el.classList.add('departed');
      } else {
        el.textContent = t('departsIn') + ': ' + countdownText(trip);
        el.classList.remove('departed');
      }
    });
  }

  // ---------- Data: export / import / erase ----------
  function exportPayload() {
    return JSON.stringify({ app: L.APP_ID, version: L.EXPORT_VERSION, trips: state.trips }, null, 2);
  }
  function importPayload(text) {
    var data;
    try { data = JSON.parse(text); }
    catch (e) { return { ok: false, errors: ['Not valid JSON.'] }; }
    var v = L.validateImport(data);
    if (!v.ok) return v;
    state.trips = v.trips;
    saveTrips();
    renderTrips();
    return { ok: true, errors: [], trips: v.trips };
  }
  function eraseAll() {
    state.trips = [];
    saveTrips();
    renderTrips();
    return true;
  }

  // ---------- tabs ----------
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ['find', 'all', 'trips', 'data'].forEach(function (name) {
        $('tab-' + name).hidden = name !== btn.getAttribute('data-tab');
      });
      if (btn.getAttribute('data-tab') === 'trips') renderTrips();
      if (btn.getAttribute('data-tab') === 'all') renderAll();
    });
  });

  // ---------- events ----------
  $('findForm').addEventListener('submit', function (e) { e.preventDefault(); state.findDone = true; renderFind(); });
  $('swapBtn').addEventListener('click', function () {
    var f = $('fromSelect'), to = $('toSelect');
    var tmp = f.value; f.value = to.value; to.value = tmp;
    if (state.findDone) renderFind();
  });
  $('searchInput').addEventListener('input', function (e) { state.search = e.target.value; renderAll(); });
  $('langBtn').addEventListener('click', function () {
    state.lang = state.lang === 'en' ? 'bn' : 'en';
    saveLang();
    applyI18n();
  });
  $('tripForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('tripError'), msg = $('tripMsg');
    err.hidden = true; msg.hidden = true;
    var trip = {
      id: 'trip-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      serviceId: $('tripService').value,
      date: $('tripDate').value,
      seatClass: $('tripClass').value,
      pnr: $('tripPnr').value.trim(),
      note: $('tripNote').value.trim(),
    };
    if (!trip.date) { err.textContent = t('dateRequired'); err.hidden = false; return; }
    var v = L.validateTrip(trip, todayStr());
    if (!v.ok) { err.textContent = v.errors.join(' '); err.hidden = false; return; }
    state.trips.push(trip);
    saveTrips();
    renderTrips();
    msg.textContent = t('tripAdded');
    msg.hidden = false;
    $('tripPnr').value = '';
    $('tripNote').value = '';
  });
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([exportPayload()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'train-schedule-bd-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    var m = $('exportMsg');
    m.textContent = t('exportDone');
    m.hidden = false;
  });
  $('importBtn').addEventListener('click', function () {
    var okEl = $('importOk'), failEl = $('importFail');
    okEl.hidden = true; failEl.hidden = true;
    var res = importPayload($('importText').value);
    if (res.ok) { okEl.textContent = t('importOk'); okEl.hidden = false; }
    else { failEl.textContent = t('importFail') + res.errors.join(' '); failEl.hidden = false; }
  });
  $('importFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () { $('importText').value = String(reader.result || ''); };
    reader.readAsText(file);
  });
  $('eraseBtn').addEventListener('click', function () {
    var wrong = $('eraseWrong'), done = $('erasedMsg');
    wrong.hidden = true; done.hidden = true;
    if ($('eraseInput').value !== 'DELETE') {
      wrong.textContent = t('eraseWrong');
      wrong.hidden = false;
      return;
    }
    eraseAll();
    $('eraseInput').value = '';
    done.textContent = t('erased');
    done.hidden = false;
  });

  // ---------- init ----------
  $('dateInput').value = todayStr();
  $('tripDate').value = todayStr();
  applyI18n();
  state.findDone = true;
  renderFind();
  setInterval(tickCountdowns, 1000);

  // Test hooks (used by tests/smoke.js; harmless in production use).
  window.__tsbd = {
    state: state,
    exportPayload: exportPayload,
    importPayload: importPayload,
    eraseAll: eraseAll,
    todayStr: todayStr,
    nowMs: nowMs,
  };
})();
