import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 🔥 TAMBAH INI UNTUK FIX ISU DATEPICKER 🔥
optimizeDeps: {
    exclude: ['@vuepic/vue-datepicker']  }
})