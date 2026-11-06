const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const CANONICAL_HOST = 'growth-world-classes-2-0.onrender.com';
const CANONICAL_ORIGIN = 'https://' + CANONICAL_HOST;
const PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');

app.disable('x-powered-by');
app.use(express.text({type: '*/*', limit: '16mb'}));

// Enforce the one approved public website. Host is checked on every request;
// Origin is additionally checked whenever the browser supplies it.
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  const origin = String(req.get('origin') || '').replace(/\/+$/, '').toLowerCase();
  if (host !== CANONICAL_HOST || (origin && origin !== CANONICAL_ORIGIN)) {
    return res.status(403).json({ok:false,error:'This GWC website address is not authorized.'});
  }
  next();
});

// Do not expose server-side source, Apps Script, deployment notes, secrets or archives.
app.use((req, res, next) => {
  const denied = /^\/(?:server\.js|Code\.gs|package\.json|README[^/]*|\.env(?:\..*)?|.*\.zip)(?:$|\/)/i;
  if (denied.test(req.path)) return res.status(404).end();
  next();
});
app.use(express.static(path.join(__dirname), {index:'index.html', dotfiles:'deny'}));

function requireProxySecret(res) {
  if (!PROXY_SECRET || PROXY_SECRET.length < 32) {
    res.status(503).json({ok:false,error:'GWC_PROXY_SECRET is missing or too short in Render Environment.'});
    return false;
  }
  return true;
}

app.get('/api/gwc', async (req,res) => {
  try {
    if (!requireProxySecret(res)) return;
    const action = String(req.query.action || 'load').toLowerCase();
    const extra = req.query.key ? `&key=${encodeURIComponent(String(req.query.key))}` : '';
    const upstream = await fetch(`${GWC_API_URL}?action=${encodeURIComponent(action)}${extra}&proxy=${encodeURIComponent(PROXY_SECRET)}&t=${Date.now()}`, {redirect:'follow', headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    if (!requireProxySecret(res)) return;
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action. Expected save or upload.'});
    if (!['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote'].includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    payload._gwcProxy = PROXY_SECRET;
    const upstream = await fetch(GWC_API_URL, {method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload)});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Redeploy Code.gs as Web App.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy'}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}`));
