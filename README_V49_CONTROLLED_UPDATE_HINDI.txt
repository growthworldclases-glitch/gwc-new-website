GWC V49 — CONTROLLED ADDITIVE UPDATE
Base: User-uploaded GWC_V48_2_GOOGLE_WORKSPACE_REPAIR (3).zip

WHAT WAS ADDED
1. Teacher My Payment page is restored as a working month-wise salary view, instead of the previous placeholder that hid salary details.
2. Teachers can upload/replace their monthly salary payment proof or acknowledgement (image/PDF, max 1 MB). The proof status is visible to the teacher.
3. Admin Salary Management menu is exposed. Admin can attach/replace a monthly salary slip (image/PDF, max 1 MB), view the teacher's uploaded proof, and mark the proof Verified or Rejected.
4. Admin can view/download the attached salary slip from the teacher record. Existing monthly payable calculation, payments, verification, student details permission, receipt, and ledger audit remain in place.
5. Existing Branding > Logo and Main Poster controls are documented as the app/site branding controls. The Android WebView loads the same live website, so the currently configured website logo and poster are shown after website load.
6. Presentation-only UI refinement: improved navy/gold styling, sidebar active state, panel/table polish and mobile dashboard layout.
7. Added Android Studio WebView wrapper source in android-app/. It uses the existing GWC website URL, the existing website login/database, file chooser for uploads, downloads, browser handoff for external links, and Android back navigation.

PRESERVED
- Existing Code.gs, server.js, package.json, appsscript.json and Google Workspace backend remain unchanged.
- Existing login IDs/passwords, account records, roles, courses, batches, settings, fee flow and old feature handlers are not reset or migrated.
- No cloud data operation or database migration was run.
- Existing salary calculations and salary ledger logic were not replaced; the new slip/proof fields are additive fields on each existing monthly salary record.

ANDROID APP LIMITATIONS
- This archive contains Android Studio source code, not a compiled/signed APK. This environment has no Android SDK or Gradle installation, so an APK could not be built or device-tested.
- The Android app is a WebView wrapper and opens https://growth-world-classes-2-0.onrender.com. If your production URL is different, change START_URL and HOME_HOST in android-app/app/src/main/java/in/growthworldclasses/app/MainActivity.java.
- Admin-updated Main Poster/Logo appear in the website UI inside the app after the website loads. The Android launcher icon is bundled into the APK; changing that launcher icon requires a new APK build/update.
- The actual website deployment and Android device behaviour have not been tested from this offline build environment.

UPLOAD / STORAGE NOTE
- Teacher proof and Admin salary slip are stored as additive data-URL fields inside the existing monthly salary record. File size is limited to 1 MB each. Production sync/storage limits and real teacher/admin sessions must be verified before rollout.

DEPLOYMENT
1. Keep all existing Render environment variables and the same Apps Script deployment/configuration.
2. Deploy the updated index.html with the existing website project. Code.gs/server.js/package.json/appsscript.json are unchanged and do not need replacement for this patch.
3. Test with a test teacher and test admin account: Admin Salary Management > attach slip; Teacher > My Payment > view/download and upload proof; Admin > review proof.
4. Open android-app/ in Android Studio, sync Gradle (JDK 17 / Android SDK 35 / Android Gradle Plugin 8.7.3), then Build APK. Sign the APK with your own keystore for release.

VALIDATION
- ZIP integrity checked.
- index.html inline JavaScript syntax checked with Node.js.
- Code.gs and server.js syntax checked with Node.js.
- package.json and appsscript.json JSON parsing checked.
- Live Render/Apps Script/Google Sheets/Drive, account login, cloud save, Android build and physical-device tests were not performed.
