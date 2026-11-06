GWC V23 – DOMAIN LOCK + GOOGLE PROXY AUTH (SAFE ADDITIVE PATCH)

IMPORTANT
- Existing index.html, IDs/passwords, course/fee data model, dashboard UI/icons, Help Desk UI and all other original files are preserved byte-for-byte.
- Only server.js and Code.gs are changed. This patch blocks Google sync unless requests pass through the approved Render host and the shared server-side secret.
- The secret is deliberately NOT hard-coded into this ZIP or browser HTML. Putting it in a ZIP/source file would expose it and defeat the protection.

REQUIRED ONE-TIME SETUP (before redeploy)
1) Generate a random secret of at least 32 characters (prefer 48+). Example on Windows PowerShell:
   [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
   Copy the generated value somewhere private. Do not send it to students or put it in index.html.
2) Google Apps Script:
   - Open the existing Apps Script project connected to the existing GWC spreadsheet/Drive.
   - Project Settings > Script Properties > Add script property:
       Name: GWC_PROXY_SECRET
       Value: paste the generated secret
   - Keep the existing GWC_SPREADSHEET_ID and all other Script Properties unchanged.
3) Render:
   - Open the existing Render Web Service > Environment.
   - Add:
       Key: GWC_PROXY_SECRET
       Value: the exact same generated secret
   - Keep GWC_API_URL and all existing environment variables unchanged.
4) Deploy the updated Code.gs as a new version of the SAME Apps Script Web App:
   - Execute as: Me
   - Who has access: Anyone (the secret now gates requests)
   - Update the existing deployment; retain the same Web App URL.
5) Upload this ZIP to the existing GitHub repository/Render service and deploy. Do not create a new Render service or new Google Sheet.

EXPECTED BEHAVIOUR
- The only accepted website host is:
  https://growth-world-classes-2-0.onrender.com
- Requests from https://growthworldclasses.com and other hosts/origins are rejected by this Render proxy.
- The Apps Script rejects calls that do not contain the matching GWC_PROXY_SECRET. After the new Code.gs deployment and Script Property are active, old copied website versions that call Apps Script directly will no longer sync.
- Normal visitors using the approved Render website are not blocked; they use the same website URL as before.
- If the secret is missing/mismatched, sync will show an error until both sides contain the exact same value.

IMPORTANT LIMITATION
This patch enforces a fixed approved domain. It does NOT yet add an Admin dashboard screen for adding/removing extra approved domains. Do not manually add growthworldclasses.com. Dynamic admin-managed domain changes need a separate authenticated dashboard/API change and must be tested against the existing admin login/session implementation before deployment.

ROLLBACK
- Keep the previous ZIP and current Apps Script deployment version. If anything unexpected occurs, restore the previous server.js/Code.gs and redeploy the previous version.
- Do not clear or replace GWC_Storage, GWC_Storage_Backup_* or Drive folders.
