export const VERIFIED_ON = '2026-11-04'

export type Source = {
  label: string
  url: string
  verifiedOn: string
}

export type Official = {
  name: string
  role: string
  group: 'Executive' | 'Legislative' | 'Sectoral'
  source: Source
}

const legislativeSource: Source = {
  label: 'City Government of Malaybalay — Legislative',
  url: 'https://sakata.malaybalaycity.gov.ph/legislative/',
  verifiedOn: VERIFIED_ON,
}

const executiveSource: Source = {
  label: 'City Government of Malaybalay — Executive',
  url: 'https://sakata.malaybalaycity.gov.ph/executive/',
  verifiedOn: VERIFIED_ON,
}

export const officials: Official[] = [
  { name: 'Jay Warren R. Pabillaran', role: 'City Mayor', group: 'Executive', source: executiveSource },
  { name: 'Estelito “Litoy” R. Marabe', role: 'City Vice Mayor', group: 'Executive', source: legislativeSource },
  ...[
    'Jason Chad J. Ayala',
    'Brian Nelson T. Flores',
    'Rendon P. Sangalang',
    'Niko P. Aldeguer',
    'Kathleen Cecille C. Pagaling',
    'Alan Ryann O. Legaspi',
    'Erwin A. Damasco',
    'Flaviano T. Gapol, Jr.',
    'Zoltan Dindo D. Dinlayan',
    'Cromwell Kiril D. Dinlayan',
  ].map((name): Official => ({ name, role: 'City Councilor', group: 'Legislative', source: legislativeSource })),
  { name: 'Julius N. Manghano', role: 'ABC President', group: 'Sectoral', source: legislativeSource },
  { name: 'Datu Sumbongan', role: 'Indigenous Peoples Mandatory Representative', group: 'Sectoral', source: legislativeSource },
  { name: 'Christopher Tortola', role: 'SK Federation President', group: 'Sectoral', source: legislativeSource },
]

export type Department = {
  name: string
  phone?: string
  email?: string
  emergency?: boolean
  source: Source
}

const contactSource: Source = {
  label: 'City Government of Malaybalay — Contact Us',
  url: 'https://sakata.malaybalaycity.gov.ph/contact-us/',
  verifiedOn: VERIFIED_ON,
}

export const departments: Department[] = [
  ['Bids and Awards Committee', '0967-016-9677', 'bacmalaybalay@gmail.com'],
  ['Business Permits and Licensing Division', '0926-833-0696', 'malaybalaycitylicensing@gmail.com'],
  ['City Accounting Office', '(088) 813-4726 local 110', 'cacco.malaybalay@gmail.com'],
  ['City Administrator’s Office', '0917-188-4225', 'imalaybalay.8700@gmail.com'],
  ['City Agriculture Office', '0994-957-6384', 'mlyblyagri2023@gmail.com'],
  ['City Assessor’s Office', '0916-335-5178', 'cassomalaybalay@gmail.com'],
  ['City Budget Office', '(088) 813-4726 local 112', 'cbomlybly@gmail.com'],
  ['City Civil Registry Office', '0906-616-4009', 'malaybalayccro@gmail.com'],
  ['City Disaster Risk Reduction and Management Office', '0917-827-6117', 'malaybalaycitydrrmo@gmail.com', true],
  ['City Economic Enterprise Development and Management Office', '0935-740-5424', 'ceedmomalaybalaycity@gmail.com'],
  ['City Engineering Office', '(088) 813-1695', 'cgm.ceo.nada@gmail.com'],
  ['City Environment and Natural Resources Office', '0997-790-0290', 'infoserve.cityenroffice19@gmail.com'],
  ['City General Services Office', '0935-750-5371', 'malaybalaycgso@gmail.com'],
  ['City Health Office', '0965-094-9105', 'cho.malaybly@gmail.com', true],
  ['City Human Resource Management Office', '0975-601-2867', 'malaybalaychrmo@gmail.com'],
  ['City Legal Office', '0916-414-7427', 'clo8134706@gmail.com'],
  ['City Mayor’s Office', '0953-459-1777', 'malaybalaycitylgu@gmail.com'],
  ['City Planning and Development Office', '0917-110-7717', 'cpdomalaybalay@gmail.com'],
  ['City Social Welfare and Development Office', '0953-385-2277', 'swmlycty@yahoo.com', true],
  ['City Treasurer’s Office', '0997-452-5920', 'citytreasurermalaybalay@gmail.com'],
  ['City Tourism Division', '0997-850-4913', 'malaybalaycity_tourism@gmail.com'],
  ['City Urban Development and Housing Office', '0953-459-7782', 'city8700housing@gmail.com'],
  ['City Veterinary Office', '0926-198-6992', 'citymalaybalay@gmail.com'],
  ['City Vice Mayor’s Office', '0917-128-8087', 'spmarabe@gmail.com'],
  ['Office of the Building Official', '0917-152-6618', 'obo.malaybalay@gmail.com'],
  ['Office of the Sangguniang Panlungsod', '0917-497-6861', 'spmalaybalaycity@gmail.com'],
  ['Public Employment Service Office', '0915-542-3434', 'pesomalaybalaycity@gmail.com'],
  ['Traffic Management Center', '0936-829-4691', 'tmcmalaybalay2014@gmail.com', true],
  ['Bureau of Fire Protection — Malaybalay', '0917-677-7700', 'malaybalaycfs@gmail.com', true],
  ['Malaybalay City Police Station', '0926-821-8803', 'malaybalay.cps.pnp@gmail.com', true],
].map(([name, phone, email, emergency]) => ({
  name: String(name),
  phone: String(phone),
  email: String(email),
  emergency: Boolean(emergency),
  source: contactSource,
}))

