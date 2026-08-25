const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '../README.md');
const LGUS_DATA_PATH = process.argv[2] || path.join(__dirname, '../_data/lgus.yml');

const VALID_STATUSES = ['🟢 Active', '🟡 Work in Progress', '🔴 Unmaintained', '🔵 Planned'];

const EMPTY_MARKERS = ['', '-', '—', '–'];

// Secondary tags rendered on a second line of a cell, under the primary value.
// `⚠️ Stale` marks a Planned entry with no directory activity for over
// STALE_AFTER_DAYS; `🤝 Open for Adoption` invites a new maintainer to take it
// over. The two always travel together — see validateLgu.
const STALE_TAG = '⚠️ Stale';
const ADOPTION_TAG = '🤝 Open for Adoption';
const STALE_AFTER_DAYS = 30;

// A cell may stack values on separate lines with <br>. Returns the trimmed,
// non-empty parts in order, so parts[0] is the cell's primary value.
function splitCellLines(cell) {
    return String(cell)
        .split(/<br\s*\/?>/i)
        .map(part => part.trim())
        .filter(part => part !== '');
}

// Escape a value for safe embedding inside a double-quoted YAML scalar.
function yamlStr(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Normalize a "no value" cell to a single uniform dash so the rendered
// table doesn't mix hyphens and em/en dashes.
function normalizeDash(value) {
    return EMPTY_MARKERS.includes((value || '').trim()) ? '-' : value;
}

// Matches a github.com repo URL, optionally pinned to a branch via /tree/<ref>
// (bettercalauan/bettercalauan is the one Entry in the table that does this —
// see GUIDE.md/CONTRIBUTING.md context in #162). Anything else — a non-GitHub
// host, a user/org profile URL with no repo segment, a malformed link — does
// not match, and the Entry is treated as having no parseable repo.
const GITHUB_REPO_URL_PATTERN = /^https:\/\/github\.com\/([^\/\s#?]+)\/([^\/\s#?]+?)(?:\/tree\/([^\s#?]+?))?\/?$/;

// Parses the Repository cell's `[label](url)` markdown link into structured
// owner/repo/ref, for #162 (repository activity). This is the *only* place
// that reads a repo URL out of README.md presentation markup — everything
// downstream (the browser module, index.md) consumes the structured fields
// this produces, never the raw cell text. Returns null for "-" cells, cells
// with no link, or links that aren't github.com repo URLs.
function parseRepoCell(cell) {
    if (EMPTY_MARKERS.includes((cell || '').trim())) {
        return null;
    }
    const linkMatch = /\[[^\]]*\]\(([^)]+)\)/.exec(cell);
    if (!linkMatch) {
        return null;
    }
    const urlMatch = GITHUB_REPO_URL_PATTERN.exec(linkMatch[1].trim());
    if (!urlMatch) {
        return null;
    }
    const [, owner, repo, ref] = urlMatch;
    return ref ? { owner, repo, ref } : { owner, repo };
}

function parseTable(content, startMarker, endMarker) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
        throw new Error(`Markers ${startMarker} or ${endMarker} not found in README.md`);
    }

    const tableContent = content.substring(startIdx + startMarker.length, endIdx).trim();
    const rows = tableContent.split('\n').filter(row => row.trim().startsWith('|'));

    // Skip header and separator
    const dataRows = rows.slice(2);

    return dataRows.map((row) => {
        const cells = row.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        return cells;
    });
}

function parseSocials(cell) {
    if (EMPTY_MARKERS.includes(cell)) {
        return [];
    }

    // URL group allows one level of nested parens, e.g. ..._(Philippines)
    const linkPattern = /\[([^\]]+)\]\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    const socials = [];
    let match;

    while ((match = linkPattern.exec(cell)) !== null) {
        const label = match[1].trim();
        const url = match[2].trim();
        const platform = label.toLowerCase().trim();
        socials.push({ platform, label, url });
    }

    return socials;
}

