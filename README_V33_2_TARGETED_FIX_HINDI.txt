GWC V33.2 — TARGETED FEE ARCHIVE / AVAILABLE SLOT CORRECTION
============================================================

BASE
----
Based on the user-uploaded GWC_V33_1_FEE_DUPLICATE_SLOT_FIX.zip.
Existing files and application architecture are retained. Only index.html and this
update report are changed in this package.

CHANGES
-------
1) Repeated rejected fee slips
- The first rejection record is now retained as the original audit record.
- All subsequent rejected submissions for the same student/month are marked
  archived_rejected, with archive timestamp/reason/by metadata retained.
- Where a Drive file ID can be resolved, the existing Drive archive action is used.
- The request/audit record is not physically deleted.
- A rejected student can submit a fresh slip; pending or approved duplicates remain blocked.

2) Old Available Slots
- Released Login IDs are deduplicated in the display.
- IDs still occupied by any existing user account are not presented as reusable.
- Existing Admin review/release flow for inactive orphan accounts remains in place.
- New student personal information is not copied from the previous account.

3) Existing parent duplicate guard retained
- The existing month-wise Parent upload guard continues to block a second successful
  slip attachment for the same student/month and directs the Parent to Admin for replacement.

PRESERVED
---------
- All files from V33.1 are retained; index.html is the only existing application source
  file changed. Code.gs, server.js, package.json, appsscript.json and existing README files
  remain unchanged.
- Existing login/authentication source, roles, IDs, credentials, courses, batches,
  assignments, settings, portals, salary ledger, session management, Google backend
  configuration and legacy fee records are not intentionally changed.
- No live Google Sheet or Drive data was modified while preparing this ZIP.

VALIDATION
----------
- Inline JavaScript syntax validation and backend/server syntax checks are performed
  during packaging.
- ZIP integrity and re-extraction checks are performed during packaging.

IMPORTANT LIMITATIONS — NOT A PRODUCTION-VERIFIED RELEASE
--------------------------------------------------------
- The uploaded source is V33.1, not the original V30 or V32.2 ZIP. Full byte-for-byte
  comparison against those earlier source packages cannot be performed from this upload.
- Salary still uses the existing V32/V33 assignment-history and calendar-month prorating
  implementation. A full Admin-defined per-teacher salary-date 30-day cycle and
  reason-based deduction workflow are NOT implemented/verified in this targeted build.
- The existing Apps Script state endpoint stores a single JSON state document. True
  record-level concurrent transactions are not implemented by this update.
- Live Google Sheets/Drive, Apps Script authorization/triggers, Render deployment,
  real account logins and multi-device sync cannot be tested in this offline environment.
- Parent/admin upload, Drive archival, and available-ID reuse must be verified on a
  staging copy with the existing Apps Script deployment and Google account permissions.

DEPLOYMENT SAFETY
-----------------
Back up the live Render source, Google Sheet and Drive folders first. Deploy to a staging
copy and test with non-production accounts before production. Keep existing Script
Properties, spreadsheet ID, proxy secret, Apps Script URL and Render environment variables.
Do not treat this package as fully deployment-ready until the outstanding salary-cycle
work and live backend tests have been completed.
