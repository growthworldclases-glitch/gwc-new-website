GWC V32 — MONTHLY SALARY + FEE SLIP + HELPDESK ADDITIVE UPDATE
================================================================

Base: GWC_V31_MONTHLY_SALARY_MANAGEMENT_STAGED.zip
Preservation: all original files other than index.html and this new README are byte-for-byte unchanged. Existing login IDs/passwords, users, students, courses, settings, Apps Script IDs, Render proxy settings and existing records are not intentionally migrated or rewritten.

V32 changes:
1. Salary Management uses a monthly amount per assigned student, entered/verified by Admin. Teacher totals and overall totals are calculated month-wise. Partial months are prorated by calendar days.
2. Existing assigned students are seeded into the salary roster. If an existing student record contains a known teacher-pay field, it is used; otherwise rate is ₹0 and marked Verify rate. No salary rate is fabricated.
3. Admin can edit each student's monthly amount, close an assignment with the last teaching date, and permit/deny teacher student-wise detail visibility. Teacher My Payment displays the monthly total by default.
4. Student move/removal/teacher reassignment is reconciled when Admin saves state: the prior open assignment is closed on the current date and a new assignment is seeded for the new teacher with rate verification required. For historical exactness, Admin should enter the actual last teaching date where a move is backdated.
5. Student portal gets Monthly Fee Slip upload for JPEG/PNG up to 1 MB, month-wise. Admin Fee Management shows selected-month roster, validity dates and attached slip with view/replace/delete actions.
6. Admin Helpdesk view adds person search, Go to Chat, Hide/Unhide (archive from inbox only) and permanent message deletion inside an individual chat. Hidden messages remain in the archive list; unhide restores them.
7. Fee slips older than 90 days are moved to the configured Drive archive via existing archivefile action when Admin opens Fee Management. Archive listing retained in saved state.

IMPORTANT TEST / LIMITATIONS:
- This is a staged additive source update, not a verified production deployment. No live Render, Google Apps Script, Drive, Sheet, mobile browser, or multi-account test was possible in this environment.
- The existing Apps Script must already support the upload, archivefile and permanentdeletefile actions used by the original project. Drive archival is processed when Admin opens Fee Management after the 90-day threshold; a true unattended daily trigger requires a separately installed Apps Script time trigger and is not claimed here.
- Existing legacy fee-cycle data and other modules are preserved; the V32 Fee Management tab presents the simplified month-wise register but does not delete old historical cycle fields.
- Existing fee validity values are displayed when available. This patch does not infer a missing paid-from/paid-to period or approve payments automatically.
- Existing chat messages are preserved. Hide is a dashboard visibility flag, not a deletion of conversation history. Permanent delete removes the selected message from the saved app state.
- Unknown student monthly teacher rates are intentionally shown as ₹0 / Verify rate. Admin must enter actual amounts before verifying payroll. Existing roster mapping is based on the current student course and teacher mapping.
- Salary date proration uses calendar days in the selected month. Assignment close date is inclusive.
- Do not deploy over the live site without first exporting a backup of the ZIP, Google Sheet and Drive data. Test on a staging Render service / copy of the Sheet first.

DEPLOYMENT:
1. Backup current GitHub repository and Google Sheet.
2. Extract this ZIP and replace the project files in the staging branch/repository.
3. Keep existing Render environment variables and Apps Script deployment settings unchanged.
4. Deploy to staging; test Admin, Teacher and Student logins, existing courses and records.
5. Test upload/replace/delete and archive actions against a test Drive folder before production.
6. Only after successful end-to-end tests, promote the staged commit to production.
