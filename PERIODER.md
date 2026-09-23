# Försäljningsperioder

> Lagerutförsäljning (`2026-LAGER`, säljer bara det som finns kvar): se
> [LAGERUTFORSALJNING.md](LAGERUTFORSALJNING.md). En period med rader i fliken
> **Lager** får lagerspärr; perioder utan rader där säljer obegränsat som förut.

Håller isär försäljningsomgångar utan att föräldrarnas länkar ändras.

## Så funkar det

Fliken **`Perioder`** i kalkylarket är facit för vilken omgång som pågår:

| id | namn | start | slut | aktiv | forsaljningsflik | bestallningsflik |
|---|---|---|---|---|---|---|
| `2026-VAR` | Vår 2026 | 2026-01-15 | 2026-05-31 | NEJ | Försäljning 2026 | Beställning 2026 |
| `2026-HOST` | Höst 2026 | 2026-09-01 | | JA | Försäljning H26 | Beställning H26 |

Varje period äger **två** flikar: `forsaljningsflik` med ekonomin (kvar att
swisha) och `bestallningsflik` med antal, levererat, kvar och betalning per
spelare — den som leveransvyn och spelaröversikten i dashboarden bygger på.

`start` och `slut` är enbart dokumentation — perioden byts av kolumnen
`aktiv`, aldrig av datum. Ett `id` måste innehålla minst en bokstav,
annars gör Sheets om det till ett datum.

Varje ny beställning stämplas av servern med den aktiva periodens id i
kolumnen **`Period`** i "Inkomna beställningar". Sedan filtrerar allt på den.

**Länkarna ändras inte.** `…?spelare=agnes-parmeus` betyder "pågående period".
Sparade länkar, QR-koder och flygbladet fungerar precis som förut.
`&period=2026-VAR` visar en avslutad omgång, och då är beställningsformuläret
låst så att ingen kan bokföra i fel period.

## Driftsättning

Ordningen spelar roll. Slår du på filtreringen (steg 4) innan de gamla
raderna är stämplade (steg 3) ser all historik ut att ha försvunnit.

### 0. Ta en kopia av arket

`Arkiv → Skapa en kopia`. Steg 3 skriver i varje befintlig rad.

### 1. Klistra in filen

Arket → **Tillägg → Apps Script**. Öppna `apps-script-perioder.js`,
markera allt (Cmd/Ctrl + A), kopiera, klistra in **längst ned** i din
befintliga kodfil (`Code.gs`). Rör inget som redan står där. Spara.

Hela filen, inte delar av den. Del C är bara kommentarer och kör ingenting.
Fram till steg 4 fungerar sajten precis som förut.

### 2. Kör `forberedPerioder` i editorn

Välj funktionen i listan högst upp → Kör → öppna Körningslogg.

Den skapar fliken `Perioder` och kolumnen `Period` i "Inkomna beställningar",
och loggar dina riktiga kolumnrubriker samt vilket nummer Period-kolumnen fick.
Ofarlig att köra om.

Ser rubrikerna fel ut står de inte på rad 1 — sätt `PERIOD_CFG.ordersHeaderRow`
till rätt radnummer och kör om.

Skapa sedan höstens **två** flikar:

| Duplicera | Döp till | Innehåller |
|---|---|---|
| Försäljning 2026 | **Försäljning H26** | Ekonomi per spelare — kvar att swisha |
| Beställning 2026 | **Beställning H26** | Antal, levererat, kvar, betalning, manuella ordrar |

Behåll namn och formler, töm siffrorna. Töm även pallordern i `W3:Y3` om
"Beställning 2026" har en. Namnen måste stavas exakt som i kolumnerna
`forsaljningsflik` och `bestallningsflik`.

Kör `forberedPerioder` igen — loggen listar båda flikarna per period och
flaggar dem som inte finns.

### 3. Kör `migreraGamlaPerioder` i editorn

Fyller `Period` med `2026-VAR` för alla befintliga rader som saknar värde.
Rör ingen annan kolumn och skriver aldrig över ett värde som redan finns.

Kontrollera i arket att **ingen datarad är tom** i Period-kolumnen innan
du går vidare.

### 4. Del C — fyra ändringar i din egen kod

Nu kopplas filtreringen på. Exakt kod att kopiera finns i `apps-script-perioder.js`:

- **C1** — routa `?action=perioder` och `?action=peek` överst i `doGet`,
  plus `var inPeriod = periodMatcher_(e);`
- **C2** — `.filter(inPeriod)` på raderna i varje case som läser
  "Inkomna beställningar", plus period i cachenycklarna
- **C3** — `kvar_swisha` läser `periodSalesSheetName_(e)` i stället för
  hårdkodat `'Försäljning 2026'`
- **C4** — `delivery`, `playerOverview` och de manuella ordrarna läser
  `periodOrdersSheetName_(e)` i stället för hårdkodat `'Beställning 2026'`
- **C5** — `LockService` + `stampOrderPeriod_()` i `doPost`

Hoodie-röstningen är en engångsgrej utan perioder. Lämna `hoodie_votes` och
`handleHoodieOrder` orörda — den fliken får aldrig någon Period-kolumn, så
ett filter där skulle tömma rösterna.

Distribuera sedan: **Distribuera → Hantera distributioner → pennan →
Version: Ny version**. Att spara räcker inte.

Testa i webbläsaren:

```
…/exec?action=perioder
…/exec?action=peek
…/exec?action=orders&player=NAMN&period=2026-VAR   → vårens beställningar
…/exec?action=orders&player=NAMN&period=2026-HOST  → []
```

Samma svar på de två sista betyder att filtret inte sitter i.

### 5. Frontend

`index.html` och `dashboard.html` är redan uppdaterade — pusha som vanligt.
De klarar sig om backend ännu inte har perioder; då faller de tillbaka på
"Höst 2026" och beter sig som förut.

Ladda om hårt (Ctrl/Cmd + Shift + R) första gången.

## Starta nästa omgång

1. Duplicera **båda** flikarna, döp om, töm siffrorna.
2. Fyll i `NASTA_PERIOD` högst upp i den inklistrade koden:

```js
var NASTA_PERIOD = {
  id:               '2027-VAR',
  namn:             'Vår 2027',
  forsaljningsflik: 'Försäljning V27',
  bestallningsflik: 'Beställning V27'
};
```

3. Kör `startaNastaPeriod` från editorn.
4. Lägg till periodens rad i `PALL_ORDER_PER_PERIOD` i `dashboard.html` när
   pallordern är lagd hos leverantören. Den siffran finns inte i arket.

Den stänger nuvarande period, sätter slutdatum, öppnar den nya och tömmer
cachen. Vägrar den, säger den varför: id utan bokstav, flik som inte finns,
eller ett id som redan används. Ingen kodändring, ingen ny deploy.

De gamla flikarna lämnas orörda — det är hela poängen: förra omgångens
siffror kan inte råka ändras.

## Vad som blev periodmedvetet

| Var | Vad |
|---|---|
| Flygblad | Badgen visar periodens namn i stället för `2026` |
| Beställningsformulär | Låst med en förklaring om man tittar på en avslutad period |
| Mina beställningar | Periodetikett, växlare mellan omgångar, endast vald periods ordrar |
| Mina beställningar | `localStorage`-nycklar för levererat/betalt är periodmärkta (gamla nycklar migreras till första perioden) |
| Beställningslänkar | Banner som visar pågående eller avslutad period |
| Dashboard | Periodväljare i toppen, alla API-anrop och all cache per period |
| Dashboard | Leveransvy och spelaröversikt läser periodens beställningsflik |
| Dashboard | Pallordern i lageröversikten är per period (`PALL_ORDER_PER_PERIOD`) |
| Dashboard | 2025-raden visas bara i den första perioden |

## Designval värda att känna till

- **Fail-open.** Saknas Period-kolumnen släpper filtret igenom allt. Kör du
  Del C innan `forberedPerioder` blir listorna oförändrade, inte tomma.
- **Inga skrivningar från GET.** `?action=perioder` och `?action=peek` läser
  bara. Flik och kolumn skapas enbart av funktionerna du kör från editorn.
- **Ingen tyst fallback.** Är `forsaljningsflik` eller `bestallningsflik` tom
  svarar backend med tomt i stället för att läsa förra omgångens siffror. En
  synlig nolla är bättre än fel siffror som ser rätt ut.
- **Servern bestämmer perioden.** Frontend skickar med ett `period`-fält i
  beställningen, men `doPost` ignorerar det och använder alltid aktiv period.
