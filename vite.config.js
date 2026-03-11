import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://tramcuuho.onrender.com',
        // target: 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
        timeout: 60000,
        proxyTimeout: 60000,
      }
    }
  }
})
