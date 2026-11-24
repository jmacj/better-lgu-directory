# Funding Policy

This policy covers money around the BetterLGU Directory: the directory itself, every portal listed in [`README.md`](README.md) and [`BUDGET.md`](BUDGET.md), and the people who maintain them. It says who may fund a portal, what a funded portal must tell the public, how a portal shows it's seeking funding, and what happens when the rules are broken. The terms in **bold** are defined in [`CONTEXT.md`](CONTEXT.md).

## The short version

- Support goes straight to portals and Maintainers, never through the directory.
- A listed portal or a Maintainer may take money, but never from an **Excluded Funder**: a candidate, political party, or campaign, or the elected officials of the LGU the portal covers and their families.
- A portal with Funders names them on the portal.
- A live portal can show it's seeking funding with the `🌱 Seeking Funding` tag, which links to a funding page on the portal's own site.
- Breaking the rules gets 14 days to fix, then the Entry's row is removed.

## Disclaimer

Listed portals are independently run and funded. BetterGov.ph and the BetterLGU Directory do not receive, hold, vet, or endorse any portal's funding. A `🌱 Seeking Funding` tag means the portal's Maintainers asked to be listed as seeking support and that a Directory Maintainer checked their funding page showed the required information on the day the tag was added. It is not a recommendation, an audit, or an appeal by the LGU government. Money given to a portal goes to its Maintainers, under their own arrangements, at your own judgement.

## Where the money goes

The BetterLGU Directory costs ₱0 to maintain. The site is hosted free on GitHub Pages, its address is a subdomain provided by BetterGov.ph, and its automation runs on free GitHub Actions. The only thing it takes is the time and effort of its Maintainers.

With nothing to pay for, the directory has no Funders. Support goes straight to portals and Maintainers, never through the directory: there is no Sponsor button, no donation link, and no shared fund. People who want to support the time Maintainers give, Directory Maintainers included, can do it directly through **Personal Support** (below).

## Who counts as a Funder

A **Funder** is anyone who gives a portal or a Maintainer money or branded in-kind support: paid hosting, a domain, a paid service. Gifts, grants, paid placements, and someone quietly paying a bill all count. Volunteer time and the unbranded free tiers of hosting providers don't.

## Excluded Funders

No listed portal and no Maintainer may accept funding from an **Excluded Funder**, even if it's disclosed:

- a candidate, political party, or campaign, at any level of government;
- a sitting elected official of the LGU the portal covers, or a member of their immediate family.

A portal paid for by the people it reports on, or by anyone running for office, stops being a transparency portal and starts being publicity, whatever it publishes.

The LGU government as an institution is **not** an Excluded Funder. If your LGU office pays part of your hosting, or gives you a grant through its normal processes, that's allowed as long as you disclose it. Institutional support leaves a public record, and it lets an LGU that wants to cooperate do so openly.

The same rule applies to every portal in the directory: Entries in `README.md`, whatever their status, and Budget Portals in `BUDGET.md`.

## Funding Disclosure

Any listed portal with Funders names them on the portal itself, in a place a visitor can find. This is the **Funding Disclosure**. A portal that asks the government to be open about money should be open about its own. Naming Funders lets visitors and funders judge for themselves whether a portal is independent. Amounts are encouraged but not required. A portal with no Funders doesn't need to say anything, unless it carries the `🌱 Seeking Funding` tag (below).

## Personal Support

A Maintainer can accept support as a person, across all the portals they work on, by adding a `support` link to their [Maintainer Profile](maintainers/README.md). It's one link: Ko-fi, GitHub Sponsors, Open Collective, or a page of your own. The website shows it on your profile with the disclaimer above.

Personal Support follows the same Excluded Funder rule. Directory Maintainers may use it too; it's the only way the directory's own work is supported.

## The 🌱 Seeking Funding tag

A Maintainer can show their portal is seeking funding by adding the `🌱 Seeking Funding` tag to their Entry. The website shows it as a badge under the portal link, never beside the LGU name, and lets visitors filter to portals seeking funding. The tag belongs to the portal: it invites support for the volunteer-run site, not the LGU government.

### Who can use it

Only a portal that is live:

- a `🟢 Active` Entry, or
- a `🟡 Work in Progress` Entry whose portal is already deployed (it has a Domain).

A `🔵 Planned` Entry can't seek funding: deploy first. Free host addresses such as `your-portal.vercel.app` or `your-portal.pages.dev` count. A `⚠️ Stale` or `🔴 Unmaintained` Entry can't carry the tag either, because it has no active Maintainer to receive the money; the Directory Maintainer who applies either tag removes the funding tag in the same pull request. Budget Portals never carry the tag, though the Excluded Funder and Funding Disclosure rules still apply to them.

### The funding page

The tag always links to a funding page on the portal's own site: the portal's host or a subdomain of it. External platforms such as Open Collective, Ko-fi, GitHub Sponsors, or a bank or e-wallet link are fine as the way to give, linked from that page. The page itself must show:

1. Who runs the portal (its Maintainer/s).
2. What the money is for, in plain words. Funding can go toward whatever the portal needs, such as hosting, a domain, or paid data and tools. Whatever it covers, the page has to say so, so funders know what they're paying for.
3. How to give, at least one way.
4. Current Funders (your Funding Disclosure), or "No funders yet".
5. A statement that the portal takes no funding from Excluded Funders.

How much you've received is welcome but not required.

### Adding the tag

Add the tag as a second line in your Entry's Domain cell, under the portal link:

```
| Your LGU Name | [betteryourlgu.org](https://betteryourlgu.org)<br>[🌱 Seeking Funding](https://betteryourlgu.org/support) | ... |
```

The portal link stays first. Open a pull request titled `Update [LGU Name] — seeking funding`. It's labelled `funding`, and a Directory Maintainer opens your funding page and checks it against the list above before merging.

The README sync rejects the tag without a link, on an Entry with no Domain, on any status other than `🟢 Active` or `🟡 Work in Progress`, on a `⚠️ Stale` Entry, and when the funding page isn't on the portal's host.

### Removing the tag

Open a normal pull request deleting the second line whenever you stop seeking funding. No reason needed.

The directory checks every funding page periodically and flags dead ones to a Directory Maintainer. Nothing removes the tag automatically: a Directory Maintainer follows up with you first.

## Enforcement

Directory Maintainers don't audit portals' funding. They act on reports.

1. Anyone can open a **[Report Funding Concern](https://github.com/jmacj/better-lgu-directory/issues/new?template=report-funding-concern.md)** issue (labelled `funding`), naming the Entry or Maintainer, the Funder, why it breaks this policy, and public evidence.
2. A Directory Maintainer reviews it. If it holds up, they tag the Maintainer/s on the issue.
3. The Maintainer/s have **14 days** to fix it: return or stop the excluded funding, or publish the missing disclosure.
4. If it isn't fixed, the Entry's row is removed (or the Budget Portal's, or the Maintainer Profile's `support` link). A Directory Maintainer who maintains the portal in question stays out of the decision.

Removal isn't permanent. Once the portal complies, it can be listed again with a normal pull request.

Stick to public facts about funding in reports, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Don't post private information about anyone.

## Questions

Ask in [Discussions](https://github.com/jmacj/better-lgu-directory/discussions/categories/q-a), or email **jan@jmacj.dev** privately.
