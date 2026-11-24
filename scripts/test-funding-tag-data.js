// Zero-dependency test for the 🌱 Seeking Funding tag in the README sync
// (#498). Run with:
//
//   node scripts/test-funding-tag-data.js
//
// The tag is a second line in the Domain cell, a link to the portal's funding
// page. The sync splits it off so `domain` and `host` keep carrying only the
// portal link (the crawler, Featured, Logo and Budget Portal matching all read
// those), and rejects every combination FUNDING.md rules out. Named `-data`
// like test-adoption-tags-data.js, so a `main-pages` test can't collide with
// it on the sync merge.

const assert = require('assert');
const { syncLgus, lgusToYaml, FUNDING_TAG } = require('./sync-to-data.js');

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

const JUAN = '[@juan](https://github.com/juan)';
const PORTAL = '[betteralpha.org](https://betteralpha.org)';

function row(domainCell, statusCell = '🟢 Active', maintainerCell = JUAN) {
    return `| Alpha, Laguna | ${domainCell} | - | - | ${statusCell} | ${maintainerCell} |`;
}

function tagged(url = 'https://betteralpha.org/funding') {
    return `${PORTAL}<br>[${FUNDING_TAG}](${url})`;
}

function sync(...rows) {
    return syncLgus(readme(...rows), []);
}

console.log('sync-to-data: Seeking Funding tag');

test('the tag is 🌱 Seeking Funding', () => {
    assert.strictEqual(FUNDING_TAG, '🌱 Seeking Funding');
});

test('an Entry without the tag has an empty funding URL', () => {
    const [lgu] = sync(row(PORTAL));
    assert.strictEqual(lgu.fundingUrl, '');
    assert.strictEqual(lgu.domain, PORTAL);
});

test('a tagged Active Entry keeps domain and host to the portal link and carries the funding URL', () => {
    const [lgu] = sync(row(tagged()));
    assert.strictEqual(lgu.domain, PORTAL);
    assert.strictEqual(lgu.host, 'betteralpha.org');
    assert.strictEqual(lgu.fundingUrl, 'https://betteralpha.org/funding');
});

test('a tagged, deployed Work in Progress Entry is accepted', () => {
    const [lgu] = sync(row(tagged(), '🟡 Work in Progress'));
    assert.strictEqual(lgu.fundingUrl, 'https://betteralpha.org/funding');
});

test('a funding page on a subdomain of the portal is accepted', () => {
    const [lgu] = sync(row(tagged('https://give.betteralpha.org/')));
    assert.strictEqual(lgu.fundingUrl, 'https://give.betteralpha.org/');
});

test('the portal host matches case-insensitively and ignores a www. prefix on the portal link', () => {
    const domain = '[betteralpha.org](https://www.BetterAlpha.org/)';
    const [lgu] = sync(row(`${domain}<br>[${FUNDING_TAG}](https://betteralpha.org/support)`));
    assert.strictEqual(lgu.fundingUrl, 'https://betteralpha.org/support');
});

test('the funding URL is emitted as funding_url in lgus.yml, empty when untagged', () => {
    const yaml = lgusToYaml(sync(row(tagged()), row(PORTAL).replace('Alpha', 'Beta')));
    assert.match(yaml, /  domain: "\[betteralpha\.org\]\(https:\/\/betteralpha\.org\)"\n/);
    assert.match(yaml, /  funding_url: "https:\/\/betteralpha\.org\/funding"/);
    assert.match(yaml, /  funding_url: ""/);
});

const REJECTED = [
    ['the tag without a link', row(`${PORTAL}<br>${FUNDING_TAG}`), /without a link/],
    ['the tag with an empty link', row(`${PORTAL}<br>[${FUNDING_TAG}]()`), /without a link/],
    ['the tag on an Entry with no Domain', row(`-<br>[${FUNDING_TAG}](https://betteralpha.org/funding)`), /no Domain/],
    ['the tag on a Planned Entry', row(tagged(), '🔵 Planned'), /only 🟢 Active and 🟡 Work in Progress/],
    ['the tag on an Unmaintained Entry', row(tagged(), '🔴 Unmaintained'), /only 🟢 Active and 🟡 Work in Progress/],
    ['the tag on a stale Work in Progress Entry', row(tagged(), '🟡 Work in Progress<br>⚠️ Stale', `${JUAN}<br>🤝 Open for Adoption`), /Stale/],
    ['a funding page on another host', row(tagged('https://ko-fi.com/betteralpha')), /not on the portal's host/],
    ['a funding page on a lookalike host', row(tagged('https://notbetteralpha.org/funding')), /not on the portal's host/],
    ['an unknown second line', row(`${PORTAL}<br>[mirror](https://mirror.example)`), /unknown second line/],
    ['a second funding tag', row(`${tagged()}<br>[${FUNDING_TAG}](https://betteralpha.org/funding)`), /more than once/],
];

for (const [label, readmeRow, message] of REJECTED) {
    test(`rejects ${label}`, () => {
        assert.throws(() => sync(readmeRow), message);
    });
}

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll tests passed.');
