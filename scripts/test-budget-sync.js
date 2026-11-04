// Zero-dependency regression test for scripts/sync-budget-to-data.js. Same
// shape as the other test-*.js scripts: no package.json / test runner on
// either branch, plain Node + built-in `assert`. Run with:
//
//   node scripts/test-budget-sync.js
//
// It exits non-zero on any failure. The last case runs the real BUDGET.md and
// README.md through the sync, so a bad table edit fails here too.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { syncBudget, toYaml, INTEGRATED, STANDALONE } = require('./sync-budget-to-data.js');

const README = `
<!-- SYNC_LGU_TABLE_START -->
| LGU | Domain | Repository | Socials | Status | Maintainer/s |
|-----|--------|------------|---------|--------|--------------|
| Los Baños, Laguna | [betterlb.org](https://betterlb.org) | - | - | 🟢 Active | - |
| Ilocos Norte Province | - | - | - | 🟡 Work in Progress | - |
<!-- SYNC_LGU_TABLE_END -->
`;

function budget(...rows) {
    return [
        '<!-- SYNC_BUDGET_TABLE_START -->',
        '| LGU | Portal | Type | Repository | Maintainer/s |',
        '|-----|--------|------|------------|--------------|',
        ...rows,
        '<!-- SYNC_BUDGET_TABLE_END -->',
    ].join('\n');
}

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

console.log('sync-budget-to-data');

test('integrated row takes parent_domain from the README Entry', () => {
    const [p] = syncBudget(budget(
        `| Los Baños, Laguna | [budget.betterlb.org](https://budget.betterlb.org) | ${INTEGRATED} | [GitHub](https://github.com/o/r) | - |`,
    ), README);
    assert.strictEqual(p.integrated, true);
    assert.strictEqual(p.parentDomain, '[betterlb.org](https://betterlb.org)');
    assert.strictEqual(p.repoOwner, 'o');
    assert.strictEqual(p.repoName, 'r');
});

test('integrated row whose Entry has no domain gets "-"', () => {
    const [p] = syncBudget(budget(
        `| Ilocos Norte Province | [budget.x.org](https://budget.x.org) | ${INTEGRATED} | - | - |`,
    ), README);
    assert.strictEqual(p.parentDomain, '-');
});

test('integrated row with no matching README Entry fails', () => {
    assert.throws(() => syncBudget(budget(
        `| Nowhere City | [budget.x.org](https://budget.x.org) | ${INTEGRATED} | - | - |`,
    ), README), /not an LGU in README\.md/);
});

test('standalone row needs no README Entry', () => {
    const [p] = syncBudget(budget(
        `| Silang, Cavite | [bettersilang.org](https://bettersilang.org) | ${STANDALONE} | - | - |`,
    ), README);
    assert.strictEqual(p.integrated, false);
    assert.strictEqual(p.parentDomain, '-');
    assert.strictEqual(p.repoOwner, null);
});

test('unknown type fails', () => {
    assert.throws(() => syncBudget(budget(
        '| Silang, Cavite | [s.org](https://s.org) | Standalone | - | - |',
    ), README), /invalid type/);
});

test('a row without a live portal link fails (no advance registration)', () => {
    assert.throws(() => syncBudget(budget(
        `| Silang, Cavite | - | ${STANDALONE} | - | - |`,
    ), README), /added once they are live/);
    assert.throws(() => syncBudget(budget(
        `| Silang, Cavite | bettersilang.org | ${STANDALONE} | - | - |`,
    ), README), /needs a live portal link/);
});

test('a leftover Status column fails with the expected column list', () => {
    assert.throws(() => syncBudget(budget(
        `| Silang, Cavite | [s.org](https://s.org) | ${STANDALONE} | - | 🟢 Active | - |`,
    ), README), /must have 5 columns/);
});

test('duplicate LGU fails', () => {
    const row = `| Silang, Cavite | [s.org](https://s.org) | ${STANDALONE} | - | - |`;
    assert.throws(() => syncBudget(budget(row, row), README), /more than once/);
});

test('empty cells normalize to "-" and YAML escapes quotes', () => {
    const [p] = syncBudget(budget(
        `| Silang, Cavite | [s.org](https://s.org) | ${STANDALONE} | – | |`,
    ), README);
    assert.strictEqual(p.repo, '-');
    assert.strictEqual(p.maintainer, '-');
    const yaml = toYaml([{ ...p, name: 'A "quoted" LGU' }]);
    assert.ok(yaml.includes('name: "A \\"quoted\\" LGU"'));
});

test('the real BUDGET.md syncs against the real README.md', () => {
    const root = path.join(__dirname, '..');
    const portals = syncBudget(
        fs.readFileSync(path.join(root, 'BUDGET.md'), 'utf8'),
        fs.readFileSync(path.join(root, 'README.md'), 'utf8'),
    );
    assert.ok(portals.length > 0);
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll budget sync tests passed.');
