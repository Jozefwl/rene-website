import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://rrautodoprava.sk',
  trailingSlash: 'ignore',
  // Inline the (small) CSS into each page: no render-blocking stylesheet request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Material Design Icons (mdi) are inlined as SVG at build time – no icon font, no extra requests.
  integrations: [icon()],
  i18n: {
    defaultLocale: 'sk',
    locales: ['sk', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  server: { port: 4321 },
});
