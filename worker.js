// Cloudflare Worker + KV API for GWC
// Bind a KV namespace named GWC_DATA in Worker Settings > Bindings.
const ALLOWED_ORIGIN = "*"; // For production, replace with your exact GitHub Pages origin.
const KEY = "gwc_professional_v6/state";
const MAX_BODY = 24 * 1024 * 1024;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN === "*" ? "*" : (origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN),
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (!env.GWC_DATA) return json({ error: "KV binding GWC_DATA is missing" }, 500, origin);
    if (url.pathname === "/health" && request.method === "GET") return json({ ok: true, service: "GWC Cloudflare KV API" }, 200, origin);
    if (url.pathname !== "/state") return json({ error: "Not found" }, 404, origin);
    if (request.method === "GET") {
      const value = await env.GWC_DATA.get(KEY);
      return value ? new Response(value, { status: 200, headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } })
                   : json({ state: null }, 200, origin);
    }
    if (request.method === "PUT") {
      const length = Number(request.headers.get("Content-Length") || 0);
      if (length > MAX_BODY) return json({ error: "Payload exceeds 24MB limit" }, 413, origin);
      const body = await request.text();
      if (new TextEncoder().encode(body).length > MAX_BODY) return json({ error: "Payload exceeds 24MB limit" }, 413, origin);
      let parsed;
      try { parsed = JSON.parse(body); } catch { return json({ error: "Invalid JSON" }, 400, origin); }
      if (!parsed || typeof parsed.state !== "object" || !parsed.state) return json({ error: "Expected {state: {...}}" }, 400, origin);
      await env.GWC_DATA.put(KEY, JSON.stringify(parsed));
      return json({ ok: true, savedAt: new Date().toISOString() }, 200, origin);
    }
    return json({ error: "Method not allowed" }, 405, origin);
  }
};
