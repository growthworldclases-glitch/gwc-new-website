GWC SAFE ADDITIVE REPAIR V10 — MONTHLY FEE DATE + SYNC PATCH

FILES
- index.html: keeps the existing portal and adds teacher-scoped test visibility/results plus Admin fee-slip replacement/upload controls. Existing IDs, password records and Apps Script URL are not intentionally changed. Mobile sidebar includes existing Ask Your Doubt and Upload Today Notes entries.
- Code.gs: retains existing API actions, protects against overwriting invalid JSON, stages/verifies writes, and keeps one first-valid-state backup per day rather than creating a new backup tab on every save.
- server.js and package.json are included unchanged for completeness; no Render changes are required by this patch.

IMPORTANT LIMITS
- Student records now support a separate nextPaymentDate field, Admin-editable per student. Legacy students without that field continue using the existing monthlyPaymentDate fallback. Approval uses the selected future due date as the current cycle end; if it is missing or already past, the existing 30-day fallback is used. The student portal displays next due date/status and Join My Class is guarded by active approved-period checks.
- The Apps Script daily trigger checks nextPaymentDate when present and still preserves legacy fee-period handling. Set the Apps Script project timezone to Asia/Kolkata before installing/reinstalling the daily trigger. Run installGwcDailyFeeTrigger() once manually after deployment; it replaces duplicate triggers for the same handler.
- JSON safety cannot be guaranteed against every Google Sheets/API/runtime failure. This patch refuses to overwrite an invalid primary JSON, but it does not magically repair a previously truncated primary state. Keep Google Sheets version history and make a separate spreadsheet copy before deploying.
- Reminder banners are shown in the portal from the per-student nextPaymentDate. A daily Apps Script trigger is not a real-time SMS/WhatsApp sender; external notifications require a notification provider. This patch does not promise SMS/WhatsApp delivery.
- Apps Script/Drive/Sheets/Render live services were not available for end-to-end verification. Test with a non-critical student/slip first.

SAFE DEPLOY ORDER
1. Make a copy of the restored spreadsheet and verify records.
2. In the EXISTING Apps Script project, replace Code.gs only; keep Script Properties (GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID), deployment URL and access settings. Deploy as a new version.
3. Replace index.html in the same GitHub repository. server.js/package.json are included unchanged; no need to replace them unless your repo files differ.
4. Test /api/gwc?action=loadmeta, Admin login, teacher login, a test assignment, and slip replacement using a non-critical test record. Confirm the old slip appears in GWC_Deleted_Items before approving a payment.
5. Check a student with an existing approved fee period before relying on automatic expiry. Test a future nextPaymentDate and verify reminder at T-3 days, pending-slip access lock, approval, due-date edit, and Join My Class lock. Confirm the Apps Script project timezone is Asia/Kolkata.
