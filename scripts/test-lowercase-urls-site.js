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

// The settled URL map from #429: source file -> [new URL, old URL].
const FROM_MAIN = {
    'GUIDE.md': ['/guide', '/GUIDE'],
    'TEMPLATES.md': ['/templates', '/TEMPLATES'],
    'CONTRIBUTING.md': ['/contributing', '/CONTRIBUTING'],
    'CODE_OF_CONDUCT.md': ['/code-of-conduct', '/CODE_OF_CONDUCT'],
    'CHANGELOG.md': ['/changelog', '/CHANGELOG'],
    'BUDGET_GUIDE.md': ['/budget-guide', '/BUDGET_GUIDE'],
    'BUDGET_TEMPLATES.md': ['/budget-templates', '/BUDGET_TEMPLATES'],
    'PRIVACY.md': ['/privacy', '/PRIVACY'],
};

// Reads the `values` of the _config.yml defaults entry scoped to exactly
// `scopePath`. Handles the flat shape this config uses: scalar values and
// one-level lists, two-space indentation.
function defaultsFor(config, scopePath) {
    const entries = config.split(/\n  - scope:\n/).slice(1);
    for (const entry of entries) {
        const lines = entry.split('\n');
        const pathLine = lines.find((l) => /^ {6}path:/.test(l));
        if (!pathLine || pathLine.replace(/^ {6}path:\s*/, '').replace(/"/g, '') !== scopePath) continue;
        const values = {};
        let listKey = null;
        for (const line of lines.slice(lines.indexOf('    values:') + 1)) {
            if (!/^ {6}/.test(line)) break;
            const item = line.match(/^ {8}- "?([^"]*)"?$/);
            if (item && listKey) { values[listKey].push(item[1]); continue; }
            const kv = line.match(/^ {6}([a-z_]+):\s*(.*)$/);
            if (!kv) continue;
            if (kv[2] === '') { listKey = kv[1]; values[listKey] = []; }
            else { listKey = null; values[kv[1]] = kv[2].replace(/^"|"$/g, ''); }
        }
        return values;
    }
    return null;
}

function frontMatter(text) {
    const block = text.match(/^---\n([\s\S]*?)\n---/);
    const values = {};
    if (!block) return values;
    let listKey = null;
    for (const line of block[1].split('\n')) {
        const item = line.match(/^ {2}- "?([^"]*)"?$/);
        if (item && listKey) { values[listKey].push(item[1]); continue; }
        const kv = line.match(/^([a-z_]+):\s*(.*)$/);
        if (!kv) continue;
        if (kv[2] === '') { listKey = kv[1]; values[listKey] = []; }
        else { listKey = null; values[kv[1]] = kv[2].replace(/^"|"$/g, ''); }
    }
    return values;
}

// --- URL map -------------------------------------------------------------

const config = read('_config.yml');

check(/^plugins:\n(?: {2}- .*\n)*? {2}- jekyll-redirect-from$/m.test(config),
    '_config.yml enables the jekyll-redirect-from plugin');

for (const [file, [url, oldUrl]] of Object.entries(FROM_MAIN)) {
    const values = defaultsFor(config, file);
    check(values, `${file} has a _config.yml defaults entry`);
    check(values.permalink === url, `${file} is served at ${url} (got ${values.permalink})`);
    check(!/^permalink:|^redirect_from:/m.test(read(file).split(/\n---\n/)[0]),
        `${file} sets its URL in _config.yml, not front matter`);
}

const budget = frontMatter(read('budget-directory.md'));
check(budget.permalink === '/budget', `budget-directory.md is served at /budget (got ${budget.permalink})`);

// Every old URL has exactly one redirect stub pointing at its new URL.
const REDIRECTS = { ...Object.fromEntries(Object.values(FROM_MAIN).map(([url, oldUrl]) => [oldUrl, url])), '/BUDGET': '/budget' };
const stubs = fs.readdirSync(path.join(ROOT, 'redirects'))
    .map((f) => frontMatter(read(`redirects/${f}`)));
for (const [oldUrl, url] of Object.entries(REDIRECTS)) {
    const matching = stubs.filter((stub) => stub.permalink === oldUrl);
    check(matching.length === 1, `exactly one redirects/ stub serves ${oldUrl} (found ${matching.length})`);
    check(matching[0].redirect_to === url, `${oldUrl} redirects to ${url} (got ${matching[0].redirect_to})`);
}
check(stubs.length === Object.keys(REDIRECTS).length, 'redirects/ holds only the #429 stubs');

// --- Template links --------------------------------------------------------
// Nav, footer and in-page links built with relative_url point at the
// lowercase URLs. (Relative .md links in content need nothing: the
// jekyll-relative-links plugin rewrites them to the target's permalink.)

const OLD_URLS = [...Object.values(FROM_MAIN).map(([, oldUrl]) => oldUrl), '/BUDGET'];
const templates = [
    ...fs.readdirSync(path.join(ROOT, '_layouts')).map((f) => `_layouts/${f}`),
    ...fs.readdirSync(path.join(ROOT, '_includes')).map((f) => `_includes/${f}`),
    'index.md', 'budget-directory.md', 'maintainers.md',
];
for (const file of templates) {
    const text = read(file);
    for (const oldUrl of OLD_URLS) {
        check(!text.includes(`'${oldUrl}'`), `${file} links to ${oldUrl}; use the lowercase URL`);
    }
}

console.log(`ok -${assertions} assertions passed`);
