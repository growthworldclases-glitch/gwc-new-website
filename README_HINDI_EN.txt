GWC — Cloudflare KV + GitHub Pages package

FILES
- index.html: existing GWC single-page website updated to stop writing the full database/images to browser localStorage.
- worker.js: Cloudflare Worker API that reads/writes the state in a Cloudflare KV namespace.

IMPORTANT SECURITY NOTE
This is a simple prototype migration, not a production-secure student database. The current HTML has client-side role/password checks, and this basic Worker endpoint exposes the shared state to anyone who knows the Worker URL. Do NOT store real student personal data or payment slips until proper server-side authentication/authorization is added. Cloudflare KV is not a file-storage product; this package stores the 1MB slip/poster data inside the KV state document. It has payload limits and KV propagation is not instantaneous. A single shared state document can also lose simultaneous concurrent updates. The Worker currently permits cross-origin requests for easy first deployment; restrict ALLOWED_ORIGIN before public production use.

DEPLOYMENT (PC, simplest path)
1. Unzip this package.
2. GitHub Pages:
   - Upload index.html to the root of your existing website repository (rename/replace the current index.html only after you decide to publish this version).
   - Commit and push. In GitHub repository Settings > Pages, choose the correct branch and root folder.
3. Cloudflare:
   - Create/login to Cloudflare.
   - Workers & Pages > Create > Worker. Paste worker.js into the Worker editor and Deploy.
   - Worker Settings > Bindings > Add binding > KV namespace. Variable name must be GWC_DATA. Create a KV namespace and bind it.
   - Open the deployed Worker URL plus /health; it should show {"ok":true,...}.
4. Connect HTML to Worker:
   - Open index.html in a text editor.
   - Find: const GWC_API_URL='https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev';
   - Replace it with your real Worker URL (without /state), e.g. https://gwc-api.example.workers.dev
   - Save and upload/commit index.html to GitHub.
5. Reload the GitHub Pages website. The bottom-right indicator should show Cloudflare KV connected.
6. Test first with dummy course data and two browsers/devices before real use.

WHY THIS FIXES THE SCREENSHOT
- Removes the Supabase SDK/config from the HTML.
- Removes Firebase client initialization from this version.
- Stops saving large base64 images and records into localStorage, which caused “Browser storage is full” and quota errors.
- Moves the state document to the Cloudflare Worker/KV API.
- Existing UI and form workflows are kept in the HTML; this does not guarantee every existing feature is production-ready.

LIMITATIONS
- Cloudflare KV has eventual consistency, not true instant real-time sync. This simple package loads state on opening and saves changes to the Worker; automatic live refresh is not enabled in this starter.
- Current app state is one shared JSON document. Concurrent edits may overwrite each other, and the current client-side login is not secure authentication.
- To securely store student names, addresses, phone numbers, and payment slips for real use, add server-side role authentication and per-record authorization before launch.
