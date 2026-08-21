// Zero-dependency regression test for the Featured Portal *ineligibility
// reporting* helpers in crawl-lgu-meta.js. Same shape as
// test-rotation-index.js: this repo has no package.json / test runner on
// either branch, so this is a plain Node script using the built-in `assert`
// module. Run with:
//
//   node scripts/test-featured-eligibility.js
//
// It exits non-zero on any failure.
//
// Why this exists: crawlEntry() used to collapse seven distinct rejection
// paths (robots disallow, each missing meta field, boilerplate copy, and four
// separate og:image failures) into a bare `return null`, and main() printed
// one static line — "ineligible (incomplete, boilerplate, or
// robots-disallowed)" — for all of them. That line named three causes out of
// seven, and the og:image fetch error path threw away an `err.message` it
// already held. An operator reading the Actions log could not tell a missing
// meta tag from a 404 on the image. These helpers make each rejection say
// exactly which rule failed, with the offending value, while keeping a
// variable-free `summary` per failed rule so the end-of-run tally can group
// them.

const assert = require('assert');
const {
    IMAGE_SIZE_CEILING_BYTES,
    BOILERPLATE_DESCRIPTION,
    BOILERPLATE_TITLE,
    missingMetaReason,
    boilerplateReason,
    imageRejectionReason,
    formatIneligibleSummary,
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

// A reason is { summaries, message }. Every summary must be free of
// run-specific values (URLs, byte counts, content types) so identical failures
// across portals collapse onto one tally row; `message` carries those
// specifics.
function assertReasonShape(reason) {
    assert.ok(reason, 'expected a reason, got null');
    assert.ok(Array.isArray(reason.summaries), 'summaries must be an array');
    assert.ok(reason.summaries.length > 0, 'summaries must not be empty');
    for (const summary of reason.summaries) {
        assert.strictEqual(typeof summary, 'string');
        assert.ok(summary.length > 0, 'a summary must not be empty');
    }
    assert.strictEqual(typeof reason.message, 'string');
    assert.ok(reason.message.length > 0, 'message must not be empty');
}

// Most rules report exactly one summary; joining keeps the assertions below
// readable without hiding a rule that wrongly reports several.
function onlySummary(reason) {
    assert.strictEqual(reason.summaries.length, 1, `expected one summary, got ${reason.summaries.join(' | ')}`);
    return reason.summaries[0];
}

console.log('\nmissingMetaReason()');

test('returns null when title, description and image are all present', () => {
    assert.strictEqual(
        missingMetaReason({ title: 'Better Solano', description: 'The portal.', image: '/og.png' }),
        null,
    );
});

test('names og:image alone when only the image is missing', () => {
    const reason = missingMetaReason({ title: 'Better Solano', description: 'The portal.', image: '' });
    assertReasonShape(reason);
    const summary = onlySummary(reason);
    assert.match(summary, /og:image/);
    assert.doesNotMatch(summary, /og:title/);
    assert.doesNotMatch(summary, /og:description/);
});

test('names the title source and its <title> fallback when the title is missing', () => {
    const reason = missingMetaReason({ title: '', description: 'The portal.', image: '/og.png' });
    assertReasonShape(reason);
    assert.match(onlySummary(reason), /og:title.*<title>/);
});

test('names the description source and its meta fallback when it is missing', () => {
    const reason = missingMetaReason({ title: 'Better Solano', description: '', image: '/og.png' });
    assertReasonShape(reason);
    assert.match(onlySummary(reason), /og:description.*name=description/);
});

test('names every missing field at once in the log line, not just the first', () => {
    const reason = missingMetaReason({ title: '', description: '', image: '' });
    assertReasonShape(reason);
    assert.match(reason.message, /og:title/);
    assert.match(reason.message, /og:description/);
    assert.match(reason.message, /og:image/);
});

// The tally exists to make a systemic problem read as one number. If a portal
// missing both the image and the description reported a single combined
// summary, "how many portals have no og:image" would fragment across every
// combination it ever appeared in, and the real total would never be shown.
test('reports one summary per missing field so each field tallies independently', () => {
    const reason = missingMetaReason({ title: '', description: '', image: '' });
    assert.strictEqual(reason.summaries.length, 3);
    const both = missingMetaReason({ title: 'Better Solano', description: '', image: '' });
    const imageOnly = missingMetaReason({ title: 'Better Solano', description: 'The portal.', image: '' });
    assert.ok(
        both.summaries.includes(onlySummary(imageOnly)),
        'a portal missing two fields must still count towards the og:image row',
    );
});

test('a given set of missing fields always yields the same summaries', () => {
    const a = missingMetaReason({ title: '', description: 'x', image: '' });
    const b = missingMetaReason({ title: '', description: 'y', image: '' });
    assert.deepStrictEqual(a.summaries, b.summaries);
});

console.log('\nboilerplateReason()');

test('returns null for copy that is genuinely about the LGU', () => {
    assert.strictEqual(boilerplateReason('Better Solano', 'The transparency portal of Solano.'), null);
});

test('reports the description when the description is the template copy', () => {
    const reason = boilerplateReason('Better Solano', BOILERPLATE_DESCRIPTION);
    assertReasonShape(reason);
    assert.match(reason.message, /description/i);
});

test('reports the title when the title is the template copy', () => {
    const reason = boilerplateReason(BOILERPLATE_TITLE, 'The transparency portal of Solano.');
    assertReasonShape(reason);
    assert.match(reason.message, /title/i);
});

test('matches template copy that differs only in whitespace', () => {
    const spaced = `  ${BOILERPLATE_DESCRIPTION.replace(/ /g, '  ')}  `;
    assertReasonShape(boilerplateReason('Better Solano', spaced));
});

console.log('\nimageRejectionReason()');

const OK_IMAGE = {
    imageUrl: 'https://bettersolano.org/og.png',
    statusCode: 200,
    contentType: 'image/png',
    byteLength: 1024,
    truncatedOversize: false,
};

test('returns null for a 200 image/* response inside the size ceiling', () => {
    assert.strictEqual(imageRejectionReason(OK_IMAGE), null);
});

test('surfaces the underlying fetch error message instead of discarding it', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, fetchError: 'getaddrinfo ENOTFOUND cdn.example' });
    assertReasonShape(reason);
    assert.match(reason.message, /getaddrinfo ENOTFOUND cdn\.example/);
    assert.match(reason.message, /og\.png/);
    assert.doesNotMatch(onlySummary(reason), /ENOTFOUND/);
});

