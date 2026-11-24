// Maintainer Profiles (#426): the one place that knows how a Maintainer/s
// cell names its Maintainers, what a Maintainer Profile file may contain, and
// where a Maintainer's handle should link.
//
// Pure — no file or network I/O. Callers (the two sync scripts, triage-pr.js,
// check-stale.js) read files themselves and hand this module text and file
// lists. See CONTEXT.md for the terms and #426 for the decision record.

// A GitHub username: alphanumerics and single hyphens, never leading.
const HANDLE = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})';

// Either a markdown link (group 1: its URL) or a bare @handle (group 2). One
// pattern so handles come out in the order they were written. The lookbehind
// keeps the local part of an email address from reading as a mention.
const CELL_TOKEN = new RegExp(`\\[[^\\]]*\\]\\(\\s*([^)\\s]+)\\s*\\)|(?<![\\w.@/-])@(${HANDLE})\\b`, 'g');
const GITHUB_PROFILE_URL = new RegExp(`^https?://(?:www\\.)?github\\.com/(${HANDLE})/?$`, 'i');

/**
 * The Maintainers named in a Maintainer/s cell, as written. Accepts the
 * `[@handle](https://github.com/handle)` form (the URL is what counts) and
 * plain `@handle`. Anything else — the `🤝 Open for Adoption` tag, `-`,
 * non-GitHub links, email addresses — names nobody. Handles are compared
 * case-insensitively, so a repeat with different case is dropped.
 */
function extractHandles(cell) {
    const handles = [];
    const seen = new Set();
    for (const match of String(cell || '').matchAll(CELL_TOKEN)) {
        let handle = match[2];
        if (match[1] !== undefined) {
            const profile = GITHUB_PROFILE_URL.exec(match[1]);
            handle = profile ? profile[1] : undefined;
        }
        if (handle && !seen.has(handle.toLowerCase())) {
            seen.add(handle.toLowerCase());
            handles.push(handle);
        }
    }
    return handles;
}

// Every key a Maintainer Profile may set. All optional. There is deliberately
// no handle key: the filename is the only record of whose profile it is.
const CHANNEL_KEYS = ['email', 'messenger', 'discord', 'telegram', 'linkedin', 'website'];
const LIST_KEYS = ['open_to', 'languages'];
// Personal Support (#498): one link where people can back this Maintainer as a
// person. Not a channel — the site shows it apart, with the funding disclaimer,
// and FUNDING.md's Excluded Funder rule applies to it.
const SUPPORT_KEY = 'support';
const PROFILE_KEYS = ['name', ...LIST_KEYS, ...CHANNEL_KEYS, SUPPORT_KEY];

