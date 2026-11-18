GWC V46 – CONTROLLED CLOUD SYNC & ACADEMIC UI UPDATE

Base: GWC_V45_FINAL_CONTROLLED_UPDATE (1).zip

Is update mein:
1. Cloud se poora shared state har 5 second download karne wala polling interval 20 minute kiya gaya.
2. Existing save() / scheduleGoogleSave() mechanism ko preserve kiya gaya. Kisi portal par user ka data change/save hone par existing 700ms debounce ke baad cloud save trigger hota hai; har second bina badlav ke full state upload nahi hota.
3. Signed-in user tab/app par wapas aaye (visibility/focus) to pending local save na hone par cloud refresh turant request hota hai.
4. Admin portal mein Academic UI Studio add kiya gaya. Admin 10 themes mein se select kar sakta hai. Selected theme state.settings mein save hoti hai aur doosre portals apne next cloud refresh par wahi theme apply karte hain.
5. Theme colors + lightweight CSS animated academic sparkle emoji; reduced-motion preference respect hoti hai.

IMPORTANT SYNC EXPECTATION:
- Change/save karne wala portal existing save path se cloud ko update karta hai.
- Doosre khule portals background mein maximum 20 minute ke scheduled interval par refresh karte hain; user tab par wapas aaye to focus/visibility refresh pehle ho sakta hai.
- Yeh true server-push/websocket sync nahi hai. Is ZIP mein bina naya backend protocol / Apps Script trigger / realtime service add kiye instant cross-device push ka dawa nahi kiya gaya.
- Presence ping (20 seconds) aur Help Desk open-view repaint (6 seconds) alag lightweight existing features hain; unhe cloud full-state polling na samjhein.
- Google Sheets/Apps Script response speed, network, Render availability aur account/device sleep ke karan actual completion time vary karega.

PRESERVATION:
- index.html ke alawa Code.gs, server.js, package.json, appsscript.json unchanged.
- Existing login IDs/password setup, roles, courses, student/teacher records, assignments, fee data, settings, Apps Script security/signature checks, Render proxy configuration aur storage format ko modify nahi kiya.
- No database migration, reset, credential change, or security relaxation.

DEPLOYMENT SAFETY:
- Pehle Render staging/separate service par deploy karein.
- Existing Render environment variables, Apps Script deployment URL, spreadsheet ID, Drive folder ID, secrets aur deploy settings bilkul same rakhein.
- Admin, Sub-admin, Teacher, Student login aur cloud read/write ka test karne ke baad hi production replace karein.
- Existing production ZIP/backup ko safe rakhein.
