GROWTH WORLD CLASSES – V41 CONTROLLED UPDATE
Base: GWC_V33_5_QR_PAUSE_FIX.zip (with the intervening controlled V34–V40 additions retained)

मुख्य बदलाव:
1. Teacher के Assigned Students पेज पर Last Fee Paid Date के बजाय Last Date of Class दिखती है। यह मौजूदा course validity period के end date (endAt से एक दिन पहले) से निकाली जाती है; उपलब्ध न होने पर validTo record fallback है।
2. Parents Feedback alert अब Monthly है। Teacher को जिन assigned students का इस महीने का feedback due है, उनका red pending alert मिलता है। Feedback submission records मौजूदा state storage में रहते हैं।
3. Student Join My Class पर Google AccountChooser URL से Google account चुनकर उसी Meet URL पर आगे बढ़ता है। Teacher का पुराना Join workflow जानबूझकर नहीं बदला गया। Android में Meet App handoff Android App Links/installed-app/browser handling पर निर्भर है।
4. Dashboard पर केवल Latest Message और View All दिखता है; पुराने per-user Hide/Hidden Messages workflow को dashboard flow से हटाया गया है।
5. View All में authorized users को message-level permanent delete मिलता है। Admin सभी visible messages delete कर सकता है; Teacher/Student अपने messages और अपने वर्तमान GWC-managed group के messages delete कर सकते हैं।
6. Teacher के लिए per-teacher GWC-managed Help Desk group auto-create/sync होता है। Assigned students में inactive हुए students group membership से हटते हैं; active होने पर उसी teacher group में वापस जुड़ते हैं। Membership history record होती है।
7. अलग Today Notes page/menu entry हटाई गई है। Help Desk में PDF/Photo attachments भेजने की सुविधा बनी रहती है।
8. Admin dashboard में “Help Desk Inbox” heading को “Latest Message” label से बदलने का runtime cleanup जोड़ा गया है।

डेटा/बैकवर्ड कम्पैटिबिलिटी:
- Code.gs, server.js, package.json और appsscript.json को V33.5 base से byte-identical रखा गया है।
- Existing IDs, credentials, assignments और records के लिए कोई migration या reset नहीं किया गया।
- नया behavior frontend में additive overrides से लागू किया गया है।

महत्वपूर्ण सीमाएँ:
- Student Google AccountChooser से account चुनने का browser redirect flow implement है; हर Android manufacturer/device पर Meet app auto-open होने की गारंटी केवल source-code test से नहीं दी जा सकती। Device पर Meet installed/uninstalled, default app links, browser और Google account state के साथ physical testing आवश्यक है।
- Teacher auto groups GWC app के अंदर के GWC-managed groups हैं। यह अपने-आप बाहरी WhatsApp groups में सदस्य जोड़/हटा नहीं सकता। उसके लिए WhatsApp Business Platform/API, approved templates/permissions और server-side integration चाहिए; इस ZIP में fake external WhatsApp automation नहीं है।
- Monthly Feedback alert और group membership reconciliation app dashboard render/sync cycle पर चलता है; यह server-side scheduled job नहीं है।
- Permanent delete app के current saved state se message हटाता है; किसी remote backup/snapshot mein purana data reh sakta hai.

Deploy:
- ZIP ko extract karke existing Render/GitHub project ke source files replace karein; package.json ke existing Build/Start settings na badlein.
- Pehle staging Render par test karein. Production se pehle Google Sheets sync, four-role login, Android/PC Meet handoff, aur group membership lifecycle ko actual accounts se verify karein.
