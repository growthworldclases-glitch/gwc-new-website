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


SAFE JSON REPAIR PATCH NOTES (2026-10)
- GET actions loadmeta/meta/metadata are accepted for compatibility with older front ends.
- Google Apps Script validates the full JSON and reconstructed chunks before changing the live storage sheet.
- Before a valid new save replaces the live sheet, the previous sheet is copied to a timestamped GWC_Storage_BACKUP_* sheet.
- If the live JSON is malformed, readState_ tries valid timestamped backups and otherwise stops without overwriting damaged data.
- Render proxy request body limit raised to 50 MB; package.json uses npm start and Node 18+.

IMPORTANT LIMITATIONS
- No software change can reconstruct characters already lost from a truncated JSON unless an intact copy exists in a backup or another source.
- The existing Apps Script project must retain its original GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID Script Properties to reconnect to the same cloud data. Do not delete Script Properties or create a new Apps Script project.
- This is a compatibility/data-safety patch, not a guarantee that no future network/platform failure can ever happen. Test with a backup before switching students to the new deployment.


VERIFIED ADDITIVE REPAIR NOTES
- Node proxy body limit is 50 MB and POST supports archivefile. package.json start command remains npm start.
- GET actions loadmeta/meta/metadata are accepted by Code.gs.
- If GWC_SPREADSHEET_ID or GWC_DRIVE_FOLDER_ID exists but cannot be opened, Code.gs now stops with a clear error instead of silently creating a new spreadsheet/folder and disconnecting the old data.
- Admin Fee Summary adds per-student next fee date editing, admin slip upload, slip replace/archive controls, and a 3-day reminder based on the cycle due date. The cycle end is set to midnight at the selected date, so access expires on that date unless the next fee request is approved.
- Drive file archive action moves replaced/deleted slips and deleted course posters to GWC_Deleted_Items. Other pre-existing delete actions that use the website's internal Trash remain unchanged; not every legacy delete path has been migrated to Drive archive.
- Mobile dashboard sidebar is vertical to keep Ask Your Doubt and Upload Today Notes in a side menu.

IMPORTANT: These files have local syntax/structural checks only. Live Apps Script, Drive permissions, existing Script Properties, and old-data recovery cannot be verified from this ZIP. Back up the spreadsheet first, deploy Code.gs as a new Apps Script Web App version, and test with a temporary student before sending students to the site. Never delete or reset Script Properties. A backup is required to reconstruct data already truncated in the primary JSON. No patch can guarantee zero future glitches.
