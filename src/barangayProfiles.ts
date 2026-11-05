import {
  barangayProfiles as directoryProfiles,
  VERIFIED_ON,
  type Source,
} from "./data";
import { bidRecords2026, type BidRecord } from "./bidRecords";

export const barangaySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type PsgcProfile = {
  name: string;
  code: string;
  classification: "Urban" | "Rural";
  population: number;
};

export const MALAYBALAY_2024_POPULATION = 195_046;
export const POPULATION_REFERENCE_DATE = "1 July 2024";
export const POPULATION_RELEASE_DATE = "15 January 2026";
export const BARANGAY_PROFILE_REVIEWED_ON = "2026-11-06";

const psgcRows: Array<[string, string, "Urban" | "Rural", number]> = [
  ["Aglayan", "1001312001", "Urban", 8225],
  ["Bangcud", "1001312002", "Urban", 6387],
  ["Busdi", "1001312003", "Rural", 2704],
  ["Cabangahan", "1001312004", "Rural", 3195],
  ["Caburacanan", "1001312007", "Rural", 1190],
  ["Can-ayan", "1001312009", "Urban", 6643],
  ["Capitan Angel", "1001312010", "Rural", 1570],
  ["Casisang", "1001312012", "Urban", 29492],
  ["Dalwangan", "1001312014", "Urban", 7812],
  ["Imbayao", "1001312017", "Urban", 1971],
  ["Indalasa", "1001312018", "Rural", 2096],
  ["Kalasungay", "1001312019", "Urban", 10156],
  ["Kibalabag", "1001312021", "Rural", 1354],
  ["Kulaman", "1001312022", "Rural", 1363],
  ["Laguitas", "1001312023", "Rural", 4151],
  ["Patpat", "1001312025", "Urban", 4482],
  ["Linabo", "1001312026", "Urban", 7501],
  ["Apo Macote", "1001312027", "Urban", 5116],
  ["Miglamin", "1001312028", "Rural", 3037],
  ["Magsaysay", "1001312029", "Urban", 3186],
  ["Maligaya", "1001312030", "Rural", 3075],
  ["Managok", "1001312031", "Urban", 7926],
  ["Manalog", "1001312032", "Rural", 1097],
  ["Mapayag", "1001312034", "Rural", 1162],
  ["Mapulo", "1001312035", "Rural", 1773],
  ["Barangay 1", "1001312038", "Urban", 6455],
  ["Barangay 2", "1001312045", "Urban", 606],
  ["Barangay 3", "1001312046", "Urban", 661],
  ["Barangay 4", "1001312047", "Urban", 382],
  ["Barangay 5", "1001312048", "Urban", 114],
  ["Barangay 6", "1001312049", "Urban", 629],
  ["Barangay 7", "1001312050", "Urban", 1934],
  ["Barangay 8", "1001312051", "Urban", 613],
  ["Barangay 9", "1001312052", "Urban", 8625],
  ["Barangay 10", "1001312053", "Urban", 3366],
  ["Barangay 11", "1001312054", "Rural", 3045],
  ["St. Peter", "1001312058", "Rural", 2835],
  ["San Jose", "1001312059", "Urban", 9488],
  ["San Martin", "1001312060", "Rural", 3330],
  ["Sto. Niño", "1001312061", "Rural", 1975],
  ["Silae", "1001312062", "Rural", 2759],
  ["Simaya", "1001312063", "Rural", 4725],
  ["Sinanglanan", "1001312064", "Rural", 3661],
  ["Sumpong", "1001312065", "Urban", 9012],
  ["Violeta", "1001312066", "Rural", 2397],
  ["Zamboanguita", "1001312067", "Rural", 1770],
];

const psgcProfiles: PsgcProfile[] = psgcRows.map(
  ([name, code, classification, population]) => ({
    name,
    code,
    classification,
    population,
  }),
);

const populationRankByName = new Map(
  [...psgcProfiles]
    .sort((left, right) => right.population - left.population)
    .map((profile, index) => [profile.name, index + 1]),
);

const ordinal = (value: number) => {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
};

const logoSource: Source = {
  label: "City Government of Malaybalay — Barangay directory and marks",
  url: "https://sakata.malaybalaycity.gov.ph/list-of-barangay/",
  verifiedOn: VERIFIED_ON,
};

const boundarySource: Source = {
  label:
    "PSA/NAMRIA-derived Philippine barangay boundaries — 2023-11-06 snapshot",
  url: "https://bendlikeabamboo.github.io/barangay-boundaries-repository/boundaries/barangays.html",
  verifiedOn: VERIFIED_ON,
};

export const psgcSource: Source = {
  label: "Philippine Statistics Authority — PSGC, City of Malaybalay",
  url: "https://psa.gov.ph/classification/psgc/barangays/1001312000",
  verifiedOn: BARANGAY_PROFILE_REVIEWED_ON,
};

export const populationReleaseSource: Source = {
  label: "PSA RSSO X — 2024 POPCEN highlights for Malaybalay City",
  url: "https://rsso10.psa.gov.ph/content/highlights-population-counts-malaybalay-city-bukidnon-based-2024-census-population",
  verifiedOn: BARANGAY_PROFILE_REVIEWED_ON,
};

