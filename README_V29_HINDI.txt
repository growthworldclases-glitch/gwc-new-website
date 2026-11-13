GWC V29 — LIVE PRESENCE, TEACHER CONTACTS, DASHBOARD HIDE & DRIVE TRASH
============================================================================

Base: GWC_V28_CLASSWISE_WEEKLY_SCHEDULE_ADDON(1).zip

ADDITIVE CHANGES
----------------
1. Live status:
   - Adds a separate GWC_Live_Presence sheet. It does not write to the primary
     GWC_Storage JSON and does not change user IDs, passwords, courses or settings.
   - Teacher dashboards show online/offline status for assigned, active students.
   - Student dashboards show the assigned teacher's online/offline status.
   - Presence expires after 90 seconds without a heartbeat. The browser sends a
     heartbeat approximately every 20 seconds while the portal is open.
   - This indicates an active GWC portal session, not whether a person is physically
     in the Google Meet room or has joined the meeting.

2. Teacher contact details:
   - Teachers see mobile numbers for their assigned students only.
   - Call now opens the device dialer; Chat now opens WhatsApp (wa.me).
   - Students are not shown teacher phone numbers.
   - A legal warning appears above the teacher contact list.

3. Help Desk dashboard:
   - Adds a Hide action to the dashboard Help Desk message preview.
   - Hiding affects only the current account's dashboard preview. The message is not
     deleted and remains in its WhatsApp Help Desk conversation.
   - Existing message/chat data is retained.

4. Admin Drive Trash shortcut:
   - Adds an Admin sidebar item that opens the existing GWC_Deleted_Items Drive folder.
   - If Google Drive requires authentication, Google will display its sign-in flow.

5. Push notifications:
   - The supplied V28 source did not contain a VAPID push-subscription implementation
     or a dedicated push-enable button. The in-app Notification Centre is retained;
     it is not a browser push notification control.

DEPLOYMENT
----------
1. Extract the ZIP and replace the corresponding repository files (index.html,
   server.js, Code.gs). Keep package.json and appsscript.json.
2. Deploy the updated server.js to the existing Render service. Keep existing Render
   environment variables unchanged.
3. Update the existing Apps Script project with the supplied Code.gs and update the
   existing Web App deployment. Keep all existing Script Properties unchanged.
4. The first presence request creates a separate GWC_Live_Presence sheet in the
   existing spreadsheet. No existing sheet or primary state is reset.
5. Test with one teacher and at least two assigned student accounts.

IMPORTANT LIMITS
----------------
- Online means the GWC portal has sent a recent heartbeat. It cannot prove that the
  teacher/student is inside Google Meet, has camera/microphone enabled, or is present
  in the actual meeting. Google Meet does not expose that participant state to this
  website through the existing integration.
- A teacher can use the existing WhatsApp Help Desk contact list to send an individual
  message to the selected student. The live list helps identify currently active
  student accounts; it does not automatically send messages.
- Google account sign-in state cannot be reliably detected by this app on the user's
  PC. The Drive shortcut opens the folder; Google itself handles sign-in if needed.
- The legal warning is displayed as requested. Whether a ₹100,000 penalty or legal
  action is enforceable depends on the applicable signed terms, evidence and law.
- The app uses a legacy shared-state architecture. Presence is isolated from the
  primary JSON state, but the existing app's general authentication model should
  still receive a separate security review before public production use.
