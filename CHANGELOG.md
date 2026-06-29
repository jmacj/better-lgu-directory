# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> [!NOTE]
> This file is updated by the repository maintainers. Contributors are requested to **not** update the `CHANGELOG.md` in their Pull Requests.

## [Unreleased]

### Added
- **Multi-platform Socials**: the directory's `Facebook` column is now a `Socials` column that supports multiple social links per LGU — Facebook, X, Instagram, LinkedIn, YouTube, TikTok, and Bluesky — rendered as platform icons on the website, with a generic fallback for any other link.
- **Automated README → website sync**: a GitHub Actions workflow keeps the published website data in sync with the directory table in `README.md`.
- **37 new LGU entries**: Indang, General Santos City, Dasmariñas City, General Trias, San Pedro, Cabuyao City, Tuguegarao, Davao City, Allen, Aparri, San Pablo, Binangonan, Taytay, Tanza, Olongapo City, Biñan, Tanay, Puerto Princesa City, Iligan City, Hilongos, Limay, Antique, Libmanan, Teresa, Atimonan, San Pascual, Dinalupihan, Calamba, Angeles City, Cabanatuan City, Piat, Cebu City, Alaminos City, Koronadal City, Santo Tomas, Legazpi, and Santa Barbara.

### Changed
- Renamed the `Facebook` column to `Socials`, and updated `CONTRIBUTING.md`, the pull request template, and the update-entry issue template to match (socials are comma-separated).
- Reframed the directory introduction toward a builder audience.
- Expanded the Getting Started steps and added a directory deduplication gate to the guide; refreshed the tech stack and examples.
- Numerous LGU status transitions as portals progressed (Planned → Work in Progress → Active), including Aparri, Allen, San Pablo, Libmanan, Iligan City, Cabanatuan City, Atimonan, San Pascual, and Calamba.

### Fixed
- Normalized empty directory cells to a uniform dash, and aligned contributor guidance to use a single `-`.
- Hardened the README → data sync: YAML escaping, detection of malformed Socials cells, and URL parsing for links containing parentheses.
- Fixed social icons not rendering inside Markdown table cells, and restored their hover colors.
- Fixed the sync workflow to push merge commits even when there are no data changes.
- Fixed a broken Better Solano Starter link and a repository link in the registration instructions.

## [1.0.0] - 2026-04-06

### Added
- **Official Directory Launch**: Initial rollout of the BetterGov.ph LGU Directory.
- **7 Initial Active LGUs**: Solano, Bacolod City, Calauan, Ormoc City, Los Baños, Las Piñas City, and Cainta.
- **3 Community Templates**: [Better Solano Starter](https://github.com/BetterSolano/bettersolano), [Better Los Baños Starter](https://github.com/BetterLosBanos/betterlb), and [Better Local Gov](https://github.com/iyanski/betterlocalgov).
- **Core Repository Infrastructure**:
  - Community documents: `LICENSE` (CC BY 4.0), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `GUIDE.md`, and `TEMPLATES.md`.
  - GitHub integration: `.gitignore`, `.github/CODEOWNERS`, and `ISSUE_TEMPLATE/config.yml`.
  - Automated workflow templates: `PULL_REQUEST_TEMPLATE.md` and specialized Issue Templates (`update-entry.md`, `report-inactive.md`).
