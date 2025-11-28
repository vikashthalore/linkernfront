import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/",  // IMPORTANT for Vercel SPA refresh
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://linkern-kappa.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
})



// 'https://linkern.onrender.com',
// target: 'http://localhost:5000',