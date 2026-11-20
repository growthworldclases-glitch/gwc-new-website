GWC V48.1 — CONTROLLED ADDITIVE REPAIR
Base: User-uploaded GWC_V47_JOIN_CLASS_ACCOUNT_FLOW_REPAIR.zip

CHANGES IN THIS BUILD (index.html only)
1. Student Meet resolution now checks the student's assigned teacher (student teacher mapping if present, otherwise the assigned course teacher) before considering the course-level Meet URL as a fallback.
2. The existing direct HTTPS Google Meet handoff remains in place. It does not force Google AccountChooser.
3. Fee Summary no longer requires the Admin to select a month. It shows all currently loaded feeRequests in descending submission-date order, with month, student, amount, status and submitted timestamp.
4. Existing fee approval/rejection, reverse approval, archive/delete and WhatsApp reminder actions are retained. Upload/Replace action is exposed for every fee request. Archived slip URLs are shown as archived links where available.
5. Due-date actions remain available in the same Fee Summary screen.

PRESERVED
- Code.gs, server.js, package.json and appsscript.json are byte-for-byte unchanged from the uploaded V47 ZIP.
- All other original archive entries are retained.
- No login ID, password, account, role, course, batch, setting, Apps Script URL, Render proxy, database schema or security rule was intentionally changed.
- No cloud data was overwritten and no database migration was run.

IMPORTANT LIMITATIONS / NOT CLAIMED AS COMPLETED
- A website cannot silently choose or permanently bind a Google account inside Google Meet. The Google account session is controlled by Google/Android/Chrome. This build opens the assigned teacher's validated Meet URL directly and avoids forcing AccountChooser, but Google may still ask the user to select/sign in.
- Android Meet-app handoff and account persistence require testing on the actual device and Google account; they cannot be certified offline.
- Google Workspace sheet management (Google Picker, OAuth scopes, Drive folder selection, create/open/edit/delete spreadsheet, per-sheet role permissions) is NOT added in this controlled patch. It needs an explicit Google OAuth/Drive integration and server-side authorization design; a fake UI-only button would not work securely.
- A complete credentials directory / free-vs-filled batch availability board / forced-start date-only access bypass is NOT added in this patch. Those features need a careful review of the admission, student account, batch capacity and forced-access state rules before changing production data logic.
- Previously deleted/missing fee slip images cannot be recovered from this ZIP: the archive contains application source code, not the live Google Sheet/Drive contents or deleted Drive files. This patch displays historical fee request records and archivedSlipUrl values only if they are present in the cloud data loaded by the app. Drive Trash / GWC_Deleted_Items restoration must be done against the actual connected Google Drive account.
- Automatic monthly fee-cycle generation is not changed here. Existing fee-cycle rules and date calculations remain as in V47.

VALIDATION
- ZIP integrity checked after packaging.
- All 33 inline JavaScript blocks passed Node.js syntax checks.
- server.js and Code.gs syntax checked with Node.js.
- package.json and appsscript.json JSON parsing checked.
- Protected backend/configuration files compared with source archive and verified byte-for-byte unchanged.
- Live Render, Apps Script, Sheets, Drive, Android Meet handoff and production account sessions were NOT tested.
