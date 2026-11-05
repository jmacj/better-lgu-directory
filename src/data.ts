export const VERIFIED_ON = "2026-11-06";

export type Source = {
  label: string;
  url: string;
  verifiedOn: string;
};

export type Official = {
  name: string;
  role: string;
  group: "Executive" | "Legislative" | "Sectoral";
  chairmanships?: string[];
  committeeMemberships?: string[];
  source: Source;
  office: {
    name: string;
    scope:
      | "Direct office contact"
      | "Shared legislative-office routing"
      | "Published constituency contact";
    address: string;
    phone: string;
    email?: string;
    source: Source;
  };
};

const cityHallAddress =
  "New City Hall, National Highway, Barangay Casisang, Malaybalay City, 8700 Bukidnon";
const contactDirectorySource: Source = {
  label: "City Government of Malaybalay — Contact Us",
  url: "https://sakata.malaybalaycity.gov.ph/contact-us/",
  verifiedOn: VERIFIED_ON,
};
const mayorOffice = {
  name: "City Mayor’s Office",
  scope: "Direct office contact",
  address: cityHallAddress,
  phone: "0953-459-1777",
  email: "malaybalaycitylgu@gmail.com",
  source: contactDirectorySource,
} as const;
const viceMayorOffice = {
  name: "City Vice Mayor’s Office",
  scope: "Direct office contact",
  address: cityHallAddress,
  phone: "0917-128-8087",
  email: "spmarabe@gmail.com",
  source: contactDirectorySource,
} as const;
const councilOffice = {
  name: "Office of the Sangguniang Panlungsod",
  scope: "Shared legislative-office routing",
  address: cityHallAddress,
  phone: "0917-497-6861",
  email: "spmalaybalaycity@gmail.com",
  source: contactDirectorySource,
} as const;
const barangayEightSource: Source = {
  label: "DILG Barangay Officials Directory",
  url: "https://www.dilg.gov.ph/barangay-officials-directory/index",
  verifiedOn: VERIFIED_ON,
};
const barangayEightOffice = {
  name: "Barangay 8 constituency contact",
  scope: "Published constituency contact",
  address: "Barangay 8, Malaybalay City, 8700 Bukidnon",
  phone: "0951-692-1915",
  email: "jnmanghano@gmail.com",
  source: barangayEightSource,
} as const;

const officialProfile = (url: string): Source => ({
  label: "City Government of Malaybalay — Official profile",
  url,
  verifiedOn: VERIFIED_ON,
});
const councilorOffice = (
  name: string,
  phone: string,
  email: string | undefined,
  url: string,
) => ({
  name: `${name} public contact`,
  scope: "Published constituency contact" as const,
  address: cityHallAddress,
  phone,
  email,
  source: officialProfile(url),
});

