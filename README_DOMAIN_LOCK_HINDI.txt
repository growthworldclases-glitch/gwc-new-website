GWC V23 DOMAIN LOCK SECURITY PATCH

Allowed website host:
https://growth-world-classes-2-0.onrender.com

Changes:
- server.js rejects requests served through any other Host name.
- /api/gwc rejects cross-origin/referrer traffic and requires Render GWC_PROXY_SECRET.
- Code.gs requires the matching Script Property GWC_PROXY_SECRET on every GET and POST.
- Code.gs, server.js, package.json and ZIP files are not served as public static assets.
- Existing HTML, data schema, IDs/password records and other files are retained unchanged.

IMPORTANT SETUP:
1. Create a random secret of at least 48 characters locally. Do not use a value included in the ZIP.
2. Apps Script > Project Settings > Script Properties:
   GWC_PROXY_SECRET = [your random secret]
   Keep GWC_SPREADSHEET_ID and all existing properties unchanged.
3. Render > your existing service > Environment:
   GWC_PROXY_SECRET = [the exact same random secret]
   Keep GWC_API_URL and all other existing variables unchanged.
4. Deploy latest code to Render.
5. Apps Script > Deploy > Manage deployments > Edit existing Web App > New version > Deploy.
   Keep the existing deployment URL and permissions as previously configured.
6. Test official website login and read/write sync.

SECURITY LIMITATIONS:
- This patch is a fixed single-domain lock. It does NOT add an Admin Dashboard interface to add/remove domains.
  A secure admin-managed domain list requires new dashboard UI plus server-side admin authorization and must be implemented/tested separately.
- If another domain is only a static copy, its own copy cannot sync through this protected Render proxy. The official Render domain remains allowed.
- Anyone who can access the Render service's environment or the Apps Script project can change security settings.
- This does not guarantee that an independently copied old backend or previously exposed Google deployment cannot be used unless the same Code.gs protection is deployed and the secret is set.
- Back up the ZIP and Google Sheet before deployment. Do not restore/delete data as part of this change.
