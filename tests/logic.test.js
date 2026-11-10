// train-schedule-bd -- node logic tests (no deps).
// Run: node --test tests/logic.test.js   (or: node tests/logic.test.js)
const assert = require('node:assert');
const { test } = require('node:test');
const L = require('../logic.js');

const byId = (id) => L.serviceById(id);

test('dataset integrity: 39 services', () => {
  assert.strictEqual(L.SERVICES.length, 39);
  const ids = new Set(L.SERVICES.map((s) => s.id));
  assert.strictEqual(ids.size, 39, 'service ids must be unique');
  // no duplicate (train no + direction)
  const keys = new Set();
  for (const s of L.SERVICES) {
    const k = (s.no || s.id) + '|' + s.from + '|' + s.to;
    assert.ok(!keys.has(k), 'duplicate no+direction: ' + k);
    keys.add(k);
  }
  // all dep/arr valid, stations known, types known
  for (const s of L.SERVICES) {
    assert.ok(!isNaN(L.parseMinutes(s.dep)), s.id + ' dep valid');
    assert.ok(!isNaN(L.parseMinutes(s.arr)), s.id + ' arr valid');
    assert.ok(L.stationById(s.from), s.id + ' from station known');
    assert.ok(L.stationById(s.to), s.id + ' to station known');
    assert.ok(['InterCity', 'Mail', 'Commuter'].includes(s.type), s.id + ' type known');
    assert.ok(s.offDay === null || (s.offDay >= 0 && s.offDay <= 6), s.id + ' offDay range');
    assert.ok(s.name_en && s.name_bn, s.id + ' bilingual name present');
    const d = L.durationMinutes(s);
    assert.ok(d > 0 && d < 1440, s.id + ' duration sane: ' + d);
  }
});

test('durations incl. overnight', () => {
  assert.strictEqual(L.durationMinutes(byId('702')), 295); // 16:30 -> 21:25
  assert.strictEqual(L.durationMinutes(byId('722')), 370); // 21:20 -> 03:30 +1d
  assert.strictEqual(L.durationMinutes(byId('742')), 360); // 23:15 -> 05:15 +1d
  assert.strictEqual(L.durationMinutes(byId('788')), 295); // 07:00 -> 11:55
  assert.strictEqual(L.durationMinutes(byId('surma-mail-sylhet')), 815); // 20:20 -> 09:55 +1d
  assert.strictEqual(L.formatDuration(295), '4h 55m');
  assert.strictEqual(L.formatDuration(325), '5h 25m');
  assert.strictEqual(L.formatDuration(370), '6h 10m');
  assert.strictEqual(L.formatDuration(60), '1h 0m');
  assert.strictEqual(L.parseMinutes('07:45'), 465);
  assert.ok(isNaN(L.parseMinutes('24:00')));
  assert.ok(isNaN(L.parseMinutes('7:45')));
});

test('weekday math is timezone-proof', () => {
  // 2026-11-10 is a Tuesday (verified with `date -d`).
  assert.strictEqual(L.weekdayOf('2026-11-10'), 2);
  assert.strictEqual(L.weekdayOf('2026-11-11'), 3); // Wednesday
  assert.strictEqual(L.weekdayOf('2026-11-09'), 1); // Monday
  assert.strictEqual(L.isIsoDate('2026-02-30'), false);
  assert.strictEqual(L.isIsoDate('2026-11-10'), true);
});

test('off-day logic', () => {
  // 702 Suborno off Monday (1): runs Tue 2026-11-10, off Mon 2026-11-09.
  assert.strictEqual(L.runsOn(byId('702'), '2026-11-10'), true);
  assert.strictEqual(L.runsOn(byId('702'), '2026-11-09'), false);
  // 788 Sonar Bangla off Wednesday (3): off Wed 2026-11-11, runs Tue.
  assert.strictEqual(L.runsOn(byId('788'), '2026-11-11'), false);
  assert.strictEqual(L.runsOn(byId('788'), '2026-11-10'), true);
  // Daily services always run.
  assert.strictEqual(L.runsOn(byId('704'), '2026-11-10'), true);
  assert.strictEqual(L.runsOn(byId('742'), '2026-11-11'), true);
  // 814 Cox's Bazar Express off Tuesday: off on 2026-11-10.
  assert.strictEqual(L.runsOn(byId('814'), '2026-11-10'), false);
  assert.strictEqual(L.runsOn(byId('814'), '2026-11-11'), true);
});

test('findServices counts per route + sorting', () => {
  const count = (f, t) => L.findServices(f, t, '2026-11-10').length;
  assert.strictEqual(count('dhaka', 'chattogram'), 10);
  assert.strictEqual(count('chattogram', 'dhaka'), 4);
  assert.strictEqual(count('dhaka', 'sylhet'), 5);
  assert.strictEqual(count('sylhet', 'dhaka'), 5);
  assert.strictEqual(count('dhaka', 'khulna'), 3);
  assert.strictEqual(count('khulna', 'dhaka'), 2);
  assert.strictEqual(count('dhaka', 'rajshahi'), 5);
  assert.strictEqual(count('rajshahi', 'dhaka'), 5);
  assert.strictEqual(count('dhaka', 'dhaka'), 0, 'same station');
  assert.strictEqual(count('sylhet', 'khulna'), 0, 'no direct service');
  assert.strictEqual(count('sylhet', 'rajshahi'), 0);
  // sorted by departure, earliest first
  const dc = L.findServices('dhaka', 'chattogram', '2026-11-10');
  assert.strictEqual(dc[0].id, '815'); // 06:15 Parjatak
  assert.strictEqual(dc[dc.length - 1].id, 'chattogram-mail'); // 23:45
  for (let i = 1; i < dc.length; i++) {
    assert.ok(L.parseMinutes(dc[i].dep) >= L.parseMinutes(dc[i - 1].dep), 'sorted by dep');
  }
});

