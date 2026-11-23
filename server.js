'use strict';
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');
const PUBLIC_DIR = path.join(__dirname, 'public');

app.disable('x-powered-by');
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
    proxyAuthenticationConfigured: Boolean(GWC_PROXY_SECRET && GWC_API_URL)
  });
});

function requireProxyConfig() {
  if (!GWC_API_URL) throw new Error('GWC_API_URL is missing in Railway Variables.');
  if (GWC_PROXY_SECRET.length < 32) throw new Error('GWC_PROXY_SECRET is missing or shorter than 32 characters.');
}
function signedEnvelope(method, rawBody) {
  requireProxyConfig();
  const timestamp = String(Date.now());
  const nonce = crypto.randomBytes(18).toString('base64url');
  const message = timestamp + '\n' + nonce + '\n' + method + '\n' + rawBody;
  const signature = crypto.createHmac('sha256', GWC_PROXY_SECRET).update(message, 'utf8').digest('base64url');
  return { timestamp, nonce, signature, body: rawBody };
}
async function callAppsScript(method, bodyObject) {
  const rawBody = JSON.stringify(bodyObject || {});
  const signed = signedEnvelope(method, rawBody);
  let url = GWC_API_URL;
  const options = { method, redirect: 'follow', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } };
  if (method === 'GET') {
    const u = new URL(GWC_API_URL);
    u.searchParams.set('_gwcBody', signed.body);
    u.searchParams.set('_gwcTimestamp', signed.timestamp);
    u.searchParams.set('_gwcNonce', signed.nonce);
    u.searchParams.set('_gwcSignature', signed.signature);
    url = u.toString();
  } else {
    options.headers['Content-Type'] = 'text/plain;charset=utf-8';
    options.body = JSON.stringify({ _gwcProxy: signed });
  }
  const upstream = await fetch(url, options);
  const body = await upstream.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) { throw new Error('Apps Script returned non-JSON (HTTP ' + upstream.status + '). Check Web App deployment.'); }
  return { status: upstream.status, data };
}

let blockedDomainsCache = [];
let blockedDomainsFetchedAt = 0;
let blockedDomainsFetchPromise = null;
async function getBlockedDomains() {
  const now = Date.now();
  if (now - blockedDomainsFetchedAt < 15000) return blockedDomainsCache;
  if (blockedDomainsFetchPromise) return blockedDomainsFetchPromise;
  blockedDomainsFetchPromise = (async () => {
    try {
      const result = await callAppsScript('GET', { action: 'domainblocklist' });
      if (result.data && result.data.ok && Array.isArray(result.data.domains)) {
        blockedDomainsCache = result.data.domains.map(x => String(x).toLowerCase()).filter(Boolean);
        blockedDomainsFetchedAt = Date.now();
      }
    } catch (e) {
      // Keep the last known list if Apps Script is temporarily unavailable.
      if (!blockedDomainsFetchedAt) console.error('Domain blocklist refresh failed:', e.message);
    } finally {
      blockedDomainsFetchPromise = null;
    }
    return blockedDomainsCache;
  })();
  return blockedDomainsFetchPromise;
}
function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/\.$/, ''); }
  catch (_) { return ''; }
}
function domainIsBlocked(host, list) {
  if (!host) return false;
  return list.some(domain => host === domain || host.endsWith('.' + domain));
}
app.use(async (req, res, next) => {
  if (req.path === '/healthz') return next();
  // Until the shared HMAC secret is configured, do not claim domain blocking is active.
  if (!GWC_API_URL || GWC_PROXY_SECRET.length < 32) return next();
  const list = await getBlockedDomains();
  const requestHost = String(req.hostname || '').toLowerCase();
  const originHost = hostFrom(req.get('Origin') || '');
  const refererHost = hostFrom(req.get('Referer') || '');
  if ([requestHost, originHost, refererHost].some(h => domainIsBlocked(h, list))) {
    return res.status(403).type('text').send('This website domain has been blocked by the GWC Administrator.');
  }
  next();
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

app.use('/api/gwc', express.text({ type: 'text/plain', limit: '16mb' }));

app.get('/api/gwc', async (req, res) => {
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const key = String(req.query.key || '');
    const payload = { action };
    if (key) payload.key = key;
    const result = await callAppsScript('GET', payload);
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
      'workspacefolders', 'workspacevalidate', 'workspacecreate', 'setdomainblocklist'
    ];
    if (!allowed.includes(payload.action)) {
      return res.status(400).json({ ok: false, error: 'Unsupported POST action: ' + payload.action });
    }
    const result = await callAppsScript('POST', payload);
    if (payload.action === 'save' || payload.action === 'setdomainblocklist') {
      // Refresh the domain blocklist after a successful state save so Admin changes apply quickly.
      blockedDomainsFetchedAt = 0;
    }
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'Google POST proxy failed: ' + error.message });
  }
});

// Serve only public website files; never expose Apps Script source, README, env or project files.
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
app.listen(PORT, '0.0.0.0', () => console.log('GWC Railway secure proxy listening on ' + PORT));
