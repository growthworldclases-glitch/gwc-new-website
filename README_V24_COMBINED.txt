GWC V24 — CONSOLIDATED PACKAGE
================================

This package consolidates the V20 baseline and the additive V21, V22 and V23
feature layers supplied/generated in this conversation.

PRESERVED BASELINE
- Original V20 Code.gs, server.js and package.json are retained byte-for-byte.
- Original project files and historical README notes are retained.
- No account, login ID, password, role, batch, course, fee, or student data
  migration/reset is performed by packaging this ZIP.

INCLUDED FEATURE LAYERS
- V20: persistent login/private Helpdesk baseline and existing app modules.
- V21: Meet URL format status, Admin/Sub-admin All Classes Join, WhatsApp-style
  Helpdesk, parent-to-admin routing, parent broadcast groups, Hindi Helpdesk banner.
- V22: Parent Notification Centre, student portal notifications, result reports,
  Helpdesk search/unread/read/resolution/activity log.
- V23: Teacher/Student personal message hide; Admin retains visibility, reviews
  deleted messages, and alone can permanently delete from Admin Deleted Items.

IMPORTANT LIMITATIONS
- Meet green status validates the Google Meet URL format only; it cannot prove a
  meeting is live or that a teacher is signed in/able to admit participants.
- Notifications are in-app only; no SMS, WhatsApp, email or push delivery is added.
- Parent access remains through the existing linked Student portal account.
- The legacy shared JSON/client-side authorization architecture is not a secure
  server-enforced private messaging boundary and has Apps Script payload, quota,
  latency and concurrency limits. Drive capacity alone cannot promise 10 years
  of crash-free operation. A production-scale migration to a database with
  server-side authorization, pagination, backups and monitoring is recommended.
- Admin permanent deletion removes the message record from app state; it does not
  automatically purge a related Drive attachment.
- Offline syntax/ZIP checks do not verify live Render, Apps Script, Sheets, Drive,
  Google Meet, or real-account behaviour. Test with backups and dummy accounts.

DEPLOYMENT
- Back up the deployed website ZIP and Google Sheet first.
- Keep existing GWC_API_URL, Apps Script deployment, spreadsheet IDs and Drive
  folder settings unchanged. No Code.gs redeployment is needed for these
  browser-side feature layers.
- Test all four roles, existing login credentials, batches, fees, demos, Meet links,
  notifications, results, chat routing, personal message deletion and Admin
  permanent deletion using dummy accounts before production rollout.
