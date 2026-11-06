const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const ALLOWED_HOST = 'growth-world-classes-2-0.onrender.com';
const ALLOWED_ORIGIN = 'https://' + ALLOWED_HOST;
const PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');

app.use(express.text({type: '*/*', limit: '16mb'}));

// Reject requests addressed through any other hostname, including the old custom domain.
// This also prevents the Render service from serving a copied/aliased site on that hostname.
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (host !== ALLOWED_HOST) return res.status(403).send('GWC domain is not authorized.');
  next();
});

// The secret is deliberately supplied through Render Environment, never stored in this ZIP.
app.use('/api/gwc', (req, res, next) => {
  if (PROXY_SECRET.length < 32) return res.status(503).json({ok:false,error:'GWC_PROXY_SECRET is missing or too short in Render Environment.'});
  const origin = req.get('origin');
  const referer = req.get('referer');
  if (origin && origin !== ALLOWED_ORIGIN) return res.status(403).json({ok:false,error:'Google sync blocked: unauthorized website origin.'});
  if (!origin && referer) {
    try {
      if (new URL(referer).origin !== ALLOWED_ORIGIN) return res.status(403).json({ok:false,error:'Google sync blocked: unauthorized website referrer.'});
    } catch (_) { return res.status(403).json({ok:false,error:'Google sync blocked: invalid referrer.'}); }
  }
  // Browser requests from the approved website are same-origin. Reject cross-site fetches.
  if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ok:false,error:'Google sync blocked: cross-site request.'});
  next();
});

app.use((req, res, next) => {
  const base = path.basename(decodeURIComponent(req.path)).toLowerCase();
  if (['code.gs','server.js','package.json'].includes(base) || base.endsWith('.zip')) {
    return res.status(404).send('Not found');
  }
  next();
});
app.use(express.static(path.join(__dirname), {dotfiles:'deny', index:'index.html'}));

app.get('/api/gwc', async (req,res) => {
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const extra = req.query.key ? `&key=${encodeURIComponent(String(req.query.key))}` : '';
    const upstream = await fetch(`${GWC_API_URL}?action=${encodeURIComponent(action)}${extra}&gwc_proxy_secret=${encodeURIComponent(PROXY_SECRET)}&t=${Date.now()}`, {redirect:'follow', headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action. Expected save or upload.'});
    if (!['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote'].includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    payload.gwc_proxy_secret = PROXY_SECRET;
    const upstream = await fetch(GWC_API_URL, {method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload)});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Redeploy Code.gs as Web App.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy'}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}`));
