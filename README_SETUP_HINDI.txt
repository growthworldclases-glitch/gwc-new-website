GWC Firebase Cloud Update — setup notes (Hindi)

Files:
- GWC_index_Firebase_Cloud.html: updated website HTML
- README_SETUP_HINDI.txt: setup and important limitations

What changed:
1. Removed Supabase SDK/config from the HTML.
2. Removed the large full-state localStorage write that caused “Browser storage is full” / quota errors.
3. Existing Firebase Realtime Database config/path is retained for shared site data sync.
4. Course posters (50 KB max), logo/main poster (1 MB max), and admission payment slips (1 MB max) are uploaded to Firebase Storage; the database stores download URLs instead of base64 file contents.
5. Existing Buy Now options remain: “Pay Your First Fee & Create Auto Pay” opens the course-specific Razorpay link, and “Request Your Course Access” collects student details and slip.
6. Existing page/portal sections are retained in the HTML. This is not a complete security/backend rewrite.

BEFORE DEPLOYING — REQUIRED
A. Open Firebase Console for the existing project growth-world-classes-cce17.
B. Build > Storage > Get started (if not already enabled). Confirm the Storage bucket matches the bucket in firebaseConfig.
C. Realtime Database > Rules: ensure the existing database rules allow the intended reads/writes. Do not set public read/write rules for a real student database.
D. Storage > Rules: uploads require suitable Storage Rules. The current HTML's role login is client-side only and is NOT Firebase Authentication. Therefore do not make Storage publicly writable just to make uploads work. For safe production use, Firebase Authentication + rules or a trusted server endpoint is required.
E. Test with a harmless sample course and sample file. Check browser console and Firebase Console before adding real student information.
F. Upload this HTML to the same GitHub repository/branch/folder used by Render, commit/push it, and wait for the Render deploy to finish. Render serves the website files; it does not itself provide a persistent database or cloud file-storage API for a static HTML page.

IMPORTANT LIMITATIONS
- Firebase Realtime Database/Storage billing and quotas are controlled by Firebase. Free usage has limits; it is not unlimited.
- This HTML still contains a client-side admin login and passwords in database data. It is not safe for real student/payment records until authentication and server-side authorization are implemented. Do not share real parent/student details while security rules are open.
- The current Firebase synchronization stores the site's state as one shared object at gwc_professional_v6/state. This preserves the existing path, but a larger dataset may need a future schema migration to per-record paths for better performance. This update does not perform that migration.
- Legacy image data already saved as base64 in the old database/local browser will not automatically be migrated to Firebase Storage. Newly uploaded files use cloud storage.
- The HTML references assets/gwc-promo-poster.jpeg as a fallback. Keep the existing assets folder in your GitHub deployment if it exists; it is not replaced by this ZIP.
- No claim is made that this was deployed or that Firebase rules were changed; those actions require access to your Firebase/Render accounts.
