# Lagerutförsäljning H26

Säljer slut på det som finns i lager. Egen period (`2026-LAGER`) – hålls helt
isär från Vår 2026 och Höst 2026. Samma spelarlänkar och QR-koder som förut.

## Lager vid start

| Produkt | Art.nr | Hela frp | Lösa pack | Pool |
|---|---|---|---|---|
| Advanced 2-lag | 110284 | 11 | – | 11 frp |
| Premium 2-lag | 110219 | 43 | 2 × 6-pack | 303 st 6-pack |
| Premium 3-lag | 110319 | 18 | 4 × 8-pack | 130 st 8-pack |

Hel frp och delpaket delar pool (1 frp = 7 pack). Hel frp går att köpa så
länge ≥ 7 pack finns kvar. Priser oförändrade.

## Så beter sig systemet

- **Formuläret** visar "Kvar i lager: N st" per produkt, maxar antal, visar
  "Slutsåld" och spärrar "Skicka" när allt är slut.
- **Precis före skick** hämtas färskt saldo. Har någon hunnit före justeras
  antalen och köparen får skicka igen.
- **Servern** kontrollerar igen inne i låset och avvisar det som inte ryms.
  Avvisade ordrar sparas i fliken **Avvisade beställningar** – inget
  försvinner tyst.
- **Sålt** = webbordrar i perioden, eller periodens beställningsflik om den
  visar mer (manuella ordrar), per spelare.
- **Dashboarden** visar startlager / sålt / kvar i stället för pallordern.

## Driftsättning

0. `Arkiv → Skapa en kopia` av arket.
1. Duplicera **Försäljning H26** → döp till **Försäljning Lager**.
   Duplicera **Beställning H26** → döp till **Beställning Lager**.
   Behåll formler, töm siffrorna.
2. Apps Script → markera allt i `Kod.gs` → ersätt med
   `klistra-in/0-HELA-Kod.gs.js` → spara.
   (Förra versionen ligger i `klistra-in/gamla/0-HELA-Kod-perioder-2026-08-27.gs.js`.)
3. Kör **`forberedLager`** → skapar fliken **Lager** med saldot ovan.
4. Kör **`startaNastaPeriod`** → stänger Höst 2026, öppnar `2026-LAGER`.
   `NASTA_PERIOD` är redan ifylld.
5. **Distribuera → Hantera distributioner → pennan → Ny version.**
6. Pusha `index.html` och `dashboard.html`.

Test:

```
…/exec?action=lager                      → begransad:true, kvar per produkt
…/exec?action=lager&period=2026-VAR      → begransad:false
```

## Under försäljningen

- **Ändra lagret** (hittad kartong, skadad frp): ändra siffran i fliken
  **Lager**. Slår igenom inom 20 s. Ingen deploy.
- **Status i loggen**: kör `lagerLogga`.
- **Manuell order**: lägg in i Beställning Lager som vanligt – räknas av
  automatiskt.
- **Avvisade beställningar**: kontakta köparen och erbjud det som finns kvar.
