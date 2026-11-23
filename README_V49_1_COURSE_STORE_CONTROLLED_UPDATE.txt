GWC V49.1 — CONTROLLED COURSE STORE REPAIR
Base: User-uploaded GWC_V49_FIRST_LOGIN_COURSE_STORE_UPDATE ZIP

ONLY UPDATED: index.html
1. Public Course Store now uses the complete published-course collection in the expanded Full Course Store. The two featured cards remain on the welcome page; expanding Full Course Store lists every published course, including those featured cards.
2. Admin can set one common poster and one common monthly fee per class. These settings apply to every published, active, non-SOLD course in that class. Hidden and SOLD courses remain excluded from the public Course Store.
3. If no class-wise poster is configured, an individual course poster remains the fallback. If no class-wise fee is configured, the individual course fee remains the fallback.
4. Admin can remove a class-wise common poster without deleting course posters or course records.
5. Added visible store serial numbers and per-course up/down controls in Admin Course Management. The order is stored in the existing settings.courseStoreOrder setting and used by the public store.
6. Buy Now fee summary uses the class-wise fee when configured, while retaining the existing course discount calculation and payment workflow.

PRESERVED
- All original archive entries retained.
- Only index.html was modified; server.js, Code.gs, package.json, appsscript.json, assets, and all existing README/report files are unchanged.
- No login IDs/passwords, accounts, roles, settings outside the additive courseStoreClassSettings property, database schema, Apps Script deployment, Render configuration, admissions, fee records, teacher/student assignments, or existing course workflows were intentionally changed.
- No live cloud data was modified and no migration/reset was run.

OFFLINE VALIDATION
- ZIP integrity tested.
- All 33 inline JavaScript blocks in index.html pass Node.js syntax checking.
- server.js and Code.gs pass Node.js syntax checking.
- package.json and appsscript.json parse as valid JSON.
- Live Render, Apps Script, Google Drive, account logins, and real payment/admission flows cannot be verified from the offline ZIP and were not claimed as tested.

DEPLOYMENT
Deploy the ZIP contents to the existing project while preserving current environment variables and the existing Apps Script deployment. Test admin class-wise poster/fee save, course ordering, public Course Store, all login roles, fee/admission workflows, and cloud sync before production use.
