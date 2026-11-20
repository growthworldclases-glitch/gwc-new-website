GWC V48 — SMART ASSIGNED-TEACHER MEET JOIN REPAIR
Base: User-provided GWC_V47_JOIN_CLASS_ACCOUNT_FLOW_REPAIR.zip

WHAT CHANGED (index.html only)
1. Student Join My Class now resolves the student's assigned course first.
2. When that course has an explicit teacherId, the active assigned teacher's own Meet URL is authoritative.
3. If the assigned teacher is missing/inactive or has no Meet URL, V48 shows a clear message instead of silently opening a potentially stale Course Meet URL.
4. Course-level Meet URL is retained only as a legacy fallback when the course has no explicit teacher mapping.
5. Meet URL validation and direct HTTPS opening are retained. No forced Google AccountChooser redirect is used.
6. Existing Admin/Teacher/non-student join handlers are delegated to the previous handlers.
7. Added read-only diagnostic: window.gwcV48MeetDiagnostic().

IMPORTANT — GOOGLE ACCOUNT
GWC Student ID/password and Google Account are two different sign-in systems. A website cannot securely force or permanently remember a particular Google account in the Meet app/Chrome. Google controls its own session and may still ask the user to choose/sign in. V48 avoids forcing the chooser from GWC and opens the standard Meet URL so Android/Chrome can reuse an existing Google session when Google allows it. For the intended account, sign into that Google account in the Meet app/Chrome and keep that session active.

PRESERVATION
No login ID/password, account record, settings, backend, security logic, Apps Script connection, database schema, or existing feature was intentionally removed or reset. server.js, Code.gs, package.json and appsscript.json are byte-for-byte unchanged from V47.

DEPLOYMENT
Deploy this ZIP using the same existing Render/GitHub process and existing Apps Script deployment. No new secret, ID, property, or database migration is required for this V48 patch.

TEST LIMIT
Offline syntax and ZIP checks passed. Live Render/Google services and real Android devices were not accessible here. Please test Student, Teacher and Admin Join flows on the deployed site before treating the fix as production-verified.
