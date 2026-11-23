const fs = require('fs');
const path = require('path');
const { PROFILES_DIR, extractHandles, resolveMaintainerLink } = require('./maintainer-profiles');
const { parseLguName } = require('./lgu-name');
const { REGIONS, psgcName } = require('./psgc-regions');

const REPO_ROOT = path.join(__dirname, '..');
const README_PATH = path.join(REPO_ROOT, 'README.md');
const LGUS_DATA_PATH = process.argv[2] || path.join(__dirname, '../_data/lgus.yml');
// Generated from scripts/psgc-regions.js beside lgus.yml (#307), never edited
// by hand: the website reads region names and ranks from here.
const REGIONS_DATA_PATH = path.join(path.dirname(LGUS_DATA_PATH), 'regions.yml');

const VALID_STATUSES = ['🟢 Active', '🟡 Work in Progress', '🔴 Unmaintained', '🔵 Planned'];

const EMPTY_MARKERS = ['', '-', '—', '–'];

// Secondary tags rendered on a second line of a cell, under the primary value.
// `⚠️ Stale` marks a Planned entry with no directory activity for over
// STALE_AFTER_DAYS, or a Work in Progress entry whose Maintainer/s left two
// check-ins unanswered (#469); `🤝 Open for Adoption` invites a new maintainer
// to take it over. Stale always brings Adoption with it; Adoption also appears
// alone on a 🔴 Unmaintained entry — see validateLgu.
const STALE_TAG = '⚠️ Stale';
const ADOPTION_TAG = '🤝 Open for Adoption';
const STALE_AFTER_DAYS = 30;
// Only entries that never went live can go stale. A live portal that stops
// being maintained becomes 🔴 Unmaintained instead (#469).
const STALE_STATUSES = ['🔵 Planned', '🟡 Work in Progress'];

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

// README domain cells are markdown links — e.g. "[bettersolano.org]
// (https://bettersolano.org)" — the same raw form validateLgu() stores
// (sync-to-data.js relies on kramdown re-processing that text at render
// time; see index.md's `markdown="1"` table wrapper). Extract the real URL
// to crawl and the bare hostname to display, falling back to treating the
// whole cell as a bare hostname if it isn't a markdown link. Shared by the
// crawler (Featured/Logo `domain`) and the Entry's `host` (#307), so the two
// always match.
function extractDomainLink(rawCell) {
    const match = /\[([^\]]+)\]\(([^)]+)\)/.exec(rawCell || '');
    if (match) {
        return { label: match[1].trim(), url: match[2].trim() };
    }
    const bare = String(rawCell || '').trim();
    return { label: bare, url: /^https?:\/\//i.test(bare) ? bare : `https://${bare}` };
}

// The portal's plain hostname, for matching Entries to Featured and Logo data
// by domain (#307). Empty when the Domain cell is empty.
function hostOf(domainCell) {
    return EMPTY_MARKERS.includes((domainCell || '').trim()) ? '' : extractDomainLink(domainCell).label;
}

