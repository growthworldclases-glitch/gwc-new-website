GWC V32 — MONTHLY SALARY + MONTH-WISE FEE + HELPDESK REPAIR
================================================================

यह ZIP आपके दिए हुए GWC_V30_TEACHER_ROSTER_DASHBOARD_REPAIR.zip पर additive update है।
मूल Login ID/Password, Admin settings, Courses, Google Apps Script URL, Render proxy,
Firebase/Google Sheet/Drive configuration और पुराने portal modules को जानबूझकर नहीं बदला गया।

V32 में जोड़ा/बदला गया
----------------------

1) Salary Management (Admin)
- नया Admin menu section: Salary Management.
- Admin हर assigned student के लिए Teacher Monthly Pay (₹) manually enter/update कर सकता है।
- एक Teacher के कई students का monthly payable teacher-wise और overall दिखता है।
- Calculation: monthly student-pay × उस Teacher के assignment के eligible days ÷ उस month के total days.
- Student का course/teacher बीच महीने में बदले तो पुरानी assignment segment बंद और नई segment शुरू होती है।
- Student Trash/remove होने पर उस महीने के earned days salary calculation में बने रहते हैं।
- Permanent removal के बाद भी उस महीने का salary snapshot सुरक्षित रखा जाता है।
- Admin payable verify कर सकता है; 50%, 100% या custom percentage paid amount record कर सकता है।
- Teacher portal के My Payment में केवल अपना month-wise total, paid और balance दिखता है।
- Admin-only student-wise detail और SVG salary statement image (नई tab में खुलती है) उपलब्ध है।
- 60 रुपये/day या 30 रुपये/day जैसे कोई fixed rates hard-code नहीं किए गए हैं; हर student का monthly amount Admin भरता है।

उदाहरण की जाँच:
- 10 दिन के लिए monthly equivalent ₹1,800 = ₹600 earned.
- 20 दिन के लिए monthly equivalent ₹900 = ₹600 earned.
- कुल payable = ₹1,200.

महत्वपूर्ण: V30 के पुराने assigned students के लिए Teacher Monthly Pay पहले से उपलब्ध न हो तो वह 0 से शुरू होगा।
Admin को Salary Management में प्रत्येक student का monthly amount भरना/verify करना होगा।
पुराने data से कोई अज्ञात teacher salary स्वतः अनुमानित नहीं की गई है।

2) Student add / assignment
- Manual student creation form में visible Fee Cycle / First Cycle / Next Payment / Total Cycle fields हटाए गए।
- उसी form में Teacher Monthly Pay for this Student field जोड़ा गया।
- पुराने stored fields को data compatibility के लिए मिटाया नहीं गया; नए form में cycle controls नहीं दिखते।

3) Fee Management (Admin)
- नया month/year based Fee Management section.
- उस महीने के assigned students admission date order में दिखते हैं।
- Student, course, teacher, fee, teacher payable, organization balance, validity dates, payment date और slip status दिखते हैं।
- Valid From / Valid To Admin edit कर सकता है।
- Parent अपने Student > My Course से JPEG slip (max 1 MB) upload/replace कर सकता है।
- Admin उसी month के लिए JPEG upload/replace/delete कर सकता है।
- Replace/delete से पहले पुरानी Drive file को existing GWC_Deleted_Items folder में archive करने की कोशिश होती है।
- 3 महीने से पुराने slips की archive check Admin portal खुलने/section render होने पर चलती है।
- Archived slip link और permanent-delete action Fee Management में उपलब्ध है, जहाँ Drive file ID उपलब्ध हो।
- Join My Class की validity अब Admin द्वारा set किए गए Valid From / Valid To dates से नियंत्रित होती है; पुराना cycle counter visible Fee Management control नहीं है।

Archive timing limitation:
- Auto-archive check तब चलता है जब Admin portal खोलता है या किसी section पर जाता है। यह server-side scheduled trigger नहीं है।
- यदि Admin तीन महीने से अधिक समय तक portal न खोले, तो उसी समय background में file move नहीं होगी; अगली बार Fee Management खुलने पर check चलेगा।
- Background scheduled archival के लिए Apps Script में अलग time-driven trigger जोड़ना पड़ेगा; इस ZIP में Code.gs को untouched रखा गया है।

4) WhatsApp Help Desk / Dashboard inbox
- Admin chat में Teacher/Student search और Go to Chat.
- Main dashboard inbox से Hide करने पर message dashboard inbox से हटकर Archived / Hidden Help Desk Messages में आता है।
- Unhide करने पर message dashboard inbox में फिर दिखता है।
- Hide करने से actual conversation/message delete नहीं होता।
- Admin chat के अंदर message का Permanent Delete action है।
- Existing chat/group messages और attachment records को migration के दौरान नहीं मिटाया गया।

5) Deleted student Login ID reuse
- Admin द्वारा student को permanent remove करने पर उसके student login account को active users list से हटाकर Login ID reuse के लिए free किया जाता है।
- Old credentials का archive record Admin > Deleted Accounts Archive में रहता है; Admin archive record permanently purge कर सकता है।
- पुराने orphaned student accounts (जिनका active या Trash student record नहीं है) उसी archive page से Admin release कर सकता है।
- केवल Trash में भेजे गए students के login records अभी भी restore के लिए सुरक्षित रहते हैं; उन्हें permanent remove किए बिना ID free नहीं होती।

बदली गई files
--------------
- index.html: V32 additive UI/logic changes.
- README_V32_FINAL_HINDI.txt: यह guide.
- Code.gs, server.js, package.json, appsscript.json और बाकी सभी पुराने README files मूल V30 ZIP से जस के तस रखे गए हैं।

Deployment से पहले अनिवार्य सुरक्षा
----------------------------------
1. Live Render deploy से पहले वर्तमान Google Sheet state का backup लें।
2. पुराने ZIP और GitHub repository की copy रखें।
3. इस ZIP को पहले staging/test Render service पर deploy करके Admin, Teacher और Student login test करें।
4. Admin login के बाद Salary Management में हर assigned student का monthly teacher amount भरें।
5. Fee Management में वर्तमान month चुनकर प्रत्येक student की Fee Amount, Valid From और Valid To dates set करें।
6. Student account से JPEG slip upload करके Admin view/replace/delete test करें।
7. Test के बाद ही production Render service पर deploy करें।

जाँचे गए परीक्षण
----------------
- सभी inline JavaScript blocks पर Node.js syntax check सफल.
- ZIP integrity check सफल.
- Headless Chromium smoke test: Salary Management section, example ₹1,200 calculation,
  Fee Management view, no-cycle student creation form, monthly teacher-pay input,
  date-validity access gate, Help Desk search/Go to Chat, hide/unhide archive,
  permanent message delete control, permanent student removal और Login ID release archive
  पर runtime smoke checks किए गए।
- Google Apps Script / live Google Drive / live Render / वास्तविक user credentials के साथ
  end-to-end production test इस environment से नहीं किया जा सकता। इसलिए live upload/permissions,
  data sync और actual Drive archival को staging deploy पर verify करना आवश्यक है।

कृपया इस ZIP को "live production verified" तभी मानें जब staging पर ऊपर दिए गए test पूरा हो जाएँ।


V32.2 FEE RECORD REPAIR
-----------------------
See README_V32_2_FEE_REPAIR_HINDI.txt. This focused patch changes index.html only; original backend and all other files are preserved. Live Google services still require staging verification.