export const officials: Official[] = [
  {
    name: "Jay Warren R. Pabillaran",
    role: "City Mayor",
    group: "Executive",
    office: mayorOffice,
    source: officialProfile("https://sakata.malaybalaycity.gov.ph/executive1/"),
  },
  {
    name: "Estelito “Litoy” R. Marabe",
    role: "City Vice Mayor",
    group: "Executive",
    office: viceMayorOffice,
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legistative-vice-mayor/",
    ),
  },
  {
    name: "Jason Chad J. Ayala",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: ["Quasi-Judicial"],
    committeeMemberships: [
      "Human Rights and Ethics",
      "Environment and Natural Resources",
      "Commerce, Trade, Industry and Labor Relations",
    ],
    office: councilorOffice(
      "Councilor Jason Chad J. Ayala",
      "0994-514-3081 / 0975-353-6900",
      "spayala2025@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-1/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-1/",
    ),
  },
  {
    name: "Brian Nelson T. Flores",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Finance, Bank Accounts and Appropriations",
      "Engineering and Public Works",
      "Tourism",
    ],
    committeeMemberships: [
      "Transportation, Communications and Traffic",
      "Health and Social Welfare Services",
      "Women and Family",
      "Blue Ribbon",
      "Youth and Sports Development",
    ],
    office: councilorOffice(
      "Councilor Brian Nelson T. Flores",
      "0955-120-1116",
      "spbrianflores2022@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-ii/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-ii/",
    ),
  },
  {
    name: "Rendon P. Sangalang",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Human Rights and Ethics",
      "Transportation, Communications and Traffic",
    ],
    committeeMemberships: ["Quasi-Judicial", "Tourism"],
    office: councilorOffice(
      "Councilor Rendon P. Sangalang",
      "0917-852-6449",
      "kryss0510@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-iii/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-iii/",
    ),
  },
  {
    name: "Niko P. Aldeguer",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: ["Cooperatives", "Public Utilities"],
    committeeMemberships: [
      "Ways and Means and Economic Enterprise",
      "Human Settlements, Zoning and Land Use",
      "Senior Citizens and Veterans Affairs",
      "Civil Service and Personnel Management",
    ],
    office: councilorOffice(
      "Councilor Niko P. Aldeguer",
      "0906-151-5605",
      "spaldegueroffice@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-iv/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-iv/",
    ),
  },
  {
    name: "Kathleen Cecille C. Pagaling",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: ["Health and Social Welfare Services", "Women and Family"],
    committeeMemberships: ["Tourism", "Blue Ribbon"],
    office: councilorOffice(
      "Councilor Kathleen Cecille C. Pagaling",
      "0955-522-6833",
      "sppagalingmalaybalay@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-v/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-v/",
    ),
  },
  {
    name: "Alan Ryann O. Legaspi",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Agriculture and Agrarian Reform",
      "Ways and Means and Economic Enterprise",
      "Blue Ribbon",
    ],
    committeeMemberships: [
      "Finance, Bank Accounts and Appropriations",
      "Cooperatives",
      "Environment and Natural Resources",
      "Peace and Order and Public Safety",
    ],
    office: councilorOffice(
      "Councilor Alan Ryann O. Legaspi",
      "0965-330-4705 / 0975-209-5371",
      "spmanoylegaspi@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-vi/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-vi/",
    ),
  },
  {
    name: "Erwin A. Damasco",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Human Settlements, Zoning and Land Use",
      "Senior Citizens and Veterans Affairs",
    ],
    committeeMemberships: [
      "Engineering and Public Works",
      "Transportation, Communications and Traffic",
      "Agriculture and Agrarian Reform",
      "Civil Service and Personnel Management",
    ],
    office: councilorOffice(
      "Councilor Erwin A. Damasco",
      "0955-640-0397",
      undefined,
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-vii/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-vii/",
    ),
  },
  {
    name: "Flaviano T. Gapol, Jr.",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Environment and Natural Resources",
      "Codification, Rules and Laws",
    ],
    committeeMemberships: [
      "Quasi-Judicial",
      "Public Utilities",
      "Senior Citizens and Veterans Affairs",
      "Barangay Affairs and Community Development",
    ],
    office: councilorOffice(
      "Councilor Flaviano T. Gapol, Jr.",
      "0917-718-2991",
      "gapol.assoc.law@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-viii/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-viii/",
    ),
  },
  {
    name: "Zoltan Dindo D. Dinlayan",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: ["Civil Service and Personnel Management", "Education"],
    committeeMemberships: [
      "Finance, Bank Accounts and Appropriations",
      "Cooperatives",
      "Public Utilities",
      "Ways and Means and Economic Enterprise",
      "Human Settlements, Zoning and Land Use",
      "Commerce, Trade, Industry and Labor Relations",
      "Peace and Order and Public Safety",
    ],
    office: councilorOffice(
      "Councilor Zoltan Dindo D. Dinlayan",
      "0906-893-9848",
      "cabanoscrystalkay@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-ix/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-ix/",
    ),
  },
  {
    name: "Cromwell Kiril D. Dinlayan",
    role: "City Councilor",
    group: "Legislative",
    chairmanships: [
      "Cultural Heritage and Arts",
      "Commerce, Trade, Industry and Labor Relations",
    ],
    committeeMemberships: [
      "Quasi-Judicial",
      "Engineering and Public Works",
      "Human Rights and Ethics",
      "Codification and Laws",
      "Education",
      "Ethnic and Indigenous Cultural Communities",
      "Youth and Sports Development",
    ],
    office: councilorOffice(
      "Councilor Cromwell Kiril D. Dinlayan",
      "0970-368-4160",
      "lalailopena@gmail.com",
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-x/",
    ),
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-x/",
    ),
  },
  {
    name: "Julius N. Manghano",
    role: "ABC President",
    group: "Sectoral",
    office: barangayEightOffice,
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-xi/",
    ),
  },
  {
    name: "Datu Sumbongan",
    role: "Indigenous Peoples Mandatory Representative",
    group: "Sectoral",
    office: councilOffice,
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-xii/",
    ),
  },
  {
    name: "Christopher Tortola",
    role: "SK Federation President",
    group: "Sectoral",
    office: councilOffice,
    source: officialProfile(
      "https://sakata.malaybalaycity.gov.ph/legislative-city-councilor-xiii/",
    ),
  },
];

export type Department = {
  name: string;
  phone?: string;
  email?: string;
  emergency?: boolean;
  source: Source;
};

const contactSource = contactDirectorySource;

