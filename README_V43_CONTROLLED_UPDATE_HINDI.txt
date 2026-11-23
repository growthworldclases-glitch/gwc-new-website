GWC V43 – CONTROLLED HELP DESK ARCHIVE UPDATE
Base: GWC_V42_FINAL_CONTROLLED_UPDATE.zip, ultimately based on GWC_V33_5_QR_PAUSE_FIX.zip.

Changes in V43:
- Last Date of Class remains the display label (not Last Fee Paid Date).
- Monthly Parents Feedback alert remains monthly.
- Student Google AccountChooser -> validated Meet URL flow retained. Teacher join handler remains unchanged.
- Dashboard shows latest one message; View All opens the full active message list. Legacy Hide/Unread workflow is not used by this latest-message view.
- Delete by Admin/Teacher/Student (within their own or joined Help Desk/group message scope) now soft-archives the message to existing state.gwcDeletedItems.
- Admin can open Deleted Help Desk, Select All, Restore Selected, Permanent Remove Selected, or restore/permanently remove one message at a time. Only Admin has permanent removal controls.
- Existing GWC-managed teacher group auto-assignment and active/inactive membership reconciliation are retained. External WhatsApp groups are not modified.
- Standalone Today Notes / View and Download Today Notes navigation and matching buttons are hidden; attachments in Help Desk remain supported.

Preservation: No login credentials, assigned course/student records, Code.gs, server.js, package.json, appsscript.json, or database schema migration is changed in this update.

Testing boundary: JavaScript syntax, JSON validity, ZIP integrity, protected-file byte comparison, and source-level feature checks are performed. Live Google Sheets/GAS sync, real account selection and Meet app handoff on physical Android devices, external WhatsApp API actions, and Render deployment cannot be truthfully certified from this offline ZIP build. Android handoff depends on device/browser/Google Meet installation and Android App Links settings.

Deployment: Deploy to a staging Render service first. Keep existing Render build/start commands, environment variables, Apps Script deployment, spreadsheet IDs, and Drive IDs unchanged. Test all four roles and verify cloud sync before production.
