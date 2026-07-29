/**
 * Triage a pull request that touches the directory table in README.md.
 *
 * Compares the base branch's README against the pull request's README and
 * decides which labels apply:
 *
 *   entry:new           a row was added for an LGU that is not in the base
 *   entry:update        an existing row changed
 *   entry:collision     an added row names an LGU that is already listed
 *   needs-verification  the change introduces at least one link nobody has checked
 *   docs                README changed, but no directory row did
 *
 * Collisions are reported, never acted on: two municipalities in different
 * provinces can share a name, so a maintainer makes the duplicate vs.
 * coordination call.
 *
 * Usage: node scripts/triage-pr.js <base-readme> <head-readme>
 * Writes `labels` to $GITHUB_OUTPUT and a comment body to $COMMENT_FILE.
 */

const fs = require('fs');

const START_MARKER = '<!-- SYNC_LGU_TABLE_START -->';
const END_MARKER = '<!-- SYNC_LGU_TABLE_END -->';
const COMMENT_MARKER = '<!-- lgu-triage-bot -->';

// A row that carries this many links is already unusual; cap the check so a
// malformed PR can not turn into a hundred outbound requests.
const MAX_LINKS_CHECKED = 20;
const LINK_TIMEOUT_MS = 10000;

function parseRows(content) {
    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);

    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        return null;
    }

    const table = content.substring(startIdx + START_MARKER.length, endIdx).trim();
    const lines = table.split('\n').filter(line => line.trim().startsWith('|'));

    // Skip the header and its separator.
    return lines.slice(2).map((line) => {
        const cells = line.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        return { cells, text: cells.join(' | ') };
    }).filter(row => row.cells.length > 0 && row.cells[0]);
}

// Words that carry no identity: "Puerto Princesa" and "Puerto Princesa City"
// are the same municipality written two ways.
const NOISE_WORDS = /\b(city|municipality|town|province|of|the)\b/g;

function fold(value) {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(NOISE_WORDS, ' ')
        .replace(/[^a-z0-9]/g, '');
}

// Name plus province. Two rows sharing this are the same LGU.
function entryKey(name) {
    return fold(name);
}

// Name without the province. "San Jose, Antique" and "San Jose, Occidental
// Mindoro" match here but are different places, so this only ever adds a note
// to the comment — it never applies a label.
function nameOnlyKey(name) {
    return fold(name.split(',')[0]);
}

function urlsIn(text) {
    const urls = new Set();
    const markdownLink = /\[[^\]]*\]\(\s*(https?:\/\/[^\s)]+)/g;
    const bareUrl = /(?<!\()\bhttps?:\/\/[^\s|)\]]+/g;

    let match;
    while ((match = markdownLink.exec(text)) !== null) {
        urls.add(match[1].replace(/\/+$/, ''));
    }
    for (const bare of text.match(bareUrl) || []) {
        urls.add(bare.replace(/\/+$/, ''));
    }
    return urls;
}

function groupBy(rows, keyFn) {
    const groups = new Map();
    for (const row of rows) {
        const key = keyFn(row.cells[0]);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(row);
    }
    return groups;
}

/**
 * Match head rows against base rows as a multiset, so a pull request that adds
 * a second row for an already-listed LGU shows up as an addition rather than
 * being absorbed as an edit of the existing one.
 */
function diffRows(baseRows, headRows) {
    const pools = groupBy(baseRows, entryKey);
    const remaining = new Map([...pools].map(([key, rows]) => [key, [...rows]]));

    const added = [];
    const changed = [];

    for (const row of headRows) {
        const pool = remaining.get(entryKey(row.cells[0]));
        if (!pool || pool.length === 0) {
            added.push(row);
            continue;
        }
        const identical = pool.findIndex(candidate => candidate.text === row.text);
        if (identical !== -1) {
            pool.splice(identical, 1);
        } else {
            changed.push({ row, previous: pool.shift() });
        }
    }

    const removed = [...remaining.values()].flat();
    return { added, changed, removed, basePools: pools };
}

async function checkLink(url) {
    const attempt = async (method) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), LINK_TIMEOUT_MS);
        try {
            const response = await fetch(url, {
                method,
                redirect: 'follow',
                signal: controller.signal,
                headers: { 'user-agent': 'better-lgu-directory-triage' },
            });
            return { status: response.status, finalUrl: response.url };
        } finally {
            clearTimeout(timer);
        }
    };

    try {
        // Some hosts reject HEAD outright; fall back before calling it broken.
        const head = await attempt('HEAD');
        if (head.status < 400) {
            return head;
        }
        return await attempt('GET');
    } catch (error) {
        try {
            return await attempt('GET');
        } catch (retryError) {
            return { status: null, error: retryError.name === 'AbortError' ? 'timed out' : retryError.message };
        }
    }
}