export const departments: Department[] = [
  ["Bids and Awards Committee", "0967-016-9677", "bacmalaybalay@gmail.com"],
  [
    "Business Permits and Licensing Division",
    "0926-833-0696",
    "malaybalaycitylicensing@gmail.com",
  ],
  [
    "City Accounting Office",
    "(088) 813-4726 local 110",
    "cacco.malaybalay@gmail.com",
  ],
  [
    "City Administrator’s Office",
    "0917-188-4225",
    "imalaybalay.8700@gmail.com",
  ],
  ["City Agriculture Office", "0994-957-6384", "mlyblyagri2023@gmail.com"],
  ["City Assessor’s Office", "0916-335-5178", "cassomalaybalay@gmail.com"],
  ["City Budget Office", "(088) 813-4726 local 112", "cbomlybly@gmail.com"],
  ["City Civil Registry Office", "0906-616-4009", "malaybalayccro@gmail.com"],
  [
    "City Disaster Risk Reduction and Management Office",
    "0917-827-6117",
    "malaybalaycitydrrmo@gmail.com",
    true,
  ],
  [
    "City Economic Enterprise Development and Management Office",
    "0935-740-5424",
    "ceedmomalaybalaycity@gmail.com",
  ],
  ["City Engineering Office", "(088) 813-1695", "cgm.ceo.nada@gmail.com"],
  [
    "City Environment and Natural Resources Office",
    "0997-790-0290",
    "infoserve.cityenroffice19@gmail.com",
  ],
  ["City General Services Office", "0935-750-5371", "malaybalaycgso@gmail.com"],
  ["City Health Office", "0965-094-9105", "cho.malaybly@gmail.com", true],
  [
    "City Human Resource Management Office",
    "0975-601-2867",
    "malaybalaychrmo@gmail.com",
  ],
  ["City Legal Office", "0916-414-7427", "clo8134706@gmail.com"],
  ["City Mayor’s Office", "0953-459-1777", "malaybalaycitylgu@gmail.com"],
  [
    "City Planning and Development Office",
    "0917-110-7717",
    "cpdomalaybalay@gmail.com",
  ],
  [
    "City Social Welfare and Development Office",
    "0953-385-2277",
    "swmlycty@yahoo.com",
    true,
  ],
  [
    "City Treasurer’s Office",
    "0997-452-5920",
    "citytreasurermalaybalay@gmail.com",
  ],
  [
    "City Tourism Division",
    "0997-850-4913",
    "malaybalaycity_tourism@gmail.com",
  ],
  [
    "City Urban Development and Housing Office",
    "0953-459-7782",
    "city8700housing@gmail.com",
  ],
  ["City Veterinary Office", "0926-198-6992", "citymalaybalay@gmail.com"],
  ["City Vice Mayor’s Office", "0917-128-8087", "spmarabe@gmail.com"],
  [
    "Office of the Building Official",
    "0917-152-6618",
    "obo.malaybalay@gmail.com",
  ],
  [
    "Office of the Sangguniang Panlungsod",
    "0917-497-6861",
    "spmalaybalaycity@gmail.com",
  ],
  [
    "Public Employment Service Office",
    "0915-542-3434",
    "pesomalaybalaycity@gmail.com",
  ],
  [
    "Traffic Management Center",
    "0936-829-4691",
    "tmcmalaybalay2014@gmail.com",
    true,
  ],
  [
    "Bureau of Fire Protection — Malaybalay",
    "0917-677-7700",
    "malaybalaycfs@gmail.com",
    true,
  ],
  [
    "Malaybalay City Police Station",
    "0926-821-8803",
    "malaybalay.cps.pnp@gmail.com",
    true,
  ],
].map(([name, phone, email, emergency]) => ({
  name: String(name),
  phone: String(phone),
  email: String(email),
  emergency: Boolean(emergency),
  source: contactSource,
}));

const barangaySource: Source = {
  label: "City Government of Malaybalay — List of Barangays",
  url: "https://sakata.malaybalaycity.gov.ph/list-of-barangay/",
  verifiedOn: VERIFIED_ON,
};

const barangayOfficialsSource: Source = {
  label: "DILG Barangay Officials Directory",
  url: "https://www.dilg.gov.ph/barangay-officials-directory/index",
  verifiedOn: VERIFIED_ON,
};

const barangayLeadership = {
  Aglayan: "Glorio D. Sajulga",
  Bangcud: "Rosa Maria M. Robosa",
  Busdi: "Bernard L. Dumala",
  Cabangahan: "Edwin L. Rara",
  Caburacanan: "Joven L. Salonga",
  "Can-ayan": "Yorita C. Cajardo",
  "Capitan Angel": "Marjun S. Mancila",
  Casisang: "Gregorio D. Jaroy",
  Dalwangan: "Royville C. Pasco",
  Imbayao: "Jean T. Maputi",
  Indalasa: "Erwen J. Sunog",
  Kalasungay: "Rodrigo O. Niere",
  Kibalabag: "Jerry S. Sulinay",
  Kulaman: "Cyrus S. Torpio",
  Laguitas: "Rosanna Linhay",
  Patpat: "Renante M. Okit",
  Linabo: "Manuel M. Evangelista Sr.",
  "Apo Macote": "Vicente H. Leono",
  Miglamin: "Alfonso P. Inocando",
  Magsaysay: "Benjamin O. Torcende Jr.",
  Maligaya: "Adelina B. Perez",
  Managok: "Aries Vincent B. Jurolan",
  Manalog: "Ronio S. Lagunday",
  Mapayag: "Conrado L. Sungkit Jr.",
  Mapulo: "Joylyn C. Atchame",
  "Barangay 1": "Gleendale V. Belderol",
  "Barangay 2": "Vinci A. Melendez",
  "Barangay 3": "Lyzander Cedric D. Maandig",
  "Barangay 4": "Crispin G. Pepito",
  "Barangay 5": "Rumel C. Castilla",
  "Barangay 6": "Manuel L. Sicalan III",
  "Barangay 7": "Rodrigo V. Ramos",
  "Barangay 8": "Julius N. Manghano",
  "Barangay 9": "Dexter Maxileo P. Gamo",
  "Barangay 10": "Nilo Q. Salga",
  "Barangay 11": "Emilio R. Cid",
  "St. Peter": "Domingo D. Hingpit",
  "San Jose": "Bebina M. Kee",
  "San Martin": "Sergio C. Fiel",
  "Sto. Niño": "Felix P. Gerongano Jr.",
  Silae: "Dovit G. Dela Mance",
  Simaya: "Nimfa V. Bautista",
  Sinanglanan: "Nilo P. Aldeguer",
  Sumpong: "Velemar M. Ricarte",
  Violeta: "Efren S. Omallao",
  Zamboanguita: "Pio Q. Masipequiña",
} as const;

