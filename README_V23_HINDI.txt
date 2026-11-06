GWC V24 — OFFICIAL DOMAIN LOCK + PRIVATE GOOGLE PROXY AUTH
==========================================================

Official website allowed:
https://growth-world-classes-2-0.onrender.com/

Other domains (including a copied website on another domain) are rejected by
the Render server's Host/Origin guard. Google Apps Script also rejects requests
unless they come through the server with the matching proxy secret.

IMPORTANT: The secret is intentionally NOT written into server.js, Code.gs,
index.html, or this ZIP. It must remain server-side only.

SECRET TO SET (copy exactly; do not share publicly):
[CHAT MEIN DI GAYI SECRET KEY YAHAN PASTE KAREIN]

SETUP — DO BOTH SIDES WITH THE SAME VALUE
-----------------------------------------
A) Google Apps Script:
1. Open the EXISTING Apps Script project connected to the current GWC Sheet.
2. Project Settings (gear) > Script Properties > Add script property.
3. Property: GWC_PROXY_SECRET
4. Value: paste the secret shown above.
5. Save. Do NOT delete or change GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID,
   or any other existing Script Properties.
6. Deploy > Manage deployments > Edit the EXISTING Web App deployment.
7. Select New version and Deploy. Keep the existing deployment URL.
8. Confirm Execute as: Me and access: Anyone (the Render proxy is the caller;
   the secret, not public URL visibility, authenticates it).

B) Render:
1. Open https://dashboard.render.com/ and select the EXISTING GWC web service.
2. Environment > Add Environment Variable.
3. Key: GWC_PROXY_SECRET
4. Value: paste the exact same secret.
5. Save Changes. Render will redeploy; wait until Live.
6. Ensure the existing GWC_API_URL still points to the same Apps Script /exec URL.
   Do not change other environment variables.

C) Website files:
1. Keep a backup of the current live ZIP/repository and Google Sheet first.
2. Replace the repository files with this ZIP's files, preserving the project root.
3. Commit/push to the same GitHub repository connected to Render.
4. Wait for successful Render deploy.
5. Test official URL, then login with existing test account.

WHAT IS PRESERVED
-----------------
- index.html and package.json are byte-for-byte unchanged from the supplied V23 ZIP.
- Existing login IDs/passwords, UI, dashboard icons, fee cycles, weekly schedule,
  Help Desk UI, students, teachers, courses and sheet data are not migrated/reset.
- Existing spreadsheet ID, Drive folder ID, Apps Script URL and data schema
  are not changed by this ZIP.
- Code.gs adds only proxy-secret verification at GET/POST entry points.
- server.js adds official host/origin enforcement and forwards the server-only
  secret to Apps Script.

IMPORTANT SECURITY NOTES
------------------------
- Never put this secret in HTML, JavaScript sent to browsers, screenshots,
  GitHub source, or a public ZIP. Anyone who gets it could impersonate the proxy.
- This protects the Google Sync path. It cannot prevent someone from displaying
  a copied static HTML page or taking screenshots. It prevents other domains
  from using this secured Render proxy / Apps Script backend.
- A separately deployed copy with its own server and copied secrets is not
  automatically revoked unless the secret is rotated. Keep the secret private.
- Do not restore/delete Google Sheet data as part of this domain-lock setup.
- Test with a non-production account first. Keep a known-good backup.

ROLLBACK
--------
If a deploy fails, restore the previous GitHub commit. Do not delete or recreate
the Google Sheet or Script Properties. If authentication fails, verify the exact
same GWC_PROXY_SECRET exists in Render Environment and Apps Script Script
Properties, both at least 32 characters.
