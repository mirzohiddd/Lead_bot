import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    // Dev rejimda /api → backend (CORS sozlamasiz ishlaydi)
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false }
    }
  },
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 4096
  }
})
