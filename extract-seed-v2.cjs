const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "..", "Downloads", "SavyonCRM_live.jsx");
const lines = fs.readFileSync(srcPath, "utf-8").split("\n");

const seedLine = lines.find((l) => l.startsWith("const SEED_CLIENTES ="));
const patchLine = lines.find((l) => l.startsWith("const CAMPAIGN_PATCH ="));
if (!seedLine) throw new Error("SEED_CLIENTES line not found");
if (!patchLine) throw new Error("CAMPAIGN_PATCH line not found");

const SEED_CLIENTES = JSON.parse(seedLine.replace(/^const SEED_CLIENTES = /, "").replace(/;\s*$/, ""));
const CAMPAIGN_PATCH = JSON.parse(patchLine.replace(/^const CAMPAIGN_PATCH = /, "").replace(/;\s*$/, ""));

function applyCampaignPatch(list) {
  const byName = new Map(list.map((c) => [c.cliente, c]));

  CAMPAIGN_PATCH.bouncedNames.forEach((name) => {
    const c = byName.get(name);
    if (!c) return;
    c.email = "A confirmar";
    c.funil = "";
    const note = "E-mail retornou (bounce) na campanha 2026-2 (24-27/07) - endereço desatualizado, buscar novo contato.";
    if (!(c.obs || "").includes(note)) c.obs = (c.obs ? c.obs + " | " : "") + note;
  });

  Object.entries(CAMPAIGN_PATCH.replies).forEach(([name, [funil, note]]) => {
    const c = byName.get(name);
    if (!c) return;
    c.funil = funil;
    if (!(c.obs || "").includes(note)) c.obs = (c.obs ? c.obs + " | " : "") + note;
  });

  Object.entries(CAMPAIGN_PATCH.contactUpdates).forEach(([name, upd]) => {
    const c = byName.get(name);
    if (!c) return;
    if (upd.contato) c.contato = upd.contato;
    if (upd.email) c.email = upd.email;
    if (upd.obsAppend && !(c.obs || "").includes(upd.obsAppend)) c.obs = (c.obs ? c.obs + " | " : "") + upd.obsAppend;
  });

  let nextId = list.reduce((m, c) => Math.max(m, c.id), -1) + 1;
  const existingNames = new Set(list.map((c) => c.cliente));
  CAMPAIGN_PATCH.newLeads.forEach((lead) => {
    if (existingNames.has(lead.cliente)) return;
    list.push({ ...lead, id: nextId++ });
  });
  return list;
}

const final = applyCampaignPatch(SEED_CLIENTES.map((c) => ({ ...c })));
console.log(`Final client count after patch: ${final.length}`);

fs.mkdirSync(path.join(__dirname, "server"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "server", "clientes.seed.json"),
  JSON.stringify(final, null, 2)
);
console.log("Wrote server/clientes.seed.json (v2, with funil + campaign patch applied)");
