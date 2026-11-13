GWC V33.1 — FEE DUPLICATE GUARD + ASSIGNED STUDENTS CONSOLIDATION
===================================================================

BASE
----
This package is based on the user-uploaded GWC_V33_MONTHLY_SALARY_FEE_ARCHIVE_SESSION_UPDATE.zip.
All existing ZIP entries are retained. Only index.html and this update report are changed.
Code.gs, server.js, package.json, appsscript.json and prior README files are unchanged.

V33.1 ADDITIONS
---------------

1) Parent duplicate fee-slip guard
- In the month-wise parent JPEG slip section, a second upload is blocked after a slip
  has successfully been attached for that student/month.
- Parent sees a clear "already uploaded" message and is directed to Admin for replacement.
- In the admission/renewal fee request flow, another request for the same student/month
  is blocked while an earlier request is Pending or Approved.
- A fresh upload remains possible after rejection.

2) Repeated rejected slip archive
- Admin Fee Summary shows an archive control when the same student/month has multiple
  rejected requests.
- The oldest rejected record is retained; subsequent repeated rejected entries are marked
  archived_rejected and their Drive slip is sent through the existing archive action when
  the Drive file ID can be resolved.
- The archive preserves the request audit data; it does not erase history.
- Admin can request a fresh fee slip after rejection.

3) Assigned Students consolidation
- The standalone Fee Management sidebar entry is hidden.
- The month-wise Fee Register is rendered within Admin > Assigned Students.
- Free Login ID slots are also surfaced in Assigned Students.
- The old Admissions & Payment Slips sidebar shortcut is hidden; existing admission
  functions and stored records are retained in source for compatibility.

4) Legacy available Login ID recovery
- Old inactive student login accounts that have no Student record and no Trash record
  are displayed as candidates requiring Admin review.
- Admin can explicitly release a candidate through the existing orphan-release action.
- Once released, the ID appears in Old Available Slots and can be reused only when no
  active account currently occupies that username.
- Active or Trash student accounts are not automatically released.

PRESERVED
---------
- All original ZIP entry names and source files.
- Login/authentication code, IDs, passwords, roles, courses, batches, assignments,
  Google Apps Script URL, Render proxy configuration and existing spreadsheet data.
- Existing Salary Management, salary ledger, payment receipt, message archive, session
  revoke, fee-slip Drive archive and existing portals.
- No live Google Sheet or Drive data was modified while preparing this ZIP.

VALIDATION
----------
- 20 HTML script blocks extracted and passed Node.js syntax validation.
- Code.gs copied to a temporary .js file and passed Node.js syntax validation.
- server.js passed Node.js syntax validation.
- ZIP integrity test passed after packaging.

NOT VERIFIED / IMPORTANT
------------------------
- This is source-level validation only. Live Google Sheets, Drive permissions, Apps Script
  deployment, Render deployment, real parent/teacher/admin logins and multi-device sync
  were not accessible in this environment.
- Existing Google Apps Script backend uses the existing state persistence model. This
  update does not claim to implement true record-level database transactions.
- Three-month automatic Drive archive still requires the V33 Apps Script deployment and
  one-time execution of installGwcDailyFeeTrigger() as described in README_V33_UPDATE_HINDI.
- The repeated-rejected archive action needs the existing Drive archive permission and
  only moves a file when a Drive file ID can be resolved from its slip URL.
- Do not deploy directly over production without first backing up the current Render
  source and Google Sheet / Drive data. Test the updated ZIP on a staging copy first.

DEPLOYMENT
----------
1. Keep existing Render environment variables, Google Script Properties, Spreadsheet ID,
   Apps Script deployment URL and proxy secret unchanged.
2. Deploy updated index.html and unchanged server.js to the existing Render service.
3. Keep Code.gs unchanged unless it has not yet been deployed from V33. In that case,
   deploy the V33 Code.gs using the same Apps Script project and existing Script Properties.
4. Run installGwcDailyFeeTrigger() once only if the V33 trigger has not already been installed.
5. On staging, test parent duplicate upload, rejection and fresh resubmission, Admin archive,
   Assigned Students monthly register, Free Login ID review/release, and all role logins.
