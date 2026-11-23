---
layout: default
title: Home
---
# BetterGov.ph — LGU Directory

A community-maintained directory of **Better LGU** digital transparency portals across the Philippines — find an existing portal before you build, contribute to one, or start your own. Each entry links to the LGU's portal, source repository, and social pages, along with its current maintenance status.

## 📋 Directory

<!-- Interactive Search, Filters and Sort (#448). Styles: .directory-controls in assets/css/style.css. -->
<div class="directory-controls">
    <div class="dc-search">
        <svg class="dc-search__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input type="search" id="lgu-search" oninput="filterDirectory()" aria-label="Search LGUs" placeholder="Search LGU, province or region" class="dc-search__input">
    </div>
    <div class="dc-fields">
        <div class="dc-field dc-field--region">
            <label for="region-filter" class="dc-label">Region</label>
            <select id="region-filter" onchange="filterDirectory()" class="dc-select">
                <option value="">All regions</option>
                {%- for region in site.data.regions %}
                <option value="{{ region.name | escape }}">{{ region.psgc_name | default: region.name }}</option>
                {%- endfor %}
            </select>
        </div>
        <div class="dc-field">
            <label for="status-filter" class="dc-label">Status</label>
            <select id="status-filter" onchange="filterDirectory()" class="dc-select">
                <option value="">All statuses</option>
                <option value="Active">🟢 Active</option>
                <option value="Work in Progress">🟡 Work in Progress</option>
                <option value="Unmaintained">🔴 Unmaintained</option>
                <option value="Planned">🔵 Planned</option>
            </select>
        </div>
        <div class="dc-field">
            <label for="sort-preset" class="dc-label">Sort by</label>
            <select id="sort-preset" onchange="sortDirectory()" class="dc-select">
                <option value="location" selected>Location</option>
                <option value="name">Name A–Z</option>
                <option value="status">Status</option>
            </select>
        </div>
    </div>
    <div class="dc-toggles">
        <div role="group" aria-labelledby="kind-label" class="dc-kinds">
            <span id="kind-label" class="dc-label dc-label--inline">Kind</span>
            {%- assign kinds = "city,municipality,province,region" | split: "," -%}
            {%- for kind in kinds %}
            <button type="button" class="kind-chip" data-kind="{{ kind }}" aria-pressed="false" onclick="toggleKind(this)">{{ kind | capitalize }}</button>
            {%- endfor %}
        </div>
        <label for="adoption-filter" class="dc-adoption">
            <input type="checkbox" id="adoption-filter" onchange="filterDirectory()" class="dc-adoption__input">
            <span>🤝 Open for adoption</span>
        </label>
    </div>
</div>

<div id="lgu-table-container" class="table-wrapper" markdown="1">

| LGU                             | Domain                                                | Repository                                                                     | Socials                                                            | Status    | Maintainer/s                                                                           |
|---------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------|
{%- comment -%}
Rendered in Location order (#448; CONTEXT.md, Sort Order): region rank, then
folded province, then level, then folded place. This must match byLocation()
in assets/js/directory-sort.js, which re-sorts by the data-* keys below.
Liquid's sort takes one key, so each Entry gets one composite string key,
fields joined by "!":
  0 region rank + 100 (so it compares as fixed-width text)
  1 folded province   2 level   3 folded place
  4 status rank       5 "Province · Region" line   6 index into lgus
"!" sorts below every folded character, so an empty province (a region row)
and a shorter name sort first. Fields 4 to 6 never decide the order: no two
Entries share fields 0 to 3. Fold = slugify "latin" with the hyphens removed,
the same result as fold() in scripts/lgu-name.js.
{%- endcomment -%}
{%- assign location_keys = "" | split: "" -%}
{%- for lgu in site.data.lgus -%}
  {%- case lgu.kind -%}
    {%- when "region" -%}{%- assign level = 0 -%}{%- assign where = "" -%}
    {%- when "province" -%}{%- assign level = 1 -%}{%- assign where = lgu.region -%}
    {%- else -%}{%- assign level = 2 -%}{%- assign where = lgu.province | append: " · " | append: lgu.region -%}
  {%- endcase -%}
  {%- if lgu.status contains "Active" -%}{%- assign status_rank = 0 -%}
  {%- elsif lgu.status contains "Work in Progress" -%}{%- assign status_rank = 1 -%}
  {%- elsif lgu.status contains "Planned" -%}{%- assign status_rank = 2 -%}
  {%- elsif lgu.status contains "Unmaintained" -%}{%- assign status_rank = 3 -%}
  {%- else -%}{%- assign status_rank = 4 -%}{%- endif -%}
  {%- assign province_key = lgu.province | slugify: "latin" | remove: "-" -%}
  {%- assign place_key = lgu.place | slugify: "latin" | remove: "-" -%}
  {%- capture key -%}{{ lgu.region_rank | plus: 100 }}!{{ province_key }}!{{ level }}!{{ place_key }}!{{ status_rank }}!{{ where }}!{{ forloop.index0 }}{%- endcapture -%}
  {%- assign location_keys = location_keys | push: key -%}
{%- endfor -%}
{%- assign location_keys = location_keys | sort %}
{% for key in location_keys %}{% assign key_parts = key | split: "!" %}{% assign i = key_parts[6] | plus: 0 %}{% assign lgu = site.data.lgus[i] %}| <span class="lgu-entry" data-region-rank="{{ key_parts[0] | minus: 100 }}" data-province="{{ key_parts[1] }}" data-level="{{ key_parts[2] }}" data-place="{{ key_parts[3] }}" data-status-rank="{{ key_parts[4] }}" data-region="{{ lgu.region | escape }}" data-kind="{{ lgu.kind }}"><span class="sr-only">{{ lgu.name }} </span><span aria-hidden="true"><span class="lgu-place">{% if lgu.kind == "province" %}{{ lgu.name }}{% else %}{{ lgu.place }}{% if lgu.kind == "city" %} City{% endif %}{% endif %}</span> {% if key_parts[5] != "" %}<span class="lgu-where">{{ key_parts[5] }}</span>{% endif %}</span></span> | {{ lgu.domain }} | {{ lgu.repo }}{% if lgu.repo_owner %}<br><span class="repo-activity" data-repo="{{ lgu.repo_owner }}/{{ lgu.repo_name }}"></span>{% endif %} | {% if lgu.socials and lgu.socials.size > 0 %}<span class="inline-flex items-center gap-3 flex-wrap">{% for s in lgu.socials %}{% include social-icon.html label=s.label url=s.url %}{% endfor %}</span>{% else %}-{% endif %} | {{ lgu.status }}{% if lgu.stale %}<br><span class="lgu-tag lgu-tag-stale">⚠️ Stale</span>{% endif %} | {% include maintainer-links.html maintainers=lgu.maintainers fallback=lgu.maintainer %}{% if lgu.open_for_adoption %}<br><span class="lgu-tag lgu-tag-adoption">🤝 Open for Adoption</span>{% endif %} |
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
    <button type="button" onclick="clearFilters()" class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Clear all filters</button>
</div>

> Want to add your LGU? See the [Contributing Guide](CONTRIBUTING.md).

## 🚦 Status Legend

The directory is sorted by location by default (regions north to south, then province A–Z, each province's own portal before its cities and municipalities); use **Sort by** to list it by name or status instead.

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
| ⚠️ Stale             | A `🔵 Planned` entry with no directory activity for over 30 days, or a `🟡 Work in Progress` entry whose check-ins went unanswered |
| 🤝 Open for Adoption | Anyone may take the entry on — as a takeover, or alongside the original maintainer. Appears on stale entries and on `🔴 Unmaintained` ones |

</div>

**Adopting an entry?** Open a PR that updates the Maintainer/s column and removes the tags. A stale entry keeps its status — a `🔵 Planned` one changes only when the work actually starts. An `🔴 Unmaintained` entry takes the status that matches reality (`🟡 Work in Progress` or `🟢 Active`). Any discussion happens in that PR.

Tags are applied by Directory Maintainers during periodic reviews, never automatically — time since the last update is a prompt to look, not the only thing that decides it. Work in Progress entries are followed up in [check-ins](CONTRIBUTING.md#check-ins) and go stale only if those go unanswered. Only `🟢 Active` entries become `🔴 Unmaintained`.

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

Content in this repository is licensed under [CC BY 4.0](https://github.com/jmacj/better-lgu-directory/blob/main/LICENSE). Templates in linked repositories carry their own licenses.

<!-- Repository activity (#162) — fills in the "Updated N days ago" line under
     each row's GitHub link. See assets/js/repo-activity.js. -->
<script defer src="{{ '/assets/js/repo-activity.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>

<script src="{{ '/assets/js/directory-sort.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>

<!-- Search, Filter, Sort and Pagination Script -->
<script>
let currentPage = 1;
let itemsPerPage = 10;
let visibleRows = [];

function updateItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById("items-per-page").value);
    currentPage = 1;
    updatePage();
}

// Kind chips (#448): none pressed means every kind.
function toggleKind(chip) {
    chip.setAttribute("aria-pressed", chip.getAttribute("aria-pressed") === "true" ? "false" : "true");
    filterDirectory();
}

// Re-sorts the rows for the chosen preset, then re-applies the filters and
// search, which also returns to page 1 (#448).
function sortDirectory() {
    const tbody = document.querySelector("#lgu-table-container tbody");
    if (tbody && window.DirectorySort) {
        window.DirectorySort.applySort(tbody, document.getElementById("sort-preset").value);
    }
    filterDirectory();
}

// Clears search and filters; keeps the sort.
function clearFilters() {
    document.getElementById("lgu-search").value = "";
    document.getElementById("status-filter").value = "";
    document.getElementById("region-filter").value = "";
    document.getElementById("adoption-filter").checked = false;
    document.querySelectorAll(".kind-chip").forEach(chip => chip.setAttribute("aria-pressed", "false"));
    filterDirectory();
}

function filterDirectory() {
    const searchText = document.getElementById("lgu-search").value.toUpperCase();
    const statusFilter = document.getElementById("status-filter").value.toUpperCase();
    const regionFilter = document.getElementById("region-filter").value;
    const kinds = Array.from(document.querySelectorAll('.kind-chip[aria-pressed="true"]')).map(chip => chip.dataset.kind);
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

        // Region and kind come from the build's data-* keys (#448).
        const entry = td[0].querySelector(".lgu-entry").dataset;
        const regionMatch = regionFilter === "" || entry.region === regionFilter;
        const kindMatch = kinds.length === 0 || kinds.includes(entry.kind);
        const filterMatch = statusMatch && adoptionMatch && regionMatch && kindMatch;

        // The LGU cell's text holds the full name, place, province and
        // region, so search matches all of them.
        let searchMatch = false;
        if (filterMatch) {
            for (let j = 0; j < td.length; j++) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(searchText) > -1) {
                    searchMatch = true;
                    break;
                }
            }
        }

        if (filterMatch && searchMatch) {
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
// The build renders Location order. A browser restoring form state on back
// navigation may keep another preset selected, so sort to match it.
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("sort-preset").value !== "location") {
        sortDirectory();
    } else {
        filterDirectory();
    }
});
</script>
