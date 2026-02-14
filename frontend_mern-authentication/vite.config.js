import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // listen on all interfaces
    watch: {
      usePolling: true // ensures hot reload works inside Docker volumes on Windows
    },
    port: 5173
  }
});
