GWC V39 CONTROLLED UPDATE – DEPLOYMENT NOTES
Base: GWC_V33_5_QR_PAUSE_FIX.zip via previously prepared V38 additive build.

This build applies the requested follow-up changes:
1. Dashboard inbox: latest one message only; View All opens the full accessible message list. Legacy hide/archive controls are hidden from the Help Desk UI; historical message data is not deleted.
2. Parents Feedback due cycle remains monthly. Teacher dashboard receives a red monthly pending alert; submitting feedback clears that student's due state until next monthly due date.
3. Student Join My Class uses Google's account chooser and continues to the validated Meet URL. Teacher joining workflow is intentionally unchanged.
4. Last Date of Class remains distinct from Last Fee Paid Date and is shown in the Teacher student list using the class validity end date.
5. Teacher Help Desk groups are GWC in-app groups, automatically created per teacher and synced with that teacher's assigned students. Inactive students are removed and active students are restored to the same group. Students cannot create groups but can message in a group only while they are a member.

IMPORTANT TECHNICAL LIMITATIONS:
- GWC Help Desk groups are in-app groups, not native WhatsApp groups. WhatsApp does not permit automatic add/remove from ordinary external groups through a simple web link. Native WhatsApp group automation requires an approved WhatsApp Business/API/provider arrangement and appropriate group-management support. This ZIP does not fake external WhatsApp success.
- Android account chooser -> Meet handoff is browser/OS dependent. The website can request Google's account chooser and continue to the Meet URL, but cannot force the selected Google account into the native Meet app or guarantee that Android launches the app on every device. Actual device testing with installed Meet and browser fallback is required.
- Google Sheets/Apps Script live sync, Render deployment, real user-role logins, Drive permissions, and physical Android/desktop testing cannot be completed offline in this build environment.

Deployment: Extract the ZIP and deploy the included website files to the existing Render/GitHub service. Do not replace Apps Script or change Script Properties. Keep a backup of the currently deployed version and test first on staging.
