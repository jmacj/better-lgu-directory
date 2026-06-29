const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '../README.md');
const LGUS_DATA_PATH = process.argv[2] || path.join(__dirname, '../_data/lgus.yml');

const VALID_STATUSES = ['🟢 Active', '🟡 Work in Progress', '🔴 Unmaintained', '🔵 Planned'];

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
    if (!cell || cell === '-' || cell === '—' || cell === '–') {
        return [];
    }

    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
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

    return { name, domain, repo, socials, status, maintainer };
}

function formatSocialsYaml(socials) {
    if (socials.length === 0) {
        return '  socials: []';
    }
    const lines = ['  socials:'];
    for (const s of socials) {
        lines.push(`    - platform: "${s.platform}"`);
        lines.push(`      label: "${s.label}"`);
        lines.push(`      url: "${s.url}"`);
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
            `- name: "${l.name}"`,
            `  domain: "${l.domain}"`,
            `  repo: "${l.repo}"`,
            formatSocialsYaml(l.socials),
            `  status: "${l.status}"`,
            `  maintainer: "${l.maintainer}"`,
        ].join('\n');
    }).join('\n');

    fs.writeFileSync(LGUS_DATA_PATH, lguYaml);
    console.log(`🎉 Success! Data synchronized to ${LGUS_DATA_PATH}`);

} catch (error) {
    console.error(`\n❌ SYNC FAILED: ${error.message}`);
    process.exit(1);
}
