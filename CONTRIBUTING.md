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

4. **Open a Pull Request** with the title format:

   ```
   Add [LGU Name] to directory
   ```

5. A maintainer will review and merge your PR.

---

## Updating an Existing Entry

If your LGU's status, domain, repository, or maintainer has changed:

1. Fork this repository.
2. Edit the relevant row in `README.md`.
3. Open a PR with the title format:

   ```
   Update [LGU Name] — [brief reason, e.g. "status change to Active"]
   ```

---

## Contributing a Template

If you have built a reusable starter template:

1. Fork this repository.
2. Add a row to the templates table in both `README.md` and `TEMPLATES.md`.
3. Open a PR with the title format:

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
| `needs-verification` | Your PR introduces new links; a maintainer will check them before merging. |

A maintainer may then add:

- `needs-changes` — something needs fixing on your side. A PR that sits here for 14 days is marked `stale` and closed 7 days later. Closing is not a rejection; reopen it whenever you are ready.
- `needs-coordination` — someone is already registered for that LGU. Talk to them rather than adding a second row; two contributors on one portal is a good outcome.
- `blocked` — waiting on something outside this repository, such as a domain going live.

If you are looking for something to pick up, the `open-for-adoption` label marks entries that have no active maintainer.

---

## Changelog

Please do **not** update `CHANGELOG.md` in your Pull Request. The repository maintainers will update the changelog periodically to summarize recent additions and improvements.

---

## Guidelines

- Keep entries accurate and up to date.
- Use `—` rather than leaving cells blank.
- Do not remove another LGU's entry — open an issue instead if something looks wrong.
- Be respectful. This is a civic community project.
