// Zero-dependency regression test for the Featured Portal rotation index
// (#131) and the crawl helpers in crawl-lgu-meta.js (#122, #125, #127, #128).
// This repo has no package.json / test runner on either branch, so this is a
// plain Node script using the built-in `assert` module. Run with:
//
//   node scripts/test-rotation-index.js
//
// It exits non-zero on any failure, so it can be wired into CI later without
// change if this repo ever adopts one.
//
// Why this exists: #131's resolution flagged that the exact Liquid filter
// chain (`site.time | date: '%s' | times: 1 | divided_by: 86400 | modulo:
// pool.size`) was never run against a live Jekyll build while the design was
// being decided, and asked for it to be "verified in the implementation and
// covered by a test." Liquid itself cannot be unit tested outside a Jekyll
// build, so this test instead re-implements the *documented* filter
// semantics in plain JS (Unix seconds -> string -> coerced back to a number
// -> floor-divided by 86400 -> modulo pool size) and proves the properties
// the design depends on: true round-robin with no repeats inside a cycle,
// and safe behaviour at the degenerate pool sizes (0 and 1). It is a proof of
// the arithmetic, not a substitute for eyeballing one real `bundle exec
// jekyll build` — see the PR notes for that gap.

const assert = require('assert');
const {
    isBoilerplate,
    sha1First8,
    extractMeta,
    normalizeWhitespace,
    extractDomainLink,
} = require('./crawl-lgu-meta.js');

// --- Liquid filter chain, mirrored in JS -----------------------------------
//
// {%- assign pool = site.data.lgu-meta | sort: "order_key" -%}
// {%- assign day = site.time | date: '%s' | times: 1 | divided_by: 86400 -%}
// {%- assign i = day | modulo: pool.size -%}
// {%- assign featured = pool[i] -%}
//
// Liquid's `date: '%s'` returns Unix seconds as a *string*; `times: 1`
// coerces it to a number; `divided_by` on two integers performs integer
// (floor) division. `modulo` follows Ruby's `%`, which for two non-negative
// operands (always true here — Unix seconds and pool.size are never
// negative) agrees with JS's `%`.
function sortByOrderKey(pool) {
    return [...pool].sort((a, b) => (a.order_key < b.order_key ? -1 : a.order_key > b.order_key ? 1 : 0));
}

function dayNumber(unixSeconds) {
    const asString = String(unixSeconds); // date: '%s'
    const asNumber = Number(asString); // times: 1
    return Math.floor(asNumber / 86400); // divided_by: 86400 (integer division)
}

function pickFeatured(pool, unixSeconds) {
    const sorted = sortByOrderKey(pool);
    if (sorted.length === 0) return null; // #131/#125: empty pool renders nothing
    const day = dayNumber(unixSeconds);
    const i = day % sorted.length;
    return sorted[i];
}

function makePool(size) {
    return Array.from({ length: size }, (_, n) => ({
        domain: `lgu-${n}.example.gov.ph`,
        order_key: sha1First8(`lgu-${n}.example.gov.ph`),
    }));
}

let assertions = 0;
function check(condition, message) {
    assertions++;
    assert.ok(condition, message);
}

// --- day number arithmetic --------------------------------------------------

// 2026-08-01T16:00:00Z, the scheduled rebuild's own fixed cron moment.
const KNOWN_UNIX_SECONDS = 1785600000;
check(dayNumber(KNOWN_UNIX_SECONDS) === 20666, 'dayNumber floors Unix seconds to a whole day count');
check(dayNumber(0) === 0, 'dayNumber(epoch) is day 0');
check(dayNumber(86399) === 0, 'dayNumber stays on day 0 for the last second before the boundary');
check(dayNumber(86400) === 1, 'dayNumber advances exactly at the 86400s boundary');

// --- degenerate pool sizes ---------------------------------------------------

check(pickFeatured([], KNOWN_UNIX_SECONDS) === null, 'an empty pool renders nothing (no divide-by-zero)');

const poolOfOne = makePool(1);
for (let d = 0; d < 10; d++) {
    const featured = pickFeatured(poolOfOne, d * 86400);
    check(featured.domain === poolOfOne[0].domain, 'a pool of 1 always picks the same (only) entry');
}

// --- true round-robin, no repeats inside a cycle ----------------------------

