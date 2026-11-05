GWC V21 ADDITIVE PORTAL EXTENSION
=================================

BASE
- Built from the uploaded GWC_V20_PERSISTENT_LOGIN_PRIVATE_HELPDESK.zip.
- Retains all 12 original project files and existing Code.gs, server.js, package.json.
- No spreadsheet, Script Properties, Render URL, account credentials, batch/course records,
  login IDs, passwords or existing user data are intentionally migrated or reset.

V21 ADDITIONS IN index.html
1. Teacher Meet status
   - Teacher edit resets the previous manual verification whenever the Meet URL changes.
   - Admin sees a red status for missing, malformed or unverified links.
   - Admin/Sub-admin can open the Meet URL and then explicitly confirm that the meeting
     page actually opened. Only then is a green "Meet ID updated & tested" status saved.
   - Google Meet does not provide a public unauthenticated endpoint for this app to prove
     that a meeting is joinable, that the host is present, or that a user has permission.
     Therefore green means a human admin tested the page, not a permanent live health check.
   - Admin can open any teacher's Meet link from the Teachers & Section Assignments table. Admin and Sub-admin also get a dedicated Teacher Meet Control page with a Join Class action for every active teacher.

2. Common Helpdesk
   - Replaces the simple message list with a WhatsApp-inspired conversation layout.
   - Adds a persistent Hindi portal banner inviting teachers/parents to discuss and share
     messages/notes.
   - Direct routing uses the existing recipient selection and participant filtering:
     selecting Admin sends only to Admin; it is not routed to the assigned teacher.
   - Admin deletion moves chat messages to the in-app Deleted Items archive first.
   - Admin can clear the archived chat-message list from the portal.
   - Text notes are supported. Binary file attachments and end-to-end encryption are not
     implemented by this front-end-only extension.

3. Parent broadcast groups
   - Admin can create named groups from the current student login records and send an
     update to all members. Each recipient receives a separate portal message record.
   - Group definitions and broadcast records are stored in the existing shared app state.
   - Recipients see the message after their portal reloads/syncs the shared state.
   - This is an in-app portal broadcast, not SMS, WhatsApp push, email or a guaranteed
     real-time notification while users are offline.

4. Login ID inventory
   - Admin menu includes Login ID Inventory, separating current active credentials from
     credential-bearing archived records when those records exist in the legacy trash.
   - It deliberately does not automatically reissue an old username/password. The current
     allocator's counter and historical account records must be reconciled first; automatic
     reuse without a server-side uniqueness check could create duplicate identities.
   - Existing student removal moves the student profile to state.trash, while its user
     login may remain in state.users. Verify both records before manually reassigning IDs.

IMPORTANT ARCHITECTURE / LIMITATIONS
- Existing legacy application state is synchronized as one shared JSON state through the
  existing Render proxy and Apps Script/Google Sheets path. This update does not convert
  that architecture into a secure multi-tenant chat backend.
- Helpdesk visibility is still enforced in the browser. A person with direct access to
  the legacy shared-state endpoint may be able to inspect shared records. Do not use this
  for sensitive/private documents or regulated personal data.
- Deleted chat messages are moved to the in-app state.gwcTrash archive, not uploaded as
  individual files into a Google Drive folder. Existing file archive support remains
  available for supported Drive file types, but V21 does not add a generic Drive archive
  endpoint for every app record.
- No software can promise that an app will never crash for 10 years. Long-term reliability
  needs versioned backups, tested restore drills, monitoring, quota/capacity checks,
  server-side authorization, schema migration/versioning and periodic dependency updates.
- Live Google Meet, Render, Apps Script, Sheets and Drive services were not accessible
  from this build environment. Syntax/ZIP checks do not prove production service behavior.

DEPLOYMENT
1. Download and retain a backup of the current website ZIP and make a separate copy of
   the Google spreadsheet before deploying.
2. Deploy index.html to the existing Render/GitHub project. Keep the same Render service,
   environment variables and /api/gwc proxy route.
3. Code.gs is unchanged; no Apps Script redeployment is required for the V21 front-end
   additions. Keep the existing Apps Script deployment and Script Properties unchanged.
4. Test with non-critical accounts: Admin, one teacher, one parent/student and one
   sub-admin. Confirm old logins, batch assignment, fee, homework, tests and Meet links.
5. Test Helpdesk routing explicitly: send a student message to Admin and confirm the
   teacher does not see it; then test a teacher/student direct conversation.
6. Create a test broadcast group and verify a recipient after their portal reloads.
7. Test Meet verification by opening the link in an authenticated browser and confirming
   only after the Meet page is actually accessible.

LOCAL VALIDATION
- index.html inline JavaScript: node --check passed.
- server.js: node --check passed.
- Code.gs: JavaScript parser syntax check passed (Apps Script runtime not available).
- ZIP integrity test passed after packaging.
