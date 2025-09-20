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
    port: 5175,
    strictPort: true,
    // API proxy disabled for demo mode
    // proxy: {
    //   '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    //   '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    //   '/wa': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    //   '/legal': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    // },
  },
});
