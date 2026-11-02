GWC V18 — DEMO WORKFLOW ADDITIVE UPDATE
========================================

BASE
- Built on the supplied New.zip (V17 Reset Lock + existing Demo module), after inspecting the earlier GWC_SAFE_ADDITIVE_REPAIR_V11_FEE_CYCLE_SYNC(1).zip baseline.
- Existing index.html, Code.gs, server.js, package.json, Apps Script URL/proxy settings, and saved-state schema were retained as the base.
- No existing Admin / Sub-admin / Teacher / Student login credentials are hard-coded or intentionally changed.
- Existing fee-cycle, fee approval/reversal, Force to Start Batch, cloud sync safety locks, and existing portal modules are retained.

V18 DEMO WORKFLOW ADDITIONS
1. Bulk Demo Lead Entry
   - Admin/Sub-admin can paste multiple parent WhatsApp/mobile numbers (one per line or comma-separated), select a Lead Date, and click "Date Save for Demo".
   - One DMS Demo ID is allocated per unique number. A duplicate number in the same submission is added only once.
   - Demo details can be completed later; the lead is saved without requiring student name, class, subject, demo date/time, or teacher.

2. Demo Teacher Selection
   - "Currently not selected" is available when creating/editing a Demo lead.
   - The old "Existing Teacher / Temporary New Teacher" type selector is removed from the new workflow.
   - A regular teacher selected as Demo Teacher is treated as a Demo Teacher for that Demo and receives a DMT Demo ID.
   - A Demo Teacher can be assigned later by Admin/Sub-admin; a DMT ID is allocated when a teacher is selected/entered.

3. Editable Demo Details
   - After allocation, Admin/Sub-admin can edit student name, mobile, lead date, class, school, father name, class time, full address, demo date/time, subject, Demo Teacher, teacher mobile, and Meet URL.

4. Assigned Teacher Register
   - Assigned Demo Teachers are grouped, with their Demo students shown below each teacher.
   - Student name, class, mobile number, demo date, and Demo IDs are visible.

5. Student Demo Response
   - Interested for Admission and Maybe open the requested details form: Student Name, Class, School Name, Father Name, Class Time Required, WhatsApp Phone Number, and Full Address.
   - Submitted details are saved in "Demo Interested for Admission" for Admin/Sub-admin follow-up.
   - Not Interested asks: "Do You want next Demo with Another Teacher?" with Yes/No choices.

6. Admission Finalization
   - Admin can review the submitted lead details and use "Finalize Admission / Assign Course".
   - The lead is added to the existing student admission records and passed to the existing Assign Course workflow, which uses the existing course/teacher/batch setup and student credential allocation.

7. Teacher Onboarding
   - "Confirm Teacher" moves the Demo teacher into "Pending for Onboarding".
   - Admin/Sub-admin can complete name, mobile, class, section, batch, Meet URL, Login ID, and Password, then create the regular teacher account.
   - Admin/Sub-admin can edit Login ID and Password for regular teacher accounts from Demo Management.

8. Existing Demo Functions Retained
   - Demo Portal login, student/teacher Meet join buttons, feedback rating/comment, join-click tracking, Admin Meet join, Demo record edit, and permanent deletion remain.
   - Permanent deletion also removes the linked Demo admission lead/onboarding record and frees the associated Demo IDs.

IMPORTANT LIMITATIONS
- Demo IDs remain ID-only, passwordless demo access, as in the supplied V17 Demo module. They are not secure authentication. Do not use this Demo portal for confidential/private information.
- Join counters record button clicks, not verified Google Meet attendance.
- WhatsApp is not silently sent. The original click-to-open WhatsApp behavior remains; automated WhatsApp delivery requires an approved WhatsApp Business API/provider.
- Demo admission finalization opens the existing Assign Course flow. Live account creation, Google sync, Drive, Render, Apps Script, and Meet behavior must be tested in the user's deployed environment.
- The V17 Code.gs data-reset safety lock is retained. If the live GWC_Storage primary is empty, restore a verified populated backup before expecting saves to work. Do not remove the safety lock or upload an empty/default state over populated data.

DEPLOYMENT
1. Back up the website and Google Spreadsheet first.
2. Keep the existing Apps Script Script Properties (GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID), existing Apps Script deployment URL, Render environment variables, and GWC_API_URL unchanged.
3. Deploy index.html, server.js, and package.json to the existing host.
4. Replace Code.gs in the existing Apps Script project with the included Code.gs only if the current live project is not already on this V17 safety version; then deploy a NEW version of the same Web App. Preserve Script Properties and deployment URL.
5. Test old Admin/Sub-admin/Teacher/Student logins, fee cycle, payment approval, Force to Start Batch, cloud sync, Demo lead entry, Demo portal, admission finalization, and teacher onboarding using test records before production use.

LOCAL VALIDATION
- index.html inline JavaScript passed Node.js syntax checking.
- server.js passed Node.js syntax checking.
- Code.gs passed JavaScript parser syntax checking.
- ZIP integrity was checked.
- Live Google Sheets/Drive/Apps Script/Render/Meet end-to-end tests were not possible in this environment.
