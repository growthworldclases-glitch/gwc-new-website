GROWTH WORLD CLASSES (GWC) — SAFE JSON + FEE SLIP PATCH

This ZIP is based on the uploaded GWC_Monthly_Cycle_QR_Update project. It keeps the existing index.html feature set and adds targeted safeguards.

DEPLOY IN THIS ORDER (after restoring the known-good Google Sheet version):
1. Make a separate copy of the restored spreadsheet first. Verify student, teacher, login, admission, fee-request and course records.
2. In the existing Google Apps Script project, update Code.gs from this ZIP. Do NOT create a new Apps Script project and do not change the existing spreadsheet ID or deployed web app URL. Confirm Script Properties still contain GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID. Deploy > Manage deployments > Edit > New version > Deploy. Execute as Me and keep the existing access setting.
3. Deploy the complete ZIP to the same GitHub repository/Render Node Web Service. Build command: npm install. Start command: npm start. Keep GWC_API_URL pointed at the existing Apps Script web app URL.
4. Test GET /api/gwc?action=loadmeta and /api/gwc?action=diagnose, then log in and verify existing records before making any fee edits.
5. Make one controlled test save and verify it persists after refresh. Only then use the live site normally.

CHANGES:
- Adds loadmeta/meta/metadata aliases and a read-only diagnose action.
- Reads JSON chunks as displayed text; writes text-formatted chunks so Sheets does not parse chunks beginning with '=' as formulas.
- Validates current JSON before saving, stages and verifies new JSON, creates timestamped backup sheets before replacing the primary state, and refuses to initialize a blank spreadsheet if the configured spreadsheet ID/sheet is missing.
- Adds archivefile action and an Admin Fee Summary button to move a Drive fee-slip file to GWC_Deleted_Items instead of permanently deleting it.
- Keeps existing website and Node proxy routes; server.js allows archivefile action.

IMPORTANT LIMITATIONS:
- A deleted/archived slip is removed from the current fee request's visible slip field, while its Drive file is retained in GWC_Deleted_Items and the record keeps archivedSlipUrl. This action must be tested with a non-critical test slip first.
- This patch does not automatically recover a previously truncated JSON unless a valid restored sheet/version is active. It deliberately refuses to overwrite an invalid primary JSON.
- Fee-cycle behavior is preserved from the supplied project; review the student's due date and access status after deployment.
- Syntax and ZIP integrity were checked locally; live Apps Script, Google Drive, Google Sheets and Render credentials were not available for end-to-end testing. No guarantee of zero future errors is possible; keep version history and backups.
- Google Apps Script endpoint access and existing authentication are unchanged. Review access controls before storing sensitive student data.
