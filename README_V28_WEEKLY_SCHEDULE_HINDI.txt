GWC V28 — CLASS-WISE WEEKLY SCHEDULE ADD-ON
============================================

Base: GWC_V27_1_TODAY_NOTES_AUTH_FIXED_FULL.zip
This package preserves the original app files, appsscript.json, Code.gs, server.js,
login/settings/state schema, and existing features. The V28 code is additive.

NEW FEATURES
------------
1. Teacher dashboard -> Weekly Schedule:
   - Lists each course/class assigned to the logged-in teacher (course.teacherId).
   - Teacher uploads one PDF/JPG/PNG/WEBP (maximum 10 MB) per class.
   - A different class can have a different schedule.
   - Teacher can archive their own schedule. Archived schedules disappear from the
     active teacher/student view and are visible in Admin archive.
2. Student dashboard -> Weekly Schedule:
   - Displays the active schedule for the student's assigned course/class only.
   - Shows a red missing-schedule notice if that class has no active schedule.
3. Admin dashboard -> Manage Weekly Schedule:
   - Select a class; shows assigned teacher and green/red schedule status.
   - Admin can upload/replace a class schedule, archive it, and view/download it.
   - Admin can open the schedule archive and permanently remove archived files.
4. Drive lifecycle:
   - Archived schedule files are moved to the existing GWC_Deleted_Items Drive folder.
   - Permanent Delete calls the Apps Script action that moves the file into Google
     Drive's Trash. The file is no longer kept in the app's archive list.
   - No new spreadsheet tab or Drive folder name is introduced by this add-on.

DEPLOYMENT
----------
1. Extract this ZIP and update the repository contents with these files, preserving
   the repository's normal deployment structure.
2. Deploy the updated Code.gs as the existing Apps Script Web App deployment (or
   update the existing deployment). Keep the existing Script Properties unchanged:
   GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID, GWC_PROXY_SECRET,
   GWC_ALLOWED_VERSION, and other existing properties.
3. Deploy updated server.js to the existing Render service. Keep its existing
   environment variables unchanged. The proxy version remains 24.0-secure so the
   existing Render and Apps Script version configuration is not silently changed.
4. Keep appsscript.json and package.json from this ZIP. Do not create a new blank
   spreadsheet or reset any Script Properties.
5. Test with one teacher assigned to two different courses and at least one student
   assigned to each course. Verify each student sees only their course schedule.

IMPORTANT ACCESS NOTE
---------------------
Schedule files are uploaded with privateFile:true (no public "anyone with link"
sharing). Google Drive must grant the intended student Google accounts access to
the private file for View/Download to work. The current legacy app's student record
schema does not guarantee that every student has a Google account email address,
and this add-on does not invent or expose public links to compensate. If student
email addresses are not stored/available in the account records and granted Drive
permissions, the schedule card can appear while Drive itself may deny opening the
file. A strict server-enforced per-student authorization layer would require a
separate authenticated file-delivery endpoint and cannot safely be inferred from
the existing shared-state architecture.

SCOPE / DATA SAFETY
-------------------
- Existing app state and legacy weekly text schedules are not migrated or deleted.
- New schedule records are stored in state.gwcWeeklySchedules; archive metadata is
  stored in state.gwcWeeklyScheduleArchive.
- Replacing an active schedule archives its previous metadata. Teacher archive and
  Admin archive use the existing archiveDriveFile action.
- Permanent Delete uses Google Drive Trash, not an irreversible purge of Google's
  Trash. An account owner may empty Drive Trash separately when appropriate.
- Fee receipts, course posters, helpdesk attachments, private notes, and other
  unrelated file workflows were not modified by this schedule-only add-on.
- This package has been syntax-checked with Node.js. Live Google Apps Script, Drive
  permission, Render deployment, and real student/teacher account testing require
  deployment access and cannot be truthfully certified from a ZIP alone.
