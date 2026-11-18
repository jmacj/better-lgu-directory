// Zero-dependency regression test for the directory's sort presets (#448).
// Run with:
//
//   node scripts/test-directory-sort-site.js
//
// It exits non-zero on any failure.
//
// The presets live in assets/js/directory-sort.js. The page renders in
// Location order at build time (Liquid in index.md); the browser re-sorts with
// these comparators when the visitor picks another preset. Each row carries
// its keys pre-folded by the build, so the comparators only compare.
//
// Expected orders are the worked examples from #448 and CONTEXT.md's Sort
// Order entry, written out as literals.
//
// Named `-site` so it can't collide with a same-named file from main in the
// sync merge (see scripts/test-repo-activity-site.js).

const assert = require('assert');
const { sortKeys, PRESETS } = require('../assets/js/directory-sort.js');

let assertions = 0;
function check(condition, message) {
    assertions++;
    assert.ok(condition, message);
}
function checkOrder(preset, rows, expected) {
    const got = sortKeys(rows, preset).map((r) => r.name);
    assertions++;
    assert.deepStrictEqual(got, expected, `${preset}: ${got.join(' → ')}`);
}

// Keys as the build emits them: place and province folded (diacritics,
// case, punctuation and spaces removed; place has no "City", as synced by
// #307, so `Cebu City, Cebu` and `Cebu Province` share place `cebu`), level 0 region / 1 province /
// 2 city or municipality, statusRank 0 Active / 1 WIP / 2 Planned /
// 3 Unmaintained.
const row = (name, regionRank, province, level, place, statusRank = 0) =>
    ({ name, regionRank, province, level, place, statusRank });

const CEBU = [
    row('Mandaue City, Cebu', 10, 'cebu', 2, 'mandaue'),
    row('Cebu City, Cebu', 10, 'cebu', 2, 'cebu'),
    row('Lapu-Lapu City, Cebu', 10, 'cebu', 2, 'lapulapu'),
    row('Cebu Province', 10, 'cebu', 1, 'cebu'),
];

// --- Location (default) ---------------------------------------------------
checkOrder('location', CEBU, [
    'Cebu Province',
    'Cebu City, Cebu',
    'Lapu-Lapu City, Cebu',
    'Mandaue City, Cebu',
]);

// Regions north to south; a region row leads its region (no province, so
// empty folded province sorts first); provinces A–Z; cities and
// municipalities share one A–Z run.
checkOrder('location', [
    row('Naga City, Camarines Sur', 7, 'camarinessur', 2, 'naga'),
    row('Calamba City, Laguna', 5, 'laguna', 2, 'calamba'),
    row('Bicol Region', 7, '', 0, 'bicolregion'),
    row('Bay, Laguna', 5, 'laguna', 2, 'bay'),
    row('Albay Province', 7, 'albay', 1, 'albay'),
    row('Cabuyao City, Laguna', 5, 'laguna', 2, 'cabuyao'),
    row('Biñan City, Laguna', 5, 'laguna', 2, 'binan'),
    row('Caloocan City, Metro Manila', 0, 'metromanila', 2, 'caloocan'),
    row('Legazpi City, Albay', 7, 'albay', 2, 'legazpi'),
], [
    'Caloocan City, Metro Manila',
    'Bay, Laguna',
    'Biñan City, Laguna',
    'Cabuyao City, Laguna',
    'Calamba City, Laguna',
    'Bicol Region',
    'Albay Province',
    'Legazpi City, Albay',
    'Naga City, Camarines Sur',
]);

// --- Name A–Z -------------------------------------------------------------
checkOrder('name', [
    row('Cebu City, Cebu', 10, 'cebu', 2, 'cebu'),
    row('San Jose City, Nueva Ecija', 4, 'nuevaecija', 2, 'sanjose'),
    row('Cebu Province', 10, 'cebu', 1, 'cebu'),
    row('San Fernando City, Pampanga', 4, 'pampanga', 2, 'sanfernando'),
    row('San Jose, Antique', 8, 'antique', 2, 'sanjose'),
    row('San Fernando City, La Union', 2, 'launion', 2, 'sanfernando'),
], [
    'Cebu Province',
    'Cebu City, Cebu',
    'San Fernando City, La Union',
    'San Fernando City, Pampanga',
    'San Jose, Antique',
    'San Jose City, Nueva Ecija',
]);

// --- Status ---------------------------------------------------------------
// Active, WIP, Planned, Unmaintained; each run in Location order. A Planned
// Cebu Province and an Active Cebu City are listed apart (intended).
checkOrder('status', [
    row('Pagudpud, Ilocos Norte', 2, 'ilocosnorte', 2, 'pagudpud', 3),
    row('Cebu Province', 10, 'cebu', 1, 'cebu', 2),
    row('Mandaue City, Cebu', 10, 'cebu', 2, 'mandaue', 0),
    row('Bay, Laguna', 5, 'laguna', 2, 'bay', 1),
    row('Cebu City, Cebu', 10, 'cebu', 2, 'cebu', 0),
    row('Caloocan City, Metro Manila', 0, 'metromanila', 2, 'caloocan', 0),
    row('Aborlan, Palawan', 6, 'palawan', 2, 'aborlan', 2),
], [
    'Caloocan City, Metro Manila',
    'Cebu City, Cebu',
    'Mandaue City, Cebu',
    'Bay, Laguna',
    'Aborlan, Palawan',
    'Cebu Province',
    'Pagudpud, Ilocos Norte',
]);

check(PRESETS.join() === 'location,name,status', 'three presets, Location first');

console.log(`directory-sort: ${assertions} assertions passed`);
