GWC V37 – STUDENT MEET ACCOUNT SELECTION + MONTHLY PARENTS FEEDBACK
Base: GWC_V33_5_QR_PAUSE_FIX.zip (with prior V34–V36 controlled update layers retained)

इस build में इस बार के अनुरोध के अनुसार:
1. Teacher dashboard के Assigned Students register में कॉलम का नाम “Last Date of Class” है। यह class validity period की अंतिम तारीख दिखाने की कोशिश करता है; fee-paid transaction date को इस कॉलम में नहीं दिखाता। यदि पुराने record में class validity end date उपलब्ध नहीं है तो “Not available” दिखेगा।
2. Parents Feedback का interval Monthly है। प्रत्येक Teacher के अपने assigned students के लिए पिछली feedback date से अगली monthly due date निकाली जाती है। Feedback न होने या due date आ जाने पर Teacher dashboard पर लाल pending alert दिखता है। Submit करने के बाद alert उसी student के लिए अगली due date तक हटता है।
3. Student के My Course में “Join My Class” अब Google AccountChooser URL पर जाता है और चयन के बाद उसी Google Meet URL पर continue करता है। Meet URL का HTTPS/domain/meeting-code format पहले validate होता है।
4. Teacher का पुराना Meet join workflow नहीं बदला गया है; नया account-chooser handler केवल Student के My Course button से call होता है।
5. Android पर Google Meet app installed होने पर Google/Android verified-link handling के अनुसार app खुल सकता है; अन्यथा browser fallback Google के control में है। App launch, account chooser appearance, account sign-in, host admission और real meeting entry इस offline/static build test से guarantee नहीं किए जा सकते।

Deployment:
- ZIP extract करके पूरा project GitHub repository में upload/push करें और Render पर existing Web Service deploy करें।
- Existing Render Environment Variables और Google Apps Script deployment/configuration को न बदलें।
- इस build में package.json, server.js, Code.gs और appsscript.json को base ZIP से byte-for-byte unchanged रखा गया है।
- Production deploy से पहले staging Render पर login और real Google account/device test करें।

Known verification boundary:
- Static JavaScript syntax, Code.gs syntax, JSON validity, ZIP integrity और source-file preservation checks किए गए।
- इस environment से user's Google Sheet/Drive, Apps Script deployment, Render environment, WhatsApp external API, Android device या desktop browser session में live integration test नहीं किया जा सकता।
- AccountChooser -> Meet redirect is browser/Google-managed; no app can silently select an email account or bypass Google's account/security screens.
