GWC V24 — STRONG SERVER AUTHENTICATION + ADMIN DOMAIN MANAGER
============================================================

यह V23 ZIP पर additive security update है। पुराने portal UI, dashboard modules,
icons, login/session logic, data model और Google Sheets storage routines को rewrite
नहीं किया गया। Security के लिए index.html, server.js और Code.gs में बदलाव हुए हैं।

क्या नया है
-----------
1. Browser अब Google Apps Script URL को सीधे call नहीं करता; same-origin /api/gwc
   Render proxy से requests जाती हैं। HTML से Apps Script URL हटाया गया है।
2. Render server पर GWC_PROXY_SECRET अनिवार्य है (कम-से-कम 32 characters; 48+
   recommended)। यह Secret ZIP/HTML/JavaScript में नहीं है।
3. Apps Script में raw Secret नहीं रखा जाता। Script Property
   GWC_PROXY_SECRET_SHA256 में केवल SHA-256 hash रखा जाता है। Render Secret को
   request body में server-to-server भेजता है; Apps Script hash verify करता है।
4. Apps Script doGet direct requests को deny करता है। doPost पर valid proxy auth के
   बिना load/save/upload आदि सभी actions reject होते हैं।
5. Render server HTML, assets, health और API routes serve करने से पहले request Host
   को allowlist से जाँचता है। Default primary domain:
   growth-world-classes-2-0.onrender.com
6. Main Admin dashboard में नया “🛡️ Authorized Domains” menu है। Main Admin अपने
   वर्तमान Admin ID/password से domain add/remove कर सकता है।
7. Allowlist Apps Script Script Properties में persist होती है, browser localStorage
   या ZIP में नहीं। Primary Render domain remove नहीं किया जा सकता।
8. growthworldclasses.com default allowlist में नहीं है; अगर वह पहले add था तो Admin
   panel से remove करें।

महत्वपूर्ण सुरक्षा सीमा
----------------------
- Render और Apps Script दोनों में एक बार setup करना जरूरी है। केवल ZIP deploy करने
  से Secret अपने-आप configure नहीं हो सकता; यह secret जानबूझकर ZIP में नहीं है।
- Apps Script Web App access setting “Anyone” रहनी चाहिए ताकि Render server इसे call
  कर सके; लेकिन अब बिना proxy hash के Apps Script actions reject होते हैं।
- यह बदलाव आपके अपने Apps Script deployment को सुरक्षित करता है। किसी तीसरे व्यक्ति
  ने यदि आपकी ZIP की copy से अपना अलग Apps Script project/deployment बना लिया है,
  तो उस अलग deployment को उसके Google account से अलग revoke/report करना होगा।
- Browser Origin/Host checks के साथ server-to-server authentication जोड़ा गया है।
  केवल Origin check पर निर्भर नहीं है।
- Admin domain change के बाद Render process में cached host decision अधिकतम लगभग
  15 seconds रह सकता है।

DEPLOYMENT — कृपया क्रम न बदलें
-------------------------------
A. पहले Backup
1. Google Spreadsheet की अलग copy बनाएं।
2. मौजूदा Render GitHub repository और live ZIP की copy सुरक्षित रखें।
3. GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID, पुराने records, sheets या backup tabs
   को delete/rename न करें।

B. Secret बनाएं (Windows PowerShell)
1. PowerShell खोलें और नीचे पूरा block चलाएं:

   $bytes = New-Object byte[] 48
   [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
   $GwcSecret = [Convert]::ToBase64String($bytes)
   $sha = [System.Security.Cryptography.SHA256]::Create()
   $GwcHash = [Convert]::ToHexString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($GwcSecret))).ToLower()
   Set-Clipboard -Value $GwcSecret
   Write-Host "Secret copied to clipboard. Paste it only into Render Environment."
   Write-Host "Apps Script SHA-256 hash: $GwcHash"

2. Secret clipboard में copy होगा। इसे किसी को न भेजें, ZIP/HTML/GitHub में न डालें।
3. PowerShell में दिखा GwcHash नोट करें। यह raw Secret नहीं है।

C. Google Apps Script में केवल HASH रखें
1. उसी पुराने Google Apps Script project को खोलें जो मौजूदा GWC Spreadsheet से जुड़ा है।
2. Code.gs को इस ZIP वाले नए Code.gs से replace करें। बाकी Script files अगर project
   में हैं तो उन्हें न हटाएं।
3. Project Settings → Script Properties में जाएं।
4. नई property जोड़ें:
      Property: GWC_PROXY_SECRET_SHA256
      Value:    PowerShell में दिखा पूरा GwcHash
