// PSGC regions module (#307): the single source of region data for every
// script on `main`, and — through the sync — for the website. Nothing on
// `main-pages` keeps its own copy.
//
// Source: PSA Philippine Standard Geographic Code (PSGC), region and province
// lists, checked 2026-11-17. psa.gov.ph refuses automated fetches, so this was
// cross-checked against the PSA-based "Provinces of the Philippines" and
// "List of cities and municipalities in the Philippines" Wikipedia articles.
// A Directory Maintainer reading the PSGC site by hand should treat PSGC as
// authoritative on any difference and fix it here — one edit.
//
// Region names are PSGC's short form: the name PSGC gives in parentheses
// (`Region IV-A (CALABARZON)` → `CALABARZON`), or, where it gives none, its
// name as written (`MIMAROPA Region`), with PSGC's capitalisation.
//
// `designation` is the rest of PSGC's name: the Region number (`Region IV-A`)
// or, for regions known by an acronym, the name the acronym stands for
// (`National Capital Region`). MIMAROPA has none. psgcName() puts the two
// back together for the website's region filter (`Region IV-A (CALABARZON)`).
// Designations checked 2026-11-18 against the PSA-based PSGC API at
// psgc.gitlab.io/api/regions.json (psa.gov.ph refuses automated fetches).
// That API predates the Negros Island Region (2024), so NIR's designation is
// its name in Republic Act No. 12000, with no Region number.
//
// The list is in PSGC's north-to-south order, and that order is the region
// rank (`region_rank`, 0-based). `Metro Manila` is not a PSGC province: it is
// this directory's stand-in province for NCR LGUs (see CONTRIBUTING.md,
// "Departures from PSGC").

const REGIONS = [
    { name: 'NCR', designation: 'National Capital Region', provinces: ['Metro Manila'] },
    { name: 'CAR', designation: 'Cordillera Administrative Region', provinces: ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'] },
    { name: 'Ilocos Region', designation: 'Region I', provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'] },
    { name: 'Cagayan Valley', designation: 'Region II', provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'] },
    { name: 'Central Luzon', designation: 'Region III', provinces: ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'] },
    { name: 'CALABARZON', designation: 'Region IV-A', provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'] },
    { name: 'MIMAROPA Region', provinces: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'] },
    { name: 'Bicol Region', designation: 'Region V', provinces: ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'] },
    { name: 'Western Visayas', designation: 'Region VI', provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo'] },
    { name: 'NIR', designation: 'Negros Island Region', provinces: ['Negros Occidental', 'Negros Oriental', 'Siquijor'] },
    { name: 'Central Visayas', designation: 'Region VII', provinces: ['Bohol', 'Cebu'] },
    { name: 'Eastern Visayas', designation: 'Region VIII', provinces: ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'] },
    // Sulu: PSGC lists it under Region IX (confirmed on the PSGC site by
    // hand, 2026-11-18), after the 2024 Supreme Court ruling excluded it
    // from BARMM.
    { name: 'Zamboanga Peninsula', designation: 'Region IX', provinces: ['Sulu', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'] },
    { name: 'Northern Mindanao', designation: 'Region X', provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'] },
    { name: 'Davao Region', designation: 'Region XI', provinces: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'] },
    { name: 'SOCCSKSARGEN', designation: 'Region XII', provinces: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'] },
    { name: 'Caraga', designation: 'Region XIII', provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'] },
    { name: 'BARMM', designation: 'Bangsamoro Autonomous Region in Muslim Mindanao', provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Tawi-Tawi'] },
];

// The stand-in province for NCR LGUs. Valid after a comma; never as a
// province row (`Metro Manila Province` is rejected — write `NCR`).
const METRO_MANILA = 'Metro Manila';

// LGUs PSGC places in a different region from their geographic province,
// keyed by the full LGU cell. Checked before the province lookup.
//
// Checked: every highly urbanized and independent component city. Only the
// City of Isabela differs; Cotabato City's geographic province, Maguindanao
// del Norte, is already in BARMM. The other case is the BARMM Special
// Geographic Area, whose municipalities lie inside Cotabato province.
const SPECIAL_GEOGRAPHIC_AREA = [
    'Kadayangan', 'Kapalawan', 'Ligawasan', 'Malidegao',
    'Nabalawag', 'Old Kaabakan', 'Pahamuddin', 'Tugunan',
];
const REGION_OVERRIDES = {
    // PSGC note (checked by hand 2026-11-18): "City of Isabela is classified
    // under Region IX (Zamboanga Peninsula) but is geographically located in
    // the province of Basilan (Bangsamoro Autonomous Region in Muslim
    // Mindanao)." PSGC files it under Region IX, not under Basilan.
    'Isabela City, Basilan': 'Zamboanga Peninsula',
    // BARMM's Special Geographic Area. PSGC note: "Executive Order No. 001,
    // series of 2020, establishes one (1) Development Coordinating Office with
    // eight (8) Area Clusters" in BARMM; the eight clusters later became these
    // municipalities. The count is confirmed against PSGC; the spellings are
    // not yet.
    ...Object.fromEntries(SPECIAL_GEOGRAPHIC_AREA.map(place => [`${place}, Cotabato`, 'BARMM'])),
};

const REGION_NAMES = REGIONS.map(region => region.name);

const REGION_RANK = new Map(REGIONS.map((region, rank) => [region.name, rank]));

const PROVINCE_REGION = new Map(REGIONS.flatMap(region => region.provinces.map(province => [province, region.name])));

// PSGC's full region name: `Region IV-A (CALABARZON)`, or the short name
// alone when PSGC gives no designation (`MIMAROPA Region`).
function psgcName(region) {
    return region.designation ? `${region.designation} (${region.name})` : region.name;
}

module.exports = {
    psgcName,
    REGIONS,
    REGION_NAMES,
    REGION_RANK,
    PROVINCE_REGION,
    REGION_OVERRIDES,
    METRO_MANILA,
};
