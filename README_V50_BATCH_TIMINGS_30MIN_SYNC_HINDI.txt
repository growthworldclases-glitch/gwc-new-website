GWC V50 — BATCH CLASS TIMINGS + CONTROLLED 30-MINUTE SYNC
==========================================================

BASE
----
User-uploaded: GWC_V49_3_RAILWAY_NOT_FOUND_FIXED (1).zip

CHANGES (index.html and public/index.html only)
------------------------------------------------
1. Admin > Class Timings now provides per-course / per-class / section / batch
   Start Time and End Time fields using the browser's native time picker.
2. Admin can save a time for each batch from the Class Timings page.
3. New single-course creation requires a valid Start Time and End Time before
   the course can be saved for sale. Existing sold courses can still be edited
   without forcing a new time entry; their existing legacy classTime is retained.
4. Bulk course generation requires Start Time and End Time and stores both
   fields plus the compatible legacy classTime string.
5. The latest Student > My Course view now displays the assigned course time.
   Teacher timing views continue to use the same course classTime field.
6. Background full-state cloud refresh changed from 60 seconds to 30 minutes.
   Foreground-tab auto-pulls were removed. Presence polling changed from 20
   seconds to 30 minutes. Help Desk redraw-only timer changed to 30 minutes.
7. Added an Admin-only "Admin Live Sync" button. It immediately saves the
   current shared state to the existing Google Apps Script / Google Sheet
   endpoint. Other already-open portals receive that state on their next
   scheduled 30-minute pull, or when the user manually reloads the page.

IMPORTANT SYNC LIMIT
--------------------
Google Apps Script + the current browser polling design does not provide a
server-push channel to wake all open browsers instantly. Therefore, an Admin
Live Sync click immediately publishes the data to the existing Sheet, but
other devices will not know about it until their next 30-minute pull or manual
page reload. True instant broadcast while eliminating polling requires a
separate push/realtime service (e.g. WebSocket/pub-sub) and coordinated backend
work; it is not silently added here.

SAVE BEHAVIOUR
--------------
Local changes made by Admin/Teacher/Student still save to the existing Sheet
after the existing debounce. The 30-minute setting applies to background
remote refresh, not to saving a user's own edits. This avoids holding local
edits for 30 minutes and reduces stale/lost work risk.

PRESERVED
---------
- Code.gs, server.js, worker.js, package.json, appsscript.json, railway.json,
  wrangler.toml, GWC_API_URL, Google Apps Script deployment configuration and
  existing Google Sheet / Drive data architecture are unchanged.
- No database migration, spreadsheet reset, Drive folder change, login ID,
  password, user/account, role, fee, payment, course, teacher, student or other
  settings schema was intentionally removed or reset.
- Existing classTime remains for backwards compatibility. New start/end fields
  are additive.

DEPLOYMENT
----------
Deploy the ZIP over the existing repository using the same Railway project,
same Apps Script Web App URL, same environment variables, same spreadsheet ID,
and existing Script Properties. Do not create a new blank Sheet or redeploy
Apps Script with new properties. Keep the previous deployment available for
rollback until real Admin/Teacher/Student tests pass.

LIMITS
------
Offline syntax and ZIP checks cannot certify live Railway, Apps Script, Sheets,
Drive, credentials, real account flows, or actual student visibility. Test
with one Admin, one Teacher and one Student before full rollout.
