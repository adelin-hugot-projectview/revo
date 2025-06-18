import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // important pour accepter les connexions extérieures
    allowedHosts: [
      'faa2-109-190-130-172.ngrok-free.app' // ← autorisation de ton URL ngrok
    ]
  }
})