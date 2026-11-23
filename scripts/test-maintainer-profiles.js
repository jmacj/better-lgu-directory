// Zero-dependency test for scripts/maintainer-profiles.js (#426). Same shape
// as the other test-*.js scripts: no package.json / test runner on either
// branch, plain Node + built-in `assert`. Run with:
//
//   node scripts/test-maintainer-profiles.js
//
// The module is pure (no file or network I/O), so every case here feeds text
// or file lists in and checks what comes out. The name is unique to `main`,
// so it can't collide when sync-to-pages.yml merges `main` into `main-pages`.

const assert = require('assert');
const {
    extractHandles,
    parseProfile,
    profileHandle,
    findOrphans,
    resolveMaintainerLink,
    indexMismatches,
    reviewProfileChanges,
    profileDirectory,
} = require('./maintainer-profiles.js');

let failures = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failures++;
        console.error(`  ✗ ${name}\n    ${err.message}`);
    }
}

console.log('maintainer-profiles: extractHandles');

test('reads the handle from a GitHub profile link', () => {
    assert.deepStrictEqual(extractHandles('[@juan](https://github.com/juan)'), ['juan']);
});

test('the link target wins over the link text, and a trailing slash is ignored', () => {
    assert.deepStrictEqual(extractHandles('[@old-name](https://github.com/NewName/)'), ['NewName']);
});

test('reads plain @handle mentions', () => {
    assert.deepStrictEqual(extractHandles('@maria, @Pedro-2'), ['maria', 'Pedro-2']);
});

test('keeps every handle in a multi-Maintainer cell, in order', () => {
    assert.deepStrictEqual(
        extractHandles('[@rppf](https://github.com/rppf), [@h4ckedneko](https://github.com/h4ckedneko), @third'),
        ['rppf', 'h4ckedneko', 'third'],
    );
});

test('ignores the Open for Adoption tag', () => {
    assert.deepStrictEqual(
        extractHandles('[@yazunomii](https://github.com/yazunomii)<br>🤝 Open for Adoption'),
        ['yazunomii'],
    );
});

test('an empty cell has no handles', () => {
    for (const empty of ['-', '—', '', '  ']) {
        assert.deepStrictEqual(extractHandles(empty), []);
    }
});

test('drops case-insensitive duplicates, keeping the first spelling', () => {
    assert.deepStrictEqual(extractHandles('[@Juan](https://github.com/Juan), @juan'), ['Juan']);
});

test('ignores non-GitHub links and email addresses', () => {
    assert.deepStrictEqual(
        extractHandles('[site](https://juan.dev), juan@example.com, [@ok](https://github.com/ok)'),
        ['ok'],
    );
});

test('a github.com repo link is not a Maintainer handle', () => {
    assert.deepStrictEqual(extractHandles('[repo](https://github.com/org/repo)'), []);
});

console.log('maintainer-profiles: parseProfile');

function profile(frontMatter, body = '') {
    return `---\n${frontMatter}\n---\n${body}`;
}

test('a full valid profile parses, with multi-value fields split on commas', () => {
    const result = parseProfile(profile([
        'name: Juan Dela Cruz',
        'open_to: collaborators, mentoring ,code review',
        'languages: Filipino, English',
        'email: portal-team@example.org',
        'messenger: https://m.me/juan',
        'discord: juan#0001',
        'telegram: "@juan"',
        'linkedin: https://www.linkedin.com/in/juan-dela-cruz-123456789',
        'website: https://juan.dev',
    ].join('\n'), '## How I can help\n\nReviews on weekends.\n'));
    assert.deepStrictEqual(result.problems, []);
    assert.deepStrictEqual(result.profile, {
        name: 'Juan Dela Cruz',
        open_to: ['collaborators', 'mentoring', 'code review'],
        languages: ['Filipino', 'English'],
        email: 'portal-team@example.org',
        messenger: 'https://m.me/juan',
        discord: 'juan#0001',
        telegram: '@juan',
        linkedin: 'https://www.linkedin.com/in/juan-dela-cruz-123456789',
        website: 'https://juan.dev',
    });
    assert.strictEqual(result.body.trim(), '## How I can help\n\nReviews on weekends.');
});

test('every field is optional — an empty front matter or none at all is valid', () => {
    for (const text of [profile(''), 'Just some prose, no front matter.', '']) {
        const result = parseProfile(text);
        assert.deepStrictEqual(result.problems, []);
        assert.deepStrictEqual(result.profile, {});
    }
});

