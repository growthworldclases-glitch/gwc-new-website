// Optional Render Web Service proxy to avoid browser CORS/redirect failures with Apps Script.
// Set GWC_APPS_SCRIPT_URL in Render Environment to the existing /exec URL.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3000);
const GAS_URL = process.env.GWC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';
const ROOT = __dirname;
const MAX_BODY = 6 * 1024 * 1024;
function send(res, status, body, type='application/json; charset=utf-8') { res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(body); }
async function readBody(req) { let parts=[], size=0; for await (const part of req) { size+=part.length; if(size>MAX_BODY) throw new Error('Request too large (6 MB limit).'); parts.push(part); } return Buffer.concat(parts).toString('utf8'); }
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res,200,JSON.stringify({ok:true,service:'GWC proxy'}));
  if (url.pathname === '/api/gwc') {
    try {
      let upstream;
      if (req.method === 'GET') {
        const action = url.searchParams.get('action') || 'load';
        upstream = await fetch(`${GAS_URL}?action=${encodeURIComponent(action)}&t=${Date.now()}`, {redirect:'follow'});
      } else if (req.method === 'POST') {
        const body = await readBody(req);
        let payload; try { payload=JSON.parse(body); } catch { return send(res,400,JSON.stringify({ok:false,error:'Request body is not valid JSON'})); }
        upstream = await fetch(GAS_URL, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});
      } else return send(res,405,JSON.stringify({ok:false,error:'Method not allowed'}));
      const raw = await upstream.text();
      let data; try { data=JSON.parse(raw); } catch {
        const contentType = upstream.headers.get('content-type') || 'unknown content type';
        const preview = raw.replace(/\s+/g,' ').slice(0,180);
        return send(res,502,JSON.stringify({ok:false,error:`Apps Script returned non-JSON (HTTP ${upstream.status}, ${contentType}). This usually means the Web App deployment/permissions returned a Google HTML page, not JSON. Open the existing /exec URL?action=health in a browser. Response preview: ${preview}`}));
      }
      return send(res,upstream.ok?200:502,JSON.stringify(data));
    } catch (e) { return send(res,502,JSON.stringify({ok:false,error:e.message || 'Upstream request failed'})); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,'Method not allowed','text/plain; charset=utf-8');
  const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const filePath = path.resolve(ROOT, '.' + requested);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT,'index.html')) return send(res,403,'Forbidden','text/plain; charset=utf-8');
  fs.readFile(filePath,(err,buf)=>{
    if(err) return send(res,404,'Not found','text/plain; charset=utf-8');
    const ext=path.extname(filePath).toLowerCase(); const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600','X-Content-Type-Options':'nosniff'}); res.end(req.method==='HEAD'?undefined:buf);
  });
});
server.listen(PORT,'0.0.0.0',()=>console.log(`GWC web + Apps Script proxy listening on ${PORT}`));
