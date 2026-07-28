---
layout: default
title: Home
---
# BetterGov.ph — LGU Directory

A community-maintained directory of **Better LGU** digital transparency portals across the Philippines — find an existing portal before you build, contribute to one, or start your own. Each entry links to the LGU's portal, source repository, and social pages, along with its current maintenance status.

## 📋 Directory

<!-- Interactive Search and Filters -->
<div class="mb-8 flex flex-col md:flex-row gap-4 items-center max-w-4xl">
    <div class="relative flex-1 w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
        </div>
        <input type="text" id="lgu-search" onkeyup="filterDirectory()" placeholder="Search LGUs by name, status, tag, or maintainer..." class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm">
    </div>
    <div class="w-full md:w-64">
        <select id="status-filter" onchange="filterDirectory()" class="block w-full px-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm cursor-pointer">
            <option value="">All Statuses</option>
            <option value="Active">🟢 Active</option>
            <option value="Work in Progress">🟡 Work in Progress</option>
            <option value="Unmaintained">🔴 Unmaintained</option>
            <option value="Planned">🔵 Planned</option>
        </select>
    </div>
    <div class="w-full md:w-auto shrink-0">
        <label for="adoption-filter" class="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-xl bg-white shadow-sm sm:text-sm cursor-pointer transition-all">
            <input type="checkbox" id="adoption-filter" onchange="filterDirectory()" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer">
            <span class="font-medium text-gray-700 whitespace-nowrap">🤝 Open for adoption</span>
        </label>
    </div>
</div>

<div id="lgu-table-container" class="table-wrapper" markdown="1">

| LGU                             | Domain                                                | Repository                                                                     | Socials                                                            | Status    | Maintainer/s                                                                           |
|---------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------|
{% for lgu in site.data.lgus %}| {{ lgu.name }} | {{ lgu.domain }} | {{ lgu.repo }} | {% if lgu.socials and lgu.socials.size > 0 %}<span class="inline-flex items-center gap-3 flex-wrap">{% for s in lgu.socials %}{% include social-icon.html label=s.label url=s.url %}{% endfor %}</span>{% else %}-{% endif %} | {{ lgu.status }}{% if lgu.stale %}<br><span class="lgu-tag lgu-tag-stale">⚠️ Stale</span>{% endif %} | {{ lgu.maintainer }}{% if lgu.open_for_adoption %}<br><span class="lgu-tag lgu-tag-adoption">🤝 Open for Adoption</span>{% endif %} |
{% endfor %}

</div>

<!-- Pagination Controls -->
<div id="pagination-controls" class="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
    <div class="flex flex-col sm:flex-row items-center gap-4">
        <div class="text-sm text-gray-500 font-medium">
            Showing <span id="showing-start" class="text-gray-900">0</span> to <span id="showing-end" class="text-gray-900">0</span> of <span id="total-results" class="text-gray-900">0</span> LGUs
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <label for="items-per-page">Per page:</label>
            <select id="items-per-page" onchange="updateItemsPerPage()" class="px-2 py-1 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    </div>
    <div class="flex items-center gap-3">
        <button id="prev-btn" onclick="changePage(-1)" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
        </button>
        <button id="next-btn" onclick="changePage(1)" class="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
        </button>
    </div>
</div>

<!-- No Results View -->
<div id="no-results" class="hidden py-12 text-center bg-white border border-gray-100 rounded-2xl shadow-xs animate-fade-in">
    <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-50 rounded-full">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-900">No LGUs found</h3>
    <p class="mt-1 text-gray-500">We couldn't find any LGUs matching your search. Try a different keyword or LGU name.</p>
    <button onclick="document.getElementById('lgu-search').value=''; document.getElementById('status-filter').value=''; document.getElementById('adoption-filter').checked=false; filterDirectory();" class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Clear all filters</button>
</div>

> Want to add your LGU? See the [Contributing Guide](CONTRIBUTING.md).

## 🚦 Status Legend

<div class="table-wrapper" markdown="1">

| Badge               | Meaning                                         |
|---------------------|-------------------------------------------------|
| 🟢 Active           | Actively maintained with regular updates        |
| 🟡 Work in Progress | Under development, not yet publicly launched    |
| 🔴 Unmaintained     | No longer being actively maintained             |
| 🔵 Planned          | Registered intent — development not yet started |

</div>

### Secondary Tags

<div class="table-wrapper" markdown="1">

| Tag                  | Meaning                                                                           |
|----------------------|-----------------------------------------------------------------------------------|
| ⚠️ Stale             | A `🔵 Planned` entry with no directory activity for over 30 days                   |
| 🤝 Open for Adoption | Anyone may take the entry on — as a takeover, or alongside the original maintainer |

