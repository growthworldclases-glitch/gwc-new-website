GWC V22 — ADDITIVE CHAT / POSTER / MOBILE NAV UPDATE
====================================================

आधार ZIP: GWC_V21_ADDITIVE_UPDATE.zip
इस update में केवल index.html बदली गई है। Code.gs, server.js और package.json को
V20/V21 वाले versions से byte-for-byte समान रखा गया है। Google Apps Script URL,
Render proxy route, sheet key/schema, Drive folder configuration, login IDs/passwords,
users, courses, batch settings, fees, attendance, tests, homework और पुराने records को
जानबूझकर नहीं बदला गया है। कोई data migration या reset नहीं है।

इस build में जोड़े गए बदलाव
---------------------------
1. WhatsApp Help Desk में PDF / Photo attachment चुनने का control। फ़ाइल अधिकतम 8 MB
   और JPG/PNG/WEBP/GIF/PDF प्रकार की हो सकती है। मौजूदा Apps Script upload action से
   Drive में privateFile=true के साथ upload का प्रयास होता है।
   महत्वपूर्ण: Drive file private रहती है; पुराने backend में participant-authenticated
   file download/permission endpoint नहीं है। इसलिए Admin/Drive owner access कर सकता है,
   पर दूसरे chat members को फ़ाइल खोलने की अनुमति अपने-आप नहीं मिलती। सार्वजनिक Drive
   link बनाकर student/parent की privacy जोखिम में नहीं डाली गई है। सभी participants को
   सुरक्षित attachment access देने के लिए अगला backend/API update आवश्यक है।

2. Admin और Sub-admin दोनों Broadcast Group बना सकते हैं, सभी groups देख सकते हैं,
   members add/remove कर सकते हैं और group archive कर सकते हैं। Group archive होने पर
   group record Deleted Helpdesk Items में रखा जाता है; Admin उसे restore या permanently
   delete कर सकता है। पुराने group messages state में रहते हैं।

3. WhatsApp Help Desk में unread messages की संख्या green dot/count के साथ contact के
   नाम के पास दिखती है। Chat खोलने पर उस user के लिए संदेश read mark होते हैं। Admin को
   Teachers और Students के अलग direct conversations दिखते हैं; एक teacher की दूसरी
   student के साथ निजी बातचीत Admin की teacher-chat में अपने-आप नहीं मिलाई जाती।
   यह unread state उसी existing shared state/sync पर निर्भर है; यह instant push service
   नहीं है।

4. Admin Branding / Visitor Homepage में Welcome Posters add, replace और delete कर
   सकता है। Main Poster के लिए Delete button भी जोड़ा गया है। पुराने posters/URLs तब तक
   state में रहते हैं जब तक Admin उन्हें स्वयं बदलता/हटाता नहीं।

5. Admin के लिए Unassigned Students screen जोड़ी गई है। जिनके पास student login account
   है लेकिन course/batch assigned नहीं है, वे सूची में दिखते हैं। Admin उन्हें Trash में
   भेज सकता है। Student record और login credentials state/trash में सुरक्षित रहते हैं;
   संबंधित user inactive होता है। Trash से Restore करने पर पुराना account वापस सक्रिय
   किया जा सकता है, फिर Admin course assign कर सकता है। यह प्रक्रिया automatic नहीं है।
   पुराने ID को किसी नए व्यक्ति को स्वतः reassign/recycle नहीं किया जाता, ताकि पुराने
   student की identity/history गलती से नए student को न मिले।

6. Student/Teacher के “Upload Today Notes” menu item को हटाया गया है, जैसा निर्देश था।
   बाकी menu items जैसे Ask Your Doubt, Homework, Tests, Class Timings आदि को हटाने का
   उद्देश्य नहीं है।

7. Portal navigation को mobile और desktop पर responsive tile/grid रूप दिया गया है ताकि
   विकल्प देखने के लिए horizontal scrolling कम हो। Dashboard की सभी screens अभी भी
   अपने modules में खुलती हैं; सभी forms/tables को एक ही लंबे page में merge नहीं किया गया,
   क्योंकि इससे mobile performance और data safety प्रभावित हो सकती है।

महत्वपूर्ण सीमाएँ
-----------------
- इस ZIP से Android wrapper app का package अपने-आप rebuild नहीं होता। यदि आपका Android
  app hosted Render URL को WebView में खोलता है, तो website deploy के बाद refresh/cache
  clear करने पर बदलाव दिखेंगे। यदि app में website की static copy bundle है, तो Android
  app को अलग से rebuild/release करना होगा।
- Attachments का private upload implemented है, लेकिन recipient-side secure download
  authorization नहीं है; इसलिए सभी chat members के लिए attachment sharing अभी complete
  नहीं है। इसे public Drive sharing से bypass नहीं किया गया।
- Released IDs का automatic recycling नहीं जोड़ा गया। Credentials पुराने record में
  सुरक्षित हैं; किसी नए student को assign करने से पहले अलग सुरक्षित ID-ledger और
  duplicate/identity checks आवश्यक हैं।
- No-batch accounts स्वतः Trash में नहीं भेजे जाते। Admin Unassigned Students screen से
  चुनकर भेजता है, ताकि pending admissions या गलती से unassigned हुए records न हटें।
- यह ZIP syntax/structure के स्तर पर जाँची गई है; live Render, Apps Script, Sheets,
  Drive, वास्तविक accounts और Android WebView पर end-to-end परीक्षण संभव नहीं था।
  कोई भी ZIP “कभी error नहीं आएगा” या “10 साल crash-proof” की गारंटी नहीं दे सकती।

जाँच
----
- index.html के सभी inline JavaScript blocks पर Node.js syntax check: PASS
- server.js syntax check: PASS
- Code.gs को JavaScript parser के माध्यम से syntax check: PASS
- Code.gs / server.js / package.json: V20 base ZIP से byte-for-byte unchanged
- ZIP integrity test: packaging के बाद चलाया गया

Deploy से पहले
--------------
1. Live website ZIP और Google Spreadsheet का अलग backup रखें।
2. इस ZIP को Extract करें और उसी Render GitHub project में files update करें।
3. Existing GWC_API_URL, Apps Script deployment URL, Script Properties, Spreadsheet ID,
   Drive folder ID और Render Environment Variables न बदलें।
4. पहले test accounts से login, chat, unread count, broadcast membership, poster update,
   trash restore और existing course/fee workflows जाँचें।
5. Attachment link को teacher/student account से खोलकर देखें; private Drive permission
   के कारण access denied हो सकता है। जब तक authenticated file access endpoint न बने,
   sensitive files को chat में upload न करें।
