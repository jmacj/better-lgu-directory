// Projects the Budget Portal table in BUDGET.md into _data/budget_portals.yml,
// rendered by budget-directory.md on main-pages at lgu.bettergov.ph/BUDGET/.
//
// BUDGET.md is the sole source of truth for Budget Portals, the same way
// README.md is for Entries. An `🧩 Integrated` Budget Portal belongs to a
// Better LGU Entry: its LGU cell must match that Entry's name in README.md
// exactly, and the Entry's Domain is copied in as `parent_domain` — falling
// back to "-" with a warning if the Entry or README can't be found. Its
// Maintainer/s cell is copied by hand from the Entry's README row. Offline,
// no network calls.
//
// Usage: node scripts/sync-budget-to-data.js [output-path]

const fs = require('fs');
const path = require('path');
const {
    README_PATH,
    EMPTY_MARKERS,
    parseTable,
    normalizeDash,
    parseRepoCell,
    validateLgu,
    yamlStr,
} = require('./sync-to-data');

const BUDGET_PATH = path.join(__dirname, '../BUDGET.md');
const BUDGET_DATA_PATH = process.argv[2] || path.join(__dirname, '../_data/budget_portals.yml');

const BUDGET_START = '<!-- SYNC_BUDGET_TABLE_START -->';
const BUDGET_END = '<!-- SYNC_BUDGET_TABLE_END -->';
const LGU_START = '<!-- SYNC_LGU_TABLE_START -->';
const LGU_END = '<!-- SYNC_LGU_TABLE_END -->';

const INTEGRATED = '🧩 Integrated';
const STANDALONE = '🏛️ Standalone';
const VALID_TYPES = [INTEGRATED, STANDALONE];

// A Budget Portal is either live and listed, or not listed at all: the
// template goes live in minutes, so there is no advance registration and no
// Status column. The Portal cell must therefore hold a link.
const MARKDOWN_LINK = /\[[^\]]+\]\([^)\s]+\)/;

const NO_PARENT = '-';

// Builds name → Entry from the README table, reusing the directory's own
// validator. The README only feeds the derived `parent_domain`, so a README
// that is missing or fails to parse must not block the budget sync: warn once
// and return null, and every Integrated row falls back to "-".
function indexEntries(readmeContent) {
    try {
        const entries = parseTable(readmeContent, LGU_START, LGU_END, 'README.md').map(validateLgu);
        return new Map(entries.map(entry => [entry.name, entry]));
    } catch (error) {
        console.warn(`⚠️  Could not read Entries from README.md (${error.message}) — Better LGU Portal links fall back to "${NO_PARENT}".`);
        return null;
    }
}

// The Better LGU Portal shown beside an Integrated row, copied from its README
// Entry's Domain. Every failure mode degrades to "-" with a warning instead of
// failing the sync: no README, no matching Entry, or an Entry with no domain.
function resolveParentDomain(type, name, row, entriesByName) {
    if (type !== INTEGRATED || entriesByName === null) {
        return NO_PARENT;
    }
    const entry = entriesByName.get(name);
    if (!entry) {
        console.warn(`⚠️  ${row}: "${name}" is "${INTEGRATED}" but has no Entry in README.md with that exact name — its Better LGU Portal shows "${NO_PARENT}".`);
        return NO_PARENT;
    }
    return normalizeDash(entry.domain);
}

function validateBudgetPortal(cells, index, entriesByName) {
    const row = `Budget Table Row ${index + 1}`;
    if (cells.length !== 5) {
        throw new Error(`${row} must have 5 columns (LGU, Portal, Type, Repository, Maintainer/s); found ${cells.length}.`);
    }
    const [name, portal, typeCell, repo, maintainer] = cells;

    if (EMPTY_MARKERS.includes(name)) {
        throw new Error(`${row} is missing an LGU name.`);
    }

    const type = typeCell.trim();
    if (!VALID_TYPES.includes(type)) {
        throw new Error(`${row} (${name}) has an invalid type: "${type}". Use "${INTEGRATED}" or "${STANDALONE}".`);
    }

    if (!MARKDOWN_LINK.test(portal)) {
        throw new Error(`${row} (${name}) needs a live portal link in the Portal column, e.g. [budget.example.org](https://budget.example.org). Budget portals are added once they are live.`);
    }

    if (type === STANDALONE && entriesByName && entriesByName.has(name)) {
        // Not fatal: an LGU can have a Better LGU portal and a separately-run
        // budget site. Flag it so a reviewer can decide.
        console.warn(`⚠️  ${row}: "${name}" is "${STANDALONE}" but has a Better LGU Entry in README.md — should it be "${INTEGRATED}"?`);
    }

    const repoInfo = parseRepoCell(repo);

    return {
        name,
        portal,
        type,
        integrated: type === INTEGRATED,
        parentDomain: resolveParentDomain(type, name, row, entriesByName),
        repo: normalizeDash(repo),
        repoOwner: repoInfo ? repoInfo.owner : null,
        repoName: repoInfo ? repoInfo.repo : null,
        maintainer: normalizeDash(maintainer),
    };
}

function toYaml(portals) {
    return portals.map(p => [
        `- name: "${yamlStr(p.name)}"`,
        `  portal: "${yamlStr(p.portal)}"`,
        `  type: "${yamlStr(p.type)}"`,
        `  integrated: ${p.integrated}`,
        `  parent_domain: "${yamlStr(p.parentDomain)}"`,
        `  repo: "${yamlStr(p.repo)}"`,
        ...(p.repoOwner
            ? [`  repo_owner: "${yamlStr(p.repoOwner)}"`, `  repo_name: "${yamlStr(p.repoName)}"`]
            : []),
        `  maintainer: "${yamlStr(p.maintainer)}"`,
    ].join('\n')).join('\n');
}

function syncBudget(budgetContent, readmeContent) {
    const entriesByName = indexEntries(readmeContent);
    const rows = parseTable(budgetContent, BUDGET_START, BUDGET_END, 'BUDGET.md');
    const portals = rows.map((cells, i) => validateBudgetPortal(cells, i, entriesByName));

    const seen = new Set();
    for (const p of portals) {
        if (seen.has(p.name)) {
            throw new Error(`"${p.name}" appears more than once in the Budget table.`);
        }
        seen.add(p.name);
    }
    return portals;
}

function main() {
    console.log('🚀 Starting sync from BUDGET.md to Budget Portal Data...');
    let readmeContent = '';
    try {
        readmeContent = fs.readFileSync(README_PATH, 'utf8');
    } catch (error) {
        // indexEntries() then warns and every parent falls back to "-".
    }
    const portals = syncBudget(fs.readFileSync(BUDGET_PATH, 'utf8'), readmeContent);
    console.log(`✅ Validated ${portals.length} Budget Portal entries.`);

    fs.mkdirSync(path.dirname(BUDGET_DATA_PATH), { recursive: true });
    fs.writeFileSync(BUDGET_DATA_PATH, toYaml(portals));
    console.log(`🎉 Success! Data synchronized to ${BUDGET_DATA_PATH}`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`\n❌ BUDGET SYNC FAILED: ${error.message}`);
        process.exit(1);
    }
}

module.exports = {
    INTEGRATED,
    STANDALONE,
    validateBudgetPortal,
    syncBudget,
    toYaml,
};
