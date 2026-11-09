GWC V29 – WEBSITE PRESENCE / HELPDESK HIDE / CLASS ALERT ADD-ON
================================================================

आधार: GWC_V28_CLASSWISE_WEEKLY_SCHEDULE_ADDON
यह ZIP पुराने index.html, Code.gs, server.js, package.json और बाकी README फाइलों को
बनाए रखते हुए additive बदलाव करती है। Login IDs/passwords, courses, weekly schedule,
fee, uploads और बाकी पुराने modules को जानबूझकर नहीं बदला गया है।

V29 में किए गए बदलाव
--------------------
1. Website presence:
   - Logged-in admin/subadmin/teacher/student का heartbeat Apps Script Cache में जाता है।
   - Cache TTL 90 seconds है; उसके बाद user OFFLINE माना जाता है।
   - Teacher के Helpdesk panel में assigned students और Student के panel में assigned
     teacher का LIVE/OFFLINE status दिखता है।
   - Presence को मुख्य GWC_Storage JSON में नहीं लिखा जाता, इसलिए heartbeat से school
     master data पर बार-बार write नहीं होता।

2. Helpdesk View / Hide:
   - प्रत्येक message पर View और Hide actions जोड़े गए।
   - Hide करने वाले account की dashboard list से message हटता है।
   - Message state.gwcMessages में रहता है और दूसरे participant की chat से नहीं हटता।
   - पुराने messages जिनमें hiddenBy नहीं है, वैसे ही दिखेंगे।

3. Website browser notifications:
   - Helpdesk panel में Enable browser notifications बटन है।
   - अनुमति मिलने पर website खुली रहने के दौरान नए incoming Helpdesk messages के लिए
     browser notification दिखाई जा सकती है।
   - यह feature website-only है; Android APK में कोई बदलाव नहीं किया गया।

4. Weekly class alert:
   - मौजूदा gwcWeeklySchedules teacher schedule के day/time को पढ़कर website active
     रहने के दौरान scheduled time से 5 मिनट पहले से 10 मिनट बाद तक class notification
     दिखाता है।
   - Student के लिए uske assigned course ke teacher ka schedule पढ़ा जाता है।
   - 10 मिनट बाद alert window समाप्त हो जाती है। Alert browser notification history
     को OS/browser स्वयं नियंत्रित करता है।

IMPORTANT LIMITATIONS – PLEASE READ BEFORE DEPLOYMENT
-----------------------------------------------------
A. यह build पूर्ण background Web Push delivery नहीं देता। Browser Notification API
   तभी message दिखा सकती है जब website का page/browser active हो और notification
   permission granted हो। Website बंद होने पर, केवल login session होने के बावजूद,
   reliable push delivery के लिए Push API + Service Worker + VAPID/Firebase credentials
   और server-side subscription storage/sender जरूरी हैं। ये credentials इस ZIP में
   उपलब्ध नहीं थे, इसलिए ऐसा दावा नहीं किया गया है।

B. Class alerts मौजूदा V28 weekly schedule format (teacherId + day/time/topic) पर आधारित
   हैं। यदि एक teacher के अलग-अलग courses/batches के अलग timings हैं, तो current
   schedule schema में courseId/batchId नहीं है; उस स्थिति में course-wise exact
   targeting के लिए अगला schema extension आवश्यक होगा।

C. Google Meet में दूसरा व्यक्ति वास्तव में Meet room में मौजूद है या नहीं, इसकी पुष्टि
   Google Meet API/authorized integration के बिना नहीं हो सकती। यह presence status
   website पर logged-in activity बताता है, Meet room attendance नहीं।

DEPLOYMENT
----------
1. ZIP extract करें और existing Render project में index.html तथा server.js replace करें.
2. package.json की existing express dependency बनी हुई है; npm install / redeploy करें.
3. Code.gs को उसी Apps Script project में replace/update करें और Web App को नई version
   के रूप में redeploy करें। Existing Script Properties (Spreadsheet ID, proxy secrets,
   Drive folder ID) को न बदलें।
4. Render Environment Variables पहले जैसे ही रखें:
   GWC_API_URL, GWC_PROXY_SECRET, GWC_APP_VERSION=24.0-secure
   Apps Script Script Properties में GWC_ALLOWED_VERSION=24.0-secure और existing
   proxy secrets यथावत रहने चाहिए।
5. Website खोलकर Helpdesk में Enable browser notifications दबाएँ।
6. दो अलग accounts/devices से login करके LIVE/OFFLINE और Helpdesk Hide test करें।

TESTING NOTE
------------
इस package में JavaScript syntax checks किए गए हैं (index.html के inline scripts,
server.js और Code.gs)। Live Google Sheet, Render deployment, browser permission,
actual devices और Meet room को इस environment से access करके end-to-end test नहीं
किया जा सकता। इसलिए deploy से पहले backup लें और पहले test accounts पर जाँचें।
