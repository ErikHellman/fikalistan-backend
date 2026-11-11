# AGENTS.md

Fikalistan: en gemensam fikalista för jobbet. Planen och stegen finns i [PLAN.md](PLAN.md). Läs den först.

## Alltid

- **Ett steg per session.** Varje steg i PLAN.md görs på en egen branch (`steg-N-kort-namn`) och avslutas med en pull request som öppnas med `gh pr create`. Gör inget utöver steget.
- **Testerna ska gå igenom** (`npm test`) innan pull requesten öppnas.
- **Bocka av steget i PLAN.md** (`- [x]`) i samma pull request.
- Committa aldrig direkt på `main`.
- Skriv bara kod för steget du arbetar med. Planen ändras bara om användaren säger det.

## Hemligheter

- `.env` får aldrig in i Git. Läs, skriv ut eller logga aldrig nyckeln.
- Be aldrig användaren klistra in nyckeln i chatten. Användaren lägger in den själv i `.env`.

## Arkitektur

- En enda server (Express) skickar både sidorna och API:et under `/api` på http://localhost:3000. `npm run dev` startar allt.
- Frontenden (React, JavaScript) pratar bara med vårt eget API, aldrig direkt med Supabase.
- Backenden pratar med Supabase via `@supabase/supabase-js` och den hemliga nyckeln.
- `createApp({ db })` tar emot databasen som parameter, så att tester kan använda låtsasdatabasen.

## Databas

- Ändringar görs som migrationer i `supabase/migrations/` och skickas med `supabase db push`.
- Row Level Security ska vara påslaget på alla tabeller.

## API

- All indata kontrolleras i backenden. Fel ger status 400 och `{ "fel": "svenskt meddelande" }`.

## Tester

- `node --test`, med låtsasdatabas. Testerna får inte röra Supabase och ska fungera utan `.env`.

## Språk

- Allt i gränssnittet och alla felmeddelanden är på svenska. Koden och identifierare får vara på svenska eller engelska, men håll dig till det som redan används.
