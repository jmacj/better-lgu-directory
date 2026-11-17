// Zero-dependency test for scripts/lgu-name.js, the LGU Name parser (#307).
// Same shape as the other test-*.js scripts: plain Node + built-in `assert`.
// Run with:
//
//   node scripts/test-lgu-name.js
//
// It exits non-zero on any failure. The last cases run the real README.md and
// BUDGET.md tables through the parser, so a bad table edit fails here too.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseLguName, compareLguNames, placement, LguNameError } = require('./lgu-name.js');
const { parseTable } = require('./sync-to-data.js');

let failures = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failures++;
        console.error(`  ✗ ${name}\n    ${err.message}`);
    }
}

// Asserts the name is rejected under the given rule.
function rejects(name, rule) {
    assert.throws(() => parseLguName(name), (err) => {
        assert.ok(err instanceof LguNameError, `expected an LguNameError, got ${err}`);
        assert.strictEqual(err.rule, rule, `"${name}" failed rule "${err.rule}" (${err.message}), expected "${rule}"`);
        return true;
    });
}

console.log('lgu-name');

test('municipality', () => {
    assert.deepStrictEqual(parseLguName('Calauan, Laguna'), {
        place: 'Calauan', kind: 'municipality', province: 'Laguna', region: 'CALABARZON', regionRank: 5,
    });
});

test('component city', () => {
    assert.deepStrictEqual(parseLguName('Calamba City, Laguna'), {
        place: 'Calamba', kind: 'city', province: 'Laguna', region: 'CALABARZON', regionRank: 5,
    });
});

test('highly urbanized city takes its geographic province', () => {
    const lgu = parseLguName('Bacolod City, Negros Occidental');
    assert.strictEqual(lgu.kind, 'city');
    assert.strictEqual(lgu.province, 'Negros Occidental');
    assert.strictEqual(lgu.region, 'NIR');
});

test('NCR city uses the Metro Manila stand-in province', () => {
    assert.deepStrictEqual(parseLguName('Makati City, Metro Manila'), {
        place: 'Makati', kind: 'city', province: 'Metro Manila', region: 'NCR', regionRank: 0,
    });
});

test('province row: place is the province', () => {
    assert.deepStrictEqual(parseLguName('Aklan Province'), {
        place: 'Aklan', kind: 'province', province: 'Aklan', region: 'Western Visayas', regionRank: 8,
    });
});

test('Mountain Province is written as itself, not doubled', () => {
    const lgu = parseLguName('Mountain Province');
    assert.strictEqual(lgu.kind, 'province');
    assert.strictEqual(lgu.place, 'Mountain Province');
    assert.strictEqual(lgu.region, 'CAR');
    rejects('Mountain Province Province', 'format');
});

test('region row: place is the region as written, no province', () => {
    assert.deepStrictEqual(parseLguName('Bicol Region'), {
        place: 'Bicol Region', kind: 'region', province: '', region: 'Bicol Region', regionRank: 7,
    });
    assert.strictEqual(parseLguName('CALABARZON').kind, 'region');
    assert.strictEqual(parseLguName('NCR').regionRank, 0);
});

test('Isabela City region override: Zamboanga Peninsula, not BARMM', () => {
    const lgu = parseLguName('Isabela City, Basilan');
    assert.strictEqual(lgu.province, 'Basilan');
    assert.strictEqual(lgu.region, 'Zamboanga Peninsula');
    assert.strictEqual(parseLguName('Lamitan City, Basilan').region, 'BARMM');
});

test('Special Geographic Area municipalities are BARMM, though in Cotabato', () => {
    assert.strictEqual(parseLguName('Pahamuddin, Cotabato').region, 'BARMM');
    assert.strictEqual(parseLguName('Midsayap, Cotabato').region, 'SOCCSKSARGEN');
});

test('a region used as a province is rejected', () => {
    rejects('Aparri, Cagayan Valley', 'unknown-province');
    rejects('Davao del Sur, Davao Region', 'unknown-province');
});

test('an unknown province is rejected', () => {
    rejects('Midsayap, North Cotabato', 'unknown-province');
    rejects('Somewhere, Atlantis', 'unknown-province');
});