const barangayContacts: Partial<
  Record<keyof typeof barangayLeadership, { phone?: string; email?: string }>
> = {
  Aglayan: { phone: "088-314-1504", email: "dusajulga@yahoo.com" },
  Bangcud: { phone: "0975-884-6584" },
  Cabangahan: { phone: "0905-616-1114" },
  Caburacanan: { phone: "0970-037-1336" },
  "Can-ayan": { phone: "0977-654-3211" },
  "Capitan Angel": { phone: "0936-212-4043", email: "jhungmansila@gmail.com" },
  Casisang: { phone: "088-813-1357", email: "lgubrgycasisang@gmail.com" },
  Dalwangan: { phone: "0960-220-7343", email: "proyville17@yahoo.com" },
  Imbayao: { phone: "0935-123-9673" },
  Indalasa: { phone: "0907-428-2331" },
  Kalasungay: { phone: "0997-290-9279" },
  Kibalabag: { phone: "0906-643-9971" },
  Kulaman: { phone: "0951-651-2948" },
  Laguitas: { phone: "0926-165-3461" },
  Linabo: { phone: "0927-717-8249" },
  "Apo Macote": { phone: "0915-959-4023" },
  Miglamin: { phone: "0905-742-4961" },
  Magsaysay: { phone: "0935-449-1472" },
  Maligaya: { phone: "0967-579-1044" },
  Managok: { phone: "0905-852-4068" },
  Manalog: { phone: "0936-642-9603" },
  Mapayag: { phone: "0965-203-6075" },
  Mapulo: { phone: "0930-271-3881" },
  "Barangay 2": { phone: "0965-602-7012" },
  "Barangay 3": { phone: "0935-588-1855" },
  "Barangay 4": { phone: "0917-136-9083" },
  "Barangay 5": {
    phone: "0965-271-0969",
    email: "malaybalaybarangayfive@gmail.com",
  },
  "Barangay 6": { phone: "0999-226-5502" },
  "Barangay 7": { phone: "0975-330-1128" },
  "Barangay 8": { phone: "0951-692-1915", email: "jnmanghano@gmail.com" },
  "Barangay 9": { phone: "0955-052-3734" },
  "Barangay 10": { phone: "813-5753" },
  "Barangay 11": { phone: "0935-694-5978" },
  "San Jose": { phone: "0906-153-4724" },
  "San Martin": { phone: "0997-105-3911" },
  "Sto. Niño": { phone: "0975-706-1372" },
  Silae: { phone: "0951-888-4839" },
  Sinanglanan: {
    phone: "0953-853-6030",
    email: "sinanglananbarangay@gmail.com",
  },
  Sumpong: { phone: "0936-202-4963" },
  Violeta: { phone: "0955-640-9824" },
  Zamboanguita: { phone: "0985-794-7390" },
};

export const barangays = [
  "Barangay 1",
  "Barangay 2",
  "Barangay 3",
  "Barangay 4",
  "Barangay 5",
  "Barangay 6",
  "Barangay 7",
  "Barangay 8",
  "Barangay 9",
  "Barangay 10",
  "Barangay 11",
  "Aglayan",
  "Apo Macote",
  "Bangcud",
  "Busdi",
  "Cabangahan",
  "Caburacanan",
  "Can-ayan",
  "Capitan Angel",
  "Casisang",
  "Dalwangan",
  "Imbayao",
  "Indalasa",
  "Kalasungay",
  "Kibalabag",
  "Kulaman",
  "Laguitas",
  "Linabo",
  "Magsaysay",
  "Maligaya",
  "Managok",
  "Manalog",
  "Mapayag",
  "Mapulo",
  "Miglamin",
  "Patpat",
  "San Jose",
  "San Martin",
  "Silae",
  "Simaya",
  "Sinanglanan",
  "St. Peter",
  "Sto. Niño",
  "Sumpong",
  "Violeta",
  "Zamboanguita",
] as const;

export const barangayProfiles = barangays.map((name) => ({
  name,
  punongBarangay: barangayLeadership[name],
  phone: barangayContacts[name]?.phone,
  email: barangayContacts[name]?.email,
  source: barangaySource,
  leadershipSource: barangayOfficialsSource,
}));

export type Disclosure = {
  title: string;
  year: number;
  quarter: "Annual" | "Q1" | "Q2" | "Q3" | "Q4";
  category:
    "Budget" | "Procurement" | "Financial" | "Utilization" | "Staffing" | "GAD";
  status: "Source listed" | "Not yet available in verified public sources";
  source: Source;
};

const disclosureSource: Source = {
  label: "City Government of Malaybalay — Full Disclosure",
  url: "https://sakata.malaybalaycity.gov.ph/full-disclosure/",
  verifiedOn: VERIFIED_ON,
};

const annualDisclosureTitles = [
  ["Annual Budget Report", "Budget"],
  ["Annual Procurement Plan", "Procurement"],
] as const;
const quarterlyDisclosureTitles = [
  ["Statement of Indebtedness, Payments and Balances", "Financial"],
  ["Quarterly Statement of Cash Flow", "Financial"],
  ["Local DRRM Fund Utilization", "Utilization"],
  ["Special Education Fund Utilization", "Utilization"],
  ["Unliquidated Cash Advances", "Financial"],
  ["Statement of Receipts and Expenditures", "Financial"],
  ["Trust Fund Utilization", "Utilization"],
  ["Bid Results — Civil Works, Goods, Services and Consulting", "Procurement"],
  ["Manpower Complement", "Staffing"],
  ["20% National Tax Allotment Utilization", "Utilization"],
] as const;

