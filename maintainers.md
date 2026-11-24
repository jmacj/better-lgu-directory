---
layout: default
title: Maintainer Profiles
permalink: /maintainers/
---
{%- comment -%}
  The site's index of Maintainer Profiles (#426). A main-pages-only file, so
  the main → main-pages sync merge never conflicts on it. It renders from
  _data/maintainer_profiles.yml, built by scripts/sync-profiles-to-data.js.
  maintainers/README.md is the GitHub index for the same profiles, and
  _config.yml excludes it from the site. This page lives at the root, not in
  maintainers/, because the profile scripts treat every *.md in that folder
  other than README.md as a profile.

  A card's support link (#498) sits outside the card's profile link, since a
  link can't nest inside another. The funding disclaimer shows once, above
  the cards, when any profile has one.
{%- endcomment -%}

Every LGU and budget portal in this directory is built and run by its own volunteers, who are listed in the **Maintainer/s** column of the [Directory]({{ '/' | relative_url }}) and the [Budget Portals]({{ '/budget' | relative_url }}) tables. The people below are some of those portal Maintainers. Each one chose to publish a Maintainer Profile saying how contributors can reach them, what they're open to, and what they're not a fit for.

**Being listed here means they want to be contacted** about the portals they maintain. These are not the Directory Maintainers who run this site. For questions about the directory itself, open an issue on [GitHub](https://github.com/jmacj/better-lgu-directory/issues).

Read a profile before you reach out, and follow the [Code of Conduct]({{ '/code-of-conduct' | relative_url }}#contacting-maintainers).

{% assign profiles = site.data.maintainer_profiles -%}
{%- assign any_support = false -%}
{%- for p in profiles -%}{%- if p.support and p.support != "" -%}{%- assign any_support = true -%}{%- break -%}{%- endif -%}{%- endfor -%}
{%- if any_support %}
<p class="not-prose funding-note text-sm text-gray-500">Some Maintainers accept personal support. It goes to them as people, not to a portal or the directory. {% include funding-disclaimer.html link_class="text-blue-600 hover:text-blue-700" %}</p>
{%- endif -%}
{%- if profiles and profiles.size > 0 -%}
<div class="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
{%- for p in profiles %}
  <div class="maintainer-card bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all">
  <a href="{{ p.url | relative_url }}" class="maintainer-card__link block no-underline">
    <div class="text-lg font-bold text-gray-900">{{ p.name | escape }}</div>
    <div class="text-sm text-gray-500 mb-4">@{{ p.handle }}</div>
    <div class="text-sm text-gray-700 mb-3">
      <span class="font-semibold text-gray-500">Maintains:</span>
      {% if p.portals.size > 0 %}{% for portal in p.portals %}{% if portal.domain and portal.domain != '-' %}{{ portal.domain | markdownify | strip_html | strip }}{% else %}{{ portal.name | escape }}{% endif %}{% if portal.kind == 'budget' %} (Budget Portal){% endif %}{% unless forloop.last %} · {% endunless %}{% endfor %}{% else %}No portals currently listed{% endif %}
    </div>
    {%- if p.open_to.size > 0 %}
    <div class="flex flex-wrap gap-2 mb-3">
      {%- for item in p.open_to %}<span class="lgu-tag lgu-tag-open">{{ item | escape }}</span>{% endfor -%}
    </div>
    {%- endif %}
    {%- if p.languages.size > 0 %}
    <div class="text-sm text-gray-700"><span class="font-semibold text-gray-500">Languages:</span> {{ p.languages | join: ", " | escape }}</div>
    {%- endif %}
  </a>
    {%- if p.support and p.support != "" %}
    <div class="text-sm text-gray-700 mt-3"><span class="font-semibold text-gray-500">Personal support:</span> <a href="{{ p.support | escape }}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700">{{ p.support | remove_first: 'https://' | remove_first: 'http://' | escape }}</a></div>
    {%- endif %}
  </div>
{%- endfor %}
</div>
{%- else -%}
<div class="not-prose my-10 py-12 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
  <p class="text-lg font-semibold text-gray-900">No Maintainer Profiles yet.</p>
  <p class="text-sm text-gray-500 mt-2">Portal Maintainers are being invited to opt in. Until then, each Maintainer/s handle in the directory links to that person's GitHub profile.</p>
</div>
{%- endif %}

## Are you a portal Maintainer?

If your GitHub handle is in the Maintainer/s column of an LGU or budget portal in this directory, you can publish your own profile. See [Maintainer Profiles](https://github.com/jmacj/better-lgu-directory/tree/main/maintainers#add-yourself) on GitHub, and read the [privacy notice]({{ '/privacy' | relative_url }}) first. Everything in a profile is public, and only you can add or change yours.
