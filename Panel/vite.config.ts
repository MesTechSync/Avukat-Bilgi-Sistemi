import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true,
    proxy: {
      // Proxy backend endpoints to FastAPI on 8000, enabling single-port dev
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/mcp-server': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
