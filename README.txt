GWC SAFE ADDITIVE REPAIR V11 — FEE CYCLE APPROVAL + SLIP MANAGEMENT

FILES
- index.html: Existing portal structure, role/login flow, course store, admin/teacher/student areas and Google sync URL flow are retained. Added Admin due-date confirmation at fee approval, and an option to upload/replace a fee slip and approve it in the same admin workflow. Existing slip replacement and archive/delete controls remain; archive moves the Drive file to GWC_Deleted_Items and preserves the fee request/history record.
- Code.gs: Existing load/save/upload/archive actions, storage chunking, staging verification and daily fee trigger remain. Fee expiry processing now also handles records with nextPaymentDate even if monthlyPaymentDate was not previously set. Date-only due dates are interpreted with India offset in the trigger path.
- server.js and package.json are included for the same Render proxy deployment.

IMPORTANT HONEST LIMITS
- I validated JavaScript syntax locally. I cannot access your live Apps Script deployment, Google Sheet, Drive permissions, Render service, or real student accounts from this ZIP, so I cannot honestly claim end-to-end live operation has been verified.
- The daily Apps Script trigger is not instantaneous; auto-deactivation is enforced when the trigger runs (daily) and when the portal's access checks run. It does not send SMS/WhatsApp automatically. The portal displays reminders when opened; external messaging requires a provider.
- Set the Apps Script project timezone to Asia/Kolkata. In the Apps Script editor run installGwcDailyFeeTrigger() once, authorize it, and deploy a new version of the existing web app. Do not change the existing Script Properties or deployment URL.
- Admin approval now asks for the next payment date (YYYY-MM-DD); the entered date applies only to that student's fee cycle. Verify the slip before choosing approval.
- Slip replacement archives the old Drive file before updating the request. Keep a backup of the spreadsheet before deployment and test with a non-critical student first.
- The existing backend is a legacy single-JSON state endpoint. Server-side role authorization is not fully enforced in Apps Script; public endpoint authentication needs a production security review before storing sensitive records.

SAFE DEPLOY ORDER
1. Make a copy of the existing spreadsheet and keep the previous ZIP/HTML/Code.gs.
2. In the existing Apps Script project, replace Code.gs only; retain Script Properties GWC_SPREADSHEET_ID and GWC_DRIVE_FOLDER_ID. Deploy as a new version.
3. Replace index.html in the same GitHub repository. Keep server.js/package.json unless the repository versions differ.
4. Confirm Apps Script timezone Asia/Kolkata and run installGwcDailyFeeTrigger() once.
5. Test admin login, student login, upload/replace slip, archive slip, approval with an individual due date, pending approval lock, reminder window, date edit, Join My Class lock, and Google sync badge. Check both mobile and desktop.