const barangaySource: Source = {
  label: 'City Government of Malaybalay — List of Barangays',
  url: 'https://sakata.malaybalaycity.gov.ph/list-of-barangay/',
  verifiedOn: VERIFIED_ON,
}

const barangayOfficialsSource: Source = {
  label: 'DILG Barangay Officials Directory',
  url: 'https://www.dilg.gov.ph/barangay-officials-directory/index',
  verifiedOn: VERIFIED_ON,
}

const barangayLeadership = {
  Aglayan: 'Glorio D. Sajulga', Bangcud: 'Rosa Maria M. Robosa', Busdi: 'Bernard L. Dumala',
  Cabangahan: 'Edwin L. Rara', Caburacanan: 'Joven L. Salonga', 'Can-ayan': 'Yorita C. Cajardo',
  'Capitan Angel': 'Marjun S. Mancila', Casisang: 'Gregorio D. Jaroy', Dalwangan: 'Royville C. Pasco',
  Imbayao: 'Jean T. Maputi', Indalasa: 'Erwen J. Sunog', Kalasungay: 'Rodrigo O. Niere',
  Kibalabag: 'Jerry S. Sulinay', Kulaman: 'Cyrus S. Torpio', Laguitas: 'Rosanna Linhay',
  Patpat: 'Renante M. Okit', Linabo: 'Manuel M. Evangelista Sr.', 'Apo Macote': 'Vicente H. Leono',
  Miglamin: 'Alfonso P. Inocando', Magsaysay: 'Benjamin O. Torcende Jr.', Maligaya: 'Adelina B. Perez',
  Managok: 'Aries Vincent B. Jurolan', Manalog: 'Ronio S. Lagunday', Mapayag: 'Conrado L. Sungkit Jr.',
  Mapulo: 'Joylyn C. Atchame', 'Barangay 1': 'Gleendale V. Belderol', 'Barangay 2': 'Vinci A. Melendez',
  'Barangay 3': 'Lyzander Cedric D. Maandig', 'Barangay 4': 'Crispin G. Pepito',
  'Barangay 5': 'Rumel C. Castilla', 'Barangay 6': 'Manuel L. Sicalan III',
  'Barangay 7': 'Rodrigo V. Ramos', 'Barangay 8': 'Julius N. Manghano',
  'Barangay 9': 'Dexter Maxileo P. Gamo', 'Barangay 10': 'Nilo Q. Salga',
  'Barangay 11': 'Emilio R. Cid', 'St. Peter': 'Domingo D. Hingpit', 'San Jose': 'Bebina M. Kee',
  'San Martin': 'Sergio C. Fiel', 'Sto. Niño': 'Felix P. Gerongano Jr.', Silae: 'Dovit G. Dela Mance',
  Simaya: 'Nimfa V. Bautista', Sinanglanan: 'Nilo P. Aldeguer', Sumpong: 'Velemar M. Ricarte',
  Violeta: 'Efren S. Omallao', Zamboanguita: 'Pio Q. Masipequiña',
} as const

