# BetterGov.ph — Budget Transparency Portal Directory

A community-maintained directory of **budget transparency portals** for Philippine LGUs — sites that show citizens every budget project for one province, city, or municipality, built on the public [BetterGov.ph Budget API](https://budget.bettergov.ph/docs) behind the national [budget.bettergov.ph](https://budget.bettergov.ph).

A budget portal is either part of an LGU's Better LGU portal (`budget.betterlaspinas.org`, `bettercatanduanes.org/transparency`) or a site of its own (`bettersilang.org`). Both are listed here — check this table before you build, so you can join an existing effort instead of duplicating it.

---

## 💰 Directory

<!-- SYNC_BUDGET_TABLE_START -->

| LGU                          | Portal                                                                   | Type          | Repository                                         | Status    | Maintainer/s                                 |
|------------------------------|--------------------------------------------------------------------------|---------------|----------------------------------------------------|-----------|----------------------------------------------|
| Las Piñas City, Metro Manila | [budget.betterlaspinas.org](https://budget.betterlaspinas.org)           | 🧩 Integrated | [GitHub](https://github.com/betterlaspinas/budget) | 🟢 Active | -                                            |
| Los Baños, Laguna            | [budget.betterlb.org](https://budget.betterlb.org)                       | 🧩 Integrated | -                                                  | 🟢 Active | -                                            |
| Ilocos Norte Province        | [budget.betterilocosnorte.org](https://budget.betterilocosnorte.org)     | 🧩 Integrated | -                                                  | 🟢 Active | -                                            |
| Bukidnon Province            | [budget.betterbukidnon.org](https://budget.betterbukidnon.org)           | 🧩 Integrated | -                                                  | 🟢 Active | -                                            |
| Catanduanes Province         | [bettercatanduanes.org/transparency](https://bettercatanduanes.org/transparency) | 🧩 Integrated | -                                          | 🟢 Active | -                                            |
| Silang, Cavite               | [bettersilang.org](https://www.bettersilang.org)                         | 🏛️ Standalone | [GitHub](https://github.com/0xDataBear/bettersilang) | 🟢 Active | [@0xDataBear](https://github.com/0xDataBear) |
| Batangas Province            | [betterbatangas.org](https://betterbatangas.org)                         | 🏛️ Standalone | [GitHub](https://github.com/pogicodes/batangas-transparency-portal) | 🟢 Active | [@pogicodes](https://github.com/pogicodes) |

<!-- SYNC_BUDGET_TABLE_END -->

> Want to add your budget portal? See [Adding a Budget Portal](CONTRIBUTING.md#adding-a-budget-portal).

---

## 🧭 Portal Types

| Type          | Meaning                                                                                                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| 🧩 Integrated | Part of the LGU's Better LGU portal — a subdomain (`budget.betterlb.org`) or a path (`bettercatanduanes.org/transparency`) |
| 🏛️ Standalone | A budget portal on its own, with no Better LGU portal behind it (`bettersilang.org`)                                      |

An `🧩 Integrated` row's **LGU** must match that LGU's name in the [Better LGU Directory](README.md) exactly — the website links the two entries together, and the sync fails if no match is found. Register the Better LGU portal first if it isn't listed yet.

## 🚦 Status Legend

Budget portals are added once they're live, so there is no `🔵 Planned` status.

| Badge               | Meaning                                         |
|---------------------|-------------------------------------------------|
| 🟢 Active           | Live and kept current with the budget data      |
| 🟡 Work in Progress | Under development, not yet publicly launched    |
| 🔴 Unmaintained     | No longer being actively maintained             |

---

## 🚀 Getting Started

Ready to build one? Read **[How to Start Your Budget Transparency Portal](BUDGET_GUIDE.md)** and pick a [budget portal template](BUDGET_TEMPLATES.md).

The short version — no advance registration needed:
1. **Check** this table and the [Better LGU Directory](README.md) for your LGU
2. **Build and deploy** — fork the [official template](https://github.com/bettergovph/transparency-portal), run `npm run setup` for your LGU, and deploy
3. **Add it** — once it's live, open a PR adding your portal to this table as `🟢 Active`

---

## 📄 License

Content in this repository is licensed under [CC BY 4.0](LICENSE). Templates in linked repositories carry their own licenses.
