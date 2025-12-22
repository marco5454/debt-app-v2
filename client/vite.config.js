import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the backend server during development
      '/api': {
        target: 'http://localhost:5000', // Updated to match actual server port
        changeOrigin: true
      }
    }
  }
})

