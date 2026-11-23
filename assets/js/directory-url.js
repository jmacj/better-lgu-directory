// Directory state in the URL (#456).
//
// The search, filters and sort live in the page's query string so a view can
// be bookmarked and shared. parse() reads a query string into the controls'
// state, serialize() writes it back. Defaults are left out, so the plain
// directory stays a bare URL.
//
// Plain script, no build step: exported via module.exports under Node for
// scripts/test-directory-url-site.js, and attached to window.DirectoryUrl in
// the browser.
(function () {
    'use strict';

    var DEFAULTS = {
        q: '',
        status: '',
        region: '',
        kinds: [],
        adoption: false,
        sort: 'location',
    };

    // The kind chips, in page order. Kinds serialize in this order.
    var KINDS = ['city', 'municipality', 'province', 'region'];

    // The status filter's option values.
    var STATUSES = ['Active', 'Work in Progress', 'Planned', 'Unmaintained'];

    // The Sort by presets; the first is the default (directory-sort.js).
    var SORTS = ['location', 'name', 'status'];

    function inOrder(values, order) {
        return order.filter(function (v) {
            return values.indexOf(v) !== -1;
        });
    }

    // A fresh copy of DEFAULTS, safe to modify.
    function defaults() {
        var state = {};
        for (var key in DEFAULTS) state[key] = DEFAULTS[key];
        state.kinds = DEFAULTS.kinds.slice();
        return state;
    }

    function oneOf(value, allowed, fallback) {
        return allowed.indexOf(value) !== -1 ? value : fallback;
    }

    // Reads a query string ('?a=b', 'a=b' or '') into the controls' state.
    // `options.regions` lists the valid region names (_data/regions.yml).
    // Unknown parameters are ignored; an invalid value leaves that control
    // at its default and the rest still apply.
    function parse(search, options) {
        var regions = (options && options.regions) || [];
        var params = new URLSearchParams(search);
        var state = defaults();
        if (params.has('q')) state.q = params.get('q');
        state.status = oneOf(params.get('status'), STATUSES, DEFAULTS.status);
        state.region = oneOf(params.get('region'), regions, DEFAULTS.region);
        if (params.has('kind')) state.kinds = inOrder(params.get('kind').split(','), KINDS);
        if (params.get('adoption') === '1') state.adoption = true;
        state.sort = oneOf(params.get('sort'), SORTS, DEFAULTS.sort);
        return state;
    }

    // Returns '' for the defaults, else '?' and the non-default parameters.
    function serialize(state) {
        var parts = [];
        function add(name, value) {
            parts.push(name + '=' + value);
        }
        if (state.q) add('q', encodeURIComponent(state.q));
        if (state.status) add('status', encodeURIComponent(state.status));
        if (state.region) add('region', encodeURIComponent(state.region));
        var kinds = inOrder(state.kinds, KINDS);
        if (kinds.length) add('kind', kinds.join(','));
        if (state.adoption) add('adoption', '1');
        if (state.sort && state.sort !== DEFAULTS.sort) add('sort', encodeURIComponent(state.sort));
        return parts.length ? '?' + parts.join('&') : '';
    }

    // The parameters the directory owns; serialize() writes only these.
    var OWN = ['q', 'status', 'region', 'kind', 'adoption', 'sort'];

    function paramName(segment) {
        var name = segment.split('=')[0].replace(/\+/g, ' ');
        try {
            return decodeURIComponent(name);
        } catch (e) {
            return name;
        }
    }

    // Returns `search` with the directory's parameters replaced by
    // serialize(state). Every other parameter (utm_*, fbclid, ...) belongs to
    // someone else, so it is kept exactly as written, after the directory's.
    function rewrite(search, state) {
        var foreign = search.replace(/^\?/, '').split('&').filter(function (segment) {
            return segment !== '' && OWN.indexOf(paramName(segment)) === -1;
        });
        var own = serialize(state).replace(/^\?/, '');
        var parts = (own ? [own] : []).concat(foreign);
        return parts.length ? '?' + parts.join('&') : '';
    }

    var api = {
        DEFAULTS: DEFAULTS,
        defaults: defaults,
        parse: parse,
        serialize: serialize,
        rewrite: rewrite,
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
        return;
    }

    window.DirectoryUrl = api;
})();
