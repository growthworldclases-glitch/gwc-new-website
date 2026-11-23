GWC V20 — PERSISTENT LOGIN + HELP DESK MESSAGE ROUTING
======================================================

BASE
- Additive update to the supplied GWC_V19_HELPDESK_PRIVATE_NOTES.zip.
- Existing Code.gs, server.js, package.json, existing data schema, IDs/passwords,
  roles, course/batch assignments, fee workflows, demo workflow, homework, tests,
  attendance, Meet links, uploads, backup/reset safeguards and private website notes
  are retained. No account or batch migration is required.

V20 CHANGES
1. Persistent login
   - Successful login stores only the account identity (role, user ID and username)
     in this browser's localStorage. It does NOT store the password.
   - After closing/reopening the browser or website, the app restores the session
     after the saved Google Sheets state has loaded successfully.
   - Student/teacher/sub-admin must use the portal Logout button to clear the session.
   - Admin login is also restored until Logout or the Admin credentials are changed.
   - If an account is removed, deactivated, or its login is paused, the saved session
     will not be restored.

2. Admin student login pause/resume
   - Admin > Assigned Students now has Pause Login / Resume Login.
   - This is separate from existing course/payment pause controls. It does not change
     Login ID, password, course, teacher, batch, fee or class assignment.
   - The pause is stored as loginPaused on the existing student user/student records.
   - A paused student cannot log in or restore a saved session. Resume Login restores
     access with the same old credentials.

3. Helpdesk conversation visibility
   - Non-admin users see only messages in conversations in which they are a direct
     participant and the other participant is Admin or their assigned counterpart.
   - A Student message sent to Admin is not displayed in a Teacher portal.
   - A Teacher sees their own Admin conversation and their own assigned-student
     conversations, not unrelated Student-to-Admin conversations.
   - Admin retains the all-messages view and can continue to edit/delete messages.
   - Existing messages are not deleted; messages unrelated to the logged-in user are
     simply no longer shown in that user's Helpdesk view.

DEPLOYMENT
1. Back up the current website ZIP and Google spreadsheet first.
2. Replace the existing deployed website files on the same Render service with the
   files in this ZIP. Keep the existing Render service and GWC_API_URL environment
   variable unchanged.
3. No Code.gs replacement or new Apps Script deployment is required for these V20
   browser-side changes. Keep existing Apps Script deployment and Script Properties.
4. Open the site, wait until the sync badge says Google Sheets/Drive connected, then
   log in using an existing account. Close/reopen the site and verify the session.
5. As Admin, open Assigned Students and test Pause Login, then Resume Login. Confirm
   the same existing credentials work after resume.
6. Test Helpdesk with a student message sent to Admin. Confirm it appears for Admin
   and not in the assigned Teacher's Helpdesk. Then test student-teacher conversation.

IMPORTANT LIMITATIONS / SECURITY
- Persistent login is per browser profile/device. Clearing browser site data, using a
  different browser/device, or pressing Logout clears/does not share that session.
- A pause made by Admin is enforced on the next login/session restoration. This legacy
  app does not currently provide an always-on server push to instantly terminate a
  student already active on a different device.
- The legacy app stores its full application state through the existing shared state
  API and uses client-side role visibility. V20 corrects what each portal displays,
  but does not turn the legacy architecture into server-enforced confidential chat.
  A technically determined person with direct access to the legacy shared-state API
  may still inspect shared state. Do not use this as a high-security private messaging
  system without a separate server-authenticated, role-authorized backend.
- No live Render, Apps Script, Google Sheet, or real user account was accessible here.
  Local syntax and ZIP checks do not prove live deployment or cloud sync. Verify with
  test accounts after deployment; do not use real student credentials for initial QA.

VALIDATION
- index.html inline JavaScript syntax: checked with Node.js.
- server.js syntax: checked with Node.js.
- Code.gs syntax: checked with Node.js parser.
- ZIP integrity: checked after packaging.
