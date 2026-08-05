const path = require("path");
const express = require("express");
const { pool, init, insertRow, updateRow } = require("./db");
const seedIfEmpty = require("./seed");

const app = express();
app.use(express.json({ limit: "10mb" }));

const CLIENT_FIELDS = [
  "cliente", "pais", "ultimaCompra", "clienteDesde", "nPedidos",
  "status", "nit", "contato", "email", "telefone", "obs", "funil",
  "endereco", "website", "importer", "consignee", "notify", "forwarder",
];

function pickFields(fields, body) {
  const out = {};
  for (const field of fields) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

app.get("/api/clientes", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM clientes ORDER BY id");
  res.json(rows);
});

app.post("/api/clientes", async (req, res) => {
  const data = pickFields(CLIENT_FIELDS, req.body);
  if (!data.cliente) {
    return res.status(400).json({ error: "cliente é obrigatório" });
  }
  const created = await insertRow("clientes", CLIENT_FIELDS, data);
  res.status(201).json(created);
});

app.patch("/api/clientes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existing } = await pool.query("SELECT id FROM clientes WHERE id = $1", [id]);
  if (existing.length === 0) return res.status(404).json({ error: "cliente não encontrado" });

  const data = pickFields(CLIENT_FIELDS, req.body);
  const updated = await updateRow("clientes", CLIENT_FIELDS, id, data);
  res.json(updated);
});

app.delete("/api/clientes/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM clientes WHERE id = $1", [id]);
  if (rowCount === 0) return res.status(404).json({ error: "cliente não encontrado" });
  res.status(204).end();
});

// ---- S&OP: Demanda do cliente ----

const DEMANDA_FIELDS = ["clienteId", "produto", "mes", "quantidadePrevista", "quantidadeConfirmada", "obs"];

const DEMANDA_SELECT = `
  SELECT sop_demanda.*, clientes.cliente AS "clienteNome"
  FROM sop_demanda
  LEFT JOIN clientes ON clientes.id = sop_demanda."clienteId"
`;

app.get("/api/sop/demanda", async (req, res) => {
  const { rows } = await pool.query(`${DEMANDA_SELECT} ORDER BY sop_demanda.mes DESC, sop_demanda.id DESC`);
  res.json(rows);
});

app.post("/api/sop/demanda", async (req, res) => {
  const data = pickFields(DEMANDA_FIELDS, req.body);
  if (!data.produto || !data.mes) {
    return res.status(400).json({ error: "produto e mes são obrigatórios" });
  }
  const created = await insertRow("sop_demanda", DEMANDA_FIELDS, data);
  const { rows } = await pool.query(`${DEMANDA_SELECT} WHERE sop_demanda.id = $1`, [created.id]);
  res.status(201).json(rows[0]);
});

app.patch("/api/sop/demanda/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existing } = await pool.query("SELECT id FROM sop_demanda WHERE id = $1", [id]);
  if (existing.length === 0) return res.status(404).json({ error: "registro não encontrado" });

  const data = pickFields(DEMANDA_FIELDS, req.body);
  await updateRow("sop_demanda", DEMANDA_FIELDS, id, data);
  const { rows } = await pool.query(`${DEMANDA_SELECT} WHERE sop_demanda.id = $1`, [id]);
  res.json(rows[0]);
});

app.delete("/api/sop/demanda/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM sop_demanda WHERE id = $1", [id]);
  if (rowCount === 0) return res.status(404).json({ error: "registro não encontrado" });
  res.status(204).end();
});

// ---- S&OP: Planejamento de produção/estoque ----

const PRODUCAO_FIELDS = ["produto", "mes", "estoqueAtual", "quantidadePlanejada", "quantidadeProduzida", "status", "obs"];

app.get("/api/sop/producao", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM sop_producao ORDER BY mes DESC, id DESC");
  res.json(rows);
});

app.post("/api/sop/producao", async (req, res) => {
  const data = pickFields(PRODUCAO_FIELDS, req.body);
  if (!data.produto || !data.mes) {
    return res.status(400).json({ error: "produto e mes são obrigatórios" });
  }
  const created = await insertRow("sop_producao", PRODUCAO_FIELDS, data);
  res.status(201).json(created);
});

app.patch("/api/sop/producao/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existing } = await pool.query("SELECT id FROM sop_producao WHERE id = $1", [id]);
  if (existing.length === 0) return res.status(404).json({ error: "registro não encontrado" });

  const data = pickFields(PRODUCAO_FIELDS, req.body);
  const updated = await updateRow("sop_producao", PRODUCAO_FIELDS, id, data);
  res.json(updated);
});

app.delete("/api/sop/producao/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM sop_producao WHERE id = $1", [id]);
  if (rowCount === 0) return res.status(404).json({ error: "registro não encontrado" });
  res.status(204).end();
});

// ---- Produtos ----

const PRODUTO_FIELDS = [
  "codigo", "nome", "composicao", "larguraM", "larguraPol", "rendimentoMt", "rendimentoYd",
  "gramatura", "precoKg", "precoMetroUsd", "precoYardUsd", "precoYard10", "precoMetroEur",
  "preco7Mt", "moqMt", "moqYd", "precoKg5", "precoMetro5",
];

app.get("/api/produtos", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM produtos ORDER BY codigo");
  res.json(rows);
});

app.post("/api/produtos", async (req, res) => {
  const data = pickFields(PRODUTO_FIELDS, req.body);
  if (!data.codigo) {
    return res.status(400).json({ error: "codigo é obrigatório" });
  }
  const created = await insertRow("produtos", PRODUTO_FIELDS, data);
  res.status(201).json(created);
});

app.post("/api/produtos/bulk", async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "envie um array de produtos" });
  }
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query("BEGIN");
    const colList = PRODUTO_FIELDS.map((f) => `"${f}"`).join(", ");
    const placeholders = PRODUTO_FIELDS.map((_, i) => `$${i + 1}`).join(", ");
    const stmt = `INSERT INTO produtos (${colList}) VALUES (${placeholders})`;
    for (const item of items) {
      const data = pickFields(PRODUTO_FIELDS, item);
      if (!data.codigo) continue;
      const values = PRODUTO_FIELDS.map((f) => (data[f] !== undefined ? data[f] : null));
      await client.query(stmt, values);
      inserted++;
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  res.status(201).json({ inserted });
});

app.patch("/api/produtos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rows: existing } = await pool.query("SELECT id FROM produtos WHERE id = $1", [id]);
  if (existing.length === 0) return res.status(404).json({ error: "produto não encontrado" });

  const data = pickFields(PRODUTO_FIELDS, req.body);
  const updated = await updateRow("produtos", PRODUTO_FIELDS, id, data);
  res.json(updated);
});

app.delete("/api/produtos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
  if (rowCount === 0) return res.status(404).json({ error: "produto não encontrado" });
  res.status(204).end();
});

app.delete("/api/produtos", async (req, res) => {
  if (req.query.confirm !== "all") {
    return res.status(400).json({ error: "use ?confirm=all para apagar todos os produtos" });
  }
  const { rowCount } = await pool.query("DELETE FROM produtos");
  res.json({ deleted: rowCount });
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 3001;

init()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao inicializar o banco:", err);
    process.exit(1);
  });
