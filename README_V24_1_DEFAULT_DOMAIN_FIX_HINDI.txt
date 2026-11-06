GWC V24.1 — OFFICIAL DEFAULT DOMAIN FIX (ADDITIVE / FEATURE-PRESERVING)

Official default website:
https://growth-world-classes-2-0.onrender.com/

WHAT WAS FIXED
1. The official Render origin is now built-in and pre-authorized in server.js. Its /api/gwc and /api/domains requests no longer depend on an Apps Script origincheck round-trip. This removes the false "Server not connected — Domain/Origin blocked" failure on the official website when the Apps Script allowlist check is stale or temporarily unavailable.
2. Code.gs always includes the official Render origin in GWC_ALLOWED_ORIGINS, repairing an old/stale list automatically.
3. The official default domain cannot be removed. Other domains can still be added/removed only from the Admin portal after Main Admin password confirmation.
4. Admin domain list labels the official website as Default / Active and does not offer a Remove action for it.

WHAT WAS NOT CHANGED
- No login ID/password values or account records were changed.
- No Google Apps Script URL, spreadsheet ID, Drive folder ID, Script Properties for existing storage, sheet data, student/teacher/course/fee records, or backup data were intentionally changed.
- No existing portal features, menus, roles, batch settings, payment settings, or login flows were intentionally removed or redesigned.
- package.json is unchanged.

DEPLOYMENT
1. Keep a backup of the current live repository and Google Sheet.
2. Replace index.html and server.js in the existing Render/GitHub project with the files from this ZIP. Keep the existing package.json and Render service settings.
3. In the same existing Apps Script project, replace Code.gs and deploy a New version of the same Web App. Keep the existing deployment URL, Execute as Me, and access setting used by the Render proxy. Do not delete existing Script Properties such as GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID, or GWC_ALLOWED_ORIGINS.
4. Confirm Render Environment still has the existing GWC_API_URL. No new secret or token is required for this patch.
5. Open the exact official URL above, sign in using the existing Main Admin credentials, and verify Google Sync. In Admin > Authorized Domains, the official URL should appear as Default / Active and cannot be removed.
6. Add or remove any additional website domain only after Main Admin login and password confirmation.

VALIDATION PERFORMED
- Node syntax check passed for server.js.
- Node syntax check passed for Code.gs syntax.
- All four inline JavaScript blocks in index.html passed Node syntax checks.
- Static source comparison confirms only the domain authorization behavior and its Admin UI description/action were changed; the other project files are carried forward unchanged.

LIMITATION
This is an origin allowlist / browser-origin gate, not full authentication for the public Apps Script Web App. It prevents accidental blocking of the official domain and controls additional browser origins, but it is not a substitute for server-side user authentication or a private backend against direct non-browser access.
