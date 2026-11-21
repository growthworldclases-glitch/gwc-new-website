GWC V48.2 — GOOGLE WORKSPACE ADDITIVE UPDATE
Base: User-uploaded GWC_V48_1_CONTROLLED_REPAIR.zip

ADDED IN V48.2
1. Admin portal sidebar now includes Google Workspace.
2. Admin can register an existing Google Spreadsheet by URL and optional tab name. The Apps Script backend validates that the spreadsheet is accessible and that the requested tab exists.
3. Admin can create a new Google Spreadsheet, choose its title and first tab name, and select My Drive root or a listed Drive folder (including nested folders up to 3 levels).
4. Admin can edit a Workspace entry, change its display title/tab, and assign portal visibility sheet-by-sheet to active Teacher/Sub-admin accounts.
5. Teacher/Sub-admin see Google Workspace only when at least one sheet is assigned to their GWC account. They can open only assigned entries in the portal.
6. Remove permanently removes the entry from the GWC Workspace list. It does NOT delete the original spreadsheet from Google Drive.
7. Workspace backend actions re-check the current Admin username/password against the existing saved GWC Admin account before listing Drive folders, validating a sheet, or creating a spreadsheet.

LOGIN SESSION / CREDENTIALS
- Existing login validation and stored account records are retained.
- No IDs, passwords, roles, Admin settings, course/batch records, or account records were reset or migrated.
- Login session persistence now falls back to sessionStorage if browser localStorage is unavailable. It stores role, account ID, username, session version and timestamp only; it does not store passwords.
- A changed username/session version intentionally invalidates the old saved session. The user must sign in again with the current credentials.
- This offline package cannot validate the user's live credentials or Google/Chrome sign-in session.

IMPORTANT ACCESS LIMITATION
- Sheet-wise access in this build controls visibility/opening inside the GWC portal. It does not automatically grant Google Drive sharing rights to a Teacher/Sub-admin's Google account. The spreadsheet owner/Admin must share the underlying Google Sheet with the intended Google account email using Google Drive's sharing controls.
- The folder chooser lists My Drive folders (nested up to 3 levels). It is a Drive-backed folder selector, not the Google Picker OAuth popup.
- Remove from GWC Workspace does not trash or permanently delete the Drive file, to prevent accidental loss of source documents.

DEPLOYMENT
1. Keep all existing Render Environment variables unchanged.
2. Update the existing Apps Script project with the new Code.gs from this ZIP. Do not create a new project or change GWC_SPREADSHEET_ID, GWC_PROXY_SECRET, GWC_ALLOWED_VERSION, or the existing deployment URL.
3. In Apps Script, save and deploy a new version of the SAME Web App deployment (Execute as existing owner; same access setting). If Google asks for Drive/Sheets permission, authorize the required scopes.
4. Upload/deploy the ZIP contents to the existing Render/GitHub project, preserving the existing Render environment values.
5. Test Admin login, Student/Teacher/Sub-admin login, cloud sync, fee slips and existing workflows before using Workspace in production.
6. To give a Teacher/Sub-admin access to a sheet, assign their GWC account in Workspace AND share the actual Google Sheet with their Google account email.

VALIDATION
- Original archive entries retained; 2 new documentation files added.
- 33 inline JavaScript blocks pass Node.js syntax validation.
- server.js and Code.gs pass JavaScript syntax validation.
- package.json and appsscript.json parse as valid JSON.
- No live Render deployment, Apps Script execution, Google Drive operation, or production login was performed in this offline environment.
