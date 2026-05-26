// ═══════════════════════════════════════════════════════════════════
// APPS SCRIPT – EXPONERA KOLUMN K ("Kvar att swisha Jimmie") från
// fliken "Försäljning 2026" till dashboardens nya ruta.
// ═══════════════════════════════════════════════════════════════════
//
// Varför detta behövs:
//   Dashboardens nya ruta "Kvar att swisha Jimmie" är per spelare, och
//   datan ligger per-rad i fliken "Försäljning 2026" kolumn K (rad 7 och
//   nedåt — samma layout som "Beställning 2026" med A=förnamn, B=efter-
//   namn). Dashboardens endpoint ?action=orders läser från "Inkomna
//   beställningar" och innehåller inte den datan — vi behöver en ny
//   endpoint som slår upp värdet per spelare.
//
// Dashboarden kallar nu:
//   GET  https://script.google.com/.../exec?action=kvar_swisha
//   → svar: { "Novelia Ahlberg": 2262, "Elijona X": 0, ... }
//
// Gör så här:
//
// ───────────────────────────────────────────────────────────────────
// STEG 1 – Lägg till ett nytt case i doGet-switchen
// ───────────────────────────────────────────────────────────────────
// Hitta switchen i din doGet (runt raden "case 'players':" i ditt
// befintliga skript) och lägg in följande case — förslagsvis direkt
// efter `case 'playerOverview': { ... }`:

/*
      case 'kvar_swisha': {
        const cache  = CacheService.getScriptCache();
        const cached = cache.get('kvar_swisha');
        if (cached) return jsonOut(JSON.parse(cached));
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Försäljning 2026');
        if (!sheet) return jsonOut({});
        const lastRow = sheet.getLastRow();
        if (lastRow < 7) return jsonOut({});
        // A=förnamn, B=efternamn, K=kvar att swisha Jimmie (kolumn 11)
        const names = sheet.getRange(7, 1, lastRow - 6, 2).getValues();
        const kvar  = sheet.getRange(7, 11, lastRow - 6, 1).getValues();
        const map = {};
        names.forEach(function(n, i) {
          const full = (String(n[0]).trim() + ' ' + String(n[1]).trim()).trim();
          if (!full) return;
          const v = kvar[i][0];
          // Tomma celler eller formler som returnerar "" → 0
          const num = (v === '' || v === null || v === undefined)
            ? 0
            : (typeof v === 'number' ? v : Number(String(v).replace(/\s|kr/gi,'').replace(',','.')));
          map[full] = isNaN(num) ? 0 : num;
        });
        cache.put('kvar_swisha', JSON.stringify(map), 300); // 5 min cache
        return jsonOut(map);
      }
*/

// ───────────────────────────────────────────────────────────────────
// STEG 2 – Spara & distribuera ny version av webbappen
// ───────────────────────────────────────────────────────────────────
// 1. Spara (Ctrl/Cmd + S)
// 2. Klicka "Distribuera" → "Hantera distributioner"
// 3. Pennikonen bredvid aktiv deploy → Version: "Ny version" → Distribuera
// 4. URL:en förändras inte, dashboarden behöver inga ändringar där.
//
// ───────────────────────────────────────────────────────────────────
// STEG 3 – Verifiera att endpointen fungerar
// ───────────────────────────────────────────────────────────────────
// Öppna i webbläsaren (byt ut AKfycbw... till din egen deploy-ID):
//
//   https://script.google.com/macros/s/AKfycbwtUDMA1oc2aRJA30D4pDCUs0J-mBgU0ka6eM0LEEYNaeuur9WYjfYatQT3H-i7HtnQ/exec?action=kvar_swisha
//
// Du ska få ett JSON-svar av typen:
//   {"Novelia Ahlberg": 2262, "Förnamn Efternamn": 0, ...}
//
// Om du får {} — kontrollera att fliken heter exakt "Försäljning 2026"
// (med å, mellanslag och samma case). Om du får en siffra men fel
// värde — kontrollera att kolumn K stämmer i arket (räkna: A=1, B=2,
// C=3, D=4, E=5, F=6, G=7, H=8, I=9, J=10, K=11).
//
// ───────────────────────────────────────────────────────────────────
// STEG 4 – Tvinga dashboarden att hämta ny data
// ───────────────────────────────────────────────────────────────────
// Dashboarden cachar 5 min i sessionStorage. För att se direkt:
//   - Hård refresh (Ctrl/Cmd + Shift + R), eller
//   - Öppna devtools-konsolen och kör:
//       sessionStorage.clear(); location.reload();
//
// ═══════════════════════════════════════════════════════════════════
// OBS om namnmatchning
// ═══════════════════════════════════════════════════════════════════
// Dashboardens dropdown använder spelarens namn såsom det står i
// "Inkomna beställningar" kolumn C (Spelare). Det måste matcha exakt
// mot A+' '+B i "Försäljning 2026" (förnamn + mellanslag + efternamn).
// Om du har t.ex. "Novelia Ahlberg" i dropdown-menyn men "Novelia"
// och "Ahlberg " (med trailing space) i arket → det funkar ändå,
// eftersom .trim() appliceras. Men stavning/bindestreck måste stämma.
