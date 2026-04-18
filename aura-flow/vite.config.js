import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: hosted at joeygibson.github.io/ai-games/aura-flow/
  // If using a custom domain, change back to '/'
  base: '/ai-games/aura-flow/',
})