export const disclosures: Disclosure[] = [2026, 2025, 2024, 2023, 2022].flatMap(
  (year) => [
    ...annualDisclosureTitles.map(([title, category]): Disclosure => ({
      title,
      year,
      quarter: "Annual",
      category,
      status: "Source listed",
      source: disclosureSource,
    })),
    ...(["Q1", "Q2", "Q3", "Q4"] as const).flatMap((quarter) =>
      quarterlyDisclosureTitles.map(([title, category]): Disclosure => ({
        title,
        year,
        quarter,
        category,
        status:
          (year === 2026 && (quarter === "Q3" || quarter === "Q4")) ||
          year === 2022
            ? "Not yet available in verified public sources"
            : "Source listed",
        source: disclosureSource,
      })),
    ),
  ],
);

export const services = [
  {
    title: "2024 Citizen’s Charter",
    office: "City Government of Malaybalay",
    description:
      "Official service standards, requirements, processing times and fees published by the city government.",
    url: "https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2025/03/CITIZENS-CHARTER-2024-1.pdf",
    verifiedOn: VERIFIED_ON,
  },
  {
    title: "Transaction Protocol Manual",
    office: "City Government of Malaybalay",
    description:
      "Official reference for transaction procedures and service delivery.",
    url: "https://sakata.malaybalaycity.gov.ph/transaction-protocol-manual/",
    verifiedOn: VERIFIED_ON,
  },
  {
    title: "Office of the Building Official Printables",
    office: "Office of the Building Official",
    description: "Official printable forms for building-related transactions.",
    url: "https://sakata.malaybalaycity.gov.ph/obo-printables/",
    verifiedOn: VERIFIED_ON,
  },
];

export type ServiceCategory =
  "Business and licensing" | "Agriculture" | "Building and construction";

export type PublicService = {
  title: string;
  office: string;
  category: ServiceCategory;
  summary: string;
  source: Source;
};

const serviceSource = (label: string, url: string): Source => ({
  label,
  url,
  verifiedOn: VERIFIED_ON,
});

const businessServiceSource = serviceSource(
  "City Government of Malaybalay — Business Permit Process",
  "https://sakata.malaybalaycity.gov.ph/business-permit-process/",
);
const agricultureServiceSource = serviceSource(
  "City Government of Malaybalay — Agricultural Services",
  "https://sakata.malaybalaycity.gov.ph/agriculture/",
);
const buildingServiceSource = serviceSource(
  "City Government of Malaybalay — OBO Form Templates",
  "https://sakata.malaybalaycity.gov.ph/obo-forms/",
);

