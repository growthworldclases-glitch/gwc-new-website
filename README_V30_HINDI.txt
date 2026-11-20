GWC V30 — V28 + V29 PRESERVATION, TEACHER ROSTER REPAIR & DASHBOARD VIEW MORE
===============================================================================

BASE
----
Built directly from GWC_V29_LIVE_STATUS_HELPDESK_TRASH.zip, which already includes
the V28 class-wise weekly schedule add-on. V28's files/features and V29's additions
are retained; no existing login IDs, passwords, account records, app settings,
batch settings, spreadsheet schema, Apps Script properties, or deployment URLs
were intentionally changed.

V28 vs V29 CHECK
----------------
- V29 is additive relative to V28 in index.html, Code.gs and server.js.
- V29 adds live-presence endpoints/sheet, teacher contact/live status, dashboard
  message hide, and Admin Drive Trash shortcut.
- The existing V28 weekly schedule implementation and legacy files are present
  in V29. The V30 package is based on V29, not a rollback to V28.

V30 REPAIRS / UI
----------------
1. Teacher > Assigned Students:
   - Uses the app's full teacher-course assignment mapping: course.teacherId,
     course.assignedTeacherId, course.teacherIds and teacher.assignedCourseIds.
   - Roster also recognizes student.courseId / assignedCourseId and the course's
     studentIds list (including student user IDs).
   - Does not hide an assigned student merely because fee access is paused;
     Join Class access rules remain governed by the existing access controls.
   - Shows class/course, batch, class timing, contact number and Join Class link.
2. Weekly Schedule:
   - Teacher class list and upload authorization now recognize all supported
     multi-teacher assignment fields, not only the primary teacherId.
   - Existing per-class schedule records, archive and Drive upload flows remain.
3. Dashboard:
   - Preserves the existing dashboard/sidebar style.
   - Shows four main shortcuts by role:
     Student: Join My Class, Weekly Schedule, WhatsApp Help Desk, Upload Today Notes.
     Teacher: Join Assigned Class, Class Time, WhatsApp Help Desk, Weekly Schedule.
     Admin: Assigned Students, Courses, Teachers, WhatsApp Help Desk.
   - View More expands the remaining existing menu features; Return collapses
     back to the four main shortcuts. All old menu entries remain in menu().
   - Colourful emoji icons are used to match the existing V20-style icon treatment.
   - Teacher's View Today Upload Notes remains available under View More.
4. No login credentials, IDs, role records, settings, course/student records, or
   Apps Script / Render environment values are rewritten by this patch.

VALIDATION
----------
- All inline JavaScript blocks pass Node.js syntax checking.
- ZIP file structure and original V29 source files are retained.
- Live login, Google Sheets/Drive, Render proxy, teacher account roster and actual
  Drive file access cannot be end-to-end tested without access to the live services.
  Please test on a copy / test teacher before production deployment.

DEPLOYMENT
----------
1. Back up the current GitHub repository and Google spreadsheet first.
2. Replace repository index.html with this ZIP's index.html.
3. Keep existing server.js, Code.gs, package.json, appsscript.json and environment
   properties as they are unless you separately need the V29 presence features.
   To retain V29 Live Presence and Drive Trash, deploy the V29 server.js and Code.gs
   versions already included in this ZIP exactly as supplied; do not change Script
   Properties or create a new spreadsheet.
4. Deploy the updated Apps Script as a new version of the same Web App if updating
   Code.gs; keep the existing deployment access and Script Properties.
5. Test Admin login, one teacher assigned to multiple classes, at least two students
   assigned across those classes, Teacher > Assigned Students, Join Class, weekly
   schedule upload, and View More / Return on Student, Teacher and Admin portals.
