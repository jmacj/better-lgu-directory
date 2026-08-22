// Zero-dependency regression test for the Logo band predicate (#179) in
// crawl-lgu-meta.js — same shape as test-featured-eligibility.js: no
// package.json / test runner on either branch, plain Node `assert`. Run with:
//
//   node scripts/test-logo-eligibility.js
//
// It exits non-zero on any failure.
//
// Covers: the candidate chain order (SVG rel=icon > other rel=icon > largest
// manifest icon > apple-touch-icon > favicon.ico), the 64px floor (SVG
// exempt), the 1.2MB byte ceiling, SVG sanitization
// (script/foreignObject/external href rejected), and the duplicate-Logo
// detection + anti-adjacency rank keys (#179 follow-up). Isolated function
// tests against fixed inputs — no live HTTP — matching
// test-featured-eligibility.js; the wired end-to-end behaviour (fetch ->
// candidate -> row) is left to a live/manual run, same split as the Featured
// predicate's two test files.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    LOGO_MIN_PX,
    LOGO_MAX_BYTES,
    linkTags,
    declaredPx,
    logoCandidates,
    intrinsicPx,
    svgIsUnsafe,
    normalizeForHashing,
    computeContentHashes,
    findDuplicateLogos,
    separateAdjacentDuplicates,
    assignRankKeys,
} = require('./crawl-lgu-meta.js');

