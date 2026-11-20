GWC V40 – FINAL CONTROLLED UPDATE (STATICALLY VERIFIED)
Base: GWC_V33_5_QR_PAUSE_FIX.zip, carried forward through V38/V39 controlled updates.

Follow-up changes included:
1. Student Join My Class: Google AccountChooser is invoked before redirecting to the validated Google Meet URL. Teacher join workflow remains unchanged.
2. Teacher student list displays Last Date of Class from class validity period, not Last Fee Paid Date.
3. Parents Feedback remains monthly, with a red pending alert on Teacher dashboard and Admin Parents Feedback Manage records.
4. Teacher Help Desk group is GWC in-app group, auto-created per teacher and synchronized with assigned students. Inactive students are removed; when course access is active again, they are restored to the same group. Membership history is retained.
5. Dashboard shows only the latest message with View All for the full message list. Dashboard heading is “Latest Message”; Admin dashboard's extra Open WhatsApp Help Desk shortcut is suppressed.
6. Group messages can be deleted by their sender (Teacher/Student) and by Admin from the group conversation. A user cannot delete another member's group message.
7. Legacy hide/archive workflow is not used in the dashboard latest-message panel. Historical data structures are preserved.

IMPORTANT LIMITATIONS / LIVE TEST REQUIRED:
- GWC Help Desk groups are in-app groups, not native WhatsApp groups. Automatic add/remove in external WhatsApp groups requires a supported WhatsApp Business API/provider capability and is not claimed here.
- Google AccountChooser can prompt account selection and continue to the validated Meet URL. A website cannot force Android to pass the selected account to the native Meet app or guarantee instant native-app launch; Android/browser decides app-vs-browser handoff. Verify on actual Android devices with Meet installed and without it.
- No live Render deployment, production Google Apps Script/Sheets/Drive access, real account login, external WhatsApp provider, or physical Android/PC device was available for this static build verification.

Deployment: keep a backup of the live ZIP and deploy to a staging Render service first. Keep the existing Apps Script deployment and Script Properties unchanged. Run role-based regression checks before production.
