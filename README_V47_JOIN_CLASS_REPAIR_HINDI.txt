GWC V47 — Join My Class + Account Handoff Repair (Additive)
Base: User-provided GWC V46 ZIP.

V47 FIX
- Student Join My Class handoff validates HTTPS Meet domain and standard meeting-code URL.
- Removes forced Google AccountChooser redirect on every student class join.
- Opens the validated Meet URL directly, allowing the browser/Android Meet app to reuse the account already selected/signed in.
- Teacher/Admin/other role join workflows, existing teacher Meet profile field, course-to-teacher resolution and join buttons are retained.
- Existing login IDs/passwords, settings, security logic, backend/server, Google Apps Script and data schema are not reset or removed.

IMPORTANT
- This does not guarantee account selection will never appear: Google may request sign-in if the saved session expires, multiple accounts are signed in and Google chooses to prompt, or app/browser settings require it. The website cannot securely force a specific Google account without OAuth consent or Google-side controls.
- Live Meet access, app handoff, saved account persistence, deployed Render/Apps Script and production credentials could not be tested in this offline environment.

VALIDATION
- ZIP integrity, all 32 inline JavaScript script blocks, server.js, Code.gs, package.json and appsscript.json syntax checked.
- Existing backend/config files preserved byte-for-byte from V46.
