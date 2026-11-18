GWC V33.2 — Salary Day / Teacher Salary Date Update
====================================================

Base archive:
GWC_V33_1_FEE_DUPLICATE_SLOT_FIX.zip (the only source ZIP supplied in this chat).

Changes in this build:
1. Salary calculation now uses a fixed 30-day monthly unit per student assignment segment.
   Assignment start/end dates remain in the stored audit history, but do not reduce the
   monthly day count to 24/28 days. Each included student contributes the Admin-set
   monthly amount to the selected month's teacher total.
2. Admin Salary Management now includes a Salary Date field per teacher. The selected
   date is saved on that teacher's existing user record.
3. Teacher-side My Payment menu/route is hidden. The teacher dashboard displays only
   the Admin-set Salary Date; payment totals and student-wise breakdown remain in Admin
   Salary Management.

Existing V33.1 code and archive entries were retained except for the targeted index.html
changes and this report. Existing fee duplicate guards, repeated rejected-slip archive
control, free-slot recovery, and other features were not intentionally removed.

Validation performed:
- 21 inline HTML script blocks passed Node.js syntax checks.
- Code.gs passed Node.js syntax check.
- server.js passed Node.js syntax check.
- ZIP was re-opened and CRC/integrity checked after packaging.

Important limitations:
- The supplied ZIP was V33.1. The V30 and V32/V32.2 source archives mentioned in the
  request were not supplied, so a true V30-vs-V32 feature comparison/preservation audit
  cannot be certified.
- This environment has no access to the live Google Sheet, Drive, deployed Apps Script,
  Render environment, or real role accounts. Therefore live sync, payment receipt upload,
  fee slip replacement/archive, Free Slot reuse, login persistence, and all portal workflows
  have NOT been end-to-end tested. This ZIP is source-validated, not certified
  deployment-ready.
- Existing deployment URLs, Script Properties, spreadsheet IDs, proxy secrets and
  production data were left untouched. Deploy to a backed-up staging copy first.
- Salary Date is stored in the existing teacher user record. Teacher sees the date only.
