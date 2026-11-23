// Zero-dependency test for which status / tag combinations the README sync
// accepts (#469). Run with:
//
//   node scripts/test-adoption-tags-data.js
//
// `🤝 Open for Adoption` appears on two kinds of entry: a stale 🔵 Planned or
// 🟡 Work in Progress row (always paired with `⚠️ Stale`), and a 🔴 Unmaintained
// row (never stale — only entries that never went live go stale). Every other
// combination is a typo the sync must reject. Named `-data` like
// test-maintainer-links-data.js, so a `main-pages` test can't collide with it on
// the sync merge.

const assert = require('assert');
const { syncLgus } = require('./sync-to-data.js');

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

function readme(...rows) {
    return [
        '<!-- SYNC_LGU_TABLE_START -->',
        '| LGU | Domain | Repository | Socials | Status | Maintainer/s |',
        '|-----|--------|------------|---------|--------|--------------|',
        ...rows,
        '<!-- SYNC_LGU_TABLE_END -->',
    ].join('\n');
}

function row(statusCell, maintainerCell) {
    return `| Alpha, Laguna | - | - | - | ${statusCell} | ${maintainerCell} |`;
}

const JUAN = '[@juan](https://github.com/juan)';
const ADOPT = `${JUAN}<br>🤝 Open for Adoption`;

console.log('sync-to-data: adoption tags');

test('an Unmaintained entry can be open for adoption without being stale', () => {
    const [lgu] = syncLgus(readme(row('🔴 Unmaintained', ADOPT)), []);
    assert.strictEqual(lgu.status, '🔴 Unmaintained');
    assert.strictEqual(lgu.openForAdoption, true);
    assert.strictEqual(lgu.stale, false);
    assert.strictEqual(lgu.maintainer, JUAN);
});

test('a stale Planned entry is still open for adoption', () => {
    const [lgu] = syncLgus(readme(row('🔵 Planned<br>⚠️ Stale', ADOPT)), []);
    assert.strictEqual(lgu.stale, true);
    assert.strictEqual(lgu.openForAdoption, true);
});

test('a Work in Progress entry can go stale, and is then open for adoption', () => {
    const [lgu] = syncLgus(readme(row('🟡 Work in Progress<br>⚠️ Stale', ADOPT)), []);
    assert.strictEqual(lgu.status, '🟡 Work in Progress');
    assert.strictEqual(lgu.stale, true);
    assert.strictEqual(lgu.openForAdoption, true);
});

test('an Unmaintained entry does not have to be open for adoption', () => {
    const [lgu] = syncLgus(readme(row('🔴 Unmaintained', JUAN)), []);
    assert.strictEqual(lgu.openForAdoption, false);
});

const REJECTED = [
    ['a stale entry without the adoption tag', '🔵 Planned<br>⚠️ Stale', JUAN, /always open for adoption/],
    ['a Planned entry open for adoption without going stale', '🔵 Planned', ADOPT, /only entries tagged/],
    ['a Work in Progress entry open for adoption without going stale', '🟡 Work in Progress', ADOPT, /only entries tagged/],
    ['an Active entry open for adoption', '🟢 Active', ADOPT, /only entries tagged/],
    ['a stale Active entry', '🟢 Active<br>⚠️ Stale', ADOPT, /only 🔵 Planned and 🟡 Work in Progress entries can go stale/],
    ['a stale Unmaintained entry', '🔴 Unmaintained<br>⚠️ Stale', ADOPT, /only 🔵 Planned and 🟡 Work in Progress entries can go stale/],
];

for (const [label, statusCell, maintainerCell, message] of REJECTED) {
    test(`rejects ${label}`, () => {
        assert.throws(() => syncLgus(readme(row(statusCell, maintainerCell)), []), message);
    });
}

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll tests passed.');
