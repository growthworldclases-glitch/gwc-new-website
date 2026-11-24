function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function apiUrl(env) {
  const api = String(env.GWC_API_URL || "").trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(api))
    throw new Error("GWC_API_URL is missing or invalid in server environment.");
  if (String(env.GWC_API_SECRET || "").length < 32)
    throw new Error("GWC_API_SECRET must be at least 32 characters.");
  return api;
}
const ALLOWED_HOSTS = new Set(["growthworldclasess.com", "www.growthworldclasess.com"]);
function originAllowed(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return (u.protocol === "https:" || u.protocol === "http:") && ALLOWED_HOSTS.has(u.hostname.toLowerCase());
  } catch (_) { return false; }
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
  url.searchParams.set("action", action);
  url.searchParams.set("gwc_auth", String(env.GWC_API_SECRET));
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
  payload.action = String(payload.action || payload.type || payload.op || payload.command || "").toLowerCase();
  if (["save", "set", "savestate", "writestate"].includes(payload.action) && !payload.state && payload.data)
    payload.state = payload.data;
  const allowed = [
    "save","set","savestate","writestate","upload","uploadfile","archivefile","archivefeeslip",
    "restorefeeslip","deletefile","health","ping","submitprivatenote","editprivatenote",
    "deleteprivatenote","startdriveupload","permanentdeletefile","presence_ping","presence_list",
    "getdeletedfolder","workspacefolders","workspacevalidate","workspacecreate"
  ];
  if (!allowed.includes(payload.action)) return json({ ok: false, error: `Unsupported POST action: ${payload.action}` }, 400);
  payload._gwcAuth = String(env.GWC_API_SECRET);
  const result = await upstreamJson(apiUrl(env), {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8", Accept: "application/json" },
    body: JSON.stringify(payload)
  });
  return json(result.data, result.status >= 200 && result.status < 300 ? 200 : result.status);
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
      const host = url.hostname.toLowerCase();
      const origin = request.headers.get("Origin") || "";
      const referer = request.headers.get("Referer") || "";
      if (!ALLOWED_HOSTS.has(host) || !originAllowed(origin) || !originAllowed(referer))
        return json({ ok: false, error: "Access denied: authorized GWC domain only." }, 403);
      if (url.pathname.startsWith("/api/") && !origin && !referer)
        return json({ ok: false, error: "Access denied: same-origin API request required." }, 403);
      if (url.pathname === "/healthz") {
        try { apiUrl(env); return json({ ok: true, service: "GWC Cloudflare proxy", security: "V55 domain allowlist + private Apps Script credential" }); }
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
