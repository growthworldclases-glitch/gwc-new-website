'use strict';
const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const PUBLIC_DIR = path.join(__dirname, 'public');

// Small response headers; avoid exposing the Express version.
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Railway health check. Does not call Google, so it remains lightweight.
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, service: 'GWC website proxy' });
});

// Resumable Google Drive upload chunks are proxied as binary (8 MiB chunks).
app.post('/api/gwc/drive-upload-chunk',
  express.raw({ type: 'application/octet-stream', limit: '9mb' }),
  async (req, res) => {
    try {
      const session = String(req.get('X-GWC-Upload-Session') || '');
      const range = String(req.get('Content-Range') || '');
      if (!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(session)) {
        return res.status(400).json({ ok: false, error: 'Invalid or missing Drive upload session.' });
      }
      if (!/^bytes \d+-\d+\/\d+$/.test(range)) {
        return res.status(400).json({ ok: false, error: 'Invalid Content-Range.' });
      }
      if (!Buffer.isBuffer(req.body) || !req.body.length) {
        return res.status(400).json({ ok: false, error: 'Empty upload chunk.' });
      }
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
      if (upstream.status < 200 || upstream.status >= 300) {
        return res.status(502).json({ ok: false, error: (data.error && data.error.message) || ('Drive upload failed (HTTP ' + upstream.status + ').') });
      }
      return res.status(200).json({
        ok: true, done: true, fileId: data.id || '', name: data.name || '',
        mimeType: data.mimeType || '', webViewLink: data.webViewLink || ''
      });
    } catch (error) {
      return res.status(502).json({ ok: false, error: 'Drive chunk upload failed: ' + error.message });
    }
  }
);

// The app sends JSON as text/plain. Do not parse/buffer unrelated request types.
app.use('/api/gwc', express.text({ type: 'text/plain', limit: '16mb' }));

async function upstreamJson(url, options) {
  const upstream = await fetch(url, options);
  const body = await upstream.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) {
    throw new Error('Apps Script returned non-JSON (HTTP ' + upstream.status + '). Check Web App deployment and permissions.');
  }
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
    const result = await upstreamJson(url.toString(), {
      redirect: 'follow',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
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
    if (['save', 'set', 'savestate', 'writestate'].includes(payload.action) && !payload.state && payload.data) {
      payload.state = payload.data;
    }
    if (!payload.action) return res.status(400).json({ ok: false, error: 'Missing POST action.' });
    const allowed = [
      'save', 'set', 'savestate', 'writestate', 'upload', 'uploadfile', 'archivefile',
      'archivefeeslip', 'restorefeeslip', 'deletefile', 'health', 'ping',
      'submitprivatenote', 'editprivatenote', 'deleteprivatenote', 'startdriveupload',
      'permanentdeletefile', 'presence_ping', 'presence_list', 'getdeletedfolder',
      'workspacefolders', 'workspacevalidate', 'workspacecreate'
    ];
    if (!allowed.includes(payload.action)) {
      return res.status(400).json({ ok: false, error: 'Unsupported POST action: ' + payload.action });
    }
    if (!GWC_API_URL) return res.status(503).json({ ok: false, error: 'GWC_API_URL is missing in server environment.' });
    const result = await upstreamJson(GWC_API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'Google POST proxy failed: ' + error.message });
  }
});

// Serve ONLY public website files. Never expose Code.gs, README, .env, or project files.
app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (path.basename(filePath).toLowerCase() === 'index.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'API route not found.' });
  return res.status(404).send('Not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('GWC website proxy listening on ' + PORT);
});