function describe(result) {
    if (result.status === null) {
        return `unreachable (${result.error})`;
    }
    const redirected = result.finalUrl && result.finalUrl.replace(/\/+$/, '') !== result.url
        ? ` → \`${result.finalUrl}\``
        : '';
    return `HTTP ${result.status}${redirected}`;
}

async function main() {
    const [basePath, headPath] = process.argv.slice(2);
    if (!basePath || !headPath) {
        throw new Error('Usage: node scripts/triage-pr.js <base-readme> <head-readme>');
    }

    const baseContent = fs.readFileSync(basePath, 'utf8');
    const headContent = fs.readFileSync(headPath, 'utf8');

    if (baseContent === headContent) {
        return { labels: [], comment: '' };
    }

    const baseRows = parseRows(baseContent);
    const headRows = parseRows(headContent);

    if (!baseRows || !headRows) {
        // Table markers are missing on one side — that is a review problem, not
        // something to guess about.
        return { labels: [], comment: '' };
    }

    const { added, changed, removed, basePools } = diffRows(baseRows, headRows);

    const labels = new Set();
    const notes = [];

    if (added.length > 0) {
        labels.add('entry:new');
    }
    if (changed.length > 0 || removed.length > 0) {
        labels.add('entry:update');
    }
    if (added.length === 0 && changed.length === 0 && removed.length === 0) {
        // README moved but the table did not — prose or legend edit.
        labels.add('docs');
    }

    // A confident collision: the added row names an LGU that is already listed,
    // province and all.
    const collisions = [];
    for (const row of added) {
        for (const existing of basePools.get(entryKey(row.cells[0])) || []) {
            collisions.push({ incoming: row.cells[0], existing });
        }
    }
    if (collisions.length > 0) {
        labels.add('entry:collision');
        notes.push('### Already in the directory\n');
        for (const { incoming, existing } of collisions) {
            notes.push(`- **${incoming}** matches the existing entry **${existing.cells[0]}** — maintainer: ${existing.cells[5] || '-'}, status: ${existing.cells[4] || '-'}`);
        }
        notes.push('\nIf this is the same submission twice, close it as `duplicate`. If it is a different contributor for the same LGU, apply `needs-coordination` and introduce them to the maintainer above rather than merging a second row.\n');
    }

    // A weaker signal: same name, different province. Reported, never labelled —
    // the Philippines has plenty of genuinely distinct same-named municipalities.
    const baseByName = groupBy(baseRows, nameOnlyKey);
    const namesakes = [];
    for (const row of added) {
        if (collisions.some(collision => collision.incoming === row.cells[0])) {
            continue;
        }
        for (const existing of baseByName.get(nameOnlyKey(row.cells[0])) || []) {
            namesakes.push({ incoming: row.cells[0], existing });
        }
    }
    if (namesakes.length > 0) {
        notes.push('### Same name, different province\n');
        for (const { incoming, existing } of namesakes) {
            notes.push(`- **${incoming}** shares a name with **${existing.cells[0]}**. Probably a different LGU — worth a glance in case a province was mistyped.`);
        }
        notes.push('');
    }

    if (removed.length > 0) {
        notes.push('### Rows removed\n');
        for (const row of removed) {
            notes.push(`- **${row.cells[0]}** was removed from the table.`);
        }
        notes.push('\nContributors are asked not to remove another LGU\'s entry — confirm this was intentional.\n');
    }

    const baseUrls = urlsIn(baseContent);
    const newUrls = [];
    for (const row of [...added, ...changed.map(entry => entry.row)]) {
        for (const url of urlsIn(row.text)) {
            if (!baseUrls.has(url) && !newUrls.includes(url)) {
                newUrls.push(url);
            }
        }
    }

    if (newUrls.length > 0) {
        labels.add('needs-verification');

        const checked = newUrls.slice(0, MAX_LINKS_CHECKED);
        const results = await Promise.all(checked.map(async url => ({ url, ...(await checkLink(url)) })));

        notes.push('### New links to verify\n');
        for (const result of results) {
            notes.push(`- \`${result.url}\` — ${describe(result)}`);
        }
        if (newUrls.length > checked.length) {
            notes.push(`- …and ${newUrls.length - checked.length} more, not checked.`);
        }
        notes.push('\nA reachable link is not a verified one — confirm each points at this LGU\'s own portal or page, then remove `needs-verification`.\n');
    }

    return {
        labels: [...labels],
        comment: notes.length > 0 ? `${COMMENT_MARKER}\n## Directory triage\n\n${notes.join('\n')}` : '',
    };
}

main().then(({ labels, comment }) => {
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `labels=${labels.join(',')}\n`);
    }
    if (comment && process.env.COMMENT_FILE) {
        fs.writeFileSync(process.env.COMMENT_FILE, comment);
    }
    console.log(`labels: ${labels.join(', ') || '(none)'}`);
    console.log(comment || '(no comment)');
}).catch((error) => {
    console.error(`triage failed: ${error.message}`);
    process.exit(1);
});
