GWC V24 SECURITY DESIGN
=======================

- Version lock: Apps Script accepts only GWC_ALLOWED_VERSION=24.0-secure.
- Request authentication: Render signs GET and POST requests with HMAC-SHA256. The browser never receives the secret.
- Body integrity: POST signature includes SHA-256 of the canonical JSON body.
- Replay protection: Apps Script stores each nonce in Script Cache for 10 minutes and rejects reuse.
- Timestamp window: requests older/newer than five minutes are rejected.
- Secret rotation: current GWC_PROXY_SECRET is accepted; optional GWC_PROXY_SECRET_PREVIOUS supports a short migration window. Remove previous secret after all Render instances are updated.
- Backup protection: existing writeState_ validation, staging verification, hourly snapshots and rollback remain in Code.gs.

This secures the Render-to-Apps-Script trust boundary. It does not replace application-level role authorization inside the website. Anyone who can access an independently deployed legacy Apps Script/Render pair may still use that old pair until it is retired. Do not publish secrets.