const barangayContacts: Partial<Record<keyof typeof barangayLeadership, { phone?: string, email?: string }>> = {
  Aglayan: { phone: '088-314-1504', email: 'dusajulga@yahoo.com' },
  Bangcud: { phone: '0975-884-6584' }, Cabangahan: { phone: '0905-616-1114' },
  Caburacanan: { phone: '0970-037-1336' }, 'Can-ayan': { phone: '0977-654-3211' },
  'Capitan Angel': { phone: '0936-212-4043', email: 'jhungmansila@gmail.com' },
  Casisang: { phone: '088-813-1357', email: 'lgubrgycasisang@gmail.com' },
  Dalwangan: { phone: '0960-220-7343', email: 'proyville17@yahoo.com' },
  Imbayao: { phone: '0935-123-9673' }, Indalasa: { phone: '0907-428-2331' },
  Kalasungay: { phone: '0997-290-9279' }, Kibalabag: { phone: '0906-643-9971' },
  Kulaman: { phone: '0951-651-2948' }, Laguitas: { phone: '0926-165-3461' },
  Linabo: { phone: '0927-717-8249' }, 'Apo Macote': { phone: '0915-959-4023' },
  Miglamin: { phone: '0905-742-4961' }, Magsaysay: { phone: '0935-449-1472' },
  Maligaya: { phone: '0967-579-1044' }, Managok: { phone: '0905-852-4068' },
  Manalog: { phone: '0936-642-9603' }, Mapayag: { phone: '0965-203-6075' },
  Mapulo: { phone: '0930-271-3881' }, 'Barangay 2': { phone: '0965-602-7012' },
  'Barangay 3': { phone: '0935-588-1855' }, 'Barangay 4': { phone: '0917-136-9083' },
  'Barangay 5': { phone: '0965-271-0969', email: 'malaybalaybarangayfive@gmail.com' },
  'Barangay 6': { phone: '0999-226-5502' }, 'Barangay 7': { phone: '0975-330-1128' },
  'Barangay 8': { phone: '0951-692-1915', email: 'jnmanghano@gmail.com' },
  'Barangay 9': { phone: '0955-052-3734' }, 'Barangay 10': { phone: '813-5753' },
  'Barangay 11': { phone: '0935-694-5978' }, 'San Jose': { phone: '0906-153-4724' },
  'San Martin': { phone: '0997-105-3911' }, 'Sto. Niño': { phone: '0975-706-1372' },
  Silae: { phone: '0951-888-4839' }, Sinanglanan: { phone: '0953-853-6030', email: 'sinanglananbarangay@gmail.com' },
  Sumpong: { phone: '0936-202-4963' }, Violeta: { phone: '0955-640-9824' },
  Zamboanguita: { phone: '0985-794-7390' },
}

export const barangays = [
  'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6',
  'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Aglayan',
  'Apo Macote', 'Bangcud', 'Busdi', 'Cabangahan', 'Caburacanan', 'Can-ayan', 'Capitan Angel',
  'Casisang', 'Dalwangan', 'Imbayao', 'Indalasa', 'Kalasungay', 'Kibalabag', 'Kulaman',
  'Laguitas', 'Linabo', 'Magsaysay', 'Maligaya', 'Managok', 'Manalog', 'Mapayag', 'Mapulo',
  'Miglamin', 'Patpat', 'San Jose', 'San Martin', 'Silae', 'Simaya', 'Sinanglanan', 'St. Peter',
  'Sto. Niño', 'Sumpong', 'Violeta', 'Zamboanguita',
] as const

export const barangayProfiles = barangays.map((name) => ({
  name,
  punongBarangay: barangayLeadership[name],
  phone: barangayContacts[name]?.phone,
  email: barangayContacts[name]?.email,
  source: barangaySource,
  leadershipSource: barangayOfficialsSource,
}))

