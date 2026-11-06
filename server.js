const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = process.env.GWC_API_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const OFFICIAL_ORIGIN = 'https://growth-world-classes-2-0.onrender.com';
app.use(express.text({type:'*/*',limit:'16mb'}));
function requestOrigin(req) {
  const raw = req.get('origin') || req.get('referer') || '';
  try { return new URL(raw).origin.toLowerCase(); } catch (_) { return ''; }
}
async function isAllowedOrigin(req) {
  const origin=requestOrigin(req);
  if (!origin) return false;
  try {
    const u=new URL(GWC_API_URL); u.searchParams.set('action','origincheck'); u.searchParams.set('origin',origin); u.searchParams.set('t',String(Date.now()));
    const r=await fetch(u.toString(),{redirect:'follow',headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    const j=JSON.parse(await r.text()); return !!(r.ok && j.ok && j.allowed);
  } catch(e) { console.error('Origin authorization failed:',e.message); return false; }
}
async function requireOrigin(req,res,next) {
  if (!(await isAllowedOrigin(req))) return res.status(403).json({ok:false,error:'Domain/Origin blocked. This website is not in the GWC Admin authorized-domain list.'});
  next();
}
app.use(express.static(path.join(__dirname),{dotfiles:'deny',index:'index.html'}));
app.get('/api/gwc',requireOrigin,async(req,res)=>{
  try {
    const action=String(req.query.action||'load').toLowerCase();
    const extra=req.query.key?`&key=${encodeURIComponent(String(req.query.key))}`:'';
    const upstream=await fetch(`${GWC_API_URL}?action=${encodeURIComponent(action)}${extra}&t=${Date.now()}`,{redirect:'follow',headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    const body=await upstream.text(); let data; try{data=JSON.parse(body)}catch{return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Check Web App deployment.`})}
    return res.status(upstream.ok?200:upstream.status).json(data);
  }catch(e){return res.status(502).json({ok:false,error:`Google GET proxy failed: ${e.message}`})}
});
app.post('/api/gwc',requireOrigin,async(req,res)=>{
  try {
    const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{}); let payload; try{payload=JSON.parse(raw)}catch{return res.status(400).json({ok:false,error:'Invalid JSON request body'})}
    payload.action=String(payload.action||payload.type||payload.op||payload.command||'').toLowerCase();
    if(['save','set','savestate','writestate'].includes(payload.action)&&!payload.state&&payload.data)payload.state=payload.data;
    if(!payload.action)return res.status(400).json({ok:false,error:'Missing POST action.'});
    const upstream=await fetch(GWC_API_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload)});
    const body=await upstream.text(); let data; try{data=JSON.parse(body)}catch{return res.status(502).json({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}). Redeploy Code.gs as Web App.`})}
    return res.status(upstream.ok?200:upstream.status).json(data);
  }catch(e){return res.status(502).json({ok:false,error:`Google POST proxy failed: ${e.message}`})}
});
app.get('/api/domains',requireOrigin,async(req,res)=>{
  try { const u=new URL(GWC_API_URL);u.searchParams.set('action','domains');u.searchParams.set('t',String(Date.now()));const r=await fetch(u.toString(),{redirect:'follow'});const j=JSON.parse(await r.text());return res.status(r.ok?200:r.status).json(j); }
  catch(e){return res.status(502).json({ok:false,error:`Domain list failed: ${e.message}`})}
});
app.post('/api/domains',requireOrigin,async(req,res)=>{
  try { const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});let p=JSON.parse(raw);if(!['domainadd','domainremove'].includes(p.action))return res.status(400).json({ok:false,error:'Invalid domain action'});const r=await fetch(GWC_API_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(p)});const j=JSON.parse(await r.text());return res.status(r.ok?200:r.status).json(j); }
  catch(e){return res.status(502).json({ok:false,error:`Domain update failed: ${e.message}`})}
});
app.get('/healthz',(req,res)=>res.json({ok:true,service:'GWC website proxy',domainLock:true}));
app.listen(PORT,()=>console.log(`GWC website listening on ${PORT}`));
