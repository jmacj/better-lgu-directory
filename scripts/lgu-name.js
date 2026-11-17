// LGU Name parser (#307): the one grammar every LGU cell in README.md and
// BUDGET.md follows, shared by the syncs, triage and the tests. Pure and
// dependency-free; its only geographic source is scripts/psgc-regions.js.
//
//   Municipality   <Place>, <Province>          Calauan, Laguna
//   City           <Place> City, <Province>     Bacolod City, Negros Occidental
//   NCR city       <Place> City, Metro Manila   Makati City, Metro Manila
//   Province       <Province> Province          Aklan Province
//   Region         the region's PSGC name       Bicol Region, CALABARZON
//
// The rationale and the departures from PSGC are in CONTRIBUTING.md; the
// terms (Place, Kind, Province, Region, Level, Sort Order) in CONTEXT.md.

const {
    REGION_NAMES,
    REGION_RANK,
    PROVINCE_REGION,
    REGION_OVERRIDES,
    METRO_MANILA,
} = require('./psgc-regions');

const KINDS = ['region', 'province', 'city', 'municipality'];

// Level: the rank every sort uses. Cities and municipalities share a level —
// no sort ever lists cities before municipalities.
const LEVEL = { region: 0, province: 1, city: 2, municipality: 2 };

class LguNameError extends Error {
    // `detail` is the reason alone; `message` prefixes it with the name.
    constructor(rule, name, detail) {
        super(`"${name}": ${detail}`);
        this.name = 'LguNameError';
        this.rule = rule;
        this.detail = detail;
    }
}

const CITY_SUFFIX = ' City';
const PROVINCE_SUFFIX = ' Province';

// Case-insensitive lookups, only for the "did you mean" hint: matching itself
// is exact, so `Davao Del Sur` is rejected.
function caseHint(value, candidates) {
    const lower = value.toLowerCase();
    const match = candidates.find(candidate => candidate.toLowerCase() === lower);
    return match ? ` Did you mean "${match}"?` : '';
}

const PROVINCES = [...PROVINCE_REGION.keys()];

function regionOf(name, province) {
    const region = REGION_OVERRIDES[name] || PROVINCE_REGION.get(province);
    return { region, regionRank: REGION_RANK.get(region) };
}

function checkProvince(name, province) {
    if (PROVINCE_REGION.has(province)) {
        return;
    }
    if (REGION_NAMES.some(region => region.toLowerCase() === province.toLowerCase())) {
        throw new LguNameError('unknown-province', name, `"${province}" is a region, not a province. Use the PSGC province the LGU is in.`);
    }
    throw new LguNameError('unknown-province', name, `"${province}" is not a PSGC province (or "${METRO_MANILA}" for NCR).${caseHint(province, PROVINCES)}`);
}

function parseLocal(name) {
    const commas = name.split(',').length - 1;
    const match = /^(\S(?:.*\S)?), (\S(?:.*\S)?)$/.exec(name);
    if (commas !== 1 || !match || /\s{2}/.test(name)) {
        throw new LguNameError('format', name, `Write "<Place>, <Province>" or "<Place> City, <Province>", with one comma followed by one space.`);
    }
    const [, local, province] = match;

    const cityOf = /^(?:.*\s)?City of (.+)$/.exec(local);
    if (cityOf) {
        throw new LguNameError('city-of', name, `Write every city as "<Place> City" — "${cityOf[1]} City, ${province}".`);
    }
    checkProvince(name, province);

    const isCity = local.endsWith(CITY_SUFFIX);
    const place = isCity ? local.slice(0, -CITY_SUFFIX.length) : local;
    if (place.trim() === '') {
        throw new LguNameError('format', name, `The place name before "City" is missing.`);
    }
    return { place, kind: isCity ? 'city' : 'municipality', province, ...regionOf(name, province) };
}

function parseProvinceOrRegion(name) {
    if (REGION_RANK.has(name)) {
        return { place: name, kind: 'region', province: '', region: name, regionRank: REGION_RANK.get(name) };
    }
    if (name === `${METRO_MANILA}${PROVINCE_SUFFIX}`) {
        throw new LguNameError('metro-manila-province', name, `Metro Manila is only the stand-in province for NCR LGUs. Write a region-level NCR entry as "NCR".`);
    }
    // A province whose PSGC name already ends in "Province" (Mountain
    // Province) is written as itself rather than doubled.
    const province = PROVINCE_REGION.has(name) && name.endsWith(PROVINCE_SUFFIX)
        ? name
        : name.endsWith(PROVINCE_SUFFIX) ? name.slice(0, -PROVINCE_SUFFIX.length) : null;
    if (province === null) {
        throw new LguNameError('no-province', name, `A city or municipality needs its province ("<Place>, <Province>"); a province row ends in "Province"; a region row uses the region's PSGC name.${caseHint(name, REGION_NAMES)}`);
    }
    checkProvince(name, province);
    return { place: province, kind: 'province', province, ...regionOf(name, province) };
}

// `name` → { place, kind, province, region, regionRank }. Throws an
// LguNameError whose `rule` names the rule that failed: format, city-of,
// unknown-province, metro-manila-province, or no-province.
function parseLguName(name) {
    const value = String(name || '');
    if (value.trim() === '') {
        throw new LguNameError('format', value, 'The LGU name is empty.');
    }
    return value.includes(',') ? parseLocal(value) : parseProvinceOrRegion(value);
}

// Same fold as triage's: diacritics removed, case-insensitive, punctuation
// and spaces ignored — so `Biñan` sorts under "n". (Triage additionally
// drops noise words for its collision key; sorting does not.)
function fold(value) {
    return String(value)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

function compareStrings(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

// The README order (see CONTEXT.md, Sort Order): folded place ascending, then
// level (region, province, then city or municipality), then folded province.
// Takes parsed LGUs.
function compareParsed(a, b) {
    return compareStrings(fold(a.place), fold(b.place))
        || LEVEL[a.kind] - LEVEL[b.kind]
        || compareStrings(fold(a.province), fold(b.province));
}

// The same order, on LGU name strings. Throws on a name that doesn't parse.
function compareLguNames(a, b) {
    return compareParsed(parseLguName(a), parseLguName(b));
}

// Where `name` belongs among `otherNames` in the README order: the name it
// goes right after and the one it goes right before (null at either end).
// Names that don't parse are skipped. For triage's "row out of order" hint.
function placement(name, otherNames) {
    const self = parseLguName(name);
    let after = null;
    let before = null;
    for (const other of otherNames) {
        let parsed;
        try {
            parsed = parseLguName(other);
        } catch {
            continue;
        }
        const order = compareParsed(parsed, self);
        if (order < 0 && (after === null || compareParsed(parsed, after.parsed) > 0)) {
            after = { name: other, parsed };
        } else if (order > 0 && (before === null || compareParsed(parsed, before.parsed) < 0)) {
            before = { name: other, parsed };
        }
    }
    return { after: after && after.name, before: before && before.name };
}

module.exports = {
    placement,
    KINDS,
    LEVEL,
    LguNameError,
    parseLguName,
    fold,
    compareParsed,
    compareLguNames,
};
