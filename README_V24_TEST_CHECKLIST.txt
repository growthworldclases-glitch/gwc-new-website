GWC V24 TEST CHECKLIST
======================

Before live rollout, test with a copy of the spreadsheet if possible.

[ ] /healthz returns ok:true and version 24.0-secure
[ ] Website loads from Render
[ ] Admin login and dashboard open
[ ] Admin makes a harmless setting change; refresh and confirm persistence
[ ] Teacher login sees only assigned students and assigned classes
[ ] Teacher makes an allowed change; refresh and confirm persistence
[ ] Sub-admin login and permitted changes work
[ ] Student login and course view work
[ ] Fee Management and fee-cycle records remain present
[ ] Weekly schedule remains present
[ ] Help Desk messages and supported attachments work
[ ] Drive upload and archive/delete flow works
[ ] Google Sheet primary and backup tabs remain valid

Negative security checks:
[ ] A request sent directly to Apps Script without signature is rejected
[ ] Reusing the same signed nonce is rejected
[ ] Wrong version is rejected
[ ] Wrong secret is rejected

Do not claim full realtime push: this app's existing sync uses request/response polling or explicit loads/saves through Sheets. Instant push requires a separate realtime transport and frontend work.
