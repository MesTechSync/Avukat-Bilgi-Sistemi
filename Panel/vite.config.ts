import { defineConfig, loadEnv, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_BACKEND_URL || 'http://localhost:9000'; // Default to Panel Backend
  const devHealthPlugin: PluginOption = {
    name: 'dev-health-endpoint',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use('/health', (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('ok');
      });
    },
    apply: 'serve',
  };

  return {
  plugins: [react(), devHealthPlugin],
  envPrefix: 'VITE_',
    define: {
      global: 'globalThis',
    },
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
        external: [],
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: ['localhost', '127.0.0.1', 'avukat-bilgi-sistemi.hidlightmedya.tr', '.hidlightmedya.tr'],
    },
    server: {
      host: '0.0.0.0',
      port: 5175,
      strictPort: true,
      // Enterprise Backend Proxy Configuration
      proxy: {
        '/api': { target, changeOrigin: true },
        '/wa': { target, changeOrigin: true },
        '/legal': { target, changeOrigin: true },
        '/ai': { target, changeOrigin: true },
      },
    },
  };
});
