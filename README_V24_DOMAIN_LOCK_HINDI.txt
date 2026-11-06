GWC V24 — DOMAIN LOCK (SAFE ADDITIVE UPDATE)
================================================

Is ZIP mein existing index.html, Code.gs, IDs/passwords, Google Sheet/Drive IDs,
fee data aur existing features ko badla nahi gaya hai. Sirf server.js mein domain
allowlist gate add kiya gaya hai.

DEFAULT ALLOWED DOMAIN:
https://growth-world-classes-2-0.onrender.com

Iske alava growthworldclasses.com samet kisi bhi hostname se aane wali website
request aur /api/gwc Google-sync request ko Node server HTTP 403 se rokega,
jab tak hostname deployment configuration mein explicitly allow na ho.

IMPORTANT DEPLOYMENT:
1. ZIP ka content apne existing GitHub repository mein upload/replace karein.
2. Render par wahi existing Web Service deploy karein.
3. Render > Environment mein GWC_ALLOWED_HOSTS variable set NA karein (default
   sirf growth-world-classes-2-0.onrender.com allow karta hai).
4. Deploy ke baad canonical URL kholkar Admin login, student/teacher login,
   Google realtime sync, fee management, upload aur helpdesk ko test karein.
5. growthworldclasses.com ko Render custom domain se disconnect/remove karein
   agar woh isi Render service par point karta hai. Is code ka host gate us domain
   ko 403 dega, lekin DNS/custom-domain mapping ko Render dashboard se bhi hatana
   chahiye.

SECURITY LIMIT / ADMIN DOMAIN MANAGEMENT:
- Is update mein dashboard ke andar se domain add/remove karne ka control nahi
  banaya gaya hai. Existing Admin login flow ko guess karke badalna unsafe hota.
  Naya domain baad mein allow karna ho to Render Environment mein
  GWC_ALLOWED_HOSTS ko comma-separated hostnames ke saath deployment owner set kare.
- Google Apps Script Web App ka URL agar kisi purane copied code mein directly
  exposed hai, to sirf Render host restriction us direct URL ko secure nahi karta.
  Is ZIP ka current index.html same-origin /api/gwc proxy use karta hai. Purane
  copies ko band karne ke liye Apps Script deployment ko bhi rotate/restrict karna
  hoga, lekin usse pehle is live website ka sync test aur migration plan zaroor karein.
- Apps Script request event Origin/Host header ko reliably expose nahi karta;
  isliye Code.gs mein fake Origin check add nahi kiya gaya.
- Koi ZIP aapke Render/GitHub/Apps Script par apne-aap deploy nahi hoti. Deployment
  ke baad hi live domain gate active hoga.

PRESERVATION:
- index.html aur Code.gs byte-for-byte original ZIP se same hain.
- server.js mein host restriction additive hai.
- Koi login ID/password, spreadsheet ID, Drive folder, fee cycle ya saved data
  modify nahi kiya gaya.
