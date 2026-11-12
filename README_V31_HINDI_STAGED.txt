GWC V31 — MONTHLY SALARY MANAGEMENT ADDITIVE BUILD
=================================================

यह ZIP आपके दिए हुए GWC_V30_TEACHER_ROSTER_DASHBOARD_REPAIR.zip से बनाई गई है।
मूल Code.gs, server.js, package.json, appsscript.json और पुराने README/डेटा-स्कीमा को जस का तस रखा गया है।
केवल index.html के अंत में additive V31 module जोड़ा गया है।

इस build में जोड़ा गया:
1. Admin sidebar में Salary Management.
2. Month/year चुनकर teacher-wise monthly payable और overall payable.
3. Admin student + teacher + per-student monthly payable + assignment start/end date दर्ज कर सकता है.
4. Partial month का भुगतान calendar days के अनुपात में calculate होता है:
   Monthly per-student rate × assigned days ÷ उस महीने के कुल दिन.
   उदाहरण: ₹900 monthly rate और 30 दिन वाले महीने में 10 दिन = ₹300.
5. Student-wise salary breakdown केवल Admin के Student-wise details action में खुलता है.
6. Teacher portal में My Payment — केवल उस महीने का total payable और recorded payment दिखता है.
7. Admin 50%, 100% या custom percentage payment record कर सकता है; month-wise payment history सुरक्षित रहती है.
8. Existing fee requests/fee periods से month-wise Fee Management register और fee total / configured teacher payable / estimated organization balance summary.

महत्वपूर्ण सीमाएँ — इसे अभी पूर्ण production-final न मानें:
- पुरानी assignment history अपने-आप reconstruct नहीं की जा सकती। पुराने महीनों के सही salary records के लिए Admin को हर student/teacher की पुरानी start date, end date और monthly rate assignment में दर्ज करनी होगी।
- Student का course/teacher बदलने या student हटाने पर पुराने salary assignment की end date अपने-आप नहीं लगाई गई है। पुराने teacher की last teaching date दर्ज करके assignment बंद करें और नए teacher के लिए नई dated assignment जोड़ें। बिना इस step के historical calculation गलत हो सकती है।
- Fee Slip upload/replace/delete का नया JPEG workflow, Google Drive में 3 महीने बाद automatic archive/delete, और parent-side JPEG upload का end-to-end परिवर्तन इस additive patch में लागू नहीं है। Existing V30 fee slip workflow जस का तस है।
- Help Desk message Hide → Archive bug का verified repair इस patch में शामिल नहीं है।
- “Admin logout button से logout” वाली मौजूदा session व्यवस्था को नहीं बदला गया है; सभी portals पर session behavior को अलग-अलग devices/browsers पर verify करना बाकी है।
- Salary payment entry accounting record है; यह bank transfer/payment gateway नहीं करता। “Print / Save as image or PDF” browser print dialog खोलता है; image file स्वतः Drive पर upload नहीं होती।
- Fee register existing feeRequests के slipUrl field पर निर्भर करता है; पुराने अलग-अलग slip metadata वाले records में slip link न दिख सकता है।

DEPLOYMENT
1. पहले मौजूदा Render/GitHub repository और Google Sheet का backup लें।
2. ZIP extract करें और मौजूदा project में केवल index.html को replace करें; अन्य files/IDs/settings न बदलें।
3. GitHub पर commit/push करके Render deploy करें।
4. Admin और Teacher दोनों portal से login करके Salary Management / My Payment खोलें।
5. पहले test copy या छोटे test dataset पर assignment date, rate, move/end date और payment percentage जाँचें।
6. इस ZIP को production में लगाने से पहले अपने वास्तविक V30 data के साथ test करें। कोई पुराना student/login/course record migration या deletion नहीं किया गया।

V31 syntax check: सभी inline JavaScript blocks पर Node.js --check सफल।
यह syntax check है, live Google Apps Script/Drive/Render integration test नहीं।
