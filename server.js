'use strict';
const express = require('express');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const PUBLIC_DIR = path.join(__dirname, 'public');
const PUBLIC_INDEX = path.join(PUBLIC_DIR, 'index.html');
const ROOT_INDEX = path.join(__dirname, 'index.html');
const HAS_PUBLIC_INDEX = fs.existsSync(PUBLIC_INDEX);
const HAS_ROOT_INDEX = fs.existsSync(ROOT_INDEX);
const INDEX_FILE = HAS_PUBLIC_INDEX ? PUBLIC_INDEX : (HAS_ROOT_INDEX ? ROOT_INDEX : null);
const STATIC_DIR = fs.existsSync(PUBLIC_DIR) ? PUBLIC_DIR : __dirname;

app.disable('x-powered-by');
// Compress text responses (HTML, JavaScript, CSS and JSON) to reduce Railway egress.
// Binary Drive upload chunks are not compressed by this middleware.
app.use(compression({ threshold: 1024 }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'GWC website proxy',
    websiteEntry: INDEX_FILE ? (HAS_PUBLIC_INDEX ? 'public/index.html' : 'index.html') : 'missing'
  });
});

app.post('/api/gwc/drive-upload-chunk',
  express.raw({ type: 'application/octet-stream', limit: '9mb' }),
  async (req, res) => {
    try {
      const session = String(req.get('X-GWC-Upload-Session') || '');
      const range = String(req.get('Content-Range') || '');
      if (!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(session))
        return res.status(400).json({ ok: false, error: 'Invalid or missing Drive upload session.' });
      if (!/^bytes \d+-\d+\/\d+$/.test(range))
        return res.status(400).json({ ok: false, error: 'Invalid Content-Range.' });
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        return res.status(400).json({ ok: false, error: 'Empty upload chunk.' });
      const upstream = await fetch(session, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream', 'Content-Range': range },
        body: req.body,
        redirect: 'manual'
      });
      const body = await upstream.text();
      if (upstream.status === 308) return res.status(200).json({ ok: true, done: false });
      let data = {};
      try { data = body ? JSON.parse(body) : {}; }
      catch (_) { return res.status(502).json({ ok: false, error: 'Drive returned a non-JSON upload completion response.' }); }
      if (upstream.status < 200 || upstream.status >= 300)
        return res.status(502).json({ ok: false, error: (data.error && data.error.message) || ('Drive upload failed (HTTP ' + upstream.status + ').') });
      return res.status(200).json({ ok: true, done: true, fileId: data.id || '', name: data.name || '', mimeType: data.mimeType || '', webViewLink: data.webViewLink || '' });
    } catch (error) {
      return res.status(502).json({ ok: false, error: 'Drive chunk upload failed: ' + error.message });
    }
  }
);

app.use('/api/gwc', (req, res, next) => {
  // Authenticated/shared application data must never be cached by browsers or a CDN.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.setHeader('Vary', 'Accept-Encoding');
  next();
}, express.text({ type: 'text/plain', limit: '16mb' }));

async function upstreamJson(url, options) {
  const upstream = await fetch(url, options);
  const body = await upstream.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) { throw new Error('Apps Script returned non-JSON (HTTP ' + upstream.status + '). Check Web App deployment and permissions.'); }
  return { status: upstream.status, data };
}

app.get('/api/gwc', async (req, res) => {
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const key = String(req.query.key || '');
    if (!GWC_API_URL) return res.status(503).json({ ok: false, error: 'GWC_API_URL is missing in server environment.' });
    const url = new URL(GWC_API_URL);
    url.searchParams.set('action', action);
    if (key) url.searchParams.set('key', key);
    const result = await upstreamJson(url.toString(), { redirect: 'follow', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'Google GET proxy failed: ' + error.message });
  }
});

app.post('/api/gwc', async (req, res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : '';
    let payload;
    try { payload = JSON.parse(raw); }
    catch (_) { return res.status(400).json({ ok: false, error: 'Invalid JSON request body' }); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save', 'set', 'savestate', 'writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ ok: false, error: 'Missing POST action.' });
    const allowed = [
      'save', 'set', 'savestate', 'writestate', 'upload', 'uploadfile', 'archivefile',
      'archivefeeslip', 'restorefeeslip', 'deletefile', 'health', 'ping', 'submitprivatenote',
      'editprivatenote', 'deleteprivatenote', 'startdriveupload', 'permanentdeletefile',
      'presence_ping', 'presence_list', 'getdeletedfolder', 'workspacefolders',
      'workspacevalidate', 'workspacecreate'
    ];
    if (!allowed.includes(payload.action)) return res.status(400).json({ ok: false, error: 'Unsupported POST action: ' + payload.action });
    if (!GWC_API_URL) return res.status(503).json({ ok: false, error: 'GWC_API_URL is missing in server environment.' });
    const result = await upstreamJson(GWC_API_URL, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'Google POST proxy failed: ' + error.message });
  }
});

// Serve public assets only; if the host/repository omitted public/index.html,
// use the retained root index.html as a safe entry-point fallback.
app.use(express.static(STATIC_DIR, {
  index: false,
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (path.basename(filePath).toLowerCase() === 'index.html')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

app.get('/', (req, res) => {
  if (!INDEX_FILE) return res.status(500).send('GWC website entry file missing. Expected public/index.html or index.html.');
  return res.sendFile(INDEX_FILE);
});

// Client-side page routes fall back to the same app entry, but API paths never do.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'API route not found.' });
  if (!req.accepts('html') || !INDEX_FILE) return res.status(404).send('Not found');
  return res.sendFile(INDEX_FILE);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('GWC website proxy listening on ' + PORT);
  console.log('GWC website entry: ' + (INDEX_FILE || 'MISSING'));
  console.log('GWC static directory: ' + STATIC_DIR);
});
