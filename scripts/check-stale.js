// Reports which 🔵 Planned entries have gone stale, and whether README.md's
// ⚠️ Stale / 🤝 Open for Adoption tags currently agree.
//
// The directory has no `updated_at` column — the README table is the whole data
// model — so "last updated" is derived from git history: the date of the most
// recent commit that changed an entry's row. An entry that has never been
// touched since it was added falls back to the date it first appeared, which is
// the same commit.
//
// Advisory by design: it reports drift but changes nothing. Run it before a
// directory sweep, then apply the tags by hand in a PR so a human stays in the
// loop on who gets flagged.
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

// Map every LGU name in a given revision of README.md to its raw row text, with
// whitespace collapsed so pure-formatting commits don't read as real updates.
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
            rows.set(name, cells.join(' | ').replace(/\s+/g, ' ').trim());
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
            if (previous.get(name) !== row) {
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
        const entry = { name, ageDays, updatedAt: updatedAt.slice(0, 10) };

        if (isStale && !tagged) {
            shouldTag.push(entry);
        } else if (!isStale && tagged) {
            shouldUntag.push(entry);
        }
    }

    console.log(`Checked ${plannedCount} 🔵 Planned entries against a ${staleAfterDays}-day threshold.\n`);

    for (const { name, ageDays, updatedAt } of shouldTag) {
        console.log(`➕ ${name} — last updated ${updatedAt} (${ageDays} days ago); add "${STALE_TAG}" and "${ADOPTION_TAG}".`);
    }

    for (const { name, ageDays, updatedAt } of shouldUntag) {
        console.log(`➖ ${name} — last updated ${updatedAt} (${ageDays} days ago); remove "${STALE_TAG}" and "${ADOPTION_TAG}".`);
    }

    if (shouldTag.length === 0 && shouldUntag.length === 0) {
        console.log('✅ Every 🔵 Planned entry is tagged correctly.');
        return;
    }

    process.exitCode = 1;
}

try {
    main();
} catch (error) {
    console.error(`\n❌ STALE CHECK FAILED: ${error.message}`);
    process.exit(1);
}
