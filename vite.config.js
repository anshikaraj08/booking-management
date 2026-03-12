import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      },
      plugins: [react({
        include: /\.(jsx|js)$/,
      })],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001')
      },
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

