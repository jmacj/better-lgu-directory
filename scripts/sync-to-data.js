const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '../README.md');
const LGUS_DATA_PATH = process.argv[2] || path.join(__dirname, '../_data/lgus.yml');

const VALID_STATUSES = ['🟢 Active', '🟡 Work in Progress', '🔴 Unmaintained', '🔵 Planned'];

const EMPTY_MARKERS = ['', '-', '—', '–'];

// Escape a value for safe embedding inside a double-quoted YAML scalar.
function yamlStr(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Normalize a "no value" cell to a single uniform dash so the rendered
// table doesn't mix hyphens and em/en dashes.
function normalizeDash(value) {
    return EMPTY_MARKERS.includes((value || '').trim()) ? '-' : value;
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
    const [name, domain, repo, socialsCell, status, maintainer] = cells;

    if (!name || name === '—') {
        throw new Error(`LGU Table Row ${index + 1} is missing a name.`);
    }

    if (!VALID_STATUSES.includes(status)) {
        throw new Error(`LGU Table Row ${index + 1} has an invalid status: "${status}".`);
    }

    const socials = parseSocials(socialsCell);
    if (socials.length === 0 && !EMPTY_MARKERS.includes(socialsCell)) {
        throw new Error(`LGU Table Row ${index + 1} has a Socials cell with no valid [label](url) links: "${socialsCell}".`);
    }

    return {
        name,
        domain: normalizeDash(domain),
        repo: normalizeDash(repo),
        socials,
        status,
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

try {
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
        return [
            `- name: "${yamlStr(l.name)}"`,
            `  domain: "${yamlStr(l.domain)}"`,
            `  repo: "${yamlStr(l.repo)}"`,
            formatSocialsYaml(l.socials),
            `  status: "${yamlStr(l.status)}"`,
            `  maintainer: "${yamlStr(l.maintainer)}"`,
        ].join('\n');
    }).join('\n');

    fs.writeFileSync(LGUS_DATA_PATH, lguYaml);
    console.log(`🎉 Success! Data synchronized to ${LGUS_DATA_PATH}`);

} catch (error) {
    console.error(`\n❌ SYNC FAILED: ${error.message}`);
    process.exit(1);
}
