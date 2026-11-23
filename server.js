const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '').trim();
function requestDomain(req){
  const raw=String(req.get('Origin')||req.get('Referer')||'').trim();
  if(!raw) throw new Error('Missing Origin/Referer. Open the GWC website directly.');
  let u; try{u=new URL(raw);}catch(_){throw new Error('Invalid Origin/Referer.');}
  if(!['http:','https:'].includes(u.protocol)) throw new Error('Invalid website origin.');
  return u.hostname.toLowerCase().replace(/^www\./,'');
}
function requireProxyConfig(){if(GWC_PROXY_SECRET.length<32)throw new Error('GWC_PROXY_SECRET is missing or too short in Render environment.');}
let gwcResponseBytes=0, gwcResponseCount=0;
app.use((req,res,next)=>{res.on('finish',()=>{const n=Number(res.getHeader('content-length')||0);gwcResponseBytes+=n;gwcResponseCount++;});next();});
async function verifyRenderAdmin(req, username, password){
  requireProxyConfig(); if(!GWC_API_URL)throw new Error('GWC_API_URL is missing.');
  const domain=requestDomain(req),u=new URL(GWC_API_URL);u.searchParams.set('action','load');u.searchParams.set('gwcProxySecret',GWC_PROXY_SECRET);u.searchParams.set('clientDomain',domain);
  const r=await upstreamJson(u.toString(),{headers:{Accept:'application/json','Cache-Control':'no-cache'}});
  const a=r.data&&r.data.state&&r.data.state.admin||{};
  if(String(username||'')!==String(a.username||'')||String(password||'')!==String(a.password||''))throw new Error('Current Admin verification failed.');
}
const GWC_MANAGED_TEMP_DIR=path.join(os.tmpdir(),'gwc-managed-cache');
async function managedTempStats(clean){
  let files=0,bytes=0,cleanedFiles=0,cleanedBytes=0;
  try{await fs.promises.access(GWC_MANAGED_TEMP_DIR);}catch(_){return {managedFiles:0,managedBytes:0,cleanedFiles:0,cleanedBytes:0};}
  const entries=await fs.promises.readdir(GWC_MANAGED_TEMP_DIR,{withFileTypes:true});
  for(const entry of entries){const full=path.join(GWC_MANAGED_TEMP_DIR,entry.name);if(!full.startsWith(GWC_MANAGED_TEMP_DIR+path.sep))continue;try{const st=await fs.promises.lstat(full);if(st.isSymbolicLink())continue;const size=st.isDirectory()?0:st.size;files++;bytes+=size;if(clean){await fs.promises.rm(full,{recursive:true,force:true});cleanedFiles++;cleanedBytes+=size;}}catch(_){}}
  return {managedFiles:clean?0:files,managedBytes:clean?0:bytes,cleanedFiles,cleanedBytes};
}
app.post('/api/gwc/render-cleanup',express.json({limit:'16kb'}),async(req,res)=>{try{await verifyRenderAdmin(req,req.body&&req.body.adminUsername,req.body&&req.body.adminPassword);const clean=!!(req.body&&req.body.clean);const d=await managedTempStats(clean);return res.json({ok:true,...d,responseBytes:gwcResponseBytes,responseCount:gwcResponseCount,note:'Response bytes are an estimate from this Render process since its latest restart, not Render official monthly bandwidth. Only /tmp/gwc-managed-cache is eligible for cleanup; app source, public assets, database, uploads and user data are never deleted. Bandwidth already used cannot be restored.'});}catch(e){return res.status(403).json({ok:false,error:e.message});}});


// Render Build Cache cleanup is a real Render API operation. It clears build
// artifacts and immediately starts a new deployment; it does NOT erase past
// outbound bandwidth usage or Render edge-cache history.
let lastRenderCacheDeployAt = 0;
app.post('/api/gwc/render-build-cache-clear', express.json({limit:'16kb'}), async(req,res)=>{
  try {
    await verifyRenderAdmin(req, req.body && req.body.adminUsername, req.body && req.body.adminPassword);
    const apiKey=String(process.env.RENDER_API_KEY||'').trim();
    const serviceId=String(process.env.RENDER_SERVICE_ID||'').trim();
    if(!apiKey || !serviceId) return res.status(503).json({ok:false,error:'RENDER_API_KEY and RENDER_SERVICE_ID must be configured in Render Environment.'});
    if(!/^srv-[A-Za-z0-9]+$/.test(serviceId)) return res.status(400).json({ok:false,error:'RENDER_SERVICE_ID format is invalid.'});
    if(Date.now()-lastRenderCacheDeployAt<5*60*1000) return res.status(429).json({ok:false,error:'A cache-clear deployment was requested recently. Wait 5 minutes and check Render Deploys before retrying.'});
    lastRenderCacheDeployAt=Date.now();
    const upstream=await fetch('https://api.render.com/v1/services/'+encodeURIComponent(serviceId)+'/deploys',{
      method:'POST',
      headers:{Authorization:'Bearer '+apiKey,Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({clearCache:'clear'})
    });
    const body=await upstream.text();
    let data={}; try{data=body?JSON.parse(body):{};}catch(_){}
    if(!upstream.ok){lastRenderCacheDeployAt=0;return res.status(upstream.status>=500?502:upstream.status).json({ok:false,error:data.message||data.error||('Render API request failed (HTTP '+upstream.status+').')});}
    return res.json({ok:true,deployId:data.id||data.deploy?.id||'',status:data.status||data.deploy?.status||'created',message:'Render accepted a Clear Build Cache & Deploy request. Check Render Deploys for completion. This does not delete previously consumed bandwidth.'});
  } catch(e){return res.status(403).json({ok:false,error:e.message});}
});

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
app.use(express.static(path.join(__dirname), {
  etag: true,
  lastModified: true,
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    const name = path.basename(filePath).toLowerCase();
    if (name === 'index.html' || name === 'service-worker.js' || name === 'manifest.json') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    }
  }
}));

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
    requireProxyConfig();
    const clientDomain=requestDomain(req);
    const action = String(req.query.action || 'load').toLowerCase();
    const key = String(req.query.key || '');
    if (!GWC_API_URL) return res.status(503).json({ok:false,error:'GWC_API_URL is missing in server environment.'});
    const url = new URL(GWC_API_URL);
    url.searchParams.set('action',action);
    if (key) url.searchParams.set('key',key);
    url.searchParams.set('gwcProxySecret',GWC_PROXY_SECRET);
    url.searchParams.set('clientDomain',clientDomain);
    const result = await upstreamJson(url.toString(), {redirect:'follow',headers:{Accept:'application/json','Cache-Control':'no-cache'}});
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`}); }
});
app.post('/api/gwc', async (req,res) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : '';
    let payload; try { payload = JSON.parse(raw); } catch { return res.status(400).json({ok:false,error:'Invalid JSON request body'}); }
    requireProxyConfig();
    payload.clientDomain=requestDomain(req);
    payload.gwcProxySecret=GWC_PROXY_SECRET;
    payload.action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].includes(payload.action) && !payload.state && payload.data) payload.state = payload.data;
    if (!payload.action) return res.status(400).json({ok:false,error:'Missing POST action.'});
    const allowed = ['save','set','savestate','writestate','upload','uploadfile','archivefile','archivefeeslip','restorefeeslip','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','startdriveupload','permanentdeletefile','presence_ping','presence_list','getdeletedfolder','workspacefolders','workspacevalidate','workspacecreate','drivecleanupscan','drivecleanuparchive','drivecleanupquarantine','drivecleanupdelete','drivecleanuprestore'];
    if (!allowed.includes(payload.action)) return res.status(400).json({ok:false,error:`Unsupported POST action: ${payload.action}`});
    if (!GWC_API_URL) return res.status(503).json({ok:false,error:'GWC_API_URL is missing in server environment.'});
    const result = await upstreamJson(GWC_API_URL, {method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8',Accept:'application/json'},body:JSON.stringify(payload)});
    return res.status(result.status >= 200 && result.status < 300 ? 200 : result.status).json(result.data);
  } catch(e) { return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`}); }
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy',security:'V51 server-secret + Admin website blocklist'}));
app.listen(PORT,()=>console.log(`GWC website proxy listening on ${PORT}`));
