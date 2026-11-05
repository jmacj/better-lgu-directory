# BetterGov.ph — LGU Budget Transparency Portal Directory

A community-maintained directory of **budget transparency portals** for Philippine LGUs — sites that show citizens every budget project for one province, city, or municipality, built on the public [BetterGov.ph Budget API](https://budget.bettergov.ph/docs) behind the national [budget.bettergov.ph](https://budget.bettergov.ph).

A budget portal is either part of an LGU's Better LGU portal (`budget.betterlb.org`, `bettercatanduanes.org/transparency`) or a site of its own (`bettersilang.org`). Both are listed here — check this table before you build, so you can join an existing effort instead of duplicating it.

---

## 💰 Directory

<!-- SYNC_BUDGET_TABLE_START -->

| LGU                          | Portal                                                                           | Type           | Repository                                                                    | Maintainer/s                                                                           |
|------------------------------|----------------------------------------------------------------------------------|----------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Los Baños, Laguna            | [budget.betterlb.org](https://budget.betterlb.org)                               | 🧩 Integrated  | -                                                                             | [@miconficker](https://github.com/miconficker)                                         |
| Ilocos Norte Province        | [budget.betterilocosnorte.org](https://budget.betterilocosnorte.org)             | 🧩 Integrated  | -                                                                             | [@russellraed](https://github.com/russellraed)                                         |
| Bukidnon Province            | [budget.betterbukidnon.org](https://budget.betterbukidnon.org)                   | 🧩 Integrated  | -                                                                             | [@DMNCDLPRT](https://github.com/DMNCDLPRT)                                             |
| Las Piñas City, Metro Manila | [budget.betterlaspinas.org](https://budget.betterlaspinas.org)                   | 🧩 Integrated  | [GitHub](https://github.com/betterlaspinas/budget)                            | [@jmacj](https://github.com/jmacj), [@Martin-Enghoy](https://github.com/Martin-Enghoy) |
| Lapu Lapu City, Cebu | [betterlapulapu.org/government/budget-projects](https://www.betterlapulapu.org/government/budget-projects)                   | 🧩 Integrated  | -                            | [@iyanski](https://github.com/iyanski) |
| Catanduanes Province         | [bettercatanduanes.org/transparency](https://bettercatanduanes.org/transparency) | 🧩 Integrated  | -                                                                             | [@VLDCNDN](https://github.com/VLDCNDN)                                                 |
| Iligan City, Lanao del Norte | [budget.betteriligancity.org](https://budget.betteriligancity.org)               | 🧩 Integrated  | [GitHub](https://github.com/KishonShrill/transparency-portal)                | [@KishonShrill](https://github.com/KishonShrill)                                                 |
| Silang, Cavite               | [bettersilang.org](https://www.bettersilang.org)                                 | 🏛️ Standalone | [GitHub](https://github.com/0xDataBear/bettersilang)                          | [@0xDataBear](https://github.com/0xDataBear)                                           |
| Batangas Province            | [betterbatangas.org](https://betterbatangas.org)                                 | 🏛️ Standalone | [GitHub](https://github.com/pogicodes/batangas-transparency-portal)           | [@pogicodes](https://github.com/pogicodes)                                             |
| Pampanga Province            | [betterpampanga.vercel.app](https://betterpampanga.vercel.app)                   | 🏛️ Standalone | [GitHub](https://github.com/Pseudoman21/betterpampanga)                       | [@Pseudoman21](https://github.com/Pseudoman21)                                         |
| Taal, Batangas               | [taal.betterbatangas.org](https://taal.betterbatangas.org)                       | 🏛️ Standalone | [GitHub](https://github.com/pogicodes/batangas-transparency-portal/tree/taal) | [@pogicodes](https://github.com/pogicodes)                                             |
| Cabanatuan City, Nueva Ecija | [transparency.bettercabanatuan.org](https://transparency.bettercabanatuan.org)   | 🧩 Integrated  | [GitHub](https://github.com/BetterCabanatuan/bettercabanatuan-transparency-portal)                | [@joshuagemvicente](https://github.com/joshuagemvicente), [@iampoll](https://github.com/iampoll) |
| Albay Province               | [albay-transparency-portal.vercel.app](https://albay-transparency-portal.vercel.app) | 🏛️ Standalone | [GitHub](https://github.com/Pseudoman21/albay-transparency-portal)            | [@Pseudoman21](https://github.com/Pseudoman21)                                         |

<!-- SYNC_BUDGET_TABLE_END -->

> Want to add your budget portal? See [Adding a Budget Portal](CONTRIBUTING.md#adding-a-budget-portal).

---

## 🧭 Portal Types

There is no status column: a budget portal is listed once it's live, and its row is removed if it goes offline.

| Type          | Meaning                                                                                                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| 🧩 Integrated | Part of the LGU's Better LGU portal — a subdomain (`budget.betterlb.org`) or a path (`bettercatanduanes.org/transparency`) |
| 🏛️ Standalone | A budget portal on its own, with no Better LGU portal behind it (`bettersilang.org`)                                      |

An `🧩 Integrated` row's **LGU** must match that LGU's name in the [Better LGU Directory](README.md) exactly — the website uses it to link the budget portal to its Better LGU portal. If no match is found, the sync logs a warning and the Better LGU Portal column shows `-`. Register the Better LGU portal first if it isn't listed yet. Copy an Integrated row's **Maintainer/s** from that LGU's README row.

---

## 🚀 Getting Started

Ready to build one? Read **[How to Start Your Budget Transparency Portal](BUDGET_GUIDE.md)** and pick a [budget portal template](BUDGET_TEMPLATES.md).

Three steps, no advance registration:
1. **Fork** the [official template](https://github.com/bettergovph/transparency-portal) on GitHub
2. **Run `npm run setup`** and pick your LGU
3. **Deploy** it to Cloudflare, Vercel, or Netlify

Then send us the link: open a PR adding your portal to this table.

---

## 📄 License

Content in this repository is licensed under [CC BY 4.0](LICENSE). Templates in linked repositories carry their own licenses.
