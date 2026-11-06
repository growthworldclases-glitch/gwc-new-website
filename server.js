'use strict';
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');
const GWC_APP_VERSION = String(process.env.GWC_APP_VERSION || '');

app.disable('x-powered-by');
app.use(express.text({type: '*/*', limit: '16mb'}));
app.use(express.static(path.join(__dirname), { etag: true, maxAge: '5m' }));

function configError() {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(GWC_API_URL)) return 'GWC_API_URL is missing or invalid in Render Environment.';
  if (GWC_PROXY_SECRET.length < 32) return 'GWC_PROXY_SECRET is missing or too short in Render Environment.';
  if (GWC_APP_VERSION !== '24.0-secure') return 'GWC_APP_VERSION must be 24.0-secure.';
  return '';
}
function jsonError(res, status, error) { return res.status(status).json({ok:false,error}); }
function authorizedClient(req, res) {
  if (configError()) { jsonError(res, 503, configError()); return false; }
  if (req.get('x-gwc-client-version') !== GWC_APP_VERSION) {
    jsonError(res, 404, 'SERVER_NOT_FOUND: this application version is not authorized. Please use the official GWC V24 application.');
    return false;
  }
  return true;
}
function signEnvelope(payload) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(24).toString('hex');
  const method = 'POST';
  const canonical = [GWC_APP_VERSION, String(timestamp), nonce, method, JSON.stringify(payload)].join('\n');
  const signature = crypto.createHmac('sha256', GWC_PROXY_SECRET).update(canonical, 'utf8').digest('hex');
  return {version:GWC_APP_VERSION, timestamp, nonce, method, signature, payload};
}
async function sendSigned(payload, res) {
  const envelope = signEnvelope(payload);
  const upstream = await fetch(GWC_API_URL, {
    method:'POST', redirect:'follow',
    headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json','Cache-Control':'no-cache'},
    body:JSON.stringify(envelope)
  });
  const body = await upstream.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) { return jsonError(res, 502, `Apps Script returned non-JSON (HTTP ${upstream.status}). Check the V24 Web App deployment.`); }
  return res.status(upstream.ok ? 200 : upstream.status).json(data);
}
app.get('/api/gwc', async (req,res) => {
  if (!authorizedClient(req,res)) return;
  try {
    const action = String(req.query.action || 'load').toLowerCase();
    if (!['load','get','getstate','loadstate','read','loadmeta','meta','metadata','getmeta','loadmetadata','health','ping','diagnose','listprivatenotes'].includes(action)) {
      return jsonError(res, 400, `Unsupported GET action: ${action}`);
    }
    const payload = {action};
    if (req.query.key) payload.key = String(req.query.key);
    return await sendSigned(payload,res);
  } catch(e) { return jsonError(res, 502, `Google GET proxy failed: ${e.message}`); }
});
app.post('/api/gwc', async (req,res) => {
  if (!authorizedClient(req,res)) return;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    let payload;
    try { payload = JSON.parse(raw); } catch (_) { return jsonError(res,400,'Invalid JSON request body'); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && (!payload.state || typeof payload.state !== 'object') && payload.data && typeof payload.data === 'object') payload.state = payload.data;
    if (!payload.action) return jsonError(res,400,'Missing POST action.');
    const allowed = ['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','listprivatenotes','load','get','getstate','loadstate','read','diagnose'];
    if (!allowed.includes(payload.action)) return jsonError(res,400,`Unsupported POST action: ${payload.action}`);
    return await sendSigned(payload,res);
  } catch(e) { return jsonError(res,502,`Google POST proxy failed: ${e.message}`); }
});
app.get('/healthz',(req,res)=> {
  const error = configError();
  res.status(error ? 503 : 200).json({ok:!error,service:'GWC V24 secure proxy',version:GWC_APP_VERSION,error:error||undefined});
});
app.use((req,res)=>jsonError(res,404,'SERVER_NOT_FOUND'));
app.listen(PORT,()=>console.log(`GWC V24 secure proxy listening on ${PORT}`));
