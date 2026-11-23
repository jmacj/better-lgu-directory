# Better LGU Directory

A community-maintained directory of Better LGU transparency portals. The canonical record is the LGU table in `README.md` on the `main` branch; a sync pipeline projects it into a Jekyll site on the `main-pages` branch.

## Language

**LGU**:
A Philippine Local Government Unit that has (or plans) a Better LGU transparency portal. One row in the directory.
_Avoid_: city, municipality, town (use LGU for the directory entry).

**Entry**:
A single row in the LGU table — the unit contributors add or update via PR.
_Avoid_: record, item, listing.

**LGU Name**:
The LGU cell of an Entry or a Budget Portal, written in one grammar (#307) that `scripts/lgu-name.js` parses into Place, Kind, Province and Region: `<Place>, <Province>` for a municipality, `<Place> City, <Province>` for a city, `<Province> Province` for a province, and the region's PSGC name for a region. The grammar, its examples and its departures from PSGC are in `CONTRIBUTING.md`, "Naming Your LGU" and "Departures from PSGC". The sync stores the full cell as `name` and the parsed parts beside it.
_Avoid_: title, label.

**Place**:
The part of an LGU Name that sorts it: for a city, the name before ` City` (`Bacolod`); for a municipality, the name before the comma (`Calauan`); for a province row, the province (`Aklan`); for a region row, the region name as written (`Bicol Region`).
_Avoid_: town name, short name.

**Kind**:
What an LGU is, from its PSGC class: `region`, `province`, `city` or `municipality`. Component, independent component and highly urbanized cities are all `city`.
_Avoid_: type (that is a Budget Portal's Integrated/Standalone), class.

**Province**:
A PSGC province, spelled and capitalised exactly as PSGC writes it, or `Metro Manila`: the single stand-in province for NCR LGUs, which PSGC places in no province. Highly urbanized and independent component cities, which PSGC also lists outside any province, take their geographic province (`Bacolod City, Negros Occidental`). Empty for a region row. A region is never a Province. See `CONTRIBUTING.md`, "Departures from PSGC". The list lives in `scripts/psgc-regions.js`.
_Avoid_: region names or nicknames as a province (`Cagayan Valley`, `North Cotabato`).

**Region**:
A PSGC region, written in PSGC's short form and capitalisation (`CALABARZON`, `Bicol Region`, `NCR`). An LGU's Region is derived from its Province during sync, never written in its row, except for the few LGUs PSGC places in a different region from their province (`Isabela City, Basilan` is in Zamboanga Peninsula). Its **region rank** is its position in `scripts/psgc-regions.js`, PSGC's north-to-south order.
_Avoid_: area, island group.

**Level**:
The rank of a Kind in every sort: region 0, province 1, and city and municipality both 2. Cities and municipalities are the same Level: no sort lists cities before municipalities.
_Avoid_: tier, hierarchy.

**Sort Order**:
The single place orders are defined. The `README.md` table, and the `BUDGET.md` table, are sorted by folded Place ascending, then Level, then folded Province. Folding removes diacritics, case, punctuation and spaces, so `Biñan` sorts under "n". Examples: `Cebu Province` before `Cebu City, Cebu` (Level); `San Jose, Antique` before `San Jose City, Nueva Ecija` (same Level, so Province decides). The README has no other order.
The website sets its own order, so README row order never affects it. Its directory has three presets ("Sort by"); each lists keys in order, and each later key breaks ties left by the ones before it:
- **Location** (the default; the page is rendered in this order): Region rank → folded Province → Level → folded Place.
- **Name A–Z**: folded Place → Level → folded Province (the README order).
- **Status**: status rank (🟢 Active, 🟡 Work in Progress, 🔵 Planned, 🔴 Unmaintained) → then the Location keys.

Level is 0 for a region row, 1 for a province row, and 2 for both cities and municipalities. The tie-breakers are the same in every preset: the higher level comes first (`Cebu Province` before `Cebu City, Cebu`), and a city never outranks a municipality, because both are Level 2, so the Province decides. Region rank runs north to south: NCR, CAR, Ilocos Region, Cagayan Valley, Central Luzon, CALABARZON, MIMAROPA Region, Bicol Region, Western Visayas, NIR, Central Visayas, Eastern Visayas, Zamboanga Peninsula, Northern Mindanao, Davao Region, SOCCSKSARGEN, Caraga, BARMM (`_data/regions.yml`, from the sync).
_Avoid_: grouping.

**Social**:
A single labeled link to an LGU's presence on one social platform (e.g. a Facebook page). The platform is identified by the link's label text, normalized lowercase.
_Avoid_: Facebook (a Social is platform-agnostic; Facebook is just one platform).

**Socials**:
The set of Socials for one LGU — the directory column (formerly "Facebook"). May hold zero or more Socials. Empty renders as `-`.
_Avoid_: Facebook column, social media links.

**Platform**:
The social network a Social points to (facebook, x, instagram, linkedin, youtube, tiktok, bluesky). Determined from the Social's label, not the URL host; an unknown label falls back to a generic icon.
_Avoid_: network, provider, site.

**Budget Portal**:
A Philippine LGU's budget transparency site, built on the BetterGov.ph Budget API — one row in the Budget Portal table in `BUDGET.md`, rendered at `lgu.bettergov.ph/budget`. Either `🧩 Integrated` (a subdomain or path of an Entry's portal; its LGU cell must match that Entry's name in `README.md`, the Entry's Domain is derived as `parent_domain`, and its Maintainer/s are copied from the Entry's README row) or `🏛️ Standalone` (no Entry behind it). Separate from Entries: no Socials, no `⚠️ Stale`/`🤝 Open for Adoption` tags, and no Status — a Budget Portal is listed only while it's live (Portal link required), with no advance registration.
_Avoid_: budget entry, transparency entry (an Entry is always a README row).

**Maintainer**:
A person listed, by GitHub handle, in the Maintainer/s cell of an Entry or a Budget Portal — someone who builds or runs that portal. Unqualified, "Maintainer" always means this. Being listed does not mean a Maintainer wants to be contacted; only a Maintainer Profile says that.
_Avoid_: owner, author, contributor; "maintainer" for the directory team (that is a Directory Maintainer).

**Directory Maintainer**:
A member of the team that runs this directory itself: reviews and merges PRs, applies the `⚠️ Stale` / `🤝 Open for Adoption` tags, posts Check-ins, sets `🔴 Unmaintained` on Active Entries, decides Collisions, and handles removal and privacy requests. Always written out in full. One person can be both a Maintainer (of a portal) and a Directory Maintainer.
_Avoid_: maintainer (unqualified), curator, admin, moderator.

**Maintainer Profile**:
A Maintainer's opt-in, self-published statement of how and why contributors may reach them — their channels, what they are open to, and what they are not. Only the Maintainer themself adds or edits it; a Directory Maintainer may only remove it. A Maintainer Profile whose handle no longer appears in any Maintainer/s cell is an **orphaned** Maintainer Profile. Design rationale: decision record in #426.
_Avoid_: contact, contact card, maintainer page, bio.

**Open for Adoption**:
The `🤝 Open for Adoption` tag under an Entry's Maintainer/s: anyone may take the Entry on, as a takeover or alongside the original Maintainer, with one PR that updates Maintainer/s and removes the tag. It appears on exactly two kinds of Entry (#469): a stale Entry (`🔵 Planned` or `🟡 Work in Progress`), always paired with `⚠️ Stale`, and a `🔴 Unmaintained` Entry, never paired with it (only Entries that never went live go stale; only `🟢 Active` ones become Unmaintained). `scripts/sync-to-data.js` rejects every other combination. Rules: `CONTRIBUTING.md`, "Stale Entries" and "Unmaintained Entries".
_Avoid_: up for grabs, abandoned, orphaned (that is a Maintainer Profile).

**Check-in**:
A Discussions post by a Directory Maintainer that tags the Maintainer/s of every `🟡 Work in Progress` Entry whose row and repository have both been quiet for over 30 days (#469). Check-ins have no fixed schedule. Any reply, commit or row update keeps the Entry; two unanswered Check-ins spanning at least 60 days make it `⚠️ Stale` and Open for Adoption, applied by hand, with its status left `🟡 Work in Progress`. Rules: `CONTRIBUTING.md`, "Check-ins".
_Avoid_: monthly check-in (there is no cadence), audit, ping.

**Collision**:
A PR that adds a row for an LGU that's already listed (`entry:collision`), or a second PR for the same LGU. The directory holds one Entry per LGU, so a Collision never ends with two rows: the PR itself is the coordination thread, labelled `needs-coordination`, and a 30-day window decides which portal keeps the row (#469). Rules: `CONTRIBUTING.md`, "Collisions".
_Avoid_: duplicate (that is the same submission twice, closed as `duplicate`), conflict.

**Stale PR**:
A pull request that `.github/workflows/stale.yml` has labelled `stale`: one labelled `needs-changes` with no activity for 14 days, closed 7 days later unless a comment or push resets it. `blocked` and `needs-coordination` PRs are exempt, and issues never go stale. Unrelated to the `⚠️ Stale` entry tag, which is applied by hand to Entries that never went live and stopped moving. Rules: `CONTRIBUTING.md`, "Stale Pull Requests".
_Avoid_: stale entry (that is the tag), abandoned PR.

**Sync pipeline**:
The `main` → `main-pages` projection, run by `sync-to-pages.yml` on every push to `main` and monthly on a schedule (#179). It generates data files, all written into the same `chore(data): auto-sync` commit and never hand-edited: `scripts/sync-to-data.js` parses the `README.md` table into `_data/lgus.yml`, which `index.md` renders as the directory table. Each Entry carries its parsed LGU Name (`place`, `kind`, `province`, `region`, `region_rank`) and its portal's plain hostname (`host`) beside `name`, and the sync fails on any LGU Name outside the grammar. It also writes `_data/regions.yml`, the ordered region names and ranks from `scripts/psgc-regions.js`. `scripts/crawl-lgu-meta.js` fetches each `🟢 Active` Entry's portal exactly once (#179) and judges the fetched page against two independent predicates: the Featured Portal predicate writes `_data/lgu-meta.yml` (image, title, description, domain, and a stable `order_key`) for every Entry that passes it, read by the hero's Featured card partial; the Logo predicate writes `_data/lgu-logos.yml` (domain, resolved icon source/size/bytes) plus the resolved icon bytes themselves at `assets/images/lgu-logos/<domain>.<ext>`, for every Entry that resolves a Logo per the chain in `scripts/crawl-lgu-meta.js`, read by the home page's Logo band. `scripts/sync-budget-to-data.js` parses the `BUDGET.md` table into `_data/budget_portals.yml`, rendered by `budget-directory.md` at `/budget`. Both syncs also emit a structured `maintainers:` list per row, each Maintainer's link already resolved (their Maintainer Profile page if they have one, otherwise GitHub), and `scripts/sync-profiles-to-data.js` writes `_data/maintainer_profiles.yml` (each Maintainer Profile's fields plus its portals, derived from the Maintainer/s cells) for `/maintainers/`. `README.md` remains the sole source of truth for Entries, and `BUDGET.md` for Budget Portals; all generated files/assets are derived data.
_Avoid_: build, import.

**Repository activity**:
Public GitHub signals about an Entry's linked repository (last commit, and
later contributors/stars), fetched **in the browser at view time** and never
stored in this repository — the opposite of the sync pipeline above.
`scripts/sync-to-data.js` only emits the structured `owner`/`repo` (and a
pinned `/tree/<ref>` where present) that the browser module needs to know
which repo to ask about; it never fetches anything itself.
_Avoid_: portal activity (the portal is the site; this measures the repo),
stale (a different clock — see below).

The `⚠️ Stale` tag is judged by hand during a Directory Maintainer review: on a
`🔵 Planned` Entry it means *no directory activity on the Entry row* (the
README table itself hasn't been touched) for over 30 days; on a
`🟡 Work in Progress` Entry it means two Check-ins went unanswered (#469). A
Directory Maintainer may look at a repo by hand when picking whom to tag in a
Check-in. Repository activity measures the *linked
repo's* commit history instead, is computed automatically at view time, and
is informational only — it must never be conflated with `⚠️ Stale` or drive
it.
