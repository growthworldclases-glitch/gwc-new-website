GWC V38 – STUDENT MEET + MONTHLY FEEDBACK + LATEST MESSAGE DASHBOARD
Base: GWC_V33_5_QR_PAUSE_FIX.zip; controlled update layers V34–V37 retained.

इस build में आपके नवीनतम निर्देश:
1. Teacher के Assigned Students register में “Last Date of Class” दिखता है; Last Fee Paid Date नहीं। तारीख current/last class validity period से ली जाती है। पुराना record तारीख न देता हो तो Not available दिखेगा।
2. Parents Feedback interval Monthly है। Teacher के assigned students के लिए due date पिछली feedback submission date से एक महीने बाद है। Due/pending feedback पर Teacher dashboard में red alert है। Admin में Parents Feedback Manage section में teacher-wise स्थिति, submission history और reminder links उपलब्ध हैं।
3. Student My Course का Join My Class Google AccountChooser continue URL से गुजरता है और चुने गए Google account के बाद उसी Meet URL पर redirect करने का अनुरोध करता है। यह Student-only change है; Teacher का पुराना Meet join handler नहीं बदला गया।
4. Dashboard message presentation नया है: केवल नवीनतम Help Desk message dashboard पर दिखता है। View All पर उस user के सभी संबंधित messages पूरे text और उपलब्ध attachment link सहित दिखते हैं। पुराना Hide/Hidden dashboard panel presentation हटाया गया है; message records और Help Desk conversations delete नहीं किए गए।
5. Existing server.js, Code.gs, package.json और appsscript.json base ZIP से byte-for-byte unchanged रखे गए हैं। Existing IDs, credentials, sheet IDs और backend deployment settings नहीं बदले गए।

Deployment:
- ZIP को extract करके पूरा project अपने GitHub repository में upload/push करें और Render पर existing service deploy करें।
- Existing Render Environment Variables और Google Apps Script deployment/configuration को न बदलें।
- पहले staging service पर test करें; production deploy से पहले live backup लें।

महत्वपूर्ण live-verification सीमाएँ:
- Google AccountChooser और Meet app/browser handoff Google/Android के control में है। Code email account को खुद select नहीं कर सकता, Google security/account chooser bypass नहीं कर सकता, और app installed होने पर app launch की guarantee नहीं दे सकता। User को account select करना होगा; फिर Google redirect/browser/app link handling करता है।
- इस environment से वास्तविक Android phone, desktop browser, Render, Google Sheets/Drive/Apps Script credentials और WhatsApp external API पर live test संभव नहीं था। इसलिए इनका production verification दावा नहीं किया गया है।
- WhatsApp group auto membership केवल GWC software के internal managed group records पर लागू है; external WhatsApp group members को जोड़ना/हटाना supported WhatsApp API authorization/configuration पर निर्भर है।
