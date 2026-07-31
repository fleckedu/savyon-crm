const fs = require("fs");
const path = require("path");
const db = require("./db");

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM clientes").get();
  if (count > 0) return;

  const seedPath = path.join(__dirname, "clientes.seed.json");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  const insert = db.prepare(`
    INSERT INTO clientes (cliente, pais, ultimaCompra, clienteDesde, nPedidos, status, nit, contato, email, telefone, obs, funil, endereco, website, importer, consignee, notify, forwarder)
    VALUES (@cliente, @pais, @ultimaCompra, @clienteDesde, @nPedidos, @status, @nit, @contato, @email, @telefone, @obs, @funil, @endereco, @website, @importer, @consignee, @notify, @forwarder)
  `);

  const FIELDS = ["cliente", "pais", "ultimaCompra", "clienteDesde", "nPedidos", "status", "nit", "contato", "email", "telefone", "obs", "funil", "endereco", "website", "importer", "consignee", "notify", "forwarder"];

  db.exec("BEGIN");
  try {
    for (const row of seed) {
      const params = {};
      for (const f of FIELDS) params[f] = row[f] ?? null;
      insert.run(params);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  console.log(`Seeded ${seed.length} clientes into the database.`);
}

module.exports = seedIfEmpty;
