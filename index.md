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
| Solano, Nueva Vizcaya           | [bettersolano.org](https://bettersolano.org)          | [GitHub](https://github.com/BetterSolano/bettersolano)                         | [Facebook](https://www.facebook.com/bettersolano.org)              | 🟢 Active | [@ramonloganjr](https://github.com/ramonloganjr)                                       |
| Bacolod City, Negros Occidental | [betterbacolod.org](https://betterbacolod.org)        | [GitHub](https://github.com/betterbacolod/betterbacolod)                       | [Facebook](https://www.facebook.com/betterbacolod.org)             | 🟢 Active | [@mattenarle10](https://github.com/mattenarle10)                                       |
| Calauan, Laguna                 | [bettercaluan.org](https://bettercalauan.org)         | [GitHub](https://github.com/bettercalauan/bettercalauan/tree/react-typescript) | [Facebook](https://www.facebook.com/BetterCalauan.org)             | 🟢 Active | [@xpall](https://github.com/xpall)                                                     |
| Ormoc City, Leyte               | [betterormoc.org](https://www.betterormoc.org/en)     | -                                                                              | [Facebook](https://www.facebook.com/profile.php?id=61587167813676) | 🟢 Active | -                                                                                      |
| Los Baños, Laguna               | [betterlb.org](https://betterlb.org)                  | [GitHub](https://github.com/BetterLosBanos/betterlb)                           | [Facebook](https://www.facebook.com/BetterLB.org)                  | 🟢 Active | [@miconficker](https://github.com/miconficker)                                         |
| Las Piñas City, Metro Manila    | [betterlaspinas.org](https://betterlaspinas.org)      | [GitHub](https://github.com/jmacj/betterlaspinas)                              | [Facebook](https://www.facebook.com/betterlaspinas.org)            | 🟢 Active | [@jmacj](https://github.com/jmacj), [@Martin-Enghoy](https://github.com/Martin-Enghoy) |
| Cainta, Rizal                   | [bettercainta.org](https://bettercainta.org)          | -                                                                              | -                                                                  | 🟢 Active | -                                                                                      |
| Tagaytay City, Cavite           | [bettertagaytay.org](https://www.bettertagaytay.org/) | [GitHub](https://github.com/Arlovzki/bettertagaytay)                           | [Facebook](https://www.facebook.com/bettertagaytay)                | 🟢 Active | [@Arlovzki](https://github.com/Arlovzki)                                               |
| Indang, Cavite                  | [betterindang.org](https://betterindang.org)          | [GitHub](https://github.com/michaustriaqa/betterindang)                        | [Facebook](https://facebook.com/betterindang)                      | 🟢 Active | [@michaustriaqa](https://github.com/michaustriaqa)                                     |

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
    const tr = container.getElementsByTagName("tr");

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
        tr[i].style.display = found ? "" : "none";
    }
}
</script>
