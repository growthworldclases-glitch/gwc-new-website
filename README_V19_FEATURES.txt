GWC V19 — ADDITIVE HELPLINE + PRIVATE WEBSITE NOTES
==================================================

BASE VERSION
- Built from the user-uploaded GWC_V18_DEMO_ADMISSION_ONBOARDING.zip.
- Existing index.html layout and all existing modules were retained and extended.
- Code.gs and server.js retain the existing Google Sheets state API, upload/archive,
  backup, reset-lock and fee-trigger code. Only separate private-note endpoints were
  added to these files.
- Existing login IDs/passwords, Admin/Sub-admin/Teacher/Student roles, settings,
  courses, batches, fee workflows, Force-to-Start-Batch, homework, tests, leave,
  Meet workflow, and V18 demo/admission/onboarding records are not intentionally
  reset or migrated by this update.

V18 DEMO WORKFLOW RETAINED
- Bulk mobile leads + lead date, optional demo date/time/subject.
- Demo teacher may be Currently not selected. Existing regular teachers can be
  selected but receive a separate Demo Teacher ID for each demo record.
- Demo records remain editable after allocation.
- Admin/Sub-admin can set Demo Done or Admission Call Pending; feedback remark is
  optional and can be entered/edited manually.
- Student feedback Yes/Maybe opens the admission-interest form; No asks whether
  another teacher demo is wanted (Yes/No).
- Students Assign for Class moves the lead to Demo Interested for Admission.
- Confirm Teacher creates Pending for Onboarding; admin can complete teacher details,
  assign batch/course, and create or edit the regular teacher Login ID/Password.
- Assigned Teachers list shows their assigned students, class and mobile number.

V19 NEW FEATURES
1. Common Helpdesk inside logged-in portals:
   - Admin can see all messages and edit/delete messages.
   - Teacher can contact Admin and their assigned students only.
   - Student can contact Admin and their assigned teacher only.
   - Sub-admin can contact Admin.
   - The helpdesk is a portal menu item; no public website chat widget was added.
2. Website "Send Notes to Teacher" form:
   - Available without login from the public website contact area.
   - Sender name, mobile, selected teacher and note/message are collected.
   - Notes are stored in a separate GWC_Private_Website_Notes spreadsheet tab, not in
     the public GWC_Storage JSON state.
   - Only an Admin with the separate private access key can list, edit or permanently
     delete these notes. Public visitors cannot list/read notes through the new API.

REQUIRED ONE-TIME SETUP FOR PRIVATE NOTES
The private notes inbox is intentionally locked until a key is configured:
1. Open the existing Google Apps Script project.
2. Open Project Settings -> Script Properties.
3. Add property:
      GWC_PRIVATE_NOTES_ADMIN_KEY = <choose a long unique secret key>
4. Save Script Properties.
5. Replace Code.gs with this ZIP's Code.gs and deploy a NEW version of the existing
   Web App. Preserve the existing deployment URL and Script Properties, especially
   GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID.
6. Deploy index.html, server.js and package.json to the existing Render service.
   Preserve the existing GWC_API_URL environment setting (if configured).
7. Log in as Admin -> Website Private Notes -> enter the configured key -> Load
   Private Notes. Keep this key private; do not share it with Sub-admins or students.

IMPORTANT SECURITY / DATA LIMITATIONS
- The private anonymous website notes are kept out of the public GWC_Storage state and
  their read/edit/delete endpoints require the Script Property key.
- The existing V18 application uses a whole-state browser-side Google Sheets API and
  client-side role/login checks. Therefore the new Common Helpdesk visibility filters
  are portal UI rules, not a complete server-side authorization boundary. A user with
  direct access to the legacy public state endpoint may be able to inspect state data.
  Do not treat this legacy architecture as production-grade confidential messaging.
  A full secure chat requires server-side authenticated sessions and per-role API
  authorization, which is outside a safe additive HTML-only patch.
- No live Render, Apps Script, Google Sheet, Drive, login or Meet deployment was
  accessible from this build environment. The ZIP has local syntax/integrity checks,
  not live production verification.
- Back up the website ZIP and Google spreadsheet before deployment. Preserve the
  existing spreadsheet ID, Script Properties, deployment URL and Render environment.
- Never deploy Code.gs against an empty GWC_Storage. The V17 safety lock intentionally
  refuses writes when the primary sheet is empty; restore a verified backup first.

LOCAL VALIDATION
- ZIP integrity check passed.
- Inline browser JavaScript syntax check passed with Node.js.
- server.js syntax check passed with Node.js.
- Code.gs syntax check passed with Node.js parser.
- Browser interactions and live cloud sync still require testing after deployment.
