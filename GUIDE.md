# How to Start Your Better LGU Portal

This guide walks you through creating a digital transparency portal for your local government unit (LGU) under the BetterGov.ph initiative.

---

## What Is a Better LGU Portal?

A Better LGU portal is a publicly accessible website that makes local government information — budgets, projects, officials, ordinances, and contact information — easy for citizens to find and understand. It is built and maintained by civic-minded developers and volunteers, independent of the official LGU website.

Examples:
- [bettersolano.org](https://bettersolano.org)
- [betterbacolod.org](https://betterbacolod.org)
- [bettercaluan.org](https://bettercalauan.org)
- [betterormoc.org](https://www.betterormoc.org/en)
- [betterlb.org](https://betterlb.org)
- [betterlaspinas.org](https://betterlaspinas.org)

---

## Before You Start

You do not need permission from your LGU to build a transparency portal. Most of the information you will publish is already public record. That said, reaching out to your LGU's public information office can open doors to better data and official cooperation.

**Recommended skills:**
- Basic web development (HTML/CSS/JavaScript or a framework like Vue or React)
- Git and GitHub
- Willingness to do research and data gathering

**Not a developer?** You can still register your LGU's intent and recruit a technical co-maintainer from the community.

---

## Step 1 — Register Your Intent

Open a Pull Request to [this repository](https://github.com/bettergov-ph/lgu-directory) to add your LGU to the directory with a `🔵 Planned` status. This is the first concrete step and signals to your community that something is coming.

See [CONTRIBUTING.md](CONTRIBUTING.md) for exact instructions.

---

## Step 2 — Pick a Template

Browse the [community templates](TEMPLATES.md) and choose one that fits your technical stack and the complexity you are aiming for. Most templates are built with Nuxt 3 or plain HTML/CSS and are designed to be forked and customized.

If no template fits your needs, you can build from scratch and contribute your own template back to the community afterward.

---

## Step 3 — Set Up Your Repository

1. Fork or clone your chosen template.
2. Rename the repository to `better[lguname]` (e.g., `bettersolano`, `betterbacolod`).
3. Set up your repository on GitHub and make it public.

---

## Step 4 — Gather and Publish Data

Start with publicly available data:

- **Officials** — elected and appointed officials, contact details
- **Budget** — annual budget, expenditure reports
- **Projects** — ongoing and completed infrastructure and social programs
- **Ordinances** — recently passed ordinances and resolutions
- **Contact information** — offices, hotlines, social media pages

Data sources include your LGU's official website, the Commission on Audit (COA), the Department of Budget and Management (DBM) Open Data portal, and PhilSys local records.

---

## Step 5 — Choose a Domain

Register a domain in the format `better[lguname].org` (e.g., `bettercalauan.org`). The `.org` TLD reflects the civic, non-commercial nature of the project.

Domain costs roughly ₱600–₱900/year through local registrars.

---

## Step 6 — Deploy

Most templates are deployable for free on:

- [Vercel](https://vercel.com) — best for Nuxt/Next/React projects
- [Netlify](https://netlify.com) — good general-purpose option
- [GitHub Pages](https://pages.github.com) — best for static HTML/CSS sites

---

## Step 7 — Update Your Directory Entry

Once your portal is live, update your entry in this repository from `🔵 Planned` or `🟡 Work in Progress` to `🟢 Active`. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Keeping It Maintained

A transparency portal is only valuable if it stays current. Consider:

- Scheduling quarterly data review sessions
- Recruiting co-maintainers from your local tech community
- Connecting with other Better LGU maintainers in the BetterGov.ph community for support

---

## Need Help?

Open an issue in this repository or reach out through the BetterGov.ph community channels.