test('reports the HTTP status for a non-2xx image response', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, statusCode: 404 });
    assertReasonShape(reason);
    assert.match(reason.message, /404/);
    assert.doesNotMatch(onlySummary(reason), /404/);
});

test('treats an informational/redirect-leftover status below 200 as a failure', () => {
    assertReasonShape(imageRejectionReason({ ...OK_IMAGE, statusCode: 199 }));
});

test('reports the served content type when og:image is not an image', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, contentType: 'text/html; charset=utf-8' });
    assertReasonShape(reason);
    assert.match(reason.message, /text\/html/);
    assert.doesNotMatch(onlySummary(reason), /text\/html/);
});

test('reports a missing content type readably rather than as an empty string', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, contentType: '' });
    assertReasonShape(reason);
    assert.ok(!/""/.test(reason.message), `message should not contain an empty quoted value: ${reason.message}`);
});

test('reports actual and allowed size when the image is over the ceiling', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, byteLength: IMAGE_SIZE_CEILING_BYTES + 1 });
    assertReasonShape(reason);
    assert.match(reason.message, /KB/);
    assert.doesNotMatch(onlySummary(reason), /\d+\s*KB/);
});

test('rejects a response truncated at the size ceiling', () => {
    assertReasonShape(imageRejectionReason({ ...OK_IMAGE, byteLength: 10, truncatedOversize: true }));
});

test('reports the fetch error ahead of the status when both are present', () => {
    const reason = imageRejectionReason({ ...OK_IMAGE, statusCode: 0, fetchError: 'socket hang up' });
    assert.match(reason.message, /socket hang up/);
});

// A socket-level failure can surface as an Error with an empty message. A
// truthiness check on it falls through to the content-type branch, which then
// blames the image's Content-Type for what was really a network failure — the
// exact misattribution this reporting exists to remove.
test('still reports a fetch failure when the error message is empty', () => {
    const reason = imageRejectionReason({ imageUrl: OK_IMAGE.imageUrl, fetchError: '' });
    assertReasonShape(reason);
    assert.match(onlySummary(reason), /fetch/i);
    assert.doesNotMatch(reason.message, /Content-Type/i);
});

test('does not report a missing status as a content-type problem', () => {
    const reason = imageRejectionReason({ imageUrl: OK_IMAGE.imageUrl });
    assertReasonShape(reason);
    assert.doesNotMatch(reason.message, /not an image/i);
});

console.log('\nformatIneligibleSummary()');

test('returns an empty string when nothing was rejected', () => {
    assert.strictEqual(formatIneligibleSummary([]), '');
});

// Input is one entry per rejected portal, each holding that portal's summaries.
test('counts the total and tallies each distinct summary', () => {
    const block = formatIneligibleSummary([
        ['missing og:image'],
        ['missing og:image'],
        ['og:image returned an HTTP error'],
        ['missing og:image'],
    ]);
    assert.match(block, /Ineligible \(4\)/);
    assert.match(block, /missing og:image\s+3/);
    assert.match(block, /og:image returned an HTTP error\s+1/);
});

test('counts a portal once in the headline but on every rule row it failed', () => {
    const block = formatIneligibleSummary([['missing og:image', 'missing og:title/<title>'], ['missing og:image']]);
    assert.match(block, /Ineligible \(2\)/);
    assert.match(block, /missing og:image\s+2/);
    assert.match(block, /missing og:title\/<title>\s+1/);
});

test('does not double-count a summary repeated within one portal', () => {
    const block = formatIneligibleSummary([['same rule', 'same rule']]);
    assert.match(block, /same rule\s+1/);
});

test('orders tally rows by descending count', () => {
    const block = formatIneligibleSummary([['rare'], ['common'], ['common'], ['common']]);
    assert.ok(
        block.indexOf('common') < block.indexOf('rare'),
        `expected the 3x row before the 1x row:\n${block}`,
    );
});

test('breaks count ties alphabetically so the output is deterministic', () => {
    const forwards = formatIneligibleSummary([['beta'], ['alpha']]);
    const backwards = formatIneligibleSummary([['alpha'], ['beta']]);
    assert.strictEqual(forwards, backwards);
    assert.ok(forwards.indexOf('alpha') < forwards.indexOf('beta'), forwards);
});

test('aligns the counts into a column', () => {
    const block = formatIneligibleSummary([['short'], ['a much longer reason phrase']]);
    const countColumns = block
        .split('\n')
        .filter((line) => /\s\d+$/.test(line))
        .map((line) => line.lastIndexOf('1'));
    assert.strictEqual(new Set(countColumns).size, 1, `counts not aligned:\n${block}`);
});

console.log(failures === 0 ? '\n✅ All eligibility-reporting tests passed.\n' : `\n❌ ${failures} test(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
