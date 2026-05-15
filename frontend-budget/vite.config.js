import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // 👈 1. ON IMPORTE LE PLUGIN PWA

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 👈 2. ON CONFIGURE LA PWA ICI
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mon Budget',
        short_name: 'Budget',
        description: 'Gérez vos finances personnelles facilement',
        theme_color: '#2563eb',
        background_color: '#f4f7fb',
        display: 'standalone', // Pour ressembler à une vraie application
        icons: [
          {
            src: '/petit-logo.png', // Assure-toi que cette image existe dans ton dossier "public"
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/petit-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})