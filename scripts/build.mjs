// Builds the finished site: src/pages + src/templates + src/blog + tools.json + prices.json -> files in the repo root.
// Run:  node scripts/build.mjs        (no dependencies, Node 20+)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const rd = (p) => fs.readFileSync(p, "utf8");
const wr = (p, s) => { fs.mkdirSync(path.dirname(p) || ".", { recursive: true }); fs.writeFileSync(p, s); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonSafe = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const cfg = JSON.parse(rd("tools.json"));
const T = cfg.tools, S = cfg.site, ADS = S.ads || {}, AN = S.analytics || {};
const clean = S.cleanUrls !== false;
const origin = S.live && S.url ? "https://" + S.url : "";
const today = new Date().toISOString().slice(0, 10);
const nice = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex");

// ---------- URLs ----------
const U = (name) => (name === "" ? "/" : clean ? "/" + name : "/" + name + ".html");
const pageNames = fs.readdirSync("src/pages").filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));
const POSTDIR = "/blog/";
T.forEach((t) => { t.href = U(t.slug); });

// ---------- Data ----------
let PR = null;
try { PR = JSON.parse(rd("prices.json")); } catch { /* no prices yet: pages still work, they just have no pre-rendered rows */ }
const models = PR && Array.isArray(PR.models) ? PR.models.map((m) => ({ p: m.provider || "Other", n: m.name, i: m.in, o: m.out, c: m.ctx || 128 })).sort((a, b) => (a.p < b.p ? -1 : a.p > b.p ? 1 : a.n < b.n ? -1 : 1)) : [];
const provNames = new Set(models.map((m) => m.p));
const providers = (cfg.providers || []).filter((p) => provNames.has(p.name));
const glossary = JSON.parse(rd("src/glossary.json"));
const tips = JSON.parse(rd("src/tips.json"));
for (const t of tips) { if (!glossary.some((g) => g.id === t.g)) throw new Error("tips.json: unknown glossary id " + t.g); new RegExp(t.m, "i"); }
wr("assets/tips.js", "window.TIPS=" + JSON.stringify(tips.map((t) => ({ m: t.m, t: t.t, g: t.g, x: t.x, y: t.y || "" }))) + ";\n");
const tipsHash = sha(rd("assets/tips.js")).slice(0, 8);

const hrefFor = (s) => {
  const t = T.find((x) => x.slug === s); if (t) return t.href;
  if (s === "home") return "/";
  if (s === "blog") return POSTDIR;
  if (["glossary", "privacy", "terms", "how-it-works"].includes(s)) return U(s);
  const pv = (cfg.providers || []).find((x) => x.slug === s); if (pv) return U(s);
  throw new Error("Unknown link target: " + s);
};

// ---------- Shared pieces ----------
const logo = rd("src/partials/logo.svg").trim(), logoIn = logo.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
const siteHtml = esc(S.name).replace(/^(\S+)\s+(.*)$/, "<i>$1</i> $2");
const link = (t) => `<a href="${t.href}">${esc(t.name)}</a>`;
const card = (t) => `<a class="tc" href="${t.href}"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span></a>`;
const menu = cfg.groups.map((g, i) => `<div class="sh-g"><i>${esc(g)}</i>${T.filter((t) => t.group == i).map(link).join("")}</div>`).join("");
const grid = cfg.groups.map((g, i) => `<h3 class="gt">${esc(g)}</h3><div class="tg">${T.filter((t) => t.group == i).map(card).join("")}</div>`).join("");
const css = `<style>${rd("src/partials/shared.css")}</style>`;
const exportsHash = sha(rd("assets/exports.js")).slice(0, 8);
if (/example\.com$/.test(S.email || "")) console.warn("WARNING: set site.email in tools.json.");

const adsOn = !!(ADS.enabled && ADS.client);
const adBlock = (k) => adsOn ? `<aside class="ad" aria-label="Advertisement"><small>Advertisement</small><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ADS.client)}"${(ADS.slots || {})[k] ? ` data-ad-slot="${esc(ADS.slots[k])}"` : ""} data-ad-format="auto" data-full-width-responsive="true"></ins></aside>` : "";
const adInit = adsOn ? 'document.querySelectorAll("ins.adsbygoogle").forEach(function(){try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}});' : "";
const adsNote = adsOn
  ? "This site shows ads served by Google AdSense and its partners. They may use cookies or similar technology to show and measure ads. You can manage personalised advertising at adssettings.google.com."
  : "The site shows no ads at the moment. If we add advertising in future, providers such as Google AdSense may use cookies to show and measure ads. We will update this page first.";
