GWC V49.1 – RENDER + GITHUB DEPLOYMENT PACKAGE
================================================

IMPORTANT
- This package is based on the supplied GWC V49 source package.
- It includes the website source, Node/Express proxy, Google Apps Script source,
  Android Studio source project, and a PRIVACY POLICY DRAFT.
- The privacy-policy.html file is NOT final: it contains owner-confirmation
  placeholders. Do not submit its URL to Google Play until all placeholders and
  actual data practices have been verified and completed.
- APK/AAB are not included; Android source is included separately in android-app/.
- No live Render or GitHub deployment was performed from this package.

RENDER WEB SERVICE SETTINGS
---------------------------
Runtime: Node
Root Directory: (leave blank; package.json is in repository root)
Build Command: npm install
Start Command: npm start
Health Check Path: /healthz

Set these Environment Variables in Render (never commit secret values):
1. GWC_API_URL = your deployed Google Apps Script Web App URL ending in /exec
2. GWC_PROXY_SECRET = the same strong secret configured in the Apps Script project
3. GWC_APP_VERSION = 24.0-secure

Keep the current production service and environment variables intact until the
new deployment passes testing. Prefer a separate Render staging service first.
Do not delete or replace the existing service/database.

GITHUB DEPLOY STEPS
-------------------
1. Extract this ZIP on your computer.
2. Create a NEW private GitHub repository (or a separate test branch); do not
   overwrite the current production repository before testing.
3. Upload the CONTENTS of this folder so package.json and server.js are at the
   repository root (not inside an extra nested folder).
4. Connect that repository to a new Render Web Service.
5. Enter the Render settings and environment variables above.
6. Deploy and open /healthz. It should return ok:true only when all required
   environment variables are correct.
7. Test login, student/teacher/admin dashboards, file upload/download, Google
   Apps Script sync, and all existing workflows with test accounts.
8. Only after successful approval should you plan a production switch.

PRIVACY POLICY
--------------
The draft is served as /privacy-policy.html by Express static hosting.
Before using it publicly as the official policy, fill every [INSERT]/[CONFIRM]
placeholder and verify the real production data flows, child/guardian process,
retention, deletion, processors, contact details and account deletion process.
Then link the final URL in the app and Play Console. The current website footer's
Privacy Policy control may still open its existing in-app policy content; this
static page is separately available at /privacy-policy.html.

ANDROID
-------
Open android-app/ in Android Studio. The app is configured to open the current
GWC Render website URL. Build a debug APK for device testing. For Play Store,
create a signed AAB using a protected upload key and complete Play Console
policy/testing requirements. Do not commit keystore files or passwords to GitHub.
