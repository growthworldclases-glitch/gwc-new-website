GWC V49.1 — CONTROLLED COURSE STORE REPAIR

BASE VERSION
User-uploaded GWC_V49_FIRST_LOGIN_COURSE_STORE_UPDATE (1).zip. This update does not use or compare against V48 or any other archive.

ONLY CHANGES
1. Class-wise common poster: Admin can select a class and upload one poster. The same poster is used by every course of that class which is published, active, and not SOLD.
2. Class-wise common monthly fee: Admin can set one monthly fee for a class. That fee is displayed on all published, active, non-SOLD courses of that class and is also used in the Buy Now fee confirmation.
3. Hidden and SOLD courses are excluded from the public Course Store, so class-wide poster/fee settings do not make them visible.
4. Full Course Store continues to include all published, active, non-SOLD courses; the first two remain featured previews and remaining courses appear through View Full Course Store.
5. Admin Courses page now shows Store Serial and ↑ / ↓ controls to change Course Store order. The order is saved in settings.courseStoreOrder.
6. Class-wise settings are saved under settings.courseStoreClassSettings and travel with the existing state/cloud sync.

PRESERVED
- Existing login IDs/passwords, roles, accounts, session handling, fee request flow, admissions, assignments, teacher/student data, settings, Apps Script/backend, server configuration, and all unrelated features are left unchanged.
- Existing individual course poster/fee remain as fallback when a class-wise setting has not been supplied.
- No account reset, data migration, or production deployment was performed.

VALIDATION
- ZIP integrity checked.
- Every inline JavaScript block in index.html passed Node syntax check.
- server.js and Code.gs passed Node syntax check.
- package.json and appsscript.json parsed as JSON.
- This is offline/static validation only. Live Render, Google Apps Script, Drive upload, and production cloud sync were not tested.

DEPLOYMENT
Deploy the ZIP contents to the existing project while retaining the current environment variables and Apps Script deployment configuration. Before public release, test class-wise poster upload, class fee display and Buy Now, hidden/SOLD exclusion, Full Course Store, serial reordering, and cloud sync with a test account.