export const publicServices: PublicService[] = [
  {
    title: "Business Permit — BOSS January process",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "January Business One-Stop Shop route for a person or entity conducting business within Malaybalay City.",
    source: serviceSource(
      "City Government of Malaybalay — BOSS January Process",
      "https://sakata.malaybalaycity.gov.ph/issuance-of-business-permit-boss-process-every-january/",
    ),
  },
  {
    title: "Business Permit — year-round process",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "Published year-round route for securing a required city business permit outside the January BOSS period.",
    source: serviceSource(
      "City Government of Malaybalay — BOSS All Year Round",
      "https://sakata.malaybalaycity.gov.ph/boss-all-year-round/",
    ),
  },
  {
    title: "Motorela permit",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "Permit route for motorela-for-hire operations; the official listing identifies January 2–31 as the renewal period.",
    source: serviceSource(
      "City Government of Malaybalay — Motorela Permit",
      "https://sakata.malaybalaycity.gov.ph/issuance-of-motorela-permit/",
    ),
  },
  {
    title: "Motorela franchise — new or extension",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "Published application route for a new motorela franchise or an extension before franchise expiry.",
    source: serviceSource(
      "City Government of Malaybalay — Motorela Franchise",
      "https://sakata.malaybalaycity.gov.ph/issuance-of-motorela-franchise/",
    ),
  },
  {
    title: "Motorela confirmation",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "Confirmation identified by the city listing as a requirement for renewal of a motorcycle-for-hire registration with LTO.",
    source: businessServiceSource,
  },
  {
    title: "Dropping of motorela franchise",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "Published route for an operator seeking to formally cease a motorela operation.",
    source: serviceSource(
      "City Government of Malaybalay — Dropping of Motorela Franchise",
      "https://sakata.malaybalaycity.gov.ph/dropping-of-motorela-franchise/",
    ),
  },
  {
    title: "Business-related certificates",
    office: "Business Permits and Licensing Division",
    category: "Business and licensing",
    summary:
      "City-listed service for requesting certificates related to a registered business.",
    source: serviceSource(
      "City Government of Malaybalay — Business Certificates",
      "https://sakata.malaybalaycity.gov.ph/issuance-of-certificates-related-to-business/",
    ),
  },
  {
    title: "Crop and inland-fisheries production support",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "The official page lists seeds, fertilizer, planting materials, supplies, and tilapia or hito fingerling dispersal among available support activities.",
    source: agricultureServiceSource,
  },
  {
    title: "Crop protection support",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "Published activities include crop insurance assistance, pesticide assistance, pest surveillance, and the Bantay Peste Task Force.",
    source: agricultureServiceSource,
  },
  {
    title: "Agricultural laboratory services",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "The city lists soil testing, plant tissue culture, Bio-N mixing, and biological-control laboratory services.",
    source: agricultureServiceSource,
  },
  {
    title: "Agricultural extension and training",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "Published support includes seminars, farmer field schools, technology demonstrations, forums, technical briefings, and school-on-the-air activities.",
    source: agricultureServiceSource,
  },
  {
    title: "Agricultural credit and loan assistance",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "The official listing describes credit-program referrals, farmer certifications and endorsements, and farmer profiling support.",
    source: agricultureServiceSource,
  },
  {
    title: "Farm machinery and agri-infrastructure support",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "Published support areas include farm machinery, processing facilities, irrigation equipment, dams, and canal-lining projects.",
    source: agricultureServiceSource,
  },
  {
    title: "Farmers Information Technology Services",
    office: "City Agriculture Office",
    category: "Agriculture",
    summary:
      "The city lists a FITS information center, field tours, product exhibits, promotions, and Dugang Hatud Serbisyo activities.",
    source: agricultureServiceSource,
  },
  {
    title: "Excavation permit application form",
    office: "Office of the Building Official",
    category: "Building and construction",
    summary:
      "Official spreadsheet template listed by the Office of the Building Official for excavation-permit applications.",
    source: buildingServiceSource,
  },
  {
    title: "Demolition permit application form",
    office: "Office of the Building Official",
    category: "Building and construction",
    summary:
      "Official spreadsheet template listed by the Office of the Building Official for demolition-permit applications.",
    source: buildingServiceSource,
  },
  {
    title: "Building permit application form",
    office: "Office of the Building Official",
    category: "Building and construction",
    summary:
      "Official spreadsheet template listed by the Office of the Building Official for building-permit applications.",
    source: buildingServiceSource,
  },
  {
    title: "OBO title-block guide",
    office: "Office of the Building Official",
    category: "Building and construction",
    summary:
      "Official A3 title-block and permit-stamp guide published for building-plan preparation.",
    source: serviceSource(
      "City Government of Malaybalay — OBO Title Block Guide",
      "https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2025/12/OBO_TITLE-BLOCK-GUIDE_A3-SIZE.pdf",
    ),
  },
];

export const financialSnapshot = {
  period: "2025 Q2",
  currentOperatingIncome: 1_379_878_253.26,
  currentOperatingExpenditures: 744_884_067.15,
  netOperatingBalance: 634_994_186.11,
  netIncreaseInFunds: 592_672_548.65,
  endingCashBalance: 1_985_115_653.86,
  beginningCashBalance: 1_663_277_785.53,
  priorYearAccountsPayable: 149_651_330.82,
  continuingAppropriation: 121_403_558.97,
  savings: null,
  incomeBreakdown: [
    { label: "Internal Revenue Allotment", amount: 1_188_506_575.0 },
    { label: "Business taxes", amount: 81_068_119.92 },
    { label: "Real property tax", amount: 40_992_259.52 },
    { label: "Economic enterprise receipts", amount: 25_386_575.99 },
    { label: "Service and user charges", amount: 15_005_623.48 },
    { label: "Regulatory fees, permits and licenses", amount: 14_832_589.37 },
    { label: "Other taxes", amount: 10_071_575.32 },
    { label: "Other receipts", amount: 3_917_947.83 },
    { label: "Other national tax shares", amount: 96_986.83 },
  ],
  expenditureBreakdown: [
    { label: "General public services", amount: 502_334_483.15 },
    { label: "Social services and social welfare", amount: 110_592_955.81 },
    { label: "Economic services", amount: 87_153_814.08 },
    {
      label: "Health, nutrition and population control",
      amount: 32_937_811.38,
    },
    {
      label: "Education, culture, sports and manpower development",
      amount: 6_871_679.38,
    },
    { label: "Debt-service interest and other charges", amount: 4_993_323.35 },
  ],
  nonOperatingBreakdown: [
    { label: "Other non-operating expenditures", amount: 57_777_076.89 },
    { label: "Debt principal payments", amount: 16_015_697.78 },
    { label: "Capital and investment expenditures", amount: 7_377_841.53 },
  ],
  source: {
    label: "2025 Q2 Statement of Receipts and Expenditures",
    url: "https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2026/09/STATEMENT-OF-RECEIPTS-AND-EXPENDITURES2025-Q2.pdf",
    verifiedOn: VERIFIED_ON,
  } satisfies Source,
};

export type CivicRecord = {
  number: string;
  title: string;
  kind: "Ordinance" | "Executive order" | "Memorandum circular";
  published: string;
  body: string;
  attribution: string;
  attributionLevel: "office" | "institutional" | "unattributed";
  source: Source;
};

const announcementSource = (url: string): Source => ({
  label: "City Government of Malaybalay — Public Announcement",
  url,
  verifiedOn: VERIFIED_ON,
});

