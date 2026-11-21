import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // in dev, forward /ws to the relay server (npm run server)
  server: { proxy: { '/ws': { target: 'ws://localhost:3001', ws: true } } },
})
