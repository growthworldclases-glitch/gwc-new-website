GWC V32.2 — FEE RECORD CLEANUP & ACCESS DATE REPAIR
===================================================

Base: GWC_V32_MONTHLY_SALARY_FEE_HELPDESK_FINAL(1).zip

Scope
-----
This is a focused update to the V32 index.html only. Existing Code.gs, server.js,
package.json, appsscript.json, login/authentication data, course/batch setup,
salary logic, and all other original files are retained unchanged.

Changes in V32.2
----------------
1. Rejected fee submissions
- Rejected fee requests are migrated to a separate Admin Rejected Fee Slip Archive
  when Admin opens Fee Management.
- Archive records can be restored or permanently deleted.
- Admin can archive remaining rejected records in bulk.
- Where a Drive file ID is available, the permanent-delete action calls the existing
  Apps Script permanentdeletefile action. A rejected slip URL without a Drive file ID
  remains as an archived record and cannot be deleted from Drive by this UI.

2. Prevent duplicate parent uploads
- A parent/student cannot upload another JPEG slip for the same current month after
  one successful upload.
- The portal shows an "already uploaded" message and removes the duplicate upload
  control.
- Admin can explicitly request a fresh slip for that student/month. Only after that
  request can the parent upload a replacement.
- Replaced slips are retained in the upload archive metadata and the previous Drive
  file is sent to the existing archivefile action where a Drive ID is available.

3. Duplicate month records
- Duplicate gwcMonthlyFees rows for the same student and month are consolidated.
- The newest row is kept; older duplicate row data is retained in the internal
  gwcFeeUploadArchive array before being removed from the active monthly register.
- This cleanup runs when Admin opens Fee Management.

4. Admin fee controls
- Admin can upload/replace a student's month slip and enter the Next Payment Date.
- Admin can edit Fee Valid From, Fee Valid To, monthly fee and Next Payment Date.
- Next Payment Date is saved to the monthly fee record and student record, and shown
  in the Student My Course portal.
- Admin can request a new parent slip for the selected month.

5. Course access
- Join My Class access is controlled by the selected current-month Fee Valid From
  and Fee Valid To dates.
- Force to Start Batch remains an override only for its configured active date range,
  unless Admin Pause is enabled.
- Force to Start Batch button text explicitly shows ON (blue) or OFF (red).

Preserved
---------
- Original V32 Code.gs and Google Apps Script actions.
- Existing authentication, IDs/passwords, role portals, course/batch records,
  salary management, Help Desk, dashboard, styling and other original files.
- Existing three-month fee-slip archive check and its V32 timing behavior.

Validation performed
--------------------
- Original ZIP integrity checked before extraction.
- Updated index.html inline JavaScript: all 17 script blocks passed Node.js syntax check.
- Original Code.gs contains the existing archivefile and permanentdeletefile actions.
- Final ZIP was re-opened and integrity-tested after packaging.

Important deployment / live-test limitation
--------------------------------------------
This environment does not have access to the live Render service, Google Sheets,
Google Drive, Apps Script deployment, or real account credentials. Therefore this
ZIP is syntax-checked and package-checked, but it is NOT claimed to be production
end-to-end tested. Deploy first to a staging copy and test:
- Admin archive/restore/permanent-delete with a rejected slip that has a Drive ID.
- Parent duplicate-upload block and Admin-requested replacement.
- Month-wise dates and Next Payment Date sync across a second device.
- Force to Start Batch ON/OFF and Admin Pause.
- Existing Admin/Teacher/Student/Parent logins and unrelated V32 features.

No changes were made to Code.gs or backend configuration in this patch because the
existing V32 Apps Script already exposes the required archive/delete actions. If the
live deployment has a different Code.gs version, those actions must be verified
before using Drive archive/permanent-delete controls.
