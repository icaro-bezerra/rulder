import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TAURI_DEV_HOST is set by `tauri dev` when running on a remote host/VM.
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  // Prevents Vite from obscuring Rust compilation errors in the Tauri terminal.
  clearScreen: false,
  server: {
    // Tauri expects a fixed port; fail if it's not available.
    strictPort: true,
    host: host || false,
    port: 5173,
    hmr: host ? { protocol: 'ws', host, port: 5183 } : undefined,
    watch: {
      // Tell Vite to ignore the Rust source tree so it doesn't restart on every compile.
      ignored: ['**/src-tauri/**'],
    },
  },
  // Env variables starting with TAURI_ are available in the frontend.
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-worker': ['pdfjs-dist'],
          'epub': ['epubjs'],
        },
      },
    },
  },
});
