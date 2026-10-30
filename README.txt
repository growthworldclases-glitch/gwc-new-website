GWC STABLE CLOUD SYNC & DATA RECOVERY — V17
Build date: 30 October 2026
Reference state: 17:56 workbook (user-designated correct copy)
Base package: GWC_MONTHLY_FEE_CYCLE_FORCE_ACTIVE_V15(1).zip

WHAT CHANGED
1. The existing index.html UI and existing portal feature code are retained; the cloud API bridge now uses google.script.run when the website is served by Apps Script.
2. Apps Script doGet serves the website when opened without an action. GET actions continue to return JSON for the legacy proxy.
3. Empty/invalid Cloud State is never treated as permission to initialize a blank database.
4. Saves require the server-issued revision. Stale writes are rejected (compare-and-swap).
5. Core collections (courses/users/students) cannot be changed from populated to empty by a normal save. Extreme core-record reduction is also blocked.
6. Payloads are split into Unicode-safe 24,000 UTF-16 code-unit chunks. Per-chunk SHA-256, total chunk count, payload SHA-256, revision, exact read-back and JSON parsing are checked.
7. Stage verification occurs before primary mutation. A previous-state Drive snapshot is required before commit. A prepared snapshot and pending-commit marker support recovery if execution is interrupted during primary commit.
8. A primary read-back mismatch triggers best-effort rollback to the previous verified payload.
9. Immutable Drive recovery snapshots are created for each successful save's previous state and prepared next state; hourly trigger snapshots changed payloads. No automatic deletion is implemented.
10. The existing Monthly Fee Cycle, Force to Start Batch, Meet-link, login and portal logic remain in the app. Existing daily fee trigger handler is retained.
11. A separate Apps Script HTML hosting mode removes the requirement for Render/Node hosting. Existing server.js/package.json remain in the ZIP for backward compatibility if the old proxy is still in use.

IMPORTANT RECOVERY FACTS
- The 17:56 GWC_Storage payload is valid JSON, 158,203 characters, 165,336 UTF-8 bytes, 6 chunks, SHA-256 4c824ee56b9196c37588b742cc24d3ac068c3435c735d8c4229ea0e6df2edb98.
- It contains 80 courses, 68 users, 34 students, 1 fee request, 300 audit records, 2 homework records, 1 doubt and 1 trash record.
- 04:32 backup GWC_Storage_Backup_20261030_11 is valid JSON, 133,454 characters, 5 chunks, with the same ID sets for all 80 courses, 68 users and 34 students; it has 170 audit records.
- The 06:16 primary and stage each contain only a 301-character default state with zero courses/users/students. Do not restore either of these sheets.
- The 06:16 workbook's old 29-Oct backup has a literal #ERROR! segment inside one chunk; do not use it as the primary recovery source.
- No actual live spreadsheet was modified by this build.

DEPLOYMENT: GOOGLE APPS SCRIPT HOSTED MODE (NO RENDER/NODE HOST REQUIRED)
1. Keep a separate copy of the live Google Spreadsheet before any recovery or deployment.
2. In the existing Apps Script project attached to the current GWC Web App URL, replace Code.gs with this ZIP's Code.gs.
3. Add an Apps Script HTML file named exactly "index" and paste this ZIP's index.html into it. Apps Script editor stores it as index.html internally; use the name index in the Add HTML dialog.
4. Keep existing Script Properties GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID unchanged. Verify GWC_SPREADSHEET_ID points to the spreadsheet containing the 17:56 state. Do not paste IDs into public logs.
5. In the spreadsheet, restore only the verified 17:56 rows into GWC_Storage and GWC_Storage_Stage if the current live sheet is still the 06:16 blank version. Best approach: make a copy of the 17:56 workbook and use its GWC_Storage as the source. Never copy the 06:16 GWC_Storage or GWC_Storage_Stage over the correct data.
6. Do not delete or rename any existing backup tabs. Keep GWC_Storage_Backup_20261030_11 (04:32) and the 17:56 workbook's backup tabs intact.
7. In Apps Script Project Settings set timezone to Asia/Kolkata. Save the project.
8. Deploy > Manage deployments > Edit the EXISTING Web App deployment > select New version. Keep the existing deployment URL if possible and keep the intended access setting. If the existing URL is different from the one in index.html/server.js, update only after verifying which deployment is authoritative.
9. Open the Web App URL without ?action=...; it should serve the website. The page should show Google Sheets connected. Test Admin, Teacher and Student logins using the existing credentials, without changing them.
10. In Apps Script editor run installGwcV17Triggers() once and authorize. This installs daily fee expiry and hourly recovery snapshot triggers. Check Executions for success.
11. Confirm the first Admin save increments revision, creates PRECOMMIT/PREPARED Drive snapshot files in GWC_Recovery_Backups, and returns matching hashes.
12. Keep the old Node/Render proxy only if you continue hosting the static site there. It is not required in Apps Script-hosted mode.

RECOVERY RULES
- Preferred live source: GWC_Storage from the user-designated 17:56 workbook.
- Secondary historical source: GWC_Storage_Backup_20261030_11 (04:32) from the 17:56 workbook.
- Do not overwrite the good 17:56 data with the 16:44 snapshot unless a later validation shows the 17:56 payload is corrupt.
- Do not copy Sync Log or the 06:16 default state over good storage.
- Do not delete Stage or backup sheets during recovery.
- If the live spreadsheet contains later legitimate updates than the 17:56 workbook, preserve/export those before restoring. The uploaded workbook is a point-in-time copy, not proof of current live contents.

LIMITS / HONEST STATUS
- Offline syntax, JSON, chunking, hashes and workbook comparisons are tested in this package.
- Live Apps Script, Google Drive permissions, Script Properties, deployment URL, quotas, triggers, login, Meet links and actual live restore were not accessible here and remain unverified.
- Five-year retention is configured as no-auto-delete snapshots, but actual duration depends on Google Drive account storage, quotas, ownership and permissions. Monitor Drive capacity; no ZIP can guarantee five years of cloud retention.
- Hourly snapshots are deduplicated when payload hash has not changed. A new immutable snapshot is created for each changed hourly checkpoint and each save.
- Existing app login checks are client-side in the legacy app. V17 does not claim to solve that separate authentication/security issue; before public production, add server-side role/session authorization and restrict who can invoke state-write methods.
- Notifications shown in the app are not SMS/WhatsApp delivery unless a provider is configured.

LOGIN SAFETY
The login form is blocked until a verified cloud state is loaded. This prevents the HTML fallback/default object from being used as an active login database when Google sync is unavailable. Once the saved 17:56 state is loaded, the existing saved Admin/Teacher/Student/Sub-admin credentials are used unchanged.

DEPLOYMENT URL FINDING
The URL literal in index.html differs from the default GWC_API_URL in server.js by one character in the deployment identifier. The current index.html proxy request uses /api/gwc, so server.js's URL is the actual upstream in legacy proxy mode. Do not guess which URL is authoritative. V17's Apps Script-hosted mode uses google.script.run in the project serving the page and avoids this split. If legacy proxy mode is retained, set the GWC_API_URL environment variable to the confirmed authoritative Web App deployment URL.
