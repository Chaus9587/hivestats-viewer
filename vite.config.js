import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'copy-index-to-404',
      closeBundle() {
        const distPath = path.resolve(import.meta.dirname, 'dist')
        const indexFile = path.join(distPath, 'index.html')
        const notFoundFile = path.join(distPath, '404.html')
        if (fs.existsSync(indexFile)) {
          fs.copyFileSync(indexFile, notFoundFile)
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/hivestats-viewer/',
  // server: {
  //   port: 5173,
  //   strictPort: true,
  // }
})