const anNote = !AN.provider
  ? "We do not use analytics or tracking cookies at the moment. If that changes, we will update this page first."
  : `We use ${AN.provider === "plausible" ? "Plausible Analytics, a cookie-free service," : AN.provider === "ga4" ? "Google Analytics" : "Cloudflare Web Analytics"} to count visits and see which pages are useful. It does not receive anything you paste or upload.`;
const analyticsHead = !AN.provider || !AN.id && AN.provider !== "plausible" ? "" :
  AN.provider === "plausible" ? `<script defer data-domain="${esc(S.url)}" src="https://plausible.io/js/script.js"></script>` :
  AN.provider === "ga4" ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(AN.id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${esc(AN.id)}");</script>` :
  AN.provider === "cloudflare" ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(AN.id)}"}'></script>` : "";
const adsHead = adsOn ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(ADS.client)}" crossorigin="anonymous"></script>` : "";

const shared = (s) => s
  .replaceAll("{{LOGO_SVG}}", () => logo).replaceAll("{{LOGO_JSON}}", () => JSON.stringify(logoIn)).replaceAll("{{SITE_HTML}}", () => siteHtml)
  .replaceAll("{{TAGLINE}}", () => esc(S.tagline)).replaceAll("{{SITE_DESC}}", () => esc(S.description || S.tagline))
  .replaceAll("{{SITE_JSON}}", () => JSON.stringify(S.name)).replaceAll("{{SITE_URL_JSON}}", () => JSON.stringify(S.url || ""))
  .replaceAll("{{EMAIL}}", () => esc(S.email || "")).replaceAll("{{SITE}}", () => esc(S.name))
  .replaceAll("{{MENU}}", () => menu).replaceAll("{{YEAR}}", () => new Date().getFullYear())
  .replaceAll("{{TIPS_URL}}", () => "/assets/tips.js?v=" + tipsHash).replaceAll("{{GLOSSARY_URL_JSON}}", () => JSON.stringify(U("glossary")))
  .replaceAll("{{AD_INIT}}", () => adInit).replaceAll("{{EXPORTS_URL}}", () => "/assets/exports.js?v=" + exportsHash)
  .replaceAll("{{TODAY_NICE}}", () => nice(today)).replaceAll("{{ANALYTICS_NOTE}}", () => esc(anNote)).replaceAll("{{ADS_NOTE}}", () => esc(adsNote))
  .replaceAll("{{PRICES_DATE}}", () => (PR && PR.updated) || "recently");
const header = rd("src/partials/header.html").trim(), footer = rd("src/partials/footer.html").trim();
const dataLine = models.length ? `Prices verified ${PR.updated} · ${models.length} models · ${provNames.size} providers` : "Prices come from an open-source catalog and are refreshed daily.";

// ---------- Blog ----------
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>")
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    if (u.startsWith("tool:") || u.startsWith("page:")) u = hrefFor(u.split(":")[1]);
    else if (u.startsWith("post:")) u = (clean ? POSTDIR + u.slice(5) : POSTDIR + u.slice(5) + ".html");
    return `<a href="${u}"${/^https?:/.test(u) ? ' rel="noopener"' : ""}>${t}</a>`;
  });
