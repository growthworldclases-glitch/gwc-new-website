GWC V21 — ADDITIVE MEET STATUS, CLASSROOM ACCESS & CHAT UI
=========================================================

BASE / PRESERVATION
- Built directly on the supplied GWC_V20_PERSISTENT_LOGIN_PRIVATE_HELPDESK.zip.
- Existing HTML, Code.gs, server.js, package.json, IDs/passwords, roles, batch/course
  assignments, persistent login, student pause/resume, fee system, demo workflow,
  notes, tests, homework, attendance, uploads, backups and settings are retained.
- No account/password/batch migration and no Apps Script Code.gs replacement.

ADDITIONS
1. Meet status: teacher rows show a green indicator when the URL is a valid HTTPS
   Google Meet URL format and a red indicator with the reason when missing/invalid.
   IMPORTANT: a browser cannot verify whether a meeting is currently live, whether
   the teacher is signed in, or whether Google permits the current account to join.
   Green therefore means URL format valid, NOT live meeting confirmed.
2. All Classes · Join: Admin and Sub-admin receive a page listing active courses and
   can open any course's course Meet URL or assigned teacher Meet URL.
3. Helpdesk UI: WhatsApp-inspired message layout, text messages, optional attachments,
   direct Admin/Teacher/Student conversations, and Admin-only deleted chat bin.
   Student/parent messages are directed to Admin only; no teacher destination is
   offered to students/parents. Admin can create parent broadcast groups and send
   updates to selected or all student/parent portal accounts.
4. Chat deletion moves messages to a GWC deleted-items list; Admin can permanently
   remove them later. Existing global Trash remains unchanged.
5. Hindi portal banner: “Teacher या Parents अपने discussion के लिए यहाँ क्लिक करें।”

IMPORTANT TECHNICAL / SECURITY LIMITATIONS
- The current app uses a shared legacy JSON state endpoint and client-side role
  filtering. This is not server-enforced private messaging. Do not use it for highly
  sensitive personal/financial/medical documents without a separate authenticated,
  role-authorized messaging backend.
- Chat attachment upload currently uses the existing Drive upload endpoint and
  link-viewable sharing so recipients can open it. Do not attach sensitive documents.
  For truly private attachments, add authenticated per-recipient Drive permissions.
- Group messages and chats are stored in the same shared state JSON as other app data.
  Long-term growth can eventually hit Apps Script/Google Sheets execution, payload,
  quota, and latency limits. No software can promise “10 years without crash”. A
  production-scale design should move messages/attachments to a dedicated database
  and storage with server-side authorization, pagination, retention, monitoring,
  and automated backups. Google Drive capacity alone does not remove these limits.
- The current Apps Script Drive archive action moves files to GWC_Deleted_Items, but
  this V21 chat bin is a logical state archive. It does not automatically move every
  deleted chat attachment file in Drive. File lifecycle automation needs a secure
  attachment-ID mapping and a scheduled purge/review job.
- Live Render, Google Apps Script, Sheets, Drive and real user accounts were not
  accessible during this offline ZIP update. Test with dummy accounts before rollout.

DEPLOYMENT
- Back up the current deployed ZIP and Google Sheet first.
- Replace website files on the existing Render service using this ZIP; keep the same
  GWC_API_URL environment variable and Apps Script deployment.
- No Code.gs deployment is required for these browser-side changes.
- Test Meet status with missing, invalid and valid-format test URLs; test admin and
  sub-admin Join All Classes; test parent-to-admin, teacher/student conversations,
  broadcast group membership, attachment opening and deleted-message review.

VALIDATION
- index.html inline JavaScript and server.js syntax checked with Node.js.
- Code.gs syntax checked with Node.js parser.
- ZIP integrity checked after packaging.
