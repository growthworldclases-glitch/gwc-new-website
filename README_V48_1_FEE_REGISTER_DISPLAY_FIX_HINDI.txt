GROWTH WORLD CLASSES — V48.1 FEE REGISTER DISPLAY FIX
Base: GWC_V48_ADDITIVE_REPAIR.zip

FIX
- Fixed the empty Monthly Fee Register area shown below Assigned Students.
- The page now mounts the existing Fee Management register renderer directly instead of calling a nested renderAdmin wrapper that could be intercepted by later portal wrappers.
- Existing month-wise rows, fee dates, student/course/teacher details, and existing slip controls are reused.

DATA SAFETY
- No fee-history arrays, feeRequests, gwcMonthlyFees, student records, users, login IDs, passwords, account mappings, or cloud-sync payloads are migrated, cleared, overwritten, or reset by this patch.
- This is a code-only additive repair. Existing data remains wherever it is currently stored (Google Sheets/Apps Script/cloud state).
- Keep the V47/V48 ZIP and current Google Sheet backup before deployment. Do not run any reset/restore/clear-data action during deployment.

VALIDATION
- ZIP integrity checked after packaging.
- Inline JavaScript syntax checks should be run with the same Node version used for deployment.
- Live Google Sheets history, login and deployed browser rendering cannot be verified offline; test on a staging deployment before replacing production.
