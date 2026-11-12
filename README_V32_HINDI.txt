GWC V32 — MONTHLY PER-STUDENT SALARY + HELPDESK INBOX ADDITIVE PATCH
======================================================================

Base: GWC_V31_MONTHLY_SALARY_MANAGEMENT_STAGED.zip
Preservation: Code.gs, server.js, package.json, appsscript.json, existing README files,
existing login/authentication code, IDs, passwords, courses and existing data schema
are unchanged. Only index.html receives the additive V32 patch and this README is new.

V32 additions
-------------
1. Salary Management auto-lists existing non-deleted students when a teacher can be
   resolved from the student's teacherId or assigned course's teacherId.
2. Admin enters/edits each student's monthly teacher-payable amount individually.
   Existing student amount fields are used as a starting value when present; otherwise
   the amount is zero and explicitly marked Needs verification. No invented rate.
3. One teacher can have multiple assigned students. Monthly teacher payable is the
   sum of each student's per-month amount, prorated by dated assignment days.
4. On subsequent normal save() calls, a detected student teacher/course change closes
   the prior open salary assignment on the change date and opens a new dated assignment.
   A detected removal closes the prior assignment. Admin can manually close a row
   with a last teaching date.
5. Admin sees teacher-wise and overall month totals, student-wise details, can verify
   assignment amounts, and can enable/revoke student-wise visibility for a teacher.
   Teacher My Payment otherwise shows total monthly amount only.
6. Existing 50%, 100%, and custom-percent payment record flow is retained.
7. Help Desk dashboard Hide now marks a message as archived for that user while keeping
   the underlying conversation. Dashboard Archive / Unhide can restore visibility.
8. Dashboard inbox adds search and Go to Chat wording. Admin's active chat header adds
   a permanent-delete action for that conversation.

Important limitations — NOT certified production-final
-------------------------------------------------------
A. The V32 patch does NOT yet implement a complete new parent/admin JPEG fee-slip
   upload/replace/delete pipeline. It retains the existing fee slip workflow.
B. It does NOT implement a verified Google Drive time-trigger that moves fee slips
   older than three months into a Drive archive folder. This needs the actual Drive
   folder ID, Apps Script deployment/authorization and live Drive tests; no IDs or
   credentials were changed or guessed.
C. It does NOT remove the old admission-form cycle field or fully replace all legacy
   fee-cycle buttons. Those changes require reviewing and migrating the live fee
   data/Google Apps Script routes, and are not safe to simulate in the browser.
D. Automatic roster reconciliation runs on subsequent save() calls and can only infer
   move/removal from the currently available student/course teacher fields. If your
   app represents assignments in another field or uses a soft-delete state not named
   "deleted", confirm on a copied test sheet before production.
E. Existing historical teacher/student assignment history cannot be reconstructed
   accurately if it was never stored. Auto-listed existing students start from their
   admissionDate/createdAt (or build date fallback); verify each amount and date.
F. No live Render, Google Apps Script, Google Sheets, Google Drive or parent-device
   integration test was possible in this build environment.

Validation performed
--------------------
- ZIP archive integrity check.
- Node.js syntax check for every inline JavaScript block in index.html.
- Original non-index project files are byte-for-byte preserved from V31.

Deployment safety
-----------------
1. Do not overwrite production first. Make a copy of the GitHub repository and Google
   Sheet/Drive data, then deploy this ZIP to a staging Render service.
2. Test Admin and Teacher login, one existing student, one student move, one removal,
   month totals, payment percentages, dashboard hide/unhide, chat search and permanent
   deletion on disposable test records.
3. Check all Google Apps Script/Drive features against the staging spreadsheet.
4. Promote only after successful real-device and cloud-sync tests.
