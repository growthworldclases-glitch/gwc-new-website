GWC V17 - Demo Management Add-on
================================

This ZIP is based on the uploaded V17 Reset Lock build. Existing student/teacher/admin credentials and the existing fee-cycle/Force Active logic were not intentionally changed.

Added in index.html:
- Admin and Sub-admin shared Demo Management menu.
- Manual demo enquiry record: student name, class, date/time, subject, teacher, temporary teacher flag, WhatsApp number, Meet URL.
- Demo IDs DMS001-DMS500 and DMT001-DMT500 allocated from currently available IDs.
- ID-only Demo Portal login (no password) for demo-only records; does not grant access to normal student/teacher accounts.
- Student Demo Portal with Join My Demo Class and immediate feedback form (rating, comment, admission interest).
- Temporary teacher Demo Portal and Meet link.
- Admin/Sub-admin Meet join click logging, student/teacher join-button click counters, feedback view, individual and all-record permanent deletion.
- Conversion marker buttons that direct the admin to complete regular admission/teacher account creation using existing forms.

Backend change:
- Google Drive upload maximum raised from 1 MB to 10 MB; Render body parser raised to 16 MB to allow base64 overhead.

IMPORTANT LIMITATIONS / DEPLOYMENT:
1. This is an additive Demo module, not a full implementation of every requested workflow. Test Portal and Daily Notes forms have not been upgraded to accept/replace 10 MB attachments in this build.
2. WhatsApp is opened as a wa.me prefilled message when a student clicks Join. A website cannot silently send WhatsApp messages; automatic outbound sending requires WhatsApp Business Platform/API and approved templates/consent.
3. Join counters count button clicks, not verified Google Meet attendance. Google Meet does not expose attendance data to this website through a normal Meet URL.
4. Demo IDs are intentionally passwordless and therefore are not secure authentication. Do not put private student records or sensitive data in this demo-only portal. Anyone knowing an ID may open that demo record.
5. The conversion buttons mark the demo record for follow-up; they do not automatically create a regular student/teacher account. Admin must verify remaining details and use existing account workflows.
6. Admin/Sub-admin changes are synced using the existing whole-state save mechanism. For simultaneous multi-admin editing, refresh/reload before editing; this legacy state store is not a transactional multi-user database.
7. Before deployment, back up the Google Sheet and deploy the updated Code.gs as a new Apps Script Web App version, preserving the existing Script Properties (GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID). Update Render with this ZIP and keep the existing GWC_API_URL.
8. After deployment, test existing Admin, Sub-admin, Teacher and Student logins and fee workflows before entering live Demo data.

The existing Apps Script URL and Render proxy configuration are retained from the source ZIP.
