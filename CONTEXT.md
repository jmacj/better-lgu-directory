# Better LGU Directory

A community-maintained directory of Better LGU transparency portals. The canonical record is the LGU table in `README.md` on the `main` branch; a sync pipeline projects it into a Jekyll site on the `main-pages` branch.

## Language

**LGU**:
A Philippine Local Government Unit that has (or plans) a Better LGU transparency portal. One row in the directory.
_Avoid_: city, municipality, town (use LGU for the directory entry).

**Entry**:
A single row in the LGU table — the unit contributors add or update via PR.
_Avoid_: record, item, listing.

**Social**:
A single labeled link to an LGU's presence on one social platform (e.g. a Facebook page). The platform is identified by the link's label text, normalized lowercase.
_Avoid_: Facebook (a Social is platform-agnostic; Facebook is just one platform).

**Socials**:
The set of Socials for one LGU — the directory column (formerly "Facebook"). May hold zero or more Socials. Empty renders as `-`.
_Avoid_: Facebook column, social media links.

**Platform**:
The social network a Social points to (facebook, x, instagram, linkedin, youtube, tiktok, bluesky). Determined from the Social's label, not the URL host; an unknown label falls back to a generic icon.
_Avoid_: network, provider, site.

**Sync pipeline**:
The `main` → `main-pages` projection, run by `sync-to-pages.yml` on every push to `main` and monthly on a schedule (#179). It generates data files, all written into the same `chore(data): auto-sync` commit and never hand-edited: `scripts/sync-to-data.js` parses the `README.md` table into `_data/lgus.yml`, which `index.md` renders as the directory table. `scripts/crawl-lgu-meta.js` fetches each `🟢 Active` Entry's portal exactly once (#179) and judges the fetched page against two independent predicates: the Featured Portal predicate writes `_data/lgu-meta.yml` (image, title, description, domain, and a stable `order_key`) for every Entry that passes it, read by the hero's Featured card partial; the Logo predicate writes `_data/lgu-logos.yml` (domain, resolved icon source/size/bytes) plus the resolved icon bytes themselves at `assets/images/lgu-logos/<domain>.<ext>`, for every Entry that resolves a Logo per the chain in `scripts/crawl-lgu-meta.js`, read by the home page's Logo band. `README.md` remains the sole source of truth for Entries; all generated files/assets are derived data.
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

The existing `⚠️ Stale` tag means *no directory activity on the Entry row*
(the README table itself hasn't been touched) for over 30 days, judged by
hand during a maintainer review. Repository activity measures the *linked
repo's* commit history instead, is computed automatically at view time, and
is informational only — it must never be conflated with `⚠️ Stale` or drive
it.
