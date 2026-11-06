import type { APIRoute } from 'astro';
import { routes } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://rrautodoprava.sk');
  const urls = Object.values(routes)
    .map((r) => {
      const sk = new URL(r.sk, base).href;
      const en = new URL(r.en, base).href;
      const alt = `<xhtml:link rel="alternate" hreflang="sk" href="${sk}"/><xhtml:link rel="alternate" hreflang="en" href="${en}"/>`;
      return [sk, en].map((loc) => `<url><loc>${loc}</loc>${alt}</url>`).join('');
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
