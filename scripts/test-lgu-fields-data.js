// Zero-dependency test for the structured LGU Name fields the README sync
// emits (#307): `place`, `kind`, `province`, `region`, `region_rank`, plus
// `host`, and the generated `_data/regions.yml`. Run with:
//
//   node scripts/test-lgu-fields-data.js
//
// Parsing itself is covered by test-lgu-name.js; this checks the wiring into
// scripts/sync-to-data.js. Named `-data` like the other sync-side tests.

const assert = require('assert');
const { syncLgus, lgusToYaml, regionsToYaml } = require('./sync-to-data.js');
const { extractDomainLink } = require('./crawl-lgu-meta.js');

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

console.log('sync-to-data LGU Name fields');

test('a synced Entry carries the parsed fields next to `name`', () => {
    const [entry] = syncLgus(readme('| Bacolod City, Negros Occidental | [betterbacolod.org](https://betterbacolod.org) | - | - | 🟢 Active | - |'));
    assert.strictEqual(entry.name, 'Bacolod City, Negros Occidental');
    assert.strictEqual(entry.place, 'Bacolod');
    assert.strictEqual(entry.kind, 'city');
    assert.strictEqual(entry.province, 'Negros Occidental');
    assert.strictEqual(entry.region, 'NIR');
    assert.strictEqual(entry.regionRank, 9);
    const yaml = lgusToYaml([entry]);
    for (const line of [
        '- name: "Bacolod City, Negros Occidental"',
        '  place: "Bacolod"',
        '  kind: "city"',
        '  province: "Negros Occidental"',
        '  region: "NIR"',
        '  region_rank: 9',
        '  host: "betterbacolod.org"',
        '  domain: "[betterbacolod.org](https://betterbacolod.org)"',
    ]) {
        assert.ok(yaml.includes(`${line}\n`), `missing ${line}\n${yaml}`);
    }
});

test('`host` matches the crawler\'s domain, and is empty for "-"', () => {
    const cell = '[betterormoc.org](https://www.betterormoc.org/en)';
    const [withDomain, without] = syncLgus(readme(
        `| Ormoc City, Leyte | ${cell} | - | - | 🟢 Active | - |`,
        '| Pila, Laguna | - | - | - | 🔵 Planned | - |',
    ));
    assert.strictEqual(withDomain.host, 'betterormoc.org');
    assert.strictEqual(withDomain.host, extractDomainLink(cell).label);
    assert.strictEqual(without.host, '');
    assert.ok(lgusToYaml([without]).includes('  host: ""\n'));
});

test('a region row has an empty province', () => {
    const [entry] = syncLgus(readme('| Bicol Region | - | - | - | 🔵 Planned | - |'));
    assert.strictEqual(entry.kind, 'region');
    assert.strictEqual(entry.province, '');
    assert.strictEqual(entry.regionRank, 7);
});

test('a malformed name fails the sync, naming the row', () => {
    assert.throws(
        () => syncLgus(readme(
            '| Pila, Laguna | - | - | - | 🔵 Planned | - |',
            '| Aparri, Cagayan Valley | - | - | - | 🔵 Planned | - |',
        )),
        /Row 2.*Cagayan Valley.*region, not a province/,
    );
});

test('regions.yml lists every region in rank order', () => {
    const yaml = regionsToYaml();
    assert.ok(yaml.startsWith('- name: "NCR"\n  rank: 0\n- name: "CAR"\n  rank: 1\n'), yaml);
    assert.ok(yaml.includes('- name: "BARMM"\n  rank: 17'), yaml);
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll LGU field sync tests passed.');
