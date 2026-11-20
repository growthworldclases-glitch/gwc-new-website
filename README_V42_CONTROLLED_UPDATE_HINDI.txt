GROWTH WORLD CLASSES – V42 CONTROLLED UPDATE
Base: GWC_V41_FINAL_CONTROLLED_UPDATE.zip (which retains V33.5 base and V34–V41 controlled additions).

V42 follow-up changes:
1. Student Join My Class normal path and Force Active path both route through the existing Google AccountChooser -> validated Meet URL flow. Teacher join workflow is not modified.
2. Admin dashboard shows an explicit “Permanent Delete All” control immediately beside View All. It uses the existing Admin-only delete-all-visible handler and confirmation.
3. Admin Help Desk heading “Help Desk Inbox” is normalized to “Help Desk Messages”; dashboard uses “Latest Message”.
4. Existing latest-one-message dashboard, View All listing, role-based per-message deletion, teacher GWC-managed auto-group sync, inactive/active membership reconciliation, monthly feedback alert and Last Date of Class display are retained.

Preservation:
- Code.gs, server.js, package.json and appsscript.json are retained unchanged from V33.5 base.
- No database migration, reset, login/credential/assignment change is included.
- Teacher's original Join My Class handler is preserved; only Student routes are intercepted.

Important technical limits:
- AccountChooser redirects to the Meet HTTPS URL after the student selects an account. Whether Android hands that URL to the Meet app or leaves it in the browser depends on Android App Links verification, installed Meet app, browser and device settings. This cannot be guaranteed by ZIP/static tests; test on actual Android devices.
- Teacher group automation is for GWC-managed in-app groups only. External WhatsApp group membership changes require WhatsApp Business Platform/API and approved integration; no unsupported action is faked.
- Group membership reconciliation and monthly feedback alert run during dashboard/render/sync activity, not from a server cron job.
- Permanent deletion removes messages from current app state; remote backups/snapshots may retain historic copies.

Deploy: Extract and deploy to a staging Render service first. Keep existing Render Build/Start settings and Google Apps Script deployment/configuration unchanged. Verify role logins, Sheets sync, Student account chooser on Android, Teacher join, and group membership lifecycle before production.
