// DOM-Elemente
const form = document.getElementById('transaktions-form');
const transaktionsListe = document.getElementById('transaktions-liste');
const loeschDialog = document.getElementById('loesch-dialog');

// Datenmodell
let transaktionen = JSON.parse(localStorage.getItem('transaktionen')) || [];
let bearbeitungsId = null;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderTransaktionen();
});

// Header per DOM-Manipulation erstellen
function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <h1>Budget Tracker</h1>
        <p>Ihr persönlicher Finanzmanager</p>
    `;
    document.body.prepend(header);
}

// Transaktionen rendern
function renderTransaktionen() {
    transaktionsListe.innerHTML = '';
    
    transaktionen.forEach(transaktion => {
        const transaktionEl = document.createElement('div');
        transaktionEl.className = `eintrag ${transaktion.typ}`;
        transaktionEl.dataset.id = transaktion.id;
        transaktionEl.innerHTML = `
            <div class="eintrag-info">
                <p><span class="eintrag-datum">${transaktion.datum}</span> - 
                   <span class="eintrag-beschreibung">${transaktion.beschreibung}</span></p>
                <p class="betrag">${transaktion.typ === 'einnahme' ? '+' : '-'}${transaktion.betrag.toFixed(2)} €</p>
            </div>
            <div class="aktionen">
                <button class="bearbeiten-btn">Bearbeiten</button>
                <button class="loeschen-btn">Löschen</button>
            </div>
        `;
        transaktionsListe.appendChild(transaktionEl);
    });

    // Event-Listener für Buttons
    document.querySelectorAll('.bearbeiten-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.eintrag').dataset.id);
            bearbeitenTransaktion(id);
        });
    });
    
    document.querySelectorAll('.loeschen-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.eintrag').dataset.id);
            loeschDialogAnzeigen(id);
        });
    });
}

// Formular absenden
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaktion = {
        id: bearbeitungsId || Date.now(),
        datum: document.getElementById('datum').value,
        typ: document.querySelector('input[name="typ"]:checked').value,
        betrag: parseFloat(document.getElementById('betrag').value),
        beschreibung: document.getElementById('beschreibung').value
    };

    if (bearbeitungsId) {
        // Transaktion aktualisieren
        const index = transaktionen.findIndex(t => t.id === bearbeitungsId);
        transaktionen[index] = transaktion;
    } else {
        // Neue Transaktion hinzufügen
        transaktionen.push(transaktion);
    }

    speichernUndAktualisieren();
});

// Transaktion bearbeiten
function bearbeitenTransaktion(id) {
    const transaktion = transaktionen.find(t => t.id === id);
    
    document.getElementById('datum').value = transaktion.datum;
    document.getElementById(transaktion.typ).checked = true;
    document.getElementById('betrag').value = transaktion.betrag;
    document.getElementById('beschreibung').value = transaktion.beschreibung;
    document.getElementById('bearbeitungs-id').value = id;
    document.getElementById('formular-titel').textContent = 'Transaktion bearbeiten';
    
    bearbeitungsId = id;
    form.scrollIntoView({ behavior: 'smooth' });
}

// Löschen bestätigen
function loeschDialogAnzeigen(id) {
    loeschDialog.style.display = 'flex';
    
    document.getElementById('loeschen-bestaetigen').onclick = () => {
        transaktionen = transaktionen.filter(t => t.id !== id);
        speichernUndAktualisieren();
        loeschDialog.style.display = 'none';
    };
    
    document.getElementById('loeschen-abbrechen').onclick = () => {
        loeschDialog.style.display = 'none';
    };
}

// Abbrechen-Button
document.getElementById('abbrechen-btn').addEventListener('click', () => {
    form.reset();
    bearbeitungsId = null;
    document.getElementById('formular-titel').textContent = 'Neue Transaktion';
});

// Daten speichern
function speichernUndAktualisieren() {
    localStorage.setItem('transaktionen', JSON.stringify(transaktionen));
    form.reset();
    bearbeitungsId = null;
    document.getElementById('formular-titel').textContent = 'Neue Transaktion';
    renderTransaktionen();
}