GWC V24 — ADDITIVE WHATSAPP + COMMON HELPDESK REALTIME REPAIR
=============================================================

यह ZIP आपके दिए हुए GWC_V23_FEE_MANAGEMENT_WEEKLY_REALTIME.zip पर आधारित है।
पुरानी वेबसाइट को replace करके नई वेबसाइट नहीं बनाई गई है; उसी project में additive
repair किया गया है।

पुराने Features सुरक्षित रखने का उद्देश्य
---------------------------------------
- Admin / Subadmin / Teacher / Student के पुराने Login IDs और Passwords नहीं बदले।
- Login/session, roles, users, students, teachers, courses, batches, settings, fee
  management, fee cycles, weekly schedule, demo workflow, notifications, attendance,
  homework, tests, Meet links, uploads, Drive archive, groups और अन्य पुराने modules
  को हटाया या reset नहीं किया।
- Existing GWC_Storage state, old chat history, spreadsheet settings और Drive settings
  को migrate या regenerate नहीं किया।
- package.json unchanged है। Existing Render service और GWC_API_URL वही रखें।

V23 में Message क्यों अटक/गायब हो सकता था?
------------------------------------------
पुराना WhatsApp Help Desk और Common Helpdesk दोनों `state.gwcMessages` में message
रखते थे। Message भेजने या Seen/read receipt बदलने पर `save()` पूरे website state
(GWC_Storage JSON) को Google Sheets में दोबारा लिखता था। दो users लगभग एक साथ save
करें तो stale snapshot दूसरे user का नया message overwrite कर सकता था। Chat refresh
और dashboard refresh भी अलग-अलग polling timers से चलते थे। Sent/Seen का status इसी
पूरे-state sync पर निर्भर था।

V24 में क्या ठीक किया
--------------------
1. **दोनों chat modules अलग channel में:**
   - WhatsApp Help Desk: `channel=whatsapp`
   - Common Helpdesk: `channel=internal`
   - दोनों एक-दूसरे के नए messages को अपने UI में नहीं दिखाते।
2. **Dedicated Google Sheet tab:** `GWC_Chat_Messages`
   - उसी मौजूदा GWC Spreadsheet में पहली chat request पर नया tab बनेगा।
   - हर नया message अलग row में append होगा।
   - Chat send/read अब GWC_Storage की पूरी JSON file rewrite नहीं करता।
3. **Concurrent save protection:**
   - Apps Script `LockService` से message append और read receipt updates serialize होते हैं।
   - Duplicate message ID दोबारा आए तो duplicate row नहीं बनती।
4. **Near-real-time refresh:**
   - WhatsApp Help Desk और Common Helpdesk खुले रहने पर हर 3 सेकंड में chat list pull।
   - यह WebSocket/push नहीं है; वास्तविक delay Render, Apps Script, Sheets और internet
     latency पर निर्भर करेगा।
5. **Sent / Seen:**
   - Sent: Google chat sheet ने message save की पुष्टि की।
   - Seen: दूसरे user ने conversation खोली और read receipt Google chat sheet में save हुई।
6. **पुरानी history:**
   - GWC_Storage में मौजूद पुराने messages मिटाए नहीं गए; नए dedicated-sheet messages
     के साथ display merge किया जाता है।
7. Dashboard के navigation features के पास colorful icon badges लगाए गए; WhatsApp और Common Helpdesk headings पर भी अलग icons हैं।
8. Admin के existing message edit/archive controls के लिए cloud message actions भी जोड़े।

कौन-सी Files बदलीं
------------------
- `index.html`: chat send/read/polling और colorful chat headings।
- `Code.gs`: isolated chat sheet और chat actions।
- `server.js`: नए chat POST actions allow किए।
- `README_V24_HINDI.txt`: deployment और test guide।
- `package.json`: unchanged।

बहुत जरूरी Deployment — Website और Apps Script दोनों
---------------------------------------------------
V24 के नए chat API के लिए केवल ZIP deploy करना पर्याप्त नहीं है।

1. Live website ZIP और Google Spreadsheet का backup लें।
2. ZIP को उसी पुराने Render/GitHub project में extract/update करें। नया Render service
   या नया project न बनाएं। `GWC_API_URL` environment variable unchanged रखें।
3. उसी Google Apps Script project में इस ZIP की `Code.gs` file update करें।
4. Script Properties को न हटाएं/न बदलें — विशेषकर `GWC_SPREADSHEET_ID` और
   `GWC_DRIVE_FOLDER_ID`।
5. Apps Script > Deploy > Manage deployments > existing Web App deployment > Edit >
   New version > Deploy करें। Existing deployment URL और access policy वही रखें।
6. Existing spreadsheet tabs जैसे `GWC_Storage`, `GWC_Storage_Stage` और backups को
   delete/rename न करें। नया `GWC_Chat_Messages` tab additive है।
7. Website में Google Sheets/Drive connected दिखने के बाद test करें।

Test Plan
---------
A. Admin → Teacher: message भेजें; Teacher portal पर बिना page reload के दिखना चाहिए।
B. Teacher → Student: Student portal पर लगभग 3 सेकंड polling + network delay में दिखे।
C. Student → Admin: Admin Common Helpdesk और/या WhatsApp Help Desk में जिस channel पर
   message भेजा गया, उसी channel में दिखे।
D. WhatsApp Help Desk और Common Helpdesk के नए messages एक-दूसरे के module में न दिखें।
E. Recipient chat खोले; sender के पास Sent से Seen हो।
F. दो अलग devices से लगभग एक ही समय पर message भेजें; दोनों rows `GWC_Chat_Messages`
   में मौजूद रहें।
G. Confirm करें कि chat send/read से अकेले `GWC_Storage` full-state save नहीं होता।
H. पुराने Login ID/Password, settings, batches, courses, fee records, weekly schedule,
   notifications और पुरानी chat history verify करें।

सीमाएँ और सच्ची स्थिति
----------------------
- यह near-real-time polling है, instant WebSocket/push नहीं।
- Existing legacy messages पुराने shared-state store में ही रहते हैं; उन्हें bulk-migrate
  नहीं किया गया।
- पुराना website architecture browser-provided role/user ID पर निर्भर है। यह repair
  concurrent chat writes को अलग करता है, लेकिन production-grade server-side identity
  authentication या private-message authorization नहीं बनाता।
- Private attachment upload flow पहले जैसा रखा गया है। Sensitive file भेजने से पहले
  Drive access permissions test करें।
- इस environment से live Render, Apps Script, Google Sheet या असली user accounts पर
  cross-device test संभव नहीं था। Local syntax और ZIP checks pass होने पर भी live
  deployment के बाद ऊपर दिए test plan से Admin, Teacher और Student accounts पर जाँचें।

Rollback
--------
यदि deployment के बाद chat API काम न करे तो पहले से लिए backup से पिछली website ZIP
और Code.gs restore करें। `GWC_Storage` या `GWC_Chat_Messages` को delete न करें।
