GWC WEBSITE SERVER FIX V4 — HINDI STEPS

This ZIP contains index.html, server.js, package.json, render.yaml, and Code.gs.
The browser now uses the same-origin Render proxy (/api/gwc) instead of attempting direct browser fetches to Apps Script, which often fail due to redirects/CORS.

IMPORTANT: Do not assume deployment is fixed merely because Render says Live. You must update BOTH Render source files and the existing Apps Script deployment.

A. GitHub / Render
1. Keep a copy of your current repository/branch first. Do not delete the old live branch.
2. Upload/replace the files from this ZIP at the repository root: index.html, server.js, package.json, render.yaml. Commit changes.
3. Render Dashboard > existing Node Web Service > Settings: Build Command `npm install`; Start Command `npm start`.
4. Environment: GWC_APPS_SCRIPT_URL = the exact existing /exec URL already in your previous instructions. Do not change it.
5. Manual Deploy > Deploy latest commit. Wait for Live.
6. Test https://YOUR-RENDER-SERVICE.onrender.com/health. Expected JSON: {"ok":true,"service":"GWC proxy"}.
7. Test https://YOUR-RENDER-SERVICE.onrender.com/api/gwc?action=health. Expected JSON from Apps Script containing ok:true and service GWC Apps Script.
8. Test https://YOUR-RENDER-SERVICE.onrender.com/api/gwc?action=load. Expected JSON containing ok:true and state (state may be null if storage is empty).

B. Google Apps Script (same URL retained)
1. Open the EXISTING Apps Script project connected to the existing /exec URL.
2. Back up the current Code.gs and note the spreadsheet/folder IDs in Script Properties before changing code.
3. Replace Code.gs with the Code.gs in this ZIP. Save.
4. Deploy > Manage deployments > pencil/Edit on the existing Web App deployment > Version: New version > Deploy.
5. Authorize requested Sheets/Drive permissions if prompted. Do not create a new deployment if you must keep the same URL.
6. Open the existing /exec URL?action=health in a browser. It should return JSON with ok:true. If it still says Unknown action, the wrong project/deployment was edited or New version was not deployed.

C. Poster upload test
1. Open the Render website; hard refresh (Ctrl+F5).
2. Check connection status; it should show Connected — Google Sheets/Drive active.
3. Upload a harmless test image under 1 MB (JPG/PNG/WEBP/GIF). Verify success and confirm the file appears in the Google Drive GWC_Uploads folder.
4. Make a harmless test setting change and verify it appears in the existing GWC_Storage sheet.

TROUBLESHOOTING
- `/health` fails: Render Node service/branch/start command issue; inspect Render Logs.
- `/health` works but `/api/gwc?action=health` returns Unknown action: Apps Script Code.gs was not updated/deployed to the existing deployment, or wrong script project/URL.
- `/api/gwc?action=health` returns HTML/login page: Web App access/deployment permissions are wrong or URL is not the Web App /exec URL.
- health works but `/api/gwc?action=load` fails: Apps Script authorization, Spreadsheet permissions, or script runtime issue; inspect Apps Script Executions.
- load works but upload fails: check Apps Script Executions, Drive authorization, file type and <=1 MB size.

SECURITY WARNING
This starter endpoint is publicly accessible and uploaded files are set to Anyone with the link. Do not use it for real student personal information or payment slips until authentication/authorization and private-file permissions are implemented and tested. The current site is not a security-audited production admissions system.