let failures = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ ${name}`);
    } catch (err) {
        failures++;
        console.log(`  ❌ ${name}\n     ${err.message}`);
    }
}

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
    } catch (err) {
        failures++;
        console.log(`  ❌ ${name}\n     ${err.message}`);
    }
}

console.log('\nlinkTags() / declaredPx()');

test('parses rel, href, sizes and type off a <link> tag', () => {
    const [tag] = linkTags('<link rel="icon" href="/icon.svg" type="image/svg+xml">');
    assert.strictEqual(tag.rel, 'icon');
    assert.strictEqual(tag.href, '/icon.svg');
    assert.strictEqual(tag.type, 'image/svg+xml');
});

test('declaredPx reads the first WxH pair out of a sizes attribute', () => {
    assert.strictEqual(declaredPx('32x32'), 32);
    assert.strictEqual(declaredPx('180x180'), 180);
    assert.strictEqual(declaredPx(''), 0);
    assert.strictEqual(declaredPx('any'), 0);
});

console.log('\nlogoCandidates() — chain order');

(async () => {
    await asyncTest('ranks SVG rel=icon above every other source', async () => {
        const html = `
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            <link rel="icon" href="/favicon.png">
            <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        `;
        const candidates = await logoCandidates('https://example.test/', html);
        assert.strictEqual(candidates[0].source, 'rel-icon-svg');
        assert.ok(candidates[0].url.endsWith('/favicon.svg'));
    });

    await asyncTest('ranks any other rel=icon above apple-touch-icon', async () => {
        const html = `
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            <link rel="icon" href="/favicon.png">
        `;
        const candidates = await logoCandidates('https://example.test/', html);
        const relIcon = candidates.findIndex((c) => c.source === 'rel-icon');
        const appleTouch = candidates.findIndex((c) => c.source === 'apple-touch-icon');
        assert.ok(relIcon < appleTouch, 'rel-icon must be tried before apple-touch-icon');
    });

    await asyncTest('apple-touch-icon ranks above favicon.ico', async () => {
        const html = `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
        const candidates = await logoCandidates('https://example.test/', html);
        const appleTouch = candidates.findIndex((c) => c.source === 'apple-touch-icon');
        const favicon = candidates.findIndex((c) => c.source === 'favicon.ico');
        assert.ok(appleTouch < favicon, 'apple-touch-icon must be tried before favicon.ico');
    });

    await asyncTest('favicon.ico is always present as the last-resort candidate', async () => {
        const candidates = await logoCandidates('https://example.test/', '<html></html>');
        assert.ok(candidates.some((c) => c.source === 'favicon.ico'));
        assert.strictEqual(candidates[candidates.length - 1].source, 'favicon.ico');
    });

    await asyncTest('a manifest with no reachable link contributes no candidate, chain still resolves', async () => {
        const html = `<link rel="manifest" href="/manifest.json">`;
        const candidates = await logoCandidates('https://example.test/', html);
        assert.ok(candidates.every((c) => c.source !== 'manifest'));
        assert.ok(candidates.some((c) => c.source === 'favicon.ico'));
    });

    await asyncTest('resolves relative hrefs against the page URL', async () => {
        const html = `<link rel="icon" href="icons/favicon.png">`;
        const candidates = await logoCandidates('https://example.test/sub/', html);
        const relIcon = candidates.find((c) => c.source === 'rel-icon');
        assert.strictEqual(relIcon.url, 'https://example.test/sub/icons/favicon.png');
    });

    console.log('\nintrinsicPx()');

    test('reads PNG intrinsic width from the IHDR chunk', () => {
        const png = Buffer.alloc(24);
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
        png.writeUInt32BE(64, 16);
        assert.deepStrictEqual(intrinsicPx(png, 'image/png'), { px: 64, ext: 'png' });
    });

    test('treats SVG as vector (Infinity px), exempt from the size floor', () => {
        const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
        const result = intrinsicPx(svg, 'image/svg+xml');
        assert.strictEqual(result.ext, 'svg');
        assert.strictEqual(result.px, Infinity);
    });

    test('reports an unrecognized format as bin', () => {
        const result = intrinsicPx(Buffer.from('not an image'), 'application/octet-stream');
        assert.strictEqual(result.ext, 'bin');
    });

    console.log('\nLOGO_MIN_PX / LOGO_MAX_BYTES constants');

    test('the size floor is 64px', () => {
        assert.strictEqual(LOGO_MIN_PX, 64);
    });

    test('the byte ceiling is 1.2MB', () => {
        assert.strictEqual(LOGO_MAX_BYTES, 1.2 * 1024 * 1024);
    });

    console.log('\nsvgIsUnsafe()');

    test('passes a plain, self-contained SVG', () => {
        assert.strictEqual(svgIsUnsafe(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')), false);
    });

    test('rejects an SVG containing <script>', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><script>alert(1)</script></svg>')),
            true,
        );
    });

    test('rejects an SVG containing <foreignObject>', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml">x</body></foreignObject></svg>')),
            true,
        );
    });

    test('rejects an SVG with an external href', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><image href="https://evil.test/x.png"/></svg>')),
            true,
        );
    });

    test('rejects an SVG with an external xlink:href', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><use xlink:href="http://evil.test/sprite.svg#x"/></svg>')),
            true,
        );
    });

    test('allows an SVG with a same-document href fragment', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><use href="#local-symbol"/></svg>')),
            false,
        );
    });

    test('allows an SVG with a data: URI href', () => {
        assert.strictEqual(
            svgIsUnsafe(Buffer.from('<svg><image href="data:image/png;base64,AAAA"/></svg>')),
            false,
        );
    });

    console.log('\ncomputeContentHashes() / findDuplicateLogos()');

    const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lgu-logo-hash-'));
    const write = (file, content) => fs.writeFileSync(path.join(fixtureDir, file), content);
    write('a.svg', '<svg>same</svg>');
    write('b.svg', '<svg>same</svg>');
    write('c.svg', '<svg>different</svg>');

    test('identical bytes hash the same, different bytes hash differently', () => {
        const hashes = computeContentHashes(
            [
                { domain: 'a.example', file: 'a.svg', ext: 'svg' },
                { domain: 'b.example', file: 'b.svg', ext: 'svg' },
                { domain: 'c.example', file: 'c.svg', ext: 'svg' },
            ],
            fixtureDir,
        );
        assert.strictEqual(hashes.get('a.example'), hashes.get('b.example'));
        assert.notStrictEqual(hashes.get('a.example'), hashes.get('c.example'));
    });

    test('groups byte-identical rows and leaves unique ones out', () => {
        const hashes = computeContentHashes(
            [
                { domain: 'a.example', file: 'a.svg', ext: 'svg' },
                { domain: 'b.example', file: 'b.svg', ext: 'svg' },
                { domain: 'c.example', file: 'c.svg', ext: 'svg' },
            ],
            fixtureDir,
        );
        const groups = findDuplicateLogos(hashes);
        assert.strictEqual(groups.length, 1);
        assert.deepStrictEqual(groups[0].sort(), ['a.example', 'b.example']);
    });

    test('reports nothing when every hash is unique', () => {
        const hashes = computeContentHashes(
            [
                { domain: 'a.example', file: 'a.svg', ext: 'svg' },
                { domain: 'c.example', file: 'c.svg', ext: 'svg' },
            ],
            fixtureDir,
        );
        assert.deepStrictEqual(findDuplicateLogos(hashes), []);
    });

    console.log('\nnormalizeForHashing()');

    test('strips an SVG root id= so two visually-identical exports hash the same', () => {
        const a = Buffer.from('<svg id="better-solano" viewBox="0 0 250 250"><path d="M0 0"/></svg>');
        const b = Buffer.from('<svg id="better-cainta" viewBox="0 0 250 250"><path d="M0 0"/></svg>');
        assert.strictEqual(normalizeForHashing(a, 'svg').equals(normalizeForHashing(b, 'svg')), true);
    });

    test('leaves non-SVG bytes untouched', () => {
        const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        assert.strictEqual(normalizeForHashing(buf, 'png'), buf);
    });

    test('computeContentHashes catches id-only SVG differences as duplicates', () => {
        write('solano.svg', '<svg id="better-solano" viewBox="0 0 250 250"><path d="M0 0"/></svg>');
        write('cainta.svg', '<svg id="better-cainta" viewBox="0 0 250 250"><path d="M0 0"/></svg>');
        const hashes = computeContentHashes(
            [
                { domain: 'bettersolano.org', file: 'solano.svg', ext: 'svg' },
                { domain: 'bettercainta.org', file: 'cainta.svg', ext: 'svg' },
            ],
            fixtureDir,
        );
        assert.strictEqual(hashes.get('bettersolano.org'), hashes.get('bettercainta.org'));
    });

    console.log('\nseparateAdjacentDuplicates() / assignRankKeys()');

    test('swaps an adjacent duplicate forward to break up the run', () => {
        // Two unique rows either side of the duplicate pair — enough slack
        // that both the linear run AND the wrap seam are fully solvable (a
        // lone unique row can't satisfy both at once, see the "leaves a
        // 2-duplicates-1-unique wrap unresolved" test below).
        const hashes = new Map([
            ['w', 'unique1'],
            ['a', 'dup'],
            ['b', 'dup'],
            ['z', 'unique2'],
        ]);
        const separated = separateAdjacentDuplicates(
            [{ domain: 'w' }, { domain: 'a' }, { domain: 'b' }, { domain: 'z' }],
            hashes,
        );
        const domains = separated.map((r) => r.domain);
        for (let i = 0; i < domains.length - 1; i++) {
            assert.notStrictEqual(hashes.get(domains[i]), hashes.get(domains[i + 1]));
        }
        assert.notStrictEqual(hashes.get(domains[0]), hashes.get(domains[domains.length - 1]));
    });

    test('leaves a 2-duplicates-1-unique wrap unresolved rather than trade one collision for another', () => {
        // With only one unique row to go around, the two duplicates can't
        // avoid being adjacent SOMEWHERE in the cycle — pigeonhole. The
        // safety check should refuse the wrap swap here rather than just
        // relocate the same collision next to the unique row's other side.
        const hashes = new Map([
            ['a', 'dup'],
            ['c', 'unique'],
            ['b', 'dup'],
        ]);
        const separated = separateAdjacentDuplicates(
            [{ domain: 'a' }, { domain: 'c' }, { domain: 'b' }],
            hashes,
        );
        assert.deepStrictEqual(separated.map((r) => r.domain), ['a', 'c', 'b']);
    });

    test('leaves a run alone when there is nothing non-duplicate to swap in', () => {
        const hashes = new Map([
            ['a', 'dup'],
            ['b', 'dup'],
        ]);
        const separated = separateAdjacentDuplicates([{ domain: 'a' }, { domain: 'b' }], hashes);
        assert.deepStrictEqual(separated.map((r) => r.domain), ['a', 'b']);
    });

    test('separates a duplicate pair split across the wrap seam (first + last)', () => {
        // The marquee duplicates this array end-to-end for a seamless loop,
        // so index 0 and the last index render next to each other even
        // though they're not linearly adjacent in this array.
        const hashes = new Map([
            ['a', 'dup'],
            ['b', 'unique1'],
            ['c', 'unique2'],
            ['d', 'dup'],
        ]);
        const separated = separateAdjacentDuplicates(
            [{ domain: 'a' }, { domain: 'b' }, { domain: 'c' }, { domain: 'd' }],
            hashes,
        );
        const domains = separated.map((r) => r.domain);
        assert.notStrictEqual(hashes.get(domains[0]), hashes.get(domains[domains.length - 1]));
    });

    test('wrap-seam fix leaves the set alone when nothing non-duplicate exists to swap in', () => {
        const hashes = new Map([
            ['a', 'dup'],
            ['b', 'dup'],
            ['c', 'dup'],
        ]);
        const separated = separateAdjacentDuplicates(
            [{ domain: 'a' }, { domain: 'b' }, { domain: 'c' }],
            hashes,
        );
        assert.deepStrictEqual(separated.map((r) => r.domain), ['a', 'b', 'c']);
    });

    test('assignRankKeys keeps byte-identical rows apart in the resulting order', () => {
        const hashes = new Map([
            ['a', 'dup'],
            ['b', 'dup'],
            ['c', 'unique1'],
            ['d', 'unique2'],
        ]);
        // Seed order_key so the two duplicates would otherwise sort adjacent.
        const rows = [
            { domain: 'a', order_key: '0001' },
            { domain: 'b', order_key: '0002' },
            { domain: 'c', order_key: '0003' },
            { domain: 'd', order_key: '0004' },
        ];
        assignRankKeys(rows, 'order_key', hashes, 'order_key');
        const byRank = rows.slice().sort((x, y) => (x.order_key < y.order_key ? -1 : 1));
        const domains = byRank.map((r) => r.domain);
        for (let i = 0; i < domains.length - 1; i++) {
            assert.notStrictEqual(hashes.get(domains[i]), hashes.get(domains[i + 1]));
        }
    });

    test('assignRankKeys produces zero-padded rank strings, not raw hashes', () => {
        const hashes = new Map([
            ['a', 'x'],
            ['b', 'y'],
        ]);
        const rows = [
            { domain: 'a', order_key: '0001' },
            { domain: 'b', order_key: '0002' },
        ];
        assignRankKeys(rows, 'order_key', hashes, 'order_key');
        for (const row of rows) {
            assert.match(row.order_key, /^\d{4}$/);
        }
    });

    fs.rmSync(fixtureDir, { recursive: true, force: true });

    console.log(failures === 0 ? '\n✅ All Logo eligibility tests passed.\n' : `\n❌ ${failures} test(s) failed.\n`);
    process.exit(failures === 0 ? 0 : 1);
})();
