GWC V33 — V32 ADDITIVE MAINTENANCE UPDATE
=========================================

BASE / PRESERVATION
-------------------
Built directly from the uploaded GWC_V32_MONTHLY_SALARY_FEE_HELPDESK_FINAL(1).zip.
All original ZIP entries are retained. The following existing files were intentionally
left byte-for-byte unchanged: appsscript.json, package.json, all prior README files.
index.html, Code.gs and server.js received additive updates only.

V33 CHANGES
-----------

1) Salary payment ledger and receipts
- Salary payments are now recorded as separate dated transactions rather than replacing
  the previous paid total.
- Existing V32 paidAmount values are migrated into a legacy ledger entry when a new
  transaction is first recorded, avoiding loss of the earlier total.
- Remaining balance and paid percentage are recalculated from the ledger.
- Teacher My Payment shows month-wise payable, paid, balance and payment history.
- A receipt image (SVG) can be generated for each payment by Admin and the relevant
  Teacher. Receipt includes GWC name, teacher, month, payable, payment amount, total paid,
  remaining balance and payment date.
- Admin can toggle per-teacher permission for Student-wise salary detail. Default is OFF.
  Teacher view shows student detail only when Admin turns it ON.

2) Message Hide / Archive
- Chat messages can be archived for the currently logged-in user in Admin, Subadmin,
  Teacher and Student roles.
- Archived messages are filtered from that user's active chat and shown in the
  Archived / Hidden Help Desk Messages panel.
- Restore removes only that user's archive marker; it does not delete the source message.
- Admin permanent-delete capability remains available.

3) Old Available Slots / Student Login ID reuse
- New Admin menu: Old Available Slots.
- It lists Login IDs released by permanent student account removal.
- Admin can put an available ID into the Create Student form. The new student's
  remaining details are entered fresh; old student personal details are not copied.
- The released-ID archive entry is cleared only after a student account with that
  Login ID is actually present after the create handler runs.
- Trash/deactivated student accounts are not listed as free IDs.

4) Login session revocation
- Existing session persistence remains; the local session stores role, account ID,
  Login ID and a numeric session version, never the password.
- New Admin menu: Login Session Management.
- Admin can increment one account's session version to revoke its saved session.
  The revoked account is rejected on its next session restore / refresh / browser reopen.
- Other users' sessions are not invalidated by this action.
- This is not an instant push logout of an already-open tab; the account is rejected
  when its session is next restored. User-initiated logout remains unchanged.

5) Dedicated three-month fee-slip archive
- Fee slips now move into a dedicated Google Drive folder named "Deleted Fee Slips".
- Added Apps Script actions archivefeeslip and restorefeeslip.
- Admin can restore an archived slip back into the normal GWC upload folder or permanently
  delete it (Drive trash action), subject to the existing Drive permissions.
- Added processGwcFeeSlipArchive() daily job. It archives fee slips whose payment/upload
  date is at least three calendar months old, retaining the month/student record and
  archived file ID/link in the state.
- installGwcDailyFeeTrigger() now installs both the existing fee expiry trigger and the
  three-month fee-slip archive trigger.

6) Fee report refinement
- Student ID is shown explicitly in the month-wise fee table.
- Admin can edit Fee Payment Date along with the existing fee amount, teacher payable,
  and validity dates.

FILES CHANGED
-------------
- index.html
- Code.gs
- server.js
- README_V33_UPDATE_HINDI.txt

FILES / DATA PRESERVED
----------------------
- Existing admin / subadmin / teacher / student / parent portals and login records.
- Existing credentials, course and batch records, assignment data, settings, UI structure,
  Apps Script URL, Render proxy configuration and previous README documents.
- Existing spreadsheet and Drive data are not changed by creating this ZIP.

VALIDATION PERFORMED
--------------------
- All 18 inline JavaScript blocks pass Node.js syntax validation.
- Code.gs passes JavaScript syntax validation.
- server.js passes JavaScript syntax validation.
- ZIP integrity test passes after packaging.
- All original ZIP entry names are retained; new README added.

NOT VERIFIED IN THIS ENVIRONMENT
--------------------------------
- Live Google Sheets / Drive operations, live Apps Script authorization, Render deployment,
  actual login credentials and real multi-device synchronization cannot be tested from
  this offline ZIP-editing environment.
- The existing backend still stores the website state as one JSON document. LockService
  serializes writes and the existing backup sheet protects prior snapshots, but this is
  not a true record-level transaction system and cannot fully prevent a stale browser
  copy from overwriting another browser's newer state. This requires a separately
  designed revision/record-level API and coordinated frontend changes; it is not claimed
  as solved in this release.
- Session revocation is enforced on the next restore, not as an immediate remote logout
  push to a browser tab that is already active.
- Three-month automatic Drive archiving will run only after the updated Code.gs is deployed
  and an Admin executes installGwcDailyFeeTrigger() once in the Apps Script editor,
  authorizes Drive/Sheets/Triggers scopes, and confirms the trigger is installed.
- The dedicated archive and restore actions require redeploying the updated Apps Script
  Web App version and the updated server.js on Render. Keep the existing Script Properties,
  spreadsheet ID, deployment URL and proxy secret unchanged.

SAFE DEPLOYMENT STEPS
---------------------
1. Back up the current Google spreadsheet and Drive folder, plus the current GitHub/Render
   source ZIP before replacing anything.
2. Deploy the updated server.js and index.html to the existing Render service. Keep all
   existing Render environment variables unchanged.
3. Update the existing Apps Script project with this ZIP's Code.gs and deploy a new Web App
   version using the same deployment access and Script Properties.
4. In Apps Script, run installGwcDailyFeeTrigger() once and approve the requested scopes.
5. Test on a staging copy: Admin / Teacher / Student login, salary entry and two partial
   payments, receipt image, teacher privacy OFF/ON, month-wise fee slip upload/replace/
   restore, archived message restore, released ID reuse, and account session revoke.
6. Only after staging verification, deploy to production.

IMPORTANT
---------
This package is an additive maintenance build with syntax and archive-integrity checks.
It must not be described as live-production-verified until the staging and live Google
backend tests above have actually passed.
