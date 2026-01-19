import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
    'process.env': {} // Provee un objeto vacío para evitar errores de referencia
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desactivado para acelerar el build en Vercel
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Mantener logs para diagnóstico
      }
    }
  }
});