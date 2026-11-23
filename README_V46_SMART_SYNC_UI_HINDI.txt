GWC V46 – SMART CLOUD SYNC + FUTURISTIC UI (CONTROLLED ADDITIVE UPDATE)
Base: User-provided GWC_V45_FINAL_CONTROLLED_UPDATE ZIP.

WHAT WAS FOUND IN V45
- Full cloud state was polled every 5 seconds from each open portal.
- Legacy save scheduling had multiple historical overrides, increasing duplicate scheduling/race complexity.
- Help Desk view could be redrawn every 6 seconds while the cloud state itself was also being polled.
- Every save transmits the full state object to the existing Google Apps Script backend; backend writes are serialized with ScriptLock and staged into Google Sheets. This full-state architecture and Google Apps Script endpoint are retained.

V46 CHANGES (index.html only)
- Replaced the active 5-second cloud polling cadence with a guarded 60-second remote refresh.
- Remote refresh skips while local edits are pending, a save is running, a form is open, or a user is actively editing a field.
- Added a single serialized save queue with a 450 ms debounce. Changes are uploaded after a local edit; identical state snapshots are not uploaded again.
- If edits occur during an upload, the latest state is queued for a follow-up save instead of overlapping writes.
- Failed saves retain the current in-memory state, show a clear warning, and retry after 15 seconds.
- On returning to a visible tab, one guarded cloud check runs after a short delay.
- Reduced the Help Desk periodic redraw interval from 6 seconds to 60 seconds.
- Added responsive futuristic academic styling, soft gradients, refined cards, active navigation, subtle motion and reduced-motion accessibility. Existing dashboard content, labels, controls and feature handlers are not replaced.

PRESERVED
- Code.gs, server.js, package.json, appsscript.json are byte-for-byte unchanged.
- Existing Apps Script URL, Render proxy route, authentication/signature logic, spreadsheet schema, Drive behavior and deployment settings are unchanged.
- No login ID, password, account, user ID, course ID, batch, assignment, settings, security rule or feature was intentionally removed or reset.
- No database migration or reset.

IMPORTANT LIMITATIONS
- The current architecture still sends the complete state object for a save. Optimizing to per-record/delta writes would require a coordinated backend protocol and conflict-resolution design; that was deliberately not introduced because it risks existing data and requires a schema/backend migration.
- A 60-second cross-portal poll means a change made in another browser can appear on this portal up to roughly one minute later (or sooner when the tab becomes visible). Local changes are queued for upload after the debounce.
- No website can guarantee “10 years without crash”. Long-term reliability requires ongoing hosting, browser, Google Apps Script quotas, Google Sheets size, backups, monitoring and maintenance.
- Live Render/Google Sheets round-trip, production role logins, mobile-device behavior and concurrency across real accounts were not testable in this offline workspace. Do not treat local syntax checks as production certification.

VALIDATION
- ZIP integrity checked.
- JavaScript syntax checks performed for inline scripts and server/backend source.
- JSON syntax checked for package.json and appsscript.json.
- Protected backend/configuration hashes compared with source ZIP and verified unchanged.
