GWC V33.4 — Student Fee Payment Access / Month-Year Selection Fix
===================================================================

Base: GWC_V33_3_SALARY_LEDGER_AUDIT_REVERSE(1).zip

Targeted change:
- Updated only the existing student fee-slip form in index.html.
- Added Payment Month and Payment Year selectors. The year list begins at 2026
  and grows forward automatically, including future years.
- Student name, father name, class, parent mobile, full address and fee-slip
  upload remain required. School name and preferred class time are optional.
- The payment QR continues to use the Admin-configured shared default QR image.
- Existing fee request submission, Admin approval/rejection, course access,
  login credentials, salary ledger/audit/reversal, sync and other workflows
  were not intentionally changed.
- No Admin panel UI or Admin language strings were modified.

Validation:
- ZIP CRC/integrity check passed.
- All inline JavaScript blocks passed Node.js syntax validation.
- This is offline source validation only; live Google Sheets, Drive, Apps Script,
  Render, real student accounts and payment approval were not accessible here.
- Back up production ZIP and Google Sheet; test first on a staging deployment.
