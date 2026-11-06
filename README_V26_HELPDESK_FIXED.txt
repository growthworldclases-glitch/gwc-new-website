GWC V26 HELP DESK FIX
=====================

Changed file: index.html only (additive patch appended at end).

Fixes:
- Prevents the V23 six-second Help Desk renderTab refresh from replacing the composer while typing or sending.
- Resolves contacts from the existing state for admin, teacher, student and subadmin roles; fixes "contacts is not defined".
- Sends only after explicit Send/form submit.
- Keeps typed text in the composer if the cloud save fails; clears it only after Google confirms save.
- Preserves the existing data model, credentials, IDs, settings, and other features.

Deployment:
1. Back up the deployed website and Google Sheet.
2. Replace ONLY index.html in the existing project with this archive's index.html.
3. Do not replace Code.gs, server.js, package.json, or change Render environment variables / Apps Script properties.
4. Redeploy the same existing Render service.
5. Test with admin, teacher and student accounts. Type a message and wait at least 15 seconds; it should remain. Send and confirm the other account receives it.

Note:
- Cross-user messages still depend on the existing Google Apps Script polling/sync; this patch does not add instant push/WebSockets.
- This is a source-level repair and syntax-checked, but a live deployment test against your Google Sheet/Render credentials is not possible from this ZIP alone.
