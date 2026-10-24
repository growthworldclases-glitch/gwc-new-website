const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GWC_APPS_SCRIPT_URL = process.env.GWC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';

app.disable('x-powered-by');
app.use(express.text({ type: ['text/*', 'application/json', 'application/*+json'], limit: '8mb' }));
app.use(express.static(path.join(__dirname), { index: 'index.html' }));

app.get('/api/gwc', async (req, res) => {
  try {
    const action = String(req.query.action || 'load');
    const url = new URL(GWC_APPS_SCRIPT_URL);
    url.searchParams.set('action', action);
    const upstream = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
    const body = await upstream.text();
    res.status(upstream.ok ? 200 : upstream.status).type('application/json').send(body);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Google Apps Script connection failed: ' + (err.message || 'unknown error') });
  }
});

app.post('/api/gwc', async (req, res) => {
  try {
    if (typeof req.body !== 'string' || !req.body.trim()) {
      return res.status(400).json({ ok: false, error: 'Missing JSON request body' });
    }
    JSON.parse(req.body); // Validate payload before forwarding.
    const upstream = await fetch(GWC_APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: req.body
    });
    const body = await upstream.text();
    res.status(upstream.ok ? 200 : upstream.status).type('application/json').send(body);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Google Apps Script request failed: ' + (err.message || 'unknown error') });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'GWC website proxy' }));
app.listen(PORT, () => console.log(`GWC website listening on ${PORT}`));
