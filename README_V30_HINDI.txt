GWC V30 — V28/V29 COMPATIBILITY REPAIR + ROLE DASHBOARD
=======================================================

BASE
----
Built additively on GWC V29, which itself is based on V28. V28's original files
and all V29 files are retained. This update does not intentionally alter account
credentials, login IDs/passwords, Script Properties, deployment URLs, or the
existing state/database schema.

V28 vs V29 AUDIT
----------------
- V29 contains every file from V28; it adds README_V29_HINDI.txt.
- Shared source files changed in V29: index.html, Code.gs, server.js.
- V29's Code.gs adds isolated live-presence actions and a GWC_Live_Presence sheet.
  It does not replace the primary GWC_Storage state.
- V29's index.html adds presence/contact/helpdesk-preview-hide/Drive Trash logic.
  The V28 weekly schedule code and existing feature modules remain present.
- V29's server.js has a small corresponding additive change.
- No login ID/password values are intentionally changed by this V30 patch.
- ZIP-level comparison cannot prove that live cloud records, Apps Script Script
  Properties, deployment settings, or external Google Drive permissions are
  identical; those require access to the live services.

V30 FIXES
---------
1. Teacher Assigned Students roster now resolves teacher-course mappings through
   teacherId, teacherIds, teacher.assignedCourseIds, and the legacy class/section
   mapping. It uses the course's studentIds restriction when present. It does not
   hide assigned students merely because course access is paused; paused status is
   labelled so Admin-assigned students remain visible to their teacher.
2. Teacher dashboard's roster is sourced from the shared saved state, not from the
   narrow V29 live-presence-only helper. Live presence remains an independent
   online/offline signal.
3. Role dashboard opens with four main feature cards:
   STUDENT: Join My Class, Weekly Schedule, Help Desk, Upload Today's Notes.
   TEACHER: Join Assigned Class + Class Time, Help Desk, Upload Weekly Schedule,
   View Today's Uploaded Notes.
   ADMIN: Assigned Students, Published Course Management, All Teachers Details,
   Help Desk.
4. Click for More opens the existing feature directory. Existing sidebar features,
   tabs, and management modules are retained when navigating into a feature.
5. Colorful emoji icons are used for the four main feature cards. No dashboard
   reference image was present as a separate attachment in this conversation, so
   the icons are a clean colorful interpretation rather than a pixel-exact match.

VALIDATION / LIMITS
-------------------
- This ZIP is a source-level additive repair. Node.js syntax validation is required
  before deployment.
- Live teacher/student login, Google Sheets sync, Apps Script, Render, Drive file
  access, and actual assigned-student data could not be tested without the user's
  deployed services and accounts.
- Before deployment, back up the existing GitHub repository and Google spreadsheet.
  Replace the website source with index.html and deploy matching Code.gs/server.js
  from this ZIP while keeping existing environment variables and Script Properties.
- Test Admin assignment of one teacher to two classes and at least two students per
  class. Confirm teacher sees all assigned students and only assigned course
  schedules/notes. Confirm student sees only their own class schedule.
