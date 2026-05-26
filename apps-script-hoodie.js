// ═══════════════════════════════════════════════════════════════════
// APPS SCRIPT – HOODIE-RÖSTNING
// Lägg till i ditt befintliga Apps Script
// ═══════════════════════════════════════════════════════════════════

// ── 1. I din doPost – lägg till DIREKT efter var data = JSON.parse(...) ──
//
//   if (data.type === 'hoodie_vote' || data.type === 'hoodie') return handleHoodieOrder(data);

// ── 2. I din doGet – lägg till I BÖRJAN av funktionen ──────────────
//
// function doGet(e) {
//   var params = e.parameter;
//   if (params.action === 'hoodie_votes') return getHoodieVotes();
//   // ... resten av din befintliga doGet-kod ...
// }

// ── 3. Lägg till dessa två funktioner LÄNGST NED i skriptet ────────

function getHoodieVotes() {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Hoodie-röstning');

    if (!sheet || sheet.getLastRow() < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ votes: {} }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Läs alla rader (skip rubrikrad)
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    var votes = {};

    rows.forEach(function(row) {
      var hoodieId = String(row[5] || '').trim(); // Kolumn F = hoodieId
      var name     = String(row[2] || '').trim(); // Kolumn C = namn
      var size     = String(row[4] || '').trim(); // Kolumn E = storlek
      if (!hoodieId) return;
      if (!votes[hoodieId]) votes[hoodieId] = [];
      votes[hoodieId].push({ name: name, size: size });
    });

    return ContentService
      .createTextOutput(JSON.stringify({ votes: votes }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleHoodieOrder(data) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Hoodie-röstning');

    if (!sheet) {
      sheet = ss.insertSheet('Hoodie-röstning');
      sheet.appendRow(['Tidstämpel','Referens','Namn','Hoodie','Storlek','Hoodie-ID','Registrerad']);
      var header = sheet.getRange(1, 1, 1, 7);
      header.setFontWeight('bold');
      header.setBackground('#0f2a5e');
      header.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 120);
      sheet.setColumnWidth(3, 160);
      sheet.setColumnWidth(4, 260);
      sheet.setColumnWidth(5, 80);
      sheet.setColumnWidth(6, 120);
      sheet.setColumnWidth(7, 160);
    }

    var ts = new Date(data.timestamp || new Date().toISOString());
    var tsFormatted = Utilities.formatDate(ts, 'Europe/Stockholm', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      tsFormatted,
      data.ref      || '',
      data.name     || '',
      data.hoodie   || '',
      data.size     || '',
      data.hoodieId || '',
      new Date()
    ]);

    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 7).setBackground('#eef2f8');
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', ref: data.ref }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
