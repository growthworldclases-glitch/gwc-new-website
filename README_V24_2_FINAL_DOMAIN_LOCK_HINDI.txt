GWC V24.2 FINAL DOMAIN LOCK — BASED ON USER UPLOADED V24.1 ZIP

Default approved origin (with or without trailing slash; slash is same origin):
https://growth-world-classes-2-0.onrender.com

This package carries forward all 18 original files unchanged. No dashboard, icons, login IDs/passwords, fee settings, student/teacher/course records, or storage identifiers were edited in this package.

Domain behavior already present in Code.gs/server.js:
- Official Render origin is built-in and permanently allowed.
- Admin-managed extra origins require the saved Main Admin username/password.
- Admin can add/remove other HTTPS origins; official origin cannot be removed.
- The official Render site's proxy requests bypass stale Apps Script origincheck so it does not show Domain/Origin blocked for the default website.
- Origin is normalized, so a trailing slash does not create a second origin.
- Apps Script refuses to create a blank spreadsheet if GWC_SPREADSHEET_ID is missing and refuses missing storage sheet.

IMPORTANT LIMITATION:
This is a browser Origin gate, not cryptographic authentication. It blocks normal browser requests from unauthorized origins through this Render proxy, but a copied public Apps Script Web App URL or non-browser client may still call the Apps Script endpoint directly. To fully prevent direct access, Apps Script must be private/authenticated or use a server-side secret/token and deployment/access changes. This no-secret build does not revoke prior public deployments.

DEPLOY
1) Back up the current Render repo and Google Sheet.
2) Copy server.js and index.html from this ZIP into the existing Render project; keep package.json and existing Render environment settings.
3) In the same Apps Script project, replace Code.gs with the included Code.gs and deploy a New version of the existing Web App. Keep the existing deployment URL and current execution/access configuration.
4) Do not delete existing Script Properties, especially GWC_SPREADSHEET_ID, Drive folder ID, or other storage properties.
5) Redeploy Render, then open the official domain and verify login, sync, Admin > Authorized Domains, student/teacher dashboards, fee, upload, and helpdesk flows.

Validation note: package source was carried forward; no deployment or live account verification was performed from this environment.
