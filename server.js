'use strict';

// GWC Website + Google Apps Script Proxy
// Existing Apps Script URL and GET/POST behavior preserved.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);

const GAS_URL =
  process.env.GWC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwwaPB77rTfnAp8R_oVWVx1jmMGfK-V4LCHmtBlvTQVe8EctydRiE3Ii5q0axzhf-xf/exec';

const ROOT = __dirname;
const MAX_BODY = 6 * 1024 * 1024;

// Find the existing website without moving or deleting files.
const SITE_CANDIDATES = [
  ROOT,
  path.join(ROOT, 'public'),
  path.join(ROOT, 'dist'),
  path.join(ROOT, 'build')
];

const SITE_DIR =
  SITE_CANDIDATES.find(dir =>
    fs.existsSync(path.join(dir, 'index.html')) &&
    fs.statSync(path.join(dir, 'index.html')).isFile()
  ) || ROOT;

function send(res, status, body, type = 'application/json; charset=utf-8') {
  if (res.headersSent) return;

  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });

  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data));
}

async function readBody(req) {
  const parts = [];
  let size = 0;

  for await (const part of req) {
    size += part.length;

    if (size > MAX_BODY) {
      const err = new Error('Request too large (6 MB limit).');
      err.statusCode = 413;
      throw err;
    }

    parts.push(part);
  }

  return Buffer.concat(parts).toString('utf8');
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4'
  };

  return types[ext] || 'application/octet-stream';
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);

  return relative === '' ||
    (!relative.startsWith('..' + path.sep) &&
     relative !== '..' &&
     !path.isAbsolute(relative));
}

async function handleGoogleProxy(req, res, url) {
  try {
    let upstream;

    if (req.method === 'GET' || req.method === 'HEAD') {
      const action = url.searchParams.get('action') || 'load';
      const upstreamUrl = new URL(GAS_URL);

      upstreamUrl.searchParams.set('action', action);
      upstreamUrl.searchParams.set('t', String(Date.now()));

      upstream = await fetch(upstreamUrl, {
        method: req.method,
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(45000)
      });
    } else if (req.method === 'POST') {
      const body = await readBody(req);

      let payload;

      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: 'Request body is not valid JSON.'
        });
      }

      upstream = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: AbortSignal.timeout(45000)
      });
    } else {
      res.setHeader('Allow', 'GET, HEAD, POST');

      return sendJson(res, 405, {
        ok: false,
        error: 'Method not allowed.'
      });
    }

    const raw = await upstream.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      const contentType =
        upstream.headers.get('content-type') || 'unknown';

      return sendJson(res, 502, {
        ok: false,
        error: 'Apps Script returned non-JSON content.',
        upstreamStatus: upstream.status,
        contentType,
        responsePreview: raw.replace(/\s+/g, ' ').slice(0, 180)
      });
    }

    return sendJson(
      res,
      upstream.ok ? 200 : 502,
      data
    );
  } catch (err) {
    console.error('Google Apps Script proxy error:', err);

    return sendJson(res, err.statusCode || 502, {
      ok: false,
      error: err.message || 'Upstream request failed.'
    });
  }
}

function serveWebsite(req, res, url) {
  let pathname;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, 'Invalid URL path.', 'text/plain; charset=utf-8');
  }

  if (pathname.includes('\0')) {
    return send(res, 400, 'Invalid URL path.', 'text/plain; charset=utf-8');
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const requestedPath = path.resolve(SITE_DIR, '.' + pathname);

  if (!isInside(SITE_DIR, requestedPath)) {
    return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
  }

  fs.stat(requestedPath, (statErr, stats) => {
    if (!statErr && stats.isDirectory()) {
      const indexPath = path.join(requestedPath, 'index.html');

      return fs.readFile(indexPath, (err, data) => {
        if (err) {
          return send(
            res, 404, 'Not found: directory has no index.html',
            'text/plain; charset=utf-8'
          );
        }

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff'
        });

        res.end(req.method === 'HEAD' ? undefined : data);
      });
    }

    fs.readFile(requestedPath, (err, data) => {
      if (err) {
        if (pathname === '/index.html') {
          console.error('Website index.html not found in:', SITE_DIR);

          return send(
            res,
            404,
            'Website file index.html was not found. Check the GitHub repository and deployment root directory.',
            'text/plain; charset=utf-8'
          );
        }

        return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
      }

      res.writeHead(200, {
        'Content-Type': getContentType(requestedPath),
        'Cache-Control':
          path.extname(requestedPath).toLowerCase() === '.html'
            ? 'no-cache'
            : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      });

      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
}

const server = http.createServer(async (req, res) => {
  let url;

  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    return send(res, 400, 'Invalid request URL.', 'text/plain; charset=utf-8');
  }

  if (url.pathname === '/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'GWC proxy'
    });
  }

  if (url.pathname === '/api/gwc') {
    return handleGoogleProxy(req, res, url);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');

    return send(
      res, 405, 'Method not allowed',
      'text/plain; charset=utf-8'
    );
  }

  return serveWebsite(req, res, url);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GWC web + Apps Script proxy listening on port ${PORT}`);
  console.log(`Website directory: ${SITE_DIR}`);
  console.log(`index.html exists: ${fs.existsSync(path.join(SITE_DIR, 'index.html'))}`);
});
