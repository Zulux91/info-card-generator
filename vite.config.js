import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/info-card-generator/',
  plugins: [react()],
})
