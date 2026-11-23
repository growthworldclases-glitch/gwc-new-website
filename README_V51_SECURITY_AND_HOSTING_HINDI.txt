GWC V51 — SECURITY + HOSTING CONTROLLED UPDATE
Base: GWC_V50_LIMITED_UPDATE.zip (original V23/V49.2 merged application retained)

1) ADMIN WEBSITE ACCESS BLOCKLIST
- Admin menu mein naya option: Website Access Blocklist.
- Admin domain add/remove kar sakta hai; example: growthworldclasses.com.
- Sirf explicitly listed domain block hota hai. Empty list ka matlab koi website block nahi.
- www.growthworldclasses.com ko bhi growthworldclasses.com entry block karegi.
- growthworldclasses.com ko default se block nahi kiya gaya, taaki current live website achanak lock na ho.
- Blocklist badalne ke liye backend current Admin ID/password verify karta hai.

2) GOOGLE APPS SCRIPT DIRECT ACCESS SECURITY
- Code.gs ke GET aur POST dono par server-side GWC_PROXY_SECRET required hai.
- Browser JavaScript mein secret nahi hai.
- Render server.js aur Cloudflare worker.js secret ko server-side inject karte hain.
- Caller domain Origin/Referer se identify hota hai aur Apps Script usse Admin blocklist ke against check karta hai.
- Blocked domain se aane wali API read/write request reject hoti hai.
- Public Apps Script /exec URL par bina secret ke direct request reject hogi.

3) RENDER / CLOUDFLARE HOSTING
- Render par static caching retained hai.
- Cloudflare Worker + Static Assets deploy configuration included hai; Worker API routes and static site dono serve kar sakta hai.
- Cloudflare deploy + custom domain DNS cutover ke baad website static traffic Render se serve nahi hoga, jisse Render bandwidth use bahut kam ho sakta hai.
- Is ZIP se live DNS ya hosting automatically change nahi hoti. Jab tak Cloudflare deploy aur DNS cutover na ho, Render dependency bani rahegi.

4) OLD FEATURES / DATA
- V50 ke Student Class Time aur Admin Course Class Time changes retained.
- Existing IDs, passwords, accounts, courses, students, teachers, fee records, batch assignments, Drive storage, and existing settings are retained in source files.
- Existing Google Sheet data is not modified by creating this ZIP.
- No data reset/migration performed.

MANDATORY SETUP — MUST BE DONE BEFORE DEPLOYMENT
A. Create a private random secret of at least 32 characters. Example command on a secure computer: `openssl rand -hex 32`. Do not send this secret in chat or put it in the ZIP.
B. In the existing Google Apps Script project: Project Settings > Script Properties > Add Script Property. Name: `GWC_PROXY_SECRET`; value: your private random secret.
C. Deploy a NEW version of the existing Apps Script Web App. Keep the same project and spreadsheet. The current `/exec` URL in wrangler.toml is retained; verify it matches your active deployment.
D. If continuing Render now: Render Dashboard > your service > Environment. Add `GWC_PROXY_SECRET` with exactly the same value. Keep `GWC_API_URL` pointed at the existing Apps Script `/exec` URL. Save and redeploy.
E. Test the current website: Admin login, Google Sync, student login, teacher login, course, fees, Drive uploads, doubts, homework, and class join.
F. From an allowed website, Admin can add `growthworldclasses.com` to Website Access Blocklist. Once blocked, use another allowed host (for example the existing Render host, if it is not blocked) to manage/unblock it.
G. For Render bandwidth reduction: deploy the included Worker using Wrangler. First set the Worker secret with `npx wrangler secret put GWC_PROXY_SECRET`; ensure `GWC_API_URL` in wrangler.toml is correct; deploy with `npx wrangler deploy`. Attach the custom domain and verify website + API + all workflows before changing DNS.
H. Only after Cloudflare is confirmed working should DNS be pointed to Cloudflare Worker and Render be considered for shutdown. Do not stop Render before cutover verification.

IMPORTANT LIMITATIONS
- ChatGPT cannot configure your Apps Script, Render, Cloudflare account, DNS or secrets without connected account access. This is a deploy-ready source ZIP, not a live deployment.
- Security requires the same private secret in Apps Script and the active proxy. Rotate it if the old ZIP or hosting environment is suspected compromised.
- Domain identification is browser Origin/Referer based. It helps stop copied website code running from domains Admin has blocked; it is not a replacement for user-level authorization or a full security audit.
- If the current site is itself blocked, manage the blocklist from another allowed domain.
