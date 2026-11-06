GWC V23 — OFFICIAL DOMAIN LOCK + GOOGLE APPS SCRIPT PROXY AUTH
================================================================

यह build आपके दिए हुए GWC_V23_FEE_MANAGEMENT_WEEKLY_REALTIME ZIP पर आधारित है।

सुरक्षा में क्या बदला
---------------------
1. वेबसाइट केवल इस Host पर खुलेगी:
   https://growth-world-classes-2-0.onrender.com

2. Render server किसी दूसरे Host/domain पर website या /api/gwc serve नहीं करेगा।
   दूसरे domain पर HTTP 403 मिलेगा।

3. Google Apps Script अब हर GET/POST request पर server-side proxy secret जाँचता है।
   ZIP से निकली हुई copy अगर किसी दूसरे domain/server पर लगाई जाए और उसके पास
   Render का Environment Secret न हो, तो वह Google Sheets read/write/sync नहीं कर पाएगी।

4. Secret केवल Render Environment और Apps Script Script Properties में रखा जाता है।
   इसे index.html, ZIP, GitHub repository या browser JavaScript में नहीं डालना है।

क्या unchanged रखा गया
----------------------
- index.html (पूरा पुराना UI, Dashboard, Icons, login flow, Fee Management,
  Weekly Schedule, Help Desk और बाकी फीचर्स) byte-for-byte unchanged.
- package.json unchanged.
- Spreadsheet/Drive schema और data migration नहीं की गई।
- कोई ID, password, student, teacher, course, fee cycle या chat record edit नहीं किया।
- Existing Apps Script URL default unchanged.

महत्वपूर्ण सीमाएँ
-----------------
- यह build एक ही official domain को allow करता है। Admin dashboard से अतिरिक्त domains
  add/remove करने का UI इस build में नहीं है।
- यह server + Apps Script protection है। ZIP में पहले से मौजूद public media/files की
  अलग-अलग Drive sharing permissions इस change से अपने-आप private नहीं होतीं।
- यह ZIP local syntax/integrity check से गुजरी है; live Google account/Render पर end-to-end
  test यहाँ नहीं किया जा सकता।

DEPLOYMENT — दोनों जगह समान Secret लगाना अनिवार्य
=================================================

A. एक मजबूत Secret बनाएं (Windows PowerShell)
----------------------------------------------
PowerShell खोलकर यह command चलाएं:

$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)

जो लंबी value मिले, उसे अपने पास सुरक्षित रखें। कम-से-कम 32 characters जरूरी हैं।
इसे chat, screenshot, GitHub, ZIP या index.html में share न करें।

B. Google Apps Script में
-------------------------
1. Existing GWC Apps Script project खोलें।
2. Project Settings (gear icon) → Script Properties → Add script property.
3. Property: GWC_PROXY_SECRET
4. Value: PowerShell से बनाई गई पूरी Secret value.
5. Save script properties.
6. Code.gs को इस ZIP के नए Code.gs से replace करें। बाकी Script files/properties न हटाएं।
7. Deploy → Manage deployments → existing Web App के Edit icon → New version → Deploy.
8. Execute as: Me रखें। Web app access: Anyone रखें (Render proxy को call करने के लिए)।
   Existing deployment URL और GWC_SPREADSHEET_ID property न बदलें।

C. Render में
-------------
1. https://dashboard.render.com/ खोलें और existing GWC Web Service चुनें।
2. Environment tab → Add Environment Variable.
3. Key: GWC_PROXY_SECRET
4. Value: ऊपर वाली बिल्कुल वही Secret value.
5. Save Changes करें।
6. उसी service में GitHub repo की files इस ZIP की files से update करें; फिर Deploy latest commit करें।
7. Environment में GWC_API_URL पहले से सही हो तो उसे न बदलें।

D. जाँच
-------
1. Official URL खोलें और Admin/Teacher/Student test login करें।
2. Test record/feature से Google sync जाँचें।
3. Google Apps Script /exec URL को सीधे खोलने पर authorized data response नहीं मिलना चाहिए।
4. किसी non-official domain पर website खोलने पर 403 आना चाहिए।

TROUBLESHOOTING
---------------
- "GWC_PROXY_SECRET is missing or too short in Render Environment":
  Render Environment में Key spelling ठीक हो, Value 32+ characters हो और Save Changes के बाद
  deploy/restart पूरा हुआ हो।
- "GWC_PROXY_SECRET is missing or too short in Apps Script Script Properties":
  Apps Script Project Settings में वही property add/save करें।
- Unauthorized:
  Render और Apps Script में Secret character-by-character बिल्कुल समान करें।
- Google sync बंद हो:
  पुराना backup restore/delete न करें। पहले Render Logs, Apps Script Executions और
  deployment version जाँचें।

DATA SAFETY
-----------
इस ZIP को deploy करने से पहले current GitHub commit, ZIP और Google Sheet का backup रखें।
किसी भी backup को restore या storage sheet को clear करने की जरूरत इस domain-lock change
के लिए नहीं है।
