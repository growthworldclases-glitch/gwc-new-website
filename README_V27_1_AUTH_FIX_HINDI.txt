GWC V27.1 — TODAY NOTES AUTHORIZATION FIX
=========================================

This is a small authorization repair on top of GWC V27 Role Labels Fixed. The uploaded V26 project files were compared with V27: index.html contains additive code only (no removed lines); Code.gs and server.js contain the Today Notes/resumable-upload additions. package.json is unchanged. This patch does not intentionally change existing IDs, passwords, fee data, dashboard features, or Script Properties.

WHY THE ERROR OCCURRED
The 200 MB resumable upload starts with UrlFetchApp.fetch() in Apps Script. The active Apps Script project had not granted the required script.external_request OAuth scope, so Google blocked the request before the upload session could be created.

FILES
- index.html, server.js: same as V27 Role Labels Fixed.
- Code.gs: same V27 code plus authorizeGwcExternalRequest() helper.
- appsscript.json: declares the scopes used by this project, including script.external_request.

IMPORTANT: Apps Script authorization is an account/project consent step; no ZIP can silently grant it. Do this ONCE:
1. Open the EXISTING Apps Script project connected to the current GWC deployment. Do not create a new project.
2. In Project Settings, turn on “Show appsscript.json manifest file in editor”.
3. Open appsscript.json and merge the oauthScopes array from this ZIP into the existing manifest. Preserve any existing manifest fields/settings not shown in this ZIP. If there is no existing manifest, you may use this ZIP's appsscript.json.
4. Replace Code.gs with this ZIP's Code.gs and Save.
5. In the Apps Script editor function dropdown, select authorizeGwcExternalRequest and click Run. Review the Google permission screen and allow the requested access. If Google shows “unverified app”, proceed only if this is your own trusted GWC script/project.
6. After successful authorization, Deploy > Manage deployments > Edit the EXISTING Web App deployment > select New version > Deploy. Keep the existing Web App URL, Execute as setting, access setting, and all Script Properties unchanged.
7. Replace index.html and server.js in the SAME GitHub repository used by the existing Render service, then commit/push once. Keep package.json unchanged.

DO NOT delete or recreate the Spreadsheet, Drive folder, Script Properties, Render environment variables, users, or deployments. Back up the Google Sheet before updating.

SCOPE PURPOSES
- spreadsheets: existing GWC sheet storage
- drive: existing Drive upload/archive functions
- script.external_request: Google Drive resumable upload session via UrlFetchApp
- script.scriptapp: existing daily trigger management
- script.storage: existing script cache/properties

This package cannot authorize the Google account or test the user's private Render/Apps Script deployment. Test with one small JPEG and one small PDF before trying a large file.
