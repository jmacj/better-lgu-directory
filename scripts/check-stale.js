// Reports which 🔵 Planned entries have gone stale, and whether README.md's
// ⚠️ Stale / 🤝 Open for Adoption tags currently agree.
//
// The directory has no `updated_at` column — the README table is the whole data
// model — so "last updated" is derived from git history: the date of the most
// recent commit that changed an entry's row. An entry that has never been
// touched since it was added falls back to the date it first appeared, which is
// the same commit.
//
// A local tool for the repository maintainers, not part of any workflow: run it
// to get a quick list to check against what you already know, then decide by
// hand. It reads git history and prints — it never edits README.md, and is
// deliberately not wired into CI. Elapsed time is a prompt to look, not the only
// thing that makes an entry stale, so tagging stays a manual judgement call.
//
// Usage: node scripts/check-stale.js [--days 30]

const fs = require('fs');
const { execFileSync } = require('child_process');

const {
    README_PATH,
    STALE_TAG,
    ADOPTION_TAG,
    STALE_AFTER_DAYS,
    parseTable,
    splitCellLines,
    normalizeDash,
} = require('./sync-to-data.js');

const TABLE_START = '<!-- SYNC_LGU_TABLE_START -->';
const TABLE_END = '<!-- SYNC_LGU_TABLE_END -->';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDaysArg(argv) {
    const flagIndex = argv.indexOf('--days');
    if (flagIndex === -1) {
        return STALE_AFTER_DAYS;
    }
    const days = Number(argv[flagIndex + 1]);
    if (!Number.isFinite(days) || days <= 0) {
        throw new Error(`--days needs a positive number, got "${argv[flagIndex + 1]}".`);
    }
    return days;
}

function git(args) {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// Reduce a row to the content that counts as an update. The stale and adoption
// tags are stripped so they can be judged separately by direction — see
// isActivity. Presentation-only differences are normalized away first, so a
// tidy-up pass over the table doesn't read as everyone updating at once:
// whitespace is collapsed, and every way of writing an empty cell (blank, `-`,
// `—`, `–`) folds to one marker via normalizeDash.
function comparableRow(cells) {
    return cells
        .map(cell => normalizeDash(splitCellLines(cell)
            .filter(line => line !== STALE_TAG && line !== ADOPTION_TAG)
            .join(' ')))
        .join(' | ')
        .replace(/\s+/g, ' ')
        .trim();
}

function rowTags(cells) {
    const tags = new Set();
    for (const cell of cells) {
        for (const line of splitCellLines(cell)) {
            if (line === STALE_TAG || line === ADOPTION_TAG) {
                tags.add(line);
            }
        }
    }
    return tags;
}

// Did this commit count as activity on the entry? Real content edits always do,
// and so does a first appearance. Tag changes are judged by direction: applying
// the tags is the directory noting an absence, so it must not reset the clock —
// otherwise tagging an entry stale would instantly make it look fresh again.
// Clearing them is a person showing up to say they are still on it — a renewal,
// whether that is the original maintainer buying more time or someone adopting.
function isActivity(previous, current) {
    if (!previous) {
        return true;
    }
    if (previous.content !== current.content) {
        return true;
    }
    return [...previous.tags].some(tag => !current.tags.has(tag));
}

// Map every LGU name in a given revision of README.md to its comparable row
// text, normalized by comparableRow so pure-formatting commits don't read as
// real updates either.
function rowsAtRevision(sha) {
    const rows = new Map();
    let content;

    try {
        content = git(['show', `${sha}:README.md`]);
    } catch {
        return rows; // README.md did not exist yet at this revision.
    }

    if (!content.includes(TABLE_START) || !content.includes(TABLE_END)) {
        return rows;
    }

    for (const cells of parseTable(content, TABLE_START, TABLE_END)) {
        const name = (cells[0] || '').trim();
        if (name) {
            rows.set(name, { content: comparableRow(cells), tags: rowTags(cells) });
        }
    }

    return rows;
}

// Walk history oldest to newest, recording the date each row last changed.
function lastUpdatedByName() {
    const log = git(['log', '--reverse', '--format=%H|%aI', '--', 'README.md'])
        .split('\n')
        .filter(line => line.includes('|'));

    const lastUpdated = new Map();
    let previous = new Map();

    for (const line of log) {
        const [sha, isoDate] = line.split('|');
        const current = rowsAtRevision(sha);

        for (const [name, row] of current) {
            if (isActivity(previous.get(name), row)) {
                lastUpdated.set(name, isoDate);
            }
        }

        previous = current;
    }

    return lastUpdated;
}

function main() {
    const staleAfterDays = parseDaysArg(process.argv.slice(2));
    const now = Date.now();

    const readme = fs.readFileSync(README_PATH, 'utf8');
    const lastUpdated = lastUpdatedByName();

    const planned = [];
    const shouldTag = [];
    const shouldUntag = [];
    let plannedCount = 0;

    for (const cells of parseTable(readme, TABLE_START, TABLE_END)) {
        const name = (cells[0] || '').trim();
        const [status, ...statusTags] = splitCellLines(cells[4] || '');

        if (status !== '🔵 Planned') {
            continue;
        }
        plannedCount += 1;

        const updatedAt = lastUpdated.get(name);
        if (!updatedAt) {
            console.warn(`⚠️  No git history found for "${name}" — skipping.`);
            continue;
        }

        const ageDays = Math.floor((now - new Date(updatedAt).getTime()) / MS_PER_DAY);
        const isStale = ageDays > staleAfterDays;
        const tagged = statusTags.includes(STALE_TAG);
        const entry = { name, ageDays, updatedAt: updatedAt.slice(0, 10), tagged };

        planned.push(entry);

        if (isStale && !tagged) {
            shouldTag.push(entry);
        } else if (!isStale && tagged) {
            shouldUntag.push(entry);
        }
    }

    planned.sort((a, b) => b.ageDays - a.ageDays);

    const nameWidth = Math.max(...planned.map(e => e.name.length), 4);
    const line = ({ name, ageDays, updatedAt, tagged }) =>
        `  ${tagged ? '⚠️ ' : '   '}${name.padEnd(nameWidth)}  ${updatedAt}  ${String(ageDays).padStart(4)}d`;

    console.log(`${plannedCount} 🔵 Planned entries, oldest first (threshold: ${staleAfterDays} days).`);
    console.log(`⚠️  marks an entry already tagged "${STALE_TAG}" in README.md.\n`);

    for (const entry of planned) {
        console.log(line(entry));
    }

    if (shouldTag.length === 0 && shouldUntag.length === 0) {
        console.log('\n✅ Tags match the threshold — nothing to change.');
        return;
    }

    console.log('\nSuggested changes — your call, not the script\'s:');

    for (const { name, ageDays, updatedAt } of shouldTag) {
        console.log(`  ➕ ${name} — last updated ${updatedAt} (${ageDays} days ago); consider adding "${STALE_TAG}" and "${ADOPTION_TAG}".`);
    }

    for (const { name, ageDays, updatedAt } of shouldUntag) {
        console.log(`  ➖ ${name} — last updated ${updatedAt} (${ageDays} days ago); consider removing "${STALE_TAG}" and "${ADOPTION_TAG}".`);
    }

    process.exitCode = 1;
}

try {
    main();
} catch (error) {
    console.error(`\n❌ STALE CHECK FAILED: ${error.message}`);
    process.exit(1);
}
