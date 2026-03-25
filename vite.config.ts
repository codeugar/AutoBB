import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Use relative paths for Chrome extension compatibility
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        // Additional HTML pages for SERP analysis (opened via chrome.runtime.getURL)
        'serp-results': resolve(__dirname, 'src/serp/results/index.html'),
        'serp-domain': resolve(__dirname, 'src/serp/domain/index.html'),
      },
      output: {
        // Ensure paths work in extension context
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Critical: Use relative base path for Chrome extensions
  base: './',
})
