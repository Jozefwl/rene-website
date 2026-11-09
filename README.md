# R&R Autodoprava – website

[![Astro](https://img.shields.io/badge/astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

Website for **René Rilák – R&R Autodoprava**: goods delivery, moving and transport with a van up to 3.5 t,
based in Humenné. Slovak by default (`/`), English at `/en/`.

- **Astro** static site: plain HTML/CSS, almost no JavaScript (menu, quote form, scroll fade-in).
- **Intro animation**: red speed stripes + René's van (own SVG drawing of a Peugeot Boxer L4H2) driving in.
  Plays once per session, skipped on tap/click, disabled with `prefers-reduced-motion`.
- **Icons**: Material Design Icons (`mdi`) via `astro-icon`, inlined as SVG at build time.
- **Font**: Poppins, self-hosted via `@fontsource` (no Google requests).
- **Contact without a backend**: the quote form builds a WhatsApp / email message, nothing is stored.
- **Production image**: `cgr.dev/chainguard/node` running `serve.mjs` (Node built-ins only) over `dist/`.

## Project layout
```
src/
  data/business.ts        ONE place for name, IČO, DIČ, phone, email, hours, towns, van, social links
  i18n/sk.ts, en.ts       all texts (same keys; a test checks it)
  components/             Header, Hero, Van (SVG), Services, Why, Steps, Vehicle, Price, Area(Map),
                          Contact, Footer, StickyBar, HomePage, PrivacyPage
  pages/                  index (sk), en/index, ochrana-osobnych-udajov, en/privacy, 404, sitemap.xml
  lib/                    contact.ts (WhatsApp/mailto message builder), schema.ts (schema.org)
  styles/                 tokens.css (colours from the business card), global.css
serve.mjs                 static server + security headers
k8s/                      deployment, service, ingress (traefik + letsencrypt-prod), ArgoCD application
```

## Develop
Node >= 22.23 (`.nvmrc` = 24.15.0, same as website-blog).
```bash
npm install
npm run dev                # http://localhost:4321
npm run build && npm test  # serve.mjs tests read dist/
npm run preview            # production-like: build + node serve.mjs on http://localhost:3000
```

Change business details in `src/data/business.ts`, texts in `src/i18n/`.
Facebook / Instagram: fill `social` in `business.ts` and the icons appear in the footer.
docker buildx build --platform linux/amd64 -t harbor.waldoserver.top/cloud/rene-website:latest --push .
```
