const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { README_PATH, parseTable, validateLgu } = require('./sync-to-data.js');

const LGU_META_PATH = process.argv[2] || path.join(__dirname, '../_data/lgu-meta.yml');
const LOGO_META_PATH = process.argv[3] || path.join(__dirname, '../_data/lgu-logos.yml');
const LOGO_DIR = process.argv[4] || path.join(__dirname, '../assets/images/lgu-logos');

const USER_AGENT = 'BetterLGUDirectoryBot/1.0 (+https://lgu.bettergov.ph)';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const IMAGE_SIZE_CEILING_BYTES = 400 * 1024; // #127: 400KB ceiling, checked on fetched bytes

// #179 Logo band: raster candidates need a 64px shortest side (SVG is exempt
// — vector, no intrinsic ceiling). 1.2MB byte ceiling per FINDINGS.md
// (prototype/logo-wall branch): at 200KB only 16/26 Active portals resolved a
// Logo (38% cull, mostly the ceiling itself — portals commonly ship
// unoptimized favicons); at 1.2MB, 23/26 resolve (12% cull, all three
// remaining failures for real reasons — under-floor or missing icons).
const LOGO_MIN_PX = 64;
const LOGO_MAX_BYTES = 1.2 * 1024 * 1024;

// #122: the crawl excludes any Entry whose resolved title/description is
// byte-identical (whitespace-normalised) to BetterGov.ph's generic template
// copy — a portal can be mechanically complete yet still not be "about" the
// LGU. Kept in one place so a future template revision is a one-line change.
const BOILERPLATE_DESCRIPTION =
    'Community-powered portal of the Republic of the Philippines. Access government services, stay updated with the latest news, and find information about the Philippines.';
const BOILERPLATE_TITLE =
    'BetterGov.ph | Republic of the Philippines | Community Powered Government Portal';

function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function isBoilerplate(title, description) {
    const normDescription = normalizeWhitespace(description);
    const normTitle = normalizeWhitespace(title);
    return (
        normDescription === normalizeWhitespace(BOILERPLATE_DESCRIPTION) ||
        normTitle === normalizeWhitespace(BOILERPLATE_TITLE)
    );
}

// --- Ineligibility reasons -------------------------------------------------
//
// Every rule that can keep an Entry out of the Featured pool (or the Logo
// band) reports why, as a { summaries, message } pair:
//
//   summaries — one or more variable-free phrases naming the rule(s) that
//               failed. These are the grouping keys for the end-of-run tally,
//               so they must never embed a URL, byte count, status code or
//               content type. A portal missing two meta fields reports two
//               summaries, so each field's total stays readable as one number
//               rather than splitting across every combination it appeared in.
//   message   — the single per-portal log line, which does carry those
//               specifics.
//
// Before this, all of these paths returned a bare null and main() printed one
// static "incomplete, boilerplate, or robots-disallowed" line for every one of
// them — which named three causes out of seven and made a missing meta tag
// indistinguishable from a 404 on the og:image.
function reason(summaries, message) {
    const list = Array.isArray(summaries) ? summaries : [summaries];
    return { summaries: list, message: message || list.join('; ') };
}

// extractMeta() resolves each field through its fallback chain first, so a
// blank here means *every* source for that field was absent — name them all,
// otherwise the log sends the reader looking for an og: tag they may have
// deliberately skipped in favour of the plain HTML one.
const META_FIELD_SOURCES = [
    ['image', 'og:image'],
    ['title', 'og:title/<title>'],
    ['description', 'og:description/meta[name=description]'],
];

function missingMetaReason({ title, description, image }) {
    const values = { title, description, image };
    const missing = META_FIELD_SOURCES.filter(([field]) => !values[field]).map(([, label]) => label);
    if (missing.length === 0) return null;
    // One summary per absent field: a portal missing both the image and the
    // description counts towards each field's own tally row, so "how many
    // portals have no og:image at all" is a single number in the summary.
    return reason(
        missing.map((label) => `missing ${label}`),
        `missing ${missing.join(' + ')}`,
    );
}

function boilerplateReason(title, description) {
    // isBoilerplate() stays the single gate (see its comment above) so a future
    // template revision only has to be made there; the per-field checks below
    // exist purely to tell the operator which field tripped it.
    if (!isBoilerplate(title, description)) return null;

    const matched = [];
    if (normalizeWhitespace(title) === normalizeWhitespace(BOILERPLATE_TITLE)) matched.push('title');
    if (normalizeWhitespace(description) === normalizeWhitespace(BOILERPLATE_DESCRIPTION)) {
        matched.push('description');
    }
    const generic = "BetterGov.ph's generic template copy";
    return reason(
        'boilerplate BetterGov.ph template copy',
        // A rule added to isBoilerplate() but not mirrored here still reports —
        // just without naming the field.
        matched.length === 0
            ? `title/description is still ${generic}`
            : `${matched.join(' and ')} ${matched.length > 1 ? 'are' : 'is'} still ${generic}`,
    );
}

function formatBytes(bytes) {
    return `${(bytes / 1024).toFixed(1)}KB`;
}