export const civicRecords: CivicRecord[] = [
  {
    number: "Executive Order No. 23, Series of 2026",
    title:
      "Energy-saving protocols and fuel-reduction measures in the City Government of Malaybalay",
    kind: "Executive order",
    published: "2026-03-10",
    body: "Office of the City Mayor",
    attribution:
      "Published as a mayoral executive issuance on the City Government website.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-203/",
    ),
  },
  {
    number: "Executive Order No. 19, Series of 2026",
    title: "Project Monitoring and Evaluation Information System (PMEIS)",
    kind: "Executive order",
    published: "2026-03-04",
    body: "Office of the City Mayor",
    attribution:
      "Published as a mayoral executive issuance; the listing attributes it to the office, not as a personal accomplishment.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-19/",
    ),
  },
  {
    number: "Executive Order No. 18, Series of 2026",
    title:
      "Manual of operations on epidemiology and surveillance for Malaybalay City",
    kind: "Executive order",
    published: "2026",
    body: "Office of the City Mayor",
    attribution:
      "Published in the official announcement archive; the page does not expose a more precise publication date.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-18/",
    ),
  },
  {
    number: "Executive Order No. 17, Series of 2026",
    title: "Medical Education Subsidy Committee and its functions",
    kind: "Executive order",
    published: "2026",
    body: "Office of the City Mayor",
    attribution:
      "Published in the official announcement archive; the page does not expose a more precise publication date.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-17/",
    ),
  },
  {
    number: "Executive Order No. 15, Series of 2026",
    title: "Anti-Sexual Harassment Referral Network under the Safe Spaces Act",
    kind: "Executive order",
    published: "2026",
    body: "Office of the City Mayor",
    attribution:
      "Published in the official announcement archive; the page does not expose a more precise publication date.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-15/",
    ),
  },
  {
    number: "Executive Order No. 08, Series of 2026",
    title: "Malaybalay City Task Force Anti-Bora-Bora",
    kind: "Executive order",
    published: "2026",
    body: "Office of the City Mayor",
    attribution:
      "Published in the official announcement archive; the page does not expose a more precise publication date.",
    attributionLevel: "office",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/executive-order-no-08/",
    ),
  },
  {
    number: "Ordinance No. 1118, Series of 2026",
    title:
      "Annual SK Functionality Audit with assessment mechanisms, criteria, incentives, and funding",
    kind: "Ordinance",
    published: "2026-08-18",
    body: "10th Sangguniang Panlungsod",
    attribution:
      "Individual sponsor or author was not identified in the verified public listing.",
    attributionLevel: "institutional",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/ordinance-no-1118-series-of-2026/",
    ),
  },
  {
    number: "Ordinance No. 1092, Series of 2026",
    title:
      "Adoption of the provincial ordinance declaring March as Real Property Tax Month",
    kind: "Ordinance",
    published: "2026-05-19",
    body: "10th Sangguniang Panlungsod",
    attribution:
      "Individual sponsor or author was not identified in the verified public listing.",
    attributionLevel: "institutional",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/ordinance-no-1092-series-of-2026/",
    ),
  },
  {
    number: "Ordinance No. 1095, Series of 2026",
    title:
      "Amendment concerning the automatic fare matrix and pakyaw fare matrix",
    kind: "Ordinance",
    published: "2026-03-25",
    body: "10th Sangguniang Panlungsod",
    attribution:
      "Individual sponsor or author was not identified in the verified public listing.",
    attributionLevel: "institutional",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/ordinance-no-1095-series-of-2026/",
    ),
  },
  {
    number: "Ordinance No. 1083, Series of 2026",
    title:
      "Institutionalization of Ms. Malaybalay with implementing guidelines",
    kind: "Ordinance",
    published: "2026-03-04",
    body: "10th Sangguniang Panlungsod",
    attribution:
      "Individual sponsor or author was not identified in the verified public listing.",
    attributionLevel: "institutional",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/ordinance-no-1083-10th-sangguniang-panlungsod/",
    ),
  },
  {
    number: "Ordinance No. 1077, Series of 2026",
    title: "Search for Model Family Awards in Malaybalay City",
    kind: "Ordinance",
    published: "2026",
    body: "10th Sangguniang Panlungsod",
    attribution:
      "The official listing does not identify an individual sponsor or author.",
    attributionLevel: "institutional",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/ordinance-no-1077/",
    ),
  },
  {
    number: "Memorandum Circular No. 38",
    title: "Official public announcement of Memorandum Circular No. 38",
    kind: "Memorandum circular",
    published: "2026",
    body: "Issuing authority not identified in the page text",
    attribution:
      "The official page provides an image but does not expose enough text to attribute the circular to a current city official.",
    attributionLevel: "unattributed",
    source: announcementSource(
      "https://sakata.malaybalaycity.gov.ph/annoucement-5-23/",
    ),
  },
];

export const governanceHighlights = [
  {
    category: "Institutional initiative",
    year: 2024,
    title: "PRIME-HRM meritocracy and excellence system adopted",
    description:
      "The City Government announced its adoption of the Civil Service Commission’s meritocracy-based human-resource program. This is an institutional initiative, not an award conferred on an elected official.",
    source: {
      label: "Philippine News Agency report",
      url: "https://www.pna.gov.ph/articles/1232936",
      verifiedOn: VERIFIED_ON,
    } satisfies Source,
  },
  {
    category: "City recognition",
    year: 2022,
    title: "Regional Nutrition Awarding Ceremony — Silver Award",
    description:
      "The National Nutrition Council listed the City of Malaybalay as a second-time Silver Award recipient. This is a city-level recognition and is not attributed here to one politician.",
    source: {
      label: "National Nutrition Council",
      url: "https://nnc.gov.ph/mindanao-region/2022-rnac-awardees-41-lgus-bag-circle-of-excellence-award/",
      verifiedOn: VERIFIED_ON,
    } satisfies Source,
  },
];

