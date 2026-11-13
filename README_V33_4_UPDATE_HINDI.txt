GWC V33.4 — Student Portal QR Fee Payment Repair
================================================

Base:
GWC_V33_3_SALARY_LEDGER_AUDIT_REVERSE(1).zip (uploaded in this conversation).

Requested, narrowly scoped changes:
1. Student My Course page now shows the Pay Your Fee button only when course access is off/expired,
   or payment is pending and the access is therefore disabled. While access is active, the payment
   button is not shown. The existing course reminder remains informational and does not expose
   an early payment button.
2. The existing QR payment step is retained. It continues to use the Admin-configured shared
   default QR photo (`state.settings.defaultQrUrl`) through the existing payment flow.
3. The fee-slip form now asks for Student Name, Father Name, Class, Mobile Number, Full Address,
   Payment Month, Payment Year, and the payment slip file.
4. Payment year choices start at 2026 and extend through at least ten years beyond the current
   year. Default selection follows the existing next-due-month calculation.
5. Fee requests store the selected month and year (for example, `November 2026`) in the existing
   `feeRequests` workflow. The existing Admin approval/rejection workflow is retained.
6. Existing login IDs/passwords, roles, Admin QR settings, salary ledger, payment audit/reversal,
   teacher/student features, backend endpoints and deployment configuration were not intentionally
   changed.

Files changed:
- index.html (one additive script patch appended)
- README_V33_4_UPDATE_HINDI.txt (this report)

Validation:
- New additive JavaScript patch passed `node --check`.
- `server.js` passed `node --check`.
- `Code.gs` passed `node --check` after copying to a temporary `.js` filename.
- ZIP CRC/integrity test passed after packaging.
- The supplied original HTML contains a pre-existing inline script fragment that the simple
  script-tag extraction check truncates at an embedded script-close sequence; this is outside
  the new patch. The new patch itself parses successfully.

Important production limitations:
- Live Google Sheets, Google Drive, Apps Script deployment, Render deployment and real student
  accounts were not accessible. QR display, image upload, cloud persistence and Admin approval
  must be tested on a staging copy before production deployment.
- This source package does not modify or migrate production records and cannot guarantee
  production behavior without the staging test.
- Back up the current production ZIP and Google Sheet before deploying. Keep all existing Render
  environment variables, Apps Script properties, spreadsheet IDs, proxy secrets and deployment
  URLs unchanged.