function md(src) {
  const out = [], L = src.replace(/\r/g, "").split("\n");
  for (let i = 0; i < L.length;) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,3})\s+(.*)$/))) { const id = m[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); out.push(`<h${m[1].length} id="${id}">${inline(m[2])}</h${m[1].length}>`); i++; }
    else if (/^\|/.test(l)) { const rows = []; while (i < L.length && /^\|/.test(L[i])) rows.push(L[i++]); const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()); const head = cells(rows[0]), body = rows.slice(2).map(cells); out.push(`<div class="ov"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); }
    else if (/^[-*]\s+/.test(l)) { const it = []; while (i < L.length && /^[-*]\s+/.test(L[i])) it.push(L[i++].replace(/^[-*]\s+/, "")); out.push(`<ul>${it.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`); }
    else if (/^\d+\.\s+/.test(l)) { const it = []; while (i < L.length && /^\d+\.\s+/.test(L[i])) it.push(L[i++].replace(/^\d+\.\s+/, "")); out.push(`<ol>${it.map((x) => `<li>${inline(x)}</li>`).join("")}</ol>`); }
    else if (/^>\s?/.test(l)) { const q = []; while (i < L.length && /^>\s?/.test(L[i])) q.push(L[i++].replace(/^>\s?/, "")); out.push(`<blockquote><p>${inline(q.join(" "))}</p></blockquote>`); }
    else { const p = []; while (i < L.length && L[i].trim() && !/^(#{2,3}\s|\||[-*]\s|\d+\.\s|>)/.test(L[i])) p.push(L[i++]); out.push(`<p>${inline(p.join(" "))}</p>`); }
  }
  return out.join("\n");
}
const posts = fs.existsSync("src/blog") ? fs.readdirSync("src/blog").filter((f) => f.endsWith(".md")).map((f) => {
  const raw = rd("src/blog/" + f).replace(/\r/g, ""), fm = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fm) throw new Error(f + ": missing front matter");
  const meta = {}; fm[1].split("\n").forEach((x) => { const k = x.indexOf(":"); if (k > 0) meta[x.slice(0, k).trim()] = x.slice(k + 1).trim(); });
  for (const k of ["title", "description", "date"]) if (!meta[k]) throw new Error(f + ": missing " + k);
  const slug = f.replace(/\.md$/, "");
  return { slug, ...meta, tools: (meta.tools || "").split(",").map((x) => x.trim()).filter(Boolean), body: md(fm[2]), words: fm[2].split(/\s+/).length, path: clean ? POSTDIR + slug : POSTDIR + slug + ".html" };
}).sort((a, b) => (a.date < b.date ? 1 : -1)) : [];
const postCard = (p) => `<a class="post" href="${p.path}"><b>${esc(p.title)}</b><span>${esc(p.description)}</span><time datetime="${p.date}">${nice(p.date)}</time></a>`;

// ---------- Render ----------
function render(h, o) {
  const m0 = h.match(/^<!--slug:([\w-]*)-->\r?\n/);
  if (m0) h = h.slice(m0[0].length);
  const t = T.find((x) => x.slug == (o.slug ?? (m0 && m0[1]))) || {};
  const rel = T.filter((x) => x.slug != t.slug && x.group == t.group).concat(T.filter((x) => x.slug != t.slug && x.group != t.group)).slice(0, 3);
  const toks = []; h = h.replace(/<script src="(https:\/\/cdn\.jsdelivr\.net\/npm\/gpt-tokenizer[^"]+)"[^>]*><\/script>/g, (_, u) => { toks.push(u); return ""; });
  h = h.replaceAll("{{HEADER}}", () => header).replaceAll("{{FOOTER}}", () => footer).replaceAll("{{SHARED_CSS}}", () => css)
    .replaceAll("{{GRID}}", () => grid)
    .replaceAll("{{TOOL_CSS}}", () => `<style>${rd("src/partials/tool.css")}</style>`)
    .replaceAll("{{PROSE_CSS}}", () => `<style>${rd("src/partials/prose.css")}</style>`)
    .replaceAll("{{PRICES_JS}}", () => rd("src/partials/prices.js"))
    .replaceAll("{{RELATED}}", () => adBlock("bottom") + `<div class="rel"><h3>Related tools</h3><div class="tg">${rel.map(card).join("")}</div></div>`)
    .replace(/\{\{AD:(\w+)\}\}/g, (_, k) => adBlock(k))
    .replaceAll("{{LATEST_POSTS}}", () => posts.length ? `<h2 class="sec">From the Blog</h2><p class="sub">Plain-English guides to AI costs, tokens and prompts.</p><div class="posts">${posts.slice(0, 3).map(postCard).join("")}</div>` : "")
    .replaceAll("{{DATA_LINE}}", () => esc(dataLine))
    .replaceAll("{{TITLE}}", () => esc(o.title || (t.name ? `${t.title || t.name} | ${S.name}` : S.name)))
    .replaceAll("{{DESC}}", () => esc(o.desc || t.desc || S.description || S.tagline));
  h = shared(h).replace(/\{\{HREF:([\w-]+)\}\}/g, (_, s) => hrefFor(s));
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "", dm = h.match(/<meta name="description" content="([^"]*)"/), desc = dm ? dm[1] : esc(S.description || S.tagline);
  const url = origin ? origin + o.path : "";
  if (o.crumbs) {
    const cr = o.crumbs, html = `<nav class="crumbs" aria-label="Breadcrumb"${o.narrow ? ' style="max-width:760px"' : ""}>${cr.map((c, i) => (i < cr.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a><span>&rsaquo;</span>` : `<span style="margin:0">${esc(c[0])}</span>`)).join("")}</nav>`;
    h = h.replace(/<main/, () => html + "<main");
    if (origin) o.ld = (o.ld || []).concat({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: cr.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], item: origin + c[1] })) });
  }
  let meta = '<script>try{var t=localStorage.getItem("aub-theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}</script><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="theme-color" content="#05070d"><meta property="og:type" content="' + (o.ogType || "website") + '"><meta property="og:site_name" content="' + esc(S.name) + '"><meta property="og:title" content="' + title + '"><meta property="og:description" content="' + desc + '"><meta name="twitter:card" content="summary_large_image">';
  if (o.noindex) meta += '<meta name="robots" content="noindex">';
  else if (origin) meta += '<link rel="canonical" href="' + url + '"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + origin + '/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">';
  if (toks.length) meta += "<script>window.TOKLIBS=" + JSON.stringify(toks) + ";</script>";
  meta += analyticsHead + adsHead;
  if (origin && !o.noindex) for (const l of o.ld || []) meta += '<script type="application/ld+json">' + jsonSafe(l) + "</script>";
  h = h.replace("</head>", () => meta + "</head>");
  const left = h.match(/\{\{[A-Z_]+(?::[\w-]+)?\}\}/); // only our UPPERCASE placeholders; prompt templates use lowercase {{vars}}
  if (left) throw new Error(`${o.path}: unreplaced placeholder ${left[0]}`);
  return h;
}

