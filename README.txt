GROWTH WORLD CLASSES (GWC) — CHUNKED CLOUD-LOAD FIX + MONTHLY FEE / QR UPDATE

Files:
- index.html: existing website with additive updates
- Code.gs: Google Apps Script backend
- server.js + package.json: required same-origin /api/gwc proxy for Render/Node hosting

IMPORTANT BACKEND DEPLOYMENT
1. Keep a backup of your current live site and Google Sheet before replacing anything.
2. Deploy this folder as a Node Web Service (for example Render): Build command: npm install; Start command: npm start.
3. Set environment variable GWC_API_URL to your current Google Apps Script Web App URL if it differs from the URL in server.js.
4. REQUIRED for the JSON truncation fix: open the SAME existing Google Apps Script project, replace/update Code.gs from this ZIP, then Deploy > Manage deployments > Edit > New version > Deploy. Execute as: Me; access: Anyone, consistent with your existing setup. The HTML now requests stored sheet chunks separately; deploying only the Render ZIP will NOT activate the chunked reader.
5. Open the Node service URL. The website calls its same-origin /api/gwc route. Do not host only index.html on GitHub Pages if you expect Google cloud saves/uploads; GitHub Pages cannot run server.js.
6. Admin login > Default Payment Method / Shared QR Payment Photo > upload QR image (JPG/PNG/WEBP/GIF, max 1 MB). That one shared photo is used for payment pages. It is stored in Google Drive with link-view access so students' phones can open it.
7. Wait for the website's sync status to turn green, then test with a temporary test student/course before switching live traffic.

JSON TRUNCATION FIX
- The old page requested the entire saved state as one response. Large states could be cut off around 120 KB and fail with “Unterminated string”. The new page requests chunk metadata and then each stored JSON chunk separately.
- This avoids response-size truncation, but it cannot recreate characters that are already missing/corrupt inside the Google Sheet. If loading still reports “GWC saved JSON is invalid” after BOTH Render and Apps Script are updated, stop; do not clear the sheet or initialize a blank state. Restore from the existing Google Sheet version history / backup first.
- This update does not change the spreadsheet ID or Drive folder ID stored in Apps Script Script Properties. Do not delete the existing GWC_Storage sheet.

NOTES / LIMITATIONS
- Razorpay payment links are no longer used in the student payment flow; QR photo + fee slip is the supported flow. Legacy fields may remain in old stored records for compatibility, but they are not shown as payment options.
- Fee reminders are shown in the student portal and Due/Pending admin views when the site is opened. Automatic SMS/WhatsApp/push notifications require a separate notification provider and are not included.
- Monthly access approval grants exactly 30 days. Payment due-date reminder uses the admin-configured monthly date (1–28) and should be checked in live testing across month boundaries.
- The Apps Script Web App is public-accessible by design for this legacy architecture. Before storing sensitive data in production, add server-side authentication/authorization and secure student slip access. Payment slips should remain private; QR photo is intentionally link-viewable.
- This ZIP has been syntax-checked; live Google Drive/Sheets integration, credentials and payment approval must still be tested in the deployed environment.
