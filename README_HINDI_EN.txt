# GWC Website — Server Fix V3 (same Apps Script URL)

## What is preserved
- Existing `index.html` website source from the supplied rebuild package.
- Existing Google Apps Script `/exec` URL (unchanged).
- Existing Google Sheets property key `GWC_SPREADSHEET_ID`, sheet name `GWC_Storage`, Drive folder property key `GWC_DRIVE_FOLDER_ID` and folder name `GWC_Uploads`. The script does not intentionally create a new spreadsheet if the existing Script Properties ID is valid.
- Existing Render service should NOT be deleted or edited while testing this package.

## Files
- `index.html`: website.
- `Code.gs`: Apps Script backend, with an added read-only `?action=health` JSON check; load/save/upload actions retained.
- `server.js`: Node reverse proxy; returns JSON diagnostics if Google returns HTML.
- `package.json`: Node start command.
- `render.yaml`: optional blueprint for a NEW Render Web Service.

## Important: why the error happens
If the browser says `Render proxy returned HTML instead of JSON`, the URL `/api/gwc` is probably reaching a Render Static Site's not-found page, not a running Node server. A Static Site cannot execute `server.js`. If direct Apps Script fetch then says `Failed to fetch`, the browser may be blocking the cross-origin request/redirect. Editing only `index.html` or `Code.gs` cannot make a Static Site act as a reverse proxy.

## Safe rollout (keep the current service intact)
1. In the EXISTING Apps Script project, replace the code with `Code.gs` from this ZIP and Save.
2. Deploy > Manage deployments > Edit the existing Web App deployment, choose **New version**, keep its existing deployment URL, and Deploy. Do not create a new deployment if the requirement is to retain the exact URL.
3. Open this exact URL in a browser: `https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec?action=health`. It should show JSON with `ok:true`. If it shows Google sign-in, permissions text, or HTML, fix the Web App deployment access/authorization first.
4. Upload the ZIP contents to a NEW GitHub branch or separate test repository first; do not overwrite the live branch until checks pass.
5. To solve proxy/CORS reliably without changing the old service, create a SEPARATE Render Web Service from this repository (or use `render.yaml` as a blueprint). Start command is `npm start` (or `node server.js`), Node 18+. Set `GWC_APPS_SCRIPT_URL` to the same `/exec` URL above. Keep the current live service untouched.
6. On the new Render service, open `/health`; expected JSON is `{"ok":true,"service":"GWC proxy"}`. Then test `/api/gwc?action=health` and confirm JSON `ok:true`.
7. Test load and a harmless save/load round-trip before switching any public domain or sharing the new site. The old site remains available during testing.

## Existing data
`Code.gs` uses the existing Script Properties spreadsheet/folder IDs where present. Do not delete Script Properties or the `GWC_Storage` sheet. Take a copy of the spreadsheet before live writes.

## Limitations and security
This ZIP is not a claim that the live service has been repaired: live Apps Script/Render accounts cannot be verified from this package alone. Confirm each health check and a real save/load round trip. Current data API has no server-side role authorization and uploaded files are shared with anyone who has the link. Do not use real student personal/payment data until authentication, authorization and private file handling are implemented and tested. Existing client-side default credentials are not secure.
