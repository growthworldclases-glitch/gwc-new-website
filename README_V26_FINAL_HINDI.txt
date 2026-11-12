GWC V26 FINAL — WhatsApp Help Desk / Direct Chat Repair
=======================================================

इस पैकेज में पुरानी वेबसाइट के सभी मूल फाइल, Code.gs, server.js, package.json,
लॉगिन ID/Password डेटा-स्ट्रक्चर और पुराने फीचर यथावत रखे गए हैं। बदलाव केवल index.html में है।

इस संस्करण में:
1. Help Desk composer में टाइप किया हुआ संदेश auto-refresh के कारण गायब नहीं होगा।
2. Chat page का 6-second redraw तब रुकता है जब user chat area / textarea में काम कर रहा हो।
3. Send button दबाने पर ही संदेश भेजने की प्रक्रिया शुरू होगी; Google save सफल होने के बाद ही composer clear होगा।
4. contacts is not defined वाली समस्या हटाई गई है; recipient को मौजूदा users/students/courses state से role-wise verify किया जाता है।
5. Sender और receiver दोनों के WhatsApp Help Desk में एक ही conversation दिखाई देगी। Admin के लिए पुराने admin recipient alias वाले messages भी conversation में शामिल किए गए हैं।
6. Student, Teacher और Admin dashboard पर Help Desk Messages inbox दिखेगा। किसी message पर click करने से संबंधित chat खुलेगी। Admin को सभी उपलब्ध chats/messages दिखेंगे।
7. भेजे गए message पर Pending (पीला) और recipient द्वारा chat खोलकर पढ़ने पर Seen (हरा) status दिखेगा।
8. Admin active पूरी chat को Archive Chat बटन से archive कर सकता है। Deleted Helpdesk Items / Archive में पूरी chat और उसके messages दिखेंगे। वहाँ Restore या Permanently Delete कर सकते हैं।
9. Admin किसी individual message को भी Archive message से archive कर सकता है; Archive से restore या permanent delete संभव है।
10. मौजूदा broadcast groups, attachment flow, login, settings और अन्य पुराने फीचर हटाए नहीं गए हैं।

कौन-सी ZIP लगानी है?
--------------------
A) GWC_V26_FINAL_FULL.zip: इसमें पूरा पुराना project + नया index.html + यह निर्देश फाइल है।
   इसे तभी इस्तेमाल करें जब आप पूरा source package एक साथ रखना/बदलना चाहते हैं।

B) GWC_V26_FINAL_CHANGED_FILES_ONLY.zip: इसमें केवल बदली हुई index.html और यह निर्देश फाइल है।
   मौजूदा Render/GitHub project में सामान्य deployment के लिए केवल index.html बदलें।
   Code.gs, server.js, package.json या Google Sheet schema बदलने की जरूरत नहीं है।

Deployment:
1. पहले वर्तमान website और Google Sheet का backup रखें।
2. GitHub repository में केवल index.html को changed-files ZIP वाले index.html से replace करें।
3. Commit/push करें और उसी Render service को deploy होने दें।
4. Admin, Teacher और Student के test accounts से direct message भेजकर verify करें।
5. Admin account से chat Archive करें, Deleted Helpdesk Items खोलें, Restore और Permanent Delete को test करें।

महत्वपूर्ण परीक्षण सीमा:
- Inline JavaScript के सभी 6 script blocks पर Node syntax check सफल रहा।
- इस वातावरण में आपकी live Render website और Google Sheet से login करके end-to-end test नहीं किया जा सकता।
- Google Sheets polling real-time push नहीं है; दूसरे user को संदेश अगली सफल cloud sync/poll के बाद दिखेगा।
- ZIP में poster image assets अलग से मौजूद नहीं थे; इसलिए login से पहले poster visibility इस पैकेज में verify/fix नहीं की गई है।
