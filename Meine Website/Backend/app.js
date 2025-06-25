import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';

import path from 'path';
import { fileURLToPath } from 'url';

/* ------------------------------------- */
const app  = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---------- SQLite ------------------- */
const dbPath = path.join(__dirname, 'datenbank.db');
const db     = new Database(dbPath);

/* Tabelle bei Bedarf anlegen */
try {
  db.prepare('SELECT 1 FROM Transaktionen LIMIT 1').get();
} catch {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS Transaktionen (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      Datum        TEXT,
      Typ          TEXT,
      Betrag       REAL,
      Beschreibung TEXT
    );
  `).run();
}

/* -------- Middleware --------------- */
app.use(cors());
app.use(bodyParser.json());

/* ---------- Frontend  -------------- */
const publicPath = path.join(__dirname, '../Frontend');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

/* ----------- API ------------------- */
/* Alle Transaktionen */
app.get('/api/transaktionen', (req, res) => {
  const rows = db.prepare('SELECT * FROM Transaktionen ORDER BY Datum DESC').all();
  res.json(rows);
});

/* Neue Transaktion */
app.post('/api/transaktionen', (req, res) => {
  try {
    const { datum, typ, betrag, beschreibung } = req.body;
    db.prepare(`
      INSERT INTO Transaktionen (Datum, Typ, Betrag, Beschreibung)
      VALUES (?, ?, ?, ?)
    `).run(datum, typ, betrag, beschreibung);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Fehler beim INSERT:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* Transaktion ändern */
app.put('/api/transaktionen/:id', (req, res) => {
  const { id } = req.params;
  const { datum, typ, betrag, beschreibung } = req.body;
  db.prepare(`
    UPDATE Transaktionen
    SET Datum = ?, Typ = ?, Betrag = ?, Beschreibung = ?
    WHERE id = ?
  `).run(datum, typ, betrag, beschreibung, id);
  res.json({ success: true });
});

/* Transaktion löschen */
app.delete('/api/transaktionen/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM Transaktionen WHERE id = ?').run(id);
  res.json({ success: true });
});

/* ---------- Serverstart ------------ */
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});