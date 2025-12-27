<template>
  <div id="app-layout" class="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
    <Navbar />
    
    <main class="flex-1 flex flex-col w-full relative z-0">
      <router-view v-slot="{ Component }">
         <div class="flex-grow flex flex-col w-full">
            <component :is="Component" />
         </div>
      </router-view>
    </main>
    
    <Footer />
    <SupportBot />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import Navbar from './components/common/Navbar.vue';
import Footer from './components/common/Footer.vue';
const SupportBot = defineAsyncComponent(() => import('./components/common/SupportBot.vue'));
</script>