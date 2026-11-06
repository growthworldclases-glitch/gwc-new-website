GWC V17 DATA RESET LOCK — REVIEWED PATCH

What this version changes compared with V16:
- If the existing GWC_Storage primary is empty, all writes are rejected. The app cannot initialize the primary from a browser/default payload. Restore a verified backup manually first.
- Incoming states with zero total students + users + courses are rejected.
- V16's populated-state record-drop guard, hourly snapshot, staging verification, and post-write verification remain.
- This is a safety lock, not automatic recovery. If the primary is empty, cloud saves intentionally fail until an administrator restores verified data.

DEPLOY SAFELY
1. Back up the current spreadsheet and current website deployment.
2. Restore the verified 04:32 data into the EXISTING spreadsheet's GWC_Storage. Verify all chunk rows/text and confirm expected students, users, and courses before proceeding. Restore GWC_Storage_Stage from the same verified state only if your deployment's workflow requires it.
3. Replace Code.gs in Apps Script with this ZIP's Code.gs and deploy a NEW version of the existing Web App. Preserve Script Properties, Spreadsheet ID, and deployment URL.
4. Deploy index.html/server.js/package.json to the existing host, preserving environment variables and API URL.
5. Test admin login, one student login, one admin edit, Force to Start Batch, Join My Class, and cloud sync. Confirm data remains populated after a refresh and a save.

IMPORTANT LIMITATIONS
- This reduces accidental full resets but cannot guarantee zero data loss from every cause. Concurrent stale clients can still overwrite partial changes above the configured record-drop threshold.
- The live Google Apps Script, spreadsheet permissions, deployment, and host have not been accessed or tested from this environment.
- Do not deploy against an empty primary expecting the app to self-recover; it is intentionally locked until manual restore.
