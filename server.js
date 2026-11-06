const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '').trim();
const PRIMARY_DOMAIN = 'growth-world-classes-2-0.onrender.com';
const domainCache = new Map();
app.use(express.text({type: '*/*', limit: '16mb'}));

function normalizeHost(value) {
  return String(value || '').trim().toLowerCase().split('/')[0].split(':')[0].replace(/\.$/, '');
}
async function callGoogle(payload) {
  if (GWC_PROXY_SECRET.length < 32) throw new Error('GWC_PROXY_SECRET is missing or too short in Render Environment (minimum 32 characters).');
  const response = await fetch(GWC_API_URL, {
    method: 'POST', redirect: 'follow',
    headers: {'Content-Type':'text/plain;charset=utf-8','Accept':'application/json','Cache-Control':'no-cache'},
    body: JSON.stringify({...payload, _gwcAuth:GWC_PROXY_SECRET})
  });
  const body = await response.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) { throw new Error(`Apps Script returned non-JSON (HTTP ${response.status}). Check the Web App deployment.`); }
  if (!response.ok || data.ok === false) throw new Error(data.error || `Google backend HTTP ${response.status}`);
  return data;
}
async function isAllowedHost(host) {
  const domain = normalizeHost(host);
  if (!domain) return false;
  const cached = domainCache.get(domain);
  if (cached && cached.until > Date.now()) return cached.allowed;
  // The official production host is the bootstrap domain; all other hosts are
  // checked against the Script-Properties allowlist controlled by the Main Admin.
  let allowed = domain === PRIMARY_DOMAIN;
  if (!allowed) {
    const result = await callGoogle({action:'domaincheck', domain});
    allowed = result.allowed === true;
  }
  domainCache.set(domain, {allowed, until:Date.now()+15000});
  return allowed;
}

// Enforce host allowlisting before serving HTML, assets, health checks, or API calls.
app.use(async (req, res, next) => {
  try {
    if (GWC_PROXY_SECRET.length < 32) return res.status(503).json({ok:false,error:'GWC_PROXY_SECRET is missing or too short in Render Environment (minimum 32 characters).'});
    const host = normalizeHost(req.get('host') || req.hostname);
    const origin = req.get('origin');
    if (origin) {
      let originHost = '';
      try { originHost = normalizeHost(new URL(origin).host); } catch (_) {}
      if (!originHost || originHost !== host) return res.status(403).json({ok:false,error:'Cross-domain request blocked by GWC security.'});
    }
    if (!(await isAllowedHost(host))) return res.status(403).send('GWC access blocked: this domain is not authorized by the Main Admin.');
    next();
  } catch (e) {
    res.status(503).json({ok:false,error:`GWC security check failed: ${e.message}`});
  }
});

// Never expose backend source, deployment manifests, documentation, or archives as static downloads.
app.use((req,res,next)=>{
  const pathname = String(req.path || '').toLowerCase();
  if (/^\/(server\.js|code\.gs|package\.json|readme[^/]*\.txt|[^/]*\.zip)$/.test(pathname) || pathname.startsWith('/.git/')) {
    return res.status(404).send('Not found');
  }
  next();
});
app.use(express.static(path.join(__dirname), {index:'index.html', dotfiles:'deny'}));
app.get('/api/gwc', async (req,res) => {
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const data = await callGoogle({action, key:String(req.query.key || '')});
    return res.json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    const allowed = ['load','loadmeta','get','getstate','loadstate','read','diagnose','save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','listprivatenotes','listdomains','adddomain','removedomain'];
    if (!allowed.includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    const data = await callGoogle(payload);
    return res.json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC authenticated website proxy'}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}`));