export type Disclosure = {
  title: string
  year: number
  quarter: 'Annual' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  category: 'Budget' | 'Procurement' | 'Financial' | 'Utilization' | 'Staffing' | 'GAD'
  status: 'Source listed' | 'Not yet available in verified public sources'
  source: Source
}

const disclosureSource: Source = {
  label: 'City Government of Malaybalay — Full Disclosure',
  url: 'https://sakata.malaybalaycity.gov.ph/full-disclosure/',
  verifiedOn: VERIFIED_ON,
}

const annualDisclosureTitles = [
  ['Annual Budget Report', 'Budget'],
  ['Annual Procurement Plan', 'Procurement'],
] as const
const quarterlyDisclosureTitles = [
  ['Statement of Indebtedness, Payments and Balances', 'Financial'],
  ['Quarterly Statement of Cash Flow', 'Financial'],
  ['Local DRRM Fund Utilization', 'Utilization'],
  ['Special Education Fund Utilization', 'Utilization'],
  ['Unliquidated Cash Advances', 'Financial'],
  ['Statement of Receipts and Expenditures', 'Financial'],
  ['Trust Fund Utilization', 'Utilization'],
  ['Bid Results — Civil Works, Goods, Services and Consulting', 'Procurement'],
  ['Manpower Complement', 'Staffing'],
  ['20% National Tax Allotment Utilization', 'Utilization'],
] as const

export const disclosures: Disclosure[] = [2026, 2025, 2024, 2023, 2022].flatMap((year) => [
  ...annualDisclosureTitles.map(([title, category]): Disclosure => ({
    title, year, quarter: 'Annual', category, status: 'Source listed', source: disclosureSource,
  })),
  ...(['Q1', 'Q2', 'Q3', 'Q4'] as const).flatMap((quarter) =>
    quarterlyDisclosureTitles.map(([title, category]): Disclosure => ({
      title, year, quarter, category,
      status: (year === 2026 && (quarter === 'Q3' || quarter === 'Q4')) || year === 2022
        ? 'Not yet available in verified public sources'
        : 'Source listed',
      source: disclosureSource,
    })),
  ),
])

export const services = [
  {
    title: '2024 Citizen’s Charter',
    office: 'City Government of Malaybalay',
    description: 'Official service standards, requirements, processing times and fees published by the city government.',
    url: 'https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2025/03/CITIZENS-CHARTER-2024-1.pdf',
    verifiedOn: VERIFIED_ON,
  },
  {
    title: 'Transaction Protocol Manual',
    office: 'City Government of Malaybalay',
    description: 'Official reference for transaction procedures and service delivery.',
    url: 'https://sakata.malaybalaycity.gov.ph/transaction-protocol-manual/',
    verifiedOn: VERIFIED_ON,
  },
  {
    title: 'Office of the Building Official Printables',
    office: 'Office of the Building Official',
    description: 'Official printable forms for building-related transactions.',
    url: 'https://sakata.malaybalaycity.gov.ph/obo-printables/',
    verifiedOn: VERIFIED_ON,
  },
]

export const financialSnapshot = {
  period: '2025 Q2',
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
    { label: 'Internal Revenue Allotment', amount: 1_188_506_575.00 },
    { label: 'Business taxes', amount: 81_068_119.92 },
    { label: 'Real property tax', amount: 40_992_259.52 },
    { label: 'Economic enterprise receipts', amount: 25_386_575.99 },
    { label: 'Service and user charges', amount: 15_005_623.48 },
    { label: 'Regulatory fees, permits and licenses', amount: 14_832_589.37 },
    { label: 'Other taxes', amount: 10_071_575.32 },
    { label: 'Other receipts', amount: 3_917_947.83 },
    { label: 'Other national tax shares', amount: 96_986.83 },
  ],
  expenditureBreakdown: [
    { label: 'General public services', amount: 502_334_483.15 },
    { label: 'Social services and social welfare', amount: 110_592_955.81 },
    { label: 'Economic services', amount: 87_153_814.08 },
    { label: 'Health, nutrition and population control', amount: 32_937_811.38 },
    { label: 'Education, culture, sports and manpower development', amount: 6_871_679.38 },
    { label: 'Debt-service interest and other charges', amount: 4_993_323.35 },
  ],
  nonOperatingBreakdown: [
    { label: 'Other non-operating expenditures', amount: 57_777_076.89 },
    { label: 'Debt principal payments', amount: 16_015_697.78 },
    { label: 'Capital and investment expenditures', amount: 7_377_841.53 },
  ],
  source: {
    label: '2025 Q2 Statement of Receipts and Expenditures',
    url: 'https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2026/09/STATEMENT-OF-RECEIPTS-AND-EXPENDITURES2025-Q2.pdf',
    verifiedOn: VERIFIED_ON,
  } satisfies Source,
}

