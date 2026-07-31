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
The `main` → `main-pages` projection: `scripts/sync-to-data.js` parses the `README.md` table into `_data/lgus.yml`, which `index.md` renders. `README.md` is the source of truth; `_data/lgus.yml` is generated and never hand-edited.
_Avoid_: build, import.
