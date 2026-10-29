GROWTH WORLD CLASSES (GWC) — SAFE UPDATE PACKAGE
================================================

Files:
- index.html: Existing website and portals, with additive monthly-cycle, reminder,
  mobile sidebar, slip replacement/archive, and clearer auto-sync status updates.
- server.js: Render proxy. Request body limit increased to 40 MB; supports the
  existing actions plus archivefile/deletefile for moving deleted Drive files to
  GWC_Deleted_Items.
- Code.gs: Google Apps Script backend. Keeps the existing Script Properties IDs,
  checks chunk integrity, validates state before saving, keeps periodic snapshots
  in GWC_Storage_Backups, and attempts rollback if a write fails.
- package.json: Node.js/Express start configuration.

IMPORTANT — PRESERVE LIVE DATA
1. Do not delete or recreate the existing Google Apps Script project, spreadsheet,
   GWC_Storage tab, or Drive folders. Existing login records live in Google Sheets.
2. Back up the current Google spreadsheet and existing Apps Script project before
   changing deployment.
3. Render deploys server.js/package.json/index.html; it does NOT automatically
   deploy Code.gs into Google Apps Script. In the SAME existing Apps Script project,
   update Code.gs from this package, save, then Deploy > Manage deployments > Edit
   the existing Web App deployment > New version > Deploy. Keep Execute as Me and
   the same access setting as the current working deployment.
4. Keep the current Render GWC_API_URL environment variable pointing at the existing
   Apps Script /exec URL. Do not create a new Apps Script project unless the old
   project is inaccessible.
5. Deploy this ZIP through the existing GitHub/Render workflow, then test /healthz
   and /api/gwc?action=health before opening the app.
6. In Apps Script, run diagnoseGwcStorage() manually once and inspect its return value.
   It is read-only. If jsonValid is false, do not save a new empty state over the
   sheet. The new backup code can only snapshot data after it is installed; it cannot
   magically reconstruct chunks already lost before deployment.
7. To install daily fee expiry processing, run installGwcDailyFeeTrigger() once in
   Apps Script. Approve the requested permissions.

Data safety notes:
- Existing spreadsheet/folder IDs in Script Properties are retained.
- Writes now snapshot previous raw chunks periodically and roll back on a failed write.
- Invalid or missing chunks cause a clear error instead of silently concatenating
  incomplete data.
- A deleted/replaced Drive slip or brand image is moved into GWC_Deleted_Items,
  rather than being permanently deleted, when Drive permissions allow it.
- Fee-cycle reminders are displayed in the app when the student opens it. This is
  not an SMS/WhatsApp/push notification service.
- No code can promise that an external Google service will never fail. Keep regular
  backups and verify the live data after deployment.

Default Render command: npm start
Node version: 18 or newer
