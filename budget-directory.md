---
layout: default
title: Budget Portals
permalink: /budget
---
# Budget Transparency Portal Directory

A community-maintained directory of **budget transparency portals** for Philippine LGUs — sites that show citizens every budget project for one province, city, or municipality, built on the public [BetterGov.ph Budget API](https://budget.bettergov.ph/docs) behind the national [budget.bettergov.ph](https://budget.bettergov.ph).

A budget portal is either part of an LGU's [Better LGU portal]({{ site.baseurl }}./) or a site of its own. Both are listed here — check this table before you build, so you can join an existing effort instead of duplicating it.

## 💰 Directory

<div class="mb-8 flex flex-col md:flex-row gap-4 items-center max-w-4xl">
    <div class="relative flex-1 w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
        </div>
        <label for="budget-search" class="sr-only">Search budget portals</label>
        <input type="text" id="budget-search" oninput="filterBudget()" placeholder="Search by LGU, portal, or maintainer..." class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm">
    </div>
    <div class="w-full md:w-56">
        <label for="type-filter" class="sr-only">Filter by type</label>
        <select id="type-filter" onchange="filterBudget()" class="block w-full px-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm cursor-pointer">
            <option value="">All Types</option>
            <option value="Integrated">🧩 Integrated</option>
            <option value="Standalone">🏛️ Standalone</option>
        </select>
    </div>
    <div class="w-full md:w-56">
        <label for="budget-status-filter" class="sr-only">Filter by status</label>
        <select id="budget-status-filter" onchange="filterBudget()" class="block w-full px-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm cursor-pointer">
            <option value="">All Statuses</option>
            <option value="Active">🟢 Active</option>
            <option value="Work in Progress">🟡 Work in Progress</option>
            <option value="Unmaintained">🔴 Unmaintained</option>
            <option value="Planned">🔵 Planned</option>
        </select>
    </div>
</div>

<div id="budget-table-container" class="table-wrapper" markdown="1">

| LGU | Budget Portal | Type | Better LGU Portal | Repository | Status | Maintainer/s |
|-----|---------------|------|-------------------|------------|--------|--------------|
{% for p in site.data.budget_portals %}| {{ p.name }} | {{ p.portal }} | {{ p.type }} | {{ p.parent_domain }} | {{ p.repo }}{% if p.repo_owner %}<br><span class="repo-activity" data-repo="{{ p.repo_owner }}/{{ p.repo_name }}"></span>{% endif %} | {{ p.status }} | {{ p.maintainer }} |
{% endfor %}

</div>

<div id="budget-no-results" class="hidden text-center py-12 text-gray-500">
    No budget portals match your search.
</div>

<p class="text-sm text-gray-500">
    Showing <span id="budget-count">{{ site.data.budget_portals | size }}</span> of {{ site.data.budget_portals | size }} budget portals.
</p>

> Want to add your budget portal? See [Adding a Budget Portal]({{ site.baseurl }}CONTRIBUTING#adding-a-budget-portal).

## 🧭 Portal Types

| Type          | Meaning                                                                                                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| 🧩 Integrated | Part of the LGU's Better LGU portal — a subdomain (`budget.betterlb.org`) or a path (`bettercatanduanes.org/transparency`) |
| 🏛️ Standalone | A budget portal on its own, with no Better LGU portal behind it (`bettersilang.org`)                                      |

## 🚦 Status Legend

| Badge               | Meaning                                         |
|---------------------|-------------------------------------------------|
| 🟢 Active           | Live and kept current with the budget data      |
| 🟡 Work in Progress | Under development, not yet publicly launched    |
| 🔴 Unmaintained     | No longer being actively maintained             |
| 🔵 Planned          | Registered intent — development not yet started |

## 🚀 Getting Started

Ready to build one? Read **[How to Start Your Budget Transparency Portal]({{ site.baseurl }}BUDGET_GUIDE)** and pick a [budget portal template]({{ site.baseurl }}BUDGET_TEMPLATES).

<script defer src="{{ site.baseurl }}assets/js/repo-activity.js?v={{ site.time | date: '%s' }}"></script>

<script>
function filterBudget() {
    const search = document.getElementById("budget-search").value.toUpperCase();
    const type = document.getElementById("type-filter").value.toUpperCase();
    const status = document.getElementById("budget-status-filter").value.toUpperCase();
    const container = document.getElementById("budget-table-container");
    const rows = container.querySelectorAll("tbody tr");
    let shown = 0;

    rows.forEach(function (row) {
        const td = row.getElementsByTagName("td");
        // Column order: LGU, Budget Portal, Type, Better LGU Portal, Repository, Status, Maintainer/s
        const typeMatch = type === "" || td[2].textContent.toUpperCase().includes(type);
        const statusMatch = status === "" || td[5].textContent.toUpperCase().includes(status);
        const searchMatch = search === "" || row.textContent.toUpperCase().includes(search);
        const visible = typeMatch && statusMatch && searchMatch;
        row.style.display = visible ? "" : "none";
        if (visible) shown++;
    });

    container.style.display = shown === 0 ? "none" : "";
    document.getElementById("budget-no-results").classList.toggle("hidden", shown !== 0);
    document.getElementById("budget-count").textContent = shown;
}
</script>
