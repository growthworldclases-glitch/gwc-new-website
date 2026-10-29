const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
app.use(express.text({type: '*/*', limit: '12mb'}));
app.use(express.static(path.join(__dirname)));
app.get('/api/gwc', async (req,res) => {
  res.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    const upstream = await fetch(`${GWC_API_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`, {redirect:'follow', headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  res.set('Cache-Control','no-store');
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    // Normalize legacy action names so Apps Script never receives an empty action.
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action. Expected save or upload.'});
    if (!['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping'].includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    const upstream = await fetch(GWC_API_URL, {method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload)});
    const body = await upstream.text();
    let data; try { data = JSON.parse(body); } catch { return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Redeploy Code.gs as Web App.`}); }
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy'}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}`));
