GWC V34 — CONTROLLED UPDATE PACKAGE
===================================

BASE ARCHIVE
------------
GWC_V33_5_QR_PAUSE_FIX.zip (the ZIP uploaded for this update).

PRESERVATION
------------
- All 32 entries from the uploaded ZIP are retained.
- Only index.html is changed.
- Code.gs, server.js, package.json, appsscript.json and the existing README files are
  retained byte-for-byte.
- No student, teacher, login, course, batch, password, spreadsheet, Drive, or existing
  cloud record is changed by creating this ZIP.
- New feedback and managed-group metadata are additive properties in the existing
  website state. They are persisted through the existing save/sync workflow.

IMPLEMENTED IN THIS PACKAGE
---------------------------
1. Parents Feedback (Teacher)
   - New Teacher menu section: Parents Feedback.
   - Teacher can submit a dated feedback entry only for a student visible in their
     assigned courses.
   - Feedback history is retained in state.gwcParentFeedback.
   - A red pending alert is shown when a student has no feedback or the latest entry is
     15 or more days old.

2. Parents Feedback Manage (Admin)
   - New Admin menu section: Parents Feedback Manage.
   - Teacher-wise assigned student status, pending count, submission dates, due dates,
     and historical feedback text are shown.
   - Help Desk Message opens the existing Help Desk.
   - Direct WhatsApp link is shown only where a teacher phone/mobile number exists.

3. Help Desk Group Creation
   - Admin and Subadmin retain their existing group workflow.
   - Teacher can create a GWC in-app Help Desk group containing only students assigned
     to that teacher.
   - Student role is denied group creation.
   - Teacher-created groups store managed membership history. When the existing
     fee-validity logic marks a student inactive, that student is removed from the
     GWC-managed in-app group; when fee validity becomes active again, the student is
     restored to that same group.
   - This does NOT add/remove members in external WhatsApp groups. No WhatsApp Business
     API credentials, approved templates, webhook, or provider integration were present
     in the supplied ZIP, so external WhatsApp membership automation is not claimed.

4. Hidden Message Overview
   - Hidden messages in the existing per-user hidden markers are shown in the overview
     panel with the full message body, rather than only a shortened preview.
   - Existing message records are not deleted by this panel.

5. Teacher Last Fee Date
   - Teacher > My Students includes the latest recorded paymentDate from the existing
     monthly fee records, alongside the assigned student and active/inactive status.

6. Salary / Fee Summary UI
   - Salary Management, My Payment, Fee Summary and Monthly Payment menu entries are
     removed from the menus.
   - Direct navigation to the old Salary Management / Fee Summary views no longer
     renders their amount dashboards.
   - The existing Fee Management section remains available. Teacher payable and
     organization-balance amount displays are removed from its summary and student rows.
     Existing stored fee records are not deleted. The teacher payable field is preserved
     unchanged when editing fee dates/amounts.
   - Existing Admin-set Teacher Salary Date display and date input are retained.

7. Standalone Notes Entry
   - Standalone "Upload Your Today Notes" buttons are removed where detected.
   - Help Desk attachment sharing (PDF/photo) remains available in the existing Help Desk.

NOT FULLY IMPLEMENTED / TECHNICAL LIMITATIONS
---------------------------------------------
The request contains several requirements that cannot honestly be certified or completed
from the supplied ZIP alone:

A. Message state machine:
   The supplied application has older dashboard-hide/archive markers, but it does not have
   a complete server-enforced per-user message state machine for separate Unread, Read,
   Hidden, Teacher-Deleted and Admin-Archived states. This package improves the hidden
   overview display but does not claim the full requested unread/read/archive workflow.

B. Admin Message Archive:
   Existing message archive code moves/deletes message objects in the shared state. A
   complete per-user delete-to-Admin-archive workflow needs a backward-compatible schema
   and server-side authorization change. It is not safe to pretend the old shared delete
   action meets that requirement.

C. WhatsApp external groups:
   External WhatsApp group member removal/re-add and external group creation require an
   approved WhatsApp Business/API provider integration. None is configured in this ZIP.
   Only GWC-managed in-app group membership is automated.

D. Google Meet account chooser / Android app:
   The supplied website has Meet URL validation and browser opening. A normal website
   cannot force Google's account chooser or guarantee a particular installed-app handoff
   on every Android device. Google itself controls account selection and app/browser
   routing. Existing Join My Class links remain. A real OAuth/Android wrapper integration
   and physical Android/desktop test devices are required to certify the requested
   account-selection flow. This ZIP does not claim those device tests were performed.

E. Teacher fee-date accuracy:
   The displayed Last Fee Paid Date uses the latest non-empty paymentDate field in the
   existing monthly fee records. The supplied schema does not expose a verified payment
   transaction status for every legacy record, so historical dates should be checked
   against the Sheet/payment evidence before treating them as audited payment proof.

F. Group membership lifecycle:
   Automatic remove/re-add applies only to teacher-created GWC-managed in-app groups.
   It runs when the existing save/sync workflow executes and uses the current fee-validity
   gate. It is not an external WhatsApp action and is not a substitute for a server-side
   scheduled membership reconciliation job.

VALIDATION REPORT
-----------------
Passed:
- Uploaded ZIP could be opened and all original entries extracted.
- New V34 inline script passed Node.js syntax validation.
- Existing server.js passed Node.js syntax validation.
- Existing Code.gs passed JavaScript syntax validation.
- ZIP packaging integrity/CRC check is performed after build.

Not performed / cannot be certified offline:
- Real Admin, Teacher, Subadmin and Student credential login against the live Sheet.
- Live Google Apps Script authorization and read/write.
- Live Render deployment and environment-variable validation.
- Actual Drive upload, attachment permissions and file archival.
- Real Android phone / iOS / desktop Google Meet app handoff.
- External WhatsApp Business API group operations.
- Full regression testing of every legacy button and data record.

DEPLOYMENT
----------
1. Download and keep a backup of the current production ZIP/repository and Google Sheet.
2. Deploy this ZIP's website files to a staging Render service first.
3. Keep the existing Render environment variables and Apps Script deployment properties
   unchanged. No new external API secret is introduced by this package.
4. Test with staging copies of Admin, Teacher, Subadmin and Student accounts.
5. Verify Parents Feedback submissions, the 15-day pending alert, Admin feedback view,
   Teacher-created group member restrictions, fee-validity membership transitions, Fee
   Management, salary-date display, Help Desk attachments and Meet URL opening.
6. Do not replace the live deployment until staging and live-backend checks pass.

IMPORTANT
---------
This is a controlled source update with the limitations above. It is NOT represented as
"error-free", production verified, or as satisfying all eleven instructions completely.
The full unread/read message state machine, archive semantics, verified WhatsApp API
integration and physical Google Meet device testing require additional backend/provider/
device work.
