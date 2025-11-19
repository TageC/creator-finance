import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // The 'base: "./"' line is the critical fix. 
  // It tells Vite to use relative paths for assets, resolving the MIME type issue on Vercel.
  base: './', 
  plugins: [react()],
  server: {
    port: 5173,
  },
})