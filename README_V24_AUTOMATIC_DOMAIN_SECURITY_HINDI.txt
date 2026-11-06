GWC V24 — AUTOMATIC PROXY AUTHENTICATION + ADMIN DOMAIN ALLOW-LIST
==================================================================

यह V23 ZIP पर additive security update है। Existing website UI, dashboard, icons,
login IDs/passwords, fee cycles, weekly schedule, Help Desk, student/teacher records,
Google Sheet storage format और Drive folders को migrate/reset नहीं किया गया है।

क्या नया है
-----------
1. Render server अब GWC_PROXY_SECRET के बिना Google Apps Script को कोई data request
   नहीं भेजेगा। Secret केवल Render Environment में रखा जाता है; HTML/ZIP में नहीं।
2. Google Apps Script सभी data-changing और data-reading POST requests पर उसी secret
   की जाँच करता है। Direct public GET से saved state अब नहीं लौटती।
3. Render proxy request के Origin/Referer को Google Sheet के saved state में मौजूद
   settings.authorizedDomains से मिलाता है। Official origin हमेशा allowed है:
   https://growth-world-classes-2-0.onrender.com
4. Main Admin sidebar में “Domain Security” जोड़ा गया है। Main Admin HTTPS origins
   जोड़ और हटा सकता है। Wildcard, plain HTTP, URL path और query स्वीकार नहीं होते।
5. server.js, Code.gs, package.json, README और .env जैसी backend/config files को
   Express static hosting से 404 किया गया है।
6. Existing GET /api/gwc frontend call को Render internally authenticated POST में
   बदलता है; frontend/API URL और spreadsheet schema नहीं बदलते।

महत्वपूर्ण: पहली बार एक बार का Secret pairing अनिवार्य है
--------------------------------------------------------
सुरक्षा के लिए secret को ZIP में hard-code नहीं किया गया है। ZIP में secret रखने पर
ZIP की copy पाने वाला व्यक्ति उसे निकाल सकता है और cloned server से sync कर सकता है।
इसलिए एक बार वही random secret दो स्थानों पर सेट करना आवश्यक है:

A. Secret बनाएँ (Windows PowerShell):
   [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
   इससे निकली पूरी string copy करें। यह कम-से-कम 32 characters से लंबी होगी।
   अपना secret किसी chat, screenshot, GitHub, HTML या ZIP में साझा न करें।

B. Google Apps Script:
   1. Existing GWC Apps Script project खोलें।
   2. Project Settings > Script Properties > Add script property.
   3. Property: GWC_PROXY_SECRET
   4. Value: अभी बनाई गई पूरी secret string.
   5. Save करें। GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID और बाकी properties न हटाएँ।
   6. Code.gs replace करें। Deploy > Manage deployments > Edit > New version > Deploy.
      Execute as: Me; Who has access: Anyone. Existing Web App deployment URL वही रखें.

C. Render:
   1. Existing GWC Render Web Service > Environment खोलें।
   2. Add/Update variable: Key = GWC_PROXY_SECRET
   3. Value = Google Apps Script में रखी वही exact string.
   4. Save Changes; फिर Manual Deploy > Deploy latest commit.
   5. /healthz खोलकर secretConfigured:true देखें। यह केवल Render में variable मौजूद
      होने की जाँच है; Google-side matching के लिए website login/sync भी test करें।

D. Website:
   https://growth-world-classes-2-0.onrender.com/ खोलें। Sync badge green होने और
   Admin/Teacher/Student test login सफल होने की पुष्टि करें।

Admin से domain जोड़ना/हटाना
----------------------------
1. Main Admin login करें।
2. Sidebar > Domain Security खोलें।
3. Add Authorized Domain दबाकर पूरा HTTPS origin दें, जैसे https://school.example.
4. Domain remove करने के लिए उसी row का Remove बटन दबाएँ।
5. Official Render domain स्थायी रूप से allowed है और remove नहीं हो सकता।
6. नया/हटाया गया allow-list बदलाव Google Sheets में save होने के बाद लागू होता है।

Deploy सावधानियाँ
-----------------
- पहले वर्तमान live ZIP, Apps Script Code.gs और Google Sheet का अलग backup रखें।
- Render पर पुराने service/environment को बदलें; नया blank Render service न बनाएँ।
- GWC_API_URL अगर पहले से Render Environment में configured है तो उसका पुराना सही URL
  बनाए रखें। अन्यथा server.js में मौजूदा default URL रखा गया है।
- Apps Script Web App URL न बदलें; पुराने spreadsheet ID या Drive IDs न बदलें।
- Google Sheet restore/reset/delete न करें। इस update में कोई backup restore नहीं होता।
- अगर Render पर GWC_PROXY_SECRET नहीं जोड़ा गया, तो “missing or too short” error
  जानबूझकर दिखेगा और sync बंद रहेगा। यह fail-closed सुरक्षा है।

सुरक्षा सीमा / वास्तविकता
------------------------
- यह clone किए गए ZIP से Google Apps Script sync रोकने के लिए Render-to-Apps-Script
  shared-secret gate और browser Origin allow-list लागू करता है। Secret ZIP में नहीं है.
- Browser Origin/Referer जाँच अतिरिक्त domain control है; HTTP headers को non-browser
  client नकली बना सकता है। यह अकेले पूर्ण identity/authentication नहीं है।
- इस पुराने GWC application का Admin login और shared JSON state पहले से browser-side
  architecture पर आधारित है। यह update उस पूरे legacy account model को server-side
  identity system में rewrite नहीं करता। अत्यधिक संवेदनशील डेटा के लिए अलग server-side
  user/session authorization और per-role API authorization की आवश्यकता होगी।
- कोई ZIP किसी दूसरे व्यक्ति के खरीदे हुए domain या hosting account को अपने-आप बंद
  नहीं कर सकती। यह केवल उस clone को आपके Google Apps Script/Sheets backend से sync
  होने से रोकती है, बशर्ते secret सुरक्षित रखा जाए और पुरानी public deployments बंद हों।
- यदि पुराना Apps Script deployment पहले बिना secret के सार्वजनिक था, तो नया Code.gs
  deploy होने के बाद भी सभी data POST पर secret माँगेगा। पुराना deployment version
  हटाने/नया deployment version publish करने की पुष्टि करें।

Validation
----------
इस ZIP को source-level syntax और archive integrity के लिए जाँचा गया है। Live Render,
Apps Script, Google account permissions, वास्तविक Sheet/Drive या user credentials से
end-to-end login test इस environment से संभव नहीं था। Deploy के बाद test Admin,
Teacher और Student accounts से verify करें।
