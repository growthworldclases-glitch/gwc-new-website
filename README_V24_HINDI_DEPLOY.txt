GWC V24 SECURE SYNC — HINDI DEPLOY GUIDE
========================================

ZIP CONTENTS: 19 files. Existing V23 index.html, package.json and other assets/features are retained.
Modified runtime files: Code.gs (Google Apps Script) and server.js (Render/GitHub).
New documentation: this file plus SECURITY, TEST and CHANGELOG notes.

IMPORTANT SECURITY FACTS
- Do NOT share GWC_PROXY_SECRET or publish it in index.html/GitHub.
- Apps Script Script Properties must contain:
  GWC_PROXY_SECRET = same 64-character secret as Render
  GWC_ALLOWED_VERSION = 24.0-secure
  GWC_SPREADSHEET_ID = existing spreadsheet ID (do not change)
  GWC_DRIVE_FOLDER_ID = existing Drive folder ID (do not change)
- Optional during secret rotation:
  GWC_PROXY_SECRET_PREVIOUS = old secret temporarily; remove after all services use new secret.
- Render Environment:
  GWC_API_URL = deployed Apps Script Web App URL ending /exec
  GWC_PROXY_SECRET = exactly same current secret
  GWC_APP_VERSION = 24.0-secure
- Do not use GWC_ALLOWED_VERSIONS (plural); exact property name is GWC_ALLOWED_VERSION.

DEPLOY ORDER
1. Make a full copy/backup of the Google spreadsheet and Drive folder contents.
2. Open the EXISTING Apps Script project attached to the existing GWC deployment.
3. Replace only Code.gs with this ZIP's Code.gs. Keep other .gs files and triggers unless audited.
4. Save. Project Settings > Script Properties: verify all four existing/new properties above.
5. Deploy > Manage deployments > edit the EXISTING Web App deployment > New version > Deploy.
   Execute as: Me. Access: Anyone (Render proxy needs to reach it). Keep the /exec URL and copy it.
6. In the existing GitHub repository replace ONLY server.js with this ZIP's server.js.
   Keep index.html, package.json, images, assets, and all other feature files unchanged.
   Commit the change.
7. Render service > Environment: set GWC_API_URL, GWC_PROXY_SECRET, GWC_APP_VERSION as above.
   Save changes and deploy latest commit.
8. Check https://YOUR-RENDER-SERVICE/healthz. It should report ok:true and version 24.0-secure.
9. Test GET/load, then test one harmless admin change and confirm it appears in the same old Google Sheet.
10. Test teacher/sub-admin access and uploads before moving all users.

WHICH FILES CHANGE?
- Google Apps Script: Code.gs only.
- GitHub: server.js only.
- Render: no file upload; deploy from GitHub and set three environment variables.
- index.html: retained unchanged because the existing browser app already calls /api/gwc.
- package.json: retained unchanged.

ROLLBACK
If any test fails, do not delete old deployment or modify sheet IDs. Restore the backed-up Code.gs/server.js and redeploy. Never restore an old, publicly exposed deployment as the permanent production endpoint.

LIMITATION
A newly secured V24 endpoint rejects unsigned old clients. It cannot remotely disable a separately copied old V23 Apps Script project or old Render service owned/deployed elsewhere. Retire the old deployment/service and rotate/restrict credentials. A universal "SERVER_NOT_FOUND" response on every independently deployed stolen copy cannot be guaranteed by code in this ZIP.
