const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("compito.db");

db.serialize(() => {
    db.run(`CREATE TABLE biglietto(
                id TEXT PRIMARY KEY,
                entrata INTEGER NOT NULL,
                uscita INTEGER DEFAULT 0
            );`),
    db.run(`INSERT INTO biglietto (id, entrata) VALUES
            ('1', 100),
            ('2', 300),
            ('3', 500);`);
})