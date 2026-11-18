import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Local development uses the root URL; production builds target GitHub Pages.
  base: command === 'serve' ? '/' : '/vk-audience-hunter/',
  plugins: [react()],
}))
