import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApp } from './app.js';

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const produktion = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 3000;

const app = createApp();

if (produktion) {
  // Skicka ut det byggda gränssnittet, med fallback till index.html.
  const dist = path.join(rot, 'dist');
  app.use(express.static(dist));
  app.use((req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
} else {
  // Utveckling: Vite körs i middleware-läge inuti Express.
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: rot,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Fikalistan körs på http://localhost:${port}`);
});
