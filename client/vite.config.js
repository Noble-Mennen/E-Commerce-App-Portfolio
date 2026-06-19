import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api requests to the Express backend.
      // The browser only ever sees localhost:5173, so the session cookie's
      // sameSite: 'strict' setting is satisfied — everything looks same-origin.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});