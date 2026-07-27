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
