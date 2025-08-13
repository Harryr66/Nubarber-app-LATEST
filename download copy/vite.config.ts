import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';  // Add this

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    sourcemap: false  // Disable source maps to fix 500
  },
  server: {
    sourcemapIgnoreInvalidMapping: true
  }
});