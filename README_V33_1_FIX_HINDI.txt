GWC V33.1 — FEE SLIP DUPLICATE GUARD + REJECTED ARCHIVE + OLD ID SLOT RECOVERY
=================================================================================

BASE PACKAGE
------------
This build updates the uploaded GWC_V33_MONTHLY_SALARY_FEE_ARCHIVE_SESSION_UPDATE.zip.
The uploaded archive itself was V33-labelled and included README_V32_FINAL_HINDI.txt and
README_V33_UPDATE_HINDI.txt; a separate original V32 ZIP was not present in this upload.
Existing Code.gs, server.js, package.json, appsscript.json and prior README files are retained
unchanged. The update is additive in index.html plus this report.

ADDITIONAL FIXES IN V33.1
-------------------------
1) Parent fee-slip duplicate protection
- A student can successfully submit only one parent fee slip for the same selected month.
- After a successful upload, the Parent/Student portal hides the upload form and displays a
  confirmation message.
- A second upload attempt is blocked with an "already uploaded" message.
- Archived/replaced historical submissions also count as an existing submission, unless
  Admin explicitly requests a corrected/new slip for that same month.
- Failed Drive uploads do not set the successful-submission marker.

2) Admin re-request / corrected slip
- Fee Management includes "Request new parent slip".
- Admin can archive the currently attached Drive slip (where it is a Drive file), retain its
  URL and metadata in the record's slipHistory, then explicitly reopen parent upload for that
  student/month.
- Admin's own Upload / Replace control remains available.

3) Repeated rejected fee request archive
- The first rejected request for a student/month remains active as the audit reference.
- Later rejected attempts for that same student/month have an Admin "Archive repeated
  rejection" action.
- Archived rejected request records are retained in gwcFeeRequestArchive and can be restored.
- The existing request/slip history is not permanently deleted by this archive action.

4) Old Available Slots recovery
- Old Available Slots now reconciles legacy inactive student login records that have no
  matching student record and are not in Trash.
- Their Login ID and release metadata are copied to gwcDeletedAccounts, then the inactive account is removed
  from the active users list so the Login ID can genuinely be reused.
- Already released IDs that are currently in use are filtered out of the available list.
- Existing deleted-account archives remain available; a manual refresh action is provided.

5) Legacy duplicate month rows
- Duplicate gwcMonthlyFees rows for the same Student ID + Month are consolidated to one
  active row.
- Extra rows are copied in full to gwcFeeSlipArchive with archive reason and timestamp.
- Drive files are not permanently deleted by this reconciliation.

FILES CHANGED
-------------
- index.html: appended additive V33.1 protections and archive/recovery controls.
- README_V33_1_FIX_HINDI.txt: this update report.
- Existing Code.gs / server.js / package.json / appsscript.json: unchanged.

VALIDATION PERFORMED
--------------------
- All 21 inline JavaScript blocks pass Node.js `node --check`.
- Logic harness verified: inactive orphan Login ID is recovered and appears in Old Available
  Slots; duplicate monthly rows reduce to one active row while the extra row is preserved in
  archive; second parent upload is blocked; later repeated rejected request archives and the
  first rejected request remains active.
- ZIP CRC/integrity check is performed on the final archive.
- Live Google Sheets / Drive / Apps Script / Render deployment, real account login, and
  multi-device synchronization were NOT testable in this offline environment. Browser
  runtime smoke test was blocked by the execution environment. Do not call this live
  production verified until staging verification is complete.

IMPORTANT DATA-SAFETY LIMITS
----------------------------
- The system cannot recover a Login ID that was permanently removed from both the active
  Users data AND all deleted-account/audit archives; the original username no longer exists
  in the supplied data. V33.1 can recover inactive orphan accounts still present in Users.
- Repeated rejected fee request rows are archived, not hard-deleted. This protects audit and
  payment evidence. Admin can restore them.
- Parent duplicate protection and request/archive metadata use the existing state/save and
  Google sync path. Deploy the updated index.html to the same existing Render service.
- No Google Apps Script deployment change is required for these frontend state-only changes.
  Existing Drive archive actions still require the currently configured Apps Script backend
  and its existing Drive permissions to be operational.

SAFE DEPLOYMENT
---------------
1. Back up the current production ZIP, Google Sheet, Drive fee-slip folders, and Render source.
2. Deploy only the updated index.html from this ZIP to the existing Render project first.
3. Do not change the existing Apps Script URL, Script Properties, spreadsheet ID, Render
   environment variables, proxy secret, login credentials, or permissions.
4. On staging, test a parent upload twice for one student/month, Admin re-request, admin upload,
   multiple rejected requests, archive/restore, old available slot recovery, and login reuse.
5. Confirm Google Sheet records and Drive file locations before production rollout.
