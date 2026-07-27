const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "src", "SavyonCRM.jsx");
const lines = fs.readFileSync(srcPath, "utf-8").split("\n");

const seedLine = lines.find((l) => l.startsWith("const SEED_CLIENTES ="));
if (!seedLine) throw new Error("SEED_CLIENTES line not found");

const jsonText = seedLine
  .replace(/^const SEED_CLIENTES = /, "")
  .replace(/;\s*$/, "");

const data = JSON.parse(jsonText);
console.log(`Parsed ${data.length} clientes`);

fs.mkdirSync(path.join(__dirname, "server"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "server", "clientes.seed.json"),
  JSON.stringify(data, null, 2)
);
console.log("Wrote server/clientes.seed.json");
