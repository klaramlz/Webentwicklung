//  Frontend‑Logik für Budget‑Tracker 

// DOM‑Referenzen
const form                = document.getElementById('transactions-form');
const abbrechenBtn        = document.getElementById('abbrechen-btn');
const listeContainer      = document.getElementById('transaktions-liste');
const bearbeitungsIdInput = document.getElementById('bearbeitungs-id');


// Transaktionen vom Server laden und Tabelle aufbauen

async function ladeTransaktionen () {
  const response = await fetch('/api/transaktionen');
  const daten    = await response.json();

  listeContainer.innerHTML =
    '<table><thead><tr><th>Datum</th><th>Typ</th><th>Betrag</th><th>Beschreibung</th><th>Aktion</th></tr></thead><tbody></tbody></table>';

  const tbody = listeContainer.querySelector('tbody');

  daten.forEach(t => {
    const zeile = document.createElement('tr');
    zeile.innerHTML = `
      <td>${t.Datum}</td>
      <td>${t.Typ}</td>
      <td>${t.Betrag} €</td>
      <td>${t.Beschreibung}</td>
      <td>
        <button onclick="bearbeiten(${t.id})">✏️</button>
        <button onclick="loeschen(${t.id})">🗑️</button>
      </td>`;
    tbody.appendChild(zeile);
  });
}


// Formular‑Submit (neu oder bearbeiten)

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id    = bearbeitungsIdInput.value;
  const datum = document.getElementById('datum').value;
  const typ   = document.querySelector('input[name="typ"]:checked').value;
  const betrag       = parseFloat(document.getElementById('betrag').value);
  const beschreibung = document.getElementById('beschreibung').value;

  const daten = { datum, typ, betrag, beschreibung };

  const url    = id ? `/api/transaktionen/${id}` : '/api/transaktionen';
  const method = id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(daten)
  });

  if (response.ok) {
    ladeTransaktionen();
    form.reset();
    bearbeitungsIdInput.value = '';
    document.getElementById('formular-titel').innerText = 'Neue Transaktion';
    document.getElementById('speichern-btn').innerText  = 'Hinzufügen';
  } else {
    const err = await response.json().catch(() => ({}));
    alert(err.error || 'Fehler beim Speichern der Transaktion.');
  }
});

// Abbrechen‑Button

abbrechenBtn.addEventListener('click', () => {
  form.reset();
  bearbeitungsIdInput.value = '';
  document.getElementById('formular-titel').innerText = 'Neue Transaktion';
  document.getElementById('speichern-btn').innerText  = 'Hinzufügen';
});


// Funktionen global machen (für onclick‑Attribute)

window.bearbeiten = async function (id) {
  const daten = await fetch('/api/transaktionen').then(r => r.json());
  const t     = daten.find(e => e.id === id);
  if (t) {
    document.getElementById('datum').value = t.Datum;
    document.querySelector(`input[name="typ"][value="${t.Typ}"]`).checked = true;
    document.getElementById('betrag').value       = t.Betrag;
    document.getElementById('beschreibung').value = t.Beschreibung;
    bearbeitungsIdInput.value = t.id;
    document.getElementById('formular-titel').innerText = 'Transaktion bearbeiten';
    document.getElementById('speichern-btn').innerText  = 'Speichern';
  }
};

window.loeschen = async function (id) {
  if (confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
    const response = await fetch(`/api/transaktionen/${id}`, { method: 'DELETE' });
    if (response.ok) {
      ladeTransaktionen();
    } else {
      alert('Fehler beim Löschen.');
    }
  }
};


// Initialer Ladevorgang

ladeTransaktionen();