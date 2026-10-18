GWC Render Cloud Update — zaroori baat

Is package mein Supabase aur browser localStorage-based main database hata kar same Render Node.js server par API + file upload joda gaya hai. Existing HTML ke portals/forms ko jitna ho sake preserve kiya gaya hai.

DEPLOY:
1. ZIP ko extract karke GitHub repository mein index.html, server.js, package.json, render.yaml upload/commit karein.
2. Render Dashboard → New → Blueprint (ya Web Service) se repository connect karein.
3. Persistent disk /var/data mount zaroori hai. render.yaml mein Starter plan + 1GB disk diya hai; persistent disk free Render web service par available nahin hota. Paid disk/instance ke bina Render redeploy/restart par files/data kho sakte hain.
4. Deploy ke baad https://YOUR-SERVICE.onrender.com/api/health kholkar {"ok":true,...} dekhein.
5. Site kholkar admin login karein aur test course + small image save karke page refresh karein.

IMPORTANT LIMITATIONS / SECURITY:
- Render ke free ephemeral filesystem par hamesha ka data rakhna reliable nahin hai. User ki “free + always persistent + Render only” teenon conditions ek saath Render par guarantee nahin hoti; is build mein persistent disk config ki gayi hai.
- Existing HTML ka login model client-side hai aur default admin password source mein maujood hai. Isliye public internet par real student/parent private data use karne se pehle server-side authentication/authorization aur database rules lagana zaroori hai. Yeh package secure production payment/admission system ka certification nahin hai.
- Upload limit 1MB per file. Course poster ke purane 50KB UI limit ko preserve kiya gaya hai; logo/main poster 1MB tak.
- Razorpay link sirf payment page kholta hai; slip ya link khulna payment verification nahin hota. Admin ko Razorpay dashboard se payment verify karni chahiye.
- Browser tabs khuli hone par background refresh 10 sec mein state refresh karta hai. Multi-admin simultaneous edits mein conflict/last-write-wins ho sakta hai; transaction-safe multi-user database abhi implement nahin hai.
- Backup na banane ko kaha gaya tha, isliye original ko edit nahin kiya gaya; nayi ZIP alag deliver ki gayi hai.
