GWC V23 — ADDITIVE PARENT NOTIFICATIONS, RESULTS & HELP DESK DELETE CONTROL
============================================================================

BASE / PRESERVATION
- Built additively from the supplied GWC_V20_PERSISTENT_LOGIN_PRIVATE_HELPDESK.zip.
- Retains the complete V20 application and the V21/V22 additive layers.
- Existing Admin, Teacher, Sub-admin and Student login flows, IDs, passwords,
  account records, roles, batch/course settings, student assignments, fee system,
  demo workflow, persistent login, settings, attendance, homework, tests, uploads,
  Google sync configuration and existing modules are retained in the source.
- No account/password changes, data migration, reset, or deletion is performed.
- Code.gs, server.js and package.json remain byte-for-byte identical to V20.
- The only application source change for V23 is an additive update to index.html.

FEATURES INCLUDED
1. Parent Notification Centre:
   Admin can send portal notifications to all or selected active student/parent
   accounts, with categories for fee, class, homework, exam and general updates.
   Student portal has a Notifications view and sent history is available to Admin.
2. Automatic Result Reports:
   Existing test scoring remains the source of truth. Student My Results shows marks,
   percentage and batch rank. Admin can review results and send result notifications;
   quiz submission can create an automatic result notification.
3. Helpdesk Management:
   Conversation search, unread counts, read status, resolved/reopen controls and
   capped Helpdesk Activity Log are included.
4. Chat deletion permissions:
   Teacher and Student can hide an individual message from their own chat view.
   The original message remains in the shared message record and remains visible to
   Admin, marked as user-deleted. Admin can move it to Admin Deleted Items and then
   permanently delete it. Admin remains the only role allowed to permanently delete.
   A user-side delete does not delete the other participant's copy or Admin record.
5. Earlier V21 classroom and chat features remain: Meet URL format status, Admin /
   Sub-admin All Classes Join, WhatsApp-inspired Helpdesk, Parent-to-Admin routing,
   parent broadcast groups and Hindi helpdesk banner.

DATA / LIMITATIONS
- New notification/audit arrays initialize lazily; existing state is not reset.
- Notifications and message records use the existing shared JSON state and current
  client-side role checks. This is not server-enforced authorization. For a public
  production service, implement authenticated server-side authorization before
  relying on private messaging or user deletion permissions as a security boundary.
- In-app notifications do not send SMS, WhatsApp, email or push alerts.
- Parent portal access uses the existing Student portal account; no separate Parent
  login is introduced.
- User-side chat delete is a personal-view hide, so Admin can still review it. Admin
  Deleted Items is the review/purge area. Permanent delete removes the message record
  from the app state; it does not automatically purge a Drive attachment file.
- The legacy shared JSON / Apps Script architecture has payload, quota, latency and
  concurrency limits. Drive capacity alone cannot guarantee ten years of uptime.
  A production-scale system should move chat, notifications and audit data to a
  dedicated database with server-side roles, pagination, indexes, backups, retention
  and monitoring.
- Live Render, Google Apps Script, Sheets, Drive, Meet accounts and real user accounts
  were not accessible for this offline build. Syntax and ZIP checks do not prove live
  operation. Test with backups and dummy accounts before production rollout.

VALIDATION
- All non-empty inline JavaScript blocks in index.html pass Node.js syntax checks.
- server.js passes Node.js syntax check.
- Code.gs passes Node.js syntax check after copying to a .js parser-check file.
- Code.gs, server.js and package.json compare byte-for-byte with V20 originals.
- ZIP integrity and required original file list are checked after packaging.

DEPLOYMENT
- Back up the currently deployed website ZIP and Google Sheet first.
- Deploy this ZIP to the existing Render service; keep the existing GWC_API_URL,
  Apps Script deployment, spreadsheet IDs and Drive folder settings unchanged.
- No Code.gs redeployment is required for these browser-side additions.
- Test login for all four roles, old batch/course/fee/demo workflows, notifications,
  result reports, chat send/read/search, Teacher/Student personal delete, Admin review,
  Admin Deleted Items and permanent delete using dummy accounts before rollout.
