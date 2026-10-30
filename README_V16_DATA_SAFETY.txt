GWC_MONTHLY_FEE_CYCLE_FORCE_ACTIVE_V16 — DATA-LOSS SAFETY PATCH

IMPORTANT FINDING FROM THE PROVIDED FILES
- The 04:32 workbook's GWC_Storage and GWC_Storage_Stage contain valid, populated state (about 133k JSON characters: 34 students, 68 users, 80 courses, 170 audit entries).
- The 06:16 workbook's primary GWC_Storage and GWC_Storage_Stage contain only a 301-character default state with zero students, users, courses, fee requests, or audit records.
- The 06:16 workbook's backup sheet still contains a populated older snapshot (34 students, 68 users, 80 courses, 117 audit entries).
This strongly indicates a valid default/empty state was saved over the populated primary, rather than the workbook simply being hidden or the browser cache resetting. The supplied files cannot prove which client/process initiated that save.

V16 SAFETY CHANGES
1. Apps Script rejects a save that would wipe a populated state or reduce the record count to less than 25% of the current count. This is a deliberate safety lock; mass deletion must be reviewed and done in smaller batches after backup.
2. Creates an immutable hourly snapshot of the current primary state before an accepted write. It does not reuse/overwrite an existing hourly backup.
3. If post-write verification fails, it attempts to roll the primary back to the prior state and returns an error instead of reporting success.
4. The website no longer automatically initializes cloud storage with browser defaults when the server returns no state.
5. Startup/retry refuses an empty/default cloud state and does not upload it. Live polling also refuses to replace populated local state with an empty cloud response.
6. Existing site files, login flow, API URL, and fee/force-access features are retained. No live credentials or data are embedded from the supplied spreadsheets.

RECOVERY FIRST — DO THIS BEFORE DEPLOYING
A. Make a copy of the current Google Spreadsheet.
B. Open the known-good 04:32 spreadsheet. In the actual live Google Spreadsheet, restore the data from the 04:32 GWC_Storage sheet and GWC_Storage_Stage sheet. Copy all cells including the header and all chunk rows as literal values; ensure each json_chunk cell retains its full text. Do not copy the 06:16 empty primary over the good version.
C. Verify the live GWC_Storage has the same number of rows/chunks as the 04:32 version and the state includes the expected students/courses/users. Do not paste passwords into support chats.
D. Deploy this ZIP's website files to the existing website host, preserving the existing environment variables and API URL.
E. Open Apps Script, replace Code.gs with this ZIP's Code.gs, save, and deploy a NEW version of the existing Web App deployment. Preserve the existing GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID Script Properties and existing deployment URL. A ZIP upload alone does not update Apps Script.
F. Test one admin edit, one student login, one Force to Start Batch action, and confirm green sync. Check the spreadsheet backup sheets after a save.

IMPORTANT LIMITATION
This package cannot access or change the live Google Drive/Sheets/Apps Script/Render deployment. It has been syntax- and ZIP-validated locally, but live cloud sync must be tested after deployment. Keep both supplied workbooks and a separate copy of the live spreadsheet until verification succeeds.
