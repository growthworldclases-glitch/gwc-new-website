GWC V49 — FIRST LOGIN / WELCOME PAGE + COURSE STORE UPDATE
Base: User-uploaded GWC_V48_2_GOOGLE_WORKSPACE_REPAIR ZIP

ADDED
1. Professionalized the public welcome/hero styling while retaining existing copy, poster settings, and navigation structure.
2. Header login control is labelled Login Options; the existing role-selection modal displays Admin, Sub-admin, Teacher, and Student login choices. Hero login control also opens the same role selector.
3. Course Store is placed below the welcome poster area. Exactly two published courses are shown as featured previews (when at least two exist).
4. View Full Course Store expands the complete published course list.
5. Admin Courses page has ↑ Store / ↓ Store controls to arrange course order. Ordering is saved in settings.courseStoreOrder.
6. Added the supplied GWC logo at assets/gwc-default-logo.jpg as the public brand logo fallback when no custom logo is configured. Existing Admin logo setting remains supported.

PRESERVED
- Existing login validation, roles, IDs/passwords, accounts, session logic, and login forms were not rewritten.
- Existing course create/edit/display/hide/delete, fee, admission, poster, and course metadata workflows are retained.
- Existing backend files, Google Apps Script, server, package configuration, and other original archive files are unchanged.
- No live data, database migration, or account reset was performed.

VALIDATION
- ZIP integrity verified.
- index.html inline JavaScript syntax checked with Node.js.
- server.js and Code.gs syntax checked with Node.js.
- package.json and appsscript.json parsed as JSON.
- Live Render/Apps Script/Google Drive production testing was not performed.

DEPLOYMENT
Deploy the ZIP contents to the existing project while retaining current environment variables and the existing Apps Script deployment configuration. Test all roles, course display order, admissions, fee flows, and cloud sync before production use.
