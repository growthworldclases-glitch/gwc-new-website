GWC V51 — RAILWAY NETWORK OPTIMIZATION (SAFE SERVER-SIDE UPDATE)
=================================================================

BASE
----
GWC V50 ZIP: GWC_V50_RAILWAY_BATCH_TIMINGS_30MIN_SYNC.zip

WHAT CHANGED
------------
1. Added Express compression middleware (compression package) with 1 KB
   threshold. This compresses eligible text responses such as HTML, CSS,
   JavaScript and JSON when the browser supports gzip/deflate.
2. Added private, no-store cache headers to /api/gwc responses so user/account,
   fee and shared application data are not stored in a shared browser/CDN cache.
3. Added the compression dependency to package.json.
4. Kept index.html and public/index.html byte-identical and unchanged from V50.

WHAT DID NOT CHANGE
-------------------
- Code.gs and Google Apps Script backend
- Google Sheet / Drive architecture and data
- GWC_API_URL environment variable requirement
- Login IDs, passwords, roles, accounts, fees, courses, students, teachers
- Existing V50 class timings and 30-minute refresh logic
- Existing Drive upload proxy route and upload request format
- Railway start command (npm start)

IMPORTANT LIMITS
----------------
- This update reduces the size of eligible text responses. It does not reduce
  the size of images, PDFs, Drive uploads, or data fetched directly from Google.
- It does not enable Railway CDN automatically. CDN must be checked/enabled in
  Railway Service Settings by the account owner. Do not cache /api/gwc or any
  private portal responses at a shared CDN.
- It does not change full-state Google Sheet payload design. That requires a
  separately tested API/frontend redesign and could affect legacy modules.
- No live Railway deploy, Google Apps Script, Drive, account workflow, 100-user
  load test, or billing test was performed in this offline environment.

DEPLOYMENT
----------
1. Keep the current Railway deployment running as rollback.
2. Replace the contents of the EXISTING GitHub repository with the contents of
   this ZIP (extract it; do not upload the ZIP as a single website file).
3. Do not create a new Railway project or new Google Sheet.
4. In Railway, keep the existing service, domain, variables and GWC_API_URL.
5. Confirm the service uses the existing start command: npm start.
6. Commit/push the repository changes and wait for Railway deployment to finish.
7. Open https://YOUR-EXISTING-DOMAIN/healthz. Expect JSON with ok:true.
8. Test Admin login, Teacher login, Student login, class time display, fee view,
   one message, one homework/test action, and one small Drive upload.
9. In browser DevTools Network, inspect a text response: Content-Encoding should
   normally be gzip or br when supported and response size should be lower.
10. Compare Railway Network Egress over equal time windows before/after.
11. If any workflow fails, redeploy the previous GitHub commit to roll back.

RAILWAY CDN SAFETY
------------------
If Railway CDN is available, enable it only for static assets after confirming
its path/cache behavior. Never configure shared caching for /api/*, /api/gwc,
login, student/teacher/admin pages containing private data, or Drive upload
routes. Keep the current index.html no-store behavior unless a carefully tested
versioned HTML caching strategy is introduced later.