test('unknown keys are problems, including a handle key and phone-ish channels', () => {
    for (const key of ['handle', 'layout', 'phone', 'viber', 'Email']) {
        const { problems } = parseProfile(profile(`${key}: x`));
        assert.strictEqual(problems.length, 1, `expected one problem for "${key}"`);
        assert.match(problems[0], new RegExp(`unknown key "${key}"`));
    }
});

test('nested values are problems: lists, maps, and indented lines', () => {
    for (const fm of [
        'open_to:\n  - mentoring',
        'languages: [Filipino, English]',
        'name: {first: Juan}',
        'email:\n  work: a@b.org',
    ]) {
        const { problems } = parseProfile(profile(fm));
        assert.ok(problems.some(p => /nested/.test(p)), `expected a nested-value problem for ${JSON.stringify(fm)}, got ${JSON.stringify(problems)}`);
    }
});

test('phone-number-like content is a problem in any field', () => {
    for (const phone of ['09171234567', '+63 917 123 4567', '(02) 8123-4567', '0917-123-4567', '+639171234567']) {
        const { problems } = parseProfile(profile(`messenger: ${phone}`));
        assert.ok(problems.some(p => /phone/.test(p)), `expected a phone problem for "${phone}"`);
    }
});

test('phone-number-like content is a problem in the prose too', () => {
    const { problems } = parseProfile(profile('name: Juan', 'Text me at 0917 123 4567 any time.'));
    assert.ok(problems.some(p => /phone/.test(p) && /body/.test(p)));
});

test('dates, years, and digits inside URLs are not phone numbers', () => {
    const { problems } = parseProfile(profile(
        'linkedin: https://www.linkedin.com/in/juan-1234567890',
        'Maintaining since 2024-11-16. Active 2024 to 2026.',
    ));
    assert.deepStrictEqual(problems, []);
});

test('a front matter block that never closes is a problem', () => {
    const { problems } = parseProfile('---\nname: Juan\n');
    assert.ok(problems.some(p => /front matter/.test(p)));
});

console.log('maintainer-profiles: profileHandle');

test('a profile path yields the handle from its filename', () => {
    assert.strictEqual(profileHandle('maintainers/Juan-2.md'), 'Juan-2');
    assert.strictEqual(profileHandle('Juan-2.md'), 'Juan-2');
});

test('the README index, the template, non-markdown files, and invalid names are not profiles', () => {
    for (const path of ['maintainers/README.md', 'maintainers/readme.md', 'maintainers/_template.md', 'maintainers/juan.txt', 'maintainers/Juan Dela Cruz.md', 'maintainers/-juan.md']) {
        assert.strictEqual(profileHandle(path), null, path);
    }
});

console.log('maintainer-profiles: findOrphans');

const PROFILES = ['maintainers/README.md', 'maintainers/_template.md', 'maintainers/Juan.md', 'maintainers/maria.md', 'maintainers/gone.md'];

test('a profile is orphaned when its handle is in no Maintainer/s cell', () => {
    assert.deepStrictEqual(findOrphans(['juan', 'maria'], PROFILES), ['maintainers/gone.md']);
});

test('handles listed only in BUDGET.md or only in README.md both count — callers pass the union', () => {
    const readmeOnly = ['juan'];
    const budgetOnly = ['maria'];
    assert.deepStrictEqual(findOrphans([...readmeOnly, ...budgetOnly], PROFILES), ['maintainers/gone.md']);
    assert.deepStrictEqual(findOrphans(readmeOnly, PROFILES), ['maintainers/maria.md', 'maintainers/gone.md']);
});

test('handle matching is case-insensitive', () => {
    assert.deepStrictEqual(findOrphans(['JUAN', 'Maria', 'GONE'], PROFILES), []);
});

test('the index and the template are never orphans', () => {
    assert.deepStrictEqual(findOrphans([], ['maintainers/README.md', 'maintainers/_template.md']), []);
});

console.log('maintainer-profiles: resolveMaintainerLink');

test('a Maintainer with a profile links to their site profile page, named after the file', () => {
    assert.deepStrictEqual(resolveMaintainerLink('juan', PROFILES), { handle: 'juan', url: '/maintainers/Juan/', profile: true });
});

test('a Maintainer without a profile links to their GitHub profile', () => {
    assert.deepStrictEqual(resolveMaintainerLink('Pedro', PROFILES), { handle: 'Pedro', url: 'https://github.com/Pedro', profile: false });
});

test('the README index and the template never count as a profile', () => {
    assert.strictEqual(resolveMaintainerLink('README', PROFILES).profile, false);
    assert.strictEqual(resolveMaintainerLink('_template', PROFILES).profile, false);
});

console.log('maintainer-profiles: indexMismatches');

