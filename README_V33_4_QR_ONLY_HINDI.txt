GWC V33.4 — QR-ONLY STUDENT FEE PAYMENT DISPLAY
================================================

Base: GWC_V33_3_SALARY_LEDGER_AUDIT_REVERSE(1).zip

Strictly limited changes in this patch (index.html only):
1. Student My Course keeps the existing course, teacher, validity, due-date, fee status, cycle count and Join My Class information.
2. The existing QR payment + fee-slip upload action is displayed only when the student's course access is off / fee is due.
3. When course access is active, the payment QR/action is not shown. Admin Force-to-Start-Batch active view also does not show a fee payment action.
4. The existing QR source selection, QR display, slip upload, fee request, approval and backend flow are unchanged.
5. Dashboard error panels no longer expose raw exception text or code to portal users; technical details remain in browser developer console for diagnosis.

All other ZIP entries are retained unchanged. No login IDs/passwords, settings, menus, styles, course records, salary ledger logic, Apps Script backend, Render server or Google Sheet data were intentionally changed.

Validation: inline JavaScript syntax and ZIP CRC/integrity checks are performed during packaging. Live Google Sheets/Drive/Apps Script/Render and actual account testing are not available in this environment. Back up production ZIP and spreadsheet, deploy to staging first, and verify a due student sees the QR and can upload a slip while an active student does not see the fee QR action.
