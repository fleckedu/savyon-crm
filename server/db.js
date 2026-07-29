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
if (!existingColumns.includes("importer")) {
    db.exec("ALTER TABLE clientes ADD COLUMN importer TEXT");
}
if (!existingColumns.includes("consignee")) {
    db.exec("ALTER TABLE clientes ADD COLUMN consignee TEXT");
}
if (!existingColumns.includes("notify")) {
    db.exec("ALTER TABLE clientes ADD COLUMN notify TEXT");
}
if (!existingColumns.includes("forwarder")) {
    db.exec("ALTER TABLE clientes ADD COLUMN forwarder TEXT");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS sop_demanda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
          clienteId INTEGER,
              produto TEXT NOT NULL,
                  mes TEXT NOT NULL,
                      quantidadePrevista INTEGER DEFAULT 0,
                          quantidadeConfirmada INTEGER DEFAULT 0,
                              obs TEXT,
                                  FOREIGN KEY (clienteId) REFERENCES clientes(id)
                                    )
                                    `);

db.exec(`
  CREATE TABLE IF NOT EXISTS sop_producao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
          produto TEXT NOT NULL,
              mes TEXT NOT NULL,
                  estoqueAtual INTEGER DEFAULT 0,
                      quantidadePlanejada INTEGER DEFAULT 0,
                          quantidadeProduzida INTEGER DEFAULT 0,
                              status TEXT DEFAULT 'Planejado',
                                  obs TEXT
                                    )
                                    `);

module.exports = db;
