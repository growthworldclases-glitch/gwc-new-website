GWC V24 SECURE GOOGLE SYNC
===========================

यह build आपके अपलोड किए हुए GWC V23 ZIP पर आधारित है। index.html के पुराने dashboard/features और
मौजूदा data model को जानबूझकर rewrite नहीं किया गया। सुरक्षा के लिए Code.gs, server.js और
index.html के Google-sync transport में बदलाव किया गया है। IDs/passwords, Spreadsheet ID,
Drive Folder ID और existing sheet names को इस ZIP में regenerate/migrate नहीं किया गया।

महत्वपूर्ण सीमा
---------------
V24 का signed endpoint पुराने V23/V22 browser/proxy requests को reject करता है। लेकिन यदि
पुराना V23 Apps Script deployment अभी भी अलग URL पर चल रहा है और उसमें पुराना खुला Code.gs है,
तो V24 ZIP उसे अपने-आप बंद नहीं कर सकता। पुराने endpoint को retire/disable करना और मौजूदा
Apps Script deployment को V24 Code.gs से update करना अनिवार्य है। पुराने खुले Code.gs को
किसी दूसरे नए Apps Script project में deploy करके वही Spreadsheet access देना भी रोकें।

सुरक्षा सुविधाएँ
---------------
1. Version Lock: Render केवल x-gwc-client-version=24.0-secure स्वीकार करता है; Apps Script
   भी GWC_ALLOWED_VERSION की exact match जाँचता है।
2. Secret Rotation: Render और Apps Script में GWC_PROXY_SECRET एक साथ बदलें। पुराना secret
   बदलने के बाद तुरंत अमान्य हो जाता है।
3. Request Verification: हर request पर HMAC-SHA256 signature verify होता है।
4. Replay Protection: 5 मिनट timestamp window, random nonce और Apps Script Cache + Lock
   के साथ पहले इस्तेमाल nonce को 10 मिनट तक reject किया जाता है।
5. Backup Protection: V23 का पुराना writeState_ validation, staging verification, hourly
   snapshot और destructive-write safety checks यथावत रखे गए हैं। Invalid JSON/empty state
   से existing good state replace नहीं होती।

SECRET (64 hex characters)
--------------------------
cfcd28f518c951f7095464300562235be1d2532f7ad0d149922ae62771f6caef

इसे किसी public GitHub repository, screenshot, WhatsApp group या student/teacher के साथ share न करें।
यह secret इस ZIP के source code में embed नहीं है; केवल Render Environment और Apps Script
Script Properties में डालना है।

DEPLOYMENT — STEP BY STEP
-------------------------
A. पहले backup
1. Google Spreadsheet की File > Make a copy से पूरी copy बनाएँ।
2. मौजूदा Render GitHub repository की current branch/ZIP अलग सुरक्षित रखें।
3. Apps Script में Project Settings/Deployments का पुराना Web App URL नोट करें।
4. नीचे दिया गया पुराना URL ही GWC_API_URL में रखें; नया project/Spreadsheet न बनाएँ।

B. Google Apps Script
1. मौजूदा GWC Apps Script project खोलें (वही project जो वर्तमान Spreadsheet/Drive से जुड़ा है)।
2. पूरा नया Code.gs paste करें। बाकी project files/triggers को बिना जाँचे delete न करें।
3. Project Settings > Script Properties में ये properties बनाएँ/बदलें:
   GWC_PROXY_SECRET = cfcd28f518c951f7095464300562235be1d2532f7ad0d149922ae62771f6caef
   GWC_ALLOWED_VERSION = 24.0-secure
   GWC_SPREADSHEET_ID = आपका मौजूदा Spreadsheet ID (बिल्कुल वही)
   GWC_DRIVE_FOLDER_ID = आपका मौजूदा Drive Folder ID (बिल्कुल वही; यदि पहले उपयोग होता था)
4. Save करें।
5. Deploy > Manage deployments > मौजूदा Web App deployment के Edit (pencil) पर जाएँ।
6. Version में New version चुनें। Execute as: Me रखें। Who has access: Anyone रखें।
   (Endpoint signed requests के बिना कोई data action नहीं करेगा।)
7. Deploy करें। Web App URL वही deployment URL रहना चाहिए। यदि URL बदलता है, तो नया URL
   Render Environment में डालें।

C. Render
1. GitHub repository में इस ZIP को extract करके files upload/commit करें।
2. Render Web Service > Environment में ये values रखें:
   GWC_API_URL = https://script.google.com/macros/s/आपका_DEPLOYMENT_ID/exec
   GWC_PROXY_SECRET = cfcd28f518c951f7095464300562235be1d2532f7ad0d149922ae62771f6caef
   GWC_APP_VERSION = 24.0-secure
3. Save Changes करें और Manual Deploy > Deploy latest commit करें।
4. Render Settings में Build Command: npm install और Start Command: npm start रखें।
5. Deploy के बाद https://आपकी-render-domain/healthz खोलें। ok:true और version 24.0-secure आना चाहिए।

D. परीक्षण (पहले test accounts पर)
1. वेबसाइट खुले और Google Sync connected हो।
2. Admin login, Teacher login, Student login जाँचें।
3. Test student पर fee cycle list/start/reset जाँचें।
4. Weekly Schedule publish करके teacher और assigned student view जाँचें।
5. Help Desk text/PDF/photo, notices, course poster और Drive upload जाँचें।
6. Test record save करके refresh के बाद वापस आने की पुष्टि करें।
7. Apps Script Executions में verifySignedRequest_ executions देखें।

SECRET ROTATION
---------------
भविष्य में secret बदलने के लिए:
1. नया random 64-hex secret बनाएँ।
2. Apps Script Script Property GWC_PROXY_SECRET बदलें।
3. उसी समय Render Environment GWC_PROXY_SECRET को वही नया value करें।
4. Render redeploy करें और /healthz + login + sync test करें।
दोनों जगह value समान न होने तक sync बंद रहेगा। Secret को HTML/index.html में कभी न डालें।

OLD V23 / BELOW BLOCK TEST
--------------------------
- पुराने V23 HTML से V24 Render API call करने पर client-version header न होने के कारण HTTP 404
  SERVER_NOT_FOUND मिलेगा।
- पुराने V23 Render server से V24 Apps Script पर request भेजने पर signature न होने के कारण
  SECURITY_BLOCK मिलेगा।
- सीधे Apps Script GET call पर SERVER_NOT_FOUND मिलेगा।
- यह तभी लागू होगा जब मौजूदा Apps Script deployment को V24 Code.gs से update किया गया हो।
  अलग पुराने open Apps Script deployment को अलग से retire करना होगा।

NOTES / HONEST TEST STATUS
--------------------------
इस ZIP में सभी 15 मूल files रखी गई हैं; README_V24_HINDI.txt जोड़ी गई है। Code syntax, JSON,
ZIP integrity और source-level request flow test करें। यहाँ से आपके वास्तविक Render account,
Google account, live Sheet, Apps Script deployment या student credentials में login करके
end-to-end परीक्षण करना संभव नहीं है। Live deploy से पहले backup और test accounts अनिवार्य हैं।
