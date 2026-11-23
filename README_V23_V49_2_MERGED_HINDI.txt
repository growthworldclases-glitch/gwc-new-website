GWC V23 + V49.2 MERGED BUILD — NO WEBSITE / DOMAIN LOCK

BASE AND MERGE
- V23 archive is the compatibility baseline for the existing data store, login
  records, assigned courses, batch IDs, IDs/passwords, and V23 storage safeguards.
- V49.2 application UI and cumulative feature code are included, including the
  V49.1 Course Store changes and V48.2 Google Workspace, live presence, Drive
  upload/archive, fee-slip restore/archive, and other cumulative V24–V49 features.
- Root index.html and public/index.html are identical.

SECURITY REQUIREMENT (AS REQUESTED)
- V24 HMAC request signing, GWC_PROXY_SECRET, GWC_ALLOWED_VERSION,
  request nonce/replay checks, and browser-origin allowlists are not used.
- No Cloudflare-only origin lock, Render retirement/HTTP 410, allowed-domain
  list, website/domain lock, or new script-based website restriction is included.
- V23 data-integrity safeguards in Code.gs are retained, including refusal to
  initialize empty storage, invalid-JSON overwrite protection, and populated
  state / record-drop checks.
- Existing private-note key validation remains as in the V23 baseline.
- This is intentionally an open proxy design: removing request/origin locks
  means the public API endpoint can be called by other clients. This is the
  requested behavior, but it increases the risk of unauthorized reads/writes.
  Do not publish sensitive data without separately deciding on access controls.

DATA / ACCOUNT COMPATIBILITY
- This ZIP contains application code, not the live Google Sheet records.
- No data migration, reset, ID generation, password reset, batch reassignment,
  or course reassignment is performed by packaging this ZIP.
- Existing account and assignment records remain in the existing Google Sheet
  if the same existing Apps Script project and spreadsheet are retained.
- Never replace the live spreadsheet with a blank sheet or create a new one.

DEPLOYMENT CONFIGURATION
- Cloudflare Worker needs only GWC_API_URL as a plain variable; no GWC_PROXY_SECRET
  or GWC_APP_VERSION secret/variable is required by this build.
- Keep the existing Apps Script Web App URL and existing spreadsheet Script
  Properties (especially GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID).
- The Apps Script code must be deployed in the same existing Apps Script project
  if you want the V49.2 backend features. Keep the same spreadsheet ID.
- Render server.js also proxies without domain allowlisting or HMAC. Set
  GWC_API_URL to the existing Apps Script /exec URL if deploying on Render.

VALIDATION / LIMITS
- Offline archive integrity and JavaScript syntax checks are performed.
- Live Google Apps Script, Google Sheets, Drive, account logins, course purchase,
  fee workflows, and file uploads cannot be verified from this ZIP.
- The V49.2 UI includes newer feature calls; deploy the matching Code.gs from
  this ZIP to the same existing Apps Script project for those backend actions.
