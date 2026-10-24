const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_SCRIPT_URL = process.env.GWC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';

app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));
app.get('/api/gwc', async (req, res) => {
  try {
    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set('action', req.query.action || 'load');
    url.searchParams.set('t', String(Date.now()));
    const upstream = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'Cache-Control': 'no-cache' } });
    const body = await upstream.text();
    res.status(upstream.ok ? 200 : upstream.status).type('application/json').send(body);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Google Apps Script GET proxy failed: ' + (err.message || String(err)) });
  }
});
app.post('/api/gwc', async (req, res) => {
  try {
    const upstream = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', 'Cache-Control': 'no-cache' },
      body: JSON.stringify(req.body || {})
    });
    const body = await upstream.text();
    let parsed;
    try { parsed = JSON.parse(body); }
    catch (_) { return res.status(502).json({ ok: false, error: 'Google Apps Script returned non-JSON response. Check Web App deployment access.' }); }
    res.status(upstream.ok ? 200 : upstream.status).json(parsed);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Google Apps Script POST proxy failed: ' + (err.message || String(err)) });
  }
});
app.use(express.static(path.join(__dirname), { index: 'index.html' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`GWC website server listening on ${PORT}`));
