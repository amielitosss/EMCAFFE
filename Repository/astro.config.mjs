import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // ← Changez l'adapter
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone' // ← Important pour Render
  }),
  integrations: [tailwind()],
});
