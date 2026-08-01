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
// chain (`site.time | date: '%s' | times: 1 | plus: 28800 | divided_by: 86400
// | modulo: pool.size`) was never run against a live Jekyll build while the
// design was being decided, and asked for it to be "verified in the
// implementation and covered by a test." The `plus: 28800` step (#142) shifts
// the day-floor boundary from UTC midnight to Asia/Manila midnight (UTC+8),
// matching the cadence #132 actually intended and the 16:00 UTC scheduled
// rebuild trigger. Liquid itself cannot be unit tested outside a Jekyll
// build, so this test instead re-implements the *documented* filter
// semantics in plain JS (Unix seconds -> string -> coerced back to a number
// -> shifted by Manila's UTC+8 offset -> floor-divided by 86400 -> modulo
// pool size) and proves the properties
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
// {%- assign day = site.time | date: '%s' | times: 1 | plus: 28800 | divided_by: 86400 -%}
// {%- assign i = day | modulo: pool.size -%}
// {%- assign featured = pool[i] -%}
//
// Liquid's `date: '%s'` returns Unix seconds as a *string*; `times: 1`
// coerces it to a number; `plus: 28800` shifts it by Asia/Manila's UTC+8
// offset (in seconds) so the subsequent floor-division's day boundary lands
// on Manila midnight (16:00 UTC) instead of UTC midnight (#142); `divided_by`
// on two integers performs integer (floor) division. `modulo` follows Ruby's
// `%`, which for two non-negative operands (always true here — the shifted
// seconds and pool.size are never negative) agrees with JS's `%`.
const MANILA_OFFSET_SECONDS = 8 * 60 * 60; // UTC+8, no DST

function sortByOrderKey(pool) {
    return [...pool].sort((a, b) => (a.order_key < b.order_key ? -1 : a.order_key > b.order_key ? 1 : 0));
}

function dayNumber(unixSeconds) {
    const asString = String(unixSeconds); // date: '%s'
    const asNumber = Number(asString); // times: 1
    const manilaShifted = asNumber + MANILA_OFFSET_SECONDS; // plus: 28800
    return Math.floor(manilaShifted / 86400); // divided_by: 86400 (integer division)
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

// 2026-08-01T16:00:00Z, the scheduled rebuild's own fixed cron moment — this
// instant IS 00:00:00 Asia/Manila, so it must land exactly on a day boundary
// (day 20667, not 20666 as the old UTC-midnight math gave).
const KNOWN_UNIX_SECONDS = 1785600000;
check(dayNumber(KNOWN_UNIX_SECONDS) === 20667, 'dayNumber floors to the Manila day that starts at the scheduled rebuild moment');
check(dayNumber(0) === 0, 'dayNumber(epoch) is day 0 (1970-01-01T00:00:00Z is still 1970-01-01 in Manila, 08:00 local)');

// The Manila-midnight boundary falls at 16:00:00 UTC (= 57600s past UTC
// midnight), not at 00:00:00 UTC (86400s) as the old math assumed.
check(dayNumber(57599) === 0, 'dayNumber stays on the previous day at 15:59:59 UTC — one second before Manila midnight');
check(dayNumber(57600) === 1, 'dayNumber advances exactly at 16:00:00 UTC, which is 00:00:00 Asia/Manila');

// Regression: under the OLD (buggy) UTC-midnight math, these two timestamps
// — same UTC calendar date, one before and one after true UTC midnight —
// would have been on different days despite still being the same Manila
// day (07:59:59 Manila and 08:00:00 Manila respectively, same Manila date).
// Confirms the fix no longer flips at UTC midnight.
check(dayNumber(86399) === dayNumber(86400), 'UTC midnight (86400s) is NOT a day boundary anymore — both sides are still the same Manila day');

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

// Two builds landing on the same MANILA day (e.g. a push-triggered sync
// mid-Manila-day and the 16:00 UTC scheduled rebuild that starts the next
// one) must render the same LGU. The Manila day spanning 2026-08-02 runs from
// 2026-08-01T16:00:00Z (00:00 Manila) up to but not including
// 2026-08-02T16:00:00Z (24:00 Manila) — pick two builds inside that window
// that straddle UTC midnight, since that's exactly the case the old
// UTC-midnight math got wrong.
{
    const pool = makePool(6);
    const morning = pickFeatured(pool, Date.UTC(2026, 7, 1, 18, 0, 0) / 1000); // 2026-08-02T02:00 Manila
    const evening = pickFeatured(pool, Date.UTC(2026, 7, 2, 10, 0, 0) / 1000); // 2026-08-02T18:00 Manila
    check(morning.domain === evening.domain, 'two builds on the same Manila day (straddling UTC midnight) pick the same featured entry');
}

// Regression: the OLD test asserted 2026-08-01T02:00Z and 2026-08-01T23:00Z
// (same UTC calendar date) picked the same entry — but those two instants
// actually straddle the Manila day boundary (16:00 UTC) and are genuinely
// different Manila days (2026-08-01T02:00Z = 10:00 Manila on Aug 1;
// 2026-08-01T23:00Z = 07:00 Manila on Aug 2). Confirms the fix now tells
// them apart instead of conflating them.
{
    const pool = makePool(6);
    const beforeManilaMidnight = pickFeatured(pool, Date.UTC(2026, 7, 1, 2, 0, 0) / 1000);
    const afterManilaMidnight = pickFeatured(pool, Date.UTC(2026, 7, 1, 23, 0, 0) / 1000);
    check(
        beforeManilaMidnight.domain !== afterManilaMidnight.domain,
        'a build before and a build after the 16:00 UTC Manila-midnight boundary on the same UTC calendar date pick different entries',
    );
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