function index(...bullets) {
    return [
        '# Maintainer Profiles',
        '',
        'Add yourself like this:',
        '',
        '```markdown',
        '- [@your-handle](your-handle.md) · Your Name',
        '```',
        '',
        '<!-- MAINTAINER_PROFILES_START -->',
        ...bullets,
        '<!-- MAINTAINER_PROFILES_END -->',
    ].join('\n');
}

const kinds = mismatches => mismatches.map(({ kind, handle }) => `${kind}:${handle}`).sort();

test('an index that matches the files has no mismatches', () => {
    assert.deepStrictEqual(indexMismatches(index(
        '- [@Juan](Juan.md) · Juan Dela Cruz',
        '- [@maria](maria.md) · maria',
    ), ['maintainers/README.md', 'maintainers/_template.md', 'maintainers/Juan.md', 'maintainers/maria.md']), []);
});

test('a profile file with no bullet is a mismatch', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- [@Juan](Juan.md) · Juan',
    ), ['maintainers/Juan.md', 'maintainers/maria.md'])), ['missing-bullet:maria']);
});

test('a bullet with no profile file is a mismatch', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- [@Juan](Juan.md) · Juan',
        '- [@gone](gone.md) · Gone',
    ), ['maintainers/Juan.md'])), ['missing-file:gone']);
});

test('a bullet whose link and @handle disagree is a mismatch', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- [@someone-else](Juan.md) · Juan',
    ), ['maintainers/Juan.md'])), ['handle-mismatch:Juan']);
});

test('index matching is case-insensitive', () => {
    assert.deepStrictEqual(indexMismatches(index(
        '- [@JUAN](juan.md) · Juan',
    ), ['maintainers/Juan.md']), []);
});

test('a bullet listed twice is a mismatch', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- [@Juan](Juan.md) · Juan',
        '- [@juan](juan.md) · Juan again',
    ), ['maintainers/Juan.md'])), ['duplicate-bullet:juan']);
});

test('a bullet may leave out the name', () => {
    assert.deepStrictEqual(indexMismatches(index(
        '- [@Juan](Juan.md)',
    ), ['maintainers/Juan.md']), []);
});

test('the old name-first bullet is malformed', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- [Juan](Juan.md) · @Juan',
    ), ['maintainers/Juan.md'])), ['malformed-bullet:-', 'missing-bullet:Juan']);
});

test('a line in the list that is not a profile bullet is a mismatch', () => {
    assert.deepStrictEqual(kinds(indexMismatches(index(
        '- Juan, see Juan.md',
    ), [])), ['malformed-bullet:-']);
});

test('an index without the list markers reports every profile as missing', () => {
    assert.deepStrictEqual(kinds(indexMismatches('# no list', ['maintainers/Juan.md'])), ['missing-bullet:Juan', 'missing-list:-']);
});

console.log('maintainer-profiles: reviewProfileChanges');

const GOOD_INDEX = index('- [@juan](juan.md) · Juan');

function review(overrides) {
    return reviewProfileChanges({
        author: 'juan',
        changes: [{ status: 'A', path: 'maintainers/juan.md' }],
        headFiles: new Map([['maintainers/juan.md', profile('name: Juan\nemail: team@example.org')]]),
        headProfilePaths: ['maintainers/README.md', 'maintainers/_template.md', 'maintainers/juan.md'],
        headIndex: GOOD_INDEX,
        listedHandles: ['Juan'],
        ...overrides,
    });
}

test('a PR that touches no profile files is not reviewed', () => {
    assert.strictEqual(review({ changes: [{ status: 'M', path: 'README.md' }] }), null);
});

test('a clean opt-in by the owner has no problems', () => {
    assert.deepStrictEqual(review({ author: 'JUAN' }), []);
});

test('adding or editing someone else\'s profile is flagged', () => {
    for (const status of ['A', 'M']) {
        const problems = review({ author: 'mallory', changes: [{ status, path: 'maintainers/juan.md' }] });
        assert.ok(problems.some(p => p.path === 'maintainers/juan.md' && /@mallory/.test(p.message) && /@juan/.test(p.message)), JSON.stringify(problems));
    }
});

test('anyone may delete a profile (Directory Maintainers honour removal requests)', () => {
    assert.deepStrictEqual(review({
        author: 'jmacj',
        changes: [{ status: 'D', path: 'maintainers/gone.md' }, { status: 'M', path: 'maintainers/README.md' }],
        headFiles: new Map([['maintainers/README.md', GOOD_INDEX]]),
    }), []);
});

test('invalid front matter and phone numbers are flagged on the file', () => {
    const problems = review({ headFiles: new Map([['maintainers/juan.md', profile('handle: juan\nemail: 09171234567')]]) });
    assert.ok(problems.some(p => /unknown key "handle"/.test(p.message)));
    assert.ok(problems.some(p => /phone/.test(p.message)));
});

