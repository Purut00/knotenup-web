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
            
            // 1. Library Paling Berat (Wajib Asingkan)
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-lib';
            if (id.includes('fontawesome') || id.includes('@fortawesome')) return 'icons';
            
            // 2. Library Sederhana Berat
            if (id.includes('leaflet')) return 'leaflet';
            if (id.includes('swiper')) return 'swiper';
            if (id.includes('@google/generative-ai') || id.includes('@google/genai')) return 'gen-ai';
            if (id.includes('lucide')) return 'lucide';
            if (id.includes('vue-datepicker') || id.includes('vue-easy-lightbox')) return 'ui-libs';

            // 3. Bakinya barulah masuk vendor (sepatutnya dah ringan)
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