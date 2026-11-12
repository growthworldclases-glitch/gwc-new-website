GWC V32 — MONTHLY STUDENT-WISE TEACHER PAYOUT + FEE SLIP ARCHIVE
==================================================================

BASE / PRESERVATION
-------------------
Based on the supplied GWC_V31_MONTHLY_SALARY_MANAGEMENT_STAGED.zip.
Only index.html and this V32 README are changed in this package.
Code.gs, server.js, package.json, appsscript.json, prior README files and
existing IDs / Script Properties / deployment configuration are retained
byte-for-byte from the supplied V31 ZIP. No login IDs, passwords, courses,
students or account records are migrated, regenerated or intentionally edited.

V32 CHANGES
-----------
1. Salary Management is monthly, not daily.
2. Admin enters an individual monthly payable amount for EACH student-teacher
   assignment. One teacher may have many students, each with a different rate.
3. Admin can edit a saved assignment amount and its start/end dates.
4. Monthly payout is prorated by actual calendar days in the selected month.
   Formula: student monthly payable × assigned calendar days ÷ days in month.
5. Admin dashboard shows teacher totals and overall payable. Admin can open
   student-wise detail for any teacher.
6. Teacher My Payment shows only the teacher's monthly total and payment
   records; it does not show student-wise rates/details.
7. 50%, 100%, and custom percentage payment recording remains month-wise.
8. When the existing student course/teacher assignment is changed through
   supported Save Assignment / Edit Student flows, or a student is removed
   through the supported Remove Student flow, open salary assignments are
   closed on the change date. Historical assignments are retained. Admin
   should verify dates after unusual/manual data edits.
9. Fee Management is rendered as a selected Month/Year register. It reads the
   existing feeRequests[].slip and student slip records, shows admission date,
   course/teacher, fee validity period, fee total, teacher allocation estimate,
   organization balance estimate, and slip View / Replace / Archive actions.
10. Admin Replace uses the existing Google Drive upload + old-file archive
    workflow. Archive/Delete moves a Drive-backed slip into the existing
    GWC_Deleted_Items Drive folder; it does not immediately permanently erase it.
11. Admin opening Fee Management triggers archival of Drive-backed fee slips
    older than three calendar months. Files without a parseable Drive file ID
    are left untouched; failed Drive actions are logged to console and retried
    on a later visit.
12. Existing Help Desk archive handler is normalized to move a message into
    the existing in-app Deleted Items archive for Admin/Sub-admin actions.

IMPORTANT LIMITS / LIVE VERIFICATION
------------------------------------
- The assignment auto-close hook covers the named existing app flows. If data
  is changed directly in Google Sheets, by another app version, or through an
  unrecognized edit path, Admin must close the old assignment manually.
- Existing Google Drive archive action is used. Automatic 3-month archiving
  runs when an Admin opens Fee Management; it is not a scheduled background
  trigger. A Drive-backed URL with a recognizable file ID is required.
- Parent-side fee-slip upload remains the existing workflow; JPEG is supported
  by that workflow, and existing accepted formats are not forcibly restricted.
- The fee register derives month matching from existing fee request month /
  submission date and existing fee-period fields. Older records missing those
  fields may not appear as a fully populated month row.
- Help Desk message archive is fixed at the in-app handler level; this is not
  a live multi-device acceptance test.
- Browser session behavior, Render deployment, Apps Script permissions,
  Google Sheets sync, Drive upload/archive and all roles must be tested against
  a backup/test copy. This environment cannot sign into the user's live services.
- Salary records are accounting records only; this feature does not transfer
  money to a bank or payment gateway.
- The ZIP and JavaScript syntax are checked. Syntax/ZIP checks are not equivalent
  to a live Production end-to-end test.

DEPLOYMENT SAFETY
-----------------
1. Back up the current GitHub repository and Google Sheet before deploying.
2. Extract this ZIP and compare files. Keep the same existing Render environment
   variables, Apps Script deployment, Script Properties, spreadsheet ID and
   Drive folder ID.
3. As this is an additive front-end update, replace only index.html in the
   existing project. Do not create a new Firebase project or new Admin account.
4. Test with a copy / test teacher first:
   - assign two students to one teacher with different monthly amounts;
   - verify teacher total and Admin student-wise detail;
   - move/remove one student mid-month and verify previous teacher's dates;
   - record 50%, 100%, custom payment and switch month;
   - upload, replace, view and archive a test fee slip;
   - verify Help Desk Archive / Deleted Items and restore;
   - test Student, Teacher, Sub-admin and Admin logins.
5. Keep the V31 ZIP and original V30 ZIP as rollback backups.

VALIDATION
----------
All inline JavaScript blocks in index.html pass Node.js --check.
ZIP integrity test passes. No live Render / Google Apps Script / Google Drive
login or production data test was possible from this build environment.
