import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import seoPrerender from './seo/prerender.js'

export default defineConfig({
  plugins: [react(), seoPrerender()],
})
