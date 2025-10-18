import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.csv'],
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@babel/standalone"]

  },
})
