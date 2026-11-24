GWC_MONTHLY_FEE_CYCLE_FORCE_ACTIVE_V15.zip

V15 fixes the reported cloud sync / staging verification and Force to Start Batch visibility issues while retaining the existing app files, login flow, credentials in saved state, and legacy modules.

Changes:
1. Google Sheets storage chunks are written with a literal-text sentinel (GWC_CHUNK_V1:) so a chunk beginning with '=' or other formula-like content is not evaluated by Sheets. Reads support both old unprefixed chunks and the new prefixed chunks. Staging and final primary writes are verified before reporting success. The primary data is not changed if staging verification fails.
2. Force Active takes precedence for the student My Course view during its selected start/end dates and displays exactly one Join My Class button.
3. Forced Join My Class opens the assigned teacher's saved Meet URL. If that URL is missing/invalid, a clear message is shown.
4. When Force Active expires or is disabled, force-only UI is removed and access falls back to the student's actual approved fee period; a stale force access flag is not allowed to keep access open.
5. Save failures are kept visible and the live poll does not overwrite unsynced local edits. Retry sync attempts to save the current state again.
6. Existing cloud endpoint, server.js, package.json, IDs/passwords in existing stored data, and the rest of index.html / Code.gs remain in place.

Deploy carefully:
- Back up the live Google Sheet and current app first.
- Deploy the full ZIP to the same app and keep the existing Apps Script URL and GWC_SPREADSHEET_ID Script Property.
- Replace/redeploy the Apps Script Web App with the included Code.gs if the backend uses Apps Script. Ensure the deployment version is updated; a ZIP-only website redeploy will not update Apps Script code.
- Test with one test student: turn Force to Start Batch on for today's date and a future end date, wait for green sync, refresh/login as the student, and verify exactly one Join My Class button. Disable Force Active and verify that forced-only access disappears unless the fee period is approved.

Validation: HTML JavaScript and server.js syntax checked; Code.gs syntax checked with Node parser. ZIP integrity checked. Live Google Sheets/Apps Script/Render behavior cannot be tested from this local environment. If staging still fails after redeploying Code.gs, inspect the exact error and GWC_Storage_Stage sheet permissions/values; do not delete the primary storage sheet.
