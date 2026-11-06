GWC V26 FINAL — WHATSAPP HELP DESK DRAFT / SEND REPAIR
======================================================

Based on the uploaded GWC_V25_HELPDESK_REPAIR_FULL.zip.

FILES CHANGED
- index.html only.

FIXES
1. WhatsApp Help Desk is excluded from the 6-second visual auto-refresh. The chat panel is no longer rerendered on that timer, so typed text and selected attachment are not cleared by the timer.
2. The global 5-second cloud refresh is paused while the WhatsApp Help Desk tab is open, preventing the global poll from replacing the active chat UI/draft.
3. Fixed the `contacts is not defined` JavaScript scope error. The existing role-filtered contact function is exposed through `window.gwcV21Contacts` and used by the send handler.
4. Message is added only after the user presses Send. The handler awaits the Google save response before clearing the form and showing the updated chat. On failure, it removes the unsaved message and leaves the typed text in the composer.
5. Existing menu de-duplication, dashboard inbox preview, message read status, credentials, settings, server code and data schema are retained.

IMPORTANT BEHAVIOUR
- No automatic cloud refresh is performed while the WhatsApp Help Desk tab is open. This is intentional to protect an in-progress draft.
- After leaving and reopening the Help Desk (or using the site's normal reload/navigation), the normal cloud state is loaded. This package does not add WebSocket/push delivery.
- Seen/Pending remains based on the existing `readBy` field and successful cloud save.

DEPLOYMENT
1. Take a backup of the currently deployed `index.html` and Google Sheet/Drive data.
2. Replace ONLY the deployed website's `index.html` with this package's `index.html`.
3. Do NOT replace `Code.gs`, `server.js`, `package.json`, settings, login credentials, or the database.
4. Deploy the same existing website/service.
5. Test: open WhatsApp Help Desk, type a message, wait at least 15 seconds, confirm draft remains, then press Send. Confirm it appears after successful save and reaches the intended recipient after their cloud state refreshes.

VALIDATION
- All inline JavaScript blocks in index.html passed `node --check`.
- This is a source-level validation; a live Google Apps Script / deployed website end-to-end test was not possible from the supplied ZIP alone.
