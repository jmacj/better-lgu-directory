// Zero-dependency regression test for links to files the website doesn't
// publish. Run with:
//
//   node scripts/test-github-only-links-site.js
//
// It exits non-zero on any failure.
//
// Docs on main link repo files relatively (BUDGET.md, README.md,
// maintainers/README.md, ...), which is right on GitHub: the link follows
// the branch or fork being viewed. Some of those files aren't published on
// the site (excluded, underscore-prefixed, or README.md, which the home page
// replaces), so jekyll-relative-links can't resolve the link and it 404s.
// Rather than change main, the site rewrites each such link in the default
// layout from the `github_only_links` map in _config.yml. This test makes
// sure every such link in a published page has an entry, and every entry
// points somewhere real.
//
// Named `-site` so it can't collide with a same-named file from main in the
// sync merge (see scripts/test-repo-activity-site.js).

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

let assertions = 0;
function check(condition, message) {
    assertions++;
    assert.ok(condition, message);
}

const config = read('_config.yml');

// Top-level list under `key:` in _config.yml, as arrays of flat objects
// (`- a: b` / `  c: d`) or plain strings (`- "x"`).
function topLevelList(key) {
    const block = config.match(new RegExp(`^${key}:\\n((?:(?:  .*|\\s*#.*)?\\n)*)`, 'm'));
    if (!block) return null;
    const items = [];
    for (const line of block[1].split('\n')) {
        if (/^\s*(#|$)/.test(line)) continue;
        const start = line.match(/^ {2}- (.*)$/);
        const rest = start ? start[1] : line.replace(/^ {4}/, '');
        const kv = rest.match(/^([a-z_]+):\s*(.*)$/);
        if (start && !kv) { items.push(rest.replace(/^"|"$/g, '')); continue; }
        if (start) items.push({});
        items[items.length - 1][kv[1]] = kv[2].replace(/^"|"$/g, '');
    }
    return items;
}

const excluded = topLevelList('exclude');
const links = topLevelList('github_only_links');
check(Array.isArray(links), '_config.yml has a github_only_links list');

// Not published as a page: excluded, underscore- or dot-prefixed at any
// level, or the root README.md (index.md is the home page).
function isUnpublished(relPath) {
    if (relPath === 'README.md') return true;
    if (relPath.split('/').some((part) => /^[_.]/.test(part))) return true;
    return excluded.some((ex) => relPath === ex || relPath.startsWith(`${ex}/`));
}

function publishedMarkdown(dir = '') {
    return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
        const rel = dir ? `${dir}/${entry.name}` : entry.name;
        if (isUnpublished(rel) || rel === 'node_modules') return [];
        if (entry.isDirectory()) return publishedMarkdown(rel);
        return rel.endsWith('.md') ? [rel] : [];
    });
}

// --- Every link to an unpublished file is rewritten ------------------------

const pages = publishedMarkdown();
check(pages.includes('CONTRIBUTING.md'), 'CONTRIBUTING.md counts as a published page');
check(!pages.includes('BUDGET.md'), 'BUDGET.md counts as unpublished');

for (const page of pages) {
    for (const [, href] of read(page).matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        if (/^([a-z]+:|\/|\{)/i.test(href)) continue;
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(page), href));
        if (!fs.existsSync(path.join(ROOT, target)) || !isUnpublished(target)) continue;
        check(links.some((link) => link.href === href),
            `${page} links ${href}, which the site doesn't publish; add it to github_only_links`);
    }
}

// --- Every rewrite points somewhere real -----------------------------------

for (const link of links) {
    check(Boolean(link.page) !== Boolean(link.url), `${link.href} sets exactly one of page or url`);
    if (link.page) {
        check(fs.existsSync(path.join(ROOT, link.page)) && !isUnpublished(link.page),
            `${link.href} -> ${link.page}, which must be a published page`);
    } else {
        check(/^https:\/\/github\.com\/jmacj\/better-lgu-directory\/blob\/main\//.test(link.url)
            && fs.existsSync(path.join(ROOT, link.url.replace(/^.*\/blob\/main\//, ''))),
            `${link.href} -> ${link.url}, which must be a file in this repo on GitHub`);
    }
}

// The layout applies the map to every page's content.
check(/site\.github_only_links/.test(read('_layouts/default.html')),
    '_layouts/default.html rewrites content links from site.github_only_links');

console.log(`✅ ${assertions} assertions passed.`);
