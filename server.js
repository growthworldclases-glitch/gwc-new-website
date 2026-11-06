const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');
const DEFAULT_ORIGIN = 'https://growth-world-classes-2-0.onrender.com';
app.disable('x-powered-by');
app.use(express.text({type: '*/*', limit: '16mb'}));

function requestOrigin(req) {
  const raw = req.get('origin') || req.get('referer') || '';
  try { return raw ? new URL(raw).origin.toLowerCase() : ''; } catch (_) { return ''; }
}
function validSecret() { return GWC_PROXY_SECRET.length >= 32; }
async function gasRequest(payload) {
  if (!validSecret()) throw new Error('GWC_PROXY_SECRET is missing or too short in Render Environment (minimum 32 characters).');
  const body = {...payload, proxySecret: GWC_PROXY_SECRET};
  const upstream = await fetch(GWC_API_URL, {
    method: 'POST', redirect: 'follow',
    headers: {'Content-Type':'text/plain;charset=utf-8','Accept':'application/json','Cache-Control':'no-cache'},
    body: JSON.stringify(body)
  });
  const raw = await upstream.text();
  let data; try { data = JSON.parse(raw); } catch (_) { throw new Error(`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.`); }
  if (!upstream.ok || data.ok === false) throw new Error(data.error || `Apps Script HTTP ${upstream.status}`);
  return data;
}
async function authorizeOrigin(req) {
  const origin = requestOrigin(req);
  if (!origin) return {ok:false, status:403, error:'Origin could not be verified. Open GWC from its official website.'};
  let cloud;
  try { cloud = await gasRequest({action:'load'}); }
  catch (e) { return {ok:false,status:503,error:e.message}; }
  const configured = cloud && cloud.state && cloud.state.settings && Array.isArray(cloud.state.settings.authorizedDomains)
    ? cloud.state.settings.authorizedDomains : [DEFAULT_ORIGIN];
  const allowed = [...new Set([DEFAULT_ORIGIN, ...configured.map(x => String(x || '').trim().replace(/\/$/, '').toLowerCase())])];
  if (!allowed.includes(origin)) return {ok:false,status:403,error:'Google Sync blocked: this website domain is not authorized by GWC Admin.'};
  return {ok:true, origin};
}

// Never publish backend source, environment/config files, or project notes as static assets.
app.use((req,res,next) => {
  const p = decodeURIComponent((req.path || '').toLowerCase());
  if (/(^|\/)(server\.js|code\.gs|package\.json|readme[^/]*|\.env[^/]*|\.git)(\/|$)/i.test(p)) return res.status(404).send('Not found');
  next();
});
app.use(express.static(path.join(__dirname), {index:'index.html', dotfiles:'deny'}));

app.get('/api/gwc', async (req,res) => {
  try {
    const auth = await authorizeOrigin(req); if (!auth.ok) return res.status(auth.status).json({ok:false,error:auth.error});
    const action = String(req.query.action || 'load').toLowerCase();
    const payload = {action};
    if (req.query.key) payload.key = String(req.query.key);
    const data = await gasRequest(payload);
    return res.json(data);
  } catch(e) { return res.status(502).json({ok:false,error:e.message || 'Google GET proxy failed'}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    const auth = await authorizeOrigin(req); if (!auth.ok) return res.status(auth.status).json({ok:false,error:auth.error});
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload; try { payload = JSON.parse(raw); } catch (_) { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action.'});
    const allowed = ['load','get','getstate','loadstate','read','loadmeta','meta','metadata','getmeta','loadmetadata','save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','listprivatenotes'];
    if (!allowed.includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    const data = await gasRequest(payload);
    return res.json(data);
  } catch(e) { return res.status(502).json({ok:false,error:e.message || 'Google POST proxy failed'}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy',secretConfigured:validSecret()}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}; proxy secret configured: ${validSecret()}`));