// The og:image is fetched separately from the page, so it has four distinct
// ways to fail. The page itself answering fine means none of them make the
// portal "unreachable" — they are all metadata-quality rejections.
function imageRejectionReason({ imageUrl, fetchError, statusCode, contentType, byteLength, truncatedOversize }) {
    // Tested for presence, not truthiness: an Error carrying an empty message
    // still means the fetch failed, and falling through would misreport it as
    // a content-type problem — exactly the misattribution this reporting
    // exists to remove.
    if (fetchError !== undefined && fetchError !== null) {
        const detail = String(fetchError) || 'no error detail available';
        return reason('og:image could not be fetched', `og:image could not be fetched (${imageUrl}): ${detail}`);
    }
    if (!Number.isFinite(statusCode)) {
        return reason('og:image response was unusable', `og:image returned no usable HTTP status (${imageUrl})`);
    }
    if (statusCode >= 400 || statusCode < 200) {
        return reason('og:image returned an HTTP error', `og:image returned HTTP ${statusCode} (${imageUrl})`);
    }
    const normalizedType = (contentType || '').toLowerCase();
    if (!normalizedType.startsWith('image/')) {
        return reason(
            'og:image is not an image',
            `og:image served as ${normalizedType ? `"${normalizedType}"` : 'no Content-Type'} (${imageUrl})`,
        );
    }
    if (truncatedOversize || byteLength > IMAGE_SIZE_CEILING_BYTES) {
        // A truncated fetch stopped reading at the ceiling, so the real size is
        // unknown — say so rather than reporting the ceiling as the size.
        const ceiling = formatBytes(IMAGE_SIZE_CEILING_BYTES);
        return reason(
            'og:image exceeds the size ceiling',
            truncatedOversize
                ? `og:image exceeds the ${ceiling} ceiling (truncated mid-download) (${imageUrl})`
                : `og:image is ${formatBytes(byteLength)}, over the ${ceiling} ceiling (${imageUrl})`,
        );
    }
    return null;
}

// Groups the run's rejections by summary so a systemic problem (say, twelve
// portals with no og:image at all) reads as one line instead of needing the
// whole per-portal log scrolled and counted by hand. Takes one entry per
// rejected portal — each being that portal's list of summaries — so the
// headline count stays a portal count even though a portal can fail two rules
// at once, in which case it contributes to both tally rows.
function formatIneligibleSummary(rejections, label = 'Ineligible') {
    if (rejections.length === 0) return '';

    const counts = new Map();
    for (const summaries of rejections) {
        for (const summary of new Set(summaries)) {
            counts.set(summary, (counts.get(summary) || 0) + 1);
        }
    }

    const rows = [...counts.entries()].sort(
        (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
    );
    const labelWidth = Math.max(...rows.map(([label]) => label.length));
    const countWidth = Math.max(...rows.map(([, count]) => String(count).length));

    return [
        `${label} (${rejections.length}):`,
        ...rows.map(([label, count]) => `  ${label.padEnd(labelWidth)}  ${String(count).padStart(countWidth)}`),
    ].join('\n');
}

// Escape a value for safe embedding inside a double-quoted YAML scalar.
function yamlStr(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function sha1First8(value) {
    return crypto.createHash('sha1').update(value).digest('hex').slice(0, 8);
}

// Marker used internally to distinguish "the portal looked down" (network
// error, timeout, non-2xx/3xx on the page itself) from "the portal answered
// but the metadata isn't good enough" (missing/oversized image, boilerplate
// copy, robots disallow). Only the former preserves the previous row — see
// the catch block in main() below and issue #132's failure-tolerance
// requirement.
class PortalUnreachableError extends Error {}

function requestOnce(urlString, { method = 'GET', maxBytes } = {}) {
    return new Promise((resolve, reject) => {
        let url;
        try {
            url = new URL(urlString);
        } catch (err) {
            reject(new PortalUnreachableError(`Invalid URL: ${urlString}`));
            return;
        }

        const lib = url.protocol === 'http:' ? http : https;
        const req = lib.request(
            url,
            {
                method,
                headers: { 'User-Agent': USER_AGENT },
                timeout: REQUEST_TIMEOUT_MS,
            },
            (res) => {
                const chunks = [];
                let total = 0;
                let aborted = false;

                res.on('data', (chunk) => {
                    if (aborted) return;
                    total += chunk.length;
                    if (maxBytes && total > maxBytes) {
                        aborted = true;
                        res.destroy();
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: Buffer.concat(chunks),
                            truncatedOversize: true,
                        });
                        return;
                    }
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    if (aborted) return;
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: Buffer.concat(chunks),
                        truncatedOversize: false,
                    });
                });
                res.on('error', (err) => reject(new PortalUnreachableError(err.message)));
            },
        );

        req.on('timeout', () => {
            req.destroy(new PortalUnreachableError(`Timed out fetching ${urlString}`));
        });
        req.on('error', (err) => reject(new PortalUnreachableError(err.message)));
        req.end();
    });
}

// Follows redirects manually (Node's http/https do not) so we can keep
// enforcing our own timeout and User-Agent on every hop.
async function fetchFollowingRedirects(urlString, opts = {}) {
    let currentUrl = urlString;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        const res = await requestOnce(currentUrl, opts);
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            currentUrl = new URL(res.headers.location, currentUrl).toString();
            continue;
        }
        return { ...res, finalUrl: currentUrl };
    }
    throw new PortalUnreachableError(`Too many redirects fetching ${urlString}`);
}

