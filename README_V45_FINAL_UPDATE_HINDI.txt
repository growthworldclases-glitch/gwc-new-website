GWC V45 – CONTROLLED UPDATE
Base: GWC_V33_5_QR_PAUSE_FIX.zip, carried forward through V44.

Latest requested refinements:
- Dashboard latest-message panel now includes eligible direct and GWC-managed group messages, and displays only one latest full message. View All shows the full message list.
- Message deletion remains a soft archive; user-side delete moves messages to Admin Deleted Help Desk. Only Admin can restore or permanently remove archived messages, individually or selected/all.
- Admin dashboard provides Deleted Help Desk access beside View All.
- Standalone “View and Download Your Today Notes” / “Upload Your Today Notes” entry points are removed; PDF/photo attachments in Help Desk remain.
- Admin Help Desk label uses “Messages”, not “Inbox”.
- Previous requirements carried forward: Last Date of Class, monthly Parents Feedback alerts, Student Google AccountChooser flow, unchanged Teacher join workflow, and automatic teacher-owned GWC group membership synchronization.

Preservation: index.html is the only existing application source changed in this update. Code.gs, server.js, package.json, appsscript.json and all existing IDs/configuration remain carried forward unchanged. No database reset or migration.

Limitations: Website code cannot force Android to launch the installed Meet app after Google account selection; Android verified-link handling, installed app state, browser settings and Google account state determine the final handoff. Physical Android and PC testing, live Render/Apps Script/Sheets sync, role login and external WhatsApp API behavior are not claimed as tested. Automatic group membership applies only to GWC-managed in-app groups; external WhatsApp groups need supported WhatsApp Business API access.
