// Zero-dependency regression test for the directory's URL state (#456).
// Run with:
//
//   node scripts/test-directory-url-site.js
//
// It exits non-zero on any failure.
//
// The mapping lives in assets/js/directory-url.js: parse(search, options)
// turns a query string into the controls' state, serialize(state) turns the
// state back into a query string. Defaults are left out, unknown parameters
// and invalid values are dropped.
//
// Named `-site` so it can't collide with a same-named file from main in the
// sync merge (see scripts/test-repo-activity-site.js).

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parse, serialize, DEFAULTS } = require('../assets/js/directory-url.js');

let assertions = 0;
function equal(actual, expected, message) {
    assertions++;
    assert.deepStrictEqual(actual, expected, message);
}

// A few names from _data/regions.yml; the page passes the full list.
const REGIONS = ['NCR', 'CALABARZON', 'MIMAROPA Region', 'Bicol Region'];
const read = (search) => parse(search, { regions: REGIONS });

const DEFAULT_STATE = {
    q: '',
    status: '',
    region: '',
    kinds: [],
    adoption: false,
    sort: 'location',
};

// --- Defaults -------------------------------------------------------------
equal(DEFAULTS, DEFAULT_STATE, 'DEFAULTS');
equal(serialize(DEFAULT_STATE), '', 'defaults serialize to an empty string');
equal(read(''), DEFAULT_STATE, 'empty query parses to defaults');
equal(read('?'), DEFAULT_STATE, 'bare ? parses to defaults');

// --- Each parameter round-trips ------------------------------------------
// Values are URL-encoded with %20 for spaces; kind keeps literal commas.
const withState = (patch) => Object.assign({}, DEFAULT_STATE, patch);
const CASES = [
    [withState({ q: 'san jose' }), '?q=san%20jose'],
    [withState({ q: 'a&b=c' }), '?q=a%26b%3Dc'],
    [withState({ status: 'Active' }), '?status=Active'],
    [withState({ status: 'Work in Progress' }), '?status=Work%20in%20Progress'],
    [withState({ status: 'Planned' }), '?status=Planned'],
    [withState({ status: 'Unmaintained' }), '?status=Unmaintained'],
    [withState({ region: 'CALABARZON' }), '?region=CALABARZON'],
    [withState({ region: 'MIMAROPA Region' }), '?region=MIMAROPA%20Region'],
    [withState({ kinds: ['city'] }), '?kind=city'],
    [withState({ kinds: ['city', 'municipality', 'province', 'region'] }), '?kind=city,municipality,province,region'],
    [withState({ adoption: true }), '?adoption=1'],
    [withState({ sort: 'name' }), '?sort=name'],
    [withState({ sort: 'status' }), '?sort=status'],
    [
        withState({ region: 'CALABARZON', kinds: ['city'], status: 'Active', sort: 'status' }),
        '?status=Active&region=CALABARZON&kind=city&sort=status',
    ],
];
for (const [state, query] of CASES) {
    equal(serialize(state), query, `serialize → ${query}`);
    equal(read(query), state, `parse ${query}`);
}

// The issue's example URL, in its own parameter order.
equal(
    read('?region=CALABARZON&kind=city&status=Active&sort=status'),
    withState({ region: 'CALABARZON', kinds: ['city'], status: 'Active', sort: 'status' }),
    'example URL from #456',
);

// Other encodings a hand-written or shared link may use.
equal(read('?status=Work+in+Progress').status, 'Work in Progress', '+ as space');
equal(read('?kind=city%2Cprovince').kinds, ['city', 'province'], 'encoded comma');
equal(read('region=CALABARZON').region, 'CALABARZON', 'no leading ?');

// Kinds serialize in chip order, whatever order they were pressed in.
equal(serialize(withState({ kinds: ['region', 'city'] })), '?kind=city,region', 'kind order');
equal(read('?kind=region,city').kinds, ['city', 'region'], 'parsed kind order');

// --- Unknown parameters and invalid values are dropped -------------------
// The control keeps its default; the rest still apply.
equal(read('?page=3&per=50&utm_source=fb'), DEFAULT_STATE, 'unknown parameters ignored');
equal(
    read('?region=Nowhere&kind=city'),
    withState({ kinds: ['city'] }),
    'unknown region → all regions, kind still applies',
);
equal(read('?region=calabarzon').region, '', 'region match is exact');
equal(read('?status=active').status, '', 'status match is exact');
equal(read('?status=Retired&sort=name'), withState({ sort: 'name' }), 'invalid status');
equal(read('?sort=newest&adoption=1'), withState({ adoption: true }), 'invalid sort');
equal(read('?sort=location').sort, 'location', 'explicit default sort');
equal(read('?kind=city,town,,province,city').kinds, ['city', 'province'], 'invalid and repeated kinds dropped');
equal(read('?kind=town').kinds, [], 'no valid kinds → none pressed');
equal(read('?adoption=yes').adoption, false, 'adoption only on 1');
equal(read('?adoption=0').adoption, false, 'adoption=0');
equal(read('?q=').q, '', 'empty q');
equal(read('?q=%E0%A4%A&sort=name').sort, 'name', 'malformed percent-encoding does not throw');
equal(read('?region=NCR&region=CALABARZON').region, 'NCR', 'first of a repeated parameter wins');

// Without a region list nothing can be checked, so no region is accepted.
equal(parse('?region=CALABARZON').region, '', 'no regions option');

// --- Drift guard: every value the page offers parses --------------------
// Reads the controls from index.md and the regions from _data/regions.yml,
// so adding a status, preset, kind chip or region without updating
// directory-url.js fails here.
const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.md'), 'utf8');
function optionValues(selectId) {
    const select = page.match(new RegExp(`<select id="${selectId}"[^]*?</select>`));
    assert.ok(select, `no #${selectId} in index.md`);
    return [...select[0].matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
}
const allRegions = [...fs.readFileSync(path.join(root, '_data/regions.yml'), 'utf8')
    .matchAll(/^- name: "([^"]+)"/gm)].map((m) => m[1]);
assert.ok(allRegions.length >= 17, `regions.yml: found ${allRegions.length}`);

for (const status of optionValues('status-filter')) {
    equal(read(serialize(withState({ status }))).status, status, `status option ${status}`);
}
for (const sort of optionValues('sort-preset')) {
    equal(read(serialize(withState({ sort }))).sort, sort, `sort option ${sort}`);
}
const chips = page.match(/assign kinds = "([^"]+)"/);
assert.ok(chips, 'no kind chips in index.md');
const chipKinds = chips[1].split(',');
equal(read(serialize(withState({ kinds: chipKinds }))).kinds, chipKinds, 'every kind chip');
for (const region of allRegions) {
    equal(
        parse(serialize(withState({ region })), { regions: allRegions }).region,
        region,
        `region ${region}`,
    );
}

console.log(`directory-url: ${assertions} assertions passed`);
