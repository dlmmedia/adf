import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tsconfigPaths({
        projects: ['./tsconfig.core.vite.json'],
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/@embedpdf/pdfium/dist/pdfium.wasm',
            dest: 'pdfium'
          },
        ]
      })
    ],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          xfwd: true,
        },
      },
    },
    base: env.RUN_SUBPATH ? `/${env.RUN_SUBPATH}` : './',
  };
});