function validateLgu(cells, index) {
    if (cells.length < 6) {
        throw new Error(`LGU Table Row ${index + 1} is malformed (missing columns).`);
    }
    const [name, domain, repo, socialsCell, statusCell, maintainerCell] = cells;

    if (!name || name === '—') {
        throw new Error(`LGU Table Row ${index + 1} is missing a name.`);
    }

    const [status, ...statusTags] = splitCellLines(statusCell);

    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`LGU Table Row ${index + 1} has an invalid status: "${status}".`);
    }

    const unknownStatusTag = statusTags.find(tag => tag !== STALE_TAG);
    if (unknownStatusTag) {
        throw new Error(`LGU Table Row ${index + 1} has an unknown status tag: "${unknownStatusTag}".`);
    }

    const stale = statusTags.includes(STALE_TAG);
    if (stale && status !== '🔵 Planned') {
        throw new Error(`LGU Table Row ${index + 1} is tagged "${STALE_TAG}" but its status is "${status}" — only 🔵 Planned entries can go stale.`);
    }

    const maintainerLines = splitCellLines(maintainerCell);
    const openForAdoption = maintainerLines.includes(ADOPTION_TAG);
    const maintainer = maintainerLines.filter(line => line !== ADOPTION_TAG).join(' ');

    // Keep the two columns coherent: a stale entry is by definition open for
    // adoption, and nothing else may carry the adoption call to action.
    if (stale !== openForAdoption) {
        throw new Error(`LGU Table Row ${index + 1} must carry "${STALE_TAG}" and "${ADOPTION_TAG}" together (stale=${stale}, open for adoption=${openForAdoption}).`);
    }

    const socials = parseSocials(socialsCell);
    if (socials.length === 0 && !EMPTY_MARKERS.includes(socialsCell)) {
        throw new Error(`LGU Table Row ${index + 1} has a Socials cell with no valid [label](url) links: "${socialsCell}".`);
    }

    const repoInfo = parseRepoCell(repo);

    return {
        name,
        domain: normalizeDash(domain),
        repo: normalizeDash(repo),
        repoOwner: repoInfo ? repoInfo.owner : null,
        repoName: repoInfo ? repoInfo.repo : null,
        repoRef: repoInfo ? repoInfo.ref || null : null,
        socials,
        status,
        stale,
        openForAdoption,
        maintainer: normalizeDash(maintainer),
    };
}

function formatSocialsYaml(socials) {
    if (socials.length === 0) {
        return '  socials: []';
    }
    const lines = ['  socials:'];
    for (const s of socials) {
        lines.push(`    - platform: "${yamlStr(s.platform)}"`);
        lines.push(`      label: "${yamlStr(s.label)}"`);
        lines.push(`      url: "${yamlStr(s.url)}"`);
    }
    return lines.join('\n');
}

function main() {
    console.log('🚀 Starting sync from README.md to LGU Data...');
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');

    // Parse LGUs
    const rawLgus = parseTable(readmeContent, '<!-- SYNC_LGU_TABLE_START -->', '<!-- SYNC_LGU_TABLE_END -->');
    const lgus = rawLgus.map(validateLgu);
    console.log(`✅ Validated ${lgus.length} LGU entries.`);

    // Ensure directory exists
    const dataDir = path.dirname(LGUS_DATA_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write to YAML
    const lguYaml = lgus.map(l => {
        const repoIdentityLines = l.repoOwner
            ? [
                `  repo_owner: "${yamlStr(l.repoOwner)}"`,
                `  repo_name: "${yamlStr(l.repoName)}"`,
                ...(l.repoRef ? [`  repo_ref: "${yamlStr(l.repoRef)}"`] : []),
            ]
            : [];
        return [
            `- name: "${yamlStr(l.name)}"`,
            `  domain: "${yamlStr(l.domain)}"`,
            `  repo: "${yamlStr(l.repo)}"`,
            ...repoIdentityLines,
            formatSocialsYaml(l.socials),
            `  status: "${yamlStr(l.status)}"`,
            `  stale: ${l.stale}`,
            `  open_for_adoption: ${l.openForAdoption}`,
            `  maintainer: "${yamlStr(l.maintainer)}"`,
        ].join('\n');
    }).join('\n');

    fs.writeFileSync(LGUS_DATA_PATH, lguYaml);
    console.log(`🎉 Success! Data synchronized to ${LGUS_DATA_PATH}`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`\n❌ SYNC FAILED: ${error.message}`);
        process.exit(1);
    }
}

module.exports = {
    README_PATH,
    STALE_TAG,
    ADOPTION_TAG,
    STALE_AFTER_DAYS,
    parseTable,
    splitCellLines,
    normalizeDash,
    parseRepoCell,
    validateLgu,
};
