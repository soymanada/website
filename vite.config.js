import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Al usar soymanada.com, la base debe ser la raíz '/'
  base: '/',
})