// Zero-dependency regression test for lowercase site URLs (#429), the
// main-pages half. Run with:
//
//   node scripts/test-lowercase-urls-site.js
//
// It exits non-zero on any failure.
//
// Every page is served at a lowercase, hyphenated URL, and its old uppercase
// URL (the one GitHub Pages derived from the uppercase filename on main)
// redirects to it. Pages whose source comes from main get their permalink
// from _config.yml defaults, never from front matter, so the main ->
// main-pages sync merge can't conflict. budget-directory.md exists only on
// main-pages, so it carries its own.
//
// Each redirect is a stub page in redirects/ (main-pages only) with
// `redirect_to`, not a `redirect_from` default on the target: a real Pages
// build showed redirect_from never fires for the front-matter-less pages
// (BUDGET_GUIDE, BUDGET_TEMPLATES, PRIVACY) that jekyll-optional-front-matter
// adds after jekyll-redirect-from has run.
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

// The settled URL map from #429: source file -> new URL, old URL, and
// whether the file comes from main (URL set in _config.yml defaults).
const PAGES = [
    { file: 'GUIDE.md', url: '/guide', oldUrl: '/GUIDE', fromMain: true },
    { file: 'TEMPLATES.md', url: '/templates', oldUrl: '/TEMPLATES', fromMain: true },
    { file: 'CONTRIBUTING.md', url: '/contributing', oldUrl: '/CONTRIBUTING', fromMain: true },
    { file: 'CODE_OF_CONDUCT.md', url: '/code-of-conduct', oldUrl: '/CODE_OF_CONDUCT', fromMain: true },
    { file: 'CHANGELOG.md', url: '/changelog', oldUrl: '/CHANGELOG', fromMain: true },
    { file: 'BUDGET_GUIDE.md', url: '/budget-guide', oldUrl: '/BUDGET_GUIDE', fromMain: true },
    { file: 'BUDGET_TEMPLATES.md', url: '/budget-templates', oldUrl: '/BUDGET_TEMPLATES', fromMain: true },
    { file: 'PRIVACY.md', url: '/privacy', oldUrl: '/PRIVACY', fromMain: true },
    { file: 'budget-directory.md', url: '/budget', oldUrl: '/BUDGET', fromMain: false },
];

// Parses the flat YAML this repo uses (scalars and one-level lists) from
// lines whose keys sit at `indent` spaces.
function parseFlatYaml(lines, indent) {
    const pad = ' '.repeat(indent);
    const values = {};
    let listKey = null;
    for (const line of lines) {
        if (!line.startsWith(pad)) break;
        const item = line.slice(indent).match(/^ {2}- "?([^"]*)"?$/);
        if (item && listKey) { values[listKey].push(item[1]); continue; }
        const kv = line.slice(indent).match(/^([a-z_]+):\s*(.*)$/);
        if (!kv) continue;
        if (kv[2] === '') { listKey = kv[1]; values[listKey] = []; }
        else { listKey = null; values[kv[1]] = kv[2].replace(/^"|"$/g, ''); }
    }
    return values;
}

// The `values` of the _config.yml defaults entry scoped to exactly `scopePath`.
function defaultsFor(config, scopePath) {
    for (const entry of config.split(/\n  - scope:\n/).slice(1)) {
        const lines = entry.split('\n');
        const pathLine = lines.find((l) => /^ {6}path:/.test(l));
        if (!pathLine || pathLine.replace(/^ {6}path:\s*/, '').replace(/"/g, '') !== scopePath) continue;
        return parseFlatYaml(lines.slice(lines.indexOf('    values:') + 1), 6);
    }
    return null;
}

function frontMatter(text) {
    const block = text.match(/^---\n([\s\S]*?)\n---/);
    return block ? parseFlatYaml(block[1].split('\n').filter((l) => !l.startsWith('#')), 0) : {};
}

// --- URL map -------------------------------------------------------------

const config = read('_config.yml');

check(/^plugins:\n(?: {2}- .*\n)*? {2}- jekyll-redirect-from$/m.test(config),
    '_config.yml enables the jekyll-redirect-from plugin');

for (const { file, url, fromMain } of PAGES) {
    if (fromMain) {
        const values = defaultsFor(config, file);
        check(values, `${file} has a _config.yml defaults entry`);
        check(values.permalink === url, `${file} is served at ${url} (got ${values.permalink})`);
        check(!/^permalink:/m.test(read(file).split(/\n---\n/)[0]),
            `${file} sets its URL in _config.yml, not front matter`);
    } else {
        const permalink = frontMatter(read(file)).permalink;
        check(permalink === url, `${file} is served at ${url} (got ${permalink})`);
    }
}

// --- Redirects -------------------------------------------------------------

// Every old URL has exactly one redirect stub pointing at its new URL.
const stubs = fs.readdirSync(path.join(ROOT, 'redirects'))
    .map((f) => frontMatter(read(`redirects/${f}`)));
for (const { url, oldUrl } of PAGES) {
    const matching = stubs.filter((stub) => stub.permalink === oldUrl);
    check(matching.length === 1, `exactly one redirects/ stub serves ${oldUrl} (found ${matching.length})`);
    check(matching[0].redirect_to === url, `${oldUrl} redirects to ${url} (got ${matching[0].redirect_to})`);
}
check(stubs.length === PAGES.length, 'redirects/ holds only the #429 stubs');

// Redirects stay on the host that served them. jekyll-redirect-from prefixes
// redirect_to with site.url, so the site's redirect layout strips it.
check(/remove_first: site\.url/.test(read('_layouts/redirect.html')),
    '_layouts/redirect.html strips site.url from the redirect target');

// --- Template links --------------------------------------------------------
// Nav, footer and in-page links built with relative_url point at the
// lowercase URLs. (Relative .md links in content need nothing: the
// jekyll-relative-links plugin rewrites them to the target's permalink.)

const templates = [
    ...fs.readdirSync(path.join(ROOT, '_layouts')).map((f) => `_layouts/${f}`),
    ...fs.readdirSync(path.join(ROOT, '_includes')).map((f) => `_includes/${f}`),
    'index.md', 'budget-directory.md', 'maintainers.md',
];
for (const file of templates) {
    const text = read(file);
    for (const { oldUrl } of PAGES) {
        check(!text.includes(`'${oldUrl}'`), `${file} links to ${oldUrl}; use the lowercase URL`);
    }
}

console.log(`✅ ${assertions} assertions passed.`);
