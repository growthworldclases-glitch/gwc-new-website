GWC V44 – CONTROLLED UPDATE (18 Nov 2026)

Base ZIP: GWC_V33_5_QR_PAUSE_FIX.zip, carried forward through V43 controlled updates.

User-requested corrections retained/confirmed in source:
- Teacher register displays “Last Date of Class” (not Last Fee Paid Date). Date is derived from the student's current/most recent class-validity period or existing monthly-fee validity record.
- Parents Feedback reminder is MONTHLY, with monthly pending count/alert.
- Student Join My Class uses Google AccountChooser and returns to the validated Google Meet URL. Teacher join workflow is left unchanged. On Android, the final handoff to Meet app versus browser is controlled by Android verified links, installed apps, browser/account state and device settings; it cannot be guaranteed by website code alone.
- Dashboard displays only the latest one message; View All opens the full list. The old Hide/Unread system is not used for the dashboard message panel.
- Message deletion is a soft archive into existing state.gwcDeletedItems. Admin can restore or permanently remove one or selected/all archived messages from Deleted Help Desk. The shortcut is shown beside View All on Admin dashboard. Permanent removal is Admin-only.
- Teacher-owned GWC Help Desk groups are auto-created/maintained from assigned active students. Inactive students are removed; when active again, they are re-added to the same teacher group. Membership history is maintained in existing state. This only controls GWC-managed in-app groups, not external WhatsApp groups.
- Admin Search Teacher / Student list is alphabetized, initially shows one member, and provides View More / View All Members. Searching filters the full list.
- “Inbox” wording in Admin Help Desk is changed to “Messages”. Standalone Today Notes / View and Download Today Notes options remain hidden; ordinary PDF/photo sharing in Help Desk remains available.

Preservation: This update changes only index.html and adds this README/report. Code.gs, server.js, package.json, appsscript.json, existing login credentials, IDs, assignments, course setup, and database schema are carried forward unchanged from the V33.5 base. No migration or data reset is included.

Testing report: Inline JavaScript syntax, Code.gs/server.js syntax, JSON validity, ZIP integrity, protected-file hashes, and source-level checks are performed offline. This does NOT equal live end-to-end verification. Live Render deployment, Google Sheets/Apps Script sync, all four role logins with real records, attachment uploads, real Android account selection/app handoff, desktop browser tests, and any external WhatsApp API integration require the user's configured services and physical devices and are not claimed as passed.

Deployment: Upload this ZIP to a separate/staging Render service first. Keep existing Render start/build settings, environment variables, Apps Script deployment, Spreadsheet ID, Drive Folder ID, and secrets unchanged. Validate Admin, Teacher, Subadmin and Student roles and cloud sync before replacing production.
