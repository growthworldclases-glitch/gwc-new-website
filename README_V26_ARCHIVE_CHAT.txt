GWC V26 — ARCHIVE CHAT MANAGEMENT PATCH
=======================================

Based on the user-provided GWC_V25_HELPDESK_REPAIR_FULL.zip.

WHAT CHANGED
------------
Only index.html was modified. The patch is additive and introduces:
- Admin-only "Archive Chat" dashboard menu.
- Archive Chat page showing archived conversations and individual messages.
- Admin can archive one message from the chat bubble (existing control, routed to the new archive).
- Admin can archive an entire selected conversation from the WhatsApp Help Desk chat header.
- Archived messages can be restored individually.
- Archived messages can be permanently deleted individually.
- An entire archived conversation can be permanently deleted from Archive Chat.
- Existing archived group entries remain visible and can be restored or permanently deleted.
- Sender and recipient continue to see their shared conversation in their respective chat boxes while messages remain active.

PRESERVATION
------------
- Code.gs, server.js, package.json, existing IDs/passwords, settings, login, database schema,
  and all other existing files are unchanged.
- No existing active message is deleted by this patch.
- Archive is a soft-delete: records are moved into the existing state.gwcDeletedItems array.
- Permanent deletion removes selected archived records from the existing state store.

DEPLOYMENT
----------
Recommended: replace ONLY the deployed index.html with this package's index.html.
Do not replace Code.gs, server.js, package.json, Render environment variables, or Google Sheet.
The FULL ZIP is a complete source bundle for backup/review; it is not necessary to upload
all files to Render if only index.html changed.
The PATCH-ONLY ZIP contains index.html and this README.

TEST
----
1. Login as admin and open WhatsApp Help Desk.
2. Open a conversation; confirm "Archive entire chat" appears.
3. Archive a single message; it should disappear from the active chat and appear in Archive Chat.
4. Archive the entire conversation; its messages should appear grouped in Archive Chat.
5. Restore a message; it should return to the active conversation.
6. Permanently delete one message or an entire archived conversation.
7. Login as the sender and recipient to verify each sees the same active conversation before archiving.

LIMITATIONS
-----------
- This is an additive front-end change using the existing Google Apps Script state-save mechanism.
- Cross-account synchronization still depends on the existing polling/sync setup and Google save succeeding.
- I can syntax-check the JavaScript here, but cannot authenticate to the live Google Sheet/Render deployment
  from this ZIP. Verify with the test steps above before production use.