test('province case must match PSGC exactly', () => {
    rejects('Davao City, Davao Del Sur', 'unknown-province');
    assert.match(errorOf('Davao City, Davao Del Sur').message, /Davao del Sur/);
});

test('City of X is rejected in favour of X City', () => {
    rejects('City of Manila, Metro Manila', 'city-of');
    assert.match(errorOf('City of Manila, Metro Manila').message, /Manila City, Metro Manila/);
});

test('Metro Manila Province is rejected', () => {
    rejects('Metro Manila Province', 'metro-manila-province');
});

test('a bare place or a region with the wrong case is rejected', () => {
    rejects('Calauan', 'no-province');
    rejects('Calabarzon', 'no-province');
    rejects('Bogus Province', 'unknown-province');
});

test('malformed separators are rejected', () => {
    rejects('Calauan,Laguna', 'format');
    rejects('Calauan ,  Laguna', 'format');
    rejects('A, B, Laguna', 'format');
    rejects(' City, Laguna', 'format');
    rejects('', 'format');
});

function errorOf(name) {
    try {
        parseLguName(name);
    } catch (err) {
        return err;
    }
    throw new Error(`"${name}" was accepted`);
}

function sorted(names) {
    return [...names].sort(compareLguNames);
}

test('sort: folded place, diacritics ignored', () => {
    assert.deepStrictEqual(
        sorted(['Bocaue, Bulacan', 'Binangonan, Rizal', 'Biñan City, Laguna']),
        // "binan" is a prefix of "binangonan": the ñ folds to n.
        ['Biñan City, Laguna', 'Binangonan, Rizal', 'Bocaue, Bulacan'],
    );
});

test('sort: the higher level comes first on a shared place', () => {
    assert.deepStrictEqual(sorted(['Cebu City, Cebu', 'Cebu Province']), ['Cebu Province', 'Cebu City, Cebu']);
});

test('sort: city and municipality are the same level, so the province decides', () => {
    assert.deepStrictEqual(
        sorted(['San Jose City, Nueva Ecija', 'San Jose, Antique']),
        ['San Jose, Antique', 'San Jose City, Nueva Ecija'],
    );
});

test('sort: a region row precedes a same-place municipality row', () => {
    // Caraga is both a region and a municipality in Davao Oriental.
    assert.ok(compareLguNames('Caraga', 'Caraga, Davao Oriental') < 0);
});

test('placement: names the rows a name belongs between', () => {
    const others = ['Cebu City, Cebu', 'Aklan Province', 'Calauan, Laguna'];
    assert.deepStrictEqual(placement('Cainta, Rizal', others), { after: 'Aklan Province', before: 'Calauan, Laguna' });
    assert.deepStrictEqual(placement('Cebu Province', others), { after: 'Calauan, Laguna', before: 'Cebu City, Cebu' });
    assert.deepStrictEqual(placement('Abra Province', others), { after: null, before: 'Aklan Province' });
    assert.deepStrictEqual(placement('Zamboanga City, Zamboanga del Sur', others), { after: 'Cebu City, Cebu', before: null });
});

test('placement: unparseable neighbours are skipped', () => {
    assert.deepStrictEqual(placement('Cainta, Rizal', ['Bogus', 'Calauan, Laguna']), { after: null, before: 'Calauan, Laguna' });
});

// The real tables: every LGU cell parses, and the table is in sort order.
function checkTable(file, start, end) {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const names = parseTable(content, start, end, file).map(cells => cells[0]);
    assert.ok(names.length > 0, `${file} has no rows`);
    for (const name of names) {
        parseLguName(name);
    }
    for (let i = 1; i < names.length; i++) {
        assert.ok(compareLguNames(names[i - 1], names[i]) < 0, `${file}: "${names[i]}" belongs before "${names[i - 1]}"`);
    }
}

test('the real README.md table is valid and sorted', () => {
    checkTable('README.md', '<!-- SYNC_LGU_TABLE_START -->', '<!-- SYNC_LGU_TABLE_END -->');
});

test('the real BUDGET.md table is valid and sorted', () => {
    checkTable('BUDGET.md', '<!-- SYNC_BUDGET_TABLE_START -->', '<!-- SYNC_BUDGET_TABLE_END -->');
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll LGU name tests passed.');
