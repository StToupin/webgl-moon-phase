import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webgl-moon-phase/', // GitHub Pages repository name
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps for production
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['three'],
          astronomy: ['astronomy-engine']
        }
      }
    }
  }
}); 