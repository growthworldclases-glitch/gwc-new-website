const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const OFFICIAL_ORIGIN = 'https://growth-world-classes-2-0.onrender.com';

app.disable('x-powered-by');
app.use(express.text({ type: '*/*', limit: '16mb' }));

// Browser Origin is preferred. Referer is a fallback for same-origin GET requests.
// This is a browser-origin gate, not cryptographic authentication; non-browser clients can spoof headers.
function requestOrigin(req) {
  // Browsers commonly omit the Origin header on same-origin GET requests. Some
  // deployments also suppress Referer via Referrer-Policy. In that case use
  // Render's forwarded host/protocol (or Host) to identify the website serving
  // this request. This makes the configured official Render domain work by
  // default without weakening requests that explicitly carry another Origin.
  const raw = req.get('origin') || req.get('referer') || '';
  if (raw) {
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' && u.hostname !== 'localhost') return '';
      return u.origin.toLowerCase();
    } catch (_) { return ''; }
  }

  const forwardedHost = String(req.get('x-forwarded-host') || '').split(',')[0].trim();
  const host = forwardedHost || String(req.get('host') || '').trim();
  const forwardedProto = String(req.get('x-forwarded-proto') || '').split(',')[0].trim().toLowerCase();
  const protocol = forwardedProto || (host.startsWith('localhost') ? 'http' : 'https');
  if (!host || (protocol !== 'https' && !host.startsWith('localhost'))) return '';
  try { return new URL(protocol + '://' + host).origin.toLowerCase(); }
  catch (_) { return ''; }
}

async function isAllowedOrigin(req) {
  const origin = requestOrigin(req);
  if (!origin) return false;
  try {
    const u = new URL(GWC_API_URL);
    u.searchParams.set('action', 'origincheck');
    u.searchParams.set('origin', origin);
    u.searchParams.set('t', String(Date.now()));
    const r = await fetch(u.toString(), {
      redirect: 'follow',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    const j = JSON.parse(await r.text());
    return !!(r.ok && j.ok && j.allowed);
  } catch (e) {
    console.error('GWC origin authorization failed:', e.message);
    return false;
  }
}

async function requireOrigin(req, res, next) {
  if (!(await isAllowedOrigin(req))) {
    return res.status(403).json({ ok: false, error: 'Domain/Origin blocked. This website is not in the GWC Admin authorized-domain list.' });
  }
  next();
}

// Do not expose backend source/configuration files through Express static hosting.
app.use((req, res, next) => {
  const p = decodeURIComponent((req.path || '').toLowerCase());
  const blocked = new Set(['/server.js', '/code.gs', '/package.json', '/package-lock.json']);
  if (blocked.has(p) || p.startsWith('/.git/') || p.startsWith('/.env')) {
    return res.status(404).type('text/plain').send('Not found');
  }
  next();
});
app.use(express.static(path.join(__dirname), { dotfiles: 'deny', index: 'index.html' }));

app.get('/api/gwc', requireOrigin, async (req, res) => {
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const allowedGet = ['load','get','getstate','loadstate','read','loadmeta','meta','metadata','getmeta','loadmetadata','health','ping','diagnose','listprivatenotes'];
    if (!allowedGet.includes(action)) return res.status(400).json({ ok: false, error: `Unsupported GET action: ${action}` });
    const extra = req.query.key ? `&key=${encodeURIComponent(String(req.query.key))}` : '';
    const upstream = await fetch(`${GWC_API_URL}?action=${encodeURIComponent(action)}${extra}&t=${Date.now()}`, {
      redirect: 'follow', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }
    });
    const body = await upstream.text();
    let data;
    try { data = JSON.parse(body); }
    catch (_) { return res.status(502).json({ ok: false, error: `Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.` }); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ ok: false, error: `Google GET proxy failed: ${e.message}` });
  }
});

app.post('/api/gwc', requireOrigin, async (req, res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload;
    try { payload = JSON.parse(raw); }
    catch (_) { return res.status(400).json({ ok: false, error: 'Invalid JSON request body' }); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    const allowedPost = ['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote'];
    if (!allowedPost.includes(payload.action)) return res.status(400).json({ ok: false, error: `Unsupported POST action: ${payload.action || '(empty)'}` });
    const upstream = await fetch(GWC_API_URL, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await upstream.text();
    let data;
    try { data = JSON.parse(body); }
    catch (_) { return res.status(502).json({ ok: false, error: `Apps Script returned non-JSON (HTTP ${upstream.status}). Redeploy Code.gs as Web App.` }); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ ok: false, error: `Google POST proxy failed: ${e.message}` });
  }
});

app.get('/api/domains', requireOrigin, async (req, res) => {
  try {
    const u = new URL(GWC_API_URL);
    u.searchParams.set('action', 'domains');
    u.searchParams.set('t', String(Date.now()));
    const r = await fetch(u.toString(), { redirect: 'follow', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
    const j = JSON.parse(await r.text());
    return res.status(r.ok ? 200 : r.status).json(j);
  } catch (e) { return res.status(502).json({ ok: false, error: `Domain list failed: ${e.message}` }); }
});

app.post('/api/domains', requireOrigin, async (req, res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let p;
    try { p = JSON.parse(raw); } catch (_) { return res.status(400).json({ ok: false, error: 'Invalid JSON request body' }); }
    if (!['domainadd','domainremove'].includes(p.action)) return res.status(400).json({ ok: false, error: 'Invalid domain action' });
    // Apps Script checks Main Admin credentials against the existing saved state.
    // Pass the actual active browser origin so an Admin cannot remove the domain currently in use.
    p.activeOrigin = requestOrigin(req);
    const r = await fetch(GWC_API_URL, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify(p)
    });
    const j = JSON.parse(await r.text());
    return res.status(r.ok && j.ok !== false ? 200 : (r.ok ? 403 : r.status)).json(j);
  } catch (e) { return res.status(502).json({ ok: false, error: `Domain update failed: ${e.message}` }); }
});

app.get('/healthz', (req, res) => res.json({ ok: true, service: 'GWC website proxy', domainLock: true, defaultOrigin: OFFICIAL_ORIGIN }));
app.listen(PORT, () => console.log(`GWC website listening on ${PORT}`));
