---
title: Privacy
---
# Privacy Notice

This notice covers the BetterLGU Directory: this repository and the website built from it at [lgu.bettergov.ph](https://lgu.bettergov.ph). It explains what the directory publishes about people, why, and what your browser loads when you visit the site.

## What the directory publishes

**GitHub handles of Maintainers.** Each LGU and budget portal lists the GitHub handles of the people who build or run it, in its Maintainer/s column. Those handles are added in public pull requests, usually by the Maintainers themselves. Being listed doesn't mean a Maintainer wants to be contacted.

**Maintainer Profiles, only if a Maintainer adds one.** A Maintainer can opt in by publishing a [Maintainer Profile](maintainers/README.md): a file they write themselves, saying how contributors may reach them (for example an email address, Messenger, Discord, Telegram, LinkedIn, or a website), what they're open to, and what they're not a fit for. The directory publishes only what the Maintainer puts in their own profile. It never collects contact details from GitHub profiles, commits, or anywhere else on anyone's behalf.

- **Purpose:** so contributors can reach Maintainers who want to hear from them.
- **Basis:** the Maintainer's consent, given by opening the pull request that adds their profile. Only the Maintainer can add or edit their own profile.
- **Phone numbers** are not accepted anywhere in a profile.

## Everything is public

Profiles are public files in a public GitHub repository and on a public website. Anyone can read them, and people or automated scrapers may copy them. Emails are shown as ordinary links, without obfuscation, because the source file is public on GitHub anyway and hiding the address on the website would protect nothing.

If you publish a profile, prefer project or team channels (a portal email address, a project Discord server, the portal's own page) over personal ones.

**If you are under 18,** list only project or team channels, never personal contact details.

## Removing a profile

You can withdraw consent at any time:

- open a pull request deleting your profile file, or
- open a public issue asking for it to be removed, or
- email **jan@jmacj.dev** to ask privately.

A Directory Maintainer may delete a profile but never edits one on your behalf.

Removal takes the profile off the website and out of the current version of the repository. **It does not erase copies elsewhere.** The repository's git history and any forks of it may still contain the profile, and the directory does not rewrite git history. Keep this in mind before you opt in.

## When you visit the website

The site has **no analytics** and sets no tracking cookies. It is a static site hosted on GitHub Pages, so GitHub receives the usual web server request data when you load it. To display pages, your browser also contacts these third parties:

| Third party | What it loads | Why |
|-------------|---------------|-----|
| Tailwind CSS CDN (`cdn.tailwindcss.com`) | Styling script | Page styles |
| unpkg (`unpkg.com`) | Alpine.js | Menus and interactive parts of the page |
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | The Figtree font | Typography |
| GitHub API (`api.github.com`) | Public repository information | Showing when each portal's repository was last updated |

Each of these sees your IP address and browser details as part of the request, under its own privacy policy.

To avoid asking the GitHub API again on every visit, the site caches those public repository details in your browser's local storage. Nothing about you is stored there, and nothing is sent back to the directory.

## Contact

For anything privacy-related, email **jan@jmacj.dev** privately, or [open an issue](https://github.com/jmacj/better-lgu-directory/issues) if you're happy to discuss it in public. Misuse of anyone's contact details is handled under the [Code of Conduct](CODE_OF_CONDUCT.md#contacting-maintainers).
