import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import vtoHandler from './api/vto';
// @ts-ignore
import editHandler from './api/edit';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const bodyContent = Buffer.concat(buffers).toString();

              try {
                (req as any).body = bodyContent ? JSON.parse(bodyContent) : {};
              } catch (e) {
                (req as any).body = {};
              }

              (res as any).status = (code: number) => {
                res.statusCode = code;
                return res;
              };
              (res as any).json = (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };

              try {
                if (req.url === '/api/vto') {
                  await vtoHandler(req, res);
                } else if (req.url === '/api/edit') {
                  await editHandler(req, res);
                } else {
                  next();
                }
              } catch (err) {
                console.error('API Middleware Error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
