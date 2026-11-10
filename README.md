# AI Utility Belt

## How the site is built
- `src/pages/*.html` are the page sources. `src/partials/` holds the shared header, footer and styles. `src/templates/` holds the blog, glossary and provider-price page layouts, `src/blog/*.md` the articles and `src/glossary.json` the glossary.
- `tools.json` is the single list of tools. It drives the Tools menu, the landing-page grid, the footer links and each page's "Related tools".
- `node scripts/build.mjs` combines them into the finished pages in the repo root (`index.html`, `cost-forecaster.html`, ...). Those root files are generated: edit `src/`, not the root files.
- The `build-site` workflow runs the build automatically whenever you change `src/`, `tools.json` or the build script, and commits the result. Hostinger then deploys it.

## Brand
- **Name, domain, tagline, email:** all in `tools.json` under `site`. The header, footer, page titles, share image, PDF and Excel read from it.
- **Live domain:** `site.live` is `true`, so the build adds canonical and social-preview tags, `robots.txt` and `sitemap.xml` for `https://aiutilitybelt.dev`. If the domain ever changes, edit `site.url` and rebuild.
- **Logo files:** `src/partials/logo.svg` is the source for the header and exports. `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `logo.svg` and `og-image.png` are the static assets. Replace them to rebrand.

## Common edits
- **Exports:** the forecaster builds its PDF and Excel files in the browser with no libraries. Both carry the site name (`site.name`) and address (`site.url`, or the address the page is served from) in the header, and page numbers in the footer.
- **Renamed page:** the optimizer is now `prompt-token-optimizer.html`. Delete the old `prompt-trimmer.html` from your repository if it is still there.
- **Image URL:** the shareable forecast image always shows the site name and address. It uses `site.url` from `tools.json` if set (for example `yourdomain.com`), otherwise the address the page is served from.
- **Set your feedback email:** change `site.email` in `tools.json` (the build prints a warning until you do). It appears as the Feedback link in the footer.
- **Change the menu, footer or site name:** edit `src/partials/header.html`, `footer.html` or `site.name` in `tools.json`.
- **Add a tool:** create `src/pages/<name>.html` (start the file with `<!--slug:your-slug-->` and use `{{TITLE}}`, `{{DESC}}`, `{{SHARED_CSS}}`, `{{HEADER}}`, `{{RELATED}}`, `{{FOOTER}}` as in `cost-forecaster.html`), then add one entry to `tools.json`. The menu, grid and related-tools strips update themselves.

## Blog
Add `src/blog/your-slug.md` starting with a front-matter block (`title`, `description`, `date` as YYYY-MM-DD, optional `tools: token-counter, cost-forecaster`). Write in simple Markdown: `##` headings, lists, tables, `**bold**`. Link to a tool with `[Token Counter](tool:token-counter)`, to a page with `[Glossary](page:glossary)` and to another article with `[text](post:other-slug)`. Push to GitHub and the build adds it to the blog, the home page, the sitemap and the article's structured data.

## Tooltips and glossary
`src/glossary.json` drives both the Glossary page and the small "?" help icons. An entry with a `match` pattern (a regular expression tested against label and column-heading text) gets an icon wherever a label matches; an entry with an empty `match` appears only in the Glossary.

## Ads (off by default)
In `tools.json`, `site.ads` has `enabled`, `client` (your `ca-pub-...` id) and `slots`. While `enabled` is false nothing ad-related is added. When you switch it on, the build adds the AdSense script, reserved ad containers on tool pages, articles and list pages, and writes `ads.txt`. Before enabling ads for visitors in the EU, UK or Switzerland you need a consent banner (the free Google "Privacy & messaging" tool in your AdSense account does this). Update the Privacy page wording if you add other ad networks. `site.analytics` (`provider`: `plausible`, `ga4` or `cloudflare`, plus `id`) switches on analytics the same way.

## Clean URLs
Pages are served without `.html` (for example `/cost-forecaster`). The build writes `.htaccess` with the rewrite and redirect rules, a custom 404 page and cache settings. If Hostinger ignores the rules, set `"cleanUrls": false` in `tools.json` and rebuild to go back to `.html` links.

## Prices
`scripts/update-prices.mjs` and the `update-prices` workflow write `prices.json` daily from the LiteLLM catalog, then rebuild the pages so the price tables and provider price pages in the HTML always match. See the checks and manual-approval steps in that script's header comments.

## One-time setup
1. Create a free GitHub account and a **public** repository. Upload everything here (if the hidden `.github` folder does not upload, use **Add file > Create new file** and type `.github/workflows/update-prices.yml`, then the same for `build-site.yml`).
2. Actions tab: enable workflows, run **update-prices** once, then check that `prices.json` appears.
3. Hostinger hPanel > Git: connect the repo (branch `main`, install path = your site folder), deploy once, and add its auto-deploy webhook to GitHub (repo Settings > Webhooks, `application/json`, push events). Menu names may differ slightly.
4. Public repos pause scheduled workflows after 60 days without repo activity. Glance at the Actions tab monthly.
