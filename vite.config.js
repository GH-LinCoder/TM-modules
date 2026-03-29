// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        app: 'organise.html'
      }
    }
  },
  
  // ✅ ADD THIS SECTION:
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      // Allow auth cookies and CORS in preview
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': 'http://localhost:4173',
      'Permissions-Policy': 'storage-access=(self)'
    }
  }
});