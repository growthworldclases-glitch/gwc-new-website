const express = require('express');
const path = require('path');
const crypto = require('crypto');
const webpush = require('web-push');
const app = express();
const PORT = process.env.PORT || 3000;
const GWC_API_URL = String(process.env.GWC_API_URL || '').trim();
const GWC_PROXY_SECRET = String(process.env.GWC_PROXY_SECRET || '');
const GWC_APP_VERSION = String(process.env.GWC_APP_VERSION || '');
const ALLOWED_VERSION = '24.0-secure';
const VAPID_PUBLIC_KEY = String(process.env.GWC_VAPID_PUBLIC_KEY || 'BLXgtzLjGc6MOEN3OAGZbK4YYDcS1VO8DEWobXwekvz_YMzPobps_jlkY91G7fjMxI9XtH_SxdARGKadkaIwEQM');
const VAPID_PRIVATE_KEY = String(process.env.GWC_VAPID_PRIVATE_KEY || '');
const VAPID_SUBJECT = String(process.env.GWC_VAPID_SUBJECT || 'mailto:admin@growthworldclasses.in');
if (VAPID_PRIVATE_KEY) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const pushSent = new Map();

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
app.get('/api/gwc/push/public-key',(req,res)=>{
  if(!VAPID_PRIVATE_KEY) return res.status(503).json({ok:false,error:'Push server is not configured. Set GWC_VAPID_PRIVATE_KEY in Render.'});
  return res.json({ok:true,publicKey:VAPID_PUBLIC_KEY});
});
async function loadGwcStateForPush(){
  const err=configError(); if(err) throw new Error(err);
  const action='load',key='',ts=String(Date.now()),n=nonce(),version=ALLOWED_VERSION;
  const canonical=['GET',version,action,key,ts,n].join('|'); const url=new URL(GWC_API_URL);
  url.searchParams.set('action',action);url.searchParams.set('gwc_version',version);url.searchParams.set('gwc_ts',ts);url.searchParams.set('gwc_nonce',n);url.searchParams.set('gwc_sig',hmac(GWC_PROXY_SECRET,canonical));
  const r=await upstreamJson(url.toString(),{redirect:'follow',headers:{Accept:'application/json','Cache-Control':'no-cache'}});
  if(!r.data||r.data.ok===false||!r.data.state) throw new Error(r.data?.error||'Could not verify message in GWC cloud state.');
  return r.data.state;
}
const classAlertSent = new Map();
function indiaClock(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kolkata',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const v={};parts.forEach(p=>v[p.type]=p.value);return {day:v.weekday,minute:Number(v.hour)*60+Number(v.minute),date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())};
}
function parseClassMinute(value){
  const str=String(value||'');const matches=[...str.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/ig)].filter(m=>m[1]);
  if(!matches.length)return null;const first=matches[0];let meridiem=first[3];
  if(!meridiem){const later=matches.slice(1).find(m=>m[3]);if(later)meridiem=later[3];}
  if(!meridiem)return null;let h=Number(first[1])%12;if(String(meridiem).toUpperCase()==='PM')h+=12;return h*60+Number(first[2]||0);
}
async function runClassPushAlerts(){
  if(!VAPID_PRIVATE_KEY)return;
  try{
    const state=await loadGwcStateForPush(),clock=indiaClock();
    const schedules=Array.isArray(state.gwcWeeklySchedules)?state.gwcWeeklySchedules:[];
    const subs=Array.isArray(state.gwcPushSubscriptions)?state.gwcPushSubscriptions:[];
    const courses=Array.isArray(state.courses)?state.courses:[],students=Array.isArray(state.students)?state.students:[];
    for(const rec of schedules){
      for(const item of (Array.isArray(rec.items)?rec.items:[])){
        if(String(item.day||'').toLowerCase()!==clock.day.toLowerCase())continue;
        const start=parseClassMinute(item.time);if(start===null)continue;
        const delta=clock.minute-start;if(delta < -5 || delta > 10)continue;
        const teacherId=String(rec.teacherId||'');if(!teacherId)continue;
        const courseIds=courses.filter(c=>String(c.teacherId||'')===teacherId).map(c=>String(c.id));
        const recipients=new Set([teacherId]);
        students.filter(st=>courseIds.includes(String(st.courseId||''))).forEach(st=>recipients.add(String(st.userId||st.id||'')));
        for(const recipientId of recipients){
          const key=clock.date+'|'+teacherId+'|'+String(item.day)+'|'+String(item.time)+'|'+recipientId;
          if(classAlertSent.has(key))continue;
          const targets=subs.filter(x=>String(x.userId)===recipientId&&x.subscription?.endpoint);
          if(!targets.length)continue;
          const payload=JSON.stringify({title:'GWC Class Join Alert',body:'Aapki assigned class ka samay hai. Dashboard kholkar Join Class karein.',tag:'gwc-class-'+key,url:'/'});
          for(const target of targets){try{await webpush.sendNotification(target.subscription,payload);}catch(e){}}
          classAlertSent.set(key,Date.now());
        }
      }
    }
    if(classAlertSent.size>5000){const cutoff=Date.now()-48*60*60*1000;for(const [k,v] of classAlertSent)if(v<cutoff)classAlertSent.delete(k);}
  }catch(e){console.error('GWC class push scheduler:',e.message);}
}
setInterval(runClassPushAlerts,30000);
setTimeout(runClassPushAlerts,12000);
app.post('/api/gwc/push/send',express.json({limit:'16kb'}),async(req,res)=>{
  try{
    if(!VAPID_PRIVATE_KEY) return res.status(503).json({ok:false,error:'Push is not configured on Render.'});
    const messageId=String(req.body?.messageId||'').slice(0,180), recipientId=String(req.body?.recipientId||'').slice(0,180);
    if(!messageId||!recipientId) return res.status(400).json({ok:false,error:'messageId and recipientId are required.'});
    const state=await loadGwcStateForPush(); const msg=(Array.isArray(state.gwcMessages)?state.gwcMessages:[]).find(m=>String(m.id)===messageId&&String(m.recipientId)===recipientId);
    if(!msg) return res.status(403).json({ok:false,error:'Message not found in verified GWC cloud state.'});
    if(pushSent.has(messageId)) return res.json({ok:true,sent:0,duplicate:true});
    const subs=(Array.isArray(state.gwcPushSubscriptions)?state.gwcPushSubscriptions:[]).filter(x=>String(x.userId)===recipientId&&x.subscription&&x.subscription.endpoint);
    const payload=JSON.stringify({title:'GWC: '+String(msg.senderName||'New message').slice(0,80),body:String(msg.message||'Aapko naya message mila hai.').slice(0,180),url:'/'});
    let sent=0; const stale=[];
    for(const item of subs){try{await webpush.sendNotification(item.subscription,payload);sent++;}catch(e){if(e.statusCode===404||e.statusCode===410)stale.push(item.id);}}
    pushSent.set(messageId,Date.now()); if(pushSent.size>3000){const first=pushSent.keys().next().value;pushSent.delete(first);}
    return res.json({ok:true,sent,stale:stale.length});
  }catch(e){return res.status(502).json({ok:false,error:'Push send failed: '+e.message});}
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
    const allowed = ['save','set','savestate','writestate','upload','uploadfile','archivefile','deletefile','health','ping','submitprivatenote','editprivatenote','deleteprivatenote','startdriveupload','permanentdeletefile','presenceupdate'];
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