const outputs = []; // [file, html, urlPath, inSitemap]
const emit = (file, html, p, inMap = true) => { wr(file, html); outputs.push([file, html, p, inMap]); console.log("built " + file); };

// ---------- Price highlights (static, for readers and search engines) ----------
function highlights() {
  if (!models.length) return "";
  const paid = models.filter((m) => m.i > 0 && m.o > 0);
  const tbl = (title, note, rows, cols) => `<div class="card"><h2 style="margin:0 0 4px;font-size:18px">${title}</h2><p class="note" style="margin:0 0 8px">${note}</p><div class="ov"><table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div></div>`;
  const r = (m) => `<tr><td>${esc(m.n)}</td><td>${esc(m.p)}</td><td>${m.i}</td><td>${m.o}</td><td>${m.c}</td></tr>`;
  const cols = ["Model", "Provider", "Input $/1M", "Output $/1M", "Context (K)"];
  const cheapIn = paid.slice().sort((a, b) => a.i - b.i || a.o - b.o).slice(0, 8).map(r);
  const cheapOut = paid.slice().sort((a, b) => a.o - b.o || a.i - b.i).slice(0, 8).map(r);
  const big = models.slice().sort((a, b) => b.c - a.c || a.i - b.i).slice(0, 8).map(r);
  const per = providers.map((pv) => paid.filter((m) => m.p === pv.name).sort((a, b) => a.i - b.i)[0]).filter(Boolean).map(r);
  return tbl("Cheapest Models by Input Price", "Models with the lowest price per million input tokens. Zero-priced entries are left out.", cheapIn, cols) +
    tbl("Cheapest Models by Output Price", "Output tokens cost more than input, so this ranking matters for chatbots and writing tasks.", cheapOut, cols) +
    tbl("Largest Context Windows", "The models that can take the most text in a single request.", big, cols) +
    (per.length ? tbl("Cheapest Model from Each Major Provider", `By input price. See each provider's full list: ${providers.map((x) => `<a href="${U(x.slug)}">${esc(x.label || x.name)}</a>`).join(", ")}.`, per, cols) : "");
}

