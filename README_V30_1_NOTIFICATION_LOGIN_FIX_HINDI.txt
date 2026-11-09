GWC V30.1 – PUSH NOTIFICATION BUTTON + ADMIN LOGIN ID FIX
=========================================================

इस ZIP में V30 के Website Background Push setup का targeted fix है।

ठीक की गई समस्याएँ:
1) Admin login object में id field नहीं बनती थी, जबकि Push setup उसी id को अनिवार्य मानता था। इसलिए Admin logged-in होने के बावजूद “पहले अपने GWC खाते में Login करें” error आता था। अब Admin के लिए स्थायी id admin:<Admin Login ID> बनाई जाती है और saved-login restore में भी वही id रहती है।
2) Notification opt-in panel अब Admin, Sub-admin, Teacher और Student के authenticated dashboard के ऊपर दिखाने के लिए लगाया गया है। यह WhatsApp Help Desk के पुराने/नए menu नाम पर निर्भर नहीं है।
3) Dashboard render और tab refresh के बाद panel दोबारा attach होता है; duplicate panel नहीं बनता।
4) V30 scripts को HTML body के अंदर रखा गया है ताकि browser उन्हें standards-compliant तरीके से execute करे।

DEPLOYMENT:
- पहले वर्तमान live ZIP और Google Sheet का backup लें।
- इस ZIP की पूरी contents को उसी Render Web Service के deployment source में replace करें।
- Render पर existing Environment Variables को न बदलें। विशेष रूप से GWC_API_URL, GWC_PROXY_SECRET, GWC_APP_VERSION=24.0-secure और VAPID variables वही रखें।
- Build/Deploy पूरा होकर Live होने दें।
- Website पर hard refresh (Ctrl+Shift+R) करें।
- Admin, Sub-admin, Teacher और Student में अलग-अलग login करके Dashboard के सबसे ऊपर “Website Notifications” panel देखें।
- “Enable Browser Notifications” दबाएँ और browser prompt पर Allow करें।

TEST:
- Browser permission Allow होनी चाहिए।
- Push setup के बाद app Google Sheet में gwcPushSubscriptions save करता है।
- दो अलग accounts से WhatsApp Help Desk direct message भेजकर receiving device पर push test करें।
- Render logs में /api/gwc/push/send errors देखें।

PRESERVATION:
- V28 class-wise weekly schedule PDF/image upload, archive, assigned-course mapping code रखा गया है।
- Existing Code.gs, package.json, server.js, sw.js और app data schema में destructive migration नहीं जोड़ी गई।
- Admin login ID/password, user IDs/passwords, fees, courses, settings और existing Google Sheet data बदलने का कोई step नहीं है।
- Push subscription केवल additive gwcPushSubscriptions array में save होती है।

LIMITATION:
Push delivery के लिए HTTPS, valid matching VAPID key pair, Render environment variables, internet, browser/device notification permission और supported browser आवश्यक हैं। OS/battery/browser background restrictions delivery रोक सकती हैं।
