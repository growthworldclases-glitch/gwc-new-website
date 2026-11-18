GWC V27 — TODAY NOTES + LARGE DRIVE UPLOAD
==========================================

Based on the uploaded GWC_V26_FINAL_FULL package. Existing files and original state/login/settings structures are retained. V27 adds the Today Notes section and a resumable Google Drive upload path.

WHY V26 ATTACHMENTS COULD FAIL
- WhatsApp attachment helper capped each file at 8 MB.
- Apps Script uploadFile_ capped files at 10 MB.
- Render proxy accepted only 16 MB request bodies; base64 increases request size.
These limits made larger PDFs/photos fail.

V27 CHANGES
- Student: Upload Your Today Notes (JPEG/PDF, up to 200 MB per file).
- Teacher: View/Download notes for students assigned to that teacher.
- Admin: all student notes, searchable by student, with Archive, Restore and Permanent Delete (move to GWC_Deleted_Items).
- Permanent Delete moves the Drive file into GWC_Deleted_Items; Admin can open the Drive folder link and manually delete files from Google Drive.
- Large files are uploaded in 8 MB resumable chunks through the existing Render service to Google Drive.
- Existing login IDs/passwords, fee/payment state, Sheets state structure, and old dashboard features are not intentionally modified.

IMPORTANT DEPLOYMENT
This version changes index.html, Code.gs and server.js. Therefore both Apps Script and Render must be updated once; HTML-only replacement is NOT sufficient for 200 MB uploads. Keep a backup first.
1. Replace the Apps Script project Code.gs with V27 Code.gs and Save.
2. In Apps Script Project Settings / Services, ensure Drive and UrlFetch authorization is allowed; run a test deployment and accept the requested Google Drive authorization. Keep the same Script Properties and existing Web App URL. Deploy > Manage deployments > Edit existing Web App deployment > New version > Deploy. Do not create a new spreadsheet or change existing IDs/secrets.
3. Replace GitHub project index.html and server.js with V27 versions, commit and push to the SAME repository/service. Keep package.json unchanged. Render will deploy the commit.
4. Test with one student, one assigned teacher and Admin using a small JPEG, small PDF, then a larger file. Confirm notes list, download, archive, restore, move to GWC_Deleted_Items, and Drive Trash.

RENDER DEPLOYMENT STATUS
Render does not normally deploy on a 2–3 hour timer by itself. Repeated deploys usually come from Auto-Deploy receiving new Git commits, a connected deploy hook, or manual/API deploy triggers. In Render > Service > Settings, inspect Auto-Deploy and Deploy Hook; turn Auto-Deploy off only if you do not want Git pushes to deploy automatically. Check Events for the exact trigger. A routine restart/redeploy cannot be disabled by changing this website's HTML.

LIMITATIONS / SAFETY
- The app cannot be live-tested against your private Google Sheet/Drive or Render credentials from this environment.
- 200 MB upload depends on Google Apps Script Drive authorization, Render request routing and Google Drive quota/network stability. If Google rejects a chunk, the UI reports the failure; it does not mark the note as uploaded.
- This package does not modify old student passwords, IDs, course assignments, or fee cycles. Take a Google Sheet and Drive backup before deploying.


V27 UI label update: Student menu = Upload Your Today Notes; Teacher menu = View/Download Today Notes; Admin menu = All Notes Upload by Students. All roles use the same Today Notes data flow with role-based access.


V27.1 AUTHORIZATION FIX
Before the first Today Notes upload, merge oauthScopes from appsscript.json into the EXISTING Apps Script manifest, then run authorizeGwcExternalRequest() once in the Apps Script editor and approve the Google permission prompt. Deploy a new version of the existing Web App. See README_V27_1_AUTH_FIX_HINDI.txt. Do not replace existing Script Properties or deployment URL.
