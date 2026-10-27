// Builds prices.json from the community-maintained LiteLLM price list. Node 20+, no dependencies.
// Test locally:  SOURCE_FILE=litellm.json node scripts/update-prices.mjs
import fs from "node:fs";

const SOURCE = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const OUT = "prices.json";
// LiteLLM provider id -> label shown on the site. Add a line to include another provider.
const PROVIDERS = {
  openai: "OpenAI", anthropic: "Anthropic", gemini: "Google", mistral: "Mistral",
  deepseek: "DeepSeek", xai: "xAI", cohere_chat: "Cohere", perplexity: "Perplexity", meta_llama: "Meta",
};
const MODES = new Set(["chat", "responses"]);
const FORCE = process.env.FORCE === "true";
const today = new Date().toISOString().slice(0, 10);
const fail = (msg) => { console.error("ABORTED: " + msg); process.exit(1); };

let raw;
if (process.env.SOURCE_FILE) raw = JSON.parse(fs.readFileSync(process.env.SOURCE_FILE, "utf8"));
else {
  const res = await fetch(SOURCE);
  if (!res.ok) fail("download failed with status " + res.status);
  raw = await res.json();
}

// Strip date snapshots and "-latest" so aliases of the same model collapse into one row.
const stem = (n) => n.replace(/[-@](\d{8}|\d{4}-\d{2}-\d{2})$/, "").replace(/-latest$/, "");
const best = new Map();
for (const [id, m] of Object.entries(raw)) {
  if (id === "sample_spec" || !PROVIDERS[m.litellm_provider] || !MODES.has(m.mode)) continue;
  if (m.deprecation_date && m.deprecation_date < today) continue;
  const inp = m.input_cost_per_token * 1e6, out = m.output_cost_per_token * 1e6;
  if (!(inp >= 0) || !(out > 0)) continue; // skips missing prices
  if (inp > 1000 || out > 1000) fail("implausible price for " + id);
  const name = id.includes("/") ? id.slice(id.indexOf("/") + 1) : id;
  if (name.startsWith("ft:")) continue;
  const ctx = Math.round((m.max_input_tokens || m.max_tokens || 0) / 1000);
  if (!ctx) continue;
  const rec = { provider: PROVIDERS[m.litellm_provider], name, in: +inp.toFixed(4), out: +out.toFixed(4), ctx };
  if (m.cache_read_input_token_cost) rec.cr = +(m.cache_read_input_token_cost * 1e6).toFixed(4);
  const key = [rec.provider, stem(name), rec.in, rec.out].join("|");
  const cur = best.get(key);
  if (!cur || name.length < cur.name.length) best.set(key, rec);
}
const models = [...best.values()].sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name));

// Safety checks: refuse to publish suspicious data.
if (models.length < 30) fail(`only ${models.length} models found; the source format may have changed`);
let old = [];
try { old = JSON.parse(fs.readFileSync(OUT, "utf8")).models; } catch {}
if (old.length && models.length < old.length * 0.7) fail(`model count fell from ${old.length} to ${models.length}`);
const prev = new Map(old.map((o) => [o.provider + "|" + o.name, o]));
const jumps = [];
for (const m of models) {
  const p = prev.get(m.provider + "|" + m.name);
  if (!p) continue;
  for (const k of ["in", "out"])
    if (p[k] > 0 && Math.abs(m[k] / p[k] - 1) > 0.5) jumps.push(`${m.provider} ${m.name} ${k}: ${p[k]} -> ${m[k]}`);
}
if (jumps.length && !FORCE)
  fail("prices changed by more than 50%. Check them, then re-run the workflow with 'Accept large price changes' ticked:\n" + jumps.join("\n"));

const lines = models.map((m) => "  " + JSON.stringify(m));
fs.writeFileSync(OUT, `{\n "updated": "${today}",\n "source": "LiteLLM community price list",\n "count": ${models.length},\n "models": [\n${lines.join(",\n")}\n ]\n}\n`);
console.log(`Wrote ${models.length} models`);
