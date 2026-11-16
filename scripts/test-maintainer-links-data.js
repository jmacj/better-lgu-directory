// Zero-dependency test for the structured `maintainers:` list the README sync
// emits (#426). Run with:
//
//   node scripts/test-maintainer-links-data.js
//
// Covers the `main` side only: scripts/sync-to-data.js resolves each
// Maintainer's link (site profile page or GitHub) from a list of profile
// paths. Rendering those links is `main-pages` work. Named `-data` like
// test-repo-activity-data.js, so a `main-pages` test can't collide with it on
// the sync merge. The Budget Portal side is covered in test-budget-sync.js.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { syncLgus, lgusToYaml } = require('./sync-to-data.js');
const { listedHandles } = require('./sync-budget-to-data.js');

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

const PROFILES = ['maintainers/README.md', 'maintainers/_template.md', 'maintainers/Juan.md'];

console.log('sync-to-data: maintainers');

test('each Maintainer links to their profile when they have one, else to GitHub', () => {
    const [lgu] = syncLgus(readme(
        '| Alpha, Laguna | - | - | - | 🔵 Planned | [@juan](https://github.com/juan), [@maria](https://github.com/maria) |',
    ), PROFILES);
    assert.deepStrictEqual(lgu.maintainers, [
        { handle: 'juan', url: '/maintainers/Juan/', profile: true },
        { handle: 'maria', url: 'https://github.com/maria', profile: false },
    ]);
});

test('the raw maintainer string is unchanged', () => {
    const [lgu] = syncLgus(readme(
        '| Alpha, Laguna | - | - | - | 🔵 Planned<br>⚠️ Stale | [@juan](https://github.com/juan)<br>🤝 Open for Adoption |',
    ), PROFILES);
    assert.strictEqual(lgu.maintainer, '[@juan](https://github.com/juan)');
    assert.deepStrictEqual(lgu.maintainers.map(m => m.handle), ['juan']);
});

test('an empty Maintainer/s cell has an empty list', () => {
    const [lgu] = syncLgus(readme('| Alpha, Laguna | - | - | - | 🔵 Planned | - |'), PROFILES);
    assert.strictEqual(lgu.maintainer, '-');
    assert.deepStrictEqual(lgu.maintainers, []);
});

test('with no profiles at all, every Maintainer links to GitHub', () => {
    const [lgu] = syncLgus(readme('| Alpha, Laguna | - | - | - | 🔵 Planned | @juan |'));
    assert.deepStrictEqual(lgu.maintainers, [{ handle: 'juan', url: 'https://github.com/juan', profile: false }]);
});

test('the YAML carries both the raw string and the structured list', () => {
    const yaml = lgusToYaml(syncLgus(readme(
        '| Alpha, Laguna | - | - | - | 🔵 Planned | [@juan](https://github.com/juan) |',
        '| Beta, Laguna | - | - | - | 🔵 Planned | - |',
    ), PROFILES));
    assert.ok(yaml.includes('  maintainer: "[@juan](https://github.com/juan)"'), yaml);
    assert.ok(yaml.includes([
        '  maintainers:',
        '    - handle: "juan"',
        '      url: "/maintainers/Juan/"',
        '      profile: true',
    ].join('\n')), yaml);
    assert.ok(yaml.includes('  maintainers: []'), yaml);
});

test('the real README.md syncs, and every listed Maintainer gets a link', () => {
    const lgus = syncLgus(fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8'), PROFILES);
    for (const lgu of lgus) {
        if (lgu.maintainer !== '-') {
            assert.ok(lgu.maintainers.length > 0, `${lgu.name} has a Maintainer/s cell but no resolved links`);
        }
    }
});

console.log('sync-budget-to-data: listedHandles');

test('collects every Maintainer handle from both tables', () => {
    const budget = [
        '<!-- SYNC_BUDGET_TABLE_START -->',
        '| LGU | Portal | Type | Repository | Maintainer/s |',
        '|-----|--------|------|------------|--------------|',
        '| Silang, Cavite | [s.org](https://s.org) | 🏛️ Standalone | - | [@maria](https://github.com/maria) |',
        '<!-- SYNC_BUDGET_TABLE_END -->',
    ].join('\n');
    const handles = listedHandles(readme(
        '| Alpha, Laguna | - | - | - | 🔵 Planned | [@juan](https://github.com/juan), @pedro |',
    ), budget);
    assert.deepStrictEqual(handles, ['juan', 'pedro', 'maria']);
});

test('a missing or marker-less file contributes no handles instead of failing', () => {
    assert.deepStrictEqual(listedHandles('', 'no markers'), []);
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll maintainer link tests passed.');