const localServiceAreas = [
  {
    title: "Barangay certificates and clearances",
    description:
      "Ask the barangay hall about requirements, fees, and release schedules before visiting.",
  },
  {
    title: "Community mediation",
    description:
      "Route neighborhood disputes and Katarungang Pambarangay inquiries through the barangay office.",
  },
  {
    title: "Health and nutrition referrals",
    description:
      "Ask about local health-worker schedules, nutrition activities, and referrals to the City Health Office.",
  },
  {
    title: "Social welfare referrals",
    description:
      "Request guidance for assistance programs and referral to the City Social Welfare and Development Office.",
  },
  {
    title: "Disaster and incident coordination",
    description:
      "Report local hazards to the barangay and use citywide emergency numbers for urgent incidents.",
  },
  {
    title: "Environmental and sanitation concerns",
    description:
      "Raise waste, drainage, cleanliness, and environmental concerns with the barangay office.",
  },
] as const;

const committeeAreas = [
  "Health and sanitation",
  "Education and culture",
  "Peace and order and public safety",
  "Environment and solid waste",
  "Infrastructure and public works",
  "Livelihood and economic development",
  "Women, family and social welfare",
  "Youth and sports development",
] as const;

const profileByName = new Map<string, (typeof directoryProfiles)[number]>(
  directoryProfiles.map((profile) => [profile.name, profile]),
);

export type BarangayMicrositeProfile = {
  name: string;
  slug: string;
  punongBarangay: string;
  phone?: string;
  email?: string;
  code: string;
  classification: "Urban" | "Rural";
  population: number;
  logo: string;
  logoSource: Source;
  heroImage?: {
    url: string;
    alt: string;
    source: Source;
    license: string;
  };
  leadershipSource: Source;
  psgcSource: Source;
  populationReleaseSource: Source;
  boundarySource: Source;
  description: string;
  introduction: string;
  populationSummary: string;
  classificationNote: string;
  populationRank: number;
  cityPopulationShare: number;
  serviceAreas: typeof localServiceAreas;
  committeeAreas: typeof committeeAreas;
  bids: BidRecord[];
  requestedSubdomain: string;
};

const sumpongHallSource: Source = {
  label: "Wikimedia Commons — Sumpong Barangay Hall",
  url: "https://commons.wikimedia.org/wiki/File:Sumpong_Barangay_Hall.jpg",
  verifiedOn: VERIFIED_ON,
};

export const barangayMicrosites: BarangayMicrositeProfile[] = psgcProfiles.map(
  (psgc) => {
    const directory = profileByName.get(psgc.name);
    if (!directory)
      throw new Error(`Missing barangay directory record for ${psgc.name}`);
    const slug = barangaySlug(psgc.name);
    const populationRank = populationRankByName.get(psgc.name);
    if (!populationRank)
      throw new Error(`Missing population rank for ${psgc.name}`);
    const cityPopulationShare =
      (psgc.population / MALAYBALAY_2024_POPULATION) * 100;
    const article = psgc.classification === "Urban" ? "an" : "a";
    const formattedPopulation = psgc.population.toLocaleString("en-PH");
    return {
      ...psgc,
      slug,
      punongBarangay: directory.punongBarangay,
      phone: directory.phone,
      email: directory.email,
      logo: `/images/barangays/${slug}.webp`,
      logoSource,
      heroImage:
        slug === "sumpong"
          ? {
              url: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Sumpong_Barangay_Hall.jpg",
              alt: "Sumpong Barangay Administration Building",
              source: sumpongHallSource,
              license: "CC BY-SA 4.0",
            }
          : undefined,
      leadershipSource: directory.leadershipSource,
      psgcSource,
      populationReleaseSource,
      boundarySource,
      description: `${psgc.name} is ${article} ${psgc.classification.toLowerCase()} barangay of Malaybalay City with ${formattedPopulation} residents in the latest official census count.`,
      introduction: `${psgc.name} is one of Malaybalay City’s 46 barangays. The Philippine Statistics Authority classifies it as ${article} ${psgc.classification.toLowerCase()} barangay and recorded ${formattedPopulation} residents in the 2024 Census of Population.`,
      populationSummary: `Based on the same census, ${psgc.name} ranks ${ordinal(populationRank)} by population among the city’s 46 barangays and accounts for ${cityPopulationShare.toFixed(2)}% of Malaybalay’s ${MALAYBALAY_2024_POPULATION.toLocaleString("en-PH")} residents.`,
      classificationNote: `The ${psgc.classification.toLowerCase()} classification is an official statistical category. It is not a rating of local services, infrastructure, or development conditions.`,
      populationRank,
      cityPopulationShare,
      serviceAreas: localServiceAreas,
      committeeAreas,
      bids: bidRecords2026.filter((record) =>
        record.barangays.includes(slug),
      ),
      requestedSubdomain: `https://${slug}.bettergov.org`,
    };
  },
);

export const barangayMicrositeBySlug = new Map(
  barangayMicrosites.map((profile) => [profile.slug, profile]),
);

export function barangaySlugFromHostname(hostname: string) {
  const normalized = hostname.toLowerCase().split(":")[0];
  const supportedSuffixes = [".bettergov.org", ".bettermc.ph"];
  const suffix = supportedSuffixes.find((candidate) =>
    normalized.endsWith(candidate),
  );
  if (!suffix) return null;
  const slug = normalized.slice(0, -suffix.length);
  return slug && slug !== "www" ? slug : null;
}
