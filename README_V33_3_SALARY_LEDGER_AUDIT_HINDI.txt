GWC V33.3 — Salary Payment Ledger Audit + Reverse Controls
========================================================

Base archive: GWC_V33_2_SALARY_30DAY_UPDATE.zip

Additive changes in this build:
1. Admin Panel → Salary Management now includes “Payment Ledger Audit” for each teacher/month.
2. The audit view lists every recorded payment with amount, date, payment ID, note and creator.
3. Admin can reverse an individual payment after entering a required reason and confirming.
   Reversal is non-destructive: the original payment entry and receipt history remain stored;
   reversed entries are excluded from active Paid Amount, Paid %, and Remaining calculations.
4. A verified payable now has a “Reverse verification” action. Admin must enter a reason and
   confirm. This reverses the verification flag only; it does not delete or reverse payments.
5. Both payment reversals and verification reversals are added to the existing Admin Audit Log.
6. Existing percentage dropdown behavior remains: it can increase the paid target, but cannot
   reduce paid amount. For corrections, use Admin → Salary Management → Payment Ledger Audit.

Files changed: index.html and this report only. Other archive entries are retained unchanged.

Validation performed:
- All 21 inline JavaScript blocks in index.html passed Node.js syntax validation.
- ZIP archive integrity / CRC check passed after packaging.

Important limitations:
- This is source-code validation only. Live Google Sheets sync, Apps Script deployment,
  Render deployment, real teacher/admin accounts, and production payment records were not
  accessible here and have not been end-to-end tested.
- Back up the current production ZIP and Google Sheet before deployment. Test the new audit
  and reversal controls on a staging copy first.
- Reversal records are retained in the app's existing state/audit storage. Keep the existing
  cloud sync and backup process healthy so those records are persisted remotely.
