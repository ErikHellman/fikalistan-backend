# Fikalistan – plan

En gemensam fikalista för jobbet. Man skriver sitt namn och vad man tar med till fikat, och alla ser samma lista med det senaste först. Man kan ta bort poster, och listan finns kvar när servern startas om.

## Mål

- Lägga till en post (namn + vad man tar med).
- Alla ser samma lista, nyaste först.
- Ta bort en post.
- Datan ligger i Postgres hos Supabase och överlever omstarter.

## Utanför omfattningen (för nu)

- Inloggning och ägarskap. Utan inloggning kan **alla ta bort alla poster**. Det är ett medvetet val tills vidare.
- Redigera poster, kategorier, datum för fikat, realtidsuppdatering (listan hämtas om efter varje ändring och vid sidladdning).
- Driftsättning/hosting.

## Teknik

| Del | Val |
|---|---|
| Server | Node.js + Express, en enda server på `http://localhost:3000` som skickar både sidor och API (`/api`) |
| Frontend | React (JavaScript) byggd med Vite. I utveckling körs Vite i middleware-läge inuti Express. Efter `npm run build` skickar Express ut `dist/` |
| Databas | Postgres hos Supabase. Migrationer i `supabase/migrations/`, skickas med `supabase db push`. Row Level Security på alla tabeller |
| Databasåtkomst | Endast backenden, via `@supabase/supabase-js` och den hemliga nyckeln. Frontenden pratar bara med vårt eget API |
| Hemligheter | `SUPABASE_URL` och `SUPABASE_SECRET_KEY` i `.env` (ligger i `.gitignore`). `.env.example` utan värden checkas in. Nyckeln klistras in av användaren, aldrig i chatten |
| Tester | `node --test`. Databasen byts mot en låtsasversion i minnet, så testerna rör inte Supabase och kräver ingen nyckel |
| CI | GitHub Actions kör testerna på varje pull request |
| Språk | Allt i gränssnittet och alla felmeddelanden från API:et är på svenska |

### Föreslagen mappstruktur

```
server/
  index.js          # startar servern (läser .env, väljer databas, Vite eller dist)
  app.js            # createApp({ db }) – Express-appen, utan sidoeffekter
  routes/fikaposter.js
  validering.js     # kontroll av indata
  db/supabase.js    # riktig databas (@supabase/supabase-js)
  db/minne.js       # låtsasdatabas för tester
  test/*.test.js
src/                # React-frontend
index.html
vite.config.js
supabase/migrations/
.github/workflows/test.yml
```

`createApp({ db })` tar emot databasen som parameter. Det är det som gör att testerna kan stoppa in låtsasdatabasen.

## Databas

### Tabell `fikaposter`

| Kolumn | Typ | Regler |
|---|---|---|
| `id` | `uuid` | primärnyckel, `default gen_random_uuid()` |
| `namn` | `text` | `not null`, 1–40 tecken |
| `bidrag` | `text` | `not null`, 1–100 tecken (vad man tar med) |
| `skapad` | `timestamptz` | `not null`, `default now()` |

- Index på `skapad desc` för listan.
- `alter table fikaposter enable row level security;` utan några policyer. Då når varken `anon` eller `authenticated` något. Backenden använder den hemliga nyckeln, som går förbi RLS.
- Migrationen återkallar även `anon`/`authenticated`-rättigheter på tabellen (extra säkerhet).
- Alla framtida tabeller får RLS påslaget i sin egen migration.

## API

Bas: `/api`. JSON in och ut. Fel svarar alltid med `{ "fel": "Svenskt meddelande" }`.

| Metod | Adress | Vad den gör | Statuskoder |
|---|---|---|---|
| GET | `/api/fikaposter` | Hämtar alla poster, nyaste först | 200, 500 |
| POST | `/api/fikaposter` | Skapar en post från `{ "namn", "bidrag" }` och returnerar den skapade posten | 201, 400, 500 |
| DELETE | `/api/fikaposter/:id` | Tar bort posten med det id:t | 204, 400 (ogiltigt id), 404 (finns inte), 500 |
| * | `/api/...` (okänd adress) | Svarar med JSON-fel i stället för HTML | 404 |

