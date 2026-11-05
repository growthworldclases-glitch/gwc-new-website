GWC V22 — ADDITIVE PARENT NOTIFICATIONS, RESULT REPORTS & HELPDESK MANAGEMENT
============================================================================

BASE / PRESERVATION
- V22 is built additively on GWC_V21_ADDITIVE_MEET_CHAT.zip, which itself was
  built from the supplied GWC_V20_PERSISTENT_LOGIN_PRIVATE_HELPDESK.zip.
- Existing V20/V21 website modules and UI are retained: Admin/Teacher/Sub-admin/
  Student login, Login IDs and passwords, roles, account records, batch/course
  settings, course assignments, persistent login, fee workflows, demo workflow,
  Meet status, All Classes Join, Helpdesk chat, broadcast groups, tests, homework,
  attendance, uploads, settings, audit records, and Google sync.
- No password, login ID, account, role, batch, course, or fee data migration is
  performed. Code.gs, server.js and package.json are unchanged from V21.
- The only application code change is an additive script layer in index.html.

ADDITIONS
1. Parent Notification Centre (Admin): send notices to all active student/parent
   portal accounts or selected students. Categories include General Update, Fee
   Reminder, Class Cancellation, Class Timing Change, Homework Update, Exam/Test
   Update and Important Notice. Admin can review sent history and delete notices.
2. Student Notifications: a Notifications tab shows messages targeted to that
   student's portal account. Parent access is represented by the linked student
   portal account in this legacy application.
3. Automatic Result Reports: existing Test Portal scoring remains the source of
   truth. New My Results view shows submitted marks, percentage and rank within
   the test's assigned group. Admin Result Reports lists submissions and allows
   Admin to send a result notification to the student's portal. Quiz submission
   also creates a result notification automatically.
4. Helpdesk Management: search conversation history, show unread count, record
   read status, allow Admin to mark/reopen conversations as resolved, and keep a
   capped Helpdesk Activity Log for notifications, result alerts, reads and
   resolution actions. Existing WhatsApp-style chat and deleted items remain.

DATA / BEHAVIOUR NOTES
- New arrays (gwcNotifications and gwcHelpdeskAudit) are initialized lazily and
  saved through the existing state save mechanism. Existing records are not reset.
- Notification recipients use existing student userId/student record IDs.
- Existing auto-scored tests are not replaced. Rank is calculated among submitted
  results for that test; equal marks share the same competition rank.
- This is an additive browser-side feature layer using the existing shared JSON
  state. It is not a substitute for server-enforced access control or a dedicated
  messaging/notification database. For a large production deployment, move chat,
  notification and audit records to a database with server-side role checks,
  pagination, indexes, retention and monitoring.
- Notifications are in-app portal notifications; they do not send SMS, WhatsApp,
  email or push notifications.
- Parent portal access is through the existing Student account; no separate
  parent login system is introduced.

VALIDATION
- Inline JavaScript blocks in index.html pass Node.js syntax checks.
- server.js passes Node.js syntax check.
- Code.gs passes JavaScript syntax check after copying to a .js check file.
- ZIP archive integrity checked after packaging.
- Offline checks do not verify deployed Google Sheets/Drive sync, real student
  accounts, browser interaction, or live production behaviour. Test with backup
  and dummy accounts before deployment.

DEPLOYMENT
- Back up the currently deployed website ZIP and Google Sheet before replacing.
- Deploy the ZIP to the existing Render service; keep existing GWC_API_URL,
  Apps Script deployment, spreadsheet and Drive folder settings unchanged.
- No Code.gs redeployment is required for these browser-side additions.
