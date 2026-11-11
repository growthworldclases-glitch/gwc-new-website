GWC V31 — TEACHER SALARY MANAGEMENT ADD-ON (STAGING)
====================================================

Base archive:
GWC_V30_TEACHER_ROSTER_DASHBOARD_REPAIR.zip

WHAT CHANGED
------------
Only index.html has been additively extended. All original V30 files are retained
unchanged. No existing login IDs/passwords, role records, course records, fee
records, Apps Script deployment URL, spreadsheet ID, Drive folder ID, Render
environment variables, or security secret values were edited.

New Admin menu:
- Salary Management
- Select month.
- Set each assigned student's teacher payable rate in rupees per student per day.
- Monthly payable is calculated from recorded daily student-to-teacher assignments.
- Teacher changes / student add / removal are captured when the normal app save()
  operation runs. The event date is used as the effective date.
- Admin can view student/course-wise calculation, save rates, and record 50%, 100%,
  or custom percentage payment with paid date and reference.
- Admin can open a payment statement and save it as a JPEG.
- Teacher menu: My Payment. Teacher sees monthly total and own verified payment
  history only; student-wise detail is not shown to teachers.

CALCULATION
-----------
Daily teacher payable = sum of the configured daily rate for each student assigned
to that teacher on that date.
Monthly payable = sum of daily teacher payable for each calendar day.
Example: one assigned student at Rs 30/day for 30 days = Rs 900.
For two class assignments, the student/course assignment is counted separately.

IMPORTANT LEDGER LIMIT
---------------------
This add-on initializes the roster baseline on the first run after installation.
It cannot reconstruct student/teacher movements that happened before that date.
Past months before the baseline date therefore cannot be treated as verified
historical salary records. For reliable month-wise calculation, install on a
test copy first, then begin recording changes through the app's normal save flow.
If multiple teacher assignments are stored in unusual legacy fields, validate
with a test teacher and test students before using for actual payment.

NOT INCLUDED / NOT CLAIMED AS FIXED
-----------------------------------
The following parts of the request require separate backend and live-service
verification and are NOT completed by this staging ZIP:
- Replacing the existing fee-cycle model with date-range-only monthly access.
- Complete monthly fee-slip replacement/deletion UI and JPEG-only enforcement.
- Three-month automatic Drive archival/deletion trigger and Drive folder lifecycle.
- Full audit/fix of Help Desk hide-message behaviour.
- Cross-device persistent login until user/Admin logout. Existing saved-login
  restoration is preserved; this add-on does not change its expiry/session rules.
- Live Render, Apps Script, Sheets, Drive, login and all-role end-to-end testing.

DEPLOYMENT SAFETY
-----------------
Do not overwrite the live deployment directly. First duplicate the GitHub branch
and Google spreadsheet or use a test deployment. Upload only index.html from this
ZIP for the salary add-on test; keep the existing Code.gs, server.js, package.json,
appsscript.json, Render environment values and Apps Script properties unchanged.
Test Admin and Teacher accounts, teacher reassignment, student removal, monthly
rate edits, partial payment, JPEG statement and teacher visibility before release.

CHECKS PERFORMED
----------------
- New V31 inline script passes Node.js syntax check.
- Existing server.js passes Node.js syntax check.
- Existing Code.gs passes Node.js syntax check after copying to a .js filename.
- No live service credentials or connected Google account were available, so
  real login, persistence, Drive uploads, automatic triggers and Render behaviour
  have not been certified.
