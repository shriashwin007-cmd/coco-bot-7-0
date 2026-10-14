import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Local dev: forward same-origin /api calls to the FastAPI backend so the
    // frontend works with getAiApiUrl() === '/api' even without .env.
    // On Vercel this role is played by the vercel.json rewrite instead.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
