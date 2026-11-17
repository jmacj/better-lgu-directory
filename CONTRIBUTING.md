---
layout: default
title: Contributing
---
# Contributing to the BetterGov.ph LGU Directory

Thank you for being part of the BetterGov.ph community. This guide explains how to register your LGU, update an existing entry, or contribute a template.

---

## Adding Your LGU

You do not need to have a finished portal to register. If you are planning to build one, register early — it signals intent to your community and lets others find and support you.

### Steps

1. **Fork this repository.**

2. **Edit `README.md`** and add a row to the Directory table:

   ```markdown
   | Your LGU Name | [yourdomain.org](https://yourdomain.org) or - | [GitHub](https://github.com/you/repo) or - | [Facebook](https://facebook.com/yourpage) or - | 🔵 Planned | [@yourhandle](https://github.com/yourhandle) |
   ```

   The **Socials** column accepts one or more platform links. Multiple links are comma-separated, e.g. `[Facebook](https://facebook.com/yourpage), [X](https://x.com/yourhandle)`.

   Use `-` for any field that does not apply yet.

3. **Choose the correct status badge:**

   | Badge               | When to use                                          |
   |---------------------|------------------------------------------------------|
   | 🔵 Planned          | You intend to build a portal but haven't started yet |
   | 🟡 Work in Progress | Actively building, not yet launched                  |
   | 🟢 Active           | Publicly launched and actively maintained            |
   | 🔴 Unmaintained     | Previously active but no longer maintained           |

   Keep a `🔵 Planned` entry moving. Planned entries that see no directory activity for over 30 days are tagged `⚠️ Stale` and `🤝 Open for Adoption` — see [Stale Entries](#stale-entries).

4. **Open a Pull Request** with the title format:

   ```
   Add [LGU Name] to directory
   ```

5. A Directory Maintainer will review and merge your PR.

---

## Adding a Budget Portal

Budget transparency portals are listed in `BUDGET.md` and shown at [lgu.bettergov.ph/budget](https://lgu.bettergov.ph/budget), separately from the Better LGU portals in `README.md`. See [How to Start Your Budget Transparency Portal](BUDGET_GUIDE.md) if you haven't built one yet.

Unlike a Better LGU portal, a budget portal doesn't need to be registered in advance. The template takes minutes to set up, so add it once it's live.

1. **Fork this repository.**

2. **Edit `BUDGET.md`** and add a row to the Directory table:

   ```markdown
   | Your LGU Name | [budget.yourdomain.org](https://budget.yourdomain.org) | 🧩 Integrated or 🏛️ Standalone | [GitHub](https://github.com/you/repo) or - | [@yourhandle](https://github.com/yourhandle) |
   ```

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

If your LGU's status, domain, repository, or Maintainer/s have changed:

1. Fork this repository.
2. Edit the relevant row in `README.md` (or `BUDGET.md` for a budget portal).
3. Open a PR with the title format:

   ```
   Update [LGU Name] — [brief reason, e.g. "status change to Active"]
   ```

---

## Stale Entries

A `🔵 Planned` entry whose row has not changed in over 30 days is tagged `⚠️ Stale` in the Status column and `🤝 Open for Adoption` under its Maintainer/s:

```
| Your LGU Name | - | - | - | 🔵 Planned<br>⚠️ Stale | [@yourhandle](https://github.com/yourhandle)<br>🤝 Open for Adoption |
```

The two tags always appear together, and only on `🔵 Planned` entries — the sync script rejects any other combination.

**If it is your entry:** it is not a penalty and nothing is removed. Any update clears it — move to `🟡 Work in Progress`, add your repo link, or open a PR removing both tags to confirm you are still on it.

**If you want to adopt one:** open a PR that updates the Maintainer/s column to your handle and removes the `⚠️ Stale` and `🤝 Open for Adoption` tags. That is the whole change — the status stays `🔵 Planned` until you actually start building, at which point you move it to `🟡 Work in Progress` as a normal update. No heads-up needed beforehand; if the adoption needs discussion, that happens in the PR. Taking over outright and collaborating with the original Maintainer are both fine — list both handles if you are working together, or just yours if you are taking it on alone.

Adopting resets the clock: the entry counts as updated from the day that PR merges, so it will not be re-tagged for another 30 days.

The tags are applied by Directory Maintainers during periodic reviews, never by automation. Elapsed time is what prompts a look, not the whole judgement — an entry with visible progress elsewhere will not be tagged just because its row has not changed.

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

- `needs-changes` — something needs fixing on your side. A PR that sits here for 14 days is marked `stale` and closed 7 days later. Closing is not a rejection; reopen it whenever you are ready.
- `needs-coordination` — someone is already registered for that LGU. Talk to them rather than adding a second row; two contributors on one portal is a good outcome.
- `blocked` — waiting on something outside this repository, such as a domain going live.

If you are looking for something to pick up, the `open-for-adoption` label marks entries that have no active Maintainer.

---

## Changelog

Please do **not** update `CHANGELOG.md` in your Pull Request. Directory Maintainers update the changelog periodically to summarize recent additions and improvements.

---

## Guidelines

- Keep entries accurate and up to date.
- Use `—` rather than leaving cells blank.
- Do not remove another LGU's entry — open an issue instead if something looks wrong.
- Be respectful. This is a civic community project.
