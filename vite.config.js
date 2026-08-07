import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    sourcemap: true,
    target: 'es2023',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query', 'react-hook-form', 'zod'],
          'vendor-ui': ['lucide-react', 'framer-motion', 'date-fns'],
        },
      },
    },
  },
  server: { port: 5173, strictPort: true },
});
