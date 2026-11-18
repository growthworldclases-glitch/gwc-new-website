GWC V46 – CLOUD SYNC SPEED OPTIMIZATION (ADDITIVE UPDATE)
Base: GWC V45 FINAL CONTROLLED UPDATE.

Is update mein sirf cloud synchronization ka internal tareeka optimize kiya gaya hai. Existing website features, dashboard UI, role permissions, login IDs/password setup, settings, records, Drive uploads, Help Desk, fee management, courses, schedules aur Meet workflow ko remove ya redesign nahi kiya gaya.

Kya sudhara:
1. Pehle har 5 second mein har open browser poora GWC state JSON Google Sheets se mangwa raha tha. Isse bade data par Admin/Teacher/Student/Sub-admin sabhi ke sync mein unnecessary delay aur bandwidth/Apps Script load badhta tha.
2. Ab browser har 3 second mein lightweight `loadmeta` revision check karta hai. Jab tak cloud revision nahi badalta, poora JSON download nahi hota.
3. Cloud revision badalne par hi latest full state load hota hai aur active role dashboard refresh hota hai.
4. Save ke response se latest revision browser mein update hota hai, isliye apne hi save ko doosre change samajhkar dobara full download nahi karta.
5. User kisi input/form mein edit kar raha ho to naya cloud state uske beech mein apply nahi hota; agle poll mein dobara check hota hai.
6. Background tab mein polling pause rahegi; tab visible hone par polling resume hoti hai.
7. Existing `load` action aur save format/chunk storage ko preserve kiya gaya. `loadmeta` ab lightweight metadata deta hai, poora state nahi.

Deployment:
- Render ke liye ZIP ke existing files GitHub/Render project mein usual process se update karein. `server.js`, `package.json` aur Render environment variables ko badalne ki zarurat nahi hai.
- Google Apps Script project mein ZIP ka updated `Code.gs` replace/paste karke Save karein aur existing Web App deployment ko Manage deployments > Edit > New version ke saath redeploy karein. Existing Script Properties (Spreadsheet ID, Drive Folder ID, proxy secret, allowed version) ko change/delete na karein.
- Website aur Apps Script dono update hone ke baad browser mein hard refresh karke Admin aur doosre role se test karein.

Data safety:
- Koi spreadsheet reset, migration, default state upload ya data deletion nahi ki gayi.
- Is ZIP mein source-level validation ki gayi hai; live Google Sheets/Render round-trip is environment se test nahi ho sakta. Deployment ke baad real role accounts se sync verify karna zaroori hai.
