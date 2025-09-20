import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['avukat-bilgi-sistemi.hidlightmedya.tr', '.hidlightmedya.tr'],
  },
  server: {
    host: '0.0.0.0',
    port: 7000,
    strictPort: true,
    proxy: {
      // Proxy Yargı backend during development
      '/rest': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Proxy endpoints to UDF API on 8010 (independent from Yargı)
      '/health': {
        target: 'http://127.0.0.1:8011',
        changeOrigin: true,
      },
      '/api/convert-udf': {
        target: 'http://127.0.0.1:8011',
        changeOrigin: true,
      },
    },
  },
});
