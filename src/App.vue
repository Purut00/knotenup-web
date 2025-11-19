<template>
  <div id="app-layout">
    <Navbar />
    <main class="page-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
// Kita akan import Navbar dan Footer di sini
// (Kita belum cipta failnya, jadi jangan risau jika ada error)
import Navbar from './components/common/Navbar.vue';
import Footer from './components/common/Footer.vue';
</script>

<style>
/* Styling global (akan diguna di semua halaman).
  Kita letak di sini buat masa ini.
*/
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Pastikan app mengambil ketinggian penuh */
}

.page-content {
  flex: 1; /* Biarkan kandungan utama mengambil ruang yang ada */
}
</style>