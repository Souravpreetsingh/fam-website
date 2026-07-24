import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react(), {
    name: 'block-phantom-pwa',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sw.js' || req.url === '/manifest.json') {
          res.statusCode = 204
          res.end()
          return
        }
        next()
      })
    },
  }],
  build: {
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'index.html',
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'vendor'
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'motion'
            }
            if (id.includes('node_modules/gsap')) {
              return 'gsap'
            }
          },
        },
    },
    assetInlineLimit: 4096,
  },
})
