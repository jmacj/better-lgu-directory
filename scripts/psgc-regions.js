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
// The list is in PSGC's north-to-south order, and that order is the region
// rank (`region_rank`, 0-based). `Metro Manila` is not a PSGC province: it is
// this directory's stand-in province for NCR LGUs (see CONTRIBUTING.md,
// "Departures from PSGC").

const REGIONS = [
    { name: 'NCR', provinces: ['Metro Manila'] },
    { name: 'CAR', provinces: ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'] },
    { name: 'Ilocos Region', provinces: ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'] },
    { name: 'Cagayan Valley', provinces: ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'] },
    { name: 'Central Luzon', provinces: ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'] },
    { name: 'CALABARZON', provinces: ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'] },
    { name: 'MIMAROPA Region', provinces: ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'] },
    { name: 'Bicol Region', provinces: ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'] },
    { name: 'Western Visayas', provinces: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo'] },
    { name: 'NIR', provinces: ['Negros Occidental', 'Negros Oriental', 'Siquijor'] },
    { name: 'Central Visayas', provinces: ['Bohol', 'Cebu'] },
    { name: 'Eastern Visayas', provinces: ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'] },
    // Sulu: placed under Region IX following the 2024 Supreme Court ruling
    // that excluded it from BARMM.
    { name: 'Zamboanga Peninsula', provinces: ['Sulu', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'] },
    { name: 'Northern Mindanao', provinces: ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'] },
    { name: 'Davao Region', provinces: ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'] },
    { name: 'SOCCSKSARGEN', provinces: ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'] },
    { name: 'Caraga', provinces: ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'] },
    { name: 'BARMM', provinces: ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Tawi-Tawi'] },
];

// The stand-in province for NCR LGUs. Valid after a comma; never as a
// province row (`Metro Manila Province` is rejected — write `NCR`).
const METRO_MANILA = 'Metro Manila';

// LGUs PSGC places in a different region from their geographic province,
// keyed by the full LGU cell. Checked before the province lookup.
const REGION_OVERRIDES = {
    // PSGC lists the City of Isabela under Region IX (Zamboanga Peninsula),
    // though geographically it is on Basilan (BARMM).
    'Isabela City, Basilan': 'Zamboanga Peninsula',
};

const REGION_NAMES = REGIONS.map(region => region.name);

const REGION_RANK = new Map(REGIONS.map((region, rank) => [region.name, rank]));

const PROVINCE_REGION = new Map(REGIONS.flatMap(region => region.provinces.map(province => [province, region.name])));

module.exports = {
    REGIONS,
    REGION_NAMES,
    REGION_RANK,
    PROVINCE_REGION,
    REGION_OVERRIDES,
    METRO_MANILA,
};