Exempel på post i svar:

```json
{ "id": "7c1f…", "namn": "Anna", "bidrag": "Kanelbullar", "skapad": "2026-11-11T13:52:00.000Z" }
```

### Validering (backend, svarar 400)

- Body måste vara giltig JSON: "Förfrågan var inte giltig JSON."
- `namn` och `bidrag` måste finnas och vara text: "Namn saknas." / "Du måste skriva vad du tar med."
- Värdena trimmas. Tomma efter trim ger fel.
- `namn` högst 40 tecken: "Namnet får vara högst 40 tecken."
- `bidrag` högst 100 tecken: "Det du tar med får vara högst 100 tecken."
- `:id` måste vara ett giltigt uuid: "Ogiltigt id."
- Okända fält i body ignoreras.

## Steg

Varje steg görs i en egen session, på en egen branch, och blir en egen pull request. Bocka av steget här när PR:en är öppnad.

### - [x] Steg 1 – Projektgrund

Skapa `package.json` (ESM), installera Express, React, Vite och `@vitejs/plugin-react`. Gör en Express-server med Vite i middleware-läge i utveckling och `dist/` i produktion, en minimal React-sida ("Fikalistan"), `.env.example`, och skripten `dev`, `build`, `start`, `test`. Okända `/api`-adresser svarar med 404 och JSON.

**Klart när:** `npm run dev` visar sidan på http://localhost:3000, `npm run build && npm start` visar samma sida från `dist/`, och `curl localhost:3000/api/nagot` ger 404 med JSON.

### - [x] Steg 2 – Databas och migration

Länka Supabase-projektet (`supabase link`, referens-id frågas av användaren), skriv migrationen för `fikaposter` med RLS, och kör `supabase db push`. Användaren lägger själv in `SUPABASE_URL` och `SUPABASE_SECRET_KEY` i `.env`.

**Klart när:** migrationsfilen ligger i `supabase/migrations/`, `supabase db push` går igenom, och tabellen finns i Supabase med RLS påslaget (`supabase migration list` visar migrationen som tillämpad).

### - [ ] Steg 3 – API med validering och tester

Implementera `createApp({ db })`, routerna i tabellen ovan, valideringen, låtsasdatabasen i minnet och den riktiga Supabase-databasen. Skriv tester med `node --test` för alla adresser och alla felfall.

**Klart när:** `npm test` är grönt utan `.env` och utan nätverk, och en manuell rundtur med `curl` (skapa, lista, ta bort) fungerar mot riktiga Supabase.

### - [ ] Steg 4 – GitHub Actions

Workflow som kör `npm ci` och `npm test` på varje pull request (Node 22, inga hemligheter).

**Klart när:** pull requesten för det här steget visar en grön testkörning i GitHub.

### - [ ] Steg 5 – Frontend: listan och formuläret

React-sida med formulär (namn + vad du tar med), lista med nyaste först och en ta bort-knapp per post. Namnet sparas i webbläsarens `localStorage`. Visa laddning, tom lista ("Ingen har lagt till något än – bli först!") och felmeddelanden från API:et. All text på svenska.

**Klart när:** man kan lägga till och ta bort poster i webbläsaren, listan finns kvar efter omstart av servern och sidladdning, och ett ogiltigt formulär visar backendens svenska felmeddelande.

### - [ ] Steg 6 – Design och mobilanpassning

Glad design med varma färger (CSS-variabler, inget UI-ramverk), tillgängliga knappar och fokusmarkeringar, och en layout som fungerar från 320 px bredd.

**Klart när:** sidan ser bra ut och går att använda på mobilbredd (kontrolleras i webbläsarens mobilläge), utan horisontell scroll.
