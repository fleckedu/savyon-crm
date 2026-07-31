const fs = require("fs");
const path = require("path");
const { pool, quoteIdent } = require("./db");

const FIELDS = ["cliente", "pais", "ultimaCompra", "clienteDesde", "nPedidos", "status", "nit", "contato", "email", "telefone", "obs", "funil", "endereco", "website", "importer", "consignee", "notify", "forwarder"];

async function seedIfEmpty() {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM clientes");
  if (rows[0].count > 0) return;

  const seedPath = path.join(__dirname, "clientes.seed.json");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  const colList = FIELDS.map(quoteIdent).join(", ");
  const placeholders = FIELDS.map((_, i) => `$${i + 1}`).join(", ");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const row of seed) {
      const values = FIELDS.map((f) => row[f] ?? null);
      await client.query(`INSERT INTO clientes (${colList}) VALUES (${placeholders})`, values);
    }
    await client.query("COMMIT");
    console.log(`Seeded ${seed.length} clientes into the database.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = seedIfEmpty;
