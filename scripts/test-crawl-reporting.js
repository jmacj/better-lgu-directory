// Zero-dependency integration test for crawlEntry(): proves that each way a
// portal can be kept out of the Featured pool reaches the log as its own
// specific reason, end to end, against a real HTTP server. Run with:
//
//   node scripts/test-crawl-reporting.js
//
// It exits non-zero on any failure.
//
// Why this exists alongside test-featured-eligibility.js: that file tests the
// reason helpers in isolation, which leaves the wiring — crawlEntry picking
// the right helper for the branch it is in, and passing it the right values —
// untested. Since the whole point of this reporting is that the log says the
// true cause, a mis-wired branch (a network failure reported as a
// content-type problem, say) would be exactly the bug that matters and the
// unit tests would still pass. Two loopback servers on ephemeral ports stand
// in for the portals: no network access, no fixtures on disk, nothing to keep
// in sync with a live site.

const assert = require('assert');
const http = require('http');
const {
    IMAGE_SIZE_CEILING_BYTES,
    BOILERPLATE_TITLE,
    PortalUnreachableError,
    crawlEntry,
} = require('./crawl-lgu-meta.js');

let failures = 0;
const tests = [];
function test(name, fn) {
    tests.push({ name, fn });
}

function page({ title = 'Better Fixture', description = 'The transparency portal of Fixture.', image = '/img/ok.png' }) {
    return [
        title === null ? '' : `<title>${title}</title>`,
        description === null ? '' : `<meta name="description" content="${description}">`,
        image === null ? '' : `<meta property="og:image" content="${image}">`,
    ].join('');
}

// Every path the crawler can take, keyed by the URL the fixture serves it on.
const ROUTES = {
    '/good/': page({}),
    '/no-image/': page({ image: null }),
    '/no-title/': page({ title: null }),
    '/nothing/': page({ title: null, description: null, image: null }),
    '/boilerplate/': page({ title: BOILERPLATE_TITLE }),
    '/image-404/': page({ image: '/img/gone.png' }),
    '/image-html/': page({ image: '/img/not-an-image' }),
    '/image-big/': page({ image: '/img/big.png' }),
    // Port 1 is reserved and never listening, so this reproduces a refused
    // connection on the image without needing an offline host.
    '/image-dead/': page({ image: 'http://127.0.0.1:1/img/og.png' }),
};

function startPortalServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            if (req.url === '/robots.txt') {
                res.writeHead(404).end();
            } else if (req.url === '/img/ok.png') {
                res.writeHead(200, { 'content-type': 'image/png' }).end(Buffer.alloc(1024));
            } else if (req.url === '/img/big.png') {
                res.writeHead(200, { 'content-type': 'image/png' }).end(
                    Buffer.alloc(IMAGE_SIZE_CEILING_BYTES + 2048),
                );
            } else if (req.url === '/img/not-an-image') {
                res.writeHead(200, { 'content-type': 'text/html' }).end('<p>not an image</p>');
            } else if (req.url === '/down/') {
                res.writeHead(503).end();
            } else if (req.url in ROUTES) {
                res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(ROUTES[req.url]);
            } else {
                res.writeHead(404).end();
            }
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

// A separate origin, because robots.txt is per-origin and a blanket disallow
// here would take every other case with it.
function startBlockedServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            if (req.url === '/robots.txt') {
                res.writeHead(200, { 'content-type': 'text/plain' }).end('User-agent: *\nDisallow: /\n');
            } else {
                res.writeHead(200, { 'content-type': 'text/html' }).end(page({}));
            }
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

