// Tiny static file server for the built site (dist/).
// Node.js built-ins only, so the production image needs no node_modules.
// Based on website-blog/serve.mjs, adapted for Astro's multi-page output.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const isProd = process.env.NODE_ENV === 'production';

export const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    // Inline: the tiny intro/session script in <head> and Astro's hoisted scripts.
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    // Only behind HTTPS (in the cluster); would break plain-http local preview.
    ...(isProd ? ['upgrade-insecure-requests'] : []),
  ].join('; '),
  ...(isProd ? { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' } : {}),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function send(res, status, headers, body = '') {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

function sendFile(req, res, filePath, cacheControl, status = 200) {
  const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const accept = String(req.headers['accept-encoding'] || '');
  const encoding = COMPRESSIBLE.test(type) ? (/\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null) : null;
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Type': type,
    'Cache-Control': cacheControl,
    Vary: 'Accept-Encoding',
  };
  if (encoding) headers['Content-Encoding'] = encoding;
  else headers['Content-Length'] = fs.statSync(filePath).size;
  res.writeHead(status, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = fs.createReadStream(filePath);
  if (encoding === 'br') stream.pipe(zlib.createBrotliCompress()).pipe(res);
  else if (encoding === 'gzip') stream.pipe(zlib.createGzip()).pipe(res);
  else stream.pipe(res);
}

export function createServer({ root }) {
  const rootDir = path.resolve(root);
  const notFoundFile = path.join(rootDir, '404.html');

  return http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, 'Method Not Allowed');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request');
      return;
    }

    // Block path traversal: the resolved file must stay inside dist/.
    // (Check the raw URL too, because new URL() already collapses "/../".)
    const filePath = path.resolve(rootDir, '.' + pathname);
    const rawPath = req.url.split('?')[0];
    if (
      (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) ||
      /(^|\/)\.\.(\/|$)/.test(rawPath) ||
      /%2e%2e/i.test(rawPath)
    ) {
      send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
      return;
    }

    // Static asset (hashed files in /_astro/ never change).
    if (path.extname(pathname) !== '' && isFile(filePath)) {
      const immutable = pathname.startsWith('/_astro/');
      sendFile(req, res, filePath, immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=86400');
      return;
    }

    // Page: /en -> /en/ (redirect), /en/ -> /en/index.html
    if (path.extname(pathname) === '') {
      const indexFile = path.join(filePath, 'index.html');
      if (isFile(indexFile)) {
        if (!pathname.endsWith('/')) {
          const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
          send(res, 301, { Location: pathname + '/' + query });
          return;
        }
        sendFile(req, res, indexFile, 'no-cache');
        return;
      }
    }

    if (isFile(notFoundFile)) {
      sendFile(req, res, notFoundFile, 'no-cache', 404);
      return;
    }
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
  });
}

// Run directly: node serve.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
  createServer({ root }).listen(port, '0.0.0.0', () => {
    console.log(`Serving ${root} on http://0.0.0.0:${port}`);
  });
}
