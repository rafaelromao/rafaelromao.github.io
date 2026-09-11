# rafaelromao.github.io

Career page for Rafael Romão, served by GitHub Pages at
[rafaelromao.github.io](https://rafaelromao.github.io).

Hand-written HTML and CSS. No framework, no build step, no dependencies.

```
index.html          the short version: the case, in about 90 seconds
story/index.html    the long version: twelve chapters of career narrative
assets/site.css     design tokens and layout, shared by both pages
assets/site.js      theme toggle and scroll reveals
assets/favicon.svg
img/rafael.jpg      portrait, 400px square, metadata stripped
robots.txt          points crawlers at both sitemaps
sitemap.xml         the two pages here; the blog ships its own
blog/               published from a separate repository, do not edit here
```

## Design

The palette, typography and dark mode are shared with the blog so the two halves
read as one site: paper and rust in light, Tokyo Night in dark, Literata for
reading and Libre Franklin for labels and data. The light and dark preference is
stored under the `kb-theme` key, which both halves read.

The page grammar is a datasheet rather than a résumé template: a hanging measure
column carries indices and dates, hairline rules separate entries, and every
numeral is tabular so columns align down the page.

## Local preview

Any static file server works:

```bash
python3 -m http.server 8000
```

## The blog

`/blog` is built and pushed here by a workflow in a separate repository. It owns
that directory exclusively and syncs with `rsync --delete` scoped to it, so
nothing at the repository root is affected. Do not add or edit files under
`blog/` in this repository: they will be deleted on the next publish.
