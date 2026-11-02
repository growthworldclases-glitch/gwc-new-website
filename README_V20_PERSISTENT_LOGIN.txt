GWC V20 — PERSISTENT LOGIN SESSION PATCH

This is an additive login-session patch over the supplied GWC V19 package.

WHAT CHANGED
- Successful Admin, Sub-admin, Teacher and Student logins are remembered in the same browser/app profile using a small local session record.
- Closing the tab/browser/app and reopening it will restore the portal after the existing Google Sheets/Apps Script cloud state has loaded successfully.
- The saved session does not store the password.
- Student Logout clears the remembered session.
- Admin's existing student Pause control (adminPaused) invalidates that student's remembered session. The next cloud refresh detects the pause and returns that browser to the public site; a paused student cannot log in again until resumed.
- Existing account deactivation/removal also invalidates the saved session.

UNCHANGED
- Login IDs and passwords, roles, student IDs, assigned batches/courses, fees, payment cycles, course access rules, teacher assignments, dashboards, menus, helpdesk, demos, data structure, Apps Script URL, Render proxy and all existing features.
- No user/account/batch/course data migration is required.

IMPORTANT DEPLOYMENT / TEST
1. Replace the deployed website files with the contents of this ZIP (keep the same Render service and Apps Script configuration).
2. Deploy the updated index.html through the existing Render/GitHub deployment workflow.
3. Open the website, wait for the green “Connected — Google Sheets/Drive active” status, and log in once.
4. Close and reopen the browser/app using the same browser profile. The same account should reopen without asking for credentials.
5. From Admin, Pause that student using the existing Pause control. Within the next cloud refresh (normally up to about 5 seconds after the cloud save is visible), the student's portal should close. Resume the student to allow a fresh login.
6. Test Logout; after logout, reopening should show the public site/login.

LIMITATIONS / SECURITY
- Session persistence is per browser profile/device. Clearing browser site data, using Incognito, changing browser/device, or reinstalling an app with cleared site data requires login again.
- Restoration deliberately waits for a successful cloud read so a stale local session cannot bypass an Admin pause/deactivation. If the cloud is unavailable at startup, the app stays at the public site until the connection is restored; the saved session record remains available for the next successful load.
- This is persistent convenience login, not a new server-side identity/authentication system. Existing login credential handling and backend design are intentionally not redesigned in this feature-preservation patch.
