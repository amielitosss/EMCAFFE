import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddlewares: false,  // Désactive les edge functions si non utilisées
  }),
  integrations: [tailwind()],
  redirects: {
    '/': '/fr',
  },
});