function parseTable(content, startMarker, endMarker, sourceName = 'README.md') {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
        throw new Error(`Markers ${startMarker} or ${endMarker} not found in ${sourceName}`);
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

    let lguName;
    try {
        lguName = parseLguName(name);
    } catch (error) {
        throw new Error(`LGU Table Row ${index + 1}: ${error.message} See CONTRIBUTING.md, "Naming Your LGU".`);
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
    if (stale && !STALE_STATUSES.includes(status)) {
        throw new Error(`LGU Table Row ${index + 1} is tagged "${STALE_TAG}" but its status is "${status}" — only 🔵 Planned and 🟡 Work in Progress entries can go stale.`);
    }

    const maintainerLines = splitCellLines(maintainerCell);
    const openForAdoption = maintainerLines.includes(ADOPTION_TAG);
    const maintainer = maintainerLines.filter(line => line !== ADOPTION_TAG).join(' ');

    // Keep the two columns coherent (#469): a stale entry is by definition open
    // for adoption, and the only other entry that may carry the adoption call
    // to action is a 🔴 Unmaintained one, which a Directory Maintainer has
    // already marked. Unmaintained entries never go stale (see above).
    const isUnmaintained = status === '🔴 Unmaintained';
    if (stale && !openForAdoption) {
        throw new Error(`LGU Table Row ${index + 1} is tagged "${STALE_TAG}" but not "${ADOPTION_TAG}" — a stale entry is always open for adoption.`);
    }
    if (openForAdoption && !stale && !isUnmaintained) {
        throw new Error(`LGU Table Row ${index + 1} is tagged "${ADOPTION_TAG}" with status "${status}" — only entries tagged "${STALE_TAG}" and 🔴 Unmaintained entries can be open for adoption.`);
    }

    const socials = parseSocials(socialsCell);
    if (socials.length === 0 && !EMPTY_MARKERS.includes(socialsCell)) {
        throw new Error(`LGU Table Row ${index + 1} has a Socials cell with no valid [label](url) links: "${socialsCell}".`);
    }

    const repoInfo = parseRepoCell(repo);

    return {
        name,
        ...lguName,
        host: hostOf(domain),
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

    const lgus = syncLgus(readmeContent, readProfilePaths());
    console.log(`✅ Validated ${lgus.length} LGU entries.`);

    // Ensure directory exists
    const dataDir = path.dirname(LGUS_DATA_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(LGUS_DATA_PATH, lgusToYaml(lgus));
    fs.writeFileSync(REGIONS_DATA_PATH, regionsToYaml());
    console.log(`🎉 Success! Data synchronized to ${LGUS_DATA_PATH}`);
}

// Every path in the Maintainer Profiles folder (#426), relative to the repo
// root — e.g. "maintainers/juan.md". The folder may not exist yet; that just
// means nobody has opted in, and every Maintainer links to GitHub.
function readProfilePaths(root = REPO_ROOT) {
    try {
        return fs.readdirSync(path.join(root, PROFILES_DIR)).map(name => `${PROFILES_DIR}/${name}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// The structured Maintainer list beside the raw `maintainer` string (#426):
// each handle with its resolved link — the site profile page when the
// Maintainer has published a Maintainer Profile, otherwise GitHub. Resolved
// here so the templates on main-pages only render.
function maintainerLinks(maintainerCell, profilePaths) {
    return extractHandles(maintainerCell).map(handle => resolveMaintainerLink(handle, profilePaths));
}

function formatMaintainersYaml(maintainers) {
    if (maintainers.length === 0) {
        return '  maintainers: []';
    }
    const lines = ['  maintainers:'];
    for (const m of maintainers) {
        lines.push(`    - handle: "${yamlStr(m.handle)}"`);
        lines.push(`      url: "${yamlStr(m.url)}"`);
        lines.push(`      profile: ${m.profile}`);
    }
    return lines.join('\n');
}

// README.md table → validated Entries, each with its resolved `maintainers`.
function syncLgus(readmeContent, profilePaths = []) {
    return parseTable(readmeContent, '<!-- SYNC_LGU_TABLE_START -->', '<!-- SYNC_LGU_TABLE_END -->')
        .map((cells, index) => validateLgu(cells, index))
        .map(lgu => ({ ...lgu, maintainers: maintainerLinks(lgu.maintainer, profilePaths) }));
}

function lgusToYaml(lgus) {
    return lgus.map(l => {
        const repoIdentityLines = l.repoOwner
            ? [
                `  repo_owner: "${yamlStr(l.repoOwner)}"`,
                `  repo_name: "${yamlStr(l.repoName)}"`,
                ...(l.repoRef ? [`  repo_ref: "${yamlStr(l.repoRef)}"`] : []),
            ]
            : [];
        return [
            `- name: "${yamlStr(l.name)}"`,
            `  place: "${yamlStr(l.place)}"`,
            `  kind: "${yamlStr(l.kind)}"`,
            `  province: "${yamlStr(l.province)}"`,
            `  region: "${yamlStr(l.region)}"`,
            `  region_rank: ${l.regionRank}`,
            `  host: "${yamlStr(l.host)}"`,
            `  domain: "${yamlStr(l.domain)}"`,
            `  repo: "${yamlStr(l.repo)}"`,
            ...repoIdentityLines,
            formatSocialsYaml(l.socials),
            `  status: "${yamlStr(l.status)}"`,
            `  stale: ${l.stale}`,
            `  open_for_adoption: ${l.openForAdoption}`,
            `  maintainer: "${yamlStr(l.maintainer)}"`,
            formatMaintainersYaml(l.maintainers),
        ].join('\n');
    }).join('\n');
}

// _data/regions.yml: the ordered region names, ranks and PSGC names (the
// website's region filter labels), from the PSGC regions module.
function regionsToYaml() {
    return REGIONS.map((region, rank) =>
        `- name: "${yamlStr(region.name)}"\n  rank: ${rank}\n  psgc_name: "${yamlStr(psgcName(region))}"`,
    ).join('\n') + '\n';
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
    REPO_ROOT,
    README_PATH,
    readProfilePaths,
    maintainerLinks,
    formatMaintainersYaml,
    syncLgus,
    lgusToYaml,
    regionsToYaml,
    extractDomainLink,
    hostOf,
    STALE_TAG,
    ADOPTION_TAG,
    STALE_AFTER_DAYS,
    parseTable,
    splitCellLines,
    normalizeDash,
    parseRepoCell,
    validateLgu,
    yamlStr,
    VALID_STATUSES,
    EMPTY_MARKERS,
};
