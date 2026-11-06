GWC V18 — DEMO, ADMISSION INTEREST & TEACHER ONBOARDING WORKFLOW
================================================================

BASE / PRESERVATION
- Built directly on the uploaded New.zip archive. The existing index.html, server.js,
  package.json and Code.gs are retained; only the additive Demo Management block in
  index.html and the demo documentation are updated.
- Existing Admin/Sub-admin/Teacher/Student login flows, stored usernames/passwords,
  settings, page styling, fee-cycle logic, Force-to-Start-Batch logic, Google proxy,
  Apps Script storage code and existing modules were not intentionally rewritten.
- Existing state properties and old Demo records remain in the saved state. New
  properties are additive: demoInterestedAdmissions and demoPendingOnboarding.

NEW DEMO WORKFLOW
1. Admin/Sub-admin opens Demo Management.
2. Enter one or more parent mobile numbers (one per line or comma-separated), select
   Lead Date, optionally select Demo Date/Time and Subject, and optionally select a
   Demo Teacher. Click "Date Save for Demo". A separate student Demo ID and teacher
   Demo ID are allocated for each mobile lead. If no teacher is selected, the record
   remains "Currently not selected" and can be completed later.
3. A selected regular teacher is still represented as a Demo Teacher for this demo
   and receives a separate Demo Teacher ID. There is no "Existing Teacher" type
   selector. Teacher assignment can be changed later through Edit Details.
4. After the demo, Admin/Sub-admin can manually set status to "Demo Done" or
   "Admission Call Pending". Feedback Remark is optional, not mandatory. Demo
   details remain editable after allocation.
5. Student Demo Portal feedback offers Yes / Maybe / No. Yes or Maybe opens the
   admission-interest form with Student Name, Class, School Name, Father Name,
   Class Time Required, WhatsApp Phone Number and Full Address. Submission places
   the record in Admin's "Demo Interested for Admission" list.
6. No opens "Do You want next Demo with Another Teacher?" with Yes / No choices.
   Yes clears the previous teacher assignment so a different Demo Teacher can be
   selected later; No marks the lead as not interested.
7. "Students Assign for Class" moves/creates the record in "Demo Interested for
   Admission". Admin can then collect/complete parent details and select course/batch
   from "Parents Details / Finalize Admission". This step does not silently issue a
   regular student login; use the existing regular admission/account approval flow.
8. "Confirm Teacher" creates a "Pending for Onboarding" item. Admin completes name,
   mobile, class, section, batch/course, Meet URL, Login ID and Password. Saving
   creates or updates the regular teacher account, assigns the selected course's
   teacher, and makes the teacher available through the existing Teacher login.
   The onboarding item can be reopened to edit teacher details and credentials.
9. Demo Management also shows assigned teachers and their students, including each
   student's class and mobile number.

ID / LOGIN NOTES
- New student demo IDs use DMS0001 onward; new teacher demo IDs use DMT0001 onward.
- Demo Portal IDs remain demo-only and passwordless, as in the prior add-on; they do
  not grant access to regular student or teacher accounts. Avoid putting sensitive
  personal data in the demo portal.
- Regular teacher login ID/password are editable in the Pending for Onboarding edit
  form. Existing regular teacher accounts and their credentials are not reset by
  this add-on.

IMPORTANT LIMITATIONS / DEPLOYMENT
- This is a browser-side additive workflow using the existing whole-state Google
  save mechanism. It is not a transactional multi-admin database. For simultaneous
  admin editing, refresh before making changes and verify the save/sync indicator.
- The demo join counters count button clicks, not verified Google Meet attendance.
- WhatsApp numbers are recorded; this build does not silently send WhatsApp messages.
  Outbound automated messages require a configured WhatsApp Business API and consent.
- Deploy the website files to the same host and preserve the existing GWC_API_URL.
  If Apps Script is used, deploy the included Code.gs as a new version of the existing
  Web App, preserving GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID, spreadsheet data and
  deployment URL. A ZIP upload alone does not update Apps Script.
- Back up the current website and Google Spreadsheet before deployment. The V17
  reset lock intentionally refuses cloud writes if the primary GWC_Storage is empty;
  restore a verified populated backup before testing if that lock is active.
- Local checks performed: ZIP integrity, inline browser JavaScript syntax, server.js
  syntax and Code.gs parser syntax. Live Admin/Sub-admin login, live Google Sheets /
  Drive sync, Render deployment and Meet joining cannot be verified from this ZIP.
- After deployment, test with a test lead: create multiple mobile leads, edit one,
  set Demo Done / Admission Call Pending, submit Yes/Maybe and No feedback, move one
  student to admission interest, onboard one demo teacher, edit that teacher's login,
  and verify old Admin/Sub-admin/Teacher/Student logins plus fee workflows and cloud
  sync before entering live records.
