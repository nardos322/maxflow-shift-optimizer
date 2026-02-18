/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force CJS for tests to avoid ESM/CJS interop issues
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom/dist/index.js'),
      'react-router/dom': path.resolve(__dirname, 'node_modules/react-router/dist/development/dom-export.js'),
      'react-router': path.resolve(__dirname, 'node_modules/react-router/dist/development/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    server: {
      deps: {
        inline: ['react-router-dom', 'react-router'],
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
