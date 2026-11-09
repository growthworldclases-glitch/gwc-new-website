
GWC V23 — ADDITIVE FEE MANAGEMENT + WEEKLY SCHEDULE + HELP DESK REFRESH
========================================================================

यह ZIP आपके दिए हुए GWC_V22_ADDITIVE_CHAT_POSTER_MOBILE.zip पर आधारित है।

क्या जोड़ा गया
--------------
1. Admin Dashboard में 💳 Fee Management:
   - हर student के सभी saved feePeriods/cycles और उनकी तारीखें दिखती हैं।
   - किसी cycle को Reset करने पर उसे reversedAt से inactive mark किया जाता है;
     पुराना cycle record मिटाया नहीं जाता।
   - Admin नया fee cycle start कर सकता है और start/end date तथा amount दर्ज कर सकता है।
   - पुराने IDs/passwords, student IDs, course assignments या पुराने cycle history को
     regenerate या migrate नहीं किया गया।

2. Admin Dashboard में 📅 Weekly Schedule:
   - Admin teacher चुनकर Monday–Sunday का time और class/subject भर सकता है।
   - Publish/Update के बाद timetable existing shared GWC state में save होता है।
   - Teacher अपना timetable देखता है; Student अपने assigned course के teacher का
     timetable देखता है; Sub-admin published schedules देख सकता है।
   - Timetable cards में अलग-अलग colourful icons हैं।

3. GWC के अंदर WhatsApp-जैसे Help Desk में:
   - पहले से मौजूद Google Sheets shared-state refresh (लगभग हर 5 सेकंड) के बाद
     खुली हुई chat screen स्वतः refresh होती है।
   - unread incoming messages के लिए पहले से मौजूद green unread count/dot कायम है।
   - अपने भेजे message पर recipient का readBy record आने पर yellow “Seen” dot दिखता है;
     read होने से पहले green “Sent” dot दिखता है।
   - यह GWC app का internal chat है, असली WhatsApp नहीं।

महत्वपूर्ण तकनीकी सीमा
----------------------
- यह polling-based near-real-time update है, instant WebSocket/push नहीं।
  सामान्य स्थिति में बदलाव लगभग 5–10 सेकंड में दिख सकता है; नेटवर्क/Apps Script/Sheets
  latency से अधिक समय भी लग सकता है।
- Yellow Seen तभी दिखेगा जब दूसरे user ने उसी conversation को खोला हो और उसका
  readBy update Google Sheets shared state में sync होकर वापस आ गया हो।
- मौजूदा shared-state architecture में role-based chat filtering browser-side है;
  इसे secure server-enforced private messaging में परिवर्तित नहीं किया गया।
- Fee Management के manual cycle start/reset को पहले test student पर जाँचें।
  यह admin द्वारा cycle record create/reverse करता है; यह payment gateway receipt
  verification का विकल्प नहीं है। किसी unpaid fee को paid मानने से पहले payment
  verify करें।
- मौजूदा reminder/expiry automation और notification schedule के व्यवहार को इस
  additive update ने अलग से rewrite नहीं किया है।

क्या नहीं बदला
---------------
- Code.gs, server.js और package.json मूल V22 ZIP से byte-for-byte unchanged हैं।
- Apps Script URL, Render proxy, spreadsheet schema, Drive settings, IDs/passwords,
  login/session mechanism, old features, existing students/teachers/courses/fee slips,
  chat history, posters, notifications, groups और backups को intentionally नहीं बदला।
- कोई existing record migration या automatic ID/password generation नहीं की गई।

जाँच
----
- index.html के सभी inline JavaScript blocks पर Node.js syntax check: PASS
- server.js syntax check: PASS
- Code.gs syntax parse check: PASS
- package.json JSON parse: PASS
- ZIP integrity test: PASS
- Code.gs/server.js/package.json V22 base के समान: PASS

Deploy करने से पहले
-------------------
1. Live website ZIP और Google Spreadsheet का अलग backup अवश्य रखें।
2. ZIP extract करके उसी Render GitHub project में files update करें।
3. GWC_API_URL, Apps Script deployment URL, Spreadsheet ID, Drive folder ID,
   Render settings या Script Properties न बदलें।
4. इस build में Code.gs बदला नहीं है; केवल index.html update है। Existing deployment
   और environment settings वैसे ही रखें।
5. पहले test Admin, Teacher और Student accounts से:
   - Fee Management में cycle list, reset और new cycle जाँचें।
   - Admin से timetable publish करके Teacher और assigned Student portal में देखें।
   - दो test accounts से chat भेजें, recipient chat खोले, फिर sender पर Seen indicator
     आने की जाँच करें।
6. सब सही होने के बाद ही live students के लिए इस्तेमाल करें।

यह ZIP local syntax/structure के स्तर पर जाँची गई है। Live Render, Apps Script,
Google Sheets, वास्तविक credentials या अलग devices पर end-to-end test यहाँ उपलब्ध
नहीं था। इसलिए “कभी error नहीं आएगा” की गारंटी देना संभव नहीं है।


--- V24 SECURITY UPDATE NOTICE ---
V24 ke liye README_V24_HINDI_DEPLOY.txt follow karein. Runtime replacement: Code.gs in Apps Script, server.js in GitHub. index.html/package.json unchanged.
