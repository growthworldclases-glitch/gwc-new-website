GWC V36 – MONTHLY PARENTS FEEDBACK + LAST DATE OF CLASS
=======================================================

BASE
----
Original uploaded base: GWC_V33_5_QR_PAUSE_FIX.zip
This package retains the previously prepared V34/V35 controlled changes and applies
this follow-up correction in index.html only.

USER-REQUESTED CORRECTIONS
--------------------------
1. Teacher > My Students date column is labelled “Last Date of Class”.
   - It does NOT display Last Fee Paid Date.
   - It derives the date from the current/most recent fee-validity period endAt,
     converting the exclusive end timestamp to the final valid class date.
   - Legacy monthly fee validTo is used only as a fallback when no fee period exists.
   - Calendar date formatting is local-date based to avoid UTC date rollover.

2. Parents Feedback reminder is MONTHLY, not every 15 days.
   - A student is pending if no feedback exists or the next monthly due date has
     arrived.
   - The next due date is calculated as one calendar month after the submitted
     feedback date (clamped to the last day of the target month where necessary).
   - Teacher portal shows a red pending alert for due students.
   - Admin Parents Feedback Manage shows teacher-wise pending count and next due date.
   - Feedback history is retained in the additive state.gwcParentFeedback property.

PRESERVATION
------------
- All files from the uploaded V33.5 ZIP remain in the package.
- Existing Code.gs, server.js, package.json, appsscript.json and original README files
  are byte-for-byte unchanged from the uploaded base.
- Only index.html is modified relative to the base; V34/V35/V36 documentation files
  are additive.
- No login IDs, passwords, student IDs, teacher IDs, courses, assignments, batches,
  database records or cloud credentials are rewritten by ZIP generation.
- No live database migration is included or required by these two display/reminder fixes.

OFFLINE VALIDATION PERFORMED
----------------------------
- ZIP archive test (`unzip -t`): passed.
- All 22 non-empty inline JavaScript blocks in index.html: Node syntax check passed.
- server.js: Node syntax check passed.
- Code.gs: Node syntax parse check passed (copied to .js for Node parser).
- package.json and appsscript.json: JSON parse passed.
- Base-file preservation comparison: all original files except index.html are byte-identical.
- Static assertions: “Last Date of Class” present; “Last Fee Paid Date” absent;
  monthly feedback due-date calculation present; obsolete 15-day alert wording absent.

NOT CLAIMED / LIVE TESTING LIMITATIONS
-------------------------------------
This is a source-level/offline validation, not an end-to-end production certification.
The following still require the user's configured Render, Google Apps Script, Google
Sheets/Drive, WhatsApp provider and real devices:
- Real Admin, Teacher, Subadmin and Student login using existing credentials.
- Live sync/read/write and actual persistence of feedback records across accounts.
- Full message unread/read/hidden/archive/per-user delete workflow.
- Actual external WhatsApp group create/remove/re-add (requires an approved provider/API).
- Google Meet Android account chooser and installed-app/browser handoff.
- Actual Android and desktop browser interaction and regression testing.
- Verification that every legacy dashboard button works with production data.

DEPLOY SAFELY
-------------
1. Back up the live website repository and Google Sheet before deployment.
2. Deploy this ZIP to a separate Render staging service first.
3. Keep all existing Render environment variables and Apps Script properties unchanged.
4. Test using staging copies of all four roles and confirm monthly feedback submission,
   red pending alert, admin history, and Last Date of Class values for representative
   students whose fee periods have known startAt/endAt values.
5. Only promote to production after live staging checks pass.

This ZIP does not claim that unavailable external APIs or physical-device tests have
been completed. It preserves the source architecture and reports those limitations
rather than showing unsupported operations as successful.
