GWC V24 CHANGELOG
=================

Preserved:
- Original V23 index.html, package.json and existing README/assets.
- Existing Code.gs data storage, chunk format, fee expiry logic, Drive upload/archive helpers, backup and staged write validation.
- Existing /api/gwc browser route and action allowlist.

Changed:
- server.js now requires Render environment configuration, signs GET/POST requests, validates the service version and sends signed requests to Apps Script.
- Code.gs verifies HMAC signatures, timestamp, version, POST body hash and one-time nonce before processing data actions.
- Supports a temporary previous secret for controlled rotation.

No Google Sheet ID, Drive folder ID, login ID or password values are rewritten by this update.