// ---------- Pages ----------
const org = { "@type": "Organization", name: S.name, url: origin + "/", logo: origin + "/logo.svg" };
for (const f of fs.readdirSync("src/pages").filter((f) => f.endsWith(".html"))) {
  let h = rd("src/pages/" + f); const name = f.replace(/\.html$/, "");
  const m = h.match(/^<!--slug:([\w-]*)-->\r?\n/), slug = m ? m[1] : "", t = T.find((x) => x.slug == slug);
  const isHome = name === "index", p = isHome ? "/" : U(name), ld = [];
  const rows = models.map((x) => `<tr><td data-label="Compare"><input type="checkbox" data-k="${esc(x.p + "|" + x.n)}" aria-label="Compare ${esc(x.n)}"></td><td data-label="Provider">${esc(x.p)}</td><td data-label="Model">${esc(x.n)}</td><td data-label="Input $/1M">${x.i}</td><td data-label="Output $/1M">${x.o}</td><td data-label="Context (K)">${x.c}</td></tr>`).join("");
  h = h.replaceAll("{{PRICE_ROWS}}", () => rows || '<tr><td colspan="6">Prices load in a moment.</td></tr>')
    .replaceAll("{{PRICES_META}}", () => models.length ? `Last updated ${PR.updated} · ${models.length} models from ${provNames.size} providers · refreshed daily` : "Prices are refreshed daily from an open-source catalog.")
    .replaceAll("{{PRICE_HIGHLIGHTS}}", () => highlights())
    .replaceAll("{{PRICE_COUNT}}", () => models.length ? `${models.length} of ${models.length} models` : "")
    .replaceAll("{{PROVIDER_LINKS}}", () => providers.map((x) => `<a href="${U(x.slug)}">${esc(x.name)} API Pricing</a>`).join(" &middot; "));
  if (isHome) ld.push({ "@context": "https://schema.org", "@type": "WebSite", name: S.name, url: origin + "/", description: S.description }, { "@context": "https://schema.org", ...org });
  else if (t) ld.push({ "@context": "https://schema.org", "@type": "WebApplication", name: t.name, url: origin + p, description: t.desc, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: org });
  const crumbs = isHome || name === "404" ? null : [["Home", "/"], [t ? t.name : (name === "privacy" ? "Privacy Policy" : name === "terms" ? "Terms of Use" : name === "how-it-works" ? "How It Works" : name), p]];
  const title = !t && name === "privacy" ? `Privacy Policy | ${S.name}` : !t && name === "terms" ? `Terms of Use | ${S.name}` : !t && name === "404" ? `Page Not Found | ${S.name}` : undefined;
  emit(f, render(h, { path: p, crumbs, ld, title, narrow: !t, noindex: name === "404" }), p, name !== "404");
}

// ---------- Glossary ----------
{
  const list = glossary.slice().sort((a, b) => a.term.localeCompare(b.term)).map((g) => `<dt id="${g.id}">${esc(g.term)}</dt><dd><span class="s">${esc(g.short)}</span><br>${esc(g.long)}</dd>`).join("");
  const p = U("glossary");
  emit("glossary.html", render(rd("src/templates/glossary.html").replaceAll("{{GLOSSARY_LIST}}", () => list), { path: p, title: `AI Cost and Token Glossary | ${S.name}`, desc: "Plain-English definitions of tokens, context windows, prompt caching, chunking and other terms used in LLM pricing and prompt work.", crumbs: [["Home", "/"], ["Glossary", p]], narrow: true, ld: [{ "@context": "https://schema.org", "@type": "DefinedTermSet", name: "AI Cost and Token Glossary", hasDefinedTerm: glossary.map((g) => ({ "@type": "DefinedTerm", name: g.term, description: g.short, url: origin + p + "#" + g.id })) }] }), p);
}

// ---------- Blog ----------
if (posts.length) {
  emit("blog/index.html", render(rd("src/templates/blog-index.html").replaceAll("{{POST_CARDS}}", () => posts.map(postCard).join("")), { path: POSTDIR, title: `Blog | ${S.name}`, desc: "Plain-English guides to LLM pricing, tokens, context windows and cutting AI costs.", crumbs: [["Home", "/"], ["Blog", POSTDIR]], narrow: true }), POSTDIR);
  for (const p of posts) {
    const tools = p.tools.map((s) => T.find((t) => t.slug === s)).filter(Boolean), more = posts.filter((x) => x.slug !== p.slug).slice(0, 2);
    let h = rd("src/templates/article.html")
      .replaceAll("{{POST_TITLE}}", () => esc(p.title)).replaceAll("{{POST_DATE}}", () => p.date).replaceAll("{{POST_DATE_NICE}}", () => nice(p.date))
      .replaceAll("{{POST_READ}}", () => Math.max(1, Math.round(p.words / 200))).replaceAll("{{POST_BODY}}", () => p.body)
      .replaceAll("{{POST_TOOLS}}", () => `<div class="tg" style="margin-top:6px">${tools.map(card).join("")}</div>`)
      .replaceAll("{{MORE_POSTS}}", () => more.length ? `<div class="prose" style="padding-top:0"><h2>More Guides</h2><div class="posts">${more.map(postCard).join("")}</div></div>` : "");
    emit(`blog/${p.slug}.html`, render(h, { path: p.path, title: `${p.title} | ${S.name}`, desc: p.description, ogType: "article", crumbs: [["Home", "/"], ["Blog", POSTDIR], [p.title, p.path]], narrow: true, ld: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: origin + p.path, image: origin + "/og-image.png", author: org, publisher: { ...org } }] }), p.path);
  }
}

