// Directory sort presets (#448). See CONTEXT.md, Sort Order.
//
// The page is rendered in Location order at build time. When the visitor
// picks another preset, this script re-orders the table rows. Each row's
// keys are computed and folded by the build (data-* attributes on the LGU
// cell), so nothing here parses names or folds strings.
//
// Plain script, no build step: the pure part is exported via module.exports
// under Node for scripts/test-directory-sort-site.js, and attached to
// window.DirectorySort in the browser.
(function () {
    'use strict';

    var PRESETS = ['location', 'name', 'status'];

    function compareStrings(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    // Must match the build-time key in index.md, which renders this order.
    function byLocation(a, b) {
        return a.regionRank - b.regionRank
            || compareStrings(a.province, b.province)
            || a.level - b.level
            || compareStrings(a.place, b.place);
    }

    // Same as the README order (#307).
    function byName(a, b) {
        return compareStrings(a.place, b.place)
            || a.level - b.level
            || compareStrings(a.province, b.province);
    }

    // Active, Work in Progress, Planned, Unmaintained; each run in Location
    // order.
    function byStatus(a, b) {
        return a.statusRank - b.statusRank || byLocation(a, b);
    }

    var COMPARATORS = {
        location: byLocation,
        name: byName,
        status: byStatus,
    };

    // Returns a new array of keys in the preset's order.
    function sortKeys(keys, preset) {
        return keys.slice().sort(COMPARATORS[preset]);
    }

    var api = { PRESETS: PRESETS, sortKeys: sortKeys };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
        return;
    }

    // Browser only: the keys the build put on a row's `.lgu-entry` span.
    function rowKeys(row) {
        var d = row.querySelector('.lgu-entry').dataset;
        return {
            row: row,
            regionRank: Number(d.regionRank),
            province: d.province,
            level: Number(d.level),
            place: d.place,
            statusRank: Number(d.statusRank),
        };
    }

    // Re-orders the rows of `tbody` in place. Unknown presets fall back to
    // Location, the build-time order.
    api.applySort = function (tbody, preset) {
        if (!COMPARATORS[preset]) preset = PRESETS[0];
        var keys = Array.prototype.map.call(tbody.rows, rowKeys);
        sortKeys(keys, preset).forEach(function (k) {
            tbody.appendChild(k.row);
        });
    };

    window.DirectorySort = api;
})();
