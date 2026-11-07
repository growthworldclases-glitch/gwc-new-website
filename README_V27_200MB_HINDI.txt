GWC V27 — 200 MB HELP DESK ATTACHMENTS (ADDITIVE PATCH)
======================================================

यह पैकेज GWC_V26_FINAL_FULL के ऊपर additive patch है। मौजूदा IDs, passwords, state schema, Sheet IDs, Drive folder property, Firebase settings, fee cycles और पुराने dashboard features को जानबूझकर नहीं बदला गया। कोई data migration या sheet reset नहीं है।

क्या बदला है
-------------
1. WhatsApp Help Desk में JPG/JPEG, PNG, WEBP, GIF और PDF attachment की सीमा प्रति फाइल 200 MB की गई है।
2. 5 MiB resumable chunks के जरिए upload होता है; पूरी 200 MB फाइल एक POST में नहीं भेजी जाती।
3. Upload Google Drive के मौजूदा GWC_Uploads folder में private file के रूप में बनता है।
4. Admin Archive से Permanently Delete चुनने पर chat/message के attachment IDs GWC_Deleted_Items Drive folder में move होते हैं; फिर Archive record हटता है। Admin Drive में जाकर उस folder से फाइल को अलग से स्थायी रूप से delete कर सकता है।
5. Restore action Archive record को वापस लाता है; purge करने से पहले Drive move सफल होना जरूरी है।
6. Render proxy request body limit 12 MB की गई है, ताकि 5 MiB binary chunk की base64 request स्वीकार हो।

जरूरी deployment steps
----------------------
A. Google Apps Script
1. Apps Script editor में मौजूदा Code.gs का backup लें।
2. इस ZIP का Code.gs पुराने Code.gs से replace करें।
3. Save करें। पहली upload call पर Google Drive/UrlFetch authorization मांगी जा सकती है; मौजूदा project owner account से authorization दें।
4. Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy करें। Existing Web App deployment को update करें; नया अलग URL न बनाएं।
5. GWC_PROXY_SECRET, GWC_ALLOWED_VERSION=24.0-secure, GWC_SPREADSHEET_ID और GWC_DRIVE_FOLDER_ID Script Properties को न बदलें।

B. Render/GitHub
1. मौजूदा repository में index.html और server.js replace करें। package.json तथा बाकी files unchanged रखें।
2. Commit/push करके एक बार deploy करें।
3. बार-बार 2–3 घंटे में deploy रोकने के लिए Render service > Settings/Deploys में Auto-Deploy को No करें, यदि आप केवल manual deploy चाहते हैं। साथ ही GitHub Actions, deploy hooks और बाहरी scheduler में Render Deploy Hook हो तो उसे disable/remove करें। इस ZIP से Render account के event logs/settings बदले नहीं जा सकते; वास्तविक trigger Render Events/Logs में verify करना होगा।

Testing checklist
-----------------
- पहले 1–2 MB की JPG और PDF भेजकर Student -> Admin test करें।
- फिर 10 MB, 50 MB और 200 MB तक की files अलग-अलग test करें। फोन/browser में पर्याप्त free memory/network रखें।
- बीच में network बंद होने पर message Sent नहीं होना चाहिए; upload फिर से शुरू करें।
- Admin Archive > Permanently Delete के बाद Drive में GWC_Deleted_Items folder देखें।
- Drive से final deletion केवल Admin स्वयं करे।
- पुराने student/teacher/admin IDs, passwords, courses, fee records और Sheet state का login/record spot-check करें।

महत्वपूर्ण सीमाएँ
-----------------
- 200 MB प्रति फाइल की application limit है; Google Drive account storage/quota, Apps Script daily quotas, network और execution availability फिर भी लागू होंगे। 200 MB upload को वास्तविक production account पर test करना जरूरी है।
- Chat attachments private रखे गए हैं; किसी दूसरे user को Drive file खोलने की अनुमति तभी मिलेगी जब उस account को Drive access दिया गया हो। Link अपने-आप public नहीं किया गया है।
- इस environment से आपके live Render, Apps Script, Google Drive या student accounts में end-to-end login/deploy test नहीं किया जा सकता। इसलिए ZIP को staging/test deployment में जांचकर ही production पर लगाएं।
- पुराने source में Help Desk और Notes के कुछ legacy 1 MB upload forms भी मौजूद हैं; यह patch WhatsApp Help Desk chat attachment पर 200 MB लागू करता है, अन्य payment slip/poster/doubt forms की limits नहीं बदलता।