export const procurementSources = [
  {
    kind: "Record hub",
    title: "BAC awarded-projects hub",
    description:
      "Central BAC page that currently includes dated 2026 bidding opportunities alongside procurement links.",
    coverage: "Mixed record types · verify each linked notice",
    url: "https://sites.google.com/site/malaybalay221/awarded-projects?authuser=0",
  },
  {
    kind: "Award records",
    title: "Infrastructure",
    description:
      "Infrastructure award listings with project titles and links to PhilGEPS notices.",
    coverage: "Page currently leads with 2024 awards",
    url: "https://sites.google.com/site/malaybalay221/awarded-projects/infrastructure",
  },
  {
    kind: "Award records",
    title: "Goods and services",
    description:
      "Award listings for supplies, equipment, medicines, vehicles, and contracted services.",
    coverage: "Page currently includes 2024 and earlier records",
    url: "https://sites.google.com/site/malaybalay221/awarded-projects/goods-and-services",
  },
  {
    kind: "Mixed procurement page",
    title: "Small value procurement",
    description:
      "BAC page labeled for SVP that currently also displays broader 2026 bidding opportunities.",
    coverage: "Mixed record types · verify each linked notice",
    url: "https://sites.google.com/site/malaybalay221/awarded-projects/svp-small-value-procurement",
  },
] as const;

export const publicProjects = [
  {
    title: "Purchase of an ambulance, conversion type II",
    location: "Malaybalay City",
    totalCost: 2_000_000,
    costIncurred: null,
    reportedProgress: "Not stated",
    status:
      "Procurement reported ongoing; the source leaves cost incurred blank, so ₱0 is not asserted as actual spending",
  },
  {
    title:
      "Upgrade of milk-processing technology and systems of DAMAUDARIC",
    location: "Malaybalay City / DOST-10",
    totalCost: 761_004,
    costIncurred: null,
    reportedProgress: "Not stated",
    status:
      "Disbursements reported in process; the source leaves cost incurred blank, so ₱0 is not asserted as actual spending",
  },
  {
    title:
      "Digitized Emergency Tracking Alert System and GEOpindot Mobile Application",
    location: "Malaybalay City / DOST-10",
    totalCost: 2_239_600,
    costIncurred: 2_234_000,
    reportedProgress: "99.75%",
    status: "₱5,600 remaining balance reported",
  },
  {
    title:
      "Bamboo furniture production upgrade for the Sya Sya–Mahalagong Tribal Clan Association",
    location: "Upper Pulangi / DOST-10",
    totalCost: 260_000,
    costIncurred: 229_305,
    reportedProgress: "88.19%",
    status: "₱30,695 balance reported for return to DOST-10",
  },
  {
    title: "Corn production support for Barangay Silae",
    location: "Barangay Silae / DOE-RS",
    totalCost: 500_000,
    costIncurred: 497_000,
    reportedProgress: "99.40%",
    status: "Reported completed in June 2024",
  },
  {
    title: "Egg production project for Barangay Caburacanan",
    location:
      "Title names Caburacanan; source location column says Barangay Silae / DOE-RS",
    totalCost: 500_000,
    costIncurred: 760,
    reportedProgress: "0.15%",
    status: "Disbursements reported in process; source location discrepancy retained",
  },
  {
    title: "Development and upgrade of the swine production center",
    location: "Department of Agriculture",
    totalCost: 3_000_000,
    costIncurred: 2_904_116.95,
    reportedProgress: "96.80%",
    status: "Balance reported as yet to be utilized",
  },
].map((project) => ({
  ...project,
  period: "2025 Q1",
  source: {
    label: "2025 Full Disclosure — Trust Fund Utilization Q1 listing",
    url: "https://sakata.malaybalaycity.gov.ph/full-disclosure/",
    verifiedOn: VERIFIED_ON,
  } satisfies Source,
}));

export const searchableRecords = [
  ...officials.map((item) => ({
    type: "Official",
    title: item.name,
    detail: item.role,
    href: "/government",
  })),
  ...departments.map((item) => ({
    type: "Office",
    title: item.name,
    detail: item.phone ?? "",
    href: "/government?tab=offices",
  })),
  ...barangayProfiles.map((item) => ({
    type: "Barangay",
    title: item.name,
    detail: `Punong Barangay: ${item.punongBarangay}`,
    href: "/barangays",
  })),
  ...civicRecords.map((item) => ({
    type: item.kind,
    title: item.number,
    detail: item.title,
    href: "/government?tab=records",
  })),
  ...publicProjects.map((item) => ({
    type: "Project",
    title: item.title,
    detail: `${item.reportedProgress} reported progress`,
    href: "/government?tab=records",
  })),
  ...governanceHighlights.map((item) => ({
    type: item.category,
    title: item.title,
    detail: item.description,
    href: "/government?tab=records",
  })),
  ...services.map((item) => ({
    type: "Service",
    title: item.title,
    detail: item.office,
    href: "/services",
  })),
];
