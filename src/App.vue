<template>
  <div id="app-layout">
    <Navbar />
    
    <main class="page-content">
      <router-view />
    </main>
    
    <Footer />

    <SupportBot />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import Navbar from './components/common/Navbar.vue';
import Footer from './components/common/Footer.vue';
const SupportBot = defineAsyncComponent(() => 
  import('./components/common/SupportBot.vue')
);
</script>


<style>
/* Styling global */

/* PENTING: Tambah height: 100% pada html dan body 
   supaya browser mobile faham ketinggian sebenar */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Pastikan app wrapper ambil 100% tinggi skrin */
}

.page-content {
  flex: 1; /* Tolak footer ke bawah */
  display: flex; /* TAMBAHAN: Jadikan ini flex container juga */
  flex-direction: column; /* Susun ke bawah */
  width: 100%; /* Pastikan lebar penuh */
}

/* Ini akan memaksa div root dalam setiap page (Home.vue, dll)
   untuk kembang (grow) memenuhi ruang .page-content.
   Ini kunci untuk hilangkan gap warna ungu tu.
*/
.page-content > div {
  flex-grow: 1;
}
</style>