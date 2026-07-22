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
    rollupOptions: {
      input: 'index.html',
    },
  },
})
