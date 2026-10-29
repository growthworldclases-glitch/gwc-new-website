GROWTH WORLD CLASSES (GWC) — MONTHLY FEE / QR UPDATE

Files:
- index.html: existing website with additive updates
- Code.gs: Google Apps Script backend
- server.js + package.json: required same-origin /api/gwc proxy for Render/Node hosting

IMPORTANT BACKEND DEPLOYMENT
1. Keep a backup of your current live site and Google Sheet before replacing anything.
2. Deploy this folder as a Node Web Service (for example Render): Build command: npm install; Start command: npm start.
3. Set environment variable GWC_API_URL to your current Google Apps Script Web App URL if it differs from the URL in server.js.
4. In Google Apps Script, update Code.gs from this ZIP and Deploy > Manage deployments > Edit > New version > Deploy. Execute as: Me; access: Anyone, consistent with your existing setup.
5. Open the Node service URL. The website calls its same-origin /api/gwc route. Do not host only index.html on GitHub Pages if you expect Google cloud saves/uploads; GitHub Pages cannot run server.js.
6. Admin login > Default Payment Method / Shared QR Payment Photo > upload QR image (JPG/PNG/WEBP/GIF, max 1 MB). That one shared photo is used for payment pages. It is stored in Google Drive with link-view access so students' phones can open it.
7. Wait for the website's sync status to turn green, then test with a temporary test student/course before switching live traffic.

NOTES / LIMITATIONS
- Razorpay payment links are no longer used in the student payment flow; QR photo + fee slip is the supported flow. Legacy fields may remain in old stored records for compatibility, but they are not shown as payment options.
- Fee reminders are shown in the student portal and Due/Pending admin views when the site is opened. Automatic SMS/WhatsApp/push notifications require a separate notification provider and are not included.
- Monthly access approval grants exactly 30 days. Payment due-date reminder uses the admin-configured monthly date (1–28) and should be checked in live testing across month boundaries.
- The Apps Script Web App is public-accessible by design for this legacy architecture. Before storing sensitive data in production, add server-side authentication/authorization and secure student slip access. Payment slips should remain private; QR photo is intentionally link-viewable.
- This ZIP has been syntax-checked; live Google Drive/Sheets integration, credentials and payment approval must still be tested in the deployed environment.
