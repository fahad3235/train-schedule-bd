// train-schedule-bd -- bilingual strings (EN / bn).
// All Bengali text lives here as JS strings; the build keeps sources ASCII
// by escaping non-ASCII to \uXXXX (see escape step in TEST_RESULTS.md).
(function (root) {
  'use strict';

  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  var WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var WEEKDAYS_BN = ['\u09b0\u09ac\u09bf\u09ac\u09be\u09b0', '\u09b8\u09cb\u09ae\u09ac\u09be\u09b0', '\u09ae\u0999\u09cd\u0997\u09b2\u09ac\u09be\u09b0', '\u09ac\u09c1\u09a7\u09ac\u09be\u09b0', '\u09ac\u09c3\u09b9\u09b8\u09cd\u09aa\u09a4\u09bf\u09ac\u09be\u09b0', '\u09b6\u09c1\u0995\u09cd\u09b0\u09ac\u09be\u09b0', '\u09b6\u09a8\u09bf\u09ac\u09be\u09b0'];
  var WEEKDAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WEEKDAYS_SHORT_BN = ['\u09b0\u09ac\u09bf', '\u09b8\u09cb\u09ae', '\u09ae\u0999\u09cd\u0997\u09b2', '\u09ac\u09c1\u09a7', '\u09ac\u09c3\u09b9', '\u09b6\u09c1\u0995\u09cd\u09b0', '\u09b6\u09a8\u09bf'];

  var STRINGS = {
    en: {
      appTitle: 'Bangladesh Train Schedule',
      appSub: 'Intercity train times \u2014 offline, bilingual',
      tabFind: 'Find Trains',
      tabAll: 'All Trains',
      tabTrips: 'My Trips',
      tabData: 'Data',
      from: 'From',
      to: 'To',
      date: 'Travel date',
      findBtn: 'Find trains',
      swap: 'Swap stations',
      sameStation: 'Pick two different stations.',
      noTrains: 'No direct trains on this route.',
      resultsFor: 'Trains on',
      servicesCount: 'services',
      runsToday: 'Runs today',
      offToday: 'Off today',
      offDay: 'Off day',
      daily: 'Daily',
      duration: 'Duration',
      saveTrip: 'Save trip',
      savedTrip: 'Trip saved to My Trips.',
      searchPh: 'Search by name or number\u2026',
      corridorAll: 'All routes',
      allTrainsCount: 'services',
      addTrip: 'Add trip',
      service: 'Train',
      seatClass: 'Seat class',
      pnr: 'PNR (optional)',
      note: 'Note (optional)',
      tripAdded: 'Trip added.',
      tripDeleted: 'Trip deleted.',
      noTrips: 'No saved trips yet. Add one above or save a train from Find Trains.',
      departsIn: 'Departs in',
      departed: 'Departed',
      deleteTrip: 'Delete',
      pastDate: 'Travel date cannot be in the past.',
      dateRequired: 'Travel date is required.',
      serviceRequired: 'Pick a train.',
      exportBtn: 'Download JSON backup',
      exportDone: 'Backup downloaded.',
      importBtn: 'Import',
      importPh: 'Paste a train-schedule-bd JSON backup here\u2026',
      importOk: 'Import successful.',
      importFail: 'Import failed: ',
      eraseBtn: 'Erase all data',
      eraseHint: 'Type DELETE to erase all saved trips.',
      eraseWrong: 'Type DELETE exactly to erase.',
      erased: 'All saved trips erased.',
      chooseFile: 'Or choose a backup file:',
      sourcesTitle: 'Sources & accuracy',
      disclaimer: 'Timetable can change \u2014 confirm on eticket.railway.gov.bd before travelling. This app is not affiliated with Bangladesh Railway.',
      langBtn: '\u09ac\u09be\u0982\u09b2\u09be',
      nextDay: '+1 day',
      typeInterCity: 'InterCity',
      typeMail: 'Mail',
      typeCommuter: 'Commuter',
      seatShovonChair: 'Shovon Chair',
      seatShovon: 'Shovon',
      seatACSeat: 'AC Seat',
      seatACBerth: 'AC Berth',
      seatFirstSeat: 'First Seat',
      tripOn: 'Trip on',
      classLabel: 'Class',
      pnrLabel: 'PNR',
      noteLabel: 'Note',
    },
    bn: {
      appTitle: '\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u099f\u09cd\u09b0\u09c7\u09a8 \u09b8\u09ae\u09af\u09bc\u09b8\u09c2\u099a\u09bf',
      appSub: '\u0986\u09a8\u09cd\u09a4\u0983\u09a8\u0997\u09b0 \u099f\u09cd\u09b0\u09c7\u09a8\u09c7\u09b0 \u09b8\u09ae\u09af\u09bc \u2014 \u0985\u09ab\u09b2\u09be\u0987\u09a8, \u09a6\u09cd\u09ac\u09bf\u09ad\u09be\u09b7\u09bf\u0995',
      tabFind: '\u099f\u09cd\u09b0\u09c7\u09a8 \u0996\u09c1\u0981\u099c\u09c1\u09a8',
      tabAll: '\u09b8\u09ac \u099f\u09cd\u09b0\u09c7\u09a8',
      tabTrips: '\u0986\u09ae\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3',
      tabData: '\u09a1\u09c7\u099f\u09be',
      from: '\u09af\u09be\u09a4\u09cd\u09b0\u09be \u09b6\u09c1\u09b0\u09c1',
      to: '\u0997\u09a8\u09cd\u09a4\u09ac\u09cd\u09af',
      date: '\u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996',
      findBtn: '\u099f\u09cd\u09b0\u09c7\u09a8 \u0996\u09c1\u0981\u099c\u09c1\u09a8',
      swap: '\u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ac\u09a6\u09b2\u09be\u09a8',
      sameStation: '\u09a6\u09c1\u099f\u09bf \u09ad\u09bf\u09a8\u09cd\u09a8 \u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u0964',
      noTrains: '\u098f\u0987 \u09b0\u09c1\u099f\u09c7 \u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u0995\u09cb\u09a8\u09cb \u099f\u09cd\u09b0\u09c7\u09a8 \u09a8\u09c7\u0987\u0964',
      resultsFor: '\u099f\u09cd\u09b0\u09c7\u09a8 \u2014',
      servicesCount: '\u099f\u09bf \u09b8\u09be\u09b0\u09cd\u09ad\u09bf\u09b8',
      runsToday: '\u0986\u099c \u099a\u09b2\u09ac\u09c7',
      offToday: '\u0986\u099c \u09ac\u09a8\u09cd\u09a7',
      offDay: '\u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u09ac\u09a8\u09cd\u09a7',
      daily: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09a6\u09bf\u09a8',
      duration: '\u09b8\u09ae\u09af\u09bc \u09b2\u09be\u0997\u09ac\u09c7',
      saveTrip: '\u09ad\u09cd\u09b0\u09ae\u09a3 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8',
      savedTrip: '\u09ad\u09cd\u09b0\u09ae\u09a3\u099f\u09bf \u0986\u09ae\u09be\u09b0 \u09ad\u09cd\u09b0\u09ae\u09a3\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      searchPh: '\u09a8\u09be\u09ae \u09ac\u09be \u09a8\u09ae\u09cd\u09ac\u09b0 \u09a6\u09bf\u09af\u09bc\u09c7 \u0996\u09c1\u0981\u099c\u09c1\u09a8\u2026',
      corridorAll: '\u09b8\u09ac \u09b0\u09c1\u099f',
      allTrainsCount: '\u099f\u09bf \u09b8\u09be\u09b0\u09cd\u09ad\u09bf\u09b8',
      addTrip: '\u09ad\u09cd\u09b0\u09ae\u09a3 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8',
      service: '\u099f\u09cd\u09b0\u09c7\u09a8',
      seatClass: '\u0986\u09b8\u09a8\u09c7\u09b0 \u09a7\u09b0\u09a8',
      pnr: '\u09aa\u09bf\u098f\u09a8\u0986\u09b0 (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      note: '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af (\u0990\u099a\u09cd\u099b\u09bf\u0995)',
      tripAdded: '\u09ad\u09cd\u09b0\u09ae\u09a3 \u09af\u09cb\u0997 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      tripDeleted: '\u09ad\u09cd\u09b0\u09ae\u09a3 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      noTrips: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09ad\u09cd\u09b0\u09ae\u09a3 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09a8\u09bf\u0964 \u0989\u09aa\u09b0\u09c7 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8 \u0985\u09a5\u09ac\u09be \u099f\u09cd\u09b0\u09c7\u09a8 \u0996\u09c1\u0981\u099c\u09c1\u09a8 \u09a5\u09c7\u0995\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8\u0964',
      departsIn: '\u099b\u09be\u09a1\u09bc\u09a4\u09c7 \u09ac\u09be\u0995\u09bf',
      departed: '\u099b\u09c7\u09a1\u09bc\u09c7 \u0997\u09c7\u099b\u09c7',
      deleteTrip: '\u09ae\u09c1\u099b\u09c1\u09a8',
      pastDate: '\u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u0985\u09a4\u09c0\u09a4\u09c7\u09b0 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      dateRequired: '\u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u0986\u09ac\u09b6\u09cd\u09af\u0995\u0964',
      serviceRequired: '\u098f\u0995\u099f\u09bf \u099f\u09cd\u09b0\u09c7\u09a8 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u0964',
      exportBtn: 'JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1',
      exportDone: '\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      importBtn: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      importPh: '\u098f\u0996\u09be\u09a8\u09c7 train-schedule-bd JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09ac\u09b8\u09be\u09a8\u2026',
      importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      importFail: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5: ',
      eraseBtn: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c1\u09a8',
      eraseHint: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      eraseWrong: '\u09ae\u09c1\u099b\u09a4\u09c7 \u09a0\u09bf\u0995 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      erased: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      chooseFile: '\u0985\u09a5\u09ac\u09be \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09ab\u09be\u0987\u09b2 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8:',
      sourcesTitle: '\u0989\u09ce\u09b8 \u0993 \u09a8\u09bf\u09b0\u09cd\u09ad\u09c1\u09b2\u09a4\u09be',
      disclaimer: '\u09b8\u09ae\u09af\u09bc\u09b8\u09c2\u099a\u09bf \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7 \u2014 \u09ad\u09cd\u09b0\u09ae\u09a3\u09c7\u09b0 \u0986\u0997\u09c7 eticket.railway.gov.bd-\u09a4\u09c7 \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c1\u09a8\u0964 \u098f\u0987 \u0985\u09cd\u09af\u09be\u09aa \u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u09b0\u09c7\u09b2\u0993\u09af\u09bc\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09b8\u0982\u09b6\u09cd\u09b2\u09bf\u09b7\u09cd\u099f \u09a8\u09af\u09bc\u0964',
      langBtn: 'English',
      nextDay: '+\u09e7 \u09a6\u09bf\u09a8',
      typeInterCity: '\u0986\u09a8\u09cd\u09a4\u0983\u09a8\u0997\u09b0',
      typeMail: '\u09ae\u09c7\u0987\u09b2',
      typeCommuter: '\u0995\u09ae\u09bf\u0989\u099f\u09be\u09b0',
      seatShovonChair: '\u09b6\u09cb\u09ad\u09a8 \u099a\u09c7\u09af\u09bc\u09be\u09b0',
      seatShovon: '\u09b6\u09cb\u09ad\u09a8',
      seatACSeat: '\u098f\u09b8\u09bf \u09b8\u09bf\u099f',
      seatACBerth: '\u098f\u09b8\u09bf \u09ac\u09be\u09b0\u09cd\u09a5',
      seatFirstSeat: '\u09aa\u09cd\u09b0\u09a5\u09ae \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf',
      tripOn: '\u09ad\u09cd\u09b0\u09ae\u09a3 \u2014',
      classLabel: '\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf',
      pnrLabel: '\u09aa\u09bf\u098f\u09a8\u0986\u09b0',
      noteLabel: '\u09ae\u09a8\u09cd\u09a4\u09ac\u09cd\u09af',
    },
  };

  function t(lang, key) {
    var dict = STRINGS[lang] || STRINGS.en;
    return dict[key] !== undefined ? dict[key] : (STRINGS.en[key] || key);
  }

  function weekdayName(lang, day) {
    return lang === 'bn' ? WEEKDAYS_BN[day] : WEEKDAYS_EN[day];
  }

  function weekdayShort(lang, day) {
    return lang === 'bn' ? WEEKDAYS_SHORT_BN[day] : WEEKDAYS_SHORT_EN[day];
  }

  // Localise a display string: Bengali digits when lang is bn.
  function loc(lang, s) {
    return lang === 'bn' ? toBnDigits(s) : String(s);
  }

  function formatDurationLoc(lang, min) {
    if (isNaN(min) || min < 0) return '';
    var h = Math.floor(min / 60), m = min % 60;
    if (lang === 'bn') return toBnDigits(h) + '\u0998 ' + toBnDigits(m) + '\u09ae\u09bf';
    return h + 'h ' + m + 'm';
  }

  function seatClassName(lang, cls) {
    var map = {
      'Shovon Chair': 'seatShovonChair',
      'Shovon': 'seatShovon',
      'AC Seat': 'seatACSeat',
      'AC Berth': 'seatACBerth',
      'First Seat': 'seatFirstSeat',
    };
    return t(lang, map[cls] || cls);
  }

  var api = {
    STRINGS: STRINGS,
    BN_DIGITS: BN_DIGITS,
    toBnDigits: toBnDigits,
    t: t,
    weekdayName: weekdayName,
    weekdayShort: weekdayShort,
    loc: loc,
    formatDurationLoc: formatDurationLoc,
    seatClassName: seatClassName,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrainI18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
