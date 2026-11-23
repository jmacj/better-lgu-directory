// Reports which 🔵 Planned entries have gone stale, and whether README.md's
// ⚠️ Stale / 🤝 Open for Adoption tags currently agree.
//
// It also lists 🟡 Work in Progress entries whose row and repository have both
// been quiet for over the threshold (#469): the entries to tag in the next
// check-in. See CONTRIBUTING.md, "Check-ins". Repository activity is the repo's
// last push (any branch), read from the GitHub API. Unauthenticated requests are
// capped at 60 an hour, so set GITHUB_TOKEN (or GH_TOKEN) — e.g.
// `GITHUB_TOKEN=$(gh auth token) node scripts/check-stale.js`. When a repo can't
// be read (no GitHub repo, rate limit, network), the entry is still listed on
// row activity alone and marked "repo unknown", for a human to check.
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
// It also reports orphaned Maintainer Profiles (#426): profile files whose
// handle no longer appears in any Maintainer/s cell of README.md or BUDGET.md
// — after an adoption hand-off, or a renamed or deleted GitHub account. Those
// are reported too, never deleted: removal is a Directory Maintainer's call.
//
// Usage: node scripts/check-stale.js [--days 30]

const fs = require('fs');
const { execFileSync } = require('child_process');

const { findOrphans, extractHandles } = require('./maintainer-profiles.js');
const { BUDGET_PATH, listedHandles } = require('./sync-budget-to-data.js');
const {
    README_PATH,
    readProfilePaths,
    STALE_TAG,
    ADOPTION_TAG,
    STALE_AFTER_DAYS,
    parseTable,
    splitCellLines,
    normalizeDash,
    parseRepoCell,
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
// whitespace is collapsed, every way of writing an empty cell (blank, `-`, `—`,
// `–`) folds to one marker via normalizeDash, and case is folded so relabelling
// passes like `Github` -> `GitHub` read as the cosmetics they are.
//
// Case folding is deliberately lossy: an edit that changes nothing but letter
// case no longer counts as activity, so a maintainer who only fixes their own
// capitalization will not reset their clock. That is the safer direction to err.
// A missed cosmetic edit silently makes an entry look fresher than it is and
// hides it from the report; a missed real edit only surfaces an entry early,
// where a human is already reviewing every suggestion by hand.
//
// The return value is compared for equality only — never printed — so lowering
// it costs no legibility in the output.
function comparableRow(cells) {
    return cells
        .map(cell => normalizeDash(splitCellLines(cell)
            .filter(line => line !== STALE_TAG && line !== ADOPTION_TAG)
            .join(' ')))
        .join(' | ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
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

// Last push to a GitHub repo, as an ISO date, or null when it can't be read.
// Never throws: a lookup failure must not hide an entry from the check-in list.
async function repoPushedAt({ owner, repo }) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'check-stale' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!response.ok) {
            return null;
        }
        const { pushed_at: pushedAt } = await response.json();
        return pushedAt || null;
    } catch {
        return null;
    }
}

function daysSince(isoDate, now) {
    return Math.floor((now - new Date(isoDate).getTime()) / MS_PER_DAY);
}

// 🟡 Work in Progress entries whose row is older than the threshold, then
// whose repo is too (or can't be read). Only rows already quiet are looked up,
// which keeps API calls to the entries that matter.
async function quietWorkInProgress(readme, lastUpdated, staleAfterDays, now) {
    const quiet = [];

    for (const cells of parseTable(readme, TABLE_START, TABLE_END)) {
        const name = (cells[0] || '').trim();
        const [status] = splitCellLines(cells[4] || '');
        if (status !== '🟡 Work in Progress') {
            continue;
        }

        const updatedAt = lastUpdated.get(name);
        if (!updatedAt) {
            console.warn(`⚠️  No git history found for "${name}" — skipping.`);
            continue;
        }
        const rowAgeDays = daysSince(updatedAt, now);
        if (rowAgeDays <= staleAfterDays) {
            continue;
        }

        const repo = parseRepoCell(cells[2]);
        const pushedAt = repo ? await repoPushedAt(repo) : null;
        const repoAgeDays = pushedAt ? daysSince(pushedAt, now) : null;
        if (repoAgeDays !== null && repoAgeDays <= staleAfterDays) {
            continue;
        }

        quiet.push({
            name,
            rowAgeDays,
            repoAgeDays,
            handles: extractHandles(cells[5]),
        });
    }

    return quiet.sort((a, b) => b.rowAgeDays - a.rowAgeDays);
}

function reportQuietWorkInProgress(quiet, staleAfterDays) {
    if (quiet.length === 0) {
        console.log(`\n✅ No 🟡 Work in Progress entries quiet for over ${staleAfterDays} days.`);
        return;
    }

    console.log(`\n${quiet.length} 🟡 Work in Progress entries with row and repository quiet for over ${staleAfterDays} days — tag their Maintainer/s in the next check-in (CONTRIBUTING.md, "Check-ins"):`);
    for (const { name, rowAgeDays, repoAgeDays, handles } of quiet) {
        const repoNote = repoAgeDays === null ? 'repo unknown' : `repo ${repoAgeDays}d`;
        const mentions = handles.length > 0 ? handles.map(h => `@${h}`).join(' ') : 'no GitHub handle';
        console.log(`  🟡 ${name} — row ${rowAgeDays}d, ${repoNote} — ${mentions}`);
    }
}

async function main() {
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

        const ageDays = daysSince(updatedAt, now);
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
    } else {
        console.log('\nSuggested changes — your call, not the script\'s:');

        for (const { name, ageDays, updatedAt } of shouldTag) {
            console.log(`  ➕ ${name} — last updated ${updatedAt} (${ageDays} days ago); consider adding "${STALE_TAG}" and "${ADOPTION_TAG}".`);
        }

        for (const { name, ageDays, updatedAt } of shouldUntag) {
            console.log(`  ➖ ${name} — last updated ${updatedAt} (${ageDays} days ago); consider removing "${STALE_TAG}" and "${ADOPTION_TAG}".`);
        }

        process.exitCode = 1;
    }

    // Informational: nothing in README.md changes until a Directory Maintainer
    // runs the check-in, so this list never sets the exit code.
    reportQuietWorkInProgress(await quietWorkInProgress(readme, lastUpdated, staleAfterDays, now), staleAfterDays);

    reportOrphanedProfiles(readme);
}

function reportOrphanedProfiles(readme) {
    let budget = '';
    try {
        budget = fs.readFileSync(BUDGET_PATH, 'utf8');
    } catch {
        console.warn('⚠️  BUDGET.md not found — Budget Portal Maintainers are not counted as listed.');
    }

    const orphans = findOrphans(listedHandles(readme, budget), readProfilePaths());
    if (orphans.length === 0) {
        console.log('✅ No orphaned Maintainer Profiles.');
        return;
    }

    console.log('\nOrphaned Maintainer Profiles — handle no longer in any Maintainer/s cell of README.md or BUDGET.md. Your call, not the script\'s:');
    for (const path of orphans) {
        console.log(`  👤 ${path} — check for a renamed account or a hand-off; ask the owner, then remove it if it should go.`);
    }
    process.exitCode = 1;
}

main().catch((error) => {
    console.error(`\n❌ STALE CHECK FAILED: ${error.message}`);
    process.exit(1);
});
