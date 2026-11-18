import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/vk-audience-hunter/',
  plugins: [react()],
})
