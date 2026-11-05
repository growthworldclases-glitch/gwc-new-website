GWC V22 — ADDITIVE CHAT ATTACHMENTS + WELCOME POSTER + RELEASED CREDENTIAL VIEW
=================================================================================

BASE / PRESERVATION
- Built from the uploaded GWC_V21_ADDITIVE_UPDATE(1).zip.
- Only index.html is changed. All other V21 files (Code.gs, server.js, package.json,
  earlier README files and deployment configuration) are retained byte-for-byte.
- No existing login ID/password, role, student/teacher record, batch/course setting,
  fee record, test, homework, attendance, Meet setting, sheet schema, Drive folder
  setting, Apps Script URL, Render proxy or backup/reset code is intentionally changed.
- Existing public-site main poster upload/delete controls remain unchanged.

V22 ADDITIONS
1. WhatsApp Help Desk file attachment:
   - Chat composer accepts PDF, JPG, PNG, WEBP and GIF.
   - Maximum upload size: 10 MB per file (matches the existing Apps Script Drive
     upload limit).
   - Attachment URL, file name and MIME type are saved with the chat message.
   - Images display a preview; PDFs and other supported files open through a link.
   - Works for direct conversations and Admin broadcast groups.
   - No new sheet or database is created.

IMPORTANT FILE SHARING NOTE
- The existing Code.gs upload endpoint makes files link-viewable unless
  privateFile:true is supplied. V22 uses the existing link-viewable upload behavior
  so chat recipients can open attachments without a new authenticated file service.
- Anyone who obtains/forwards the Drive link may be able to view that attachment.
  Do not send confidential student records, identity documents or sensitive files
  through this legacy chat. A fully private attachment system requires authenticated
  participant-based Drive access on the server.

2. Welcome Poster Manager:
   - Admin > Logo & Visitor Homepage (Branding) now includes Add Welcome Poster.
   - Existing welcome posters are listed with Replace / Update and Delete controls.
   - Replacement uploads the new poster and attempts to move the old Drive file into
     GWC_Deleted_Items before updating the saved poster URL.
   - Delete attempts to archive the Drive file into GWC_Deleted_Items before removing
     its URL from the public welcome poster list.
   - If the old URL is not a Drive file ID, it is removed from the active list but
     cannot be moved by the Apps Script archive action.
   - Existing Main Poster and Logo controls are retained.

3. Released credential view:
   - Admin > Historical ID Management adds a Released Credentials section.
   - It displays stored Login ID and Password values for inactive student/teacher
     accounts and provides a Copy ID + Password action.
   - This is a credential visibility/copy facility only. It does NOT automatically
     reactivate or assign an old account to a new student. Before reusing an ID,
     Admin must ensure the old account is inactive and old student data/associations
     are not exposed. The legacy data model has no server-side ID reservation ledger,
     so automatic recycling is not enabled.

VALIDATION
- All inline JavaScript blocks in index.html pass Node.js syntax check.
- server.js and Code.gs are retained unchanged from V21.
- ZIP integrity test passes after packaging.
- No live Render, Apps Script, Google Sheets, Google Drive or real-account test was
  possible here. Test with non-critical accounts and a backup before production use.

DEPLOYMENT
1. Keep a backup of the current Render deployment and Google spreadsheet.
2. Replace the files on the same Render/GitHub project with this ZIP's contents.
3. Keep GWC_API_URL, Apps Script deployment URL, Script Properties, spreadsheet ID,
   Drive folder ID and all Render environment variables unchanged.
4. No Code.gs redeployment is intended for V22; it uses the existing upload and
   archivefile actions already present in the V21 Code.gs.
5. Test direct chat PDF/photo, broadcast group attachment, poster add/replace/delete,
   and Released Credentials using test accounts before relying on the live system.
