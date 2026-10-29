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


GWC V11.1 SAFE ADDITIVE REPAIR — MONTHLY FEE CYCLE
=================================================
Added to index.html:
- Admin-only Student-wise Monthly Fee Cycle table in Fee Summary.
- Per-student Next Payment Date edit; one student's date does not alter others.
- Student My Course displays current cycle, next due date, fee status and pending approval state.
- Admin can replace/upload a slip, archive/remove the active slip while retaining slip history and the original payment request.
- Join My Class remains guarded by approved active cycle, pause flag and existing Google Meet validation.
- Cloud sync badge continues to report actual backend save success/failure; the existing retry/check connection control is retained.

Added to Code.gs:
- Daily expiry processing respects cycleAccessEndDate overrides after an Admin changes a student's due date.
- Daily trigger creation remains idempotent (previous trigger with same handler is removed before creating another).
- Batch sheet writes, staging verification and daily backup behavior are retained.

REQUIRED ONE-TIME DEPLOYMENT CHECKS
-----------------------------------
1. In Apps Script Project Settings, set Time zone to Asia/Kolkata.
2. Confirm Script Property GWC_SPREADSHEET_ID points to the EXISTING spreadsheet with GWC_Storage; do not create a blank sheet.
3. Deploy the updated Code.gs as a Web App (Execute as Me, access setting as required by your existing deployment).
4. Run installGwcDailyFeeTrigger() manually once from Apps Script editor and approve permissions.
5. Redeploy/update the existing Node/Render service from this ZIP if the website uses /api/gwc as its proxy.
6. Test with a test student: set due date, submit a slip, verify access remains off while pending, approve, then test date expiry and Sync error/retry.

IMPORTANT LIMITATION
--------------------
Apps Script time-based triggers run approximately within their scheduled window, not at an exact second. The browser also enforces the same due-date rule at Join My Class time, so expired access cannot be used merely because the daily trigger has not run yet. SMS/WhatsApp notifications are not sent without a configured notification provider; the portal reminder is shown in the website.