async function main() {
    const portal = await startPortalServer();
    const blocked = await startBlockedServer();
    const origin = (path) => `http://127.0.0.1:${portal.address().port}${path}`;
    const blockedOrigin = `http://127.0.0.1:${blocked.address().port}/`;

    const crawl = (path) => crawlEntry({ name: 'Fixture LGU' }, 'fixture.test', origin(path));

    // A rejection must always be reportable: main() prints reason.message and
    // tallies reason.summaries, so a null or half-built reason would surface as
    // a crash blamed on the portal.
    function assertRejected(result, { summaryMatch, messageMatch, messageNotMatch }) {
        assert.strictEqual(result.row, null, 'expected no row');
        assert.ok(result.reason, 'a rejection must carry a reason');
        assert.ok(Array.isArray(result.reason.summaries) && result.reason.summaries.length > 0);
        const joined = result.reason.summaries.join(' | ');
        if (summaryMatch) assert.match(joined, summaryMatch);
        if (messageMatch) assert.match(result.reason.message, messageMatch);
        if (messageNotMatch) assert.doesNotMatch(result.reason.message, messageNotMatch);
    }

    test('a complete, original portal yields a row and no reason', async () => {
        const { row, reason } = await crawl('/good/');
        assert.strictEqual(reason, null);
        assert.strictEqual(row.name, 'Fixture LGU');
        assert.strictEqual(row.title, 'Better Fixture');
        assert.ok(row.image.endsWith('/img/ok.png'), row.image);
        assert.ok(row.order_key.length > 0);
    });

    test('a missing og:image is reported as a missing og:image', async () => {
        assertRejected(await crawl('/no-image/'), {
            summaryMatch: /missing og:image/,
            messageNotMatch: /og:title/,
        });
    });

    test('a page with no title at all names the title and its fallback', async () => {
        assertRejected(await crawl('/no-title/'), { summaryMatch: /og:title/ });
    });

    test('a page missing every field reports all three, one summary each', async () => {
        const result = await crawl('/nothing/');
        assertRejected(result, {});
        assert.strictEqual(result.reason.summaries.length, 3);
    });

    test('template copy is reported as boilerplate, naming the field', async () => {
        assertRejected(await crawl('/boilerplate/'), {
            summaryMatch: /boilerplate/i,
            messageMatch: /title/i,
        });
    });

    test('a 404 on the og:image reports the status, not a missing tag', async () => {
        assertRejected(await crawl('/image-404/'), {
            summaryMatch: /HTTP error/,
            messageMatch: /404/,
            messageNotMatch: /missing/,
        });
    });

    test('an og:image that is not an image reports the served type', async () => {
        assertRejected(await crawl('/image-html/'), {
            summaryMatch: /not an image/,
            messageMatch: /text\/html/,
        });
    });

    test('an oversized og:image reports the ceiling it broke', async () => {
        assertRejected(await crawl('/image-big/'), {
            summaryMatch: /size ceiling/,
            messageMatch: /KB/,
        });
    });

    test('an unreachable og:image reports the network error, not a content type', async () => {
        assertRejected(await crawl('/image-dead/'), {
            summaryMatch: /could not be fetched/,
            messageMatch: /ECONNREFUSED/,
            messageNotMatch: /not an image/,
        });
    });

    test('a robots.txt blanket disallow is reported as such', async () => {
        assertRejected(await crawlEntry({ name: 'Fixture LGU' }, 'blocked.test', blockedOrigin), {
            summaryMatch: /robots\.txt/,
            messageMatch: /robots\.txt/,
        });
    });

    // The distinction the reporting must not blur: a portal that is down keeps
    // its previous row (#132), so it throws instead of returning a rejection.
    test('a portal returning 503 throws PortalUnreachableError, not a rejection', async () => {
        await assert.rejects(() => crawl('/down/'), PortalUnreachableError);
    });

    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`  ✅ ${name}`);
        } catch (err) {
            failures++;
            console.log(`  ❌ ${name}\n     ${err.message}`);
        }
    }

    portal.close();
    blocked.close();
    console.log(failures === 0 ? '\n✅ All crawl reporting tests passed.\n' : `\n❌ ${failures} test(s) failed.\n`);
    process.exit(failures === 0 ? 0 : 1);
}

console.log('\ncrawlEntry() reporting');
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
