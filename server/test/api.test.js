import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';

async function medServer(fn) {
  const server = createApp().listen(0);
  await new Promise((klar) => server.once('listening', klar));
  try {
    await fn(`http://localhost:${server.address().port}`);
  } finally {
    await new Promise((klar) => server.close(klar));
  }
}

test('okänd /api-adress svarar 404 med JSON-fel på svenska', async () => {
  await medServer(async (bas) => {
    const svar = await fetch(`${bas}/api/nagot`);
    assert.equal(svar.status, 404);
    assert.match(svar.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await svar.json(), { fel: 'Adressen finns inte.' });
  });
});

test('okänd /api-adress svarar 404 även för POST', async () => {
  await medServer(async (bas) => {
    const svar = await fetch(`${bas}/api/nagot/annat`, { method: 'POST' });
    assert.equal(svar.status, 404);
    assert.deepEqual(await svar.json(), { fel: 'Adressen finns inte.' });
  });
});
