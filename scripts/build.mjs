// Builds the finished pages: src/pages/*.html + shared header/footer + tools.json -> files in the repo root.
// Run:  node scripts/build.mjs
import fs from "node:fs";
const rd = (p) => fs.readFileSync(p, "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const cfg = JSON.parse(rd("tools.json"));
const T = cfg.tools;
const link = (t) => `<a href="${t.href}">${esc(t.name)}</a>`;
const card = (t) => `<a class="tc" href="${t.href}"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></a>`;
const menu = cfg.groups.map((g, i) => `<div class="sh-g"><i>${esc(g)}</i>${T.filter((t) => t.group == i).map(link).join("")}</div>`).join("");
const grid = cfg.groups.map((g, i) => `<h3 class="gt">${esc(g)}</h3><div class="tg">${T.filter((t) => t.group == i).map(card).join("")}</div>`).join("");
const css = `<style>${rd("src/partials/shared.css")}</style>`;
if (/example\.com$/.test(cfg.site.email || "")) console.warn("WARNING: set site.email in tools.json (the Feedback link still uses a placeholder).");
const shared = (s) => s.replaceAll("{{SITE_JSON}}", () => JSON.stringify(cfg.site.name)).replaceAll("{{SITE_URL_JSON}}", () => JSON.stringify(cfg.site.url || "")).replaceAll("{{EMAIL}}", () => esc(cfg.site.email || "")).replaceAll("{{SITE}}", () => esc(cfg.site.name)).replaceAll("{{MENU}}", () => menu).replaceAll("{{MENU_FLAT}}", () => T.map(link).join("")).replaceAll("{{YEAR}}", () => new Date().getFullYear());
const header = rd("src/partials/header.html").trim(), footer = rd("src/partials/footer.html").trim();

for (const f of fs.readdirSync("src/pages").filter((f) => f.endsWith(".html"))) {
  let h = rd("src/pages/" + f);
  const m = h.match(/^<!--slug:([\w-]+)-->\r?\n/);
  if (m) h = h.slice(m[0].length);
  const t = T.find((x) => x.slug == (m && m[1])) || {};
  const rel = T.filter((x) => x.slug != t.slug && x.group == t.group).concat(T.filter((x) => x.slug != t.slug && x.group != t.group)).slice(0, 3);
  h = h.replaceAll("{{HEADER}}", () => header).replaceAll("{{FOOTER}}", () => footer).replaceAll("{{SHARED_CSS}}", () => css)
    .replaceAll("{{GRID}}", () => grid)
    .replaceAll("{{TOOL_CSS}}", () => `<style>${rd("src/partials/tool.css")}</style>`)
    .replaceAll("{{PRICES_JS}}", () => rd("src/partials/prices.js"))
    .replaceAll("{{RELATED}}", () => `<div class="rel"><h3>Related tools</h3><div class="tg">${rel.map(card).join("")}</div></div>`)
    .replaceAll("{{TITLE}}", () => esc(t.name ? `${t.title || t.name} | ${cfg.site.name}` : cfg.site.name))
    .replaceAll("{{DESC}}", () => esc(t.desc || cfg.site.tagline));
  h = shared(h).replace(/\{\{HREF:([\w-]+)\}\}/g, (_, s) => { const x = T.find((t) => t.slug == s); if (!x) throw new Error("Unknown tool slug: " + s); return x.href; });
  const left = h.match(/\{\{[A-Z_]+(?::[\w-]+)?\}\}/); // only our UPPERCASE placeholders; prompt templates use lowercase {{vars}}
  if (left) throw new Error(`${f}: unreplaced placeholder ${left[0]}`);
  fs.writeFileSync(f, h);
  console.log("built " + f);
}
