GWC V24 — NO-SECRET DOMAIN / ORIGIN LOCK (LIMITED SECURITY)

महत्वपूर्ण सीमा:
यह संस्करण Browser Origin/Referer के आधार पर Render /api/gwc Proxy को allow/deny करता है। यह सामान्य दूसरे वेबसाइट Origin को रोकता है, लेकिन Origin/Referer spoof करने वाले गैर-ब्राउज़र क्लाइंट या चोरी की ZIP में सीधे Google Apps Script URL इस्तेमाल करने वाले व्यक्ति को पूर्ण रूप से नहीं रोक सकता। Google Apps Script का Anyone Web App URL सार्वजनिक रहता है। बिना किसी Secret/Token या Google-side authentication के direct URL को सुरक्षित रूप से बंद करना संभव नहीं है।

मुख्य बदलाव:
1. server.js में Google Sync proxy पर allowlist आधारित Origin check।
2. Code.gs में Script Properties GWC_ALLOWED_ORIGINS में अधिकृत origins सूची। पहली बार default केवल https://growth-world-classes-2-0.onrender.com होगा।
3. Admin dashboard menu में “🛡️ Authorized Domains” जोड़ा गया। Main Admin current password की पुष्टि के बाद domain add/remove कर सकता है।
4. Official Render domain हटाया नहीं जा सकता।
5. पुराना index.html dashboard/login/features संरक्षित रखकर केवल domain manager जोड़ा गया।
6. पुराने data sheet/IDs/passwords/fee data को migrate या reset नहीं किया जाता।

DEPLOY STEPS (पहले backup लें):
A. ZIP को नए GitHub branch/repository में extract करें। पुराना live branch overwrite न करें।
B. Render में उसी service का Root Directory और Start Command पुराना ही रखें; Build Command npm install, Start Command npm start (यदि package.json में start script यही है)।
C. Render Environment में GWC_API_URL को आपके मौजूदा Apps Script Web App URL पर रखें। कोई GWC_PROXY_SECRET आवश्यक नहीं है।
D. Google Apps Script के उसी पुराने project में Code.gs replace करें। Script Properties में GWC_SPREADSHEET_ID और GWC_DRIVE_FOLDER_ID जैसी पुरानी properties न हटाएं। GWC_ALLOWED_ORIGINS property न हो तो script पहली request पर default official Render domain बना देगी।
E. Apps Script: Deploy > Manage deployments > Edit > New version > Deploy. Execute as Me और access Anyone रखें (Render server-side fetch के लिए)। Web App URL वही रखें; यदि URL बदलता है तो Render GWC_API_URL update करें।
F. Render में नया commit deploy करें।
G. Official website पर Main Admin login करें > Authorized Domains. वहाँ growthworldclasses.com सूची में हो तो Remove करें।
H. Logout/login करके test करें: official website sync होना चाहिए; removed domain से proxy sync 403 blocked होना चाहिए।

क्या नहीं बदला:
- Login ID/password state structure, Google Sheet storage/chunking/backups, Drive upload/archive logic, Fee/Course/Student/Teacher features, existing visual styles and dashboard menu entries.
- कोई Sheet restore/delete/reset नहीं होता।

महत्वपूर्ण: Admin Domain Manager का password confirmation browser से भेजा जाता है और Google Script में current state.admin credentials से verify होता है। यह convenience admin gate है, पूर्ण server authentication नहीं। इस no-secret mode को पूर्ण data security न मानें। यदि चोरी हुई ZIP से direct Apps Script access रोकना अनिवार्य है, तो Secret/Token, Google OAuth/IAP या private authenticated backend आवश्यक होगा।

ZIP में Secret शामिल नहीं है। ZIP deploy करने से पहले test branch और backup रखें।
