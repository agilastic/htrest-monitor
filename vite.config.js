import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools' // If you have this

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueDevTools(), // If you have this
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Hinzufügen der Proxy-Konfiguration hier:
  server: {
    proxy: {
      // Wenn eine Anfrage mit '/api' beginnt, leite sie an Ihre HtREST-API weiter
      '/api': {
        target: 'http://192.168.0.71:8777', // Dies ist die URL Ihrer HtREST API
        changeOrigin: true, // Wichtig: Ändert den Host-Header der Ursprungsanfrage auf den Zielhost
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Behält den /api-Pfad bei, da Ihre API ihn erwartet
        // Sicherstellen, dass SSL-Zertifikatsfehler ignoriert werden (falls Ihre API HTTPS verwendet, aber ein selbstsigniertes Zertifikat hat)
        // secure: false,
        // Optional: für bessere Fehlerbehandlung in der Konsole
        // configure: (proxy, options) => {
        //   proxy.on('error', (err, req, res) => {
        //     console.error('Proxy error:', err);
        //   });
        //   proxy.on('proxyReq', (proxyReq, req, res) => {
        //     console.log('Proxying Request to:', proxyReq.path);
        //   });
        //   proxy.on('proxyRes', (proxyRes, req, res) => {
        //     console.log('Received Proxy Response from:', req.url, proxyRes.statusCode);
        //   });
        // },
      },
    }
  }
})