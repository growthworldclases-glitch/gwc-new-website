GWC V48 — SMART MEET ROUTING + AUTOMATIC MONTHLY FEE REGISTER
Base: User-uploaded GWC_V47_JOIN_CLASS_ACCOUNT_FLOW_REPAIR.zip
Update type: Additive frontend-only repair. No database reset or migration.

V48 CHANGES
1) Student Join My Class
- At click time, resolve the currently assigned student course and its assigned active teacher.
- The assigned teacher's valid Google Meet URL is now authoritative.
- The course-level Meet URL is used only if the assigned teacher has no valid Meet URL.
- Student normal and Force Active join entry points use the same resolver.
- Only HTTPS meet.google.com meeting-code URLs are accepted.
- The existing direct URL handoff remains; no forced AccountChooser redirect is added.

IMPORTANT GOOGLE ACCOUNT LIMIT
- GWC Student ID/password and Google Account are separate identities.
- A website cannot securely choose, store, or force a particular Google account in the Meet app/Chrome without Google OAuth consent and supported Google-side account controls.
- V48 therefore does NOT claim to permanently remember a Google account or suppress every Google account chooser. It opens the assigned teacher's direct Meet URL so Android/Chrome/Meet can use the Google session already signed in on the device.
- If Google asks to choose an account, the student must select the intended Google account in Google/Android. Keep that account signed in to Meet/Chrome. This is a Google session behavior, not a GWC password setting.

2) Fee Management
- Fee Management automatically uses the current calendar month; Admin no longer needs to select the month each time.
- On opening the current-month register, a missing monthly row is created for each active assigned student using that student's existing studentFee/fee and teacherMonthlyPay values.
- The generated row gets the current month's validity dates. Existing rows and historical records are not overwritten.
- Admin can use the existing per-student Edit dates / fee action to update the fee and validity dates.
- Existing upload/replace and archive/delete actions are retained. Replacing an existing slip archives the previous Drive file through the existing archive handler.
- Fee Summary now lists all fee requests and monthly fee slips date-wise (latest first), without a month picker. It includes View/Download, Replace/Upload, Archive/Delete and Restore actions where the existing handlers support them.
- Fee Summary retains approval/rejection, reminders and due-student controls.

PRESERVED
- Original login IDs/passwords, role accounts, courses, students, teacher assignments, settings, existing fee history and UI/features are not intentionally removed or reset.
- Code.gs, server.js, package.json and appsscript.json are byte-for-byte unchanged.
- No new external service, OAuth client, API secret, or deployment setting is introduced.

VALIDATION PERFORMED
- ZIP archive integrity checked.
- All 33 inline JavaScript blocks passed Node.js syntax checking.
- server.js and Code.gs passed Node.js syntax checking.
- package.json and appsscript.json parsed as valid JSON.
- Protected backend/configuration file hashes match the uploaded V47 archive.

NOT TESTED
- Live Render deployment, real Google Sheets/Drive round trips, real Admin/Teacher/Student logins, real Android Google Meet app handoff, and actual Google account persistence were not testable in this offline environment.
- Automatic monthly rows are generated when Admin opens Fee Management for that month. This is not a scheduled background job; it does not run while the site is closed.