for (const size of [2, 3, 6, 7, 20]) {
    const pool = makePool(size);
    const sorted = sortByOrderKey(pool);

    // One full cycle: every member appears exactly once.
    const seenInCycle = new Set();
    for (let d = 0; d < size; d++) {
        const featured = pickFeatured(pool, d * 86400);
        check(!seenInCycle.has(featured.domain), `pool size ${size}: no repeat within one ${size}-day cycle (day ${d})`);
        seenInCycle.add(featured.domain);
    }
    check(seenInCycle.size === size, `pool size ${size}: every member was featured exactly once in one cycle`);

    // The cycle repeats identically afterwards (stateless, pure function of the date).
    for (let d = 0; d < size; d++) {
        const first = pickFeatured(pool, d * 86400);
        const second = pickFeatured(pool, (d + size) * 86400);
        check(first.domain === second.domain, `pool size ${size}: cycle ${d} repeats identically on day ${d + size}`);
    }

    // Consecutive days walk the sorted pool in lockstep (index increments by 1 mod size).
    for (let d = 0; d < size * 2; d++) {
        const featured = pickFeatured(pool, d * 86400);
        check(featured.domain === sorted[d % size].domain, `pool size ${size}: day ${d} matches sorted[${d % size}]`);
    }
}

// Two builds landing on the same day (e.g. a push-triggered sync at noon and
// the 16:00 UTC scheduled rebuild) must render the same LGU.
{
    const pool = makePool(6);
    const morning = pickFeatured(pool, Date.UTC(2026, 7, 1, 2, 0, 0) / 1000);
    const evening = pickFeatured(pool, Date.UTC(2026, 7, 1, 23, 0, 0) / 1000);
    check(morning.domain === evening.domain, 'two builds on the same UTC day pick the same featured entry');
}

// --- order_key (#131) --------------------------------------------------------

check(/^[0-9a-f]{8}$/.test(sha1First8('example.gov.ph')), 'order_key is 8 lowercase hex characters');
check(sha1First8('example.gov.ph') === sha1First8('example.gov.ph'), 'order_key is stable for the same domain');
check(sha1First8('example.gov.ph') !== sha1First8('another.gov.ph'), 'different domains produce different order_keys (expected, not guaranteed)');

// --- eligibility quality floor (#122) ---------------------------------------

check(
    isBoilerplate(
        'BetterGov.ph | Republic of the Philippines | Community Powered Government Portal',
        'Some custom description',
    ),
    'exact-match boilerplate title alone disqualifies the entry',
);
check(
    isBoilerplate(
        'BetterDasmariñas.org | Transparency Portal Portal',
        'Community-powered portal of the Republic of the Philippines. Access government services, stay updated with the latest news, and find information about the Philippines.',
    ),
    'a customised title with the boilerplate description still disqualifies the entry (description is the primary check)',
);
check(
    !isBoilerplate('BetterExample Portal', 'A portal built by the Example LGU community.'),
    'genuinely custom title/description is not treated as boilerplate',
);
check(
    normalizeWhitespace('  a  b\n c ') === 'a b c',
    'normalizeWhitespace collapses and trims whitespace before comparison',
);

// --- meta extraction (#122's og:* -> fallback rule) -------------------------

{
    const html = `<html><head>
      <title>Fallback Document Title</title>
      <meta name="description" content="Fallback meta description.">
      <meta property="og:image" content="/banner.jpg">
      </head><body></body></html>`;
    const meta = extractMeta(html);
    check(meta.title === 'Fallback Document Title', 'title falls back to <title> when og:title is absent');
    check(meta.description === 'Fallback meta description.', 'description falls back to meta[name=description] when og:description is absent');
    check(meta.image === '/banner.jpg', 'image is read from og:image with no fallback source');
}
{
    const html = `<html><head>
      <title>Document Title</title>
      <meta property="og:title" content="OG Title Wins">
      <meta name="description" content="Doc description">
      <meta property="og:description" content="OG description wins">
      </head></html>`;
    const meta = extractMeta(html);
    check(meta.title === 'OG Title Wins', 'og:title takes priority over <title> when both are present');
    check(meta.description === 'OG description wins', 'og:description takes priority over meta[name=description] when both are present');
}
{
    // Attribute order varies across sites (content before property/name).
    const html = `<meta content="Reordered description" name="description">`;
    const meta = extractMeta(html);
    check(meta.description === 'Reordered description', 'meta attribute parsing is order-independent');
}

// --- README domain-cell parsing (#132: cells hold raw markdown links) ------

{
    const link = extractDomainLink('[bettersolano.org](https://bettersolano.org)');
    check(link.label === 'bettersolano.org', 'extractDomainLink reads the markdown link label as the display domain');
    check(link.url === 'https://bettersolano.org', 'extractDomainLink reads the markdown link URL as the crawl target');
}
{
    const link = extractDomainLink('example.gov.ph');
    check(link.label === 'example.gov.ph', 'extractDomainLink falls back to the bare cell as the display domain');
    check(link.url === 'https://example.gov.ph', 'extractDomainLink defaults a bare hostname to https://');
}
{
    const link = extractDomainLink('https://already-a-url.gov.ph');
    check(link.url === 'https://already-a-url.gov.ph', 'extractDomainLink does not double-prefix a bare cell that already has a scheme');
}

console.log(`✅ ${assertions} assertions passed.`);
