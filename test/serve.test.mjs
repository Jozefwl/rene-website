// Tests for serve.mjs against the real build in dist/ (run `npm run build` first).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from '../serve.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let server;
let base;

before(async () => {
  server = createServer({ root });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('serves the Slovak home page with security headers', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  const html = await res.text();
  assert.match(html, /<html lang="sk"/);
  assert.match(html, /hreflang="en"/);
});

test('serves the English home page', async () => {
  const res = await fetch(`${base}/en/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<html lang="en"/);
});

test('redirects a page path without trailing slash', async () => {
  const res = await fetch(`${base}/en`, { redirect: 'manual' });
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('location'), '/en/');
});

test('serves the privacy pages', async () => {
  for (const p of ['/ochrana-osobnych-udajov/', '/en/privacy/']) {
    const res = await fetch(`${base}${p}`);
    assert.equal(res.status, 200, p);
  }
});

test('unknown page returns the 404 page', async () => {
  const res = await fetch(`${base}/neexistuje/`);
  assert.equal(res.status, 404);
  assert.match(await res.text(), /404/);
});

test('blocks path traversal', async () => {
  const res = await fetch(`${base}/%2e%2e/package.json`);
  assert.equal(res.status, 404);
});

test('rejects non-GET methods', async () => {
  const res = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(res.status, 405);
});

test('serves sitemap.xml and robots.txt', async () => {
  const sm = await fetch(`${base}/sitemap.xml`);
  assert.equal(sm.status, 200);
  assert.match(sm.headers.get('content-type'), /xml/);
  assert.match(await sm.text(), /https:\/\/rrautodoprava\.sk\/en\//);
  const rb = await fetch(`${base}/robots.txt`);
  assert.equal(rb.status, 200);
});

test('compresses HTML when the client accepts gzip', async () => {
  const res = await fetch(`${base}/`, { headers: { 'accept-encoding': 'gzip' } });
  assert.equal(res.headers.get('content-encoding'), 'gzip');
  assert.match(await res.text(), /<html lang="sk"/);
});