// Minimal hand-rolled robots.txt check (#128) — deliberately not a full RFC
// parser: we fetch exactly one page per site, so path-level rule matching
// buys nothing, and a library would be this repo's first npm dependency.
// Looks only for a blanket "Disallow: /" in the "*" group or a group naming
// our UA, and reads any Crawl-delay set for either.
async function checkRobots(origin) {
    let body;
    try {
        const res = await fetchFollowingRedirects(new URL('/robots.txt', origin).toString());
        if (res.statusCode >= 400) {
            return { disallowed: false, crawlDelaySeconds: 0 };
        }
        body = res.body.toString('utf8');
    } catch {
        // No robots.txt (or it's unreachable) is not itself a reason to skip —
        // absence of the file means no rules apply.
        return { disallowed: false, crawlDelaySeconds: 0 };
    }

    const ourUaLower = 'betterlgudirectorybot';
    let currentAgents = [];
    let groupJustStarted = false;
    let disallowed = false;
    let crawlDelaySeconds = 0;

    for (const rawLine of body.split(/\r?\n/)) {
        const line = rawLine.replace(/#.*$/, '').trim();
        if (!line) continue;
        const [rawKey, ...rest] = line.split(':');
        if (!rawKey || rest.length === 0) continue;
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':').trim();

        if (key === 'user-agent') {
            if (!groupJustStarted) currentAgents = [];
            currentAgents.push(value.toLowerCase());
            groupJustStarted = true;
            continue;
        }

        groupJustStarted = false;
        const appliesToUs = currentAgents.includes('*') || currentAgents.includes(ourUaLower);
        if (!appliesToUs) continue;

        if (key === 'disallow' && value === '/') {
            disallowed = true;
        } else if (key === 'crawl-delay') {
            const seconds = Number(value);
            if (Number.isFinite(seconds) && seconds > crawlDelaySeconds) {
                crawlDelaySeconds = seconds;
            }
        }
    }

    return { disallowed, crawlDelaySeconds };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Attribute parsing shared by title/meta/link extraction — deliberately regex
// based rather than a DOM parser, matching this repo's zero-dependency rule.
function parseTagAttrs(tagSource) {
    const attrs = {};
    const attrPattern = /([a-zA-Z][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let match;
    while ((match = attrPattern.exec(tagSource)) !== null) {
        const name = match[1].toLowerCase();
        const value = match[3] !== undefined ? match[3] : match[4];
        attrs[name] = value;
    }
    return attrs;
}

function decodeHtmlEntities(value) {
    return String(value)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'");
}

function extractMeta(html) {
    const metaTags = html.match(/<meta\s+[^>]*>/gi) || [];
    const meta = {};
    for (const tag of metaTags) {
        const attrs = parseTagAttrs(tag);
        const key = (attrs.property || attrs.name || '').toLowerCase();
        if (key && attrs.content !== undefined) {
            meta[key] = attrs.content;
        }
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const documentTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]).trim() : '';

    // #122: title resolves og:title falling back to <title>; description
    // resolves og:description falling back to <meta name="description">;
    // the image has no fallback source — og:image only.
    const title = decodeHtmlEntities(meta['og:title'] || documentTitle || '').trim();
    const description = decodeHtmlEntities(meta['og:description'] || meta['description'] || '').trim();
    const image = (meta['og:image'] || '').trim();

    return { title, description, image };
}

// README domain cells are markdown links — e.g. "[bettersolano.org]
// (https://bettersolano.org)" — the same raw form validateLgu() stores
// (sync-to-data.js relies on kramdown re-processing that text at render
// time; see index.md's `markdown="1"` table wrapper). Extract the real URL
// to crawl and the bare hostname to display, falling back to treating the
// whole cell as a bare hostname if it isn't a markdown link.
function extractDomainLink(rawCell) {
    const match = /\[([^\]]+)\]\(([^)]+)\)/.exec(rawCell || '');
    if (match) {
        return { label: match[1].trim(), url: match[2].trim() };
    }
    const bare = String(rawCell || '').trim();
    return { label: bare, url: /^https?:\/\//i.test(bare) ? bare : `https://${bare}` };
}

// --- Shared fetch (#179) ----------------------------------------------------
//
// Every Active portal is fetched exactly once per run; the result feeds both
// the Featured predicate (judgeFeatured) and the Logo predicate (judgeLogo)
// below. Returns `{ ok: true, html, finalUrl, robots }` on success, or
// `{ ok: false, reason }` for a reachable-but-blocked portal (robots
// disallow — a rejection both predicates treat leniently in their own way,
// not a page-fetch failure). Throws PortalUnreachableError when the page
// itself looks down — the one condition that means "no fetch happened at
// all" for both predicates.
async function fetchPortalPage(origin) {
    const robots = await checkRobots(origin);
    if (robots.disallowed) {
        return {
            ok: false,
            reason: reason('robots.txt disallows our crawler', `robots.txt at ${origin} disallows ${USER_AGENT}`),
        };
    }
    if (robots.crawlDelaySeconds > 0) {
        await sleep(robots.crawlDelaySeconds * 1000);
    }

    const pageRes = await fetchFollowingRedirects(origin);
    if (pageRes.statusCode >= 400 || pageRes.statusCode < 200) {
        throw new PortalUnreachableError(`returned HTTP ${pageRes.statusCode}`);
    }

    const contentType = (pageRes.headers['content-type'] || '').toLowerCase();
    if (contentType && !contentType.includes('html')) {
        throw new PortalUnreachableError(`did not return HTML (${contentType})`);
    }

    return { ok: true, html: pageRes.body.toString('utf8'), finalUrl: pageRes.finalUrl, robots };
}

// --- Featured Portal predicate (#122/#125/#127) -----------------------------
//
// Judges an already-fetched portal against the Featured Portal eligibility
// rules. Split out of the old crawlEntry() so the single fetch above can also
// feed judgeLogo() — crawlEntry() itself (below) is kept as a thin wrapper
// with its original signature/behaviour for the existing tests.
async function judgeFeatured(entry, displayDomain, fetched) {
    const rejected = (why) => ({ row: null, reason: why });
    const { html, finalUrl, robots } = fetched;

    const { title, description, image } = extractMeta(html);

    // Mechanically incomplete — no fallback (#125), no row.
    const incomplete = missingMetaReason({ title, description, image });
    if (incomplete) {
        return rejected(incomplete);
    }

    // Complete but not "about" the LGU (#122's quality floor) — no row.
    const boilerplate = boilerplateReason(title, description);
    if (boilerplate) {
        return rejected(boilerplate);
    }

    if (robots.crawlDelaySeconds > 0) {
        await sleep(robots.crawlDelaySeconds * 1000);
    }

    const imageUrl = new URL(image, finalUrl).toString();
    let imageRes;
    try {
        imageRes = await fetchFollowingRedirects(imageUrl, { maxBytes: IMAGE_SIZE_CEILING_BYTES });
    } catch (err) {
        // The image failing to load is a metadata-quality problem, not the
        // whole portal being down — the page itself answered fine.
        return rejected(imageRejectionReason({ imageUrl, fetchError: err.message }));
    }

    const imageRejection = imageRejectionReason({
        imageUrl,
        statusCode: imageRes.statusCode,
        contentType: imageRes.headers['content-type'] || '',
        byteLength: imageRes.body.length,
        truncatedOversize: imageRes.truncatedOversize,
    });
    if (imageRejection) {
        return rejected(imageRejection);
    }

    return {
        row: {
            name: entry.name,
            domain: displayDomain,
            image: imageUrl,
            title,
            description,
            order_key: sha1First8(displayDomain),
        },
        reason: null,
    };
}

// Crawls one Entry's portal and returns { row, reason }: a complete lgu-meta
// row when the portal clears the bar, or `row: null` plus the specific
// { summary, message } rejection when it is reachable but does not meet the
// completeness/quality bar (#122, #125, #127). Throws PortalUnreachableError
// if the portal itself looks down — callers use that to decide whether to
// preserve the previous row instead of dropping it. Kept as a thin wrapper
// over fetchPortalPage()+judgeFeatured() so its external contract (used by
// scripts/test-crawl-reporting.js) is unchanged by the #179 fetch/judge split.
async function crawlEntry(entry, displayDomain, origin) {
    const fetched = await fetchPortalPage(origin);
    if (!fetched.ok) {
        return { row: null, reason: fetched.reason };
    }
    return judgeFeatured(entry, displayDomain, fetched);
}

function parseExistingLguMeta(filePath) {
    // Reads the previously-generated _data/lgu-meta.yml, if any, so an
    // unreachable-this-run portal can keep its last-known-good row (#132:
    // "a portal that's down leaves its previous row untouched"). Hand-rolled
    // reader matching the hand-rolled writer below — this file's schema is
    // simple and fixed, so a YAML library is not worth adding. Keyed by the
    // clean display domain (not the README's raw markdown cell).
    if (!fs.existsSync(filePath)) return new Map();

    const content = fs.readFileSync(filePath, 'utf8');
    const byDomain = new Map();
    const entryBlocks = content.split(/\n(?=- name:)/);

    for (const block of entryBlocks) {
        if (!block.trim().startsWith('- name:')) continue;
        const get = (key) => {
            const m = block.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
            return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : '';
        };
        const domain = get('domain');
        if (!domain) continue;
        byDomain.set(domain, {
            name: get('name'),
            domain,
            image: get('image'),
            title: get('title'),
            description: get('description'),
            order_key: get('order_key'),
        });
    }
    return byDomain;
}

function formatLguMetaYaml(rows) {
    if (rows.length === 0) return '';
    return rows
        .map((row) =>
            [
                `- name: "${yamlStr(row.name)}"`,
                `  domain: "${yamlStr(row.domain)}"`,
                `  image: "${yamlStr(row.image)}"`,
                `  title: "${yamlStr(row.title)}"`,
                `  description: "${yamlStr(row.description)}"`,
                `  order_key: "${yamlStr(row.order_key)}"`,
            ].join('\n'),
        )
        .join('\n');
}

// --- Logo predicate (#179) --------------------------------------------------

function linkTags(html) {
    return [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => {
        const attrs = parseTagAttrs(m[0]);
        return {
            rel: (attrs.rel || '').toLowerCase(),
            href: attrs.href || '',
            sizes: attrs.sizes || '',
            type: attrs.type || '',
        };
    });
}

function declaredPx(sizes) {
    const m = /(\d+)\s*x\s*(\d+)/i.exec(sizes || '');
    return m ? Number(m[1]) : 0;
}

// Logo resolution chain, in order (#179, FINDINGS.md on prototype/logo-wall):
// SVG rel=icon -> any other rel=icon -> largest manifest icon ->
// apple-touch-icon -> /favicon.ico. SVG/rel=icon ranks above
// apple-touch-icon deliberately: apple-touch-icon is conventionally an
// opaque square with internal padding (fine on iOS, but reads as a boxy tile
// on the plateless Logo band). Built from the SAME fetched HTML the Featured
// predicate uses — no second page fetch — though resolving a manifest or a
// candidate icon does require its own request, same as the Featured
// predicate's separate og:image fetch.
async function logoCandidates(pageUrl, html) {
    const out = [];
    const links = linkTags(html);
    const abs = (href) => new URL(href, pageUrl).toString();

    for (const l of links.filter((l) => /(^|\s)icon(\s|$)/.test(l.rel) && l.href)) {
        const svg = l.type === 'image/svg+xml' || /\.svg(\?|$|#)/i.test(l.href);
        out.push({ source: svg ? 'rel-icon-svg' : 'rel-icon', url: abs(l.href), declaredPx: declaredPx(l.sizes) });
    }

    const manifestLink = links.find((l) => l.rel.includes('manifest') && l.href);
    if (manifestLink) {
        try {
            const res = await fetchFollowingRedirects(abs(manifestLink.href));
            const icons = JSON.parse(res.body.toString('utf8')).icons || [];
            const largest = icons
                .filter((i) => i && i.src)
                .sort((a, b) => declaredPx(b.sizes) - declaredPx(a.sizes))[0];
            if (largest) {
                out.push({
                    source: 'manifest',
                    url: new URL(largest.src, res.finalUrl).toString(),
                    declaredPx: declaredPx(largest.sizes),
                });
            }
        } catch {
            // A broken/unreachable manifest is one fewer candidate, not a crawl
            // failure — the chain just falls through to apple-touch-icon/favicon.
        }
    }

    for (const l of links.filter((l) => l.rel.includes('apple-touch-icon') && l.href)) {
        out.push({ source: 'apple-touch-icon', url: abs(l.href), declaredPx: declaredPx(l.sizes) || 180 });
    }

    out.push({ source: 'favicon.ico', url: abs('/favicon.ico'), declaredPx: 0 });

    const rank = (c) => {
        if (c.source === 'rel-icon-svg') return 0;
        if (c.source === 'rel-icon') return 1;
        if (c.source === 'manifest') return 2;
        if (c.source === 'apple-touch-icon') return 3;
        return 4; // favicon.ico
    };
    return out.sort((a, b) => rank(a) - rank(b) || b.declaredPx - a.declaredPx);
}

// Zero-dependency intrinsic-size + format sniff, PNG/ICO/SVG/JPEG/WEBP.
// Prototype-grade: JPEG/WEBP report px:0 (their headers aren't parsed), which
// means they always fail the 64px floor rather than risk mis-measuring one —
// in practice every winning candidate observed in FINDINGS.md was PNG, ICO,
// or SVG.
function intrinsicPx(buf, contentType) {
    if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
        return { px: buf.readUInt32BE(16), ext: 'png' };
    if (buf.length >= 6 && buf.slice(0, 4).equals(Buffer.from([0x00, 0x00, 0x01, 0x00]))) {
        let max = 0;
        const n = buf.readUInt16LE(4);
        for (let i = 0; i < n; i++) max = Math.max(max, buf[6 + i * 16] || 256);
        return { px: max, ext: 'ico' };
    }
    const head = buf.slice(0, 400).toString('utf8');
    if (/<svg/i.test(head) || (contentType || '').includes('svg')) return { px: Infinity, ext: 'svg' };
    if (buf.length >= 3 && buf.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { px: 0, ext: 'jpg' };
    if (
        buf.length >= 12 &&
        buf.slice(0, 4).toString('ascii') === 'RIFF' &&
        buf.slice(8, 12).toString('ascii') === 'WEBP'
    )
        return { px: 0, ext: 'webp' };
    return { px: 0, ext: 'bin' };
}

// SVG sanitization on ingest (#179): reject anything that could execute
// script or reach off-domain — a <script> tag, <foreignObject> (can embed
// arbitrary HTML/script inside SVG), or an external href/xlink:href (data:
// and same-document #fragment references are fine; http(s):// is not).
function svgIsUnsafe(buf) {
    const s = buf.toString('utf8');
    return /<script[\s>]|<foreignObject[\s>]|(?:xlink:href|href)\s*=\s*["']?\s*https?:/i.test(s);
}

async function tryLogoCandidate(c) {
    let res;
    try {
        res = await fetchFollowingRedirects(c.url, { maxBytes: LOGO_MAX_BYTES });
    } catch (err) {
        return { ok: false, why: `could not be fetched: ${err.message}` };
    }
    if (res.statusCode !== 200) return { ok: false, why: `HTTP ${res.statusCode}` };
    const ct = (res.headers['content-type'] || '').toLowerCase();
    if (ct.includes('html')) return { ok: false, why: 'served HTML (SPA catch-all)' };
    if (res.body.length === 0) return { ok: false, why: 'empty body' };
    if (res.truncatedOversize || res.body.length > LOGO_MAX_BYTES) {
        return { ok: false, why: `over the ${formatBytes(LOGO_MAX_BYTES)} ceiling` };
    }
    const { px, ext } = intrinsicPx(res.body, ct);
    if (ext === 'bin') return { ok: false, why: `unrecognized format (${ct || 'no content-type'})` };
    if (ext === 'svg' && svgIsUnsafe(res.body)) {
        return { ok: false, why: 'SVG failed sanitize (script/foreignObject/external href)' };
    }
    if (ext !== 'svg' && px < LOGO_MIN_PX) return { ok: false, why: `${px}px, under the ${LOGO_MIN_PX}px floor` };
    return { ok: true, buf: res.body, ext, px, source: c.source, url: c.url };
}

// Judges an already-fetched portal against the Logo predicate — independent
// of judgeFeatured() above (a portal can resolve a Logo without being
// Featured, or vice versa), but built from the same single fetch.
async function judgeLogo(entry, displayDomain, fetched) {
    const tried = [];
    for (const c of await logoCandidates(fetched.finalUrl, fetched.html)) {
        let r;
        try {
            r = await tryLogoCandidate(c);
        } catch (err) {
            r = { ok: false, why: err.message };
        }
        tried.push(`${c.source} ${c.url} → ${r.ok ? 'OK' : r.why}`);
        if (r.ok) {
            return {
                row: {
                    name: entry.name,
                    domain: displayDomain,
                    file: `${displayDomain}.${r.ext}`,
                    ext: r.ext,
                    source: r.source,
                    px: r.px === Infinity ? 'vector' : r.px,
                    bytes: r.buf.length,
                    // Two independent stable orders for the home page's two-row
                    // marquee (#179): `order_key` for row 1 (same scheme as the
                    // Featured pool's shuffled-but-stable ordering), and a
                    // differently-salted `shuffle_key` for row 2. Hashing a
                    // different input per row, rather than reordering the same
                    // sequence, is what keeps the two rows from ever drifting
                    // back into a shared run of matches as they counter-scroll
                    // (see FINDINGS.md on prototype/logo-wall) — sorting by an
                    // unrelated hash is this repo's build-time (Liquid, no
                    // arbitrary JS) substitute for the prototype's mulberry32
                    // Fisher-Yates shuffle. Seed values only — main()
                    // replaces both via assignRankKeys() once the pool is known.
                    order_key: sha1First8(displayDomain),
                    shuffle_key: sha1First8(`${displayDomain}:lb2`),
                },
                buf: r.buf,
                reason: null,
            };
        }
    }
    return {
        row: null,
        buf: null,
        reason: reason(
            'no Logo candidate resolved',
            `no Logo candidate passed for ${displayDomain} (tried ${tried.length}): ${tried.join(' | ')}`,
        ),
    };
}

function parseExistingLguLogos(filePath) {
    // Same shape/rationale as parseExistingLguMeta() above, for
    // _data/lgu-logos.yml. A portal that fails to resolve a Logo this run
    // keeps its last-known-good row *and* file (the file is never rewritten
    // when kept, so it just needs to already exist on disk from a prior run).
    if (!fs.existsSync(filePath)) return new Map();

    const content = fs.readFileSync(filePath, 'utf8');
    const byDomain = new Map();
    const entryBlocks = content.split(/\n(?=- name:)/);

    for (const block of entryBlocks) {
        if (!block.trim().startsWith('- name:')) continue;
        const get = (key) => {
            const m = block.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
            return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : '';
        };
        const domain = get('domain');
        if (!domain) continue;
        const bytesMatch = block.match(/bytes:\s*(\d+)/);
        byDomain.set(domain, {
            name: get('name'),
            domain,
            file: get('file'),
            ext: get('ext'),
            source: get('source'),
            px: get('px'),
            bytes: bytesMatch ? Number(bytesMatch[1]) : 0,
            order_key: get('order_key'),
            shuffle_key: get('shuffle_key'),
        });
    }
    return byDomain;
}

function formatLguLogosYaml(rows) {
    if (rows.length === 0) return '';
    return rows
        .map((row) =>
            [
                `- name: "${yamlStr(row.name)}"`,
                `  domain: "${yamlStr(row.domain)}"`,
                `  file: "${yamlStr(row.file)}"`,
                `  ext: "${yamlStr(row.ext)}"`,
                `  source: "${yamlStr(row.source)}"`,
                `  px: "${yamlStr(row.px)}"`,
                `  bytes: ${row.bytes}`,
                `  order_key: "${yamlStr(row.order_key)}"`,
                `  shuffle_key: "${yamlStr(row.shuffle_key)}"`,
            ].join('\n'),
        )
        .join('\n');
}

// Strips SVG `id="..."` attributes before hashing — a doc-label with no
// visual effect, but exporters embed one per file, so two visually
// identical SVGs (e.g. bettersolano.org.svg / bettercainta.org.svg, same
// starter-kit art) hash as different files without this.
function normalizeForHashing(buf, ext) {
    if (ext !== 'svg') return buf;
    return Buffer.from(buf.toString('utf8').replace(/\sid="[^"]*"/g, ''));
}

// Hashes each resolved row's file on disk, keyed by domain.
function computeContentHashes(rows, logoDir = LOGO_DIR) {
    const byDomain = new Map();
    for (const row of rows) {
        const filePath = path.join(logoDir, row.file);
        if (!fs.existsSync(filePath)) continue;
        const normalized = normalizeForHashing(fs.readFileSync(filePath), row.ext);
        byDomain.set(row.domain, crypto.createHash('sha256').update(normalized).digest('hex'));
    }
    return byDomain;
}

// Groups domains sharing a hash. Doesn't drop or pick a winner — just
// flagged in the run summary for a human to sort out.
function findDuplicateLogos(hashByDomain) {
    const byHash = new Map();
    for (const [domain, hash] of hashByDomain) {
        if (!byHash.has(hash)) byHash.set(hash, []);
        byHash.get(hash).push(domain);
    }
    return [...byHash.values()].filter((domains) => domains.length > 1);
}

// Swaps adjacent same-hash rows apart, greedily, best-effort (gives up if
// there's nothing non-duplicate to swap in). Also checks the wrap: the
// marquee duplicates this array end-to-end for a seamless loop, so index 0
// and the last index render adjacent too.
function separateAdjacentDuplicates(rows, hashByDomain) {
    const arr = rows.slice();
    const hashOf = (row) => hashByDomain.get(row.domain);
    for (let i = 0; i < arr.length - 1; i++) {
        const h = hashOf(arr[i]);
        if (h === undefined || h !== hashOf(arr[i + 1])) continue;
        let j = i + 2;
        while (j < arr.length && hashOf(arr[j]) === h) j++;
        if (j < arr.length) {
            [arr[i + 1], arr[j]] = [arr[j], arr[i + 1]];
        }
    }
    if (arr.length > 1) {
        const wrapHash = hashOf(arr[0]);
        if (wrapHash !== undefined && wrapHash === hashOf(arr[arr.length - 1])) {
            // Pull the last slot's twin inward; only commit if that doesn't
            // create a new collision at the landing spot (can happen when
            // there aren't enough unique rows to go around).
            let k = arr.length - 2;
            while (k > 0 && hashOf(arr[k]) === wrapHash) k--;
            if (k > 0) {
                const candidate = arr.slice();
                [candidate[arr.length - 1], candidate[k]] = [candidate[k], candidate[arr.length - 1]];
                const safe =
                    hashOf(candidate[k - 1]) !== hashOf(candidate[k]) &&
                    hashOf(candidate[k]) !== hashOf(candidate[k + 1]);
                if (safe) {
                    return candidate;
                }
            }
        }
    }
    return arr;
}

// Sorts by baseKeyField, separates duplicates, then replaces targetField
// with a zero-padded rank (Liquid sorts by the key, so the key IS the
// render order). Mutates rows in place.
function assignRankKeys(rows, baseKeyField, hashByDomain, targetField) {
    const sorted = rows
        .slice()
        .sort((a, b) => (a[baseKeyField] < b[baseKeyField] ? -1 : a[baseKeyField] > b[baseKeyField] ? 1 : 0));
    const separated = separateAdjacentDuplicates(sorted, hashByDomain);
    separated.forEach((row, i) => {
        row[targetField] = String(i).padStart(4, '0');
    });
}

async function main() {
    console.log('🚀 Starting Featured Portal + Logo band metadata crawl...');
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');
    const rawLgus = parseTable(readmeContent, '<!-- SYNC_LGU_TABLE_START -->', '<!-- SYNC_LGU_TABLE_END -->');
    const lgus = rawLgus.map(validateLgu);

    // #122: eligibility gate #1 — status must be Active. Domain is required
    // by construction: no domain means nothing to crawl, so such an Entry can
    // never satisfy either predicate.
    const candidates = lgus.filter((lgu) => lgu.status === '🟢 Active' && lgu.domain && lgu.domain !== '-');

    const previousFeatured = parseExistingLguMeta(LGU_META_PATH);
    const previousLogos = parseExistingLguLogos(LOGO_META_PATH);

    const featuredRows = [];
    const featuredRejections = [];
    const logoRows = [];
    const logoRejections = [];

    if (!fs.existsSync(LOGO_DIR)) {
        fs.mkdirSync(LOGO_DIR, { recursive: true });
    }

    // Logo resolution failures are more lenient than Featured's: ANY failure
    // to resolve a Logo this run (unreachable, robots-disallowed, or no
    // candidate in the chain passed) keeps the last-known-good row+file if
    // one exists — the file itself is already on disk from a prior run, so
    // nothing needs rewriting. Only a portal with no previous Logo at all
    // counts as ineligible.
    function keepOrDropLogo(displayDomain, message, summaries) {
        if (previousLogos.has(displayDomain)) {
            logoRows.push(previousLogos.get(displayDomain));
            console.log(`  ⚠️  ${displayDomain} — Logo: ${message}; kept last-known-good file`);
        } else {
            logoRejections.push(summaries || ['no Logo candidate resolved']);
            console.log(`  ⛔ ${displayDomain} — Logo: ${message}`);
        }
    }

    for (const entry of candidates) {
        const { label: displayDomain, url: origin } = extractDomainLink(entry.domain);
        let fetched;
        try {
            fetched = await fetchPortalPage(origin);
        } catch (err) {
            if (!(err instanceof PortalUnreachableError)) {
                featuredRejections.push(['crawl error (not a portal problem)']);
                logoRejections.push(['crawl error (not a portal problem)']);
                console.log(`  ⛔ ${displayDomain} — crawl error: ${err.stack || err.message}`);
                continue;
            }
            if (previousFeatured.has(displayDomain)) {
                featuredRows.push(previousFeatured.get(displayDomain));
                console.log(`  ⚠️  ${displayDomain} — Featured: unreachable this run (${err.message}); kept previous row`);
            } else {
                featuredRejections.push(['unreachable, with no previous row to keep']);
                console.log(`  ⛔ ${displayDomain} — Featured: unreachable and no previous row (${err.message})`);
            }
            keepOrDropLogo(displayDomain, `unreachable this run (${err.message})`);
            continue;
        }

        if (!fetched.ok) {
            // robots.txt disallow — a normal Featured drop (#125's
            // self-healing rule), but a lenient Logo keep-or-drop.
            featuredRejections.push(fetched.reason.summaries);
            console.log(`  ⛔ ${displayDomain} — Featured: ineligible: ${fetched.reason.message}`);
            keepOrDropLogo(displayDomain, fetched.reason.message);
            continue;
        }

        const featuredResult = await judgeFeatured(entry, displayDomain, fetched);
        if (featuredResult.row) {
            featuredRows.push(featuredResult.row);
            console.log(`  ✅ ${displayDomain} — Featured row generated`);
        } else {
            const described = featuredResult.reason || reason('rejected without a stated reason (bug)');
            featuredRejections.push(described.summaries);
            console.log(`  ⛔ ${displayDomain} — Featured: ineligible: ${described.message}`);
        }

        const logoResult = await judgeLogo(entry, displayDomain, fetched);
        if (logoResult.row) {
            fs.writeFileSync(path.join(LOGO_DIR, logoResult.row.file), logoResult.buf);
            logoRows.push(logoResult.row);
            const size = logoResult.row.px === 'vector' ? 'vector' : `${logoResult.row.px}px`;
            console.log(
                `  ✅ ${displayDomain} — Logo resolved (${logoResult.row.source}, ${size}, ${Math.round(logoResult.row.bytes / 1024)}KB)`,
            );
        } else {
            keepOrDropLogo(displayDomain, logoResult.reason.message, logoResult.reason.summaries);
        }
    }

    const metaDataDir = path.dirname(LGU_META_PATH);
    if (!fs.existsSync(metaDataDir)) {
        fs.mkdirSync(metaDataDir, { recursive: true });
    }
    fs.writeFileSync(LGU_META_PATH, formatLguMetaYaml(featuredRows));
    console.log(`🎉 Featured pool: ${featuredRows.length} eligible portal(s). Written to ${LGU_META_PATH}`);
    const featuredSummary = formatIneligibleSummary(featuredRejections);
    if (featuredSummary) {
        console.log(`\n${featuredSummary}`);
    }

    // Re-key row order AFTER the full pool is known: order_key/shuffle_key
    // start as domain hashes (assigned per-row in judgeLogo(), before any
    // row knows about its neighbours), then get replaced here with
    // rank-based keys that keep byte-identical Logos from landing adjacent
    // in either rendered row. Both content-hash uses (this + the duplicate
    // report below) share one file-read pass.
    const contentHashByDomain = computeContentHashes(logoRows);
    assignRankKeys(logoRows, 'order_key', contentHashByDomain, 'order_key');
    assignRankKeys(logoRows, 'shuffle_key', contentHashByDomain, 'shuffle_key');

    const logoDataDir = path.dirname(LOGO_META_PATH);
    if (!fs.existsSync(logoDataDir)) {
        fs.mkdirSync(logoDataDir, { recursive: true });
    }
    fs.writeFileSync(LOGO_META_PATH, formatLguLogosYaml(logoRows));
    console.log(`🎉 Logo band: ${logoRows.length} resolved Logo(s). Written to ${LOGO_META_PATH}`);
    const logoSummary = formatIneligibleSummary(logoRejections, 'Logo ineligible');
    if (logoSummary) {
        console.log(`\n${logoSummary}`);
    }

    const duplicateLogoGroups = findDuplicateLogos(contentHashByDomain);
    if (duplicateLogoGroups.length > 0) {
        console.log(
            `\n⚠️  Duplicate Logo bytes (${duplicateLogoGroups.length} group(s)) — same image resolved for multiple portals, not auto-resolved (kept apart in the render, flagged here for a human to sort out):`,
        );
        for (const domains of duplicateLogoGroups) {
            console.log(`   - ${domains.join(', ')}`);
        }
    }
}

if (require.main === module) {
    main().catch((err) => {
        console.error(`\n❌ CRAWL FAILED: ${err.stack || err.message}`);
        process.exit(1);
    });
}

module.exports = {
    USER_AGENT,
    PortalUnreachableError,
    fetchPortalPage,
    judgeFeatured,
    crawlEntry,
    IMAGE_SIZE_CEILING_BYTES,
    BOILERPLATE_DESCRIPTION,
    BOILERPLATE_TITLE,
    normalizeWhitespace,
    isBoilerplate,
    missingMetaReason,
    boilerplateReason,
    imageRejectionReason,
    formatIneligibleSummary,
    sha1First8,
    extractMeta,
    parseTagAttrs,
    extractDomainLink,
    parseExistingLguMeta,
    formatLguMetaYaml,
    // Logo predicate (#179)
    LOGO_MIN_PX,
    LOGO_MAX_BYTES,
    linkTags,
    declaredPx,
    logoCandidates,
    intrinsicPx,
    svgIsUnsafe,
    tryLogoCandidate,
    judgeLogo,
    parseExistingLguLogos,
    formatLguLogosYaml,
    normalizeForHashing,
    computeContentHashes,
    findDuplicateLogos,
    separateAdjacentDuplicates,
    assignRankKeys,
};
