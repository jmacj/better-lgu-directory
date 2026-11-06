export type ServiceSubcategory = {
  title: string;
  slug: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  summary: string;
  localContext: string;
  subcategories: ServiceSubcategory[];
};

const betterGovUrl = (category: string, subcategory?: string) =>
  `https://bettergov.ph/services?category=${category}${
    subcategory ? `&subcategory=${subcategory}` : ""
  }`;

export const betterGovServiceUrl = betterGovUrl;

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "business-trade",
    title: "Business and trade",
    summary: "Registration, intellectual-property guidance, and complaint channels.",
    localContext:
      "For a Malaybalay business permit or local compliance requirement, begin with the City Government Citizen’s Charter and Business Permits and Licensing Office. National registration and intellectual-property services remain with their responsible agencies.",
    subcategories: [
      { title: "Copyright, trademark and patent", slug: "business-copyright-trademark-patent" },
      { title: "Registration, certificates and compliance", slug: "business-registration" },
      { title: "Complaints", slug: "complaints" },
    ],
  },
  {
    slug: "certificates-ids",
    title: "Certificates and IDs",
    summary: "Civil certificates, clearances, and government identification services.",
    localContext:
      "Barangay certificates start with the relevant barangay. City civil-registry records are handled by the City Civil Registry Office; national clearances and IDs use the responsible national agency.",
    subcategories: [
      { title: "Certificates", slug: "certificates" },
      { title: "Clearances", slug: "clearances" },
      { title: "Government IDs", slug: "id" },
    ],
  },
  {
    slug: "contributions",
    title: "Contributions",
    summary: "Benefit registration and salary-loan services from national institutions.",
    localContext:
      "These services are generally administered by national benefit institutions. BetterMC provides the directory path but does not receive contributions, applications, or loan requests.",
    subcategories: [
      { title: "Benefits registration", slug: "benefits-registration" },
      { title: "Salary loans", slug: "salary-loans" },
    ],
  },
  {
    slug: "disaster-weather",
    title: "Disaster and weather",
    summary: "Hazard information, weather updates, and emergency preparation.",
    localContext:
      "For an active incident in Malaybalay, call the city emergency contacts shown in BetterMC. BetterGov links complement, but do not replace, local response channels.",
    subcategories: [
      { title: "Disaster-prone areas", slug: "disaster-prone-areas" },
      { title: "Weather", slug: "weather" },
    ],
  },
  {
    slug: "education",
    title: "Education",
    summary: "Financial assistance, professional services, and research support.",
    localContext:
      "City scholarship or educational-assistance inquiries should be checked against the current Citizen’s Charter. Professional and research services may be administered by national agencies.",
    subcategories: [
      { title: "Financial assistance", slug: "financial-assistance" },
      { title: "Professionals", slug: "professionals" },
      { title: "Research and proposals", slug: "research-proposal" },
    ],
  },
  {
    slug: "employment",
    title: "Employment",
    summary: "Professional, salary-loan, and worker-organization services.",
    localContext:
      "Local employment assistance may be routed through the appropriate city office. Professional regulation, salary loans, and union registration remain with their responsible national institutions.",
    subcategories: [
      { title: "Professionals", slug: "professionals" },
      { title: "Salary loans", slug: "salary-loans" },
      { title: "Union and association services", slug: "union-association" },
    ],
  },
  {
    slug: "health",
    title: "Health",
    summary: "Assistance, public-health programs, and health research resources.",
    localContext:
      "For city health and dental services, contact the Malaybalay City Health Office. BetterGov also indexes national health programs and assistance channels.",
    subcategories: [
      { title: "Financial assistance", slug: "financial-assistance" },
      { title: "Health programs", slug: "health-programs" },
      { title: "Health research", slug: "health-research" },
    ],
  },
  {
    slug: "housing",
    title: "Housing",
    summary: "Housing finance and land-title information.",
    localContext:
      "City-level housing and relocation concerns should be confirmed with the appropriate Malaybalay office. Housing loans and land-title transactions may require national agencies.",
    subcategories: [
      { title: "Housing loans", slug: "housing-loans" },
      { title: "Land titles", slug: "land-titles" },
    ],
  },
  {
    slug: "passport-travel",
    title: "Passport and travel",
    summary: "Travel, visa, citizenship, and passport-related pathways.",
    localContext:
      "Passport, visa, and citizenship services are not city-government transactions. Use the national service link to identify the responsible agency and current requirements.",
    subcategories: [
      { title: "Travel", slug: "travel" },
      { title: "Visa and citizenship", slug: "visa-citizenship" },
    ],
  },
  {
    slug: "social-services",
    title: "Social services",
    summary: "Benefits, complaints, assistance, and social-protection pathways.",
    localContext:
      "Malaybalay residents may begin with the City Social Welfare and Development Office for local assistance and referral. National benefits use their responsible institutions.",
    subcategories: [
      { title: "Benefits registration", slug: "benefits-registration" },
      { title: "File complaints", slug: "file-complaints" },
      { title: "Salary loans", slug: "salary-loans" },
    ],
  },
  {
    slug: "tax",
    title: "Tax",
    summary: "Calculators, certificates, registration, and tax-service gateways.",
    localContext:
      "Real-property and local business taxes are city transactions. National tax registration, certificates, and calculators are administered through national revenue services.",
    subcategories: [
      { title: "Calculators", slug: "calculator" },
      { title: "Certificates", slug: "certificates" },
      { title: "Registration", slug: "register" },
    ],
  },
  {
    slug: "transport-driving",
    title: "Transport and driving",
    summary: "Licensing, assistance, and transport-complaint channels.",
    localContext:
      "Malaybalay motorela permits and franchises are city transactions. Driver licensing and national transport complaints use the responsible national agency.",
    subcategories: [
      { title: "Financial assistance", slug: "financial-assistance" },
      { title: "Licences", slug: "license" },
      { title: "Transport complaints", slug: "transport-complaints" },
    ],
  },
];

export const localServicePathways = [
  {
    title: "Business permits and local compliance",
    office: "Business Permits and Licensing Office",
    description:
      "Check requirements, processing steps, fees, and the responsible office before beginning a local business transaction.",
    href: "https://sakata.malaybalaycity.gov.ph/citizens-charter/",
    external: true,
  },
  {
    title: "Civil registry and certificates",
    office: "City Civil Registry Office",
    description:
      "Find the published city contact, then confirm the correct record, documentary requirements, and release process.",
    href: "/government?tab=offices",
    external: false,
  },
  {
    title: "Health and dental assistance",
    office: "City Health Office",
    description:
      "Use the published office and emergency channels for public-health, dental, and referral inquiries.",
    href: "/government?tab=offices",
    external: false,
  },
  {
    title: "Social welfare and assistance",
    office: "City Social Welfare and Development Office",
    description:
      "Confirm assistance programs, eligibility, documents, and referral routes with the responsible city office.",
    href: "/government?tab=offices",
    external: false,
  },
  {
    title: "Building forms and permits",
    office: "Office of the Building Official",
    description:
      "Open the city’s printable forms and verify the current submission process before filing.",
    href: "https://sakata.malaybalaycity.gov.ph/obo-printables/",
    external: true,
  },
  {
    title: "Emergency and incident response",
    office: "Citywide response offices",
    description:
      "Call the appropriate Malaybalay response office and provide your barangay, landmark, and callback number.",
    href: "/government?tab=hotlines",
    external: false,
  },
] as const;
