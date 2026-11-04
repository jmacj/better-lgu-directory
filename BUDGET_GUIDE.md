# How to Start Your Budget Transparency Portal

This guide walks you through publishing a budget transparency portal for your local government unit (LGU) — a site that shows citizens every budget project for one province, city, or municipality, with links to the source documents behind each figure.

---

## What Is a Budget Transparency Portal?

A budget portal answers one question for one place: *where is the national budget going here?* For the FY 2027 budget it lists every project for the LGU — what the National Expenditure Program (NEP) gave it, what the House bill gives it, what was added or dropped — alongside the enacted budgets (GAA) of earlier years.

All of the data comes from the public [BetterGov.ph Budget API](https://budget.bettergov.ph/docs), the same data behind the national [budget.bettergov.ph](https://budget.bettergov.ph). A budget portal needs no backend and no database: it is a static site you can host for free.

---

## Integrated or Standalone?

Decide first where the portal will live. The [Budget Portal Directory](BUDGET.md) lists both kinds:

| Type          | Where it lives                                                                              | Choose it when                                              |
|---------------|---------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| 🧩 Integrated | A subdomain (`budget.betterlb.org`) or path (`bettercatanduanes.org/transparency`) of your Better LGU portal | Your LGU already has (or is building) a Better LGU portal   |
| 🏛️ Standalone | A domain of its own (`bettersilang.org`)                                                     | There is no Better LGU portal for your LGU, and you aren't building one |

Integrated is the default recommendation: it keeps one home for your LGU's civic data and lets the two portals share a domain, socials, and maintainers. If your LGU has no Better LGU portal yet, consider [starting one](GUIDE.md) — the budget portal can be its first section.

---

## Step 1 — Search the Directories First

Check both the [Budget Portal Directory](BUDGET.md) and the [Better LGU Directory](README.md) for your LGU. If someone is already building a budget portal for it, reach out to the maintainer listed — join that effort instead of starting a second one.

If your LGU has a Better LGU portal, talk to its maintainers before you start. An integrated budget portal goes on their domain, so they need to agree to it and set up the subdomain or path.

### Register Your Intent

Once you know nobody else is building it, open a PR adding your LGU to the [Budget Portal Directory](BUDGET.md) with a `🔵 Planned` status — see [Adding a Budget Portal](CONTRIBUTING.md#adding-a-budget-portal).

---

## Step 2 — Fork the Template

Start from the official [BetterGov.ph transparency portal template](https://github.com/bettergovph/transparency-portal) — see [Budget Portal Templates](BUDGET_TEMPLATES.md) for all templates.

```bash
git clone https://github.com/bettergovph/transparency-portal budget-portal
cd budget-portal
npm install
```

Name the repository after the portal, e.g. `better[lguname]-budget` or `budget`. If the portal is integrated, create the repository under the same GitHub organization as your Better LGU portal.

---

## Step 3 — Configure Your LGU

```bash
npm run setup   # pick your province, city, or municipality
npm run check   # counts every query against the live API
npm run dev     # preview locally
```

`npm run setup` looks up your LGU's exact names and ids in the API and writes `portal.config.ts`, the only file a fork needs to change. The config scopes the portal by DPWH district engineering office, by place name, or both. Review the lines found only by name (`npm run check -- --verbose`) and exclude any namesakes from other provinces, each with a reason.

Municipality portals rely on project titles that name the town, because the API doesn't yet place every project in a city or municipality. Expect to spend more time reviewing matches for a municipality than for a province.

---

## Step 4 — Keep the Template's Rules

The template prints figures the way budget.bettergov.ph does. Keep these rules when you customize it:

- Amounts are pesos as published. A dash means "no such line in this document", never zero.
- The NEP and the House bill are two versions of one budget. Compare them; never add them together.
- "In the House bill only" and "In the NEP only" are leads to check, not confirmed insertions or deletions.
- Keep the disclaimers from the API response on every page that shows figures.
- Never hide a project silently. Every hand exclusion is listed with its reason on the About page.

Restyle it to match your Better LGU portal if you like, but don't change how the numbers are computed or labelled.

---

## Step 5 — Choose a Domain

| Type          | Domain pattern                                                         |
|---------------|------------------------------------------------------------------------|
| 🧩 Integrated | `budget.better[lguname].org`, or a `/transparency` path on the main portal |
| 🏛️ Standalone | `better[lguname].org`                                                  |

A subdomain is simpler than a path: the budget portal deploys on its own, separately from the main portal. Use a path only if the main portal can serve the budget portal's static files under it.

---

## Step 6 — Deploy

`npm run build` writes static files to `dist/`. The template ships config for Cloudflare Workers, Vercel, and Netlify, and works on any static host that sends unknown paths to `/index.html`. Set `siteUrl` in `portal.config.ts` to your domain so link previews work.

Run `npm run check` in CI. It exits non-zero on a broken config, so a change in the API shows up before citizens see wrong numbers.

---

## Step 7 — Update Your Directory Entry

Once the portal is live, open a PR updating your row in [BUDGET.md](BUDGET.md): set the **Portal** link, the **Repository**, and the status to `🟢 Active`.

---

## Keeping It Maintained

- Pull updates from the upstream template when the budget moves to a new stage (bicameral version, enacted GAA) or a new fiscal year.
- Re-run `npm run check` after every upstream update.
- If you can no longer maintain the portal, update its status to `🔴 Unmaintained` so others know it needs a new maintainer.

Citizen reports about a project will go to one central service on budget.bettergov.ph for every portal. Don't build a separate reporting form — link to the central one once it opens (the template's `reporting` setting handles this).

---

## Need Help?

Open an issue in this repository or reach out through the BetterGov.ph community channels.