test('nextDepartures', () => {
  // Dhaka, Tue 2026-11-10, after 12:00, all routes: 759 Padma + 814 Cox's Bazar
  // are off on Tuesdays and must be excluded; everything else running sorts by dep.
  const next = L.nextDepartures('dhaka', '2026-11-10', 720);
  const ids = next.map((s) => s.id);
  assert.deepStrictEqual(ids, ['791', '802', '753', '773', '755', '702', '764', '826', 'surma-mail-dhaka', '722', '739', '742', 'chattogram-mail']);
  assert.deepStrictEqual(L.nextDepartures('sylhet', '2026-11-10', 1430), []); // after 23:30, nothing left
});

test('validateTrip', () => {
  const good = { serviceId: '702', date: '2026-11-10', seatClass: 'AC Seat', pnr: 'ABC123', note: 'window' };
  assert.strictEqual(L.validateTrip(good, '2026-11-10').ok, true);
  assert.strictEqual(L.validateTrip({ ...good, date: '2026-11-09' }, '2026-11-10').ok, false, 'past date rejected');
  assert.strictEqual(L.validateTrip({ ...good, serviceId: '999' }, '2026-11-10').ok, false, 'unknown service');
  assert.strictEqual(L.validateTrip({ ...good, seatClass: 'VIP' }, '2026-11-10').ok, false, 'bad class');
  assert.strictEqual(L.validateTrip({ ...good, date: '10-11-2026' }, '2026-11-10').ok, false, 'bad date format');
  assert.strictEqual(L.validateTrip({ ...good, date: '' }, '2026-11-10').ok, false, 'missing date');
  assert.strictEqual(L.validateTrip({ ...good, pnr: 'x'.repeat(21) }, '2026-11-10').ok, false, 'PNR too long');
  assert.strictEqual(L.validateTrip({ ...good, note: 'x'.repeat(201) }, '2026-11-10').ok, false, 'note too long');
  assert.strictEqual(L.validateTrip(null, '2026-11-10').ok, false, 'null trip');
});

test('validateImport: valid round-trip + malformed cases', () => {
  const good = {
    app: 'train-schedule-bd', version: 1,
    trips: [{ id: 't1', serviceId: '702', date: '2026-11-10', seatClass: 'Shovon Chair', pnr: '', note: '' }],
  };
  const v = L.validateImport(JSON.parse(JSON.stringify(good)));
  assert.strictEqual(v.ok, true);
  assert.strictEqual(v.trips.length, 1);
  assert.strictEqual(v.trips[0].serviceId, '702');

  const bad = [
    ['not an object', 'hello'],
    ['null', null],
    ['array', []],
    ['wrong app', { app: 'bus-fare-bd', version: 1, trips: [] }],
    ['wrong version', { app: 'train-schedule-bd', version: 2, trips: [] }],
    ['missing trips', { app: 'train-schedule-bd', version: 1 }],
    ['trips not array', { app: 'train-schedule-bd', version: 1, trips: {} }],
    ['unknown service', { app: 'train-schedule-bd', version: 1, trips: [{ id: 'x', serviceId: '999', date: '2026-11-10', seatClass: 'AC Seat' }] }],
    ['bad date', { app: 'train-schedule-bd', version: 1, trips: [{ id: 'x', serviceId: '702', date: 'tomorrow', seatClass: 'AC Seat' }] }],
    ['bad class', { app: 'train-schedule-bd', version: 1, trips: [{ id: 'x', serviceId: '702', date: '2026-11-10', seatClass: 'Royal' }] }],
    ['one good one bad', { app: 'train-schedule-bd', version: 1, trips: [good.trips[0], { id: 'y', serviceId: 'nope', date: '2026-11-10', seatClass: 'AC Seat' }] }],
  ];
  for (const [name, data] of bad) {
    assert.strictEqual(L.validateImport(data).ok, false, name + ' must be rejected');
  }
  // empty trips array is a valid (empty) import
  assert.strictEqual(L.validateImport({ app: 'train-schedule-bd', version: 1, trips: [] }).ok, true);
});

test('countdownParts math', () => {
  const base = Date.UTC(2026, 10, 10, 8, 0, 0);
  // 702 departs 2026-11-10 16:30 local; use absolute ms arithmetic instead.
  const dep = base + (8 * 60 + 30) * 60 * 1000; // 16:30 UTC on the same day
  const c = L.countdownParts(dep, base);
  assert.deepStrictEqual(c, { d: 0, h: 8, m: 30, s: 0, departed: false });
  const c2 = L.countdownParts(base + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000, base);
  assert.deepStrictEqual(c2, { d: 2, h: 3, m: 4, s: 5, departed: false });
  assert.strictEqual(L.countdownParts(base, base).departed, true);
  assert.strictEqual(L.countdownParts(base - 1000, base).departed, true);
  // tripDepartureMs uses the service dep time on the trip date
  const ms = L.tripDepartureMs({ serviceId: '702', date: '2026-11-10' });
  const d = new Date(ms);
  assert.strictEqual(d.getHours(), 16);
  assert.strictEqual(d.getMinutes(), 30);
});
