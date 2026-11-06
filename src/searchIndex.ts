import { barangayMicrosites } from "./barangayProfiles";
import { bidRecords2026 } from "./bidRecords";
import {
  civicRecords,
  departments,
  disclosures,
  gadResources,
  governanceHighlights,
  officials,
  procurementSources,
  publicProjects,
  services,
  specialBodyOrders,
} from "./data";
import {
  goodsServicesAwardRecords,
  infrastructureAwardRecords,
} from "./procurementRecords";
import { localServicePathways, serviceCategories } from "./serviceCatalog";

export type PortalSearchRecord = {
  type: string;
  title: string;
  detail: string;
  href: string;
  keywords?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const staticPages: PortalSearchRecord[] = [
  {
    type: "Page",
    title: "BetterMC home",
    detail: "Malaybalay public information, weather, services, and city overview",
    href: "/",
  },
  {
    type: "Page",
    title: "Transparency center",
    detail: "Full Disclosure records, finances, procurement, staffing, and utilization",
    href: "/transparency",
  },
  {
    type: "Page",
    title: "Legislation and executive issuances",
    detail: "Ordinances, executive orders, and memorandum circulars",
    href: "/legislation",
  },
  {
    type: "Directory",
    title: "Government officials",
    detail: "Mayor, vice mayor, councilors, and sectoral representatives",
    href: "/government?tab=officials",
  },
  {
    type: "Directory",
    title: "Public offices",
    detail: "City department phone numbers and email addresses",
    href: "/government?tab=offices",
  },
  {
    type: "Emergency",
    title: "Emergency contacts",
    detail: "Malaybalay response, health, police, fire, and social-welfare hotlines",
    href: "/government?tab=hotlines",
  },
  {
    type: "Directory",
    title: "All 46 barangays",
    detail: "Barangay profiles, officials, population, services, projects, and maps",
    href: "/barangays",
  },
  {
    type: "Page",
    title: "Public services",
    detail: "City service standards, forms, office routes, and national service guides",
    href: "/services",
  },
  {
    type: "Page",
    title: "Correction desk",
    detail: "Suggest a correction, report a broken link, or submit a public document",
    href: "/participate",
  },
  {
    type: "Page",
    title: "About BetterMC",
    detail: "Editorial policy, sources, independence, and verification methodology",
    href: "/about",
  },
];

export const portalSearchIndex: PortalSearchRecord[] = [
  ...staticPages,
  ...officials.map((official) => ({
    type: "Official",
    title: official.name,
    detail: `${official.role} · ${official.office.name}`,
    href: `/government?tab=officials&official=${slugify(official.name)}`,
    keywords: [
      official.group,
      ...(official.chairmanships ?? []),
      ...(official.committeeMemberships ?? []),
    ].join(" "),
  })),
  ...departments.map((department) => ({
    type: department.emergency ? "Emergency office" : "Office",
    title: department.name,
    detail: [department.phone, department.email].filter(Boolean).join(" · "),
    href: department.emergency
      ? "/government?tab=hotlines"
      : "/government?tab=offices",
  })),
  ...barangayMicrosites.map((barangay) => ({
    type: "Barangay",
    title: barangay.name,
    detail: `${barangay.classification} barangay · Punong Barangay ${barangay.punongBarangay} · ${barangay.population.toLocaleString("en-PH")} residents`,
    href: `/barangays/${barangay.slug}`,
    keywords: `${barangay.code} barangay hall captain population projects services map`,
  })),
  ...civicRecords.map((record) => ({
    type: record.kind,
    title: record.number,
    detail: record.title,
    href: `/legislation/${slugify(record.number)}`,
    keywords: `${record.body} ${record.attribution} ${record.published}`,
  })),
  ...disclosures.map((record) => ({
    type: `${record.category} record`,
    title: `${record.title} · ${record.year} ${record.quarter}`,
    detail: record.status,
    href: `/transparency/${record.year}/${record.quarter.toLowerCase()}/${slugify(record.title)}`,
    keywords: `full disclosure document download ${record.category}`,
  })),
  ...procurementSources.map((source) => ({
    type: source.kind,
    title: source.title,
    detail: `${source.description} · ${source.coverage}`,
    href: source.path,
    keywords: "BAC procurement bid award notice project PhilGEPS",
  })),
  ...bidRecords2026.map((record) => ({
    type: record.stage,
    title: record.number,
    detail: record.title.replace(/^ITB-\d{4}-\d+\.?\s*/i, ""),
    href:
      record.stage === "Small value procurement"
        ? "/procurement/small-value-procurement"
        : "/procurement/bidding-opportunities",
    keywords: `${record.barangays.join(" ")} BAC ITB 2026 procurement project`,
  })),
  ...infrastructureAwardRecords.map((record) => ({
    type: "Infrastructure award",
    title: record.number,
    detail: record.title,
    href: "/procurement/infrastructure-awards",
    keywords: `${record.year} BAC PhilGEPS award notice project`,
  })),
  ...goodsServicesAwardRecords.map((record) => ({
    type: "Goods and services award",
    title: record.number,
    detail: record.title,
    href: "/procurement/goods-services-awards",
    keywords: `${record.year} BAC PhilGEPS award notice purchase`,
  })),
  ...serviceCategories.map((category) => ({
    type: "Service guide",
    title: category.title,
    detail: category.summary,
    href: `/services/${category.slug}`,
    keywords: `${category.localContext} ${category.subcategories
      .map((subcategory) => subcategory.title)
      .join(" ")}`,
  })),
  ...services.map((service) => ({
    type: "City service",
    title: service.title,
    detail: `${service.office} · ${service.description}`,
    href: "/services",
  })),
  ...localServicePathways.map((service) => ({
    type: "Service pathway",
    title: service.title,
    detail: `${service.office} · ${service.description}`,
    href: service.external ? "/services" : service.href,
  })),
  ...gadResources.map((resource) => ({
    type: "GAD resource",
    title: resource.title,
    detail: resource.kind,
    href: "/services",
    keywords: "gender and development plan budget report ordinance download",
  })),
  ...specialBodyOrders.map((record) => ({
    type: "Special body",
    title: `${record.number} · ${record.title}`,
    detail: "Local special body or committee order",
    href: "/services",
    keywords: "executive order committee council board",
  })),
  ...publicProjects.map((project) => ({
    type: "Project",
    title: project.title,
    detail: `${project.location} · ${project.reportedProgress} reported progress`,
    href: "/government?tab=records",
    keywords: `${project.status} ${project.period}`,
  })),
  ...governanceHighlights.map((highlight) => ({
    type: highlight.category,
    title: highlight.title,
    detail: highlight.description,
    href: "/government?tab=records",
    keywords: `${highlight.year} award recognition initiative`,
  })),
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function searchPortal(query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const tokens = normalizedQuery.split(/\s+/);

  return portalSearchIndex
    .map((record) => {
      const title = normalize(record.title);
      const haystack = normalize(
        `${record.title} ${record.detail} ${record.type} ${record.keywords ?? ""}`,
      );
      if (!tokens.every((token) => haystack.includes(token))) return null;
      const score =
        (title === normalizedQuery ? 100 : 0) +
        (title.startsWith(normalizedQuery) ? 40 : 0) +
        (title.includes(normalizedQuery) ? 20 : 0) +
        (normalize(record.type).includes(normalizedQuery) ? 5 : 0);
      return { record, score };
    })
    .filter((match): match is { record: PortalSearchRecord; score: number } =>
      Boolean(match),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.record.title.localeCompare(right.record.title),
    )
    .map((match) => match.record);
}
