GROWTH WORLD CLASSES — Google Sheets + Drive starter package
===========================================================

इस ZIP में:
- index.html: आपके दिए हुए HTML पर आधारित वेबसाइट; Firebase और Supabase client code हटाकर Google Apps Script API जोड़ा गया है।
- Code.gs: Google Apps Script backend; state Google Sheet में chunked JSON के रूप में और uploads Google Drive में रखता है।
- README_HINDI.txt: setup steps और सीमाएँ।

बहुत ज़रूरी बात
---------------
आपका दिया हुआ Apps Script /exec URL केवल endpoint URL है। इस HTML से तभी काम करेगा जब उसी Apps Script project में नीचे दिया Code.gs deploy किया गया हो। केवल URL डाल देने से पुराने deployed script में नए save/load/upload actions अपने-आप नहीं आ जाते।

इस starter में payment slip/logo/poster Drive पर upload करने के लिए “Anyone with the link” sharing है। इसलिए इसे वास्तविक बच्चों/अभिभावकों के पते, मोबाइल नंबर या payment slips के लिए अभी production-secure न मानें। इस पुराने HTML में role login भी browser-side है; वह secure authentication नहीं है। पहले test data से जाँचें। असली data के लिए Google Identity/secure backend और private Drive download proxy की व्यवस्था आवश्यक है।

A. ZIP को PC पर खोलना
1. ZIP extract करें।
2. index.html को सीधे double-click करके final use न करें; इसे GitHub repository में upload करके Render Static Site से deploy करें।
3. Code.gs को Apps Script editor में paste करें।

B. Google Sheet + Drive backend लगाना
1. https://script.google.com/ खोलें।
2. New project बनाएँ या उसी project को खोलें जो आपके दिए हुए URL से जुड़ा है।
3. Code.gs का पुराना code हटाकर ZIP के Code.gs का पूरा code paste करें और Save करें।
4. ऊपर Run में doGet को चुनकर Run करें; permissions माँगे तो अपने Google account से review/allow करें। यदि सीधे Run पर event parameter error आए तो यह सामान्य हो सकता है; web app URL को browser में खोलकर जाँचें।
5. Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
6. Web app settings: Execute as “Me”; Who has access: “Anyone” (सिर्फ़ test के लिए; यह public endpoint है).
7. `/exec` URL कॉपी करें। अगर URL वही नहीं है तो index.html में `GWC_API_URL` वाली line में नया URL डालें।
8. Apps Script web app URL खोलने पर JSON जैसे `{"ok":true,"state":null}` या state object आना चाहिए।
9. पहली successful save पर Google Drive में `GWC_Uploads` folder और Google Drive में `GWC Website Cloud Data` नाम की spreadsheet अपने-आप बनेगी।

C. GitHub + Render
1. GitHub पर अपनी नई/staging repository खोलें।
2. ZIP से index.html और चाहें तो README को repository root में upload/commit करें। Code.gs को static website repo में रखना जरूरी नहीं, लेकिन documentation के लिए रख सकते हैं।
3. Render Dashboard → New → Static Site → GitHub repository चुनें।
4. Publish directory खाली/`.` रखें (आपकी repository की संरचना के अनुसार); Build command खाली रखें।
5. Deploy करें। बाद में GitHub commit push करने पर Render नया deploy करेगा।
6. Website खोलकर नीचे दाएँ sync status देखें। “Connected — Google Sheets/Drive active” तभी सही है जब Apps Script endpoint से read/save सफल हो।

D. Test checklist (पहले fake data से)
- Website खोलें और sync badge देखें।
- एक test course बनाएं, page reload करें; record वापस आता है या नहीं।
- एक छोटा test image upload करें; Drive में file दिखती है या नहीं।
- दूसरे browser/device में वही website खोलकर data sync जाँचें।
- Network/server error हो तो Apps Script deployment URL, permissions और browser console जाँचें।

महत्वपूर्ण सीमाएँ / अगले काम
---------------------------
- यह package आपके HTML के मौजूदा UI/features को यथासंभव रखता है, लेकिन मूल HTML में कुछ modules स्वयं placeholder हैं (जैसे Teacher portal और Subadmin portal), और login/password browser-side है। इन्हें इस ZIP ने secure backend नहीं बनाया।
- Apps Script + Sheets/Drive free quota/limits के अधीन हैं; unlimited storage/sync की गारंटी नहीं।
- इस starter में last-write-wins state save है। एक साथ कई admins edit करें तो changes overwrite हो सकते हैं। Production में per-record writes, conflict handling, access controls, audit/security testing चाहिए।
- Payment slip uploads link-accessible हैं: real slips upload न करें जब तक private storage access implement न हो।
- Razorpay link खोलना या uploaded slip payment verification नहीं है। Admin को provider-side payment verify करना होगा।
- Firebase/Supabase SDK/config references हटाए गए हैं; Apps Script endpoint आपके provided URL पर configure है।