// ---------- Provider price pages ----------
for (const pv of providers) {
  const ms = models.filter((m) => m.p === pv.name), p = U(pv.slug);
  const rows = ms.map((m) => `<tr><td>${esc(m.n)}</td><td>${m.i}</td><td>${m.o}</td><td>${m.c}</td></tr>`).join("");
  const others = providers.filter((x) => x.slug !== pv.slug).map((x) => `<a href="${U(x.slug)}">${esc(x.name)}</a>`).join(" &middot; ");
  const lab = pv.label || pv.name;
  const h = rd("src/templates/provider.html").replaceAll("{{PROV_NAME}}", () => esc(lab)).replaceAll("{{PROV_COUNT}}", () => ms.length).replaceAll("{{PROV_ROWS}}", () => rows)
    .replaceAll("{{PROV_INTRO}}", () => `${esc(lab)} models are sold through the ${esc(pv.name)} API. This page lists every ${esc(pv.name)} model in the ${esc(S.name)} price catalog with its price per million input and output tokens and its context window. The prices are refreshed daily.`)
    .replaceAll("{{PROV_LINKS}}", () => others + (others ? " &middot; " : "") + `<a href="${hrefFor("model-prices")}">Compare all providers</a>`);
  emit(pv.slug + ".html", render(h, { path: p, title: `${lab} API Pricing: Price per 1M Tokens | ${S.name}`, desc: `Current ${lab} API prices per million input and output tokens and context window for ${ms.length} models. Updated daily.`, crumbs: [["Home", "/"], ["Model Prices", hrefFor("model-prices")], [`${lab} API Pricing`, p]], narrow: true, ld: [] }), p);
}

// ---------- robots, sitemap, ads.txt, .htaccess ----------
const stateFile = "scripts/lastmod.json";
let state = {}; try { state = JSON.parse(rd(stateFile)); } catch { /* first run */ }
const nextState = {};
for (const [, html, p, inMap] of outputs) { if (!inMap) continue; const h = sha(html.replace(/prices verified[^<]*/gi, "")); const prev = state[p]; nextState[p] = prev && prev.h === h ? prev : { h, d: today }; }
wr("robots.txt", "User-agent: *\nAllow: /\n" + (origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ""));
if (origin) {
  wr("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + outputs.filter((o) => o[3]).map((o) => `<url><loc>${origin}${o[2]}</loc><lastmod>${nextState[o[2]].d}</lastmod></url>`).join("\n") + "\n</urlset>\n");
  wr(stateFile, JSON.stringify(nextState, null, 1) + "\n");
} else if (fs.existsSync("sitemap.xml")) fs.unlinkSync("sitemap.xml");
if (adsOn) wr("ads.txt", `google.com, ${ADS.client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`); else if (fs.existsSync("ads.txt")) fs.unlinkSync("ads.txt");

wr(".htaccess", `# Generated by scripts/build.mjs. Edit the build script, not this file.
ErrorDocument 404 /404.html
# Keep repo helper files and page templates out of the public site
RedirectMatch 404 ^/(scripts|src|\\.github)(/|$)
RedirectMatch 404 ^/(README\\.md|tools\\.json)$
RedirectMatch 404 ^/404/?$
${clean ? `
RewriteEngine On
# Old page names
RewriteRule ^prompt-trimmer(\\.html)?$ /prompt-token-optimizer [R=301,L]
# /index.html and /anything.html -> clean URL
RewriteRule ^(.*/)?index\\.html$ /$1 [R=301,L]
RewriteCond %{THE_REQUEST} ^[A-Z]+\\s/+(.+?)\\.html[\\s?]
RewriteRule ^ /%1 [R=301,L]
# Serve /anything from anything.html
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+?)/?$ $1.html [L]
` : ""}
<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml text/plain application/xml
</IfModule>
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType image/png "access plus 1 month"
ExpiresByType image/svg+xml "access plus 1 month"
ExpiresByType image/x-icon "access plus 1 month"
ExpiresByType application/javascript "access plus 1 week"
ExpiresByType text/javascript "access plus 1 week"
ExpiresByType application/json "access plus 1 hour"
ExpiresByType text/html "access plus 10 minutes"
</IfModule>
`);
console.log(origin ? `robots.txt, sitemap.xml (${outputs.filter((o) => o[3]).length} URLs) and .htaccess written for ${origin}` : "site.live is false: no sitemap or canonical tags");