</div>

**Adopting a stale entry?** Open a PR that updates the Maintainer/s column and removes both tags. The status can stay `🔵 Planned` — change it only when the work actually starts. Any discussion happens in that PR.

Tags are applied by the repository maintainers during periodic reviews, never automatically — time since the last update is a prompt to look, not the only thing that decides it.

## 🧩 Community Templates

These templates are provided by the community to help you get started quickly.

<div class="table-wrapper" markdown="1">

| Template                 | Stack              | Repository                                             | Description                                                 |
|--------------------------|--------------------|--------------------------------------------------------|-------------------------------------------------------------|
| Better Solano Starter    | React + TypeScript | [GitHub](https://github.com/BetterSolano/bettersolano) | Starter template based on the BetterSolano implementation   |
| Better Los Baños Starter | React + TypeScript | [GitHub](https://github.com/BetterLosBanos/betterlb)   | Starter template based on the BetterLosBaños implementation |
| Better Local Gov         | React + TypeScript | [GitHub](https://github.com/iyanski/betterlocalgov)    | Local Government Website Starter Kit                        |

</div>

> Have a template to contribute? Open a PR and add it to this table and to [TEMPLATES.md](TEMPLATES.md).

## 🚀 Getting Started

Ready to build a transparency portal for your LGU? Read the full guide: **[How to Start Your Better LGU Portal](GUIDE.md)**

The short version:
1. Fork or clone a [community template](TEMPLATES.md)
2. Open a PR to this repository to register your LGU (even if you're still planning)
3. Build, launch, and keep it updated

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or update an LGU entry, contribute a template, or improve this directory.

## 📄 License

Content in this repository is licensed under [CC BY 4.0](LICENSE). Templates in linked repositories carry their own licenses.

<!-- Search and Pagination Script -->
<script>
let currentPage = 1;
let itemsPerPage = 10;
let visibleRows = [];

function updateItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById("items-per-page").value);
    currentPage = 1;
    updatePage();
}

function filterDirectory() {
    const searchText = document.getElementById("lgu-search").value.toUpperCase();
    const statusFilter = document.getElementById("status-filter").value.toUpperCase();
    const adoptionOnly = document.getElementById("adoption-filter").checked;
    const container = document.getElementById("lgu-table-container");
    const table = container.getElementsByTagName("table")[0];
    const tr = container.getElementsByTagName("tr");
    const noResults = document.getElementById("no-results");
    const pagination = document.getElementById("pagination-controls");

    visibleRows = [];
    
    // Start from i=1 to skip header row
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td");
        if (td.length === 0) continue;

        const statusText = td[4].textContent.toUpperCase();
        const statusMatch = statusFilter === "" || statusText.includes(statusFilter);

        // The 🤝 Open for Adoption tag is rendered in the Maintainer/s cell.
        const adoptionMatch = !adoptionOnly || td[5].textContent.toUpperCase().includes("OPEN FOR ADOPTION");

        let searchMatch = false;
        if (statusMatch && adoptionMatch) {
            for (let j = 0; j < td.length; j++) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(searchText) > -1) {
                    searchMatch = true;
                    break;
                }
            }
        }

        if (statusMatch && adoptionMatch && searchMatch) {
            visibleRows.push(tr[i]);
        }
        tr[i].style.display = "none"; // Hide all rows initially
    }

    if (visibleRows.length === 0) {
        if (table) table.style.display = "none";
        noResults.classList.remove("hidden");
        pagination.classList.add("hidden");
    } else {
        if (table) table.style.display = "";
        noResults.classList.add("hidden");
        pagination.classList.remove("hidden");
        currentPage = 1;
        updatePage();
    }
}

function updatePage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Reset all visible rows to hidden first (they might have been shown from previous page)
    visibleRows.forEach(row => row.style.display = "none");

    // Show rows for current page
    for (let i = start; i < end && i < visibleRows.length; i++) {
        visibleRows[i].style.display = "";
    }

    // Update pagination info
    document.getElementById("showing-start").textContent = visibleRows.length > 0 ? start + 1 : 0;
    document.getElementById("showing-end").textContent = Math.min(end, visibleRows.length);
    document.getElementById("total-results").textContent = visibleRows.length;

    // Update button states
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = end >= visibleRows.length;
}

function changePage(delta) {
    currentPage += delta;
    updatePage();
    // Scroll to table top on page change
    document.getElementById("lgu-table-container").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    filterDirectory();
});
</script>
