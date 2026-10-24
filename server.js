const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const GOOGLE_SCRIPT_URL = process.env.GWC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const ROOT = __dirname;
const MAX_BODY = 3 * 1024 * 1024;

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}
async function handleApi(req, res, url) {
  try {
    let target = GOOGLE_SCRIPT_URL;
    if (req.method === 'GET') {
      const action = url.searchParams.get('action') || 'load';
      target += (target.includes('?') ? '&' : '?') + 'action=' + encodeURIComponent(action) + '&t=' + Date.now();
      const upstream = await fetch(target, { method: 'GET', redirect: 'follow', cache: 'no-store' });
      const text = await upstream.text();
      return send(res, upstream.ok ? 200 : 502, text);
    }
    if (req.method !== 'POST') return send(res, 405, JSON.stringify({ ok:false, error:'Method not allowed' }));
    let raw = '';
    for await (const chunk of req) {
      raw += chunk.toString('utf8');
      if (Buffer.byteLength(raw, 'utf8') > MAX_BODY) return send(res, 413, JSON.stringify({ ok:false, error:'Request too large; file uploads must be 1 MB or smaller.' }));
    }
    let payload;
    try { payload = JSON.parse(raw || '{}'); }
    catch (_) { return send(res, 400, JSON.stringify({ ok:false, error:'Invalid JSON request body' })); }
    if (payload && payload.payload && typeof payload.payload === 'object' && !payload.action) payload = payload.payload;
    if (!payload.action) {
      if (payload.state && typeof payload.state === 'object') payload.action = 'save';
      else if (payload.dataUrl && payload.name) payload.action = 'upload';
      else if (payload.ping || payload.health) payload.action = 'health';
    }
    if (!payload.action) return send(res, 400, JSON.stringify({ ok:false, error:'Missing action. Supported actions: save, upload, health.' }));
    const upstream = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store'
    });
    const text = await upstream.text();
    return send(res, upstream.ok ? 200 : 502, text);
  } catch (err) {
    return send(res, 502, JSON.stringify({ ok:false, error:'Google Apps Script proxy failed: ' + (err.message || String(err)) }));
  }
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/gwc' || url.pathname === '/api/gwc/') return handleApi(req, res, url);
  if (url.pathname === '/health' || url.pathname === '/api/health') return send(res, 200, JSON.stringify({ ok:true, service:'GWC web + Google Apps Script proxy' }));
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(ROOT, '.' + pathname);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    const ext = path.extname(file).toLowerCase();
    const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600', 'X-Content-Type-Options':'nosniff' });
    if (req.method === 'HEAD') return res.end();
    res.end(data);
  });
});
server.listen(PORT, '0.0.0.0', () => console.log(`GWC server listening on ${PORT}`));
