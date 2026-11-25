---
layout: default
title: BetterGov.ph — LGU Budget Transparency Portal Directory
permalink: /budget
container: page
---
<!-- Page intro: two lede paragraphs side by side from 1024px. -->
<div class="lede prose-columns" markdown="1">
<div markdown="1">

A community-maintained directory of **budget transparency portals** for Philippine LGUs — sites that show citizens every budget project for one province, city, or municipality, built on the public [BetterGov.ph Budget API](https://budget.bettergov.ph/docs) behind the national [budget.bettergov.ph](https://budget.bettergov.ph).

</div>
<div markdown="1">

A budget portal is either part of an LGU's [Better LGU portal]({{ '/' | relative_url }}) or a site of its own. Every portal listed here is live — check this table before you build, so you can contribute to an existing one instead of publishing a second.

</div>
</div>

## Directory

<!-- Same controls as the LGU directory (.directory-controls in
     assets/css/style.css): a big search field and a flat filter above the table. -->
<div class="not-prose directory-controls">
    <div class="dc-search">
        <svg class="dc-search__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <label for="budget-search" class="sr-only">Search budget portals by LGU, portal or maintainer</label>
        <input type="search" id="budget-search" oninput="filterBudget()" placeholder="Try: Catanduanes" autocomplete="off" class="dc-search__input">
    </div>
    <div class="dc-fields">
        <div class="dc-field">
            <label for="type-filter" class="dc-label">Type</label>
            <select id="type-filter" onchange="filterBudget()" class="dc-select">
                <option value="">All types</option>
                <option value="Integrated">🧩 Integrated</option>
                <option value="Standalone">🏛️ Standalone</option>
            </select>
        </div>
    </div>
</div>

<div id="budget-table-container" class="table-wrapper" markdown="1">

| LGU | Budget Portal | Type | Better LGU Portal | Repository | Maintainer/s |
|-----|---------------|------|-------------------|------------|--------------|
{% for p in site.data.budget_portals %}| {{ p.name }} | {{ p.portal }} | {{ p.type }} | {{ p.parent_domain | default: "-" }} | {{ p.repo }}{% if p.repo_owner %}<br><span class="repo-activity" data-repo="{{ p.repo_owner }}/{{ p.repo_name }}"></span>{% endif %} | {% include maintainer-links.html maintainers=p.maintainers fallback=p.maintainer %} |
{% endfor %}

</div>

<div id="budget-no-results" class="not-prose hidden empty-state">
    <h3 class="empty-state__title">No budget portals found</h3>
    <p class="empty-state__body">No budget portals match your search and filter.</p>
    <button type="button" onclick="clearBudgetFilters()" class="btn btn--ghost">Clear all filters</button>
</div>

<p class="not-prose dc-pagination" aria-live="polite">
    <span>Showing <strong id="budget-count">{{ site.data.budget_portals | size }}</strong> of <strong>{{ site.data.budget_portals | size }}</strong> budget portals.</span>
</p>

> Want to add your budget portal? See [Adding a Budget Portal]({{ '/contributing' | relative_url }}#adding-a-budget-portal).

## Portal types

<div class="table-wrapper" markdown="1" tabindex="0" role="region" aria-label="Portal types">

| Type          | Meaning                                                                                                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| 🧩 Integrated | Part of the LGU's Better LGU portal — a subdomain (`budget.betterlb.org`) or a path (`bettercatanduanes.org/transparency`) |
| 🏛️ Standalone | A budget portal on its own, with no Better LGU portal behind it (`bettersilang.org`)                                      |

</div>

## Getting started

<!-- The three steps in the wide column; the next step and the note on amounts beside them. -->
<div class="prose-columns prose-columns--wide-left" markdown="1">
<div markdown="1">

Your province, city, or town can have one too — free, open source, and no server or database to run. Three steps, no advance registration:

1. **Fork** the [official template](https://github.com/bettergovph/transparency-portal) on GitHub
2. **Run `npm run setup`** and pick your LGU
3. **Deploy** it to Cloudflare, Vercel, or Netlify

</div>
<div markdown="1">

Then send us the link by [adding it to this directory]({{ '/contributing' | relative_url }}#adding-a-budget-portal). The full walkthrough is in **[How to Start Your Budget Transparency Portal]({{ '/budget-guide' | relative_url }})**; other starting points are in [Budget Portal Templates]({{ '/budget-templates' | relative_url }}).

Amounts on these portals are as published in the 2027 NEP and House Bill 10858, not spending. A project found in only one version is a candidate to check, not a finding.

</div>
</div>

<script defer src="{{ '/assets/js/repo-activity.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>

<script>
function filterBudget() {
    const search = document.getElementById("budget-search").value.toUpperCase();
    const type = document.getElementById("type-filter").value.toUpperCase();
    const container = document.getElementById("budget-table-container");
    const rows = container.querySelectorAll("tbody tr");
    let shown = 0;

    rows.forEach(function (row) {
        const td = row.getElementsByTagName("td");
        // Column order: LGU, Budget Portal, Type, Better LGU Portal, Repository, Maintainer/s
        const typeMatch = type === "" || td[2].textContent.toUpperCase().includes(type);
        const searchMatch = search === "" || row.textContent.toUpperCase().includes(search);
        const visible = typeMatch && searchMatch;
        row.style.display = visible ? "" : "none";
        if (visible) shown++;
    });

    container.style.display = shown === 0 ? "none" : "";
    document.getElementById("budget-no-results").classList.toggle("hidden", shown !== 0);
    document.getElementById("budget-count").textContent = shown;
}

// The empty result's one-click way back: clears the search and the type.
function clearBudgetFilters() {
    document.getElementById("budget-search").value = "";
    document.getElementById("type-filter").value = "";
    filterBudget();
}
</script>
