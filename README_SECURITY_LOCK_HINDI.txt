GWC V23 — DOMAIN LOCK + GOOGLE SYNC PROXY AUTH
================================================

यह build आपके दिए हुए GWC_V23_FEE_MANAGEMENT_WEEKLY_REALTIME ZIP पर आधारित है।
मौजूदा index.html, dashboard/icons, login IDs/passwords, settings, student/teacher
records, fee cycles, weekly schedule, Help Desk/chat, posters और बाकी features को
नहीं बदला गया है। केवल server.js और Code.gs में security checks जोड़े गए हैं।

क्या सुरक्षा बदलाव हुआ
----------------------
1. केवल यह Host website serve कर सकता है:
   https://growth-world-classes-2-0.onrender.com

2. growthworldclasses.com सहित किसी दूसरे domain/hostname से आने पर Render server
   website files और /api/gwc दोनों को HTTP 403 देगा। इसलिए उस hostname से Google
   Sheets realtime/near-realtime sync भी नहीं चलेगा।

3. Google Apps Script अब GWC_PROXY_SECRET के बिना GET/POST sync स्वीकार नहीं करेगा।
   Browser में secret नहीं भेजा जाता; Render server इसे server-side inject करता है।
   Direct पुराने Apps Script URL से बिना secret के sync reject होगा।

4. Secret missing या गलत होने पर sync fail-closed रहेगा; data overwrite/delete नहीं होगा।

अनिवार्य सेटअप — दोनों जगह एक ही Secret
---------------------------------------
A. एक लंबा random secret बनाइए। अपने Windows PC पर Command Prompt में चलाएँ:

   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

   जो लंबी value निकले, उसे सुरक्षित रखें। GitHub या किसी public message में न डालें।

B. Google Apps Script:
   1. उसी पुराने Apps Script project में Code.gs replace करें।
   2. Project Settings → Script Properties → Add script property.
   3. Property name: GWC_PROXY_SECRET
   4. Value: ऊपर बनाई गई पूरी random value.
   5. Save करें।
   6. Deploy → Manage deployments → Edit (pencil) → New version → Deploy.
   7. Web App URL/deployment ID और GWC_SPREADSHEET_ID तथा GWC_DRIVE_FOLDER_ID
      properties को न बदलें। Existing spreadsheet/sheets का नाम या data न बदलें।

C. Render:
   1. ZIP extract करके मौजूदा GitHub/Render project में files update करें।
   2. Render → Web Service → Environment.
   3. Add Environment Variable:
      Key: GWC_PROXY_SECRET
      Value: Google Script Properties में डाली गई बिल्कुल वही random value.
   4. GWC_API_URL में मौजूदा Apps Script /exec URL ही रखें।
   5. Save, फिर deploy/redeploy करें।

D. Deploy के बाद जाँच:
   - https://growth-world-classes-2-0.onrender.com खोलें।
   - Admin, Teacher और Student login जाँचें।
   - Fee Management, Weekly Schedule और Help Desk message sync जाँचें।
   - https://growthworldclasses.com खोलने पर 403 access denied आना चाहिए।
   - Apps Script /exec URL को बिना proxySecret सीधे खोलने पर Unauthorized आना चाहिए।

महत्वपूर्ण
----------
- जब तक Render Environment और Apps Script Script Property दोनों में एक ही secret
  नहीं होगा, Google sync काम नहीं करेगा। यह जानबूझकर fail-closed सुरक्षा है।
- पुराना Apps Script deployment नया Code.gs deploy होने तक पुरानी तरह public रह सकता है।
  इसलिए Apps Script में नया version deploy करना आवश्यक है।
- यदि growthworldclasses.com किसी अलग hosting/server पर पूरी copied website चला रहा है,
  तो इस ZIP का Render server.js उस अलग hosting को अपने-आप बंद नहीं कर सकता। उस hosting
  को अलग से बंद/secure करना होगा। यह ZIP इस Render deployment और इसके Google sync proxy
  को protect करती है।
- Admin dashboard से domains add/remove करने का UI इस build में शामिल नहीं है। अभी
  सुरक्षा जानबूझकर fixed canonical domain तक सीमित है; browser-side admin state को
  domain authorization मानना सुरक्षित नहीं होगा। Admin-managed domain list जोड़ने के
  लिए server-side verified admin authentication/API आवश्यक है। इस build में कोई दूसरा
  domain गलती से allow नहीं होगा।
- Existing Google Apps Script URL, Spreadsheet ID, Drive ID, login records, settings,
  student/teacher IDs/passwords या state schema को migrate/reset नहीं किया गया।
- WhatsApp-style Help Desk का मौजूदा send/sync behavior untouched है; send timing
  network/Google Sheets polling latency पर निर्भर है, exact 1-second delivery guarantee
  नहीं दी जा सकती।
- Android APK अलग से rebuild नहीं किया गया है। यदि APK canonical Render URL खोलता है,
  website update app में load hoga; static bundled APK हो तो अलग Android rebuild चाहिए।

जाँच
----
- server.js syntax: PASS
- Code.gs syntax parse: PASS
- package.json parse: PASS
- ZIP integrity: PASS
- Original index.html and package.json retained unchanged.
- Live Render / Apps Script / Google Sheet credentials यहाँ उपलब्ध नहीं थे, इसलिए
  production end-to-end login/sync test नहीं किया जा सका।
