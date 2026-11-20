GROWTH WORLD CLASSES — V48.2 ADDITIVE REPAIR

आधार ZIP: GWC_V48_1_FEE_REGISTER_DISPLAY_FIX.zip
यह build V48.1 की सभी मौजूदा project files को रखकर additive code repair करता है। V47 के सभी मूल filenames V48.1 में मौजूद थे; V48.1 में कोई V47 file हटाई नहीं गई थी।

इस अपडेट में:
1) Fee Register में पुराने month-wise gwcMonthlyFees, feeRequests और admission slip URL fields की complete date-wise history read-only तरीके से दिखाई जाती है। Current और archived/previous slip links अलग-अलग हैं। कोई startup reset या bulk migration नहीं।
2) Assigned Students rows में Fee Update + Slip + Next Date action। Admin validity From date, next payment/access last date, amount और fee slip image save कर सकता है। Existing previous slip URL previous history field में रखा जाता है।
3) Forced Start अब किसी fee slip या fee-cycle record पर निर्भर नहीं है। Admin From और Last Date set करता है; उस date window में assigned student को वास्तविक Join My Class button मिलता है। Date window खत्म होने पर force access समाप्त होता है।
4) Admin sidebar में Login IDs & Batch Availability section। Teacher/Student/All filter, existing Login ID/password, assigned batch और mapped students/teacher दिखते हैं। Yellow = available/unassigned; Green = assigned; Batch Full तभी जब Course में Seats limit भरी हो।
5) V48.1 के Google Workspace और Apps Script workspacecreate/workspacedelete changes तथा बाकी files जस की तस रखी गई हैं।
6) Existing IDs/passwords/settings, student/admission records, Google Sheet IDs, Drive IDs, Apps Script properties, Render environment values और cloud data को बदलने/मिटाने वाला कोई migration नहीं है।

बहुत जरूरी डेटा सुरक्षा:
- ZIP में live Google Sheet/Drive data नहीं होता। यदि पुरानी slip का URL/record live cloud state से वास्तव में delete हो चुका है, तो code-only ZIP उसे वापस नहीं बना सकती। इस build में पुराने available record fields को वापस list में दिखाया जाता है। सचमुच deleted records के लिए Google Sheet/Drive backup restore आवश्यक है।
- इस build को पहले staging Render deployment पर जाँचें। Production पर लगाने से पहले V47/V48.1 ZIP और Google Sheet का backup रखें।
- Login ID/password list केवल Admin portal में उपलब्ध है। Passwords confidential हैं; screenshots या exports साझा न करें।
- Google Meet में Google Account याद रखना Google/Android session पर निर्भर है। GWC Google को किसी account को force-select नहीं कर सकता।

जाँच:
- index.html के सभी 33 inline JavaScript blocks Node syntax check पास।
- server.js Node syntax check पास।
- ZIP archive integrity check अलग से करें।
- वास्तविक Google Apps Script authorization, Render deployment, Android Meet handoff और production cloud data restore का end-to-end परीक्षण अभी बाकी है।
