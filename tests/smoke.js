// train-schedule-bd -- headless-Chrome smoke test via raw CDP (no puppeteer).
// Usage: node tests/smoke.js
// Exits non-zero on any failed assertion; fails on page console errors.
// ?asof=2026-11-10 pins "today" (Tuesday) and "now" (08:00 local) for tests.
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 9354;
const BASE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const TUE = BASE + '?asof=2026-11-10';
const WED = BASE + '?asof=2026-11-11';
let failures = 0;
let count = 0;
const pageErrors = [];
function check(name, cond, extra) {
  count++;
  console.log((cond ? 'ok - ' : 'FAIL - ') + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const CHROME_BIN = process.env.CHROME_BIN ||
    require('os').homedir() + '/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell';
  const chrome = spawn(CHROME_BIN, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/tsbd-smoke-' + process.pid,
    'about:blank',
  ], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 50 && targets.length === 0; i++) {
    await wait(200);
    try {
      targets = JSON.parse(await new Promise((res, rej) => {
        http.get('http://127.0.0.1:' + PORT + '/json/list', (r) => {
          let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d));
        }).on('error', rej);
      }));
    } catch (e) { /* retry */ }
  }
  if (!targets.length) { console.log('FAIL - chrome did not start'); process.exit(2); }
  const wsUrl = targets[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise((res) => { ws.onopen = res; });
  let seq = 0; const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push('exception: ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      pageErrors.push('console.error: ' + JSON.stringify(msg.params.args).slice(0, 300));
    }
  };
  function send(method, params) {
    return new Promise((res) => {
      const id = ++seq;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const nav = async (url) => { await send('Page.navigate', { url }); await wait(1400); };
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) return { error: JSON.stringify(r.result.exceptionDetails).slice(0, 300) };
    return r.result ? r.result.result.value : undefined;
  };
  const clickTab = async (name) => ev(`document.querySelector('[data-tab="${name}"]').click()`);
  const BN_TITLE = '\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u099f\u09cd\u09b0\u09c7\u09a8 \u09b8\u09ae\u09af\u09bc\u09b8\u09c2\u099a\u09bf';

  // ---- Load: Tuesday 2026-11-10 ----
  await nav(TUE);
  check('page title mentions Train Schedule', (await ev('document.title'))?.includes('Train Schedule'));
  check('pinned today is 2026-11-10', (await ev(`window.__tsbd.todayStr()`)) === '2026-11-10');
  check('date input defaults to 2026-11-10', (await ev(`document.getElementById('dateInput').value`)) === '2026-11-10');
  check('Find auto-runs: 10 Dhaka->Chattogram results', (await ev(`document.querySelectorAll('#findResults .train-card').length`)) === 10);
  check('Suborno 702 present', (await ev(`document.querySelector('[data-service-id="702"]') !== null`)) === true);
  check('702 runs today (Tue, off Mon)', (await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('Runs today'));
  check('702 does not show Off today', !(await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('Off today'));
  check("814 Cox's Bazar off today (off Tue)", (await ev(`document.querySelector('[data-service-id="814"]').textContent`)).includes('Off today'));
  check('788 runs today (off Wed)', (await ev(`document.querySelector('[data-service-id="788"]').textContent`)).includes('Runs today'));
  check('702 duration is 4h 55m', (await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('4h 55m'));
  check('722 shows +1 day', (await ev(`document.querySelector('[data-service-id="722"]').textContent`)).includes('+1 day'));
  check('summary shows 10 services', (await ev(`document.getElementById('findSummary').textContent`)).includes('10'));

  // ---- Same station -> inline error ----
  await ev(`document.getElementById('toSelect').value='dhaka'; document.getElementById('findBtn').click()`);
  check('same station shows inline error', (await ev(`document.getElementById('findError').hidden`)) === false);
  check('same station error text', (await ev(`document.getElementById('findError').textContent`)).includes('different stations'));
  check('same station clears results', (await ev(`document.querySelectorAll('#findResults .train-card').length`)) === 0);

  // ---- Swap button ----
  await ev(`document.getElementById('fromSelect').value='dhaka'; document.getElementById('toSelect').value='chattogram'; document.getElementById('swapBtn').click()`);
  check('swap exchanges From/To', (await ev(`document.getElementById('fromSelect').value`)) === 'chattogram' && (await ev(`document.getElementById('toSelect').value`)) === 'dhaka');
  await ev(`document.getElementById('swapBtn').click(); document.getElementById('findBtn').click()`);
  check('10 results restored after swap-back + find', (await ev(`document.querySelectorAll('#findResults .train-card').length`)) === 10);

  // ---- No direct trains (unknown route) ----
  await ev(`document.getElementById('fromSelect').value='sylhet'; document.getElementById('toSelect').value='khulna'; document.getElementById('findBtn').click()`);
  check('Sylhet->Khulna shows no-trains empty state', (await ev(`document.getElementById('findEmpty').hidden`)) === false);
  await ev(`document.getElementById('fromSelect').value='dhaka'; document.getElementById('toSelect').value='chattogram'; document.getElementById('findBtn').click()`);

  // ---- All Trains: search + corridor chips ----
  await clickTab('all');
  check('All Trains shows 39 services', (await ev(`document.getElementById('allCount').textContent`)).includes('39'));
  check('All Trains lists 39 cards', (await ev(`document.querySelectorAll('#allList .train-card').length`)) === 39);
  await ev(`document.getElementById('searchInput').value='suborno'; document.getElementById('searchInput').dispatchEvent(new Event('input'))`);
  check('search "suborno" -> 2 rows', (await ev(`document.querySelectorAll('#allList .train-card').length`)) === 2);
  await ev(`document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'))`);
  await ev(`document.querySelectorAll('#corridorChips .chip')[2].click()`); // Dhaka-Sylhet
  check('Dhaka-Sylhet corridor -> 10 rows', (await ev(`document.querySelectorAll('#allList .train-card').length`)) === 10);
  await ev(`document.querySelectorAll('#corridorChips .chip')[0].click()`); // All
  check('All chip restores 39 rows', (await ev(`document.querySelectorAll('#allList .train-card').length`)) === 39);

  // ---- Wednesday 2026-11-11: 788 + 815 off, 702 runs ----
  await nav(WED);
  check('Wed: 788 Sonar Bangla off today', (await ev(`document.querySelector('[data-service-id="788"]').textContent`)).includes('Off today'));
  check('Wed: 815 Parjatak off today', (await ev(`document.querySelector('[data-service-id="815"]').textContent`)).includes('Off today'));
  check('Wed: 702 Suborno runs today', (await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('Runs today'));
  await nav(TUE);

  // ---- Save trip from Find card ----
  await ev(`document.querySelector('[data-service-id="702"] .save-btn').click()`);
  await clickTab('trips');
  check('saved trip appears in My Trips', (await ev(`document.querySelectorAll('#tripList .trip-card').length`)) === 1);
  check('countdown text appears', /\d+d \d+h \d+m \d+s/.test(await ev(`document.querySelector('#tripList .countdown').textContent`)));
  check('countdown is ~8h30m to 16:30 from pinned 08:00', /8h (29|30)m/.test(await ev(`document.querySelector('#tripList .countdown').textContent`)));

  // ---- Persistence across reload + delete ----
  await nav(TUE);
  await clickTab('trips');
  check('trip persists after reload', (await ev(`document.querySelectorAll('#tripList .trip-card').length`)) === 1);
  await ev(`document.querySelector('#tripList .delete-btn').click()`);
  check('delete removes trip', (await ev(`document.querySelectorAll('#tripList .trip-card').length`)) === 0);
  check('empty trips message shows', (await ev(`document.getElementById('tripsEmpty').hidden`)) === false);

  // ---- Trip form validation: past date rejected, valid add works ----
  await ev(`document.getElementById('tripService').value='791'; document.getElementById('tripDate').value='2026-11-09'; document.getElementById('addTripBtn').click()`);
  check('past date shows error', (await ev(`document.getElementById('tripError').hidden`)) === false);
  check('past date adds nothing', (await ev(`document.querySelectorAll('#tripList .trip-card').length`)) === 0);
  await ev(`document.getElementById('tripDate').value='2026-11-10'; document.getElementById('tripClass').value='AC Seat'; document.getElementById('tripPnr').value='PNR123'; document.getElementById('addTripBtn').click()`);
  check('valid form add works', (await ev(`document.querySelectorAll('#tripList .trip-card').length`)) === 1);
  check('PNR shown on trip card', (await ev(`document.querySelector('#tripList .trip-card').textContent`)).includes('PNR123'));
  check('seat class shown', (await ev(`document.querySelector('#tripList .trip-card').textContent`)).includes('AC Seat'));

  // ---- Export / erase / import round-trip via test hooks ----
  const payload = await ev(`window.__tsbd.exportPayload()`);
  check('export payload is train-schedule-bd v1', payload.includes('"app": "train-schedule-bd"') && payload.includes('"version": 1'), payload.slice(0, 120));
  check('export carries the saved 791 trip', payload.includes('"791"'));
  await ev(`window.__tsbd.eraseAll()`);
  check('eraseAll empties trips', (await ev(`window.__tsbd.exportPayload()`)).includes('"trips": []'));
  const imp = await ev(`JSON.stringify(window.__tsbd.importPayload(${JSON.stringify(payload)}))`);
  check('import valid payload ok', imp.includes('"ok":true'), imp);
  check('import restores trip', (await ev(`window.__tsbd.exportPayload()`)).includes('"791"'));
  const badImp = await ev(`JSON.stringify(window.__tsbd.importPayload('{"app":"bus-fare-bd","version":1,"trips":[]}'))`);
  check('import wrong app rejected', badImp.includes('"ok":false'));
  check('invalid import leaves data intact', (await ev(`window.__tsbd.exportPayload()`)).includes('"791"'));
  const badSvc = await ev(`JSON.stringify(window.__tsbd.importPayload('{"app":"train-schedule-bd","version":1,"trips":[{"id":"x","serviceId":"999","date":"2026-11-10","seatClass":"AC Seat"}]}'))`);
  check('import unknown service rejected', badSvc.includes('"ok":false'));
  check('bad-service import leaves data intact', (await ev(`window.__tsbd.exportPayload()`)).includes('"791"'));

  // ---- Bad import via UI textarea shows visible error; good import succeeds ----
  await clickTab('data');
  await ev(`document.getElementById('importText').value='{not json'; document.getElementById('importBtn').click()`);
  check('bad UI import shows error', (await ev(`document.getElementById('importFail').hidden`)) === false);
  await ev(`document.getElementById('importText').value=${JSON.stringify(payload)}; document.getElementById('importBtn').click()`);
  check('good UI import succeeds', (await ev(`document.getElementById('importOk').hidden`)) === false);

  // ---- Typed-DELETE erase via UI; wrong word rejected ----
  await ev(`document.getElementById('eraseInput').value='delete'; document.getElementById('eraseBtn').click();`);
  check('wrong erase word rejected', (await ev(`document.getElementById('eraseWrong').hidden`)) === false);
  check('wrong erase keeps data', (await ev(`window.__tsbd.exportPayload()`)).includes('"791"'));
  await ev(`document.getElementById('eraseInput').value='DELETE'; document.getElementById('eraseBtn').click();`);
  check('DELETE erases data', (await ev(`window.__tsbd.exportPayload()`)).includes('"trips": []'));
  check('erase success message shows', (await ev(`document.getElementById('erasedMsg').hidden`)) === false);

  // ---- Language toggle: Bengali title + digits, persists after reload ----
  await ev(`document.getElementById('tripService').value='702'; document.getElementById('tripDate').value='2026-11-10'; document.getElementById('addTripBtn').click()`);
  await clickTab('find');
  await ev(`document.getElementById('langBtn').click()`);
  check('BN toggle: title in Bengali', (await ev(`document.getElementById('title').textContent`)) === BN_TITLE);
  check('BN toggle: 702 time in Bengali digits', (await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('\u09e7\u09ec:\u09e9\u09e6'));
  check('BN toggle: Runs-today badge in Bengali', (await ev(`document.querySelector('[data-service-id="702"]').textContent`)).includes('\u0986\u099c \u099a\u09b2\u09ac\u09c7'));
  await nav(TUE);
  check('BN toggle persists after reload', (await ev(`window.__tsbd.state.lang`)) === 'bn');
  await ev(`document.getElementById('langBtn').click()`);
  check('back to EN', (await ev(`window.__tsbd.state.lang`)) === 'en');

  // ---- Mobile 390px: no horizontal overflow on any tab ----
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await nav(TUE);
  for (const tab of ['find', 'all', 'trips', 'data']) {
    await clickTab(tab);
    await wait(300);
    const overflow = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    check('390px no overflow on ' + tab + ' tab', overflow <= 0, 'overflow=' + overflow);
  }

  // ---- Zero network requests: app is fully offline (only file:// loads) ----
  const reqs = await ev(`performance.getEntriesByType('resource').map(r => r.name).filter(n => !n.startsWith('file://')).length`);
  check('zero non-file network requests', reqs === 0, 'non-file=' + reqs);

  check('no console/page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

  chrome.kill();
  console.log('\n' + count + ' checks, ' + failures + ' failed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.log('FAIL - harness error: ' + e.message); try { chrome.kill(); } catch (_) {} process.exit(2); });