test('a profile for a handle in no Maintainer/s cell is flagged', () => {
    const problems = review({ listedHandles: ['maria'] });
    assert.ok(problems.some(p => p.path === 'maintainers/juan.md' && /isn't listed/.test(p.message)), JSON.stringify(problems));
});

test('a filename that is not a GitHub handle is flagged', () => {
    const problems = review({
        author: 'juan',
        changes: [{ status: 'A', path: 'maintainers/Juan Dela Cruz.md' }],
        headFiles: new Map([['maintainers/Juan Dela Cruz.md', profile('name: Juan')]]),
    });
    assert.ok(problems.some(p => /filename/.test(p.message)), JSON.stringify(problems));
});

test('a file nested below the profiles folder is flagged, not skipped', () => {
    const problems = review({
        changes: [{ status: 'A', path: 'maintainers/juan/profile.md' }],
        headFiles: new Map([['maintainers/juan/profile.md', profile('name: Juan')]]),
    });
    assert.ok(Array.isArray(problems), 'expected the PR to be reviewed');
    assert.ok(problems.some(p => p.path === 'maintainers/juan/profile.md' && /directly in/.test(p.message)), JSON.stringify(problems));
});

test('an opt-in that forgets the index bullet is flagged', () => {
    const problems = review({ headIndex: index() });
    assert.ok(problems.some(p => p.path === 'maintainers/README.md' && /no bullet/.test(p.message)), JSON.stringify(problems));
});

test('editing only the index still checks it against the files', () => {
    const problems = review({
        changes: [{ status: 'M', path: 'maintainers/README.md' }],
        headIndex: index('- [@juan](juan.md) · Juan', '- [@ghost](ghost.md) · Ghost'),
    });
    assert.ok(problems.some(p => /ghost/.test(p.message)), JSON.stringify(problems));
});

test('edits to the template are not reviewed as a profile', () => {
    assert.deepStrictEqual(review({
        author: 'jmacj',
        changes: [{ status: 'M', path: 'maintainers/_template.md' }],
        headFiles: new Map([['maintainers/_template.md', profile('name: Your Name')]]),
    }), []);
});

console.log('maintainer-profiles: profileDirectory');

test('lists each profile with its fields and the portals (with their domains) derived from both tables, sorted by handle', () => {
    const directory = profileDirectory(
        [
            { path: 'maintainers/README.md', text: '# index' },
            { path: 'maintainers/_template.md', text: profile('name: Your Name') },
            { path: 'maintainers/maria.md', text: profile('open_to: mentoring') },
            { path: 'maintainers/Juan.md', text: profile('name: Juan Dela Cruz\nlanguages: Filipino, English\nemail: team@example.org') },
        ],
        [
            { name: 'Alpha, Laguna', domain: '[alpha.example](https://alpha.example)', maintainer: '[@juan](https://github.com/juan)' },
            { name: 'Beta, Laguna', domain: '-', maintainer: '@maria, @JUAN' },
        ],
        [{ name: 'Alpha, Laguna', portal: '[budget.alpha.example](https://budget.alpha.example)', maintainer: '[@Juan](https://github.com/Juan)' }],
    );
    assert.deepStrictEqual(directory, [
        {
            handle: 'Juan',
            url: '/maintainers/Juan/',
            github: 'https://github.com/Juan',
            name: 'Juan Dela Cruz',
            open_to: [],
            languages: ['Filipino', 'English'],
            channels: { email: 'team@example.org' },
            portals: [
                { name: 'Alpha, Laguna', kind: 'entry', domain: '[alpha.example](https://alpha.example)' },
                { name: 'Beta, Laguna', kind: 'entry', domain: '-' },
                { name: 'Alpha, Laguna', kind: 'budget', domain: '[budget.alpha.example](https://budget.alpha.example)' },
            ],
        },
        {
            handle: 'maria',
            url: '/maintainers/maria/',
            github: 'https://github.com/maria',
            name: 'maria',
            open_to: ['mentoring'],
            languages: [],
            channels: {},
            portals: [{ name: 'Beta, Laguna', kind: 'entry', domain: '-' }],
        },
    ]);
});

test('an orphaned profile is still listed, with no portals', () => {
    const [entry] = profileDirectory([{ path: 'maintainers/gone.md', text: '' }], [], []);
    assert.strictEqual(entry.handle, 'gone');
    assert.deepStrictEqual(entry.portals, []);
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed.`);
    process.exit(1);
}
console.log('\nAll maintainer profile tests passed.');
