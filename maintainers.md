---
layout: default
title: Maintainer Profiles
permalink: /maintainers/
container: page
---
{%- comment -%}
  The site's index of Maintainer Profiles (#426). A main-pages-only file, so
  the main → main-pages sync merge never conflicts on it. It renders from
  _data/maintainer_profiles.yml, built by scripts/sync-profiles-to-data.js.
  maintainers/README.md is the GitHub index for the same profiles, and
  _config.yml excludes it from the site. This page lives at the root, not in
  maintainers/, because the profile scripts treat every *.md in that folder
  other than README.md as a profile.

  Each card is a BetterGov.ph card (https://bettergov.ph/design/components):
  the whole card is the profile link, so it holds exactly one destination. A
  support link (#498) therefore sits under its card, outside it, since a
  link can't nest inside another. The funding disclaimer shows once, above
  the cards, when any profile has one.
{%- endcomment -%}

<!-- Intro in two columns from 1024px: who Maintainers are, then how to contact them. -->
<div class="prose-columns" markdown="1">
<div markdown="1">

Every LGU and budget portal in this directory is built and run by its own volunteers, who are listed in the **Maintainer/s** column of the [Directory]({{ '/' | relative_url }}) and the [Budget Portals]({{ '/budget' | relative_url }}) tables. The people below are some of those portal Maintainers. Each one chose to publish a Maintainer Profile saying how contributors can reach them, what they're open to, and what they're not a fit for.

</div>
<div markdown="1">

**Being listed here means they want to be contacted** about the portals they maintain. These are not the Directory Maintainers who run this site. For questions about the directory itself, open an issue on [GitHub](https://github.com/jmacj/better-lgu-directory/issues).

Read a profile before you reach out, and follow the [Code of Conduct]({{ '/code-of-conduct' | relative_url }}#contacting-maintainers).

</div>
</div>

{% assign profiles = site.data.maintainer_profiles -%}
{%- assign any_support = false -%}
{%- for p in profiles -%}{%- if p.support and p.support != "" -%}{%- assign any_support = true -%}{%- break -%}{%- endif -%}{%- endfor -%}
{%- if any_support %}
<p class="not-prose funding-note max-w-[70ch] text-sm text-ed-ink-3">Some Maintainers accept personal support. It goes to them as people, not to a portal or the directory. {% include funding-disclaimer.html link_class="link" %}</p>
{%- endif -%}
{%- if profiles and profiles.size > 0 -%}
<ul class="not-prose profile-grid">
{%- for p in profiles %}
  <li class="maintainer-card">
  <a href="{{ p.url | relative_url }}" class="card maintainer-card__body">
    <div>
      <h2 class="card__title mt-0">{{ p.name | escape }}</h2>
      <p class="maintainer-card__handle">@{{ p.handle }}</p>
    </div>
    <div class="maintainer-card__section">
      <p class="eyebrow">Maintains</p>
      {%- if p.portals.size > 0 %}
      <ul class="maintainer-card__portals">
        {%- for portal in p.portals %}
        <li>{% if portal.domain and portal.domain != '-' %}{{ portal.domain | markdownify | strip_html | strip }}{% else %}{{ portal.name | escape }}{% endif %}{% if portal.kind == 'budget' %} <span class="text-ed-ink-3">(Budget Portal)</span>{% endif %}</li>
        {%- endfor %}
      </ul>
      {%- else %}
      <p class="text-ed-ink-3">No portals currently listed</p>
      {%- endif %}
    </div>
    {%- if p.open_to.size > 0 %}
    <div class="maintainer-card__section">
      <p class="eyebrow">Open to</p>
      <div class="maintainer-card__tags">
        {%- for item in p.open_to %}<span class="lgu-tag lgu-tag-open">{{ item | escape }}</span>{% endfor -%}
      </div>
    </div>
    {%- endif %}
    {%- if p.languages.size > 0 %}
    <div class="maintainer-card__section">
      <p class="eyebrow">Languages</p>
      <p>{{ p.languages | join: ", " | escape }}</p>
    </div>
    {%- endif %}
  </a>
    {%- if p.support and p.support != "" %}
    <p class="maintainer-card__support"><span class="text-ed-ink-3">Personal support:</span> <a href="{{ p.support | escape }}" target="_blank" rel="noopener noreferrer" class="link">{{ p.support | remove_first: 'https://' | remove_first: 'http://' | escape }}</a></p>
    {%- endif %}
  </li>
{%- endfor %}
</ul>
{%- else -%}
<div class="not-prose empty-state">
  <p class="empty-state__title">No Maintainer Profiles yet.</p>
  <p class="empty-state__body">Portal Maintainers are being invited to opt in. Until then, each Maintainer/s handle in the directory links to that person's GitHub profile.</p>
</div>
{%- endif %}

## Are you a portal Maintainer?

If your GitHub handle is in the Maintainer/s column of an LGU or budget portal in this directory, you can publish your own profile. See [Maintainer Profiles](https://github.com/jmacj/better-lgu-directory/tree/main/maintainers#add-yourself) on GitHub, and read the [privacy notice]({{ '/privacy' | relative_url }}) first. Everything in a profile is public, and only you can add or change yours.
