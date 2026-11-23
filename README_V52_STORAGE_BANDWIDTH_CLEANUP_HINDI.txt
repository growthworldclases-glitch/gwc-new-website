GWC V52 – STORAGE & BANDWIDTH CLEANUP (ADDITIVE UPDATE)
Base: Uploaded GWC_V51_SECURITY_CLOUDFLARE_UPDATE.zip

इस अपडेट में केवल Admin के लिए Storage & Bandwidth Cleanup सेक्शन जोड़ा गया है। पुराने Login IDs, Passwords, Accounts, Courses, Students, Teachers, Fees, Settings, existing data structure और दूसरे modules को जानबूझकर नहीं बदला गया है।

1) RENDER BANDWIDTH बनाम STORAGE
- Render bandwidth का अर्थ Render से भेजा/प्राप्त किया गया network data है। इस्तेमाल हो चुकी monthly bandwidth को delete करके वापस नहीं पाया जा सकता।
- Render Admin panel में Render की official monthly bandwidth usage ही authoritative रहेगी।
- Render deployment में /tmp/gwc-managed-cache नाम की dedicated managed temporary directory ही cleanup eligible है। यह app source, public assets, database, uploads या user data को नहीं छूती।
- App response-byte counter केवल वर्तमान Render process restart के बाद से Content-Length आधारित estimate है; यह Render की official monthly bandwidth meter नहीं है।
- यदि site Cloudflare Worker से serve हो रही है, Render local cleanup endpoint लागू नहीं होता। Cloudflare Worker endpoint साफ तौर पर इसकी जानकारी देता है।

2) GOOGLE DRIVE CLEANUP
- केवल GWC_Uploads folder की direct files scan होती हैं।
- Current saved GWC state में file ID/URL मिलने पर उसे REFERENCED_IN_CURRENT_STATE दिखाया जाता है और archive action रोका जाता है।
- State में reference न मिलने वाली file केवल REVIEW_POSSIBLY_UNUSED है; यह proof नहीं कि file कहीं और इस्तेमाल नहीं होती।
- Archive action file को GWC_Cleanup_Quarantine में move करता है; तुरंत permanent delete नहीं करता। Admin उसे वापस GWC_Uploads में Restore भी कर सकता है।
- Permanent delete केवल dedicated quarantine folder से, current Admin ID/Password verification और typed DELETE confirmation के बाद होता है।
- Existing GWC_Deleted_Items, Deleted Fee Slips, backup sheets और दूसरे folders इस scan/delete scope में नहीं हैं।

3) IMPORTANT LIMITATIONS / DEPLOYMENT
- यह ZIP source update है; live Render, Apps Script या Cloudflare पर deploy नहीं हुआ।
- Google Apps Script में updated Code.gs publish करना होगा। Existing deployment URL / Script Properties / spreadsheet ID / Drive folder ID न बदलें।
- Render deployment के लिए नया server.js deploy करें। Cloudflare deployment के लिए नया worker.js और public/index.html deploy करें।
- Render official monthly bandwidth आंकड़ा इस app से read नहीं किया जाता; उसे Render Dashboard में देखें। Cloudflare usage Cloudflare dashboard में देखें।
- Drive cleanup पहले scan करें और हर candidate का नाम/आकार/date स्वयं review करें। पुराने links, private messages, historical backups या बाहरी references current state scan में न मिलें तो भी file को unused मानना सुरक्षित नहीं है। इसीलिए archive से पहले confirmation और quarantine दिया गया है।

4) VALIDATION
- ZIP integrity, JavaScript syntax और HTML embedded scripts deployment से पहले अलग से validate करें। Apps Script runtime और live account permissions को local ZIP validation से प्रमाणित नहीं किया जा सकता।


V53 NOTE: इस V52 implementation को V53 CLEANUP FIXED में सुधारा गया है। V53 README और validation report को प्राथमिकता दें। V53 में Drive folder auto-create करके misleading 0 scan होने की स्थिति रोकी गई है; Drive Trash को irreversible permanent delete नहीं कहा गया है।
