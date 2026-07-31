const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida — configure a variável de ambiente no Render.");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

function quoteIdent(name) {
  return `"${name}"`;
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      cliente TEXT NOT NULL,
      pais TEXT,
      "ultimaCompra" TEXT,
      "clienteDesde" TEXT,
      "nPedidos" INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Revisar',
      nit TEXT,
      contato TEXT,
      email TEXT,
      telefone TEXT,
      obs TEXT,
      funil TEXT DEFAULT '',
      endereco TEXT,
      website TEXT,
      importer TEXT,
      consignee TEXT,
      notify TEXT,
      forwarder TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sop_demanda (
      id SERIAL PRIMARY KEY,
      "clienteId" INTEGER REFERENCES clientes(id),
      produto TEXT NOT NULL,
      mes TEXT NOT NULL,
      "quantidadePrevista" INTEGER DEFAULT 0,
      "quantidadeConfirmada" INTEGER DEFAULT 0,
      obs TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sop_producao (
      id SERIAL PRIMARY KEY,
      produto TEXT NOT NULL,
      mes TEXT NOT NULL,
      "estoqueAtual" INTEGER DEFAULT 0,
      "quantidadePlanejada" INTEGER DEFAULT 0,
      "quantidadeProduzida" INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Planejado',
      obs TEXT
    )
  `);
}

async function insertRow(table, allFields, data) {
  const cols = allFields.filter((f) => data[f] !== undefined);
  const colList = cols.map(quoteIdent).join(", ");
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const values = cols.map((c) => data[c]);
  const { rows } = await pool.query(
    `INSERT INTO ${quoteIdent(table)} (${colList}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return rows[0];
}

async function updateRow(table, allFields, id, data) {
  const cols = allFields.filter((f) => data[f] !== undefined);
  if (cols.length === 0) {
    const { rows } = await pool.query(`SELECT * FROM ${quoteIdent(table)} WHERE id = $1`, [id]);
    return rows[0] || null;
  }
  const setClause = cols.map((c, i) => `${quoteIdent(c)} = $${i + 1}`).join(", ");
  const values = cols.map((c) => data[c]);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE ${quoteIdent(table)} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] || null;
}

module.exports = { pool, init, insertRow, updateRow, quoteIdent };