export type CivicRecord = {
  number: string
  title: string
  kind: 'Ordinance' | 'Executive order'
  published: string
  body: string
  attribution: string
  source: Source
}

const announcementSource = (url: string): Source => ({
  label: 'City Government of Malaybalay — Public Announcement',
  url,
  verifiedOn: VERIFIED_ON,
})

export const civicRecords: CivicRecord[] = [
  {
    number: 'Executive Order No. 23, Series of 2026',
    title: 'Energy-saving protocols and fuel-reduction measures in the City Government of Malaybalay',
    kind: 'Executive order', published: '2026-03-10', body: 'Office of the City Mayor',
    attribution: 'Published as a mayoral executive issuance on the City Government website.',
    source: announcementSource('https://sakata.malaybalaycity.gov.ph/category/public-annoucement/'),
  },
  {
    number: 'Ordinance No. 1118, Series of 2026',
    title: 'Annual SK Functionality Audit with assessment mechanisms, criteria, incentives, and funding',
    kind: 'Ordinance', published: '2026-08-18', body: '10th Sangguniang Panlungsod',
    attribution: 'Individual sponsor or author was not identified in the verified public listing.',
    source: announcementSource('https://sakata.malaybalaycity.gov.ph/category/public-annoucement/'),
  },
  {
    number: 'Ordinance No. 1092, Series of 2026',
    title: 'Adoption of the provincial ordinance declaring March as Real Property Tax Month',
    kind: 'Ordinance', published: '2026-05-19', body: '10th Sangguniang Panlungsod',
    attribution: 'Individual sponsor or author was not identified in the verified public listing.',
    source: announcementSource('https://sakata.malaybalaycity.gov.ph/ordinance-no-1092-series-of-2026/'),
  },
  {
    number: 'Ordinance No. 1095, Series of 2026',
    title: 'Amendment concerning the automatic fare matrix and pakyaw fare matrix',
    kind: 'Ordinance', published: '2026-03-25', body: '10th Sangguniang Panlungsod',
    attribution: 'Individual sponsor or author was not identified in the verified public listing.',
    source: announcementSource('https://sakata.malaybalaycity.gov.ph/ordinance-no-1095-series-of-2026/'),
  },
  {
    number: 'Ordinance No. 1083, Series of 2026',
    title: 'Institutionalization of Ms. Malaybalay with implementing guidelines',
    kind: 'Ordinance', published: '2026-03-04', body: '10th Sangguniang Panlungsod',
    attribution: 'Individual sponsor or author was not identified in the verified public listing.',
    source: announcementSource('https://sakata.malaybalaycity.gov.ph/ordinance-no-1083-10th-sangguniang-panlungsod/'),
  },
]

export const governanceHighlights = [
  {
    category: 'Institutional initiative', year: 2024,
    title: 'PRIME-HRM meritocracy and excellence system adopted',
    description: 'The City Government announced its adoption of the Civil Service Commission’s meritocracy-based human-resource program. This is an institutional initiative, not an award conferred on an elected official.',
    source: { label: 'Philippine News Agency report', url: 'https://www.pna.gov.ph/articles/1232936', verifiedOn: VERIFIED_ON } satisfies Source,
  },
  {
    category: 'City recognition', year: 2022,
    title: 'Regional Nutrition Awarding Ceremony — Silver Award',
    description: 'The National Nutrition Council listed the City of Malaybalay as a second-time Silver Award recipient. This is a city-level recognition and is not attributed here to one politician.',
    source: { label: 'National Nutrition Council', url: 'https://nnc.gov.ph/mindanao-region/2022-rnac-awardees-41-lgus-bag-circle-of-excellence-award/', verifiedOn: VERIFIED_ON } satisfies Source,
  },
]

