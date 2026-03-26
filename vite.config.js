import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n':    ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-icons':   ['lucide-react'],
        },
      },
    },
  },
})