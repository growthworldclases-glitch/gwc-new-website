GWC V54 – RENDER BUILD CACHE CONTROLLED UPDATE
Base: User-uploaded GWC_V53_CLEANUP_FIXED_UPDATE.zip.

WHAT IS ACTUALLY IMPLEMENTED
1. Admin-only endpoint /api/gwc/render-build-cache-clear.
2. It verifies the current Admin username/password against the existing Apps Script state.
3. It calls Render's official Trigger Deploy API with { clearCache: "clear" }.
4. It starts a new deployment after clearing Render's build cache. This is not a deletion of monthly bandwidth usage.
5. The same operation is available when the site is served through the included Cloudflare Worker, provided the Render API credentials are configured as Worker secrets/variables.
6. Existing Render managed temporary directory cleanup and V53 Google Drive scan/quarantine/restore/trash features are retained.

REQUIRED SERVER CONFIGURATION
For Render-hosted website, add these environment variables in Render:
- RENDER_API_KEY = Render API key with permission to trigger deploys for the intended service.
- RENDER_SERVICE_ID = exact service ID, usually beginning srv-.
Do not place the API key in index.html, Code.gs, GitHub, or any client-visible file.

For Cloudflare Worker hosting, set RENDER_API_KEY as a Worker secret and RENDER_SERVICE_ID as a Worker variable/secret. Never expose the API key in the public [vars] section of wrangler.toml.

IMPORTANT LIMITS
- Render's already-consumed outbound bandwidth is historical traffic accounting. It cannot be deleted, reset, or recovered by deleting files, clearing build cache, or redeploying. Unused bandwidth does not roll over.
- Clear Build Cache & Deploy removes Render build artifacts before a new deployment. It may consume build/pipeline minutes and temporarily trigger deployment activity.
- Render edge cache is distinct from build cache. Render documents manual edge-cache purge in the service Settings page; this ZIP does not claim to purge it through the API.
- The managed runtime temp cleanup only deletes files created under /tmp/gwc-managed-cache. The current application does not populate that folder, so zero files may be a truthful result.
- Drive cleanup is separate from Render bandwidth. It scans only the existing GWC_Uploads tree; candidates require review. Drive Trash is reversible and is not irreversible permanent deletion.

PRESERVATION
- V53 is used as the base. No intentional changes to existing account records, passwords, fee records, student/teacher data, batch settings, course settings, or Apps Script state schema.
- Root index.html and public/index.html are kept identical.
- Existing environment variables and Script Properties must be preserved. Add the new Render variables; do not replace old ones.

DEPLOYMENT / TEST
1. Back up the current deployment and existing Apps Script project before deploying.
2. Deploy Code.gs only if it differs from the current deployed V53 Apps Script source; V54's Render cache endpoint is hosted in server.js / worker.js and does not require a new Apps Script action.
3. Render hosting: deploy server.js and index.html; set RENDER_API_KEY and RENDER_SERVICE_ID in Render Environment.
4. Cloudflare hosting: deploy worker.js and public/index.html; set RENDER_API_KEY as a Worker secret and RENDER_SERVICE_ID as a Worker variable/secret.
5. Admin login -> Storage & Bandwidth Cleanup -> confirm Clear Render Build Cache & Deploy. Check Render Deploys to confirm actual deployment status.
6. Test login, student/teacher dashboards, fee records, courses, Drive upload/download and cleanup on a backup/staging deployment first.

VALIDATION
Local ZIP integrity and server/worker syntax can be checked offline. Live Render API execution cannot be verified without the user's Render API key and service ID. Do not describe it as live-tested until Render returns a successful deployment response.
