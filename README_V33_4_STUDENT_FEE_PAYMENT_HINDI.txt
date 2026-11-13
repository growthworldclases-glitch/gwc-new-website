GWC V33.4 — Student Portal QR Fee Payment + Slip Upload
=======================================================

Base archive: GWC_V33_3_SALARY_LEDGER_AUDIT_REVERSE(1).zip

Additive changes in this build:
1. Student My Course page now displays a Pay Your Fee action when validity is expired,
   course access is inactive, or Admin has paused access. Existing active-course content,
   Join My Class link, and other student tabs are retained.
2. Student payment page displays the Admin-configured Shared Default QR from
   Admin → Default Payment Method. No new QR setting or payment credential is introduced.
3. After payment, the student can select a fee month and year. Year options begin at 2026
   and continue through 2056; the default year/month is derived from the student's next
   payment date (with 2026 as the minimum default year).
4. Student name, father's name, class, mobile number, address, and preferred class time
   are prefilled from the assigned student record and remain editable where appropriate.
5. Fee slip accepts JPG, PNG, WEBP, GIF, or PDF up to 1 MB. Student submission continues
   through the existing feeRequests workflow and Admin approval/rejection controls.
6. On successful Admin approval, the approved cycle is mirrored into gwcMonthlyFees with
   validFrom, validTo, amount, payment date, slip URL, and approval reference. This connects
   the existing Fee Approval workflow to the V32.2 date-based course-access gate and the
   Admin monthly fee register.
7. Existing duplicate pending/approved fee-request checks remain in place.
8. Existing V33.3 files, salary ledger audit/reversal, account credentials, settings,
   Apps Script backend, server, and other features are retained. Only index.html and this
   release note are new/changed in this package.

Validation performed:
- All 21 inline JavaScript blocks in index.html passed Node.js syntax validation.
- Code.gs and server.js passed Node.js syntax validation.
- ZIP archive integrity / CRC check passed after packaging.
- Static checks confirmed the student payment flow, default QR reference, month/year
  selectors, required student fields, and fee-approval-to-monthly-register bridge.

Important limitations:
- This is source-code validation, not a live production end-to-end test. The live Google
  Sheet, Apps Script deployment, Drive permissions, Render environment, payment QR image,
  and real Admin/Student accounts were not accessible for live testing.
- QR payments are not automatically verified by the app. Admin must inspect the uploaded
  slip and approve/reject it. Never grant access solely because a student clicked Paid.
- Back up the production ZIP and Google Sheet before deployment. Deploy to a staging copy
  first, then test one expired student, one active student, one rejected slip, and one
  successful Admin approval before replacing production.
- Existing login IDs/passwords and deployment configuration were not intentionally changed.
