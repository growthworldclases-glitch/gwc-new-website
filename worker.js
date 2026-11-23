function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function clientDomain(request) {
  const raw = String(request.headers.get("Origin") || request.headers.get("Referer") || "").trim();
  if (!raw) throw new Error("Missing Origin/Referer. Open the GWC website directly.");
  const u = new URL(raw);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Invalid website origin.");
  return u.hostname.toLowerCase().replace(/^www\./, "");
}
function proxySecret(env) {
  const value = String(env.GWC_PROXY_SECRET || "").trim();
  if (value.length < 32) throw new Error("GWC_PROXY_SECRET is missing or too short in Cloudflare Worker secrets.");
  return value;
}
function apiUrl(env) {
  const api = String(env.GWC_API_URL || "").trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(api))
    throw new Error("GWC_API_URL is missing or invalid in Cloudflare Worker variables.");
  return api;
}
async function upstreamJson(url, init) {
  const response = await fetch(url, init);
  const body = await response.text();
  let data;
  try { data = JSON.parse(body); }
  catch (_) { throw new Error(`Google Apps Script returned non-JSON (HTTP ${response.status}). Check the existing Web App deployment and access setting.`); }
  return { status: response.status, data };
}
async function apiGet(request, env) {
  const incoming = new URL(request.url);
  const action = String(incoming.searchParams.get("action") || "load").toLowerCase();
  const key = String(incoming.searchParams.get("key") || "");
  const url = new URL(apiUrl(env));
  url.searchParams.set("gwcProxySecret", proxySecret(env));
  url.searchParams.set("clientDomain", clientDomain(request));
  url.searchParams.set("action", action);
  if (key) url.searchParams.set("key", key);
  const result = await upstreamJson(url.toString(), {
    redirect: "follow",
    headers: { Accept: "application/json", "Cache-Control": "no-cache" }
  });
  return json(result.data, result.status >= 200 && result.status < 300 ? 200 : result.status);
}
async function apiPost(request, env) {
  const raw = await request.text();
  let payload;
  try { payload = JSON.parse(raw); }
  catch (_) { return json({ ok: false, error: "Invalid JSON request body." }, 400); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return json({ ok: false, error: "Invalid request payload." }, 400);
  payload.gwcProxySecret = proxySecret(env);
  payload.clientDomain = clientDomain(request);
  payload.action = String(payload.action || payload.type || payload.op || payload.command || "").toLowerCase();
  if (["save", "set", "savestate", "writestate"].includes(payload.action) && !payload.state && payload.data)
    payload.state = payload.data;
  const allowed = [
    "save","set","savestate","writestate","upload","uploadfile","archivefile","archivefeeslip",
    "restorefeeslip","deletefile","health","ping","submitprivatenote","editprivatenote",
    "deleteprivatenote","startdriveupload","permanentdeletefile","presence_ping","presence_list",
    "getdeletedfolder","workspacefolders","workspacevalidate","workspacecreate","drivecleanupscan","drivecleanuparchive","drivecleanupquarantine","drivecleanupdelete","drivecleanuprestore"
  ];
  if (!allowed.includes(payload.action)) return json({ ok: false, error: `Unsupported POST action: ${payload.action}` }, 400);
  const result = await upstreamJson(apiUrl(env), {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8", Accept: "application/json" },
    body: JSON.stringify(payload)
  });
  return json(result.data, result.status >= 200 && result.status < 300 ? 200 : result.status);
}

async function verifyWorkerAdmin(request, env, username, password) {
  const url=new URL(apiUrl(env));
  url.searchParams.set("action","load");
  url.searchParams.set("gwcProxySecret",proxySecret(env));
  url.searchParams.set("clientDomain",clientDomain(request));
  const result=await upstreamJson(url.toString(),{headers:{Accept:"application/json","Cache-Control":"no-cache"}});
  const admin=result.data&&result.data.state&&result.data.state.admin||{};
  if(String(username||"")!==String(admin.username||"")||String(password||"")!==String(admin.password||""))
    throw new Error("Current Admin verification failed.");
}
async function clearRenderBuildCache(request, env) {
  const body=await request.json().catch(()=>null);
  if(!body||typeof body!=="object") return json({ok:false,error:"Invalid request body."},400);
  try {
    await verifyWorkerAdmin(request,env,body.adminUsername,body.adminPassword);
    const apiKey=String(env.RENDER_API_KEY||"").trim();
    const serviceId=String(env.RENDER_SERVICE_ID||"").trim();
    if(!apiKey||!serviceId) return json({ok:false,error:"Set RENDER_API_KEY and RENDER_SERVICE_ID as Cloudflare Worker secrets/variables."},503);
    if(!/^srv-[A-Za-z0-9]+$/.test(serviceId)) return json({ok:false,error:"RENDER_SERVICE_ID format is invalid."},400);
    const upstream=await fetch("https://api.render.com/v1/services/"+encodeURIComponent(serviceId)+"/deploys",{
      method:"POST",
      headers:{Authorization:"Bearer "+apiKey,Accept:"application/json","Content-Type":"application/json"},
      body:JSON.stringify({clearCache:"clear"})
    });
    const raw=await upstream.text();let data={};try{data=raw?JSON.parse(raw):{};}catch(_){}
    if(!upstream.ok)return json({ok:false,error:data.message||data.error||("Render API request failed (HTTP "+upstream.status+").")},upstream.status>=500?502:upstream.status);
    return json({ok:true,deployId:data.id||data.deploy?.id||"",status:data.status||data.deploy?.status||"created",message:"Render accepted Clear Build Cache & Deploy. Check Render Deploys. Previously consumed bandwidth cannot be deleted."});
  } catch(e){return json({ok:false,error:e.message},403);}
}

async function driveUploadChunk(request) {
  const session = String(request.headers.get("X-GWC-Upload-Session") || "");
  const range = String(request.headers.get("Content-Range") || "");
  if (!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(session))
    return json({ ok: false, error: "Invalid or missing Drive upload session." }, 400);
  if (!/^bytes \d+-\d+\/\d+$/.test(range))
    return json({ ok: false, error: "Invalid Content-Range." }, 400);
  const body = await request.arrayBuffer();
  if (!body.byteLength || body.byteLength > 9 * 1024 * 1024)
    return json({ ok: false, error: "Empty or oversized upload chunk." }, 400);
  const upstream = await fetch(session, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream", "Content-Range": range },
    body,
    redirect: "manual"
  });
  const text = await upstream.text();
  if (upstream.status === 308) return json({ ok: true, done: false });
  let data = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch (_) { return json({ ok: false, error: "Drive returned a non-JSON upload completion response." }, 502); }
  if (upstream.status < 200 || upstream.status >= 300)
    return json({ ok: false, error: data.error?.message || `Drive upload failed (HTTP ${upstream.status}).` }, 502);
  return json({ ok: true, done: true, fileId: data.id || "", name: data.name || "", mimeType: data.mimeType || "", webViewLink: data.webViewLink || "" });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/gwc/render-cleanup" && request.method === "POST") return json({ ok: false, error: "This site is being served by Cloudflare Worker. Workers do not expose a Render local filesystem or Render monthly bandwidth cleanup; this is a diagnostic limitation, not a successful cleanup. Cloudflare-served static assets are not removable through this Admin panel; review Cloudflare analytics for delivery usage." }, 501);
      if (url.pathname === "/api/gwc/render-build-cache-clear" && request.method === "POST") return await clearRenderBuildCache(request, env);
      if (url.pathname === "/healthz") {
        try { apiUrl(env); return json({ ok: true, service: "GWC Cloudflare proxy", security: "V51 server-secret + Admin website blocklist" }); }
        catch (e) { return json({ ok: false, service: "GWC Cloudflare proxy", error: e.message }, 503); }
      }
      if (url.pathname === "/api/gwc" && request.method === "GET") return await apiGet(request, env);
      if (url.pathname === "/api/gwc" && request.method === "POST") return await apiPost(request, env);
      if (url.pathname === "/api/gwc/drive-upload-chunk" && request.method === "POST") return await driveUploadChunk(request);
      if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Unknown GWC API route." }, 404);
      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ ok: false, error: error?.message || "Cloudflare Worker request failed." }, 502);
    }
  }
};
