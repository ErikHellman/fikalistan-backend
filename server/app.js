import express from 'express';

// Bygger Express-appen utan sidoeffekter (ingen port, ingen Vite, inga filer).
// Sidor (Vite eller dist/) kopplas på i server/index.js.
export function createApp() {
  const app = express();

  // Okända adresser under /api svarar med JSON i stället för HTML.
  app.use('/api', (req, res) => {
    res.status(404).json({ fel: 'Adressen finns inte.' });
  });

  return app;
}
