GWC V30 – WEBSITE BACKGROUND PUSH NOTIFICATION
================================================

V30 में Website के लिए Web Push API + Service Worker + VAPID + Render Push Sender जोड़ा गया है। यह APK को modify नहीं करता। पुराने data schema में केवल gwcPushSubscriptions नाम का additive array इस्तेमाल होता है; मौजूदा GWC_Storage data को reset या migrate नहीं किया जाता।

जरूरी: ZIP upload करने भर से Push चालू नहीं होगा। Render पर VAPID keys configure करना और नई deployment करना अनिवार्य है। Browser में हर user को एक बार Login करके Enable browser notifications दबाना होगा और Permission Allow करनी होगी।

RENDER ENVIRONMENT VARIABLES
----------------------------
1) GWC_VAPID_PUBLIC_KEY = VAPID key pair की Public Key
2) GWC_VAPID_PRIVATE_KEY = उसी pair की Private Key (SECRET; किसी को न दें)
3) GWC_VAPID_SUBJECT = mailto:आपका-admin-email@example.com

VAPID key pair बनाने के लिए अपने computer/terminal पर चलाएँ:
  npx web-push generate-vapid-keys

Command से मिली Public Key और Private Key को ऊपर के Render Environment Variables में डालें। दोनों keys एक ही pair की होनी चाहिए। Private key को HTML, GitHub या सार्वजनिक ZIP में न डालें।

DEPLOYMENT STEPS
----------------
1) पहले Google Sheet और Render की मौजूदा configuration का backup लें।
2) इस ZIP को अपने deployment source में upload/replace करें।
3) Render पर package.json से npm install/build और नई deploy होने दें। web-push dependency install होगी।
4) Render Environment में तीन VAPID variables सेट करें।
5) Render service restart/redeploy करें।
6) HTTPS website खोलें; Service Worker केवल secure context (HTTPS या localhost) पर चलता है।
7) Admin, Teacher और Student प्रत्येक अपने-अपने account से Login करें। Helpdesk/Helpline section में “Enable browser notifications” दबाकर Allow करें। हर device/browser पर यह एक बार करना होगा।
8) Test: एक account से दूसरे account को Helpdesk message भेजें; recipient का browser बंद/website बंद करके भी push test करें। Android में Chrome की site notification permission और background/battery settings allow हों।

KAAM KARNE KA TAREEQA
---------------------
- Subscription browser से बनती है और existing Google Sheet state के gwcPushSubscriptions array में save होती है।
- Message save होने के बाद Render server cloud state में message/recipient verify करके Web Push भेजता है।
- Service Worker website tab बंद होने पर push event लेकर OS notification दिखाता है।
- Render server weekly teacher schedule (gwcWeeklySchedules) को हर 30 सेकंड check करता है और schedule start से 5 मिनट पहले से 10 मिनट बाद तक teacher तथा mapped course students को class alert भेजता है।
- Class alert के लिए teacher weekly schedule में day और time सही होना चाहिए। V28 के केवल PDF/image upload से समय अपने-आप नहीं निकाला जाता।

LIMITATIONS / EXPECTATIONS
--------------------------
- User permission Allow करे, browser/device Web Push support करे, internet/data चालू हो और OS/browser background delivery block न करे। Battery saver, force-stop, browser restrictions या manufacturer power management delivery रोक सकते हैं; इसलिए 100% guaranteed delivery का दावा नहीं है।
- iPhone/iPad पर Web Push के लिए supported iOS/iPadOS version, Home Screen installation और permission की शर्तें लागू हो सकती हैं। Android Chrome/Edge पर सामान्यतः बेहतर support है।
- वेबसाइट push केवल WEBSITE में है; existing APK source/package को इस ZIP से modify नहीं किया गया।
- यदि Render की free service sleep करती है तो class schedule poll समय पर नहीं चल सकता। Reliable scheduled alerts के लिए always-on Render instance या external cron/worker आवश्यक है।
- Push delivery logs Render logs में देखें। Expired subscriptions के लिए browser में notifications दोबारा enable करवाएँ।

SAFETY
------
- GWC_VAPID_PRIVATE_KEY केवल Render Environment में रखें।
- ZIP में private VAPID key शामिल नहीं है।
- Existing Google Sheet storage और login credentials को बदलने/clear करने का कोई migration step नहीं है।
- Deployment के बाद Admin/Teacher/Student test accounts से सभी pages, Helpdesk, Sync, schedule और notifications जाँचें।
