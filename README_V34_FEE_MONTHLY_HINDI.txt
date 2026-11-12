GWC V34 — FEE MANAGEMENT MONTH-WISE UPDATE

Is build mein sirf Admin Fee Management aur legacy Fee Summary screen ko month-wise fee register se replace kiya gaya hai.

BADLAV:
1. Admin sidebar mein duplicate “Fee Summary & Monthly Payments” entry hide karke ek “Fee Management” entry rakhi gayi hai. Purana Fee Summary route agar kisi saved link se khulta hai to wahi naya Fee Management screen dikhata hai.
2. Month/Year select karke har assigned student ka monthly fee amount, payment date, Paid/Unpaid/Partial status, admin note aur fee slip manage ki ja sakti hai.
3. Admin Add/Edit Monthly Fee Data se image/PDF fee slip upload kar sakta hai (existing Google Drive upload function, max 1 MB).
4. Parent fee slip requests mein Pending, Rejected aur Approved sabhi statuses ke records Archive kiye ja sakte hain. Pehli rejected request ko active rakhne wali purani pabandi hata di gayi hai.
5. Monthly fee data ke liye alag archive aur fee slip requests ke liye alag archive diya gaya hai. Dono archive se Restore aur Permanent Delete actions available hain.
6. Permanent Delete se pehle Drive file ID milne par existing Google Apps Script permanentdeletefile action call hota hai. Drive delete fail ho to record archive se delete nahi hota.
7. Fee Management screen se cycle, renewal, validity period, due date aur cycle reset/start controls hata diye gaye hain.

DATA SAFETY:
- Login IDs/passwords, student/teacher accounts, courses, batches, attendance, tests, homework, schedules, salary management, settings, Render proxy aur Google Apps Script URL ko modify nahi kiya gaya.
- Existing feePeriods/approvedCycles jaise legacy fields ko database se hard-delete nahi kiya gaya, kyunki current student course-access calculation in historical values ko read karti hai. Fee Management UI mein cycle controls nahi dikhte; legacy values preserve karne se existing students ka class access achanak break nahi hota.
- Existing feeRequests aur gwcMonthlyFees data ko migrate/delete nahi kiya gaya. Archive arrays lazily initialize hoti hain.

DEPLOY:
1. ZIP extract karein.
2. Existing project ka backup rakhein.
3. Updated index.html ko replace karein; server.js, Code.gs, package.json aur appsscript.json ko unchanged rakhein.
4. Render deploy ke baad Admin login karke Fee Management test karein.
5. Permanent Delete ko test karne se pehle non-critical test record use karein.
