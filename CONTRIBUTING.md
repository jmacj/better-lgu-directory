# Contributing to the BetterGov.ph LGU Directory

Thank you for being part of the BetterGov.ph community. This guide explains how to register your LGU, update an existing entry, or contribute a template.

> **The directory coordinates; it doesn't own.** Registration earns you first say, not exclusive rights. Shipping and maintaining keep your entry.

The directory exists so builders find an existing portal before they build, and so no LGU stays blocked by an entry that has stopped moving. The rules below — [One LGU, One Entry](#one-lgu-one-entry), [Stale Entries](#stale-entries), [Check-ins](#check-ins), [Unmaintained Entries](#unmaintained-entries) and [Collisions](#collisions) — all follow from that.

---

## Adding Your LGU

You do not need to have a finished portal to register. If you are planning to build one, register early — it signals intent to your community and lets others find and support you.

### Steps

1. **Fork this repository.**

2. **Edit `README.md`** and add a row to the Directory table:

   ```markdown
   | Your LGU Name | [yourdomain.org](https://yourdomain.org) or - | [GitHub](https://github.com/you/repo) or - | [Facebook](https://facebook.com/yourpage) or - | 🔵 Planned | [@yourhandle](https://github.com/yourhandle) |
   ```

   Write the **LGU** cell as described in [Naming Your LGU](#naming-your-lgu), and insert the row in A–Z order by place name.

   The **Socials** column accepts one or more platform links. Multiple links are comma-separated, e.g. `[Facebook](https://facebook.com/yourpage), [X](https://x.com/yourhandle)`.

   Use `-` for any field that does not apply yet.

3. **Choose the correct status badge:**

   | Badge               | When to use                                          |
   |---------------------|------------------------------------------------------|
   | 🔵 Planned          | You intend to build a portal but haven't started yet |
   | 🟡 Work in Progress | Actively building, not yet launched                  |
   | 🟢 Active           | Publicly launched and actively maintained            |
   | 🔴 Unmaintained     | Previously active but no longer maintained           |

   Keep your entry moving. Planned entries that see no directory activity for over 30 days are tagged `⚠️ Stale` and `🤝 Open for Adoption` — see [Stale Entries](#stale-entries). Quiet Work in Progress entries are followed up in [Check-ins](#check-ins), and go stale only if those go unanswered.

4. **Open a Pull Request** with the title format:

   ```
   Add [LGU Name] to directory
   ```

5. A Directory Maintainer will review and merge your PR.

---

## One LGU, One Entry

Each LGU has a single row in `README.md`. If your LGU is already listed, don't add a second row: contribute to the existing portal or co-maintain it. Open a PR adding your handle to its Maintainer/s cell once you've agreed it with the listed Maintainer/s, or adopt the entry if it is open for adoption (see [Stale Entries](#stale-entries) and [Unmaintained Entries](#unmaintained-entries)). A PR that adds a row for an LGU that's already listed is a [collision](#collisions).

Budget portals in `BUDGET.md` are a separate category with their own table, so a Budget Portal row never counts as a second entry for its LGU.

---

## Naming Your LGU

Every **LGU** cell, in `README.md` and in `BUDGET.md`, follows one format, so the directory can be sorted and filtered by province and region. The PSA's [Philippine Standard Geographic Code](https://psa.gov.ph/classification/psgc/) (PSGC) decides which LGUs exist, how their names are spelled, whether each is a city or a municipality, and which province and region it belongs to. The written format is this directory's own; where it differs from PSGC is listed under [Departures from PSGC](#departures-from-psgc).

| Kind | Format | Example |
|------|--------|---------|
| Municipality | `<Place>, <Province>` | `Calauan, Laguna` |
| Component city | `<Place> City, <Province>` | `Calamba City, Laguna` |
| Highly urbanized or independent component city | `<Place> City, <Province>` | `Bacolod City, Negros Occidental` |
| City in NCR | `<Place> City, Metro Manila` | `Makati City, Metro Manila` |
| Province | `<Province> Province` | `Aklan Province` |
| Region | the region's PSGC name | `Bicol Region`, `CALABARZON` |

- **Cities say "City".** If PSGC classes your LGU as a city, write `<Place> City`, even where PSGC writes `City of <Place>`. A municipality never takes "City". After cityhood, change the one cell: `San Pedro, Laguna` becomes `San Pedro City, Laguna`.
- **The province is always the geographic province,** spelled and capitalised exactly as PSGC writes it: `Davao del Sur`, not `Davao Del Sur`; `Cotabato`, not `North Cotabato`. That holds even for highly urbanized and independent component cities, which PSGC lists without a province. A region is never a province: `Aparri, Cagayan`, not `Aparri, Cagayan Valley`.
- **NCR uses `Metro Manila`** as its province, the one stand-in: `Makati City, Metro Manila`, or `Pateros, Metro Manila` for NCR's one municipality. Metro Manila is not a province, so `Metro Manila Province` isn't valid; a region-wide NCR entry is written `NCR`.
- **Region names are PSGC's short form**, with PSGC's capitalisation: the name it gives in parentheses, or, where it gives none, the name as written. `Region IV-A (CALABARZON)` is `CALABARZON`, `Region V (Bicol Region)` is `Bicol Region`, `Region XIII (Caraga)` is `Caraga`, and `National Capital Region (NCR)` is `NCR`. The full list is in [`scripts/psgc-regions.js`](scripts/psgc-regions.js).
- **Mountain Province** is written as itself, not `Mountain Province Province`.

### Where your row goes

Both tables are a single list, sorted A–Z by place name. Accents, case and punctuation are ignored, so `Biñan City` sorts as "binan". When two rows share a place:

1. The higher level comes first: region, then province, then city or municipality. Cities and municipalities are the same level. `Cebu Province` goes before `Cebu City, Cebu`.
2. If the level ties too, the province decides, A–Z. `San Jose, Antique` goes before `San Jose City, Nueva Ecija`.

The full definition is the **Sort Order** entry in [`CONTEXT.md`](CONTEXT.md).

Pull request triage warns you about a name it can't read, an unknown province, or a row out of order, and says where the row belongs. These are warnings only and never block your PR. After merge, the website sync refuses a name that doesn't fit this format, so a Directory Maintainer will ask you to fix it first.

---

## Departures from PSGC

The format departs from PSGC only where sorting or a consistent row shape needs it. If you copy a name from the PSGC website, apply these.

| PSGC | This directory | Why |
|------|----------------|-----|
| `City of Calamba`, `City of Manila` | `Calamba City`, `Manila City` | PSGC mixes both forms itself (`Quezon City` vs `City of Manila`), and `City of X` would put every city under "C" when sorted. |
| `Science City of Muñoz`, `Island Garden City of Samal` | `Muñoz City`, `Samal City` | One city form. |
| Highly urbanized and independent component cities have no province | The geographic province (`Bacolod City, Negros Occidental`) | Every row needs a province, for sorting by province and for the `Province · Region` line. |
| NCR LGUs have no province | `Metro Manila` as their province | The single stand-in, so every row has the same shape. |
| `Mountain Province` | `Mountain Province`, not `Mountain Province Province` | Its name already ends in "Province", so the province row isn't doubled. |

Region names are not a departure: they use PSGC's own short form and capitalisation. A few LGUs sit in a different PSGC region from their geographic province: `Isabela City, Basilan` is in Zamboanga Peninsula while Basilan is in BARMM, and the Special Geographic Area municipalities inside Cotabato are in BARMM. These are handled in [`scripts/psgc-regions.js`](scripts/psgc-regions.js), and you still write the geographic province.

---

## Adding a Budget Portal

Budget transparency portals are listed in `BUDGET.md` and shown at [lgu.bettergov.ph/budget](https://lgu.bettergov.ph/budget), separately from the Better LGU portals in `README.md`. See [How to Start Your Budget Transparency Portal](BUDGET_GUIDE.md) if you haven't built one yet.

Unlike a Better LGU portal, a budget portal doesn't need to be registered in advance. The template takes minutes to set up, so add it once it's live.

1. **Fork this repository.**

2. **Edit `BUDGET.md`** and add a row to the Directory table:

   ```markdown
   | Your LGU Name | [budget.yourdomain.org](https://budget.yourdomain.org) | 🧩 Integrated or 🏛️ Standalone | [GitHub](https://github.com/you/repo) or - | [@yourhandle](https://github.com/yourhandle) |
   ```

   Write the **LGU** cell as described in [Naming Your LGU](#naming-your-lgu), and insert the row in A–Z order by place name, the same as in `README.md`.

3. **Choose the type:**

   | Type          | When to use                                                                     |
   |---------------|---------------------------------------------------------------------------------|
   | 🧩 Integrated | The budget portal is a subdomain or path of your LGU's Better LGU portal         |
   | 🏛️ Standalone | The budget portal is a site of its own, with no Better LGU portal behind it      |

   For `🧩 Integrated`, the **LGU** cell must match your LGU's name in `README.md` exactly, so the website can link it to your Better LGU portal (otherwise that link shows `-`). If your Better LGU portal isn't in `README.md` yet, add it in the same PR. Copy **Maintainer/s** from your LGU's `README.md` row.

   There is no Status column: the **Portal** link is required, and a budget portal is listed only while it's live. If one goes offline, open a PR removing its row. Budget portals don't take the `⚠️ Stale` or `🤝 Open for Adoption` tags.

4. **Open a Pull Request** with the title format:

   ```
   Add [LGU Name] budget portal to directory
   ```

---

## Updating an Existing Entry

If your LGU's status, domain, repository, or Maintainer/s have changed, or it has become a city:

1. Fork this repository.
2. Edit the relevant row in `README.md` (or `BUDGET.md` for a budget portal). For cityhood, change only the LGU cell (`San Pedro, Laguna` → `San Pedro City, Laguna`; see [Naming Your LGU](#naming-your-lgu)) and rename the matching `BUDGET.md` row in the same PR, so an Integrated budget portal stays linked.
3. Open a PR with the title format:

   ```
   Update [LGU Name] — [brief reason, e.g. "status change to Active"]
   ```

---

## Stale Entries

A `🔵 Planned` entry whose row has not changed in over 30 days is tagged `⚠️ Stale` in the Status column and `🤝 Open for Adoption` under its Maintainer/s. A `🟡 Work in Progress` entry gets the same tags when its [check-ins go unanswered](#when-a-check-in-goes-unanswered):

```
| Your LGU Name | - | - | - | 🔵 Planned<br>⚠️ Stale | [@yourhandle](https://github.com/yourhandle)<br>🤝 Open for Adoption |
```

Only entries that never went live (`🔵 Planned` and `🟡 Work in Progress`) go stale, and a stale entry always carries both tags. `🤝 Open for Adoption` also appears on its own on [Unmaintained](#unmaintained-entries) entries. The sync script rejects any other combination.

**If it is your entry:** it is not a penalty and nothing is removed. Any update clears it — move to `🟡 Work in Progress`, add your repo link, or open a PR removing both tags to confirm you are still on it.

**If you want to adopt one:** open a PR that updates the Maintainer/s column to your handle and removes the `⚠️ Stale` and `🤝 Open for Adoption` tags. That is the whole change — the status stays as it is (`🔵 Planned` until you actually start building, then `🟡 Work in Progress` as a normal update). Adopting a stale `🟡 Work in Progress` entry means picking up its repository, or linking your own. No heads-up needed beforehand; if the adoption needs discussion, that happens in the PR. Taking over outright and collaborating with the original Maintainer are both fine — list both handles if you are working together, or just yours if you are taking it on alone.

Adopting resets the clock: the entry counts as updated from the day that PR merges, so it will not be re-tagged for another 30 days.

The tags are applied by Directory Maintainers during periodic reviews, never by automation. Elapsed time is what prompts a look, not the whole judgement — an entry with visible progress elsewhere will not be tagged just because its row has not changed.

---

## Check-ins

`🟡 Work in Progress` entries don't go stale on elapsed time alone. Instead, Directory Maintainers post **check-ins** in [Discussions](https://github.com/jmacj/better-lgu-directory/discussions) periodically. Check-ins happen when a Directory Maintainer has time, so there is no fixed schedule. Each one tags the Maintainer/s of every `🟡 Work in Progress` entry whose row **and** repository have both been quiet for over 30 days.

**If you're tagged:** reply. Any reply keeps your entry, including "paused" or "stuck" — the point is to hear that someone is still there. A new commit to your repository or an update to your row counts too.

### When a check-in goes unanswered

A `🟡 Work in Progress` entry is tagged `⚠️ Stale` and `🤝 Open for Adoption` when **both** of these hold:

- its Maintainer/s were tagged in **two check-ins and replied to neither**, and
- at least **60 days** have passed since the first of those check-ins, with no commits or row updates in that time.

Counting unanswered check-ins and requiring a minimum elapsed time together works whether check-ins are three weeks or three months apart. The status stays `🟡 Work in Progress`: the work did start, and `🔴 Unmaintained` is only for portals that were live. As with Planned entries, a Directory Maintainer applies the tags by hand; elapsed time prompts a look but doesn't decide on its own, and any later update clears them.

Anyone can also flag an entry with a **[Report Inactive Portal](https://github.com/jmacj/better-lgu-directory/issues/new?template=report-inactive.md)** issue (labelled `inactive`). A Directory Maintainer then reviews it.

---

## Unmaintained Entries

Only `🟢 Active` entries become `🔴 Unmaintained`: a portal that was live and no longer is maintained, or has gone offline (an expired domain, a dead site). Entries that never went live go [stale](#stale-entries) instead. Only Directory Maintainers set it, after reviewing a **[Report Inactive Portal](https://github.com/jmacj/better-lgu-directory/issues/new?template=report-inactive.md)** issue (labelled `inactive`) or noticing it themselves.

An Unmaintained entry is tagged `🤝 Open for Adoption` under its Maintainer/s, without `⚠️ Stale`:

```
| Your LGU Name | - | [GitHub](https://github.com/yourhandle/betteryourlgu) | - | 🔴 Unmaintained | [@yourhandle](https://github.com/yourhandle)<br>🤝 Open for Adoption |
```

**If you want to adopt one:** it works the same way as a stale entry. Open a PR that updates the Maintainer/s column and removes `🤝 Open for Adoption`, and set the status to match reality: `🟡 Work in Progress` if you're building, `🟢 Active` if the portal is live.

**If it is your entry:** open a PR that sets the real status and removes the tag. That counts as an update, like any other.

---

## Publishing a Maintainer Profile

If you're listed as a Maintainer of an LGU in `README.md` or a budget portal in `BUDGET.md`, you can publish a **Maintainer Profile**: one markdown file saying how contributors may reach you, what you're open to (collaborators, mentoring, code review), and what you're not a fit for. It's opt-in, and nobody publishes a profile for you.

1. Read the [privacy notice](PRIVACY.md). Everything in your profile is public, and removing it later doesn't erase git history or forks.
2. Copy [`maintainers/_template.md`](maintainers/_template.md) to `maintainers/<your-github-handle>.md`. The filename is the only record of whose profile it is.
3. Keep what you want to share and delete the rest. Every field is optional. Channels can be `email`, `messenger`, `discord`, `telegram`, `linkedin`, and `website`. Prefer project or team channels over personal ones; if you're under 18, use only those. Phone numbers aren't accepted.
4. Add yourself to the list in [`maintainers/README.md`](maintainers/README.md).
5. Open the pull request **from your own GitHub account**, titled:

   ```
   Add Maintainer Profile — @your-handle
   ```

On the website, your handle then links to your profile wherever you appear as a Maintainer. One profile covers every portal you maintain. If you rename your GitHub account, rename the file and update your Maintainer/s cells in the same PR.

To remove your profile, delete the file and your bullet in a PR, open an issue, or email jan@jmacj.dev privately. Directory Maintainers may delete profiles to honour removal requests but never edit them.

---

## Contributing a Template

If you have built a reusable starter template:

1. Make your repository public and turn on **Template repository** under **Settings → General** on GitHub. See [creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository). Budget portal templates follow the rules in [`BUDGET_TEMPLATES.md`](BUDGET_TEMPLATES.md) instead.
2. Fork this repository.
3. Add a row to the templates table in both `README.md` and `TEMPLATES.md`. Budget portal templates go in [`BUDGET_TEMPLATES.md`](BUDGET_TEMPLATES.md) only.
4. Open a PR with the title format:

   ```
   Add template — [Template Name]
   ```

---

## What Happens After You Open a PR

Some labels are applied automatically, so do not worry about setting them yourself.

| Label | Meaning |
|--------------------|--------------------------------------------------------------------------|
| `entry:new` | Your PR adds a new LGU row. |
| `entry:update` | Your PR changes an existing LGU row. |
| `entry:collision` | The LGU you added is already in the directory — see the comment on your PR. |
| `needs-verification` | Your PR introduces new links, or a Maintainer Profile that needs a closer look; a Directory Maintainer will check it before merging. |
| `entry:budget` | Your PR changes the Budget Portal table in `BUDGET.md`. |

A Directory Maintainer may then add:

- `needs-changes` — something needs fixing on your side. A PR that sits here for 14 days is marked `stale` and closed 7 days later (see [Stale Pull Requests](#stale-pull-requests)). Closing is not a rejection; reopen it whenever you are ready.
- `needs-coordination` — someone is already registered for that LGU. Talk to them rather than adding a second row; two contributors on one portal is a good outcome. See [Collisions](#collisions) for what happens next.
- `blocked` — waiting on something outside this repository, such as a domain going live.

If you are looking for something to pick up, the `open-for-adoption` label marks entries that have no active Maintainer.

### Collisions

A **collision** is a PR that adds a row for an LGU that's already listed (labelled `entry:collision`), or a second open PR for the same LGU. **That PR is the coordination thread**: nobody opens a separate issue, and `needs-coordination` PRs are never closed as stale while it plays out.

1. A Directory Maintainer applies `needs-coordination` and tags the existing Maintainer/s on the PR. Merging into one portal is the default ask. If the newcomer's portal is already live, contributing to it is a valid outcome for the registered builder too.
2. A **30-day window** starts when the label is applied. If the registered entry reaches `🟢 Active` within it, that entry keeps the row and the PR is closed.
3. Otherwise the PR is changed to update the existing row instead of adding a second one. The live portal takes the row, and the original Maintainer is offered co-maintainer.
4. If both portals are live and neither builder will merge, the earlier registration keeps the row and the PR is closed. No second row is added.
5. A Directory Maintainer who maintains either portal stays out of the decision.

### Stale Pull Requests

[`stale.yml`](.github/workflows/stale.yml) runs daily and only ever looks at pull requests waiting on their contributor:

- **Scope:** only PRs labelled `needs-changes` go stale. A PR waiting on a Directory Maintainer never does.
- **Timing:** 14 days after the last activity, the PR is labelled `stale` with a comment; 7 days after that, it's closed.
- **Exemptions:** `blocked` and `needs-coordination` PRs are never marked stale, even with `needs-changes`. That covers the 30-day [collision](#collisions) window.
- **Reset:** any comment or push removes `stale` and restarts the clock.
- **Issues** are never marked stale or closed automatically; Directory Maintainers triage them by hand.

The `stale` **PR label** is unrelated to the `⚠️ Stale` **entry tag**. The label is automated and means a PR is waiting on its contributor. The tag is applied by hand and means an entry that never went live has stopped moving (see [Stale Entries](#stale-entries)).

---

## Changelog

Please do **not** update `CHANGELOG.md` in your Pull Request. Directory Maintainers update the changelog periodically to summarize recent additions and improvements.

---

## Guidelines

- Keep entries accurate and up to date.
- Use `—` rather than leaving cells blank.
- Do not remove another LGU's entry — open an issue instead if something looks wrong.
- Be respectful. This is a civic community project.
