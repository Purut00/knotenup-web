import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    // 1. Naikkan limit amaran supaya tak bising sangat
    chunkSizeWarningLimit: 1500, 
    
    rollupOptions: {
      output: {
        // 2. Teknik Manual Chunks (Paling Berkesan)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Asingkan Library Berat
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('@google/generative-ai')) return 'gen-ai';
            if (id.includes('leaflet')) return 'leaflet';
            if (id.includes('swiper')) return 'swiper';
            
            // Bakinya masuk ke vendor
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@vuepic/vue-datepicker']
  }
});