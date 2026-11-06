GWC V24 — NO-SECRET DOMAIN / ORIGIN LOCK (HINDI)
================================================

उद्देश्य
-------
- Default authorized website: https://growth-world-classes-2-0.onrender.com
- पहली बार नया Code.gs चलने पर allowlist केवल इसी official origin पर सेट होगी।
- growthworldclasses.com सहित पुराने/अनधिकृत origins allowlist से हट जाएंगे।
- Admin Dashboard में “Authorized Domains” विकल्प केवल Main Admin को दिखता है।
- Domain जोड़ने/हटाने पर मौजूदा Main Admin ID और Password से दोबारा पुष्टि होती है।
- सक्रिय वेबसाइट को उसी वेबसाइट से हटाया नहीं जा सकता, ताकि Admin खुद को lock out न कर दे।
- नए domain पर migrate करने के लिए: पहले नया domain add करें, उसे इसी Render service पर point करें, नए domain से साइट खोलें और Admin login करें; फिर पुराने domain को remove करें।

महत्वपूर्ण सुरक्षा सीमा — कृपया पढ़ें
---------------------------------
यह बिना Secret वाला browser Origin/Referer gate है। सामान्य browser requests जो किसी unapproved website से proxy को भेजी जाएँगी, उन्हें Render proxy 403 देगा। लेकिन Origin/Referer headers को non-browser client spoof कर सकता है। Google Apps Script Web App को public “Anyone” access पर रखने पर उसके direct URL को जानने वाला व्यक्ति Apps Script endpoint को सीधे call कर सकता है; Apps Script doGet/doPost में incoming HTTP Origin header उपलब्ध नहीं होता। इसलिए बिना Secret/OAuth authentication के direct Apps Script access को पूरी तरह रोकने या चोरी हुई ZIP से 100% सुरक्षा की गारंटी नहीं दी जा सकती। यह build उसी सीमा को स्वीकार करते हुए proxy-level domain lock देता है।

इस build में क्या बदला
---------------------
1. server.js: Origin/Referer allowlist check; blocked origin पर /api/gwc और /api/domains के लिए HTTP 403; GET/POST action allowlists; server.js, Code.gs, package.json जैसी source/config files static hosting से छिपाई गईं।
2. Code.gs: पहली बार domain-lock request पर GWC_ALLOWED_ORIGINS को केवल official Render origin पर initialize करता है; Main Admin credentials की पुष्टि के बाद domain add/remove करता है; active origin को remove करने से रोकता है।
3. index.html: Browser से direct Apps Script URL reference हटाया; existing same-origin /api/gwc proxy कायम; Admin-only Authorized Domains UI और migration instructions कायम/अपडेट।
4. package.json: unchanged.
5. अन्य पुरानी फाइलें: unchanged.

Deploy प्रक्रिया
----------------
A. सुरक्षित तैयारी
1. GitHub repository और Google Sheet का backup/copy रखें।
2. पुराने Render service को delete न करें। Existing Render service और GitHub repository ही update करें।
3. ZIP extract करके सभी project files GitHub repository में upload/commit करें (root में server.js, package.json, index.html और Code.gs रहने चाहिए)।

B. Google Apps Script
1. उसी पुराने Apps Script project को खोलें जो GWC की मौजूदा Google Sheet/Drive से जुड़ा है।
2. मौजूदा Code.gs का local backup रखें; फिर इस ZIP का नया Code.gs paste करें।
3. Script Properties में GWC_SPREADSHEET_ID और बाकी सभी पुरानी properties जस की तस रखें। कोई पुरानी property delete न करें।
4. Deploy > Manage deployments > Edit > New version > Deploy करें। Web App access setting को मौजूदा integration के अनुसार “Anyone” रखना होगा ताकि Render proxy request कर सके।
5. पहली origincheck request पर GWC_ALLOWED_ORIGINS स्वतः केवल official Render origin से initialize होगा। Google Sheet/Drive data को यह migration नहीं बदलता।

C. Render
1. Existing Render Web Service > Settings/Build & Deploy में repository/branch वही रखें जिसे आपने update किया है।
2. Build command: npm install
3. Start command: npm start
4. Environment में GWC_API_URL हो तो उसे अपने मौजूदा deployed Apps Script Web App URL पर रखें। यदि पहले से सही है तो न बदलें।
5. इस no-secret build में GWC_PROXY_SECRET की जरूरत नहीं है। अगर पुराना Render environment variable मौजूद है तो यह code उसे पढ़ता नहीं; हटाना वैकल्पिक है, जरूरी नहीं।
6. Manual Deploy > Deploy latest commit करें।

D. जाँच
1. https://growth-world-classes-2-0.onrender.com/ खोलें।
2. Admin login करके Dashboard > Authorized Domains खोलें। Default list में official Render origin दिखना चाहिए।
3. Google Sync status, Student/Teacher/Admin login, Fee Management और Help Desk test करें।
4. growthworldclasses.com पर proxy sync 403 होना चाहिए, जब तक Admin उसे फिर से allowlist में add न करे।

Admin द्वारा domain migrate करना
-------------------------------
1. पुराने authorized domain पर Main Admin login करें।
2. Authorized Domains में नया HTTPS origin add करें, जैसे https://your-new-domain.example
3. Render Dashboard में उसी Web Service के Custom Domains में नया domain configure करें और DNS निर्देश पूरे करें। अलग hosting पर केवल ZIP copy करने से वह same Render proxy नहीं बनेगा।
4. नया domain खुलने और proxy allow होने के बाद वहाँ Main Admin login करें।
5. Authorized Domains से पुराना domain remove करें। सक्रिय domain को हटाया नहीं जा सकता।

क्या सुरक्षित रखा गया
--------------------
- पुराने Admin/Sub-admin/Teacher/Student login records और credentials का data model
- Dashboard का existing visual design, icons, colors और existing feature UI
- Fee, courses, students, teachers, attendance, homework, tests, admissions, Help Desk आदि का existing app state format
- Google Sheet/Drive IDs और existing Script Properties को नहीं बदला गया

Live testing सीमा
-----------------
इस ZIP की local syntax/structure जाँच की गई है। आपके Render account, Apps Script deployment, Google Sheet, Drive, live login या chat पर deployment के बाद live test नहीं किया गया। पहले backup लें और फिर live checks करें।


V24.1 DEFAULT ORIGIN FIX
-----------------------
पहले version में कुछ same-origin GET requests में Browser Origin/Referer header अनुपस्थित होने पर Render proxy खाली origin मानकर 403 दे सकता था। इस update में server.js forwarded host/protocol fallback उपयोग करता है। Official Render host से आई same-origin request का origin https://growth-world-classes-2-0.onrender.com पहचाना जाएगा। Explicit external Origin header होने पर उसी external origin की जाँच होगी; उसे Host fallback से override नहीं किया जाएगा।

यदि GWC_ALLOWED_ORIGINS property खाली/invalid हो तो नया Code.gs उसे सुरक्षित default official Render origin से भरता है, ताकि Admin स्वयं को lock out न कर दे।
