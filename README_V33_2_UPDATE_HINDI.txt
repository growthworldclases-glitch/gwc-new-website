GWC V33.2 — FIXED 30-DAY SALARY + FEE DUPLICATE / FREE SLOT / QR PATCH
=======================================================================

BASE
----
Built from the user-uploaded GWC_V33_1_FEE_DUPLICATE_SLOT_FIX.zip.
All 30 original ZIP entries are retained. Only index.html is modified; this report is
new. Code.gs, server.js, package.json, appsscript.json, prior README files, and all
existing Apps Script / Render configuration are unchanged. No live Google Sheet or Drive
data was modified while preparing this ZIP.

V33.2 CHANGES
-------------

1) Fixed 30-day salary cycle
- Salary proration now always uses a 30-day denominator, not the calendar month's 28,
  29, 30, or 31 days.
- Admin sets a Salary Date separately for each Teacher from Admin > Salary Management.
- The selected month's salary cycle is the 30 calendar days ending on that month's
  Salary Date (inclusive).
- Student assignment history still controls eligible days. A move / removal continues
  to use the relevant dated teacher-assignment segment.
- Each monthly salary record retains its own Salary Date, so later changes to a Teacher's
  next salary date do not silently change a previously saved month's cycle.
- Admin can deduct 0–30 days and must enter a reason when days are deducted.
- Net payable = gross payable × (30 − deducted days) ÷ 30.
- Teacher My Payment shows Salary Date, 30-day cycle, deducted days and deduction reason.
  Student-wise amounts remain hidden unless the existing Admin permission is enabled.
- Admin Salary Management shows unpaid salary due within 3 days and overdue items.

2) Fee-slip duplicate and repeated rejection handling
- After a successful month-wise parent slip attachment, the upload form is hidden and a
  clear already-uploaded message is shown. The existing duplicate guard remains active.
- Repeated rejected submissions are grouped by student/month. The first rejection record
  is retained; later repeated rejected entries can be archived from Admin Fee Summary.
- Where a Drive file ID is available, the extra rejected slip is moved using the existing
  Apps Script archivefeeslip action to the reversible "Deleted Fee Slips" folder.
- The original request audit data / archived URL is retained. These records are not
  permanently erased by this cleanup.
- Admin receives an "Admin Upload Fresh Slip" action in the repeated-rejection panel.
  Fresh upload uses the existing Admin upload / approval flow.

3) Old Available Slots recovery
- Permanent student removal now resolves the Login ID from the linked user or legacy
  Student fields and creates a released-slot record when an ID can be resolved.
- Legacy released records using alternate Login ID field names are normalized for display.
- Only IDs not currently occupied by a user are offered for reuse.
- Reused students still receive fresh Student details; old personal data is not copied.

4) Expired / revoked course access payment QR
- When Join My Class is unavailable because fee validity is expired or access is revoked,
  the Student My Course page now displays the configured default GWC payment QR image.
- QR is taken from the existing Admin Payment Settings (default QR); if no QR is configured,
  the page clearly asks the Admin to configure one.

PRESERVED
---------
- All original ZIP entries and their names.
- Existing Admin, Subadmin, Teacher, Student and Parent portals.
- Existing login/authentication, passwords, role permissions, settings, courses, batches,
  student assignments, Help Desk, message archive and session-revoke code.
- Existing Google Apps Script URL, Render proxy settings, spreadsheet / Drive integration,
  fee archive / restore actions and scheduled archive implementation.
- Existing fee, salary, payment, message and student records are not migrated or deleted
  while creating this ZIP.

VALIDATION PERFORMED
--------------------
- 22 inline JavaScript blocks extracted from index.html and passed Node.js syntax check.
- Code.gs passed Node.js syntax check.
- server.js passed Node.js syntax check.
- ZIP integrity test passed after packaging.
- Re-extraction test passed and the package contains all original ZIP entries plus this
  V33.2 report.
- Salary-cycle arithmetic was checked against fixed 30-day windows and the 30-day
  deduction formula.

NOT VERIFIED / DEPLOYMENT REQUIREMENTS
--------------------------------------
- Live Google Sheets / Drive operations, Apps Script authorization, Render deployment,
  actual user credentials, multi-device sync, and real Parent / Teacher / Admin sessions
  were not available for end-to-end testing here. This is source-level validated, not
  live-production-verified.
- The existing backend persists website state using its existing state model. This patch
  does not convert it to record-level database transactions or eliminate stale-browser
  overwrite risk.
- The existing "Deleted Fee Slips" archive requires the current Apps Script Web App version
  and Drive permissions. If a rejected slip URL has no resolvable Drive file ID, its URL and
  audit record are retained in the archive state, but the physical Drive file cannot be
  moved automatically.
- The QR image must already be configured in Admin Payment Settings.
- The existing three-month Drive archive trigger still requires the V33 Apps Script code
  to be deployed and installGwcDailyFeeTrigger() to have been run once with authorization.
- Keep existing Render environment variables, Apps Script Script Properties, Spreadsheet
  ID, deployment URL and proxy secret unchanged. Back up the live Sheet / Drive folder and
  test on a staging deployment before replacing production.

IMPORTANT
---------
No ZIP-only test can prove live Google backend deployment, account logins, Drive folder
permissions or multi-device sync. Do not call this live-production-verified until those
staging checks have passed.
