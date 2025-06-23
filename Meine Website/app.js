import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';

const app = express();
const port = 3000;
const db = new Database('/Users/klaramelzer/Desktop/OMB2/Webentwicklung/Meine Website/datenbank.db');

try {
    db.prepare('SELECT 1 FROM Transaktionen LIMIT 1').get();
} catch (err) {
    console.warn('Tabelle "Transaktionen" nicht gefunden. Erstelle sie...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS Transaktionen (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Datum TEXT,
            Typ TEXT,
            Betrag INTEGER,
            Beschreibung TEXT
        )
    `).run();
}

app.use(cors());
app.use(bodyParser.json());

// Alle Transaktionen abrufen
app.get('/api/transaktionen', (req, res) => {
    const stmt = db.prepare('SELECT * FROM Transaktionen ORDER BY Datum DESC');
    const transaktionen = stmt.all();
    res.json(transaktionen);
});

// Neue Transaktion hinzufügen
app.post('/api/transaktionen', (req, res) => {
    const { datum, typ, betrag, beschreibung } = req.body;
    const stmt = db.prepare('INSERT INTO Transaktionen (Datum, Typ, Betrag, Beschreibung) VALUES (?, ?, ?, ?)');
    stmt.run(datum, typ, betrag, beschreibung);
    res.status(201).json({ success: true });
});

// Transaktion aktualisieren
app.put('/api/transaktionen/:id', (req, res) => {
    const { datum, typ, betrag, beschreibung } = req.body;
    const { id } = req.params;
    const stmt = db.prepare('UPDATE Transaktionen SET Datum = ?, Typ = ?, Betrag = ?, Beschreibung = ? WHERE id = ?');
    stmt.run(datum, typ, betrag, beschreibung, id);
    res.json({ success: true });
});

// Transaktion löschen
app.delete('/api/transaktionen/:id', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM Transaktionen WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});