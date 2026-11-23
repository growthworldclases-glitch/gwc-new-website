GWC V50 PREPARATION — LIMITED OFFLINE UPDATE
Base: GWC_V23_V49_2_MERGED_NO_WEBSITE_SECURITY.zip

CHANGES INCLUDED
1. Student Portal > My Course now displays the assigned course's Class Time
   using course.classTime (or legacy course.schedule). If neither is configured,
   it displays "Not set by Admin".
2. Admin course management tables now include a Class Time column.
3. Render static-file responses now use ETag/Last-Modified and a 7-day cache
   policy for static assets. HTML, service worker, and manifest remain
   revalidated so new deployments can take effect.

IMPORTANT SECURITY LIMITATION — NOT IMPLEMENTED IN THIS ZIP
The requested Admin-managed website blocklist that prevents a blocked website
from reading Google Apps Script has NOT been implemented. A browser-origin
check in Render alone is not sufficient: a caller can bypass Render and call
the public Apps Script Web App URL directly. The current Code.gs still exposes
the legacy public state endpoint and does not validate a server-only signature.
A real fix requires a server-only shared secret/signature check in the existing
Apps Script project plus matching Render server configuration, followed by
redeploying the Apps Script Web App. Do not treat this ZIP as protecting the
Google Sheet from a person who knows the Apps Script /exec URL.

RENDER BANDWIDTH LIMITATION
This build reduces repeat static-asset transfers through browser caching, but
it does not remove Render hosting or API-proxy traffic. Because the user says
Render remains the hosting service, complete removal of Render bandwidth
dependency is not possible in this ZIP alone. API calls still pass through
Render and Render still serves the website.

PRESERVATION
- Original archive entries retained; root index.html and public/index.html kept
  identical.
- Code.gs, credentials, account model, IDs/passwords, settings, Google Sheet
  records, batch assignments, course records, and Apps Script deployment were
  not modified.
- No live data migration or reset was performed.

VALIDATION
- ZIP integrity checked.
- All 33 inline JavaScript blocks pass Node syntax validation.
- server.js and Code.gs pass Node syntax validation.
- worker.js passes ES module syntax validation.
- Live Google Apps Script, Render, Google Sheet, login flows, and bandwidth
  behavior were not tested.
