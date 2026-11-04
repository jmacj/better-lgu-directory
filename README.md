# BetterMC — Better Malaybalay City

BetterMC is an independent public information and transparency portal for Malaybalay City, Bukidnon. It organizes official public records, government contacts, barangays, service references, and correction requests without presenting itself as an official government website.

## Current verified scope

- Source-linked 2022–2026 Full Disclosure catalog structure
- Current executive, legislative, and sectoral leadership listed by the official city website
- Searchable city-office and emergency-contact directory
- Complete 46-barangay name index
- DILG-listed Punong Barangay names and valid published contact fields
- 2025 Q2 income, operating expenditure, non-operating expenditure, and cash-position breakdown
- Institution-attributed ordinances, mayoral executive issuances, project reports, and verified city recognition
- Source-attributed Malaybalay image gallery with manual accessible controls
- Official Citizen's Charter and public-service entry points
- Moderated community correction intake with validation, D1 persistence, and rate limiting
- Responsive, keyboard-accessible public interface

Published financial and project figures are labeled with their reporting period and source. A listed document is not treated as proof of legal compliance, current project completion, or individual political credit. Procurement award details remain outside the verified scope of this release.

## Stack

- React 19, TypeScript strict mode, Vite
- React Router with URL-backed public record filters
- Zod validation in the browser and Cloudflare Pages Function
- Cloudflare D1 schema for community submissions, versioned content, and audit logs
- Vitest and Playwright

The architecture is informed by [BetterLosBaños](https://github.com/BetterLosBanos/betterlb) and the [BetterGov LGU ecosystem](https://lgu.bettergov.ph/). No Los Baños content is reused as Malaybalay data.

## Local development

```bash
npm install
npm run dev
```

The public portal works in Vite development. The participation form requires the Cloudflare Pages runtime and a D1 binding:

```bash
npx wrangler d1 create bettermc-production
# Put the returned database ID in wrangler.toml.
npx wrangler d1 migrations apply bettermc-production --local
npx wrangler pages dev dist --d1 DB=bettermc-production
```

Copy `.dev.vars.example` to `.dev.vars` to configure Turnstile locally. Production public intake should not be enabled without `TURNSTILE_SECRET_KEY` and its matching site key in the frontend.

## Verification

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Source and editorial rules

Every published civic fact must retain its original source, a last-verified date, a workflow state, and revision history for moderated content. Missing records are described as “Not yet available in verified public sources.” BetterMC does not infer noncompliance, misconduct, or spending from availability, absence, appropriation, or proposal data.

See [docs/RESEARCH_INVENTORY.md](docs/RESEARCH_INVENTORY.md) for audited sources and [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for delivery boundaries.

## Independence

BetterMC is not affiliated with, endorsed by, or operated by the City Government of Malaybalay. Government documents and information are attributed to their original sources. Official transactions and certifications must go through the responsible government office.

## License and attribution

This repository retains its existing CC BY 4.0 license. BetterLosBaños, used as an architectural reference, is dedicated under CC0 1.0. BetterGov and upstream projects are acknowledged in the product and documentation.
