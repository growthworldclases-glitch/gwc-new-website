GWC V25 ADDITIVE HELP DESK REPAIR
=================================

Based on uploaded GWC_V24_SECURE_COMPLETE_19_FILES.zip.

CHANGED FILE
- index.html: additive browser-side repair appended after the existing V24 code.
  * Prevents cloud polling from replacing an actively edited helpdesk draft.
  * Sends only on explicit Send button/form submit and awaits Google save response.
  * Exposes arr2 compatibility helper to prevent legacy inline-handler ReferenceError.
  * Deduplicates repeated dashboard menu entries (including Ask Your Doubt).
  * Adds colourful menu markers and a dashboard Help Desk inbox preview.

PRESERVATION
- All original archive files are retained in the FULL ZIP.
- Code.gs, server.js, package.json, existing login credentials, settings and database schema are not edited.
- No existing feature/data is intentionally deleted or migrated.

DEPLOYMENT
1. Keep a backup of the current deployed website and Google Sheet/Drive.
2. For the existing GitHub/Render website, replace ONLY index.html with the index.html
   from this package, commit, and deploy the same Render service.
3. Do not replace Code.gs or server.js for this frontend-only repair.
4. Test with one admin, one teacher and one student account before general use:
   - type a draft and wait longer than 10 seconds; draft must remain
   - send a message; verify it appears after successful cloud save
   - verify recipient login sees it
   - open the message; verify sender sees Seen/read status after cloud sync
   - verify the duplicate Ask Your Doubt menu entry is gone
5. If any test fails, restore the backed-up index.html.

IMPORTANT LIMITATIONS
- Google Sheets polling is not instant push. Cross-user updates appear after the existing
  polling interval and successful server sync; true WebSocket/Firebase-style push is not added.
- Seen status is based on readBy being saved to Google successfully.
- This archive does not contain the original poster image assets as separate files.
  The pre-login poster visibility issue therefore needs the actual poster image/data and
  a browser test against the deployed site before it can be certified fixed.
- Dashboard inbox preview shows messages present in the locally synchronized state.
  It cannot show messages that have not yet reached the Google backend.
