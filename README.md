# LLM Hub

## How the site is built
- `src/pages/*.html` are the page sources. `src/partials/` holds the shared header, footer and styles.
- `tools.json` is the single list of tools. It drives the Tools menu, the landing-page grid, the footer links and each page's "Related tools".
- `node scripts/build.mjs` combines them into the finished pages in the repo root (`index.html`, `cost-forecaster.html`, ...). Those root files are generated: edit `src/`, not the root files.
- The `build-site` workflow runs the build automatically whenever you change `src/`, `tools.json` or the build script, and commits the result. Hostinger then deploys it.

## Common edits
- **Renamed page:** the optimizer is now `prompt-token-optimizer.html`. Delete the old `prompt-trimmer.html` from your repository if it is still there.
- **Image URL:** the shareable forecast image always shows the site name and address. It uses `site.url` from `tools.json` if set (for example `yourdomain.com`), otherwise the address the page is served from.
- **Set your feedback email:** change `site.email` in `tools.json` (the build prints a warning until you do). It appears as the Feedback link in the footer.
- **Change the menu, footer or site name:** edit `src/partials/header.html`, `footer.html` or `site.name` in `tools.json`.
- **Add a tool:** create `src/pages/<name>.html` (start the file with `<!--slug:your-slug-->` and use `{{TITLE}}`, `{{DESC}}`, `{{SHARED_CSS}}`, `{{HEADER}}`, `{{RELATED}}`, `{{FOOTER}}` as in `cost-forecaster.html`), then add one entry to `tools.json`. The menu, grid and related-tools strips update themselves.

## Prices
`scripts/update-prices.mjs` and the `update-prices` workflow write `prices.json` daily from the LiteLLM catalog. See the checks and manual-approval steps in that script's header comments.

## One-time setup
1. Create a free GitHub account and a **public** repository. Upload everything here (if the hidden `.github` folder does not upload, use **Add file > Create new file** and type `.github/workflows/update-prices.yml`, then the same for `build-site.yml`).
2. Actions tab: enable workflows, run **update-prices** once, then check that `prices.json` appears.
3. Hostinger hPanel > Git: connect the repo (branch `main`, install path = your site folder), deploy once, and add its auto-deploy webhook to GitHub (repo Settings > Webhooks, `application/json`, push events). Menu names may differ slightly.
4. Public repos pause scheduled workflows after 60 days without repo activity. Glance at the Actions tab monthly.