5. अगर पुरानी property GWC_PROXY_SECRET मौजूद है, तो नई hash property save होने के बाद
   केवल उस पुरानी raw-secret property को हटाएं। GWC_SPREADSHEET_ID,
   GWC_DRIVE_FOLDER_ID और दूसरी properties न हटाएं।
6. Script को Save करें। Deploy → Manage deployments → Edit → New version → Deploy.
7. Web App URL वही पुराना रखें; Execute as: Me; Who has access: Anyone.
8. Apps Script deployment URL बदलें नहीं। इस ZIP के server.js में मौजूदा URL fallback
   रखा गया है; यदि आपका वास्तविक URL अलग है तो Render GWC_API_URL में सही URL रखें।

D. Render Environment
1. Render Dashboard → अपनी मौजूदा GWC Web Service → Environment.
2. Add/Update:
      Key:   GWC_PROXY_SECRET
      Value: PowerShell clipboard से paste किया गया पूरा Secret
3. सुनिश्चित करें कि Secret कम-से-कम 32 characters है। यही Secret ZIP में नहीं है।
4. यदि GWC_API_URL पहले से सही है तो उसे न बदलें। यदि नहीं है तो उसी पुराने Apps
   Script Web App URL को GWC_API_URL में रखें।
5. Save Changes करें और Deploy latest commit करें।
6. Build/Deploy successful होने तक प्रतीक्षा करें।

E. GitHub files
1. ZIP extract करें और इसके files उसी Render GitHub repository root में रखें।
2. कम-से-कम updated index.html, server.js और Code.gs इस्तेमाल करें। package.json
   और बाकी पुराने files भी ZIP में दिए गए हैं; उन्हें हटाएं नहीं।
3. GitHub commit/push करें और Render में deploy पूरा होने दें।
4. Build command खाली/default रखें; Start command: npm start (यदि आपकी मौजूदा
   Render service में यही है तो बदलने की जरूरत नहीं)। Node 18+ आवश्यक है।

F. First test
1. Official URL खोलें:
   https://growth-world-classes-2-0.onrender.com/
2. नीचे Sync status “Sync Successful” दिखना चाहिए। Admin, Teacher और Student के
   test logins जांचें। कोई नया student/fee record test के बिना न बनाएं।
3. Admin login → “🛡️ Authorized Domains”. Main Admin password डालकर domain list
   load करें। Default list में primary Render domain होना चाहिए।
4. growthworldclasses.com अगर list में दिखे तो Remove करें। Removal के बाद करीब
   15 seconds तक पुराना cached allow decision रह सकता है। फिर उस domain को खोलकर
   verify करें कि access blocked है।
5. नया domain जोड़ने के लिए domain बिना https:// और बिना path के लिखें, उदाहरण
   example.com; Admin password देकर Add Domain करें। केवल अपना नियंत्रित domain add करें।
6. Apps Script URL सीधे browser में खोलने पर “Direct Apps Script access is disabled”
   आना अपेक्षित है। यह direct public read block का संकेत है।

क्या नहीं बदला
--------------
- Admin/Sub-admin/Teacher/Student login flow और existing credential records.
- Existing dashboard feature screens, sidebar icons, colors and portal layout.
- Fee Management, fee cycle logic, weekly schedule, courses, batches, admissions,
  tests, homework, attendance, leave requests, posters and helpdesk UI.
- Existing Google Sheets chunk storage, backup/staging/restore code and Drive upload,
  archive routines.
- Spreadsheet schema, existing student/teacher/course records and IDs/passwords.
- package.json dependencies and start script.

फाइल बदलाव
-----------
- index.html: Apps Script URL हटाया; Admin-only Authorized Domains screen जोड़ी।
- server.js: server-side Secret verification, Host/Origin gate, proxy forwarding और
  domain allowlist check जोड़ा।
- Code.gs: proxy hash authentication, direct GET denial, authenticated load/save,
  Script Properties allowlist और Admin-verified add/remove actions जोड़े।
- package.json: unchanged.
- अन्य original README files: unchanged.

Validation
----------
- server.js Node syntax: PASS
- Code.gs JavaScript syntax parse: PASS
- index.html के सभी inline JavaScript blocks: PASS
- package.json JSON parse: PASS
- ZIP integrity: checked after packaging.

यह local static/syntax validation है। इस environment से आपके Render, Google Apps Script,
Google Sheet, Drive, actual login credentials या live chat पर end-to-end deployment
test नहीं किया जा सकता। Deploy से पहले Spreadsheet copy और test account का उपयोग करें।
