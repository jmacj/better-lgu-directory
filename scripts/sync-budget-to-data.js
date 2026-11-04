// Projects the Budget Portal table in BUDGET.md into _data/budget_portals.yml,
// rendered by budget-directory.md on main-pages at lgu.bettergov.ph/BUDGET/.
//
// BUDGET.md is the sole source of truth for Budget Portals, the same way
// README.md is for Entries. An `🧩 Integrated` Budget Portal belongs to a
// Better LGU Entry: its LGU cell must match that Entry's name in README.md
// exactly, and the Entry's Domain is copied in as `parent_domain`. Its
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

// Builds name → Entry from the README table, reusing the directory's own
// validator so a budget sync never accepts a README the main sync would reject.
function indexEntries(readmeContent) {
    const entries = parseTable(readmeContent, LGU_START, LGU_END, 'README.md').map(validateLgu);
    return new Map(entries.map(entry => [entry.name, entry]));
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

    const entry = entriesByName.get(name);
    if (type === INTEGRATED && !entry) {
        throw new Error(`${row} is "${INTEGRATED}" but "${name}" is not an LGU in README.md — match the Entry's name exactly, or register the Better LGU portal first.`);
    }
    if (type === STANDALONE && entry) {
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
        parentDomain: type === INTEGRATED ? entry.domain : '-',
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
    const portals = syncBudget(
        fs.readFileSync(BUDGET_PATH, 'utf8'),
        fs.readFileSync(README_PATH, 'utf8'),
    );
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
