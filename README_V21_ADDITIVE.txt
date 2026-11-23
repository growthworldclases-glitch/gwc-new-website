GWC V21 — ADDITIVE MOBILE HELP DESK + CLASSROOM / NOTIFICATION UPDATE
======================================================================

BASE / PRESERVATION
- Built directly from the uploaded GWC_V20_PERSISTENT_LOGIN_PRIVATE_HELPDESK.zip.
- Existing Code.gs, server.js, package.json, Google Apps Script URL, proxy settings,
  sheet schema, Drive settings, backup/reset safeguards and existing app features
  are retained unchanged.
- Only index.html is modified; this README is added.
- Existing login IDs/passwords, student/teacher records, course/batch assignments,
  fees, demo data, attendance, tests, homework and stored messages are not intentionally
  migrated, reset, renamed or deleted.
- No account password or ID was regenerated.

ROOT CAUSE: TEACHER MEET LINK UPDATE STILL SHOWED AN ERROR
---------------------------------------------------------
The V20/V19 app has two possible Meet URL sources:
1. course.meetUrl (the URL saved on a course record), and
2. teacher.meetUrl (the URL saved on the teacher account).

The existing gwcJoinLink() returned course.meetUrl FIRST and teacher.meetUrl only
as a fallback. Therefore, when an old course-level URL remained saved, updating
the teacher's Meet URL did not replace the old URL selected for Join My Class.
The student could continue to receive an invalid-link error even after the teacher
record had been updated.

V21 changes the lookup priority to:
  assigned teacher's current meetUrl -> course.meetUrl fallback.

The teacher table now displays a green dot only when the saved URL passes
Google Meet URL/domain/meeting-code format checks. Red shows the actual local
validation reason (missing URL, non-HTTPS, wrong domain, invalid URL or unrecognized
meeting-code format).

IMPORTANT: A browser app cannot reliably prove that a Google Meet room is currently
open, that the teacher's Google account has permission, or that a host will admit
the participant. Therefore green means "URL format valid", NOT guaranteed live
meeting availability. The interface explicitly says live room access is not
verifiable from this app. A definitive "working" check requires Google-authorized
server-side verification or a real join test under the teacher account.

V21 ADDITIONS
-------------
1. WhatsApp Help Desk (inside the GWC app; does not open WhatsApp)
   - Mobile-friendly chat layout.
   - Student: Admin + assigned teacher only.
   - Teacher: Admin + students in assigned courses only.
   - Sub-admin: Admin only.
   - Admin: all teachers and all students.
   - Admin can create broadcast groups and select multiple students and teachers.
   - A group message is saved once in the GWC state and shown to its members.
   - Admin can archive a message to the in-app Deleted Helpdesk Items area,
     restore it, or permanently remove the archived item.
   - This release supports text messages and group broadcasts.

2. Parent Notification Centre
   - Admin can publish Fee Reminder, Class Cancellation, Homework Update,
     Exam Update or General Notice.
   - Target can be all students/parents, all teachers, or everyone.
   - Notices are displayed in logged-in portals and saved in the existing state.
   - This is an in-app notification centre. It does not send SMS, WhatsApp or
     push notifications while a user is logged out.

3. Admin / Sub-admin Classroom Join
   - New Classroom Join screen lists active courses and allows Admin/Sub-admin
     to open the saved Meet link, similar to demo access.

4. Historical ID Management (read-only safety dashboard)
   - Shows active/assigned and inactive/released account counts and the next
     student/teacher ID counter.
   - Shows currently stored account IDs without displaying passwords.
   - Automatic reuse of released IDs is intentionally NOT enabled in this release.
     Safe recycling needs a permanent ID ledger, uniqueness checks across all
     historical records and server-side reservation/locking. Reusing an old ID
     based only on the current client state could expose an old student's data.

5. Advanced Cloud Recovery (diagnostic view)
   - Calls the existing Apps Script health action and shows connection result,
     record counts and recent audit events.
   - Existing Code.gs V16/V17 protections/backups are retained.
   - This is not a restore-from-backup control panel and does not inspect/restore
     Drive backup files.

NOT INCLUDED / REQUIRES A SECURE BACKEND
----------------------------------------
- Photo/video/voice-note/file attachments in chat are not enabled. The legacy
  shared-state API does not provide participant-authenticated file access. Making
  Drive links public just to make attachments work could expose private student
  conversations/files. A secure attachment service must issue access only to the
  intended participants.
- Chat visibility in this legacy app is still enforced by browser-side role filters
  over a shared whole-state API. It is NOT a confidentiality boundary. A person
  with direct access to the legacy state endpoint may be able to inspect stored
  messages. Do not use this as high-security private messaging until chat is moved
  to server-authenticated, role-authorized endpoints.
- Exam rank, subject-wise analytics and parent report generation are not added in
  this release. The existing test records do not provide a verified, uniform result
  schema sufficient to calculate reliable ranks without risking old test data.
- Fresh/Assigned/Released ID dashboard is a read-only overview. Full historical ID
  recycling/reservation is not enabled for data-safety reasons.
- True 10-year crash-proof operation cannot be guaranteed by a ZIP. Long-term
  reliability requires server-side access control, database/indexed message storage,
  scheduled verified backups, monitoring, restore drills, quotas and versioned APIs.
- Admin delete archive here is the in-app message archive. Existing fee-slip/Drive
  archive behavior remains as before; this change does not silently move every
  arbitrary Drive object into GWC_Deleted_Items.

DEPLOYMENT
----------
1. First download/keep a copy of the current live ZIP and make a separate copy of
   the existing Google spreadsheet. Do not test against the only live copy.
2. Deploy index.html, Code.gs, server.js and package.json from this ZIP to the
   SAME Render service. Code.gs, server.js and package.json are included unchanged
   for completeness; the intended source change is index.html only.
3. Keep the existing Render environment variable GWC_API_URL unchanged.
4. Keep the existing Apps Script deployment URL, Script Properties, spreadsheet ID,
   Drive folder ID and all existing sheet contents unchanged.
5. No new Apps Script deployment is required for these browser-side additions.
6. After deployment, wait for Google Sheets/Drive sync to report connected.
7. Test using non-critical accounts:
   - Teacher updates Meet URL; Admin teacher table shows URL validation reason.
   - Open the course from Classroom Join and student My Course.
   - Test Student/Teacher/Admin contact visibility.
   - Create a small broadcast group and send a text message.
   - Archive/restore a test message.
   - Publish a test notification to students and teachers.
   - Check Cloud Recovery API status.
8. Only after these tests pass should you rely on the update in production.

VALIDATION PERFORMED IN THIS BUILD
----------------------------------
- JavaScript syntax: checked with Node.js for all inline scripts.
- server.js syntax: checked with Node.js.
- Code.gs syntax: checked with Node.js parser.
- ZIP integrity: checked after packaging.

NOT VERIFIED
------------
No live Render deployment, Google Sheets, Google Drive, Apps Script execution,
real teacher account, student account or Google Meet room was accessible from
this build environment. Local syntax and ZIP integrity checks do not prove
end-to-end production behavior. Keep the backup and verify with test accounts.
