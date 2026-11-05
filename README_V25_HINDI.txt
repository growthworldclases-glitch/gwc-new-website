GWC V25 — WHATSAPP HELPDESK REFRESH + DRAFT PRESERVATION
=========================================================

Based on the supplied GWC V24 ZIP. This is a focused additive update.

Changes:
1. WhatsApp Help Desk chat polling is now every 10 seconds.
2. Common Helpdesk polling remains every 3 seconds.
3. Other existing site/dashboard refresh timers are unchanged.
4. WhatsApp message text is retained in the browser while dashboard or chat
   refreshes re-render the page, and restored into the composer.
5. WhatsApp messages are still sent only after the user presses the explicit
   Send button. The existing send-confirmation guard remains in place.
6. After a successful send, only that conversation's draft is cleared.
7. Google Chat Sync, Google Sheets chat storage, attachments, groups, read
   receipts, archive controls, login IDs/passwords, settings and all other
   existing modules/configuration are retained.

Files changed:
- index.html: WhatsApp draft preservation and polling intervals.
- README_V25_HINDI.txt: this change note.
No changes to server.js, Code.gs, package.json, credentials, settings, or IDs.

Deployment:
- Back up the live project first.
- Update the existing project with this ZIP; do not create a new Render service.
- Keep the existing environment variables and Apps Script deployment/settings.
- Since Code.gs and server.js are unchanged, no Apps Script code update is required
  for this focused front-end change.
