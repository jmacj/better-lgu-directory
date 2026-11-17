# How to Start Your Budget Transparency Portal

Your province, city, or town can have its own site that lists every 2027 project in the national budget: what the National Expenditure Program (NEP) gave it, what the House bill (House Bill 10858) gives it, what was added or dropped, and the page in the budget documents for each figure.

It's free and open source, and there's no server or database to run. Every figure comes from the [BetterGov.ph Budget API](https://budget.bettergov.ph/docs), the same data behind [budget.bettergov.ph](https://budget.bettergov.ph). You don't register anything in advance: build it, put it live, then send us the link.

It's meant for LGU IT offices, civic groups, newsrooms, and student developers. You'll need Node.js, a GitHub account, and a free account on a static host.

---

## Before You Start

**Check the directories.** Look your LGU up in the [Budget Portal Directory](https://lgu.bettergov.ph/BUDGET). If it already has a budget portal, contribute to that one instead of publishing a second.

**Decide where it lives.**

| Type          | Where it lives                                                                                                  | Choose it when                                   |
|---------------|-----------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| 🧩 Integrated | A subdomain (`budget.betterlb.org`) or path (`bettercatanduanes.org/transparency`) of your LGU's Better LGU portal | Your LGU is in the [Better LGU Directory](https://lgu.bettergov.ph/) |
| 🏛️ Standalone | A domain of its own (`bettersilang.org`)                                                                         | Your LGU has no Better LGU portal                |

For an integrated portal, talk to the Better LGU portal's maintainers first. It goes on their domain, so they need to agree to it and point the subdomain at your deploy. A subdomain is simpler than a path, because the budget portal then deploys on its own.

---

## Step 1 — Fork the Code

Fork the official [BetterGov.ph transparency portal](https://github.com/bettergovph/transparency-portal) on GitHub, then clone your fork:

```bash
git clone https://github.com/<you>/transparency-portal budget-portal
cd budget-portal
npm install
```

For an integrated portal, fork it into the same GitHub organization as your Better LGU portal. Other starting points are listed in [Budget Portal Templates](BUDGET_TEMPLATES.md).

---

## Step 2 — Run `npm run setup` and Pick Your LGU

```bash
npm run setup   # pick your province, city, or municipality
npm run check   # counts every query against the live API
npm run dev     # preview locally
```

`npm run setup` looks up your LGU's exact names and ids in the API and writes `portal.config.ts`, the only file a fork needs to change.

Then review what it found. `npm run check -- --verbose` lists the projects matched only by name, and these can include namesakes from other provinces. Exclude any that aren't yours; each exclusion needs a reason, and the portal publishes it. Expect more of this for a municipality than for a province: the API doesn't yet place every project in a city or town, so a municipality portal relies on project titles that spell the town out.

The template can also build a portal for a DPWH district engineering office. This directory lists LGU portals only for now.

---

## Step 3 — Deploy

```bash
npm run build   # static files in dist/
```

Deploy to Cloudflare, Vercel, or Netlify; the template already has the config for each. Any other static host works too, as long as it sends unknown paths to `/index.html`. Set `siteUrl` in `portal.config.ts` to your domain so link previews work.

Run `npm run check` in CI as well. It fails on a broken config, so a change in the API shows up before citizens see wrong numbers.

---

## Send Us the Link

Once the portal is live, open a PR adding it to `BUDGET.md` — see [Adding a Budget Portal](CONTRIBUTING.md#adding-a-budget-portal). It appears on the [Budget Portal Directory](https://lgu.bettergov.ph/BUDGET) after merge. For an integrated portal, your LGU's Better LGU portal must already be in the [Better LGU Directory](https://lgu.bettergov.ph/); add it in the same PR if it isn't.

---

## Keep the Numbers Honest

The template presents figures the way budget.bettergov.ph does. Restyle it to match your Better LGU portal if you like, but keep these rules:

- Amounts are as published in the 2027 NEP and House Bill 10858. They are not spending.
- The NEP and the House bill are two versions of one budget. Compare them; never add them together.
- A project found in only one version is a candidate to check, not a finding.
- A dash means "no such line in this document", never zero.
- Keep the disclaimers from the API response on every page that shows figures.
- Never hide a project silently. Every exclusion is listed with its reason on the About page.

---

## Keeping It Current

- Pull updates from the upstream template when the budget moves to a new stage (bicameral version, enacted GAA) or a new fiscal year, then re-run `npm run check`.
- Citizen reports will go to one central service on budget.bettergov.ph for every portal. Don't build your own form; the template's `reporting` setting links to the central one once it opens.
- If you take the portal offline, open a PR removing its row from `BUDGET.md`. The directory only lists live portals.

---

## Need Help?

Open an issue in this repository or reach out through the BetterGov.ph community channels.
