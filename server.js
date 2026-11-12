const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');
const GWC_APP_VERSION = String(process.env.GWC_APP_VERSION || '');
const ALLOWED_VERSION = '24.0-secure';

// Resumable Drive upload chunks are proxied as binary; each chunk is 8 MiB.
app.post('/api/gwc/drive-upload-chunk', express.raw({type:'application/octet-stream',limit:'9mb'}), async (req,res)=>{
  try {
    const session=String(req.get('X-GWC-Upload-Session')||'');
    const range=String(req.get('Content-Range')||'');
    if(!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(session)) return res.status(400).json({ok:false,error:'Invalid or missing Drive upload session.'});
    if(!/^bytes \d+-\d+\/\d+$/.test(range)) return res.status(400).json({ok:false,error:'Invalid Content-Range.'});
    if(!Buffer.isBuffer(req.body)||!req.body.length) return res.status(400).json({ok:false,error:'Empty upload chunk.'});
    const up=await fetch(session,{method:'PUT',headers:{'Content-Type':'application/octet-stream','Content-Range':range},body:req.body,redirect:'manual'});
    const body=await up.text();
    if(up.status===308) return res.status(200).json({ok:true,done:false});
    let data={}; try{data=body?JSON.parse(body):{};}catch(_){return res.status(502).json({ok:false,error:'Drive returned a non-JSON upload completion response.'});}
    if(up.status<200||up.status>=300) return res.status(502).json({ok:false,error:data.error?.message||('Drive upload failed (HTTP '+up.status+').')});
    return res.status(200).json({ok:true,done:true,fileId:data.id||'',name:data.name||'',mimeType:data.mimeType||'',webViewLink:data.webViewLink||''});
  } catch(e){return res.status(502).json({ok:false,error:'Drive chunk upload failed: '+e.message});}
});
app.use(express.text({type:'*/*', limit:'16mb'}));
app.use(express.static(path.join(__dirname)));

function configError() {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(GWC_API_URL)) return 'GWC_API_URL is missing or invalid in Render Environment.';
  if (GWC_APP_VERSION !== ALLOWED_VERSION) return `GWC_APP_VERSION must be ${ALLOWED_VERSION}.`;
  if (GWC_PROXY_SECRET.length < 32) return 'GWC_PROXY_SECRET is missing or too short in Render Environment.';
  return '';
}
function hmac(secret, message) {
  return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}
function nonce() { return crypto.randomBytes(18).toString('hex'); }
async function upstreamJson(url, options) {
  const upstream = await fetch(url, options);
  const body = await upstream.text();
  let data;
  try { data = JSON.parse(body); }
  catch { throw new Error(`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment and permissions.`); }
  return {status:upstream.status, data};
}
app.get('/api/gwc', async (req,res) => {
  try {
    const err = configError(); if (err) return res.status(503).json({ok:false,error:err});
    const action = String(req.query.action || 'load').toLowerCase();
    const key = String(req.query.key || '');
    const ts = String(Date.now()), n = nonce(), version = ALLOWED_VERSION;
    const canonical = ['GET',version,action,key,ts,n].join('|');
    const sig = hmac(GWC_PROXY_SECRET, canonical);
    const url = new URL(GWC_API_URL);
    url.searchParams.set('action',action);
    if (key) url.searchParams.set('key',key);
    url.searchParams.set('gwc_version',version);
    url.searchParams.set('gwc_ts',ts);
    url.searchParams.set('gwc_nonce',n);
    url.searchParams.set('gwc_sig',sig);
    const result = await upstreamJson(url.toString(), {redirect:'follow',headers:{Accept:'application/json','Cache-Control':'no-cache'}});
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    const err = configError(); if (err) return res.status(503).json({ok:false,error:err});
    const raw = typeof req.body === 'string' ? req.body : '';
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action.'});
    const allowed = ['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','startdriveupload','permanentdeletefile','presence_ping','presence_list','getdeletedfolder'];
    if (!allowed.includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    const ts = String(Date.now()), n = nonce(), version = ALLOWED_VERSION;
    const canonicalBody = JSON.stringify(payload);
    const bodyHash = crypto.createHash('sha256').update(canonicalBody,'utf8').digest('hex');
    const canonical = ['POST',version,ts,n,payload.action,bodyHash].join('|');
    const signedPayload = {...payload, _gwcAuth:{version,ts,nonce:n,bodyHash,sig:hmac(GWC_PROXY_SECRET,canonical)}};
    const result = await upstreamJson(GWC_API_URL, {method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8',Accept:'application/json'},body:JSON.stringify(signedPayload)});
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>{
  const err=configError();
  res.status(err?503:200).json({ok:!err,service:'GWC V24 secure proxy',version:ALLOWED_VERSION,...(err?{error:err}:{})});
});
app.listen(PORT,()=>console.log(`GWC V24 secure proxy listening on ${PORT}`));
