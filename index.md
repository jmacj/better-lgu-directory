---
layout: default
title: Home
---
# BetterGov.ph — LGU Directory

A community-maintained directory of **Better LGU** digital transparency portals across the Philippines. Each entry links to the LGU's portal, source repository, and Facebook page, along with its current maintenance status.

## 📋 Directory

<!-- Interactive Search -->
<div class="mb-8 relative max-w-md">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
    </div>
    <input type="text" id="lgu-search" onkeyup="filterDirectory()" placeholder="Search LGUs by name, status, or maintainer..." class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-all shadow-sm">
</div>

<div id="lgu-table-container" markdown="1">

| LGU                             | Domain                                                | Repository                                                                     | Facebook                                                           | Status    | Maintainer/s                                                                           |
|---------------------------------|-------------------------------------------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------|
{% for lgu in site.data.lgus %}| {{ lgu.name }} | {% if lgu.domain != "—" and lgu.domain != "-" %}[{{ lgu.domain | replace: "https://", "" | replace: "http://", "" | remove: "/" }}]({{ lgu.domain }}){% else %}-{% endif %} | {% if lgu.repo != "—" and lgu.repo != "-" %}[GitHub]({{ lgu.repo }}){% else %}-{% endif %} | {% if lgu.facebook != "—" and lgu.facebook != "-" %}[Facebook]({{ lgu.facebook }}){% else %}-{% endif %} | {{ lgu.status }} | {{ lgu.maintainer }} |
{% endfor %}

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
    <button onclick="document.getElementById('lgu-search').value=''; filterDirectory();" class="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">Clear search</button>
</div>

> Want to add your LGU? See the [Contributing Guide](CONTRIBUTING.md).

## 🚦 Status Legend

| Badge               | Meaning                                         |
|---------------------|-------------------------------------------------|
| 🟢 Active           | Actively maintained with regular updates        |
| 🟡 Work in Progress | Under development, not yet publicly launched    |
| 🔴 Unmaintained     | No longer being actively maintained             |
| 🔵 Planned          | Registered intent — development not yet started |

## 🧩 Community Templates

These templates are provided by the community to help you get started quickly.

| Template                 | Stack              | Repository                                             | Description                                                 |
|--------------------------|--------------------|--------------------------------------------------------|-------------------------------------------------------------|
| Better Solano Starter    | React + TypeScript | [GitHub](https://github.com/BetterSolano/bettersolano) | Starter template based on the BetterSolano implementation   |
| Better Los Baños Starter | React + TypeScript | [GitHub](https://github.com/BetterLosBanos/betterlb)   | Starter template based on the BetterLosBaños implementation |
| Better Local Gov         | React + TypeScript | [GitHub](https://github.com/iyanski/betterlocalgov)    | Local Government Website Starter Kit                        |

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

<!-- Search Script -->
<script>
function filterDirectory() {
    const input = document.getElementById("lgu-search");
    const filter = input.value.toUpperCase();
    const container = document.getElementById("lgu-table-container");
    const table = container.getElementsByTagName("table")[0];
    const tr = container.getElementsByTagName("tr");
    const noResults = document.getElementById("no-results");
    let visibleCount = 0;

    for (let i = 1; i < tr.length; i++) {
        let found = false;
        const td = tr[i].getElementsByTagName("td");
        for (let j = 0; j < td.length; j++) {
            const txtValue = td[j].textContent || td[j].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        if (found) {
            tr[i].style.display = "";
            visibleCount++;
        } else {
            tr[i].style.display = "none";
        }
    }

    if (visibleCount === 0) {
        if (table) table.style.display = "none";
        noResults.classList.remove("hidden");
    } else {
        if (table) table.style.display = "";
        noResults.classList.add("hidden");
    }
}
</script>
