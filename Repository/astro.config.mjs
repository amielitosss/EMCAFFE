import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://amielitosss.github.io/EMCAFFE', 
  base: '/EMCAFFE/',                                 
  integrations: [tailwind()],
  redirects: {
    '/': '/fr',
  },
});
