import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            const { viteNodeApp } = await server.ssrLoadModule('./src/api/server.ts');
            viteNodeApp(req, res, next);
          } else {
            next();
          }
        });
      },
    },
  ],
});
