const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "crm.db"));
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente TEXT NOT NULL,
              pais TEXT,
                  ultimaCompra TEXT,
                      clienteDesde TEXT,
                          nPedidos INTEGER DEFAULT 0,
                              status TEXT DEFAULT 'Revisar',
                                  nit TEXT,
                                      contato TEXT,
                                          email TEXT,
                                              telefone TEXT,
                                                  obs TEXT,
                                                      funil TEXT DEFAULT '',
                                                          endereco TEXT,
                                                              website TEXT
                                                                )
                                                                `);

const existingColumns = db.prepare("PRAGMA table_info(clientes)").all().map((c) => c.name);
if (!existingColumns.includes("endereco")) {
    db.exec("ALTER TABLE clientes ADD COLUMN endereco TEXT");
}
if (!existingColumns.includes("website")) {
    db.exec("ALTER TABLE clientes ADD COLUMN website TEXT");
}

module.exports = db;
