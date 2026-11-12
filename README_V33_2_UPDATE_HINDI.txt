GWC V33.2 — TARGETED FEE DUPLICATE / REJECTED ARCHIVE / SLOT RECOVERY PATCH
=============================================================================

BASE
----
Based on the uploaded GWC_V33_1_FEE_DUPLICATE_SLOT_FIX.zip.
Existing source files and backend configuration are retained. Code.gs, server.js,
package.json and appsscript.json are unchanged in this patch.

CHANGES IN V33.2
----------------
1. Parent monthly fee-slip upload is now append-once:
   - If the selected student's current-month record already has a successful slipUrl,
     the parent receives an "already uploaded" message and cannot upload again.
   - Parent upload no longer silently replaces an existing slip. Replacement remains
     an Admin action.
   - JPEG type and 1 MB limit are checked before upload.

2. Duplicate request guard:
   - Pending/approved Fee Requests and a successful month-wise Fee Slip record are
     checked before a new public/parent fee request is submitted.
   - Rejected or archived requests do not block a fresh resubmission.

3. Repeated rejected submissions:
   - Admin Fee Summary now shows an action when a student/month has multiple rejected
     submissions.
   - The first rejected record is retained as the audit anchor.
   - Subsequent rejected records can be archived to the existing Drive archive action
     and marked archived_rejected in the saved state; their record history is retained.
   - Admin can record a fresh-slip request for the parent. This does not grant course
     access or approve payment.

4. Legacy Old Available Slots recovery:
   - Legacy inactive orphan student accounts are surfaced for explicit Admin review.
   - Admin must use the existing Archive & Release operation before an ID becomes
     available; inactive or trashed accounts are not silently reused.
   - Existing deleted-account records and reuse safeguards remain in place.

PRESERVED
---------
- All ZIP entry names from V33.1 are retained.
- Code.gs, server.js, appsscript.json and package.json are byte-for-byte unchanged.
- Existing login/account data, UI, settings, course/batch data and backend URLs are not
  edited by generating this source ZIP. No live Google Sheet/Drive data was modified.

VALIDATION
----------
- ZIP integrity test passed.
- The new V33.2 JavaScript patch passes Node.js syntax validation.
- Code.gs passes Node.js syntax validation.
- server.js passes Node.js syntax validation.
- Full live end-to-end tests are not possible in this offline workspace.

NOT CLAIMED / STILL REQUIRES LIVE STAGING TEST
----------------------------------------------
- This patch does NOT implement the requested Admin salary-cycle date / fixed 30-day
  salary calculation and deduction-with-reason workflow. The existing V33.1 salary
  calculation remains based on assignment dates and calendar-month day count. It must
  not be treated as fixed 30-day salary logic.
- The student fee-expiry QR fallback, teacher salary cycle date display, forced-batch
  green/red indicator and full salary payout reconciliation have not been altered here.
- Existing old slots can only be verified against the live synchronized account state
  after deployment. Legacy orphan release requires Admin confirmation.
- Drive archival requires the existing Apps Script deployment, permissions and Drive
  file IDs. If Drive archive fails, the app retains an error marker; the file is not
  falsely reported as moved.
- Real parent/admin/teacher/student accounts, concurrent Google Sheet writes, Drive
  permissions and deployed Apps Script actions were not available for testing.

DEPLOYMENT
----------
1. Back up the current Render source, Google Sheet and Google Drive folders.
2. Deploy index.html from this ZIP to a staging Render service first.
3. Keep existing server.js, Code.gs, Script Properties, spreadsheet ID, Apps Script
   deployment URL and Render environment variables unchanged.
4. Test parent duplicate upload, Admin replacement, repeated rejected archive, fresh
   resubmission, old slot release/reuse, and all four portal logins.
5. Only after staging verification deploy to production.

This is a targeted V33.2 source patch, not a claim that every requested salary and
fee workflow has been fully implemented or production-tested.
