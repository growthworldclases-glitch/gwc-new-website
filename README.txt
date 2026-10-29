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


MONTHLY FEE CYCLE PATCH (additive)
- Admin Student Edit/Update now includes Monthly Payment Date, Next Payment Date and Total Monthly Cycles.
- Fee approval asks the Admin to confirm/edit a future Next Payment Date; each student's date is stored on that student record.
- Fee Summary adds Admin Upload & Approve and Edit Cycle / Due Date controls. Existing fee request records/history are retained; replacing a slip archives the old Drive file where possible.
- Student portal reminder is shown exactly 3 days before the due date; pending slip blocks Join My Class until approval.
- After copying Code.gs into the existing Apps Script project, save and deploy a new version of the same Web App. In Project Settings, set the project time zone to Asia/Kolkata, then run installGwcDailyFeeTrigger() once and authorize it. The daily trigger is a fallback; student portal checks the due date directly too.
- IMPORTANT: test with a backup/copy first. The HTML's Google sync uses the existing Render /api/gwc proxy; Code.gs alone is not enough if that proxy is not deployed or its environment is misconfigured. Uploading a file to Drive and saving its URL into the app state are separate operations, so verify both in the live site before production use.

CYCLE DATE / APPROVAL REVERSAL REFINEMENTS
- Student Edit/Update has a Default Monthly Payment Date selector (1–28) instead of an editable arbitrary Next Payment Date. On save, the student's next due date is calculated independently from that fixed day; where a current approved period exists, its end date is adjusted to that due date when valid.
- Fee approval prompts Admin to confirm/change the next due date (YYYY-MM-DD). A renewal period begins at the prior approved period's end date if that end is still in the future, so a period ending 3 Nov can roll forward to 3 Nov–3 Dec when the next cycle is approved with due date 3 Dec.
- Approved payment rows include Reverse Approval. Reversal is soft: request status becomes reversed and the corresponding fee period gets reversal metadata; fee request and slip history remain in the saved state. Access is recalculated from remaining non-reversed periods.
- Student portal shows APPROVED CLASS TILL (current valid period, or latest remaining approved period) and Default Monthly Payment Date. Admin Fee Due list uses each student's own nextPaymentDate and includes due-within-3-days/overdue students unless they already have a pending slip.
- Reversal and historical fee periods are retained in state; calculations ignore periods marked reversedAt rather than deleting them.
- Notification limitation remains: the portal can show the exact T-3 reminder and Admin Fee Due list. Automated SMS/WhatsApp delivery while the student is logged out is not configured in this project and must not be claimed as delivered.


GWC V11 ADDITIVE FEATURES
- Admin Students & Fee Discounts table includes Force Active. Admin selects inclusive Start Date and End Date; the student's Join My Class action is temporarily available only inside that date range. Admin Paused still takes priority.
- Student creation/edit supports Admin-selected first-cycle start and due/end dates. Fee approval records the selected cycle range; the following renewal begins at the previous approved period end date.
- The daily Apps Script expiry handler also respects an active Force Active date range.
- Browser JavaScript syntax was checked with Node.js. This package has not been tested against the user's live Render deployment, Apps Script project, Google Sheet, Drive, or actual Meet account.


V11 FINAL REPAIR PASS (2026-10-30)
- Kept the existing portal HTML, IDs/password records, settings, API proxy URL, Apps Script actions, and existing UI/features intact; only additive/focused fixes were applied.
- Admin Students & Fee Discounts now labels the per-student date-range switch “Force to Start Batch”. It retains the admin-selected inclusive start/end dates and respects Admin Paused.
- Force-to-Start-Batch student rendering removes any pre-existing Join button before adding its single Join My Class button, preventing duplicate Join actions.
- Forced access resolves the assigned course's explicitly assigned teacher first, then falls back to the existing class/section teacher lookup; it uses that teacher's saved Meet URL (course Meet URL only as fallback).
- Fee approval renewal default now calculates one calendar month after the selected cycle start when the saved due date is not later than the start. This avoids a renewal prompt defaulting to the same date as the prior cycle end and failing date validation. The admin can still edit the due date before approval.
- Force batch default date uses the browser's local calendar date rather than UTC date conversion.
- Validation performed locally: Node.js JavaScript syntax check passed; archive contents and source files inspected. No live Apps Script/Sheets/Drive/Render/Google Meet credentials or deployment were available, so production sync, notification delivery, and real account behavior must still be tested in the existing deployment.
