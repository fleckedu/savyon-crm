const path = require("path");
const express = require("express");
const db = require("./db");
const seedIfEmpty = require("./seed");

seedIfEmpty();

const app = express();
app.use(express.json());

const CLIENT_FIELDS = [
  "cliente", "pais", "ultimaCompra", "clienteDesde", "nPedidos",
  "status", "nit", "contato", "email", "telefone", "obs", "funil",
  "endereco", "website",
];

function pickClientFields(body) {
  const out = {};
  for (const field of CLIENT_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

app.get("/api/clientes", (req, res) => {
  const rows = db.prepare("SELECT * FROM clientes ORDER BY id").all();
  res.json(rows);
});

app.post("/api/clientes", (req, res) => {
  const data = pickClientFields(req.body);
  if (!data.cliente) {
    return res.status(400).json({ error: "cliente é obrigatório" });
  }
  const columns = CLIENT_FIELDS.filter((f) => data[f] !== undefined);
  const placeholders = columns.map((c) => `@${c}`).join(", ");
  const info = db
    .prepare(`INSERT INTO clientes (${columns.join(", ")}) VALUES (${placeholders})`)
    .run(data);
  const created = db.prepare("SELECT * FROM clientes WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.patch("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM clientes WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "cliente não encontrado" });

  const data = pickClientFields(req.body);
  const columns = Object.keys(data);
  if (columns.length > 0) {
    const setClause = columns.map((c) => `${c} = @${c}`).join(", ");
    db.prepare(`UPDATE clientes SET ${setClause} WHERE id = @id`).run({ ...data, id });
  }
  const updated = db.prepare("SELECT * FROM clientes WHERE id = ?").get(id);
  res.json(updated);
});

// ---- S&OP: Demanda do cliente ----

const DEMANDA_FIELDS = ["clienteId", "produto", "mes", "quantidadePrevista", "quantidadeConfirmada", "obs"];

function pickDemandaFields(body) {
  const out = {};
  for (const field of DEMANDA_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

app.get("/api/sop/demanda", (req, res) => {
  const rows = db
    .prepare(
      `SELECT sop_demanda.*, clientes.cliente AS clienteNome
       FROM sop_demanda
       LEFT JOIN clientes ON clientes.id = sop_demanda.clienteId
       ORDER BY sop_demanda.mes DESC, sop_demanda.id DESC`
    )
    .all();
  res.json(rows);
});

app.post("/api/sop/demanda", (req, res) => {
  const data = pickDemandaFields(req.body);
  if (!data.produto || !data.mes) {
    return res.status(400).json({ error: "produto e mes são obrigatórios" });
  }
  const columns = DEMANDA_FIELDS.filter((f) => data[f] !== undefined);
  const placeholders = columns.map((c) => `@${c}`).join(", ");
  const info = db
    .prepare(`INSERT INTO sop_demanda (${columns.join(", ")}) VALUES (${placeholders})`)
    .run(data);
  const created = db
    .prepare(
      `SELECT sop_demanda.*, clientes.cliente AS clienteNome
       FROM sop_demanda LEFT JOIN clientes ON clientes.id = sop_demanda.clienteId
       WHERE sop_demanda.id = ?`
    )
    .get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.patch("/api/sop/demanda/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM sop_demanda WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "registro não encontrado" });

  const data = pickDemandaFields(req.body);
  const columns = Object.keys(data);
  if (columns.length > 0) {
    const setClause = columns.map((c) => `${c} = @${c}`).join(", ");
    db.prepare(`UPDATE sop_demanda SET ${setClause} WHERE id = @id`).run({ ...data, id });
  }
  const updated = db
    .prepare(
      `SELECT sop_demanda.*, clientes.cliente AS clienteNome
       FROM sop_demanda LEFT JOIN clientes ON clientes.id = sop_demanda.clienteId
       WHERE sop_demanda.id = ?`
    )
    .get(id);
  res.json(updated);
});

app.delete("/api/sop/demanda/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM sop_demanda WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ error: "registro não encontrado" });
  res.status(204).end();
});

// ---- S&OP: Planejamento de produção/estoque ----

const PRODUCAO_FIELDS = ["produto", "mes", "estoqueAtual", "quantidadePlanejada", "quantidadeProduzida", "status", "obs"];

function pickProducaoFields(body) {
  const out = {};
  for (const field of PRODUCAO_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

app.get("/api/sop/producao", (req, res) => {
  const rows = db.prepare("SELECT * FROM sop_producao ORDER BY mes DESC, id DESC").all();
  res.json(rows);
});

app.post("/api/sop/producao", (req, res) => {
  const data = pickProducaoFields(req.body);
  if (!data.produto || !data.mes) {
    return res.status(400).json({ error: "produto e mes são obrigatórios" });
  }
  const columns = PRODUCAO_FIELDS.filter((f) => data[f] !== undefined);
  const placeholders = columns.map((c) => `@${c}`).join(", ");
  const info = db
    .prepare(`INSERT INTO sop_producao (${columns.join(", ")}) VALUES (${placeholders})`)
    .run(data);
  const created = db.prepare("SELECT * FROM sop_producao WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.patch("/api/sop/producao/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM sop_producao WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "registro não encontrado" });

  const data = pickProducaoFields(req.body);
  const columns = Object.keys(data);
  if (columns.length > 0) {
    const setClause = columns.map((c) => `${c} = @${c}`).join(", ");
    db.prepare(`UPDATE sop_producao SET ${setClause} WHERE id = @id`).run({ ...data, id });
  }
  const updated = db.prepare("SELECT * FROM sop_producao WHERE id = ?").get(id);
  res.json(updated);
});

app.delete("/api/sop/producao/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("DELETE FROM sop_producao WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ error: "registro não encontrado" });
  res.status(204).end();
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