export const procurementSources = [
  {
    kind: 'Record hub',
    title: 'BAC awarded-projects hub',
    description: 'Central BAC page that currently includes dated 2026 bidding opportunities alongside procurement links.',
    coverage: 'Mixed record types · verify each linked notice',
    url: 'https://sites.google.com/site/malaybalay221/awarded-projects?authuser=0',
  },
  {
    kind: 'Award records',
    title: 'Infrastructure',
    description: 'Infrastructure award listings with project titles and links to PhilGEPS notices.',
    coverage: 'Page currently leads with 2024 awards',
    url: 'https://sites.google.com/site/malaybalay221/awarded-projects/infrastructure',
  },
  {
    kind: 'Award records',
    title: 'Goods and services',
    description: 'Award listings for supplies, equipment, medicines, vehicles, and contracted services.',
    coverage: 'Page currently includes 2024 and earlier records',
    url: 'https://sites.google.com/site/malaybalay221/awarded-projects/goods-and-services',
  },
  {
    kind: 'Mixed procurement page',
    title: 'Small value procurement',
    description: 'BAC page labeled for SVP that currently also displays broader 2026 bidding opportunities.',
    coverage: 'Mixed record types · verify each linked notice',
    url: 'https://sites.google.com/site/malaybalay221/awarded-projects/svp-small-value-procurement',
  },
] as const

export const publicProjects = [
  {
    title: 'Digitized Emergency Tracking Alert System and GEOpindot Mobile Application',
    location: 'Malaybalay City / DOST-10', totalCost: 2_239_600, costIncurred: 2_234_000,
    reportedProgress: '99.75%', status: '₱5,600 remaining balance reported',
  },
  {
    title: 'Bamboo furniture production upgrade for the Sya Sya–Mahalagong Tribal Clan Association',
    location: 'Upper Pulangi / DOST-10', totalCost: 260_000, costIncurred: 229_305,
    reportedProgress: '88.19%', status: '₱30,695 balance reported for return to DOST-10',
  },
  {
    title: 'Corn production support for Barangay Silae',
    location: 'Barangay Silae / DOE-RS', totalCost: 500_000, costIncurred: 497_000,
    reportedProgress: '99.40%', status: 'Reported completed in June 2024',
  },
  {
    title: 'Development and upgrade of the swine production center',
    location: 'Department of Agriculture', totalCost: 3_000_000, costIncurred: 2_904_116.95,
    reportedProgress: '96.80%', status: 'Balance reported as yet to be utilized',
  },
].map((project) => ({
  ...project,
  period: '2025 Q1',
  source: {
    label: '2025 Q1 Consolidated Quarterly Report on Government Projects, Programs or Activities',
    url: 'https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2026/01/Q1_Trust_Fund_Utilization.pdf',
    verifiedOn: VERIFIED_ON,
  } satisfies Source,
}))

export const searchableRecords = [
  ...officials.map((item) => ({ type: 'Official', title: item.name, detail: item.role, href: '/government' })),
  ...departments.map((item) => ({ type: 'Office', title: item.name, detail: item.phone ?? '', href: '/government?tab=offices' })),
  ...barangayProfiles.map((item) => ({ type: 'Barangay', title: item.name, detail: `Punong Barangay: ${item.punongBarangay}`, href: '/barangays' })),
  ...civicRecords.map((item) => ({ type: item.kind, title: item.number, detail: item.title, href: '/government?tab=records' })),
  ...publicProjects.map((item) => ({ type: 'Project', title: item.title, detail: `${item.reportedProgress} reported progress`, href: '/government?tab=records' })),
  ...governanceHighlights.map((item) => ({ type: item.category, title: item.title, detail: item.description, href: '/government?tab=records' })),
  ...services.map((item) => ({ type: 'Service', title: item.title, detail: item.office, href: '/services' })),
]
