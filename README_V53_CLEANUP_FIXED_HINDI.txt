GWC V53 – CLEANUP FIXED UPDATE
Base: GWC V52_STORAGE_BANDWIDTH_CLEANUP_UPDATE.zip (which itself is based on V51).

IMPORTANT FIXES
1. Google Drive cleanup no longer calls getFolder_() during scan. That old helper could create a new empty GWC_Uploads folder when the saved folder ID was missing, causing a misleading 0-file scan. The cleanup scan now resolves the existing folder by saved Script Property GWC_DRIVE_FOLDER_ID or a unique existing folder named GWC_Uploads. It refuses to proceed if none or multiple folders are found.
2. Scan includes nested folders under the existing GWC_Uploads folder (up to 8 levels / 2,000 files) and displays the relative path.
3. Archive rechecks that the selected file is actually inside that existing upload tree and is not referenced in current saved state.
4. Google Drive's DriveApp.setTrashed(true) does NOT perform irreversible permanent deletion. UI wording now says “Move to Drive Trash”; the response explicitly reports trashed=true, deleted=false.
5. Render bandwidth is not deletable. The app does not currently write files into /tmp/gwc-managed-cache, so its managed temporary file count can legitimately be zero. The Render section is a diagnostic only; it does not claim to erase Render monthly bandwidth. Render's official usage remains in Render Dashboard.

SAFETY / LIMITS
- Drive scan only examines the existing GWC_Uploads tree. A file not found in current state is a REVIEW candidate, not proof it is unused (historical messages, old links, external references may exist).
- Quarantine is reversible. Moving a file to Drive Trash is also reversible from Google Drive Trash; no irreversible deletion is implemented.
- Render static app files, source code, Apps Script data, Sheets, logins, fees, accounts and settings are not deleted.
- Deploy updated Code.gs as the existing Apps Script deployment, then deploy website files to the intended hosting. Preserve existing Script Properties and environment variables.
- Local ZIP checks cannot verify live Apps Script permissions, real Drive contents, or production hosting. Test with Admin on a staging/backup first.
