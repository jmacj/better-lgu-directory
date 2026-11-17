// Projects the Maintainer Profiles folder (#426) into
// _data/maintainer_profiles.yml, rendered on main-pages by the `/maintainers/`
// index and the profile page layout.
//
// Why a data file and not just the profile pages themselves: Jekyll shadows a
// page's `name` front matter with its filename, so a profile's `name` can't be
// read from Liquid; and a profile never lists its portals — they're derived
// from the Maintainer/s cells in README.md and BUDGET.md, which is sync work,
// not template work. The profile files stay the source of truth; this file is
// derived data like the rest of _data/. Offline, no network calls.
//
// Usage: node scripts/sync-profiles-to-data.js [output-path]

const fs = require('fs');
const path = require('path');
const { REPO_ROOT, README_PATH, readProfilePaths, syncLgus, yamlStr } = require('./sync-to-data');
const { BUDGET_PATH, syncBudget } = require('./sync-budget-to-data');
const { profileDirectory } = require('./maintainer-profiles');

const OUTPUT_PATH = process.argv[2] || path.join(REPO_ROOT, '_data/maintainer_profiles.yml');

function yamlList(key, values, indent = '  ') {
    if (values.length === 0) {
        return [`${indent}${key}: []`];
    }
    return [`${indent}${key}:`, ...values.map(value => `${indent}  - "${yamlStr(value)}"`)];
}

function toYaml(directory) {
    if (directory.length === 0) {
        return '[]\n';
    }
    return directory.map(p => [
        `- handle: "${yamlStr(p.handle)}"`,
        `  url: "${yamlStr(p.url)}"`,
        `  github: "${yamlStr(p.github)}"`,
        `  name: "${yamlStr(p.name)}"`,
        ...yamlList('open_to', p.open_to),
        ...yamlList('languages', p.languages),
        ...(Object.keys(p.channels).length === 0
            ? ['  channels: {}']
            : ['  channels:', ...Object.entries(p.channels).map(([key, value]) => `    ${key}: "${yamlStr(value)}"`)]),
        ...(p.portals.length === 0
            ? ['  portals: []']
            : ['  portals:', ...p.portals.flatMap(portal => [
                `    - name: "${yamlStr(portal.name)}"`,
                `      kind: "${portal.kind}"`,
                `      domain: "${yamlStr(portal.domain)}"`,
            ])]),
    ].join('\n')).join('\n') + '\n';
}

function main() {
    console.log('🚀 Starting sync from maintainers/ to Maintainer Profile Data...');
    const readme = fs.readFileSync(README_PATH, 'utf8');
    const profilePaths = readProfilePaths();
    const profileFiles = profilePaths
        .filter(p => p.endsWith('.md'))
        .map(p => ({ path: p, text: fs.readFileSync(path.join(REPO_ROOT, p), 'utf8') }));

    const directory = profileDirectory(
        profileFiles,
        syncLgus(readme, profilePaths),
        syncBudget(fs.readFileSync(BUDGET_PATH, 'utf8'), readme, profilePaths),
    );
    console.log(`✅ Found ${directory.length} Maintainer Profile(s).`);

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, toYaml(directory));
    console.log(`🎉 Success! Data synchronized to ${OUTPUT_PATH}`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`\n❌ PROFILE SYNC FAILED: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { toYaml };
