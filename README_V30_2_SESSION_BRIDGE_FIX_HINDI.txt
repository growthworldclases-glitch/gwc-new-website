GWC V30.2 – PUSH NOTIFICATION SESSION BRIDGE FIX
================================================

आधार: GWC V30.1 push notification all-portals login fix package.

इस patch में क्या ठीक किया गया:
1. Main GWC app के authenticated current user, state और googleApi को एक explicit
   window.gwcGetPushContext() bridge से notification modules तक उपलब्ध कराया।
2. Push setup अब उसी authenticated session और उसी app state/save function का उपयोग करता है।
3. Admin, Sub-admin, Teacher और Student के लिए dashboard notification panel इसी
   bridge से login पहचानता है।
4. Existing V28 weekly schedule, Helpdesk, student/teacher assignments, fees,
   credentials, settings, Google Apps Script URL और Proxy Secret को बदलने वाला
   कोई migration या data reset शामिल नहीं है।

Deployment:
- पहले Render source/ZIP और Google Sheet का backup लें।
- ZIP extract करके मौजूदा Render source files replace करें; existing Render service ही रखें।
- Code.gs / Google Apps Script को इस patch के कारण बदलने की जरूरत नहीं है।
- Existing six Render environment variables जस के तस रखें; VAPID key pair न बदलें।
- npm install और Render deploy पूरा होने दें।
- Website hard refresh (Ctrl+Shift+R) करके Admin, Sub-admin, Teacher, Student से अलग-अलग test करें।

Testing notes:
- Browser permission Allow होना चाहिए।
- Subscription save होने के बाद Google Sheet state में gwcPushSubscriptions array बनेगा।
- Live Render, Google Sheet और वास्तविक device पर end-to-end test इस build environment से नहीं किया जा सकता।
