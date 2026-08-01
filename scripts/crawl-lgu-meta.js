const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { README_PATH, parseTable, validateLgu } = require('./sync-to-data.js');

const LGU_META_PATH = process.argv[2] || path.join(__dirname, '../_data/lgu-meta.yml');

const USER_AGENT = 'BetterLGUDirectoryBot/1.0 (+https://lgu.bettergov.ph)';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const IMAGE_SIZE_CEILING_BYTES = 400 * 1024; // #127: 400KB ceiling, checked on fetched bytes

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

// Attribute parsing shared by title/meta extraction — deliberately regex
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

// Crawls one Entry's portal and returns a complete lgu-meta row, or null if
// the portal is reachable but does not meet the completeness/quality bar
// (#122, #125, #127). Throws PortalUnreachableError if the portal itself
// looks down — callers use that to decide whether to preserve the previous
// row instead of dropping it.
async function crawlEntry(entry, displayDomain, origin) {
    const robots = await checkRobots(origin);
    if (robots.disallowed) {
        return null;
    }
    if (robots.crawlDelaySeconds > 0) {
        await sleep(robots.crawlDelaySeconds * 1000);
    }

    const pageRes = await fetchFollowingRedirects(origin);
    if (pageRes.statusCode >= 400 || pageRes.statusCode < 200) {
        throw new PortalUnreachableError(`${displayDomain} returned HTTP ${pageRes.statusCode}`);
    }

    const contentType = (pageRes.headers['content-type'] || '').toLowerCase();
    if (contentType && !contentType.includes('html')) {
        throw new PortalUnreachableError(`${displayDomain} did not return HTML (${contentType})`);
    }

    const html = pageRes.body.toString('utf8');
    const { title, description, image } = extractMeta(html);

    if (!title || !description || !image) {
        // Mechanically incomplete — no fallback (#125), no row.
        return null;
    }

    if (isBoilerplate(title, description)) {
        // Complete but not "about" the LGU (#122's quality floor) — no row.
        return null;
    }

    if (robots.crawlDelaySeconds > 0) {
        await sleep(robots.crawlDelaySeconds * 1000);
    }

    const imageUrl = new URL(image, pageRes.finalUrl).toString();
    let imageRes;
    try {
        imageRes = await fetchFollowingRedirects(imageUrl, { maxBytes: IMAGE_SIZE_CEILING_BYTES });
    } catch (err) {
        // The image failing to load is a metadata-quality problem, not the
        // whole portal being down — the page itself answered fine.
        return null;
    }

    if (imageRes.statusCode >= 400 || imageRes.statusCode < 200) {
        return null;
    }
    const imageContentType = (imageRes.headers['content-type'] || '').toLowerCase();
    if (!imageContentType.startsWith('image/')) {
        return null;
    }
    if (imageRes.truncatedOversize || imageRes.body.length > IMAGE_SIZE_CEILING_BYTES) {
        return null;
    }

    return {
        name: entry.name,
        domain: displayDomain,
        image: imageUrl,
        title,
        description,
        order_key: sha1First8(displayDomain),
    };
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

async function main() {
    console.log('🚀 Starting Featured Portal metadata crawl...');
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');
    const rawLgus = parseTable(readmeContent, '<!-- SYNC_LGU_TABLE_START -->', '<!-- SYNC_LGU_TABLE_END -->');
    const lgus = rawLgus.map(validateLgu);

    // #122: eligibility gate #1 — status must be Active. Domain is required
    // by construction: no domain means nothing to crawl, so such an Entry can
    // never satisfy the completeness gate.
    const candidates = lgus.filter((lgu) => lgu.status === '🟢 Active' && lgu.domain && lgu.domain !== '-');

    const previous = parseExistingLguMeta(LGU_META_PATH);
    const rows = [];

    for (const entry of candidates) {
        const { label: displayDomain, url: origin } = extractDomainLink(entry.domain);
        try {
            const row = await crawlEntry(entry, displayDomain, origin);
            if (row) {
                rows.push(row);
                console.log(`  ✅ ${displayDomain} — featured row generated`);
            } else {
                console.log(`  ⛔ ${displayDomain} — ineligible (incomplete, boilerplate, or robots-disallowed)`);
            }
        } catch (err) {
            if (err instanceof PortalUnreachableError && previous.has(displayDomain)) {
                rows.push(previous.get(displayDomain));
                console.log(`  ⚠️  ${displayDomain} — unreachable this run (${err.message}); kept previous row`);
            } else {
                console.log(`  ⛔ ${displayDomain} — unreachable and no previous row (${err.message})`);
            }
        }
    }

    const dataDir = path.dirname(LGU_META_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(LGU_META_PATH, formatLguMetaYaml(rows));
    console.log(`🎉 Featured pool: ${rows.length} eligible portal(s). Written to ${LGU_META_PATH}`);
}

if (require.main === module) {
    main().catch((err) => {
        console.error(`\n❌ CRAWL FAILED: ${err.stack || err.message}`);
        process.exit(1);
    });
}

module.exports = {
    USER_AGENT,
    IMAGE_SIZE_CEILING_BYTES,
    BOILERPLATE_DESCRIPTION,
    BOILERPLATE_TITLE,
    normalizeWhitespace,
    isBoilerplate,
    sha1First8,
    extractMeta,
    parseTagAttrs,
    extractDomainLink,
    parseExistingLguMeta,
    formatLguMetaYaml,
};
