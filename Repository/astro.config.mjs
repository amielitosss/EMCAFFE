import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://<your-username>.github.io/EMCAFFE', 
  base: '/EMCAFFE/',                                 
  integrations: [tailwind()],
  redirects: {
    '/': '/fr',
  },
});
