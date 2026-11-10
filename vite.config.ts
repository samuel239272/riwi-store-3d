import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : 'riwi-store-3d';
const isGitHubPages =
  process.env.GITHUB_PAGES === 'true' ||
  Boolean(process.env.GITHUB_REPOSITORY?.toLowerCase().endsWith(repoName.toLowerCase()));

export default defineConfig({
  base: process.env.BASE_URL || (isGitHubPages ? `/${repoName}/` : '/'),
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/imported_assets/**', '**/artifacts/**', '**/test-results/**', '**/.git/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          if (
            /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id) ||
            id.includes('commonjsHelpers')
          )
            return 'react-core';
          if (id.includes('/node_modules/three/')) return 'three';
          if (
            id.includes('/node_modules/@react-three/') ||
            id.includes('/node_modules/three-stdlib/')
          )
            return 'three-react';
        },
      },
    },
  },
});