// A run of digits with the separators people write phone numbers with. Kept
// loose on purpose — this only ever raises an advisory triage note — and then
// narrowed by digit count and the shapes below that are clearly not phones.
const PHONE_CANDIDATE = /\+?\(?\d[\d\s().-]{5,}\d/g;
const NOT_A_PHONE = [
    /^\d{4}-\d{2}-\d{2}$/, // an ISO date
    /^\d{4}\s*-\s*\d{4}$/, // a year range
];
const URL = /\b(?:https?:\/\/|www\.)\S+/gi;

function looksLikePhone(text) {
    const withoutUrls = String(text).replace(URL, ' ');
    for (const [candidate] of withoutUrls.matchAll(PHONE_CANDIDATE)) {
        const trimmed = candidate.trim();
        const digits = trimmed.replace(/\D/g, '').length;
        if (digits >= 7 && digits <= 15 && !NOT_A_PHONE.some(shape => shape.test(trimmed))) {
            return true;
        }
    }
    return false;
}

function unquote(value) {
    const quoted = /^(["'])(.*)\1$/.exec(value);
    return quoted ? quoted[2] : value;
}

// Splits `---` front matter from the body. Returns { lines, body } or, for a
// block that opens and never closes, { problem }.
function splitFrontMatter(text) {
    const normalized = String(text || '').replace(/\r\n?/g, '\n');
    if (!/^---\n/.test(normalized) && normalized !== '---') {
        return { lines: [], body: normalized, bodyStartLine: 1 };
    }
    const rest = normalized.slice(4);
    const close = /^---[ \t]*$/m.exec(rest);
    if (!close) {
        return { problem: 'the front matter opens with `---` but never closes — add a `---` line after the last field' };
    }
    const block = rest.slice(0, close.index);
    const lines = block === '' ? [] : block.replace(/\n$/, '').split('\n');
    return { lines, body: rest.slice(close.index + close[0].length).replace(/^\n/, ''), bodyStartLine: lines.length + 3 };
}

/**
 * Parses and validates one Maintainer Profile's text.
 *
 * Returns { profile, body, problems }. `profile` holds the keys that were set,
 * with `open_to` and `languages` split into arrays; `problems` lists, in plain
 * words, everything that makes the file invalid: unknown keys, nested values
 * (GitHub renders nested YAML as unreadable nested tables), duplicate keys,
 * and phone-number-like content anywhere, front matter or prose.
 */
function parseProfile(text) {
    const split = splitFrontMatter(text);
    if (split.problem) {
        return { profile: {}, body: '', problems: [split.problem] };
    }

    const profile = {};
    const problems = [];

    split.lines.forEach((line, index) => {
        const lineNo = index + 2; // line 1 is the opening `---`
        if (line.trim() === '' || /^\s*#/.test(line)) {
            return;
        }
        if (/^\s/.test(line)) {
            problems.push(`line ${lineNo} is indented — nested values aren't allowed; write each field as a flat \`key: value\` line`);
            return;
        }
        const pair = /^([^:\s][^:]*?)\s*:(?:\s+(.*))?$/.exec(line);
        if (!pair) {
            problems.push(`line ${lineNo} isn't a \`key: value\` pair — nested values aren't allowed`);
            return;
        }
        const key = pair[1];
        const value = unquote((pair[2] || '').trim()).trim();

        if (!PROFILE_KEYS.includes(key)) {
            problems.push(`unknown key "${key}" on line ${lineNo} — allowed keys are ${PROFILE_KEYS.join(', ')}`);
            return;
        }
        if (Object.prototype.hasOwnProperty.call(profile, key)) {
            problems.push(`"${key}" is set more than once`);
            return;
        }
        if (/^[[{]/.test(value)) {
            problems.push(`"${key}" on line ${lineNo} is a nested value — write it as a comma-separated string instead`);
            return;
        }
        if (looksLikePhone(value)) {
            problems.push(`"${key}" on line ${lineNo} looks like a phone number — phone numbers can't be published in a Maintainer Profile`);
            return;
        }
        if (value === '') {
            return; // `key:` with nothing after it is the same as leaving it out
        }
        if (key === SUPPORT_KEY && !/^https?:\/\/\S+$/i.test(value)) {
            problems.push(`"${key}" on line ${lineNo} must be a single http(s) link, e.g. https://ko-fi.com/your-name`);
            return;
        }
        profile[key] = LIST_KEYS.includes(key)
            ? value.split(',').map(item => item.trim()).filter(item => item !== '')
            : value;
    });

    split.body.split('\n').forEach((line, index) => {
        if (looksLikePhone(line)) {
            problems.push(`the body (line ${split.bodyStartLine + index}) looks like it contains a phone number — phone numbers can't be published in a Maintainer Profile`);
        }
    });

    return { profile, body: split.body, problems };
}

// Top-level folder holding one `<github-handle>.md` per opted-in Maintainer,
// plus README.md (the GitHub index) and _template.md (skipped everywhere —
// Jekyll ignores underscore-prefixed files too).
const PROFILES_DIR = 'maintainers';
const PROFILES_URL_PREFIX = `/${PROFILES_DIR}/`;
const PROFILE_FILENAME = new RegExp(`^(${HANDLE})\\.md$`);

/**
 * The handle a Maintainer Profile path belongs to, from its filename, or null
 * when the path isn't a profile: the README index, the template, anything
 * that isn't markdown, or a filename that can't be a GitHub handle.
 */
function profileHandle(path) {
    const filename = String(path).split('/').pop();
    const match = PROFILE_FILENAME.exec(filename);
    if (!match || match[1].toLowerCase() === 'readme') {
        return null;
    }
    return match[1];
}

// lowercased handle → handle as spelled in its filename
function profilesByHandle(profilePaths) {
    const byHandle = new Map();
    for (const path of profilePaths) {
        const handle = profileHandle(path);
        if (handle) {
            byHandle.set(handle.toLowerCase(), handle);
        }
    }
    return byHandle;
}

/**
 * Orphaned Maintainer Profiles: profile paths whose handle appears in none of
 * `listedHandles` (the union of every Maintainer/s cell in README.md and
 * BUDGET.md). Reported, never deleted — removal is a Directory Maintainer's
 * call.
 */
function findOrphans(listedHandles, profilePaths) {
    const listed = new Set([...listedHandles].map(handle => handle.toLowerCase()));
    return profilePaths.filter((path) => {
        const handle = profileHandle(path);
        return handle !== null && !listed.has(handle.toLowerCase());
    });
}

/**
 * Where a Maintainer's handle should link: their site profile page when they
 * have a Maintainer Profile (URL spelled as the filename, since that's the
 * path Jekyll builds), otherwise their GitHub profile as before.
 */
function resolveMaintainerLink(handle, profilePaths) {
    const fileHandle = profilesByHandle(profilePaths).get(handle.toLowerCase());
    return fileHandle
        ? { handle, url: `${PROFILES_URL_PREFIX}${fileHandle}/`, profile: true }
        : { handle, url: `https://github.com/${handle}`, profile: false };
}

// The GitHub index (maintainers/README.md) is a hand-maintained bullet list
// between these markers, one `- [@handle](handle.md) · Name` per profile,
// sorted by handle. Handle first, so the list reads in the same order as the
// profile files, their URLs, and the site's /maintainers/ index. The name is
// optional, like the profile's own `name` key.
const INDEX_START = '<!-- MAINTAINER_PROFILES_START -->';
const INDEX_END = '<!-- MAINTAINER_PROFILES_END -->';
const INDEX_BULLET = new RegExp(`^[-*]\\s+\\[@(${HANDLE})\\]\\(\\s*(?:\\./)?(${HANDLE})\\.md\\s*\\)(?:\\s*·\\s*\\S.*)?$`);
const INDEX_BULLET_FORM = '- [@handle](handle.md) · Name';

/**
 * Where the GitHub index and the profile files disagree. Each mismatch is
 * { kind, handle, message }, `handle` being "-" when there is none to name:
 *
 *   missing-bullet    a profile file with no bullet in the index
 *   missing-file      a bullet pointing at a profile that doesn't exist
 *   handle-mismatch   a bullet whose link and @handle name different people
 *   duplicate-bullet  the same profile listed twice
 *   malformed-bullet  a line in the list that isn't a profile bullet
 *   missing-list      the index has lost its list markers
 */
function indexMismatches(indexContent, profilePaths) {
    const mismatches = [];
    const files = profilesByHandle(profilePaths);
    const content = String(indexContent || '');
    const start = content.indexOf(INDEX_START);
    const end = content.indexOf(INDEX_END);

    const lines = [];
    if (start === -1 || end === -1 || end < start) {
        mismatches.push({ kind: 'missing-list', handle: '-', message: `the index is missing its \`${INDEX_START}\` / \`${INDEX_END}\` markers` });
    } else {
        lines.push(...content.slice(start + INDEX_START.length, end).split('\n').map(line => line.trim()).filter(line => line !== ''));
    }

    const bulleted = new Set();
    for (const line of lines) {
        const bullet = INDEX_BULLET.exec(line);
        if (!bullet) {
            mismatches.push({ kind: 'malformed-bullet', handle: '-', message: `\`${line}\` isn't a \`${INDEX_BULLET_FORM}\` bullet` });
            continue;
        }
        const [, mentioned, linked] = bullet;
        const key = linked.toLowerCase();
        if (key !== mentioned.toLowerCase()) {
            mismatches.push({ kind: 'handle-mismatch', handle: linked, message: `the bullet links to \`${linked}.md\` but names @${mentioned}` });
        }
        if (bulleted.has(key)) {
            mismatches.push({ kind: 'duplicate-bullet', handle: linked, message: `@${linked} is listed more than once` });
            continue;
        }
        bulleted.add(key);
        if (!files.has(key)) {
            mismatches.push({ kind: 'missing-file', handle: linked, message: `@${linked} is listed, but there is no \`${PROFILES_DIR}/${linked}.md\`` });
        }
    }

    for (const [key, handle] of files) {
        if (!bulleted.has(key)) {
            mismatches.push({ kind: 'missing-bullet', handle, message: `\`${PROFILES_DIR}/${handle}.md\` has no bullet in \`${PROFILES_DIR}/README.md\`` });
        }
    }

    return mismatches;
}

const INDEX_PATH = `${PROFILES_DIR}/README.md`;

function underProfilesDir(path) {
    return path.startsWith(`${PROFILES_DIR}/`);
}

function nestedInProfilesDir(path) {
    return path.slice(PROFILES_DIR.length + 1).includes('/');
}

function isIndexPath(path) {
    return path.toLowerCase() === INDEX_PATH.toLowerCase();
}

function isTemplatePath(path) {
    return path.split('/').pop().startsWith('_');
}

/**
 * Advisory review of a pull request's Maintainer Profile changes, for
 * triage-pr.js. Returns null when the PR touches nothing in the profiles
 * folder, otherwise a list of { path, message } problems (empty = clean).
 *
 *   author             the PR author's GitHub login
 *   changes            [{ status: 'A'|'M'|'D', path }] — renames as D + A
 *   headFiles          Map of path → text at the PR head, for changed files
 *   headProfilePaths   every path in the profiles folder at the PR head
 *   headIndex          maintainers/README.md at the PR head ('' if missing)
 *   listedHandles      every handle in README.md and BUDGET.md Maintainer/s
 *                      cells at the PR head
 *
 * Deletions are never flagged: a Directory Maintainer may remove anyone's
 * profile. Adding or editing one is the owner's act only.
 */
function reviewProfileChanges({ author, changes, headFiles, headProfilePaths, headIndex, listedHandles }) {
    const touched = changes.filter(change => underProfilesDir(change.path));
    if (touched.length === 0) {
        return null;
    }

    const problems = [];
    const listed = new Set(listedHandles.map(handle => handle.toLowerCase()));

    for (const { status, path } of touched) {
        if (status === 'D') {
            continue;
        }
        if (nestedInProfilesDir(path)) {
            // Jekyll would still publish it, so it can't be silently skipped.
            problems.push({ path, message: `Maintainer Profiles go directly in \`${PROFILES_DIR}/\`, as \`${PROFILES_DIR}/your-handle.md\` — no subfolders` });
            continue;
        }
        if (isIndexPath(path) || isTemplatePath(path)) {
            continue;
        }
        const handle = profileHandle(path);
        if (handle === null) {
            problems.push({ path, message: 'the filename must be the Maintainer\'s GitHub handle, e.g. `maintainers/your-handle.md`' });
            continue;
        }
        if (String(author).toLowerCase() !== handle.toLowerCase()) {
            problems.push({ path, message: `opened by @${author}, but this is @${handle}'s Maintainer Profile — only @${handle} may add or edit it` });
        }
        if (!listed.has(handle.toLowerCase())) {
            problems.push({ path, message: `@${handle} isn't listed in any Maintainer/s cell in \`README.md\` or \`BUDGET.md\` — only Maintainers can have a Maintainer Profile` });
        }
        for (const message of parseProfile(headFiles.get(path) || '').problems) {
            problems.push({ path, message });
        }
    }

    for (const mismatch of indexMismatches(headIndex, headProfilePaths)) {
        problems.push({ path: INDEX_PATH, message: mismatch.message });
    }

    return problems;
}

/**
 * Every Maintainer Profile as site data, for `/maintainers/` and the profile
 * pages on main-pages (#426). Jekyll shadows a page's own `name` front matter
 * with its filename, and portals are never written in a profile, so both come
 * from here: parsed fields plus the portals derived from the Maintainer/s
 * cells of `lgus` (README Entries, `{ name, domain, maintainer }`) and
 * `budgetPortals` (BUDGET.md rows, `{ name, portal, maintainer }`). Each
 * portal carries `domain`: the Entry's Domain cell or the Budget Portal's
 * portal cell, as the raw markdown the sync emits elsewhere ("-" when none).
 * Sorted by handle; orphans are listed with no portals. `name` falls back to
 * the handle.
 */
function profileDirectory(profileFiles, lgus, budgetPortals) {
    const sources = [
        ...lgus.map(row => ({ row, kind: 'entry', domain: row.domain })),
        ...budgetPortals.map(row => ({ row, kind: 'budget', domain: row.portal })),
    ].map(({ row, kind, domain }) => ({
        name: row.name,
        kind,
        domain: domain || '-',
        handles: new Set(extractHandles(row.maintainer).map(handle => handle.toLowerCase())),
    }));

    return profileFiles
        .map(({ path, text }) => ({ handle: profileHandle(path), text }))
        .filter(({ handle }) => handle !== null)
        .sort((a, b) => a.handle.toLowerCase().localeCompare(b.handle.toLowerCase()))
        .map(({ handle, text }) => {
            const { profile } = parseProfile(text);
            const channels = {};
            for (const key of CHANNEL_KEYS) {
                if (profile[key] !== undefined) {
                    channels[key] = profile[key];
                }
            }
            return {
                handle,
                url: `${PROFILES_URL_PREFIX}${handle}/`,
                github: `https://github.com/${handle}`,
                name: profile.name || handle,
                open_to: profile.open_to || [],
                languages: profile.languages || [],
                channels,
                support: profile.support || '',
                portals: sources
                    .filter(source => source.handles.has(handle.toLowerCase()))
                    .map(({ name, kind, domain }) => ({ name, kind, domain })),
            };
        });
}

module.exports = {
    PROFILES_DIR,
    CHANNEL_KEYS,
    INDEX_PATH,
    profileDirectory,
    indexMismatches,
    reviewProfileChanges,
    PROFILE_KEYS,
    extractHandles,
    parseProfile,
    profileHandle,
    findOrphans,
    resolveMaintainerLink,
};
