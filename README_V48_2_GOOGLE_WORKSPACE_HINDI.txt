GWC V48.2 — GOOGLE WORKSPACE ADDITIVE UPDATE
Base: User-uploaded GWC_V48_1_CONTROLLED_REPAIR.zip

GOOGLE WORKSPACE (ADMIN PORTAL)
- Added a Google Workspace tab to Admin, Teacher and Sub-admin portals.
- Admin can register an existing Google Spreadsheet by pasting its Sheets URL and setting a display title.
- Admin can create a new Google Spreadsheet. A Drive Folder ID can optionally be supplied; blank creates in My Drive root.
- Admin can open, rename/update the display title, assign sheet access to selected Teacher/Sub-admin account IDs, and remove a sheet from the Workspace registry.
- Teacher/Sub-admin see only sheets assigned to their account and can open those sheets.
- Workspace registry is stored separately in Apps Script Script Properties (GWC_WORKSPACE_SHEETS_V1); it does not modify GWC saved JSON state or the existing student/course/payment records.
- Apps Script checks the actor's username/password/role against the current GWC state before performing Workspace operations. Admin-only mutations are enforced server-side; sheet opening for Teacher/Sub-admin is checked against the per-sheet access list.

IMPORTANT LIMITATIONS / REQUIRED SETUP
- This version uses a Drive Folder ID field rather than the Google Picker visual folder chooser. To choose a folder, paste the folder ID from its Drive URL. Google Picker requires a configured Cloud project/API key/OAuth setup not present in the supplied project.
- Remove moves the spreadsheet file to Google Drive Trash and removes it from the GWC Workspace registry. It does NOT irreversibly erase the file from Drive Trash. Permanent erasure should be done by an authorized Drive owner from Drive Trash.
- Google Sheets/Drive operations execute under the Google account that owns/authorized the Apps Script deployment. The owner must authorize the requested Drive and Spreadsheet scopes after updating Code.gs.
- Teacher/Sub-admin account permissions are GWC portal permissions. They do not automatically grant those people Google Drive file-sharing permissions. If a teacher needs to open the actual spreadsheet, the spreadsheet owner must also share that file with their Google account, unless it is already shared.
- Workspace feature requires deploying the updated Code.gs as a new Apps Script Web App version at the same deployment URL used by Render. Render must deploy the updated index.html and server.js.
- No production Apps Script/Drive/Sheets operation was run from this offline build environment.

PRESERVATION
- All 57 entries from the supplied V48.1 ZIP are retained in this archive.
- Existing index.html features remain in place; only the Workspace tab and its client calls were added.
- Existing Code.gs actions remain in place; Workspace action was added.
- Existing server.js routes remain in place; 'workspace' was added to the signed action allowlist.
- package.json and appsscript.json remain byte-for-byte unchanged.
- No login IDs, passwords, accounts, roles, course/batch data, fee records, settings, Firebase config, Apps Script URL, Render proxy secret or cloud data were reset or migrated.
- The V48.1 Meet and Fee Summary changes are retained.

OFFLINE VALIDATION
- ZIP integrity verified.
- All 33 inline JavaScript blocks passed Node.js syntax check.
- Code.gs and server.js passed JavaScript syntax check.
- package.json and appsscript.json parsed as valid JSON.
- Existing archive entries retained; only index.html, Code.gs and server.js changed, plus this README and test report.
- Live login, Google OAuth authorization, Drive folder operations, spreadsheet create/open, and role access were not live-tested.
