# BetterMC research inventory

Research review date: **2026-11-05 (Asia/Manila)**

## Primary official sources reviewed

| Area | Official source | What was verified | Current implementation boundary |
| --- | --- | --- | --- |
| Full Disclosure | [Malaybalay Full Disclosure](https://sakata.malaybalaycity.gov.ph/full-disclosure/) | Years 2022–2026; annual budget and procurement; quarterly financial, utilization, bid-result, and staffing categories | Catalog implemented. The 2025 Q2 Statement of Receipts and Expenditures is transcribed separately with accounting labels preserved. |
| Legislative leadership | [Legislative](https://sakata.malaybalaycity.gov.ph/legislative/) and the 14 linked individual profile pages | Vice mayor, ten councilors, ABC president, IPMR, and SK federation president | Searchable, expandable directory implemented. The individual pages establish officeholder identity but do not expose a sponsor-authored measure ledger. |
| Executive | [Executive](https://sakata.malaybalaycity.gov.ph/executive/) | City mayor identity in the official city-government section | Profile listing implemented without an unverified term date. |
| Offices | [Departments / Offices](https://sakata.malaybalaycity.gov.ph/departments-offices/) and [Contact Us](https://sakata.malaybalaycity.gov.ph/contact-us/) | Office names, published telephone/mobile numbers, and emails | Searchable office and hotline directory implemented. Contact details should be rechecked quarterly. |
| Barangays | [City barangay list](https://sakata.malaybalaycity.gov.ph/list-of-barangay/) and [DILG Barangay Officials Directory](https://www.dilg.gov.ph/barangay-officials-directory/index) | 46 barangay names, DILG-listed Punong Barangay names, and available public contact fields | Valid published contacts are shown. Incomplete or malformed contact values are withheld and labeled unavailable. |
| Services | [2024 Citizen's Charter](https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2025/03/CITIZENS-CHARTER-2024-1.pdf) | Official service-standard PDF and city service entry points | Direct official entry points implemented. Service-by-service transcription remains a later verified-data task. |
| Finances | [2025 Q2 Statement of Receipts and Expenditures](https://sakata.malaybalaycity.gov.ph/wp-content/uploads/2026/09/STATEMENT-OF-RECEIPTS-AND-EXPENDITURES2025-Q2.pdf) | Operating income, sector spending, non-operating spending, fund movement, and cash balances | Detailed landing-page breakdown implemented. The reported net operating balance is not relabeled as savings. |
| Measures | [Public Announcements](https://sakata.malaybalaycity.gov.ph/category/public-annoucement/) pages 1–2 | Six 2026 executive orders, five 2026 ordinances, and Memorandum Circular No. 38 | Executive orders are attributed to the Mayor's Office, ordinances to the council, and the memorandum remains unattributed because its page does not identify the issuing authority in accessible text. |
| Projects | [Full Disclosure](https://sakata.malaybalaycity.gov.ph/full-disclosure/) — 2025 Trust Fund Utilization Q1 | Reported costs, cost incurred, progress, and remarks for selected projects | Values are presented as 2025 Q1 reported status, not current completion or personal achievements. The former direct PDF target returned 404 on 2026-11-05, so the live official catalog is used. |
| Recognition | [National Nutrition Council](https://nnc.gov.ph/mindanao-region/2022-rnac-awardees-41-lgus-bag-circle-of-excellence-award/) and [Philippine News Agency](https://www.pna.gov.ph/articles/1232936) | City-level nutrition recognition and adoption of PRIME-HRM | Recipient scope is explicit; institutional records are not converted into personal awards. |
| Imagery | User-supplied Malaybalay City Hall panorama | Recognizable City Hall panorama supplied for the project | A softened, optimized WebP derivative is used as a decorative hero background; the former tourism carousel was removed. |

## Technical references

- [BetterLosBaños repository](https://github.com/BetterLosBanos/betterlb): React/Vite/TypeScript, Cloudflare Pages Functions, modular structured data, D1 migrations, search, maps, and testing patterns.
- [BetterGov LGU directory](https://lgu.bettergov.ph/): Better LGU independence, contribution, attribution, and maintenance conventions.

## Data integrity decisions

- A document title visible on Full Disclosure is recorded as **Source listed**, not “verified complete.”
- Financial visualizations use figures extracted from one named reporting document and retain the reporting period.
- No project, supplier, contractor, expenditure, attendance, voting record, or performance score is inferred.
- Contact details preserve the official source and review date because they can change.
- Invalid DILG contact strings such as incomplete mobile numbers are treated as unavailable rather than repaired by assumption.

## Source conflicts and quality notes

- Some official pages show repeated or inconsistent contact values. The contact page was preferred because it is the dedicated directory, while every displayed value retains that page as its source.
- The source uses both “Sangguniang Panglungsod” and “Sangguniang Panlungsod.” BetterMC uses the standard “Panlungsod” in interface copy without changing source titles.
- Full Disclosure controls sometimes reuse the same link target or depend on page scripting. BetterMC currently links to the official catalog rather than claiming a direct PDF URL that could not be independently resolved.
- On 2026-11-05, the official `sakata.malaybalaycity.gov.ph` host responded with an expired TLS certificate in command-line verification. The pages were content-checked, but certificate renewal is controlled by the City Government host, not BetterMC